import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

export function Footer() {
  const c = Colors[useScheme()];
  const { navigate } = useNavigation();

  return (
    <View style={[styles.footer, { borderTopColor: c.border }]}>
      <Text style={[styles.disclaimer, { color: c.textMuted }]}>
        Výsledky kalkulačky jsou orientační a nepředstavují finanční poradenství.
      </Text>
      <View style={styles.links}>
        <Pressable onPress={() => navigate('/clanky')}>
          <Text style={[styles.link, { color: c.textSecondary }]}>Články</Text>
        </Pressable>
        <Text style={[styles.sep, { color: c.textMuted }]}>|</Text>
        <Pressable onPress={() => navigate('/typy-hypotek')}>
          <Text style={[styles.link, { color: c.textSecondary }]}>Typy hypoték</Text>
        </Pressable>
        <Text style={[styles.sep, { color: c.textMuted }]}>|</Text>
        <Pressable onPress={() => navigate('/o-aplikaci')}>
          <Text style={[styles.link, { color: c.textSecondary }]}>O aplikaci</Text>
        </Pressable>
        <Text style={[styles.sep, { color: c.textMuted }]}>|</Text>
        <Pressable onPress={() => navigate('/kontakt')}>
          <Text style={[styles.link, { color: c.textSecondary }]}>Kontakt</Text>
        </Pressable>
        <Text style={[styles.sep, { color: c.textMuted }]}>|</Text>
        <Pressable onPress={() => navigate('/privacy-policy')}>
          <Text style={[styles.link, { color: c.textSecondary }]}>Ochrana soukromí</Text>
        </Pressable>
      </View>
      <Text style={[styles.copy, { color: c.textMuted }]}>© 2025 HypoCalc</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 32,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 10,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    fontSize: 12,
    fontWeight: '500',
  },
  sep: {
    fontSize: 12,
  },
  copy: {
    fontSize: 11,
  },
});
