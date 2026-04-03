import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';

interface SectionHeaderProps {
  title: string;
  toggle?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, toggle }: SectionHeaderProps) {
  const c = Colors[useScheme()];

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {toggle && (
        <TouchableOpacity onPress={toggle.onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.btnText, { color: c.primary }]}>{toggle.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
