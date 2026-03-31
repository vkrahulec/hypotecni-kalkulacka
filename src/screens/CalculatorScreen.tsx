import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, ThemeColors } from '../constants/colors';
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

const FIXATION_OPTIONS_UI = FIXATION_OPTIONS.map((y) => ({ label: `${y} r.`, value: y }));
const YEAR_OPTIONS = Array.from(
  { length: MAX_REPAYMENT_YEARS - MIN_REPAYMENT_YEARS + 1 },
  (_, i) => ({ label: `${MIN_REPAYMENT_YEARS + i}`, value: MIN_REPAYMENT_YEARS + i })
);
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

export function CalculatorScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [ltvInput, setLtvInput] = useState<string>('80');
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const input = parseForm(form);
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
  }, [form]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={[styles.appTitle, { color: c.text }]}>Hypoteční kalkulačka</Text>
            <Text style={[styles.appSubtitle, { color: c.textSecondary }]}>
              Výpočet splátky a přehled úvěru
            </Text>
          </View>

          {/* ── Input card ── */}
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <SectionHeader title="Parametry úvěru" />

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

            <SegmentedControl
              label="Doba splácení (roky)"
              options={YEAR_OPTIONS}
              value={form.totalYears}
              onChange={(v) => setField('totalYears', v)}
            />

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
            style={[styles.optionalToggle, { borderColor: c.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionalToggleText, { color: c.primary }]}>
              {showOptional ? '▲ Skrýt pojištění a poplatky' : '▼ Pojištění a poplatky (volitelné)'}
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
              <View style={[styles.card, { backgroundColor: c.background }]}>
                <SectionHeader title="Grafy" />
                <Charts yearly={result.yearlyAmortizationTable} />
              </View>

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

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Ad banner fixed at bottom */}
      <AdBanner />
    </SafeAreaView>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
    },
    header: {
      paddingVertical: 16,
    },
    appTitle: {
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    appSubtitle: {
      fontSize: 14,
      marginTop: 2,
    },
    card: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    cardsRow: {
      flexDirection: 'row',
      marginHorizontal: -4,
      marginBottom: 4,
    },
    optionalToggle: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    optionalToggleText: {
      fontWeight: '600',
      fontSize: 14,
    },
    loadingRow: {
      paddingVertical: 32,
      alignItems: 'center',
    },
  });
}
