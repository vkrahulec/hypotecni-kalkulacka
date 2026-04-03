import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { AmortizationRow, YearlyAmortizationRow } from '../utils/calculator';
import { formatCZK } from '../utils/formatting';

interface AmortizationTableProps {
  monthly: AmortizationRow[];
  yearly: YearlyAmortizationRow[];
}

export function AmortizationTable({ monthly, yearly }: AmortizationTableProps) {
  const c = Colors[useScheme()];
  const [view, setView] = useState<'monthly' | 'yearly'>('yearly');
  const styles = makeStyles(c);

  const headers =
    view === 'monthly'
      ? ['Měsíc', 'Splátka', 'Jistina', 'Úrok', 'Zůstatek']
      : ['Rok', 'Celkem', 'Jistina', 'Úrok', 'Zůstatek'];

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <View style={styles.toggleRow}>
        {(['yearly', 'monthly'] as const).map((v) => (
          <TouchableOpacity
            key={v}
            style={[
              styles.toggleChip,
              view === v
                ? { backgroundColor: c.primary, borderColor: c.primary }
                : { backgroundColor: c.surfaceContainer, borderColor: c.border },
            ]}
            onPress={() => setView(v)}
            activeOpacity={0.75}
          >
            <Text style={[styles.toggleText, { color: view === v ? c.onPrimary : c.textSecondary }]}>
              {v === 'monthly' ? 'Měsíčně' : 'Ročně'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={[styles.headerRow, { backgroundColor: c.surfaceContainer }]}>
            {headers.map((h, i) => (
              <Text
                key={h}
                style={[
                  styles.headerCell,
                  { color: c.textSecondary },
                  i === 0 ? styles.colFirst : styles.colValue,
                ]}
              >
                {h}
              </Text>
            ))}
          </View>

          {/* Rows */}
          <ScrollView style={styles.rowsScroll} nestedScrollEnabled>
            {view === 'monthly'
              ? monthly.map((row, idx) => (
                  <View
                    key={row.month}
                    style={[
                      styles.row,
                      { borderBottomColor: c.border },
                      idx % 2 !== 0 && { backgroundColor: c.surfaceContainer },
                    ]}
                  >
                    <Text style={[styles.cellFirst, { color: c.text }]}>{row.month}</Text>
                    <Text style={[styles.cell, { color: c.text }]}>{formatCZK(row.payment)}</Text>
                    <Text style={[styles.cell, { color: c.chartPrincipal }]}>
                      {formatCZK(row.principal)}
                    </Text>
                    <Text style={[styles.cell, { color: c.chartInterest }]}>
                      {formatCZK(row.interest)}
                    </Text>
                    <Text style={[styles.cell, { color: c.textSecondary }]}>
                      {formatCZK(row.remainingBalance)}
                    </Text>
                  </View>
                ))
              : yearly.map((row, idx) => (
                  <View
                    key={row.year}
                    style={[
                      styles.row,
                      { borderBottomColor: c.border },
                      idx % 2 !== 0 && { backgroundColor: c.surfaceContainer },
                    ]}
                  >
                    <Text style={[styles.cellFirst, { color: c.text }]}>{row.year}</Text>
                    <Text style={[styles.cell, { color: c.text }]}>
                      {formatCZK(row.totalPayment)}
                    </Text>
                    <Text style={[styles.cell, { color: c.chartPrincipal }]}>
                      {formatCZK(row.totalPrincipal)}
                    </Text>
                    <Text style={[styles.cell, { color: c.chartInterest }]}>
                      {formatCZK(row.totalInterest)}
                    </Text>
                    <Text style={[styles.cell, { color: c.textSecondary }]}>
                      {formatCZK(row.remainingBalance)}
                    </Text>
                  </View>
                ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.border,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 8,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
    },
    toggleChip: {
      borderWidth: 1.5,
      borderRadius: 20,
      paddingHorizontal: 16,
      height: 34,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleText: {
      fontSize: 13,
      fontWeight: '600',
    },
    headerRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    headerCell: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textAlign: 'right',
      textTransform: 'uppercase',
    },
    rowsScroll: {
      maxHeight: 340,
    },
    row: {
      flexDirection: 'row',
      paddingVertical: 9,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    colFirst: { width: 56, textAlign: 'center' },
    colValue: { width: 110, textAlign: 'right', paddingHorizontal: 6 },
    cellFirst: {
      width: 56,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    cell: {
      width: 110,
      fontSize: 13,
      textAlign: 'right',
      paddingHorizontal: 6,
    },
  });
}
