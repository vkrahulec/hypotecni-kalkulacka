import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { Colors, ThemeColors } from '../constants/colors';
import { YearlyAmortizationRow } from '../utils/calculator';

// Native-only Charts (Android / iOS).
// On web the bundler picks Charts.web.tsx — this file is never bundled for web.

interface ChartsProps {
  yearly: YearlyAmortizationRow[];
}

export function Charts({ yearly }: ChartsProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);
  const chartWidth = Math.min(Dimensions.get('window').width - 60, 700);

  const lineData = useMemo(
    () =>
      yearly.map((r) => ({
        value: r.remainingBalance,
        label: String(r.year),
        dataPointText:
          r.year % 5 === 0 || r.year === yearly[yearly.length - 1]?.year
            ? `${Math.round(r.remainingBalance / 1000)} tis.`
            : '',
      })),
    [yearly]
  );

  const stackData = useMemo(
    () =>
      yearly.map((r) => ({
        stacks: [
          { value: Math.round(r.totalPrincipal), color: c.chartPrincipal },
          { value: Math.round(r.totalInterest), color: c.chartInterest },
        ],
        label: String(r.year),
      })),
    [yearly, c]
  );

  return (
    <View>
      {/* Line chart: remaining balance over time */}
      <View style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: c.text }]}>Vývoj zůstatku úvěru</Text>
        <LineChart
          data={lineData}
          width={chartWidth}
          height={180}
          color={c.chartPrimary}
          thickness={2}
          startFillColor={c.chartPrimary}
          endFillColor={c.background}
          startOpacity={0.3}
          endOpacity={0.05}
          areaChart
          curved
          hideDataPoints={yearly.length > 20}
          dataPointsColor={c.chartPrimary}
          dataPointsRadius={3}
          xAxisColor={c.border}
          yAxisColor={c.border}
          yAxisTextStyle={{ color: c.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: c.textSecondary, fontSize: 10 }}
          noOfSections={4}
          backgroundColor={c.surface}
          rulesColor={c.border}
          rulesType="solid"
          initialSpacing={10}
          textColor={c.textSecondary}
          textFontSize={10}
          formatYLabel={(v: string) => `${Math.round(Number(v) / 1000)} tis.`}
        />
      </View>

      {/* Stacked bar chart: principal vs interest per year */}
      <View style={[styles.chartCard, { marginTop: 12 }]}>
        <Text style={[styles.chartTitle, { color: c.text }]}>Jistina vs. úrok ročně</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: c.chartPrincipal }]} />
            <Text style={[styles.legendText, { color: c.textSecondary }]}>Jistina</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: c.chartInterest }]} />
            <Text style={[styles.legendText, { color: c.textSecondary }]}>Úrok</Text>
          </View>
        </View>
        <BarChart
          stackData={stackData}
          width={chartWidth}
          height={180}
          barWidth={Math.max(8, Math.floor((chartWidth / yearly.length) * 0.6))}
          xAxisColor={c.border}
          yAxisColor={c.border}
          yAxisTextStyle={{ color: c.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: c.textSecondary, fontSize: 10 }}
          noOfSections={4}
          backgroundColor={c.surface}
          rulesColor={c.border}
          rulesType="solid"
          initialSpacing={10}
          barBorderRadius={2}
          formatYLabel={(v: string) => `${Math.round(Number(v) / 1000)} tis.`}
        />
      </View>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    chartCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 14,
      overflow: 'hidden',
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 12,
    },
    legend: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 4,
    },
    legendText: {
      fontSize: 12,
    },
  });
}
