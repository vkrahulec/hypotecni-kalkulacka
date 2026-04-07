import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { useNavigation } from '../context/NavigationContext';

const ARTICLES = [
  {
    id: 'vyber-hypoteky',
    title: 'Jak správně vybrat hypotéku v roce 2025',
    perex: 'Trh hypoték se v posledních letech výrazně změnil. Úrokové sazby, podmínky bank i regulace ČNB prošly výraznými proměnami. Jak se v tom vyznat a vybrat skutečně výhodnou hypotéku?',
    content: [
      {
        heading: 'Typy hypoték — co je pro vás vhodné?',
        text: `Základní volba stojí mezi klasickou účelovou hypotékou a americkou neúčelovou hypotékou. Klasická hypotéka je určena výhradně na pořízení, výstavbu nebo rekonstrukci nemovitosti. Díky zajištění zástavním právem k nemovitosti a přesnému účelu nabízejí banky nižší úrokové sazby — typicky o 1 až 3 procentní body níže než u neúčelových produktů.

Americká hypotéka vám naopak dává volnost: peníze použijete na cokoliv — od nákupu automobilu po konsolidaci dluhů. Zaplatíte však vyšší sazbu a banka vám zpravidla nepůjčí více než 70 % hodnoty nemovitosti.

Pro naprostou většinu lidí plánujících koupi bytu nebo domu je správnou volbou klasická hypotéka. Americká hypotéka dává smysl tehdy, kdy potřebujete volné prostředky a máte nemovitost jako zajištění, ale nepotřebujete financovat samotné bydlení.`,
      },
      {
        heading: 'Jak porovnat nabídky bank',
        text: `Nejčastější chybou při výběru hypotéky je srovnávání pouze nominální úrokové sazby. Ta je sice důležitá, ale sama o sobě neříká celou pravdu o ceně úvěru. Sledujte především RPSN (roční procentní sazbu nákladů) — tento ukazatel zahrnuje veškeré poplatky spojené s hypotékou včetně zřizovacího poplatku, pojištění nebo odhadu nemovitosti.

Při srovnávání nabídek sledujte:
• Výši nominální úrokové sazby a dobu fixace
• RPSN — celkové roční náklady úvěru
• Poplatky za zřízení, vedení účtu a odhad nemovitosti
• Podmínky předčasného splacení
• Požadavky na pojištění a další produkty banky
• Flexibilitu — možnost mimořádných splátek, odkladu splátky`,
      },
      {
        heading: 'Na co si dát pozor',
        text: `Banky čím dál tím více podmíňují výhodnou sazbu sjednáním dalších produktů — pojištění schopnosti splácet, životního pojištění nebo vedení běžného účtu. Tato tzv. cross-selling podmínka může zdánlivě výhodnou sazbu zdražit o desítky tisíc korun za celou dobu splácení. Vždy spočítejte celkové náklady, ne jen měsíční splátku.

Pozor také na délku fixace. Při vysokých sazbách se může zdát lákavé uzamknout sazbu na co nejdéle, ale pokud sazby klesnou, budete platit zbytečně více. Naopak při nízkých sazbách delší fixace chrání vaši splátku před zdražením.`,
      },
      {
        heading: 'Tipy pro vyjednání lepší sazby',
        text: `Banky mají prostor k individuálnímu jednání, zvláště pokud přicházíte jako klient s dobrou platební historií, stabilním příjmem a dostatečnou akontací. Před návštěvou banky si připravte konkurenční nabídky — písemně doložená lepší nabídka jiné banky je nejsilnějším argumentem při vyjednávání.

Využijte služeb nezávislého hypotečního poradce. Zkušený poradce zná aktuální podmínky všech bank, může vám sjednat výjimky a ušetří vám čas i peníze. Navíc jeho odměnu hradí zpravidla banka, nikoliv klient.

Nezapomínejte, že i existující klienti mají prostor vyjednávat — zejména při refixaci. Mnoho lidí automaticky přijme nabídku své banky, aniž by zjistili, zda by konkurence nenabídla více.`,
      },
    ],
  },
  {
    id: 'co-je-ltv',
    title: 'Co je LTV a proč je důležité',
    perex: 'Zkratka LTV (Loan to Value) patří k základním pojmům hypotečního světa. Přesto ji mnoho žadatelů o hypotéku podceňuje. LTV totiž přímo ovlivňuje, jakou sazbu dostanete — a zda vůbec hypotéku získáte.',
    content: [
      {
        heading: 'Co přesně LTV znamená',
        text: `LTV neboli „Loan to Value" vyjadřuje poměr výše úvěru k tržní hodnotě zastavené nemovitosti, vyjádřený v procentech. Pokud si kupujete byt za 5 000 000 Kč a potřebujete si půjčit 4 000 000 Kč, vaše LTV je 80 %.

Vzorec je jednoduchý:
LTV = (výše úvěru ÷ hodnota nemovitosti) × 100

Hodnota nemovitosti se přitom neurčuje kupní cenou, ale odhadem certifikovaného odhadce, kterého si obvykle objednává přímo banka. Odhadní cena a kupní cena se mohou lišit — a v takovém případě banka vychází z té nižší.`,
      },
      {
        heading: 'Jak LTV ovlivňuje úrokovou sazbu',
        text: `Banky vnímají LTV jako klíčový ukazatel rizika. Čím vyšší LTV, tím větší riziko pro banku — v případě nesplácení a nucené dražby nemusí výtěžek pokrýt zbývající dluh. Proto platí přímá závislost: vyšší LTV = vyšší úroková sazba.

Typické pásma a jejich dopad na sazbu:
• Do 60 % LTV — nejlepší dostupné sazby, banka podstupuje minimální riziko
• 60–70 % LTV — velmi dobré podmínky, stále výhodné sazby
• 70–80 % LTV — standardní podmínky, nejčastější pásmo
• 80–90 % LTV — vyšší sazba, banka může vyžadovat pojištění nebo záruku
• Nad 90 % LTV — od roku 2016 ČNB omezila poskytování takových hypoték

Rozdíl v sazbě mezi LTV 60 % a LTV 90 % může být klidně 0,5 až 1,5 procentního bodu — na hypotéce 4 miliony na 25 let to představuje rozdíl statisíců korun.`,
      },
      {
        heading: 'Optimální hodnoty LTV',
        text: `Z pohledu žadatele je ideální dosáhnout co nejnižšího LTV. Klíčový práh je 80 % — většina bank pod touto hranicí výrazně zlepší nabídnutou sazbu. Dalším důležitým prahem je 60 %, kde banky nabízejí své nejlepší podmínky.

Česká národní banka (ČNB) reguluje maximální LTV makroobezřetnostními opatřeními. Aktuálně platí, že hypotéky nad 90 % LTV nejsou téměř dostupné, a u hypoték v pásmu 80–90 % LTV mají banky omezený objem, který mohou poskytnout.

Pokud vám chybí hotovost na vyšší akontaci, zvažte využití jiné nemovitosti (např. nemovitosti rodičů) jako dodatečného zajištění — tím efektivně snížíte LTV celého úvěru.`,
      },
      {
        heading: 'Vliv LTV na schválení hypotéky',
        text: `Vysoké LTV nejenže zdražuje hypotéku, ale může být i důvodem zamítnutí žádosti. Banky mají interní limity pro různá LTV pásma a v různých tržních situacích tyto limity zpřísňují.

Doporučení pro žadatele:
• Snažte se o akontaci alespoň 20 % (LTV do 80 %)
• Pokud to finanční situace dovolí, cílejte na 30–40 % akontace (LTV 60–70 %)
• Proveďte si vlastní odhad hodnoty nemovitosti před podáním žádosti
• Počítejte s tím, že bankovní odhad může být nižší než kupní cena

Orientační výpočet LTV pro vaši hypotéku vám umožní naše kalkulačka — stačí zadat cenu nemovitosti a výši vlastních zdrojů.`,
      },
    ],
  },
  {
    id: 'fixace-hypoteky',
    title: 'Fixace hypotéky — jak dlouhou zvolit',
    perex: 'Délka fixace úrokové sazby je jedno z nejdůležitějších rozhodnutí při sjednávání hypotéky. Špatná volba může znamenat, že budete roky přeplácet — nebo naopak, že vás doběhne zdražení v nevhodnou chvíli.',
    content: [
      {
        heading: 'Co je fixace úrokové sazby',
        text: `Fixace úrokové sazby (nebo také „fixní období") je doba, po kterou se banka zavazuje neměnit vámi sjednanou úrokovou sazbu. Po celou tuto dobu platíte stejnou splátku bez ohledu na to, jak se mění tržní úrokové sazby.

Po skončení fixace nastává tzv. refixace — banka vám nabídne novou sazbu odpovídající aktuálním tržním podmínkám. Pokud nejste spokojeni s nabídkou své banky, máte právo hypotéku refinancovat u konkurence bez sankce (při dodržení zákonných podmínek).

Délka fixace tedy určuje, jak dlouho jste chráněni před pohybem úrokových sazeb — a kdy přijde příští „velké rozhodnutí" o podmínkách vašeho úvěru.`,
      },
      {
        heading: 'Srovnání délky fixace: 1, 3, 5, 7 a 10 let',
        text: `Každá délka fixace má své výhody a nevýhody:

Fixace na 1 rok
Výhody: Rychle zareagujete na pokles sazeb, nízká sankce za předčasné splacení.
Nevýhody: Velká nejistota — splátka se může každý rok měnit. Administrativně náročné.

Fixace na 3 roky
Výhody: Rozumný kompromis, střední délka nejistoty. Vhodné při očekávaném poklesu sazeb.
Nevýhody: Sazba bývá o něco vyšší než u 1leté fixace, ale kratší ochrana než 5letá.

Fixace na 5 let
Výhody: Nejoblíbenější varianta v ČR. Dobrý kompromis mezi jistotou a flexibilitou. Sazby bývají konkurenceschopné.
Nevýhody: Při výrazném poklesu sazeb přeplácíte 5 let.

Fixace na 7 let
Výhody: Delší klid a jistota splátky. Vhodné pro rodiny s napjatým rozpočtem.
Nevýhody: Vyšší sazba než u 5leté fixace, méně flexibility.

Fixace na 10 let
Výhody: Maximální jistota — víte přesně, kolik budete platit celé desetiletí.
Nevýhody: Nejvyšší sazba ze všech variant. Při poklesu sazeb výrazně nevýhodné.`,
      },
      {
        heading: 'Jak se rozhodnout — klíčové faktory',
        text: `Správná délka fixace závisí na vaší individuální situaci a výhledu úrokových sazeb:

Zvolte kratší fixaci (1–3 roky), pokud:
• Očekáváte výrazný pokles úrokových sazeb v horizontu 1–2 let
• Plánujete v blízké době prodat nemovitost nebo splatit hypotéku
• Máte dostatečné rezervy a tolerujete riziko vyšší splátky

Zvolte střední fixaci (5 let), pokud:
• Chcete rozumný kompromis bez extrémů
• Nejste si jisti vývojem sazeb
• Oceňujete předvídatelnost splátky na střednědobý horizont

Zvolte delší fixaci (7–10 let), pokud:
• Máte napjatý rodinný rozpočet a potřebujete jistotu
• Sazby jsou historicky nízké a nechcete riskovat zdražení
• Neplánujete v dohledné době mimořádné splátky nebo prodej`,
      },
      {
        heading: 'Aktuální situace na českém trhu',
        text: `Česká republika prošla v letech 2022–2023 výrazným zdražením hypoték v důsledku bojového zvyšování základních sazeb ČNB. Průměrná sazba hypoték, která se v roce 2021 pohybovala kolem 2–3 %, vyšplhala až na 6–7 %.

Od roku 2024 ČNB sazby postupně snižuje, což se pomalu promítá i do nabídky bank. V roce 2025 se nabídkové sazby pohybují přibližně v pásmu 4,5–6 % v závislosti na délce fixace, LTV a individuálním profilu klienta.

V prostředí pomalu klesajících sazeb je oblíbenou strategií kratší fixace (3–5 let) s výhledem na výhodnější refinancování. Zároveň je důležité nepodléhat přílišnému optimismu — prognózy vývoje sazeb jsou nejisté a každý žadatel by měl počítat s pesimistickým scénářem, kdy sazby výrazně neklesnou.

Pro orientační porovnání dopadu různých sazeb na výši splátky využijte naši hypoteční kalkulačku.`,
      },
    ],
  },
];

export function ArticlesScreen() {
  const c = Colors[useScheme()];
  const { navigate } = useNavigation();
  const s = makeStyles(c);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      <NavBar />
      <ScrollView contentContainerStyle={[s.content, { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        <Text style={s.h1}>Články a průvodci</Text>
        <Text style={s.intro}>
          Praktické informace a návody, které vám pomohou lépe porozumět hypotékám a učinit správná
          finanční rozhodnutí.
        </Text>

        {ARTICLES.map((article) => {
          const isOpen = openId === article.id;
          return (
            <View key={article.id} style={s.card}>
              <Pressable onPress={() => setOpenId(isOpen ? null : article.id)}>
                <Text style={s.articleTitle}>{article.title}</Text>
                <Text style={s.perex}>{article.perex}</Text>
                <Text style={[s.toggle, { color: c.primary }]}>{isOpen ? 'Skrýt ▲' : 'Číst celý článek ▼'}</Text>
              </Pressable>

              {isOpen && (
                <View style={s.articleBody}>
                  <View style={[s.divider, { backgroundColor: c.border }]} />
                  {article.content.map((section) => (
                    <View key={section.heading} style={s.section}>
                      <Text style={s.sectionHeading}>{section.heading}</Text>
                      <Text style={s.sectionText}>{section.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={[s.card, { backgroundColor: c.warningLight }]}>
          <Text style={[s.sectionHeading, { color: c.warning }]}>Upozornění</Text>
          <Text style={[s.sectionText, { color: c.textSecondary }]}>
            Obsah článků má pouze informační charakter a nepředstavuje finanční poradenství.
            Před uzavřením hypotéky doporučujeme konzultaci s licencovaným hypotečním poradcem.{' '}
            <Text style={{ color: c.primary, fontWeight: '600' }} onPress={() => navigate('/')}>
              Vyzkoušejte naši kalkulačku
            </Text>{' '}
            pro orientační výpočet splátky.
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
    h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8, color: c.text },
    intro: { fontSize: 14, lineHeight: 22, color: c.textSecondary, marginBottom: 24 },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    articleTitle: { fontSize: 17, fontWeight: '800', color: c.text, marginBottom: 8, lineHeight: 24 },
    perex: { fontSize: 14, lineHeight: 21, color: c.textSecondary, marginBottom: 12 },
    toggle: { fontSize: 13, fontWeight: '600' },
    articleBody: { marginTop: 4 },
    divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
    section: { marginBottom: 20 },
    sectionHeading: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 8 },
    sectionText: { fontSize: 14, lineHeight: 22, color: c.textSecondary },
  });
}
