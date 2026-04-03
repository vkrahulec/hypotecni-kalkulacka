import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import {
  LTV_MAX_THRESHOLD,
  LTV_WARNING_THRESHOLD,
} from '../constants/config';
import { formatPercent } from '../utils/formatting';

interface LTVBadgeProps {
  ltv: number;
  ltvWarning?: number; // default: LTV_WARNING_THRESHOLD (80)
  ltvMax?: number;     // default: LTV_MAX_THRESHOLD (90)
}

export function LTVBadge({
  ltv,
  ltvWarning = LTV_WARNING_THRESHOLD,
  ltvMax = LTV_MAX_THRESHOLD,
}: LTVBadgeProps) {
  const c = Colors[useScheme()];

  const isError = ltv > ltvMax;
  const isWarning = ltv > ltvWarning && !isError;
  const isOk = ltv <= ltvWarning && ltv > 0;

  const bgColor = isError
    ? c.errorLight
    : isWarning
    ? c.warningLight
    : isOk
    ? c.primaryLight
    : c.surfaceSecondary;
  const textColor = isError
    ? c.error
    : isWarning
    ? c.warning
    : isOk
    ? c.primary
    : c.textMuted;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color: textColor }]}>LTV</Text>
      <Text style={[styles.value, { color: textColor }]}>{formatPercent(ltv)} %</Text>
      {isError && (
        <Text style={[styles.warning, { color: textColor }]}>
          ⚠ Překročeno {formatPercent(ltvMax, 0)} % — hypotéka nemusí být schválena
        </Text>
      )}
      {isWarning && (
        <Text style={[styles.warning, { color: textColor }]}>
          ⚠ Nad {formatPercent(ltvWarning, 0)} % — vyšší úroková sazba nebo odmítnutí
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  warning: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
