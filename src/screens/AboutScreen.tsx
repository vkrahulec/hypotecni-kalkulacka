import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

export function AboutScreen() {
  const c = Colors[useScheme()];
  const s = makeStyles(c);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      <NavBar />
      <ScrollView contentContainerStyle={[s.content, { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        <Text style={s.h1}>O aplikaci HypoCalc</Text>

        {/* What is it */}
        <View style={s.card}>
          <Text style={s.h2}>Co je HypoCalc?</Text>
          <Text style={s.body}>
            HypoCalc je bezplatná online hypoteční kalkulačka určená pro každého, kdo plánuje koupi
            nemovitosti v České republice. Umožňuje rychle a přehledně vypočítat měsíční splátku hypotéky,
            celkové náklady úvěru, výši zaplacených úroků a zobrazit kompletní amortizační plán.{'\n\n'}
            Aplikace funguje přímo v prohlížeči — nevyžaduje registraci ani instalaci. Veškeré výpočty
            probíhají okamžitě a bezpečně ve vašem zařízení.
          </Text>
        </View>

        {/* How to use */}
        <View style={s.card}>
          <Text style={s.h2}>Jak kalkulačku používat?</Text>
          {[
            ['1. Zadejte cenu nemovitosti', 'Vyplňte celkovou kupní cenu nemovitosti, kterou chcete pořídit.'],
            ['2. Nastavte vlastní zdroje', 'Zadejte výši vlastního kapitálu (akontace). Kalkulačka automaticky vypočítá LTV a výši úvěru.'],
            ['3. Zvolte úrokovou sazbu', 'Zadejte roční úrokovou sazbu nabízenou bankou. Aktuální sazby zjistíte u své banky nebo hypotečního poradce.'],
            ['4. Vyberte dobu fixace', 'Fixace určuje, na jak dlouho se banka zavazuje dodržet sjednanou úrokovou sazbu.'],
            ['5. Nastavte dobu splácení', 'Pomocí posuvníku zvolte celkovou dobu splácení hypotéky (5–40 let).'],
            ['6. Prozkoumejte výsledky', 'Kalkulačka zobrazí měsíční splátku, celkové náklady, grafy vývoje a podrobný splátkový kalendář.'],
          ].map(([step, desc]) => (
            <View key={step} style={s.step}>
              <Text style={s.stepTitle}>{step}</Text>
              <Text style={s.stepDesc}>{desc}</Text>
            </View>
          ))}
        </View>

        {/* Glossary */}
        <View style={s.card}>
          <Text style={s.h2}>Slovník pojmů</Text>
          {[
            ['LTV (Loan to Value)', 'Poměr výše úvěru k tržní hodnotě nemovitosti vyjádřený v procentech. Banky v ČR zpravidla poskytují hypotéku do 80–90 % LTV. Čím nižší LTV, tím výhodnější podmínky úvěru.'],
            ['Anuitní splátka', 'Pravidelná měsíční splátka ve stejné výši po celou dobu fixace. Obsahuje jak splátku jistiny, tak úroku. Na začátku tvoří větší část splátky úrok, postupně roste podíl jistiny.'],
            ['Progresivní splácení', 'Splátky se v čase mění — jistina zůstává konstantní, ale úrok se postupně snižuje. První splátky jsou nižší než u anuitního způsobu.'],
            ['Fixace úrokové sazby', 'Období, po které banka garantuje neměnnou úrokovou sazbu. Typicky 1, 3, 5 nebo 10 let. Po skončení fixace se sazba přehodnocuje podle aktuálních podmínek na trhu.'],
            ['RPSN (Roční procentní sazba nákladů)', 'Ukazatel vyjadřující celkové roční náklady úvěru včetně poplatků a pojištění. Umožňuje srovnání různých nabídek hypoték.'],
            ['Amortizace', 'Postupné splácení hypotéky v čase. Amortizační plán (splátkový kalendář) ukazuje, jak se každou splátkou mění poměr jistiny a úroku a jak klesá zbývající dluh.'],
          ].map(([term, def]) => (
            <View key={term} style={s.term}>
              <Text style={s.termTitle}>{term}</Text>
              <Text style={s.termDef}>{def}</Text>
            </View>
          ))}
        </View>

        {/* Who is it for */}
        <View style={s.card}>
          <Text style={s.h2}>Pro koho je aplikace určena?</Text>
          <Text style={s.body}>
            HypoCalc je určen především pro:{'\n\n'}
            • Osoby plánující koupi bytu nebo domu v České republice{'\n'}
            • Zájemce, kteří chtějí porovnat různé scénáře splácení{'\n'}
            • Každého, kdo chce lépe porozumět struktuře hypotečního úvěru{'\n'}
            • Kupující hledající orientační přehled nákladů před návštěvou banky
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={[s.card, { backgroundColor: c.warningLight }]}>
          <Text style={[s.h2, { color: c.warning }]}>Upozornění</Text>
          <Text style={[s.body, { color: c.textSecondary }]}>
            Výsledky kalkulačky mají pouze orientační charakter a nepředstavují finanční poradenství
            ani závaznou nabídku úvěru. Skutečné podmínky hypotéky závisí na individuálním posouzení
            bankou, aktuálních tržních sazbách a dalších faktorech.{'\n\n'}
            Před uzavřením hypoteční smlouvy doporučujeme konzultaci s licencovaným hypotečním
            poradcem nebo přímo s vaší bankou.
          </Text>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: any) {
  return StyleSheet.create({
    content: { padding: 24 },
    h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 24, color: c.text },
    h2: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: c.text },
    body: { fontSize: 14, lineHeight: 22, color: c.textSecondary },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    step: { marginBottom: 14 },
    stepTitle: { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 2 },
    stepDesc: { fontSize: 14, lineHeight: 20, color: c.textSecondary },
    term: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    termTitle: { fontSize: 14, fontWeight: '700', color: c.primary, marginBottom: 4 },
    termDef: { fontSize: 14, lineHeight: 20, color: c.textSecondary },
  });
}
