import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { useNavigation } from '../context/NavigationContext';

export function MortgageTypesScreen() {
  const c = Colors[useScheme()];
  const { navigate } = useNavigation();
  const s = makeStyles(c);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      <NavBar />
      <ScrollView contentContainerStyle={[s.content, { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        <Text style={s.h1}>Typy hypoték v České republice</Text>

        {/* Klasická hypotéka */}
        <View style={s.card}>
          <Text style={s.h2}>1. Klasická hypotéka (účelová)</Text>
          <Text style={s.body}>
            Klasická neboli účelová hypotéka je nejrozšířenější forma hypotečního úvěru v České republice.
            Jedná se o dlouhodobý úvěr zajištěný zástavním právem k nemovitosti, který musí být použit
            na přesně stanovený účel. Banka vyžaduje doložení tohoto účelu příslušnými doklady —
            kupní smlouvou, stavebním povolením nebo fakturami za rekonstrukci.
          </Text>
          <Text style={s.subheading}>K čemu ji lze použít</Text>
          <Text style={s.body}>
            {'• Koupě bytu, rodinného domu nebo pozemku\n'}
            {'• Výstavba nebo rekonstrukce nemovitosti\n'}
            {'• Refinancování stávající hypotéky\n'}
            {'• Vypořádání dědictví nebo spoluvlastnictví nemovitosti'}
          </Text>
          <Text style={s.subheading}>Hlavní parametry</Text>
          <Text style={s.body}>
            {'• Maximální LTV: zpravidla 80–90 % (ČNB regulace)\n'}
            {'• Úroková sazba: nižší díky zajištění nemovitostí\n'}
            {'• Typická splatnost: 5 až 30 let\n'}
            {'• Nutné doložení účelu úvěru'}
          </Text>
          <Text style={s.body}>
            Nižší úroková sazba je hlavní výhodou klasické hypotéky — banka podstupuje menší riziko,
            protože přesně ví, na co jsou peníze použity, a nemovitost slouží jako zajištění.
            Nevýhodou je administrativní náročnost: musíte doložit účel čerpání a dodržet podmínky smlouvy.
          </Text>
        </View>

        {/* Americká hypotéka */}
        <View style={s.card}>
          <Text style={s.h2}>2. Americká hypotéka (neúčelová)</Text>
          <Text style={s.body}>
            Americká hypotéka je neúčelový úvěr zajištěný nemovitostí. Na rozdíl od klasické hypotéky
            nemusíte bance dokládat, na co peníze použijete. Úvěr je zajištěn zástavním právem
            k vaší nemovitosti, díky čemuž jsou úrokové sazby nižší než u klasických spotřebitelských
            půjček — přesto jsou však vyšší než u účelové hypotéky.
          </Text>
          <Text style={s.subheading}>K čemu ji lze použít</Text>
          <Text style={s.body}>
            {'• Nákup automobilu nebo jiného vybavení\n'}
            {'• Financování dovolené nebo vzdělání\n'}
            {'• Konsolidace (sloučení) stávajících dluhů\n'}
            {'• Jakýkoliv jiný osobní nebo podnikatelský výdaj'}
          </Text>
          <Text style={s.subheading}>Hlavní parametry</Text>
          <Text style={s.body}>
            {'• Maximální LTV: zpravidla do 70 %\n'}
            {'• Úroková sazba: o 1–3 % vyšší než klasická hypotéka\n'}
            {'• Typická splatnost: 5 až 20 let\n'}
            {'• Účel použití peněz není třeba dokládat'}
          </Text>
          <Text style={s.body}>
            Největší výhodou americké hypotéky je flexibilita — peníze použijete na cokoliv bez
            zbytečné administrativy. Nevýhodou je vyšší cena úvěru a nižší maximální LTV, což znamená,
            že potřebujete větší vlastní kapitál. Před uzavřením zvažte, zda se nevyplatí čerpat
            klasickou hypotéku na nemovitost a zbytek financovat jiným způsobem.
          </Text>
        </View>

        {/* Comparison table */}
        <View style={s.card}>
          <Text style={s.h2}>3. Srovnání klasické a americké hypotéky</Text>
          <View style={s.table}>
            <View style={[s.tableRow, s.tableHeader]}>
              <Text style={[s.tableCell, s.tableCellHeader, s.colParam]}>Parametr</Text>
              <Text style={[s.tableCell, s.tableCellHeader, s.colClassic]}>Klasická</Text>
              <Text style={[s.tableCell, s.tableCellHeader, s.colAmerican]}>Americká</Text>
            </View>
            {[
              ['Účel použití', 'Pouze na nemovitost', 'Cokoliv'],
              ['Úroková sazba', 'Nižší', 'O 1–3 % vyšší'],
              ['Max. LTV', '80–90 %', 'Cca 70 %'],
              ['Dokládání účelu', 'Ano, povinné', 'Ne'],
              ['Typická splatnost', '5–30 let', '5–20 let'],
              ['Vhodné pro', 'Koupi/rekonstrukci nemovitosti', 'Volné financování'],
            ].map(([param, classic, american], i) => (
              <View key={param} style={[s.tableRow, i % 2 === 1 && { backgroundColor: c.background }]}>
                <Text style={[s.tableCell, s.colParam, { fontWeight: '600', color: c.text }]}>{param}</Text>
                <Text style={[s.tableCell, s.colClassic, { color: c.textSecondary }]}>{classic}</Text>
                <Text style={[s.tableCell, s.colAmerican, { color: c.textSecondary }]}>{american}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Refixace */}
        <View style={s.card}>
          <Text style={s.h2}>4. Refixace hypotéky</Text>
          <Text style={s.body}>
            Refixace je proces, při kterém si po skončení sjednané doby fixace úrokové sazby vyjednáte
            nové podmínky — buď s vaší stávající bankou, nebo přejdete ke konkurenci (refinancování).
            Jde o jeden z nejdůležitějších momentů v celé době splácení hypotéky, protože nová sazba
            může výrazně ovlivnit výši měsíční splátky na dalších 3, 5 nebo 10 let.
          </Text>
          <Text style={s.subheading}>Kdy a jak postupovat</Text>
          <Text style={s.body}>
            {'• Začněte porovnávat nabídky 3–6 měsíců před koncem fixace\n'}
            {'• Oslovte svou banku a zjistěte nabídku prodloužení fixace\n'}
            {'• Zároveň si vyžádejte nabídky od konkurenčních bank\n'}
            {'• Porovnávejte RPSN, ne jen nominální úrokovou sazbu\n'}
            {'• Zohledněte poplatky za předčasné splacení u stávající banky'}
          </Text>
          <Text style={s.subheading}>Tipy pro vyjednání lepší sazby</Text>
          <Text style={s.body}>
            {'• Připravte si konkurenční nabídky — banky jsou ochotnější jednat, když vidí reálnou alternativu\n'}
            {'• Zlepšete svůj kreditní profil: splácejte jiné závazky, snižte čerpání kreditních karet\n'}
            {'• Zvažte zkrácení doby fixace, pokud očekáváte pokles sazeb\n'}
            {'• Ptejte se na věrnostní slevy — řada bank nabízí lepší podmínky stávajícím klientům\n'}
            {'• Nebojte se odejít — přechod k jiné bance může ušetřit desítky tisíc korun'}
          </Text>
        </View>

        {/* Practical tips */}
        <View style={s.card}>
          <Text style={s.h2}>5. Praktické rady při výběru hypotéky</Text>
          <Text style={s.subheading}>Jak vybrat správný typ hypotéky</Text>
          <Text style={s.body}>
            Pokud financujete koupi, výstavbu nebo rekonstrukci nemovitosti, volte vždy klasickou
            účelovou hypotéku. Získáte nižší úrokovou sazbu a výhodnější LTV. Americkou hypotéku
            zvažte pouze tehdy, kdy potřebujete finanční prostředky na jiný účel a máte nemovitost,
            kterou lze zastavit.
          </Text>
          <Text style={s.subheading}>Na co si dát pozor</Text>
          <Text style={s.body}>
            {'• Skryté poplatky: zřizovací poplatek, poplatek za vedení účtu, odhad nemovitosti\n'}
            {'• Pojištění schopnosti splácet — bývá podmínkou pro získání lepší sazby, ale zvyšuje náklady\n'}
            {'• Sankce za předčasné splacení mimo dobu refixace\n'}
            {'• Fixace na příliš dlouhou dobu při vysokých sazbách\n'}
            {'• Přehnaný optimismus ohledně budoucích příjmů — splátka by neměla přesáhnout 30–40 % čistého příjmu'}
          </Text>
          <Text style={s.subheading}>Kdy vyhledat hypotečního poradce</Text>
          <Text style={s.body}>
            Hypoteční poradce se hodí zejména tehdy, pokud porovnáváte nabídky více bank najednou,
            máte nestandardní příjmy (OSVČ, příjmy ze zahraničí), nebo pokud nevíte, jaký typ
            hypotéky pro vaši situaci zvolit. Kvalitní poradce vám ušetří čas i peníze — a zpravidla
            je jeho odměna hrazena bankou, nikoliv vámi.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={[s.card, { backgroundColor: c.warningLight }]}>
          <Text style={[s.h2, { color: c.warning }]}>Upozornění</Text>
          <Text style={[s.body, { color: c.textSecondary }]}>
            Obsah této stránky má pouze informační charakter a nepředstavuje finanční poradenství
            ani závaznou nabídku úvěru. Podmínky hypoték se liší banka od banky a mění se v čase.
            Před uzavřením jakékoliv smlouvy doporučujeme konzultaci s licencovaným hypotečním
            poradcem nebo přímo s vaší bankou.{'\n\n'}
            Pro orientační výpočet splátky využijte naši{' '}
            <Text style={{ color: c.primary, fontWeight: '600' }} onPress={() => navigate('/')}>
              hypoteční kalkulačku
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
    h2: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: c.text },
    subheading: { fontSize: 14, fontWeight: '700', color: c.text, marginTop: 12, marginBottom: 6 },
    body: { fontSize: 14, lineHeight: 22, color: c.textSecondary, marginBottom: 8 },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    table: {
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: c.surface,
    },
    tableHeader: {
      backgroundColor: c.primary,
    },
    tableCell: {
      fontSize: 13,
      lineHeight: 18,
    },
    tableCellHeader: {
      color: '#fff',
      fontWeight: '700',
    },
    colParam: { flex: 3 },
    colClassic: { flex: 3 },
    colAmerican: { flex: 3 },
  });
}
