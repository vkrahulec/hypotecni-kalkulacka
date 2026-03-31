import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

interface SectionHeaderProps {
  title: string;
  toggle?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, toggle }: SectionHeaderProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {toggle && (
        <TouchableOpacity onPress={toggle.onPress} style={[styles.btn, { borderColor: c.border }]}>
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
    marginBottom: 10,
    marginTop: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  btn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
