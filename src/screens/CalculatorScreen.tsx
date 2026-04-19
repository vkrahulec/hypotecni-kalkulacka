import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, ThemeColors } from '../constants/colors';
import { useScheme, useThemeOverride, ThemeOverride } from '../context/ThemeContext';
import { FIXATION_OPTIONS, MIN_REPAYMENT_YEARS, MAX_REPAYMENT_YEARS } from '../constants/config';
import {
  MortgageInput,
  MortgageResult,
  PaymentType,
  calculate,
  calculateLTV,
  validateInputs,
} from '../utils/calculator';
import { parseCzechNumber, formatCZK, formatPercent } from '../utils/formatting';

import { InputField } from '../components/InputField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { AmortizationTable } from '../components/AmortizationTable';
import { Charts } from '../components/Charts';
import { SectionHeader } from '../components/SectionHeader';
import { AdBanner } from '../components/AdBanner';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

const FIXATION_OPTIONS_UI = FIXATION_OPTIONS.map((y) => ({ label: `${y} r.`, value: y }));
const PAYMENT_TYPE_OPTIONS: { label: string; value: PaymentType }[] = [
  { label: 'Anuitní', value: 'annuity' },
  { label: 'Progresivní', value: 'progressive' },
];

interface FormState {
  propertyPrice: string;
  downPayment: string;
  annualInterestRate: string;
  fixationYears: number;
  totalYears: number;
  paymentType: PaymentType;
  propertyInsuranceMonthly: string;
  lifeInsuranceMonthly: string;
  arrangementFee: string;
  valuationFee: string;
  ltvWarning: string;
  ltvMax: string;
}

const INITIAL_FORM: FormState = {
  propertyPrice: '4 000 000',
  downPayment: '800 000',
  annualInterestRate: '5,49',
  fixationYears: 5,
  totalYears: 25,
  paymentType: 'annuity',
  propertyInsuranceMonthly: '',
  lifeInsuranceMonthly: '',
  arrangementFee: '',
  valuationFee: '',
  ltvWarning: '80',
  ltvMax: '90',
};

function parseForm(form: FormState): MortgageInput {
  const propertyPrice = parseCzechNumber(form.propertyPrice);
  const downPayment = parseCzechNumber(form.downPayment);
  const loanAmount = Math.max(0, propertyPrice - downPayment);
  return {
    propertyPrice,
    downPayment,
    loanAmount,
    annualInterestRate: parseCzechNumber(form.annualInterestRate),
    fixationYears: form.fixationYears,
    totalYears: form.totalYears,
    paymentType: form.paymentType,
    propertyInsuranceMonthly: parseCzechNumber(form.propertyInsuranceMonthly) || 0,
    lifeInsuranceMonthly: parseCzechNumber(form.lifeInsuranceMonthly) || 0,
    arrangementFee: parseCzechNumber(form.arrangementFee) || 0,
    valuationFee: parseCzechNumber(form.valuationFee) || 0,
  };
}

const THEME_CYCLE: ThemeOverride[] = ['system', 'light', 'dark'];
const THEME_LABELS: Record<ThemeOverride, string> = { system: 'Auto', light: 'Světlý', dark: 'Tmavý' };

export function CalculatorScreen() {
  const scheme = useScheme();
  const c = Colors[scheme];
  const { themeOverride, setThemeOverride } = useThemeOverride();

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(themeOverride) + 1) % THEME_CYCLE.length];
    setThemeOverride(next);
  }
  const styles = makeStyles(c);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [ltvInput, setLtvInput] = useState<string>('80');
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [pullState, setPullState] = useState<'hidden' | 'pulling' | 'ready' | 'refreshing'>('hidden');
  const [directLoanMode, setDirectLoanMode] = useState(false);
  const [directLoanAmount, setDirectLoanAmount] = useState('');

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull-to-refresh on web via document touch events
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const THRESHOLD = 80;
    let startY = 0;
    let startedAtTop = false;

    const onTouchStart = (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      startY = touch.clientY;
      const el = document.getElementById('main-scroll');
      startedAtTop = !el || el.scrollTop === 0;
    };

    const onTouchMove = (e: Event) => {
      if (!startedAtTop) return;
      const delta = (e as TouchEvent).touches[0].clientY - startY;
      if (delta >= THRESHOLD) setPullState('ready');
      else if (delta > 8) setPullState('pulling');
      else setPullState('hidden');
    };

    const onTouchEnd = (e: Event) => {
      if (!startedAtTop) return;
      const delta = (e as TouchEvent).changedTouches[0].clientY - startY;
      if (delta > THRESHOLD) {
        setPullState('refreshing');
        setTimeout(() => window.location.reload(), 500);
      } else {
        setPullState('hidden');
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Derived values
  const propertyPrice = parseCzechNumber(form.propertyPrice);
  const downPayment = parseCzechNumber(form.downPayment);
  const loanAmount = Math.max(0, propertyPrice - downPayment);
  const ltv = calculateLTV(loanAmount, propertyPrice);

  // Bidirectional LTV ↔ downPayment handlers
  function handlePropertyPriceChange(v: string) {
    const pp = parseCzechNumber(v);
    const dp = parseCzechNumber(form.downPayment);
    if (pp > 0) {
      const loan = Math.max(0, pp - dp);
      setLtvInput(formatPercent(calculateLTV(loan, pp)));
    }
    setForm((prev) => ({ ...prev, propertyPrice: v }));
  }

  function handleDownPaymentChange(v: string) {
    const dp = parseCzechNumber(v);
    const pp = parseCzechNumber(form.propertyPrice);
    if (pp > 0) {
      const loan = Math.max(0, pp - dp);
      setLtvInput(formatPercent(calculateLTV(loan, pp)));
    }
    setForm((prev) => ({ ...prev, downPayment: v }));
  }

  function handleLtvChange(v: string) {
    setLtvInput(v);
    const ltvPct = parseCzechNumber(v);
    const pp = parseCzechNumber(form.propertyPrice);
    if (pp > 0 && ltvPct >= 0 && ltvPct <= 100) {
      const newDown = Math.round(pp * (1 - ltvPct / 100));
      setForm((prev) => ({ ...prev, downPayment: formatCZK(newDown) }));
    }
  }

  function handleModeToggle(enabled: boolean) {
    setDirectLoanMode(enabled);
    if (enabled) {
      // Pre-fill with currently calculated loan amount
      setDirectLoanAmount(loanAmount > 0 ? formatCZK(loanAmount) : '');
    }
  }

  // LTV warning text for the input field
  const ltvWarning = parseCzechNumber(form.ltvWarning) || 80;
  const ltvMax = parseCzechNumber(form.ltvMax) || 90;
  const ltvWarningText =
    ltv > ltvMax
      ? `⚠ Překročeno ${formatPercent(ltvMax, 0)} % — hypotéka nemusí být schválena`
      : ltv > ltvWarning
      ? `⚠ Nad ${formatPercent(ltvWarning, 0)} % — vyšší úroková sazba nebo odmítnutí`
      : undefined;

  // Debounced recalculation
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      let input: MortgageInput;
      if (directLoanMode) {
        const loan = parseCzechNumber(directLoanAmount);
        input = {
          propertyPrice: loan,
          downPayment: 0,
          loanAmount: loan,
          annualInterestRate: parseCzechNumber(form.annualInterestRate),
          fixationYears: form.fixationYears,
          totalYears: form.totalYears,
          paymentType: form.paymentType,
          propertyInsuranceMonthly: parseCzechNumber(form.propertyInsuranceMonthly) || 0,
          lifeInsuranceMonthly: parseCzechNumber(form.lifeInsuranceMonthly) || 0,
          arrangementFee: parseCzechNumber(form.arrangementFee) || 0,
          valuationFee: parseCzechNumber(form.valuationFee) || 0,
        };
      } else {
        input = parseForm(form);
      }

      const validationErrors = validateInputs(input);
      const errorMap: Record<string, string> = {};
      for (const e of validationErrors) errorMap[e.field] = e.message;
      setErrors(errorMap);

      if (validationErrors.length === 0) {
        setLoading(true);
        setTimeout(() => {
          setResult(calculate(input));
          setLoading(false);
        }, 0);
      } else {
        setResult(null);
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [form, directLoanMode, directLoanAmount]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]} edges={Platform.OS === 'web' ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}>
      {Platform.OS === 'web' && <NavBar />}

      {Platform.OS === 'web' && pullState !== 'hidden' && (
        <View style={styles.pullIndicator} pointerEvents="none">
          {pullState === 'refreshing' ? (
            <ActivityIndicator color={c.primary} size="small" />
          ) : (
            <Text style={[styles.pullArrow, { color: pullState === 'ready' ? c.primary : c.textMuted }]}>
              {pullState === 'ready' ? '↑' : '↓'}
            </Text>
          )}
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          nativeID="main-scroll"
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appTitle, { color: c.primary }]}>Hypoteční kalkulačka</Text>
                <Text style={[styles.appSubtitle, { color: c.textSecondary }]}>
                  Výpočet splátky a přehled úvěru
                </Text>
              </View>
              <Pressable
                onPress={cycleTheme}
                style={({ pressed }) => [
                  styles.themeChip,
                  { backgroundColor: pressed ? c.primaryContainer : c.surfaceContainer, borderColor: c.border },
                ]}
              >
                <Text style={[styles.themeChipText, { color: c.primary }]}>
                  {THEME_LABELS[themeOverride]}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── Input card ── */}
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <SectionHeader title="Parametry úvěru" />

            {/* Mode toggle */}
            <View style={[styles.modeToggleRow, { borderColor: c.border, backgroundColor: c.surfaceContainer }]}>
              <Text style={[styles.modeToggleLabel, { color: c.text }]}>
                {directLoanMode ? 'Zadat výši úvěru přímo' : 'Znám výši úvěru'}
              </Text>
              <Switch
                value={directLoanMode}
                onValueChange={handleModeToggle}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor="#ffffff"
              />
            </View>

            {!directLoanMode && (
              <>
                <InputField
                  label="Cena nemovitosti"
                  value={form.propertyPrice}
                  onChangeText={handlePropertyPriceChange}
                  suffix="Kč"
                  error={errors.propertyPrice}
                />

                <InputField
                  label="Vlastní zdroje"
                  value={form.downPayment}
                  onChangeText={handleDownPaymentChange}
                  suffix="Kč"
                  error={errors.downPayment}
                />

                <InputField
                  label="LTV (podíl úvěru k ceně)"
                  value={ltvInput}
                  onChangeText={handleLtvChange}
                  suffix="%"
                  keyboardType="decimal-pad"
                  warning={ltv > ltvWarning && ltv <= ltvMax ? ltvWarningText : undefined}
                  error={ltv > ltvMax ? ltvWarningText : undefined}
                />

                <InputField
                  label="Výše úvěru (automaticky)"
                  value={formatCZK(loanAmount)}
                  onChangeText={() => {}}
                  suffix="Kč"
                  autoCalculated
                />
              </>
            )}

            {directLoanMode && (
              <InputField
                label="Výše úvěru"
                value={directLoanAmount}
                onChangeText={setDirectLoanAmount}
                suffix="Kč"
                error={errors.loanAmount}
              />
            )}

            <InputField
              label="Úroková sazba (ročně)"
              value={form.annualInterestRate}
              onChangeText={(v) => setField('annualInterestRate', v)}
              suffix="%"
              keyboardType="decimal-pad"
              error={errors.annualInterestRate}
            />

            <SegmentedControl
              label="Délka fixace"
              options={FIXATION_OPTIONS_UI}
              value={form.fixationYears}
              onChange={(v) => setField('fixationYears', v)}
            />

            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: c.textSecondary }]}>Doba splácení</Text>
                <View style={[styles.sliderValueBadge, { backgroundColor: c.primaryContainer }]}>
                  <Text style={[styles.sliderValueText, { color: c.primary }]}>{form.totalYears} let</Text>
                </View>
              </View>
              <Slider
                value={form.totalYears}
                onValueChange={(v) => setField('totalYears', Math.round(v))}
                minimumValue={MIN_REPAYMENT_YEARS}
                maximumValue={MAX_REPAYMENT_YEARS}
                step={1}
                minimumTrackTintColor={c.primary}
                maximumTrackTintColor={c.border}
                thumbTintColor={c.primary}
                style={styles.slider}
              />
              <View style={styles.sliderTicks}>
                <Text style={[styles.sliderTick, { color: c.textMuted }]}>{MIN_REPAYMENT_YEARS} r.</Text>
                {[10, 15, 20, 25, 30, 35].map((y) => (
                  <Text key={y} style={[styles.sliderTick, { color: c.textMuted }]}>{y}</Text>
                ))}
                <Text style={[styles.sliderTick, { color: c.textMuted }]}>{MAX_REPAYMENT_YEARS} r.</Text>
              </View>
            </View>

            <SegmentedControl
              label="Typ splácení"
              options={PAYMENT_TYPE_OPTIONS}
              value={form.paymentType}
              onChange={(v) => setField('paymentType', v)}
            />
          </View>

          {/* ── Optional costs ── */}
          <TouchableOpacity
            onPress={() => setShowOptional((v) => !v)}
            style={[styles.optionalToggle, { backgroundColor: c.surfaceContainer, borderColor: c.border }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.optionalToggleIcon, { color: c.primary }]}>
              {showOptional ? '▲' : '▼'}
            </Text>
            <Text style={[styles.optionalToggleText, { color: c.primary }]}>
              {showOptional ? 'Skrýt pojištění a poplatky' : 'Pojištění a poplatky (volitelné)'}
            </Text>
          </TouchableOpacity>

          {showOptional && (
            <View style={[styles.card, { backgroundColor: c.surface }]}>
              <InputField
                label="Pojištění nemovitosti"
                value={form.propertyInsuranceMonthly}
                onChangeText={(v) => setField('propertyInsuranceMonthly', v)}
                suffix="Kč/měs."
                hint="Volitelné — zahrne se do celkových nákladů"
                error={errors.propertyInsuranceMonthly}
              />
              <InputField
                label="Životní pojištění"
                value={form.lifeInsuranceMonthly}
                onChangeText={(v) => setField('lifeInsuranceMonthly', v)}
                suffix="Kč/měs."
                hint="Volitelné"
                error={errors.lifeInsuranceMonthly}
              />
              <InputField
                label="Poplatek za zpracování"
                value={form.arrangementFee}
                onChangeText={(v) => setField('arrangementFee', v)}
                suffix="Kč"
                hint="Jednorázový poplatek bance"
                error={errors.arrangementFee}
              />
              <InputField
                label="Poplatek za odhad nemovitosti"
                value={form.valuationFee}
                onChangeText={(v) => setField('valuationFee', v)}
                suffix="Kč"
                hint="Jednorázový"
                error={errors.valuationFee}
              />
              <InputField
                label="LTV — hranice upozornění"
                value={form.ltvWarning}
                onChangeText={(v) => setField('ltvWarning', v)}
                suffix="%"
                keyboardType="decimal-pad"
                hint="Výchozí: 80 %"
              />
              <InputField
                label="LTV — hranice zamítnutí"
                value={form.ltvMax}
                onChangeText={(v) => setField('ltvMax', v)}
                suffix="%"
                keyboardType="decimal-pad"
                hint="Výchozí: 90 %"
              />
            </View>
          )}

          {/* ── Loading ── */}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={c.primary} />
            </View>
          )}

          {/* ── Results ── */}
          {result && !loading && (
            <>
              {/* Summary cards */}
              <View style={[styles.card, { backgroundColor: c.surface }]}>
                <SectionHeader title="Výsledky výpočtu" />
                <View style={styles.cardsRow}>
                  <ResultCard
                    title="Měsíční splátka"
                    value={result.monthlyPayment}
                    accent
                    subtitle={
                      form.paymentType === 'progressive'
                        ? 'první splátka (progresivní)'
                        : 'anuitní splátka'
                    }
                  />
                  <ResultCard title="Celkem zaplaceno" value={result.totalPaid} />
                </View>
                <View style={styles.cardsRow}>
                  <ResultCard title="Celkem úroky" value={result.totalInterest} warning />
                  <ResultCard
                    title="Celkové náklady"
                    value={result.totalCostWithExtras}
                    subtitle="vč. pojištění a poplatků"
                  />
                </View>
              </View>

              {/* Charts */}
              <TouchableOpacity
                onPress={() => setShowCharts((v) => !v)}
                style={[styles.optionalToggle, { backgroundColor: c.surfaceContainer, borderColor: c.border }]}
                activeOpacity={0.75}
              >
                <Text style={[styles.optionalToggleIcon, { color: c.primary }]}>
                  {showCharts ? '▲' : '▼'}
                </Text>
                <Text style={[styles.optionalToggleText, { color: c.primary }]}>
                  {showCharts ? 'Skrýt grafy' : 'Zobrazit grafy'}
                </Text>
              </TouchableOpacity>

              {showCharts && (
                <View style={[styles.card, { backgroundColor: c.surface }]}>
                  <Charts yearly={result.yearlyAmortizationTable} />
                </View>
              )}

              {/* Amortization table */}
              <View style={[styles.card, { backgroundColor: c.surface }]}>
                <SectionHeader title="Splátkový kalendář" />
                <AmortizationTable
                  monthly={result.amortizationTable}
                  yearly={result.yearlyAmortizationTable}
                />
              </View>
            </>
          )}

          {Platform.OS === 'web' && <HowToGuide c={c} />}
          {Platform.OS === 'web' && <Footer />}
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Ad banner fixed at bottom */}
      <AdBanner />
    </SafeAreaView>
  );
}

// ── How-to guide (web only, below the calculator) ────────────────────────────
function HowToGuide({ c }: { c: ThemeColors }) {
  const gs = StyleSheet.create({
    wrap: { marginTop: 8 },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
    h2: { fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 16, letterSpacing: -0.3 },
    stepRow: { flexDirection: 'row', marginBottom: 16, gap: 14 },
    badge: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
      marginTop: 1, flexShrink: 0,
    },
    badgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    stepBody: { flex: 1 },
    stepTitle: { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 3 },
    stepDesc: { fontSize: 14, lineHeight: 21, color: c.textSecondary },
    resultRow: { marginBottom: 12 },
    resultLabel: { fontSize: 14, fontWeight: '700', color: c.primary, marginBottom: 2 },
    resultDesc: { fontSize: 14, lineHeight: 21, color: c.textSecondary },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: 12 },
  });

  const steps = [
    {
      title: 'Vyberte režim zadávání',
      desc: 'V horní části formuláře najdete přepínač „Znám výši úvěru". Ve výchozím stavu (vypnuto) zadáváte cenu nemovitosti a vlastní zdroje — kalkulačka výši úvěru a LTV spočítá sama. Pokud znáte přesnou výši úvěru, přepínač zapněte a zadejte ji přímo — pole pro cenu nemovitosti a vlastní zdroje se skryjí.',
    },
    {
      title: 'Zadejte cenu nemovitosti',
      desc: 'Do prvního pole vyplňte celkovou kupní cenu nemovitosti, kterou chcete koupit nebo postavit. Zadávejte cenu v korunách — oddělení tisíců mezerami je podporováno. (Pole se zobrazí pouze ve výchozím režimu.)',
    },
    {
      title: 'Nastavte výši vlastních zdrojů (akontace)',
      desc: 'Zadejte, kolik peněz vkládáte z vlastních úspor. Kalkulačka automaticky vypočítá výši úvěru a ukazatel LTV. Čím vyšší akontace, tím nižší LTV a obvykle i lepší úroková sazba od banky. (Pole se zobrazí pouze ve výchozím režimu.)',
    },
    {
      title: 'Zadejte úrokovou sazbu a dobu fixace',
      desc: 'Vyplňte roční úrokovou sazbu, kterou vám nabídla banka (nebo použijte orientační hodnotu). Zvolte dobu fixace — tedy na jak dlouho bude sazba garantována. Typicky 3, 5 nebo 7 let.',
    },
    {
      title: 'Zvolte dobu splácení',
      desc: 'Pomocí posuvníku nastavte celkovou dobu splácení hypotéky. Čím delší doba, tím nižší měsíční splátka — ale celkově zaplatíte více na úrocích. Optimum bývá 20–25 let.',
    },
    {
      title: 'Prozkoumejte výsledky a amortizační plán',
      desc: 'Kalkulačka okamžitě zobrazí měsíční splátku, celkové zaplacené úroky a přehledné grafy. V sekci „Splátkový kalendář" najdete detailní přehled každé splátky včetně poměru jistiny a úroku.',
    },
  ];

  const results = [
    {
      label: 'Měsíční splátka',
      desc: 'Výše pravidelné měsíční splátky, kterou budete platit po celou dobu fixace. U anuitního splácení zůstává konstantní, u progresivního splácení se v čase mění.',
    },
    {
      label: 'Celková zaplacená částka',
      desc: 'Součet všech splátek za celou dobu splácení — tedy jistina plus veškeré úroky. Tento údaj ukazuje skutečné celkové náklady hypotéky.',
    },
    {
      label: 'Celkové úroky',
      desc: 'Kolik celkem zaplatíte bance za zapůjčení peněz. Rozdíl mezi celkovou zaplacenou částkou a výší úvěru. U dlouhých hypoték s vysokou sazbou může přesáhnout i samotnou výši jistiny.',
    },
    {
      label: 'LTV (Loan to Value)',
      desc: 'Poměr výše úvěru k hodnotě nemovitosti v procentech. Hodnota pod 80 % obvykle znamená výhodnější sazbu. ČNB reguluje maximální LTV — zpravidla do 90 %.',
    },
    {
      label: 'Splátkový kalendář',
      desc: 'Detailní přehled každé splátky — kolik z ní jde na splacení jistiny, kolik na úroky a jaký je zbývající dluh. Přepínejte mezi měsíčním a ročním přehledem.',
    },
  ];

  return (
    <View style={gs.wrap}>
      <View style={gs.card}>
        <Text style={gs.h2}>Jak používat kalkulačku</Text>
        {steps.map((step, i) => (
          <View key={i} style={gs.stepRow}>
            <View style={gs.badge}>
              <Text style={gs.badgeText}>{i + 1}</Text>
            </View>
            <View style={gs.stepBody}>
              <Text style={gs.stepTitle}>{step.title}</Text>
              <Text style={gs.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={gs.card}>
        <Text style={gs.h2}>Co znamenají výsledky</Text>
        {results.map((r, i) => (
          <View key={i} style={gs.resultRow}>
            <Text style={gs.resultLabel}>{r.label}</Text>
            <Text style={gs.resultDesc}>{r.desc}</Text>
            {i < results.length - 1 && <View style={gs.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  const cardElevation = Platform.select({
    ios: {
      shadowColor: '#1B1B1F',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    web: { boxShadow: '0 1px 4px rgba(27,27,31,0.09)' } as object,
  });

  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    pullIndicator: {
      position: 'absolute',
      top: 56,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    pullArrow: {
      fontSize: 22,
      fontWeight: '600',
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 16,
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
    },
    header: {
      paddingVertical: 20,
      paddingHorizontal: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    themeChip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    themeChipText: {
      fontSize: 13,
      fontWeight: '600',
    },
    appTitle: {
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    appSubtitle: {
      fontSize: 13,
      marginTop: 2,
    },
    card: {
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      ...cardElevation,
    },
    cardsRow: {
      flexDirection: 'row',
      marginHorizontal: -4,
      marginBottom: 4,
    },
    modeToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 16,
    },
    modeToggleLabel: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
      marginRight: 12,
    },
    optionalToggle: {
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 13,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    optionalToggleIcon: {
      fontSize: 12,
      fontWeight: '700',
    },
    optionalToggleText: {
      fontWeight: '600',
      fontSize: 14,
    },
    loadingRow: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    sliderContainer: {
      marginBottom: 16,
    },
    sliderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    sliderLabel: {
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    sliderValueBadge: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    sliderValueText: {
      fontSize: 13,
      fontWeight: '700',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderTicks: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -4,
      paddingHorizontal: 2,
    },
    sliderTick: {
      fontSize: 10,
      fontWeight: '500',
    },
  });
}
