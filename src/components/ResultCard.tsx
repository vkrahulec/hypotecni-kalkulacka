import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { formatCZK } from '../utils/formatting';

interface ResultCardProps {
  title: string;
  value: number;
  subtitle?: string;
  accent?: boolean;
  warning?: boolean;
}

export function ResultCard({ title, value, subtitle, accent, warning }: ResultCardProps) {
  const c = Colors[useScheme()];
  const styles = makeStyles(c, !!accent, !!warning);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{formatCZK(value)} Kč</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function makeStyles(c: ThemeColors, accent: boolean, warning: boolean) {
  const bg = warning ? c.errorLight : accent ? c.primaryContainer : c.surfaceContainer;
  const titleColor = warning ? c.error : accent ? c.primary : c.textSecondary;
  const valueColor = warning ? c.error : accent ? c.primary : c.text;

  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: bg,
      borderRadius: 16,
      padding: 16,
      margin: 4,
      minWidth: 140,
      ...Platform.select({
        ios: {
          shadowColor: '#1B1B1F',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: { elevation: 1 },
        web: { boxShadow: '0 1px 3px rgba(27,27,31,0.08)' } as object,
      }),
    },
    title: {
      fontSize: 11,
      fontWeight: '600',
      color: titleColor,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    value: {
      fontSize: 20,
      fontWeight: '700',
      color: valueColor,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 11,
      color: titleColor,
      marginTop: 4,
      opacity: 0.75,
    },
  });
}
