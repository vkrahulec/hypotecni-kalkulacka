import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const bg = warning ? c.warningLight : accent ? c.primaryLight : c.surface;
  const titleColor = warning ? c.warning : accent ? c.primary : c.textSecondary;
  const valueColor = warning ? c.warning : accent ? c.primary : c.text;

  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: bg,
      borderRadius: 14,
      padding: 14,
      margin: 4,
      minWidth: 140,
    },
    title: {
      fontSize: 12,
      fontWeight: '600',
      color: titleColor,
      letterSpacing: 0.3,
      marginBottom: 6,
    },
    value: {
      fontSize: 18,
      fontWeight: '700',
      color: valueColor,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 11,
      color: titleColor,
      marginTop: 3,
      opacity: 0.8,
    },
  });
}
