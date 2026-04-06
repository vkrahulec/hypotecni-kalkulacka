import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

const LINKS = [
  { label: 'Kalkulačka', path: '/' },
  { label: 'O aplikaci', path: '/o-aplikaci' },
  { label: 'Kontakt', path: '/kontakt' },
  { label: 'Soukromí', path: '/privacy-policy' },
];

export function NavBar() {
  const c = Colors[useScheme()];
  const { route, navigate } = useNavigation();

  return (
    <View style={[styles.bar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
      <View style={styles.links}>
        {LINKS.map((link) => {
          const active = route === link.path;
          return (
            <Pressable key={link.path} onPress={() => navigate(link.path)}>
              <Text
                style={[
                  styles.link,
                  { color: active ? c.primary : c.textSecondary },
                  active && styles.linkActive,
                ]}
              >
                {link.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  links: {
    flexDirection: 'row',
    gap: 16,
  },
  link: {
    fontSize: 13,
    fontWeight: '500',
  },
  linkActive: {
    fontWeight: '700',
  },
});
