import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';

// Web-only AdBanner — no AdMob imports (native-only library)
// Replace the inner View content with your real AdSense <ins> tag via a web index.html injection.
export function AdBanner() {
  const c = Colors[useScheme()];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.adBackground, borderTopColor: c.border },
      ]}
    >
      <Text style={[styles.label, { color: c.textMuted }]}>Reklama</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  label: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
