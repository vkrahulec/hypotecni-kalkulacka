import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

const LINKS = [
  { label: 'Kalkulačka', path: '/' },
  { label: 'Články', path: '/clanky' },
  { label: 'Typy hypoték', path: '/typy-hypotek' },
  { label: 'O aplikaci', path: '/o-aplikaci' },
  { label: 'Kontakt', path: '/kontakt' },
  { label: 'Soukromí', path: '/privacy-policy' },
];

const MOBILE_BREAKPOINT = 640;

export function NavBar() {
  const c = Colors[useScheme()];
  const { route, navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = width < MOBILE_BREAKPOINT;

  function handleNavigate(path: string) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <View style={{ backgroundColor: c.surface, borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth, zIndex: 100 }}>
      <View style={styles.bar}>
        {isMobile ? (
          /* ── Hamburger button ── */
          <Pressable
            onPress={() => setMenuOpen((v) => !v)}
            style={styles.hamburger}
            hitSlop={8}
          >
            {menuOpen ? (
              /* × close icon */
              <View style={styles.iconWrap}>
                <View style={[styles.hLine, { backgroundColor: c.text, transform: [{ rotate: '45deg' }, { translateY: 0 }], marginBottom: -2 }]} />
                <View style={[styles.hLine, { backgroundColor: c.text, transform: [{ rotate: '-45deg' }] }]} />
              </View>
            ) : (
              /* ≡ hamburger icon */
              <View style={styles.iconWrap}>
                <View style={[styles.hLine, { backgroundColor: c.text }]} />
                <View style={[styles.hLine, { backgroundColor: c.text }]} />
                <View style={[styles.hLine, { backgroundColor: c.text }]} />
              </View>
            )}
          </Pressable>
        ) : (
          /* ── Desktop: inline links ── */
          <View style={styles.links}>
            {LINKS.map((link) => {
              const active = route === link.path;
              return (
                <Pressable key={link.path} onPress={() => handleNavigate(link.path)}>
                  <Text style={[styles.link, { color: active ? c.primary : c.textSecondary }, active && styles.linkActive]}>
                    {link.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* ── Mobile dropdown ── */}
      {isMobile && menuOpen && (
        <View style={[styles.dropdown, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          {LINKS.map((link) => {
            const active = route === link.path;
            return (
              <Pressable
                key={link.path}
                onPress={() => handleNavigate(link.path)}
                style={[styles.dropdownItem, { borderBottomColor: c.border }]}
              >
                <Text style={[styles.dropdownLink, { color: active ? c.primary : c.text }, active && styles.linkActive]}>
                  {link.label}
                </Text>
                {active && <View style={[styles.activeDot, { backgroundColor: c.primary }]} />}
              </Pressable>
            );
          })}
        </View>
      )}
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
    minHeight: 48,
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
  hamburger: {
    padding: 4,
  },
  iconWrap: {
    width: 24,
    height: 20,
    justifyContent: 'space-between',
  },
  hLine: {
    width: 24,
    height: 2,
    borderRadius: 1,
  },
  dropdown: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownLink: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
