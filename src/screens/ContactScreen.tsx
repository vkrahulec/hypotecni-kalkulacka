import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { useNavigation } from '../context/NavigationContext';

export function ContactScreen() {
  const c = Colors[useScheme()];
  const { navigate } = useNavigation();
  const s = makeStyles(c);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      <NavBar />
      <ScrollView contentContainerStyle={[s.content, { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        <Text style={s.h1}>Kontakt</Text>

        <View style={s.card}>
          <Text style={s.h2}>Kontaktní údaje</Text>
          <Text style={s.body}>
            HypoCalc je osobní nekomerční projekt. Nemáme zákaznickou podporu v tradičním smyslu,
            ale rádi zodpovíme vaše dotazy e-mailem.
          </Text>
          <View style={s.contactRow}>
            <Text style={s.label}>E-mail</Text>
            <Text style={[s.value, { color: c.primary }]}>info@hypocalc.app</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.h2}>O projektu</Text>
          <Text style={s.body}>
            Aplikace HypoCalc vznikla jako osobní projekt s cílem poskytnout bezplatný a přehledný
            nástroj pro výpočet hypotéky v České republice. Není provozována žádnou finanční institucí
            ani hypotečním poradcem.{'\n\n'}
            Výsledky kalkulačky jsou orientační a neslouží jako finanční poradenství.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.h2}>Ochrana osobních údajů</Text>
          <Text style={s.body}>
            Informace o tom, jak nakládáme s vašimi údaji, najdete v naší{' '}
            <Text style={{ color: c.primary, fontWeight: '600' }} onPress={() => navigate('/privacy-policy')}>
              politice ochrany osobních údajů
            </Text>
            .
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
    h2: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: c.text },
    body: { fontSize: 14, lineHeight: 22, color: c.textSecondary, marginBottom: 12 },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 4,
    },
    label: { fontSize: 13, fontWeight: '600', color: c.textMuted, width: 60 },
    value: { fontSize: 15, fontWeight: '600' },
  });
}
