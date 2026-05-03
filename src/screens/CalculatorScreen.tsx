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
          keyboardDismissMode="on-drag"
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

                  {/* Charts toggle */}
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

          {Platform.OS === 'web' && (
            <>
              <HowToGuide c={c} />
              <MortgageInfoSection c={c} />
              <ApplicantGuideSection c={c} />
              <FAQSection c={c} />
            </>
          )}
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

// ── Mortgage info section (web only) ─────────────────────────────────────────
function MortgageInfoSection({ c }: { c: ThemeColors }) {
  const gs = StyleSheet.create({
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
    h2: { fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 16, letterSpacing: -0.3 },
    h3: { fontSize: 15, fontWeight: '700', color: c.primary, marginBottom: 6 },
    p: { fontSize: 14, lineHeight: 22, color: c.textSecondary, marginBottom: 14 },
  });

  return (
    <View style={gs.card}>
      <Text style={gs.h2}>Jak funguje hypotéka</Text>

      <Text style={gs.p}>
        Hypotéka je dlouhodobý bankovní úvěr, který slouží k financování koupě, výstavby nebo rekonstrukce nemovitosti.
        Na rozdíl od jiných úvěrů je hypotéka zajištěna zástavním právem k nemovitosti — banka se tak chrání pro případ,
        že dlužník přestane splácet. Hypotéka patří mezi nejdůležitější finanční rozhodnutí v životě, proto je klíčové
        dobře porozumět všem jejím parametrům dříve, než smlouvu podepíšete.
      </Text>

      <Text style={gs.h3}>Jistina a úrok</Text>
      <Text style={gs.p}>
        Jistina (principal) je samotná vypůjčená částka — tedy rozdíl mezi cenou nemovitosti a vaším vlastním vkladem.
        Úrok je cena za zapůjčení peněz, vyjádřená jako procento z nesplacené jistiny ročně. V každé splátce platíte
        zároveň část jistiny i část úroku. Na začátku splácení tvoří úroky větší podíl splátky, postupně s ubývající
        jistinou klesá i absolutní výše úroku. Na konci doby splácení jde skoro celá splátka na splacení jistiny —
        to je podstata anuitního splácení.
      </Text>

      <Text style={gs.h3}>LTV — poměr úvěru k hodnotě nemovitosti</Text>
      <Text style={gs.p}>
        LTV (Loan to Value) vyjadřuje, jak velký podíl z hodnoty nemovitosti financujete úvěrem. Při ceně nemovitosti
        4 000 000 Kč a úvěru 3 200 000 Kč je LTV 80 %. Česká národní banka (ČNB) reguluje maximální LTV: banky nesmí
        poskytovat hypotéky s LTV nad 90 %, přičemž hypotéky s LTV nad 80 % jsou omezeny na určitý podíl nové produkce.
        Nižší LTV zpravidla znamená nižší úrokovou sazbu, protože banka podstupuje nižší riziko. Snížením LTV pod 80 %
        nebo pod 70 % můžete získat výrazně výhodnější nabídku.
      </Text>

      <Text style={gs.h3}>Fixace úrokové sazby</Text>
      <Text style={gs.p}>
        Fixace je smluvně garantované období, po které se nemění vaše úroková sazba — bez ohledu na vývoj trhu.
        Typicky si volíte mezi 1, 3, 5 nebo 7 lety. Delší fixace přináší jistotu stejné splátky na delší dobu, ale
        obvykle za cenu o něco vyšší sazby. Kratší fixace může být výhodná v prostředí klesajících sazeb, protože po
        skončení fixace máte možnost refinancovat za lepších podmínek. Po skončení fixace banka nabídne novou sazbu
        odpovídající aktuálním tržním podmínkám.
      </Text>

      <Text style={gs.h3}>Anuitní vs. progresivní splácení</Text>
      <Text style={gs.p}>
        Anuitní splácení je nejrozšířenější forma: výše splátky se po celou dobu fixace nemění, mění se pouze poměr
        jistiny a úroku v každé splátce. Progresivní splácení začíná na nižší měsíční splátce, která se každý rok
        zvyšuje. Je vhodné pro žadatele, kteří teprve budují kariéru a očekávají růst příjmů. Celková zaplacená částka
        bývá u progresivního splácení o něco vyšší, protože jistina se na začátku splácí pomaleji.
      </Text>

      <Text style={gs.h3}>Co ovlivňuje výši měsíční splátky</Text>
      <Text style={gs.p}>
        Na výši měsíční splátky působí čtyři klíčové faktory: výše úvěru (čím vyšší jistina, tím vyšší splátka),
        úroková sazba (každé půlprocento tvoří u průměrné hypotéky stovky korun měsíčně), doba splácení (delší období
        znamená nižší splátku, ale celkově zaplatíte více na úrocích — optimum bývá 20–25 let) a typ splácení.
        Celkové náklady hypotéky zahrnují také poplatky za sjednání úvěru, odhad nemovitosti, vedení účtu a pojištění.
        Vždy si nechte předložit RPSN (roční procentní sazbu nákladů), která zahrnuje veškeré náklady a umožňuje
        objektivní srovnání různých nabídek od různých bank.
      </Text>
    </View>
  );
}

// ── Applicant guide section (web only) ───────────────────────────────────────
function ApplicantGuideSection({ c }: { c: ThemeColors }) {
  const gs = StyleSheet.create({
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
  });

  const steps = [
    {
      title: 'Zhodnoťte svou finanční situaci',
      desc: 'Před podáním žádosti si spočítejte, kolik si můžete dovolit splácet. Obecné pravidlo říká, že splátka hypotéky by neměla přesáhnout 40–45 % čistého měsíčního příjmu (ukazatel DSTI). Zkontrolujte svou historii splácení v registrech dlužníků (SOLUS, CIBR) a eliminujte zbytečné kreditní karty a kontokorenty — i nevyužitý limit snižuje vaši bonitu v očích banky.',
    },
    {
      title: 'Připravte si doklady',
      desc: 'Banka bude požadovat: dva průkazy totožnosti, potvrzení o příjmu od zaměstnavatele (nebo daňová přiznání za poslední dva roky u OSVČ), výpisy z bankovního účtu za 3–6 měsíců a doklady k nemovitosti — výpis z katastru, kupní smlouvu nebo smlouvu o smlouvě budoucí. Při refinancování přiložte také výpis o stávajícím úvěru.',
    },
    {
      title: 'Oslovte více bank nebo hypotečního poradce',
      desc: 'Hypoteční trh je konkurenční — nabídky se liší nejen sazbou, ale i podmínkami čerpání, poplatky a flexibilitou splácení. Hypoteční poradce (zprostředkovatel) osloví banky za vás a jeho odměna jde zpravidla z provize banky, nikoliv z vaší kapsy. Srovnávejte vždy RPSN, ne jen nominální úrokovou sazbu, protože RPSN zahrnuje veškeré náklady.',
    },
    {
      title: 'Získejte předhypoteční příslib',
      desc: 'Ještě před podpisem kupní smlouvy si nechte vystavit od banky předhypoteční příslib neboli indikativní nabídku. Ta potvrdí, že banka je ochotna vám za daných podmínek úvěr poskytnout. Bez tohoto potvrzení neriskujte zálohu na nemovitost — přišli byste o peníze, pokud by vám hypotéka nebyla schválena.',
    },
    {
      title: 'Nechte ocenit nemovitost',
      desc: 'Banka si nechá nemovitost ocenit smluvním odhadcem. Zástavní hodnota z odhadu může být nižší než sjednaná kupní cena — a právě od zástavní hodnoty se odvíjí maximální výše úvěru a LTV. S odhadem počítejte zpravidla 5–10 pracovních dní a poplatek kolem 3 000–6 000 Kč v závislosti na druhu a ceně nemovitosti.',
    },
    {
      title: 'Podejte formální žádost a vyčkejte na schválení',
      desc: 'Po předložení všech dokladů banka provede úvěrovou analýzu. Ověří příjmy, závazky, registry dlužníků a hodnotu zástavy. Schválení trvá obvykle 5–15 pracovních dní. Banka vás může požádat o doplnění dalších podkladů, například potvrzení o pojištění nemovitosti nebo doplňující výpisy z účtu.',
    },
    {
      title: 'Podepište smlouvy a čerpejte hypotéku',
      desc: 'Po schválení podepíšete úvěrovou smlouvu a zástavní smlouvu. Zástavní právo se zapíše do katastru nemovitostí — banka zpravidla podmíní čerpání zápisem zástavního práva nebo alespoň podáním návrhu na vklad. Samotné čerpání probíhá převodem přímo prodávajícímu nebo do advokátní či notářské úschovy.',
    },
    {
      title: 'Sledujte konec fixace a zvažte refinancování',
      desc: 'Minimálně 6 měsíců před koncem fixace oslovte svou banku i konkurenci a porovnejte nabídky. Refinancování — přechod k jiné bance za výhodnější sazbu — je po skončení fixace bez jakýchkoli poplatků. Aktivní přístup a ochota vyjednávat nebo přejít ke konkurenci může ušetřit desítky tisíc korun na úrocích.',
    },
  ];

  return (
    <View style={gs.card}>
      <Text style={gs.h2}>Průvodce žadatele o hypotéku</Text>
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
  );
}

// ── FAQ section (web only) ────────────────────────────────────────────────────
function FAQSection({ c }: { c: ThemeColors }) {
  const gs = StyleSheet.create({
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
    h2: { fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 16, letterSpacing: -0.3 },
    faqItem: { marginBottom: 4 },
    question: { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 6 },
    answer: { fontSize: 14, lineHeight: 22, color: c.textSecondary, marginBottom: 16 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginBottom: 16 },
  });

  const faqs = [
    {
      q: 'Jaká je průměrná úroková sazba hypotéky v ČR?',
      a: 'Průměrná úroková sazba nových hypoték v České republice se v roce 2024–2025 pohybuje kolem 4,5–5,5 % ročně. Konkrétní sazba závisí na délce fixace, výši LTV, bonitě žadatele a podmínkách konkrétní banky. Sazby se pravidelně mění v závislosti na měnové politice ČNB a situaci na finančních trzích. Pro nejpřesnější nabídku vždy oslovte banku přímo nebo využijte hypotečního poradce, který srovná více bank najednou.',
    },
    {
      q: 'Co je LTV a jak ovlivňuje mou hypotéku?',
      a: 'LTV (Loan to Value) je poměr výše úvěru k tržní hodnotě nemovitosti, vyjádřený v procentech. Pokud kupujete nemovitost za 4 000 000 Kč a berete si úvěr 3 000 000 Kč, vaše LTV je 75 %. Nižší LTV znamená nižší riziko pro banku, což se zpravidla projeví nižší úrokovou sazbou. ČNB omezuje hypotéky s LTV nad 80 % a zakazuje hypotéky s LTV nad 90 %. Pro žadatele do 36 let kupující první vlastní bydlení platí mírnější pravidla.',
    },
    {
      q: 'Jak dlouho trvá vyřízení hypotéky?',
      a: 'Celý proces od podání žádosti po čerpání peněz trvá obvykle 4–8 týdnů. Samotné schválení žádosti bankou trvá 5–15 pracovních dní po předložení kompletní dokumentace. Dalším krokem je příprava smluv a zápis zástavního práva do katastru nemovitostí, který může trvat 2–4 týdny. Celková délka závisí na připravenosti žadatele, vytíženosti banky a katastrálního úřadu a na složitosti konkrétní transakce.',
    },
    {
      q: 'Jaký je minimální vlastní vklad (akontace)?',
      a: 'Dle regulace ČNB musíte mít minimálně 10 % z hodnoty nemovitosti z vlastních zdrojů, čímž dosáhnete maximálního LTV 90 %. Banky v praxi preferují vlastní vklad 20 % (LTV 80 %) a nabízejí za to výrazně lepší podmínky. Při LTV nad 80 % počítejte s vyšší sazbou a přísnějším hodnocením žádosti. Výjimku tvoří žadatelé do 36 let kupující první bydlení — ti mohou za určitých podmínek dosáhnout na hypotéku s nižší akontací díky speciálnímu limitu ČNB.',
    },
    {
      q: 'Co je fixace úrokové sazby a jak si vybrat její délku?',
      a: 'Fixace je smluvně garantovaná doba, po kterou se nemění vaše úroková sazba bez ohledu na vývoj trhu. Typicky si volíte mezi 1, 3, 5 nebo 7 lety. Kratší fixace bývá levnější, ale přináší riziko, že po jejím skončení budou sazby vyšší. Delší fixace dává jistotu stejné splátky po delší dobu. V prostředí vysokých sazeb (jako v roce 2023–2024) se vyplatí kratší fixace v naději na refinancování za lepších podmínek po poklesu sazeb.',
    },
    {
      q: 'Jak se liší anuitní a progresivní splácení?',
      a: 'U anuitního splácení platíte po celou dobu fixace stejnou měsíční splátku — mění se pouze poměr jistiny a úroku (zpočátku platíte více úroků, postupně více jistiny). Jde o nejrozšířenější formu splácení, vhodnou pro většinu žadatelů. Progresivní splácení začíná na nižší splátce, která se každý rok zvyšuje o pevně stanovené procento. Je vhodné pro žadatele, kteří teprve začínají kariéru a očekávají růst příjmů. Celková zaplacená částka bývá u progresivního splácení vyšší.',
    },
    {
      q: 'Mohu hypotéku předčasně splatit?',
      a: 'Ano, hypotéku lze splatit předčasně, ale podmínky závisí na fázi fixace. Zákon vymezuje případy, kdy lze splatit zdarma: při prodeji zastavené nemovitosti po uplynutí dvou let od uzavření smlouvy, při výročí fixace (obvykle jednou ročně do výše 25 % jistiny), nebo při úmrtí, invaliditě či rozvodu. Mimo tyto případy si banky mohou účtovat poplatek odpovídající skutečně vzniklým nákladům. Po skončení fixačního období lze hypotéku splatit nebo refinancovat zcela bez poplatků.',
    },
    {
      q: 'Co jsou ukazatele DTI a DSTI a proč jsou důležité?',
      a: 'DTI (Debt-to-Income) je poměr celkové výše všech vašich dluhů k ročnímu čistému příjmu. ČNB doporučuje, aby DTI nepřesáhlo 8,5násobek ročního čistého příjmu (pro žadatele do 36 let 9,5násobek). DSTI (Debt Service-to-Income) vyjadřuje, jaký podíl čistého měsíčního příjmu spotřebujete na splátky všech úvěrů. Doporučená hranice je 45 % (pro žadatele do 36 let 50 %). Banka tyto ukazatele hodnotí při posouzení bonity — příliš vysoké hodnoty vedou k zamítnutí žádosti.',
    },
    {
      q: 'Jaký příjem potřebuji na hypotéku?',
      a: 'Požadovaný příjem závisí na výši úvěru, délce splácení a úrokové sazbě. Orientačně: aby splátka nepřesáhla 45 % čistého příjmu (limit DSTI), potřebujete čistý měsíční příjem přibližně 2,2× vyšší než je vaše splátka. Například pro hypotéku se splátkou 20 000 Kč byste potřebovali čistý příjem kolem 44 000 Kč měsíčně. Banka hodnotí čistý příjem po daních a odvodech. U OSVČ se vychází z daňových přiznání za poslední 2 roky.',
    },
    {
      q: 'Co se stane po skončení fixace?',
      a: 'Po uplynutí fixačního období banka nabídne novou úrokovou sazbu na další fixační období. Sazba se změní podle aktuálních tržních podmínek — může být výrazně vyšší i nižší než vaše původní sazba. Banky jsou ze zákona povinny informovat vás o nové sazbě minimálně 3 měsíce před koncem fixace. V tuto chvíli máte plné právo přijmout novou nabídku, vyjednat lepší podmínky nebo refinancovat hypotéku u jiné banky zcela bez sankcí. Nenechávejte rozhodnutí na poslední chvíli.',
    },
  ];

  return (
    <View style={gs.card}>
      <Text style={gs.h2}>Časté otázky</Text>
      {faqs.map((faq, i) => (
        <View key={i} style={gs.faqItem}>
          <Text style={gs.question}>{faq.q}</Text>
          <Text style={gs.answer}>{faq.a}</Text>
          {i < faqs.length - 1 && <View style={gs.divider} />}
        </View>
      ))}
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
