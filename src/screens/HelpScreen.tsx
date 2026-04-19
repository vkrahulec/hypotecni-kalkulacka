import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';

const STEPS = [
  'Zadejte cenu nemovitosti nebo přepněte na přímé zadání výše úvěru',
  'Vyplňte vlastní zdroje (záloha)',
  'Nastavte úrokovou sazbu a dobu splatnosti',
  'Zvolte délku fixace',
  'Přidejte volitelné položky (pojištění, poplatky)',
  'Výsledky se aktualizují automaticky',
];

const TERMS: [string, string][] = [
  ['LTV', 'Poměr výše úvěru k hodnotě nemovitosti'],
  ['Anuitní splátka', 'Stejná splátka po celou dobu splácení'],
  ['Fixace', 'Období kdy se nemění úroková sazba'],
  ['Amortizace', 'Postupné splácení jistiny'],
  ['RPSN', 'Roční procentní sazba nákladů'],
];

export function HelpScreen() {
  const c = Colors[useScheme()];
  const s = makeStyles(c);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.h1}>Nápověda</Text>

        <View style={s.card}>
          <Text style={s.h2}>Jak používat kalkulačku</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={[s.step, i === STEPS.length - 1 && s.stepLast]}>
              <Text style={s.stepNumber}>{i + 1}</Text>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.h2}>Vysvětlení pojmů</Text>
          {TERMS.map(([term, def], i) => (
            <View key={term} style={[s.term, i === TERMS.length - 1 && s.termLast]}>
              <Text style={s.termTitle}>{term}</Text>
              <Text style={s.termDef}>{def}</Text>
            </View>
          ))}
        </View>

        <View style={[s.card, { backgroundColor: c.warningLight }]}>
          <Text style={[s.h2, { color: c.warning }]}>Upozornění</Text>
          <Text style={[s.body, { color: c.textSecondary }]}>
            Výsledky kalkulačky jsou orientační a nepředstavují finanční poradenství.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: any) {
  return StyleSheet.create({
    content: { padding: 20, paddingBottom: 24 },
    h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20, color: c.text },
    h2: { fontSize: 15, fontWeight: '700', marginBottom: 14, color: c.text },
    body: { fontSize: 14, lineHeight: 22, color: c.textSecondary },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingBottom: 12,
      marginBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    stepLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.primaryContainer,
      color: c.primary,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 24,
      flexShrink: 0,
    },
    stepText: { flex: 1, fontSize: 14, lineHeight: 21, color: c.textSecondary },
    term: {
      paddingBottom: 12,
      marginBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    termLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
    termTitle: { fontSize: 14, fontWeight: '700', color: c.primary, marginBottom: 2 },
    termDef: { fontSize: 14, lineHeight: 20, color: c.textSecondary },
  });
}
