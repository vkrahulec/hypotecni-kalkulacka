import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const c = Colors[useScheme()];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <View style={styles.track}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              style={[
                styles.chip,
                active
                  ? { backgroundColor: c.primary, borderColor: c.primary }
                  : { backgroundColor: c.surfaceContainer, borderColor: c.border },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? c.onPrimary : c.textSecondary },
                  active && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  track: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
    columnGap: 6,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    fontWeight: '700',
  },
});
