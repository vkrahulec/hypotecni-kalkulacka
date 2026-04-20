import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { AmortizationRow, YearlyAmortizationRow } from '../utils/calculator';
import { formatCZK } from '../utils/formatting';

interface AmortizationTableProps {
  monthly: AmortizationRow[];
  yearly: YearlyAmortizationRow[];
}

const COL_FIRST = 60;   // MĚSÍC / ROK
const COL_VALUE = 100;  // SPLÁTKA, JISTINA, ÚROK
const COL_LAST  = 110;  // ZŮSTATEK
const TABLE_WIDTH = COL_FIRST + COL_VALUE * 3 + COL_LAST; // 470

const PAGE_SIZE = 12;

export function AmortizationTable({ monthly, yearly }: AmortizationTableProps) {
  const c = Colors[useScheme()];
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const [view, setView] = useState<'monthly' | 'yearly'>('yearly');
  const [expanded, setExpanded] = useState(false);
  const s = makeStyles(c);

  const headers =
    view === 'monthly'
      ? ['Měsíc', 'Splátka', 'Jistina', 'Úrok', 'Zůstatek']
      : ['Rok', 'Celkem', 'Jistina', 'Úrok', 'Zůstatek'];

  const allRows = view === 'monthly' ? monthly : yearly;
  const visibleRows = expanded ? allRows : allRows.slice(0, PAGE_SIZE);
  const hasMore = allRows.length > PAGE_SIZE;

  const cellFirst = isDesktop ? [s.cellFirst, s.cellFirstFlex] : s.cellFirst;
  const cell = isDesktop ? [s.cell, s.cellFlex] : s.cell;
  const cellLast = isDesktop ? [s.cellLast, s.cellLastFlex] : s.cellLast;

  function renderMonthlyRow(row: AmortizationRow, idx: number) {
    return (
      <View key={row.month} style={[s.row, idx % 2 !== 0 && { backgroundColor: c.surfaceContainer }]}>
        <Text style={[cellFirst, { color: c.text }]} numberOfLines={1}>{row.month}</Text>
        <Text style={[cell, { color: c.text }]} numberOfLines={1}>{formatCZK(row.payment)}</Text>
        <Text style={[cell, { color: c.chartPrincipal }]} numberOfLines={1}>{formatCZK(row.principal)}</Text>
        <Text style={[cell, { color: c.chartInterest }]} numberOfLines={1}>{formatCZK(row.interest)}</Text>
        <Text style={[cellLast, { color: c.textSecondary }]} numberOfLines={1}>{formatCZK(row.remainingBalance)}</Text>
      </View>
    );
  }

  function renderYearlyRow(row: YearlyAmortizationRow, idx: number) {
    return (
      <View key={row.year} style={[s.row, idx % 2 !== 0 && { backgroundColor: c.surfaceContainer }]}>
        <Text style={[cellFirst, { color: c.text }]} numberOfLines={1}>{row.year}</Text>
        <Text style={[cell, { color: c.text }]} numberOfLines={1}>{formatCZK(row.totalPayment)}</Text>
        <Text style={[cell, { color: c.chartPrincipal }]} numberOfLines={1}>{formatCZK(row.totalPrincipal)}</Text>
        <Text style={[cell, { color: c.chartInterest }]} numberOfLines={1}>{formatCZK(row.totalInterest)}</Text>
        <Text style={[cellLast, { color: c.textSecondary }]} numberOfLines={1}>{formatCZK(row.remainingBalance)}</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* View toggle */}
      <View style={s.toggleRow}>
        {(['yearly', 'monthly'] as const).map((v) => (
          <TouchableOpacity
            key={v}
            style={[
              s.toggleChip,
              view === v
                ? { backgroundColor: c.primary, borderColor: c.primary }
                : { backgroundColor: c.surfaceContainer, borderColor: c.border },
            ]}
            onPress={() => { setView(v); setExpanded(false); }}
            activeOpacity={0.75}
          >
            <Text style={[s.toggleText, { color: view === v ? c.onPrimary : c.textSecondary }]}>
              {v === 'monthly' ? 'Měsíčně' : 'Ročně'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Header + rows: full-width flex on desktop, horizontal scroll on mobile */}
      {isDesktop ? (
        <View>
          <View style={s.headerRow}>
            {headers.map((h, i) => (
              <Text
                key={h}
                numberOfLines={1}
                style={[
                  s.headerCell,
                  { color: c.textSecondary },
                  i === 0 ? s.headerCellFirst : i === headers.length - 1 ? s.headerCellLast : s.headerCellMid,
                ]}
              >
                {h}
              </Text>
            ))}
          </View>
          <View>
            {view === 'monthly'
              ? (visibleRows as AmortizationRow[]).map((row, idx) => renderMonthlyRow(row, idx))
              : (visibleRows as YearlyAmortizationRow[]).map((row, idx) => renderYearlyRow(row, idx))}
          </View>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
          <View style={{ width: TABLE_WIDTH }}>
            <View style={s.headerRow}>
              {headers.map((h, i) => (
                <Text
                  key={h}
                  numberOfLines={1}
                  style={[
                    s.headerCell,
                    { color: c.textSecondary },
                    i === 0
                      ? { width: COL_FIRST, textAlign: 'center' }
                      : i === headers.length - 1
                      ? { width: COL_LAST, textAlign: 'right' }
                      : { width: COL_VALUE, textAlign: 'right' },
                  ]}
                >
                  {h}
                </Text>
              ))}
            </View>
            <View>
              {view === 'monthly'
                ? (visibleRows as AmortizationRow[]).map((row, idx) => renderMonthlyRow(row, idx))
                : (visibleRows as YearlyAmortizationRow[]).map((row, idx) => renderYearlyRow(row, idx))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Expand / collapse */}
      {hasMore && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={[s.expandBtn, { borderTopColor: c.border, backgroundColor: c.surface }]}
          activeOpacity={0.75}
        >
          <Text style={[s.expandText, { color: c.primary }]}>
            {expanded ? 'Sbalit' : `Zobrazit vše (${allRows.length} řádků)`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Horizontal scroll hint — mobile only */}
      {!isDesktop && (
        <Text style={[s.hint, { color: c.textMuted, borderTopColor: c.border }]}>
          ← Posuňte pro více →
        </Text>
      )}
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
    toggleText: { fontSize: 13, fontWeight: '600' },
    headerRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 4,
      backgroundColor: c.surfaceContainer,
    },
    headerCell: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      paddingHorizontal: 4,
    },
    expandBtn: {
      paddingVertical: 13,
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    expandText: { fontSize: 13, fontWeight: '600' },
    row: {
      flexDirection: 'row',
      paddingVertical: 9,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      height: 40,
    },
    cellFirst: {
      width: COL_FIRST,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      paddingHorizontal: 4,
    },
    cellFirstFlex: {
      width: undefined,
      flex: 1,
      textAlign: 'left',
    },
    cell: {
      width: COL_VALUE,
      fontSize: 13,
      textAlign: 'right',
      paddingHorizontal: 4,
    },
    cellFlex: {
      width: undefined,
      flex: 2,
    },
    cellLast: {
      width: COL_LAST,
      fontSize: 13,
      textAlign: 'right',
      paddingHorizontal: 4,
    },
    cellLastFlex: {
      width: undefined,
      flex: 2,
    },
    headerCellFirst: { flex: 1, textAlign: 'left' },
    headerCellMid: { flex: 2, textAlign: 'right' },
    headerCellLast: { flex: 2, textAlign: 'right' },
    hint: {
      fontSize: 11,
      textAlign: 'center',
      paddingVertical: 7,
      borderTopWidth: StyleSheet.hairlineWidth,
      backgroundColor: c.surfaceContainer,
    },
  });
}
