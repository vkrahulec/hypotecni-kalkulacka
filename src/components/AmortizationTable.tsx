import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { AmortizationRow, YearlyAmortizationRow } from '../utils/calculator';
import { formatCZK } from '../utils/formatting';

interface AmortizationTableProps {
  monthly: AmortizationRow[];
  yearly: YearlyAmortizationRow[];
}

type ViewMode = 'monthly' | 'yearly';

const ROW_HEIGHT = 40;

export function AmortizationTable({ monthly, yearly }: AmortizationTableProps) {
  const c = Colors[useScheme()];
  const [view, setView] = React.useState<ViewMode>('yearly');
  const styles = useMemo(() => makeStyles(c), [c]);

  const headers =
    view === 'monthly'
      ? ['Měs.', 'Splátka', 'Jistina', 'Úrok', 'Zůst.']
      : ['Rok', 'Celkem', 'Jistina', 'Úrok', 'Zůst.'];

  const renderMonthlyRow = useCallback(
    ({ item, index }: ListRenderItemInfo<AmortizationRow>) => (
      <View
        style={[
          styles.row,
          { borderBottomColor: c.border },
          index % 2 !== 0 && { backgroundColor: c.surfaceContainer },
        ]}
      >
        <Text style={[styles.cellFirst, { color: c.text }]}>{item.month}</Text>
        <Text style={[styles.cell, { color: c.text }]}>{formatCZK(item.payment)}</Text>
        <Text style={[styles.cell, { color: c.chartPrincipal }]}>{formatCZK(item.principal)}</Text>
        <Text style={[styles.cell, { color: c.chartInterest }]}>{formatCZK(item.interest)}</Text>
        <Text style={[styles.cell, { color: c.textSecondary }]}>{formatCZK(item.remainingBalance)}</Text>
      </View>
    ),
    [styles, c],
  );

  const renderYearlyRow = useCallback(
    ({ item, index }: ListRenderItemInfo<YearlyAmortizationRow>) => (
      <View
        style={[
          styles.row,
          { borderBottomColor: c.border },
          index % 2 !== 0 && { backgroundColor: c.surfaceContainer },
        ]}
      >
        <Text style={[styles.cellFirst, { color: c.text }]}>{item.year}</Text>
        <Text style={[styles.cell, { color: c.text }]}>{formatCZK(item.totalPayment)}</Text>
        <Text style={[styles.cell, { color: c.chartPrincipal }]}>{formatCZK(item.totalPrincipal)}</Text>
        <Text style={[styles.cell, { color: c.chartInterest }]}>{formatCZK(item.totalInterest)}</Text>
        <Text style={[styles.cell, { color: c.textSecondary }]}>{formatCZK(item.remainingBalance)}</Text>
      </View>
    ),
    [styles, c],
  );

  const monthlyKeyExtractor = useCallback((item: AmortizationRow) => String(item.month), []);
  const yearlyKeyExtractor = useCallback((item: YearlyAmortizationRow) => String(item.year), []);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
    [],
  );

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
      <View>
        {/* Header */}
        <View style={[styles.headerRow, { backgroundColor: c.surfaceContainer }]}>
          {headers.map((h, i) => (
            <Text
              key={h}
              numberOfLines={1}
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

        {/* Rows — FlatList virtualizes so only visible rows are rendered */}
        {view === 'monthly' ? (
          <FlatList
            data={monthly}
            renderItem={renderMonthlyRow}
            keyExtractor={monthlyKeyExtractor}
            getItemLayout={getItemLayout}
            style={styles.rowsList}
            nestedScrollEnabled
            initialNumToRender={12}
            maxToRenderPerBatch={20}
            windowSize={5}
            removeClippedSubviews
          />
        ) : (
          <FlatList
            data={yearly}
            renderItem={renderYearlyRow}
            keyExtractor={yearlyKeyExtractor}
            getItemLayout={getItemLayout}
            style={styles.rowsList}
            nestedScrollEnabled
            initialNumToRender={12}
            maxToRenderPerBatch={20}
            windowSize={5}
            removeClippedSubviews
          />
        )}
      </View>
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
    rowsList: {
      maxHeight: 340,
    },
    row: {
      flexDirection: 'row',
      paddingVertical: 9,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      height: ROW_HEIGHT,
    },
    colFirst: { flex: 1, textAlign: 'center' },
    colValue: { flex: 2, textAlign: 'right', paddingHorizontal: 4 },
    cellFirst: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    cell: {
      flex: 2,
      fontSize: 13,
      textAlign: 'right',
      paddingHorizontal: 4,
    },
  });
}
