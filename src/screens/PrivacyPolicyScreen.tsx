import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

export function PrivacyPolicyScreen() {
  const c = Colors[useScheme()];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      <NavBar />
      <ScrollView contentContainerStyle={[styles.content, { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        <Text style={[styles.h1, { color: c.text }]}>Ochrana osobních údajů</Text>
        <Text style={[styles.meta, { color: c.textMuted }]}>Platné od 5. dubna 2026</Text>

        <Section title="1. Provozovatel" c={c}>
          Tato webová aplikace HypoCalc (dále jen „aplikace") je provozována jako osobní nekomerční projekt.
          V případě dotazů nás kontaktujte na adrese: info@hypocalc.app
        </Section>

        <Section title="2. Jaké údaje shromažďujeme" c={c}>
          Aplikace sama o sobě neshromažďuje žádné osobní údaje. Neukládáme jména, e-mailové adresy ani jiné
          identifikátory uživatelů. Veškeré výpočty probíhají výhradně v prohlížeči uživatele.{'\n\n'}
          Za účelem měření návštěvnosti a zlepšování aplikace mohou být využívány anonymizované analytické
          nástroje, které nezpracovávají osobně identifikovatelné informace.
        </Section>

        <Section title="3. Google AdSense a soubory cookie" c={c}>
          Aplikace zobrazuje reklamy prostřednictvím služby Google AdSense provozované společností Google LLC.
          Tato služba využívá soubory cookie a podobné technologie k zobrazování relevantních reklam na základě
          vašich předchozích návštěv na internetu.{'\n\n'}
          Google AdSense může shromažďovat a zpracovávat informace o vašem chování na internetu podle
          Zásad ochrany soukromí společnosti Google (policies.google.com/privacy).{'\n\n'}
          Zobrazování personalizovaných reklam můžete kdykoli vypnout prostřednictvím nastavení reklam Google
          na adrese adssettings.google.com nebo prostřednictvím nastavení vašeho prohlížeče.
        </Section>

        <Section title="4. Soubory cookie" c={c}>
          Aplikace neukládá vlastní cookies. Soubory cookie mohou být ukládány třetími stranami (Google AdSense)
          za účely popsanými výše. Pomocí nastavení vašeho prohlížeče můžete cookies kdykoli odmítnout nebo
          smazat.
        </Section>

        <Section title="5. Vaše práva (GDPR)" c={c}>
          V souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR) máte právo:{'\n\n'}
          • Právo na přístup k osobním údajům{'\n'}
          • Právo na opravu nepřesných údajů{'\n'}
          • Právo na výmaz údajů („právo být zapomenut"){'\n'}
          • Právo na omezení zpracování{'\n'}
          • Právo na přenositelnost údajů{'\n'}
          • Právo vznést námitku proti zpracování{'\n\n'}
          Protože aplikace sama nezpracovává vaše osobní údaje, většina těchto práv se vztahuje výhradně
          ke zpracování prováděnému třetími stranami (Google). Pro uplatnění práv vůči Google navštivte
          myaccount.google.com.
        </Section>

        <Section title="6. Zabezpečení" c={c}>
          Aplikace je provozována prostřednictvím zabezpečeného protokolu HTTPS. Nevyžadujeme registraci
          ani přihlášení, a proto nehrozí únik hesel ani osobních účtů.
        </Section>

        <Section title="7. Změny zásad ochrany soukromí" c={c}>
          Tyto zásady mohou být příležitostně aktualizovány. Datum platnosti v záhlaví dokumentu vždy
          odráží nejnovější verzi. Doporučujeme tuto stránku pravidelně kontrolovat.
        </Section>

        <Section title="8. Kontakt" c={c}>
          Máte-li dotazy týkající se ochrany osobních údajů, kontaktujte nás na:{'\n'}
          E-mail: info@hypocalc.app
        </Section>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, c }: { title: string; children: string; c: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.h2, { color: c.text }]}>{title}</Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  h2: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
});
