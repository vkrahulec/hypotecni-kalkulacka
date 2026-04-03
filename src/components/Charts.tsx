import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { Colors, ThemeColors } from '../constants/colors';
import { YearlyAmortizationRow } from '../utils/calculator';
import { useScheme } from '../context/ThemeContext';

// Native-only Charts (Android / iOS).
// On web the bundler picks Charts.web.tsx — this file is never bundled for web.

interface ChartsProps {
  yearly: YearlyAmortizationRow[];
}

export function Charts({ yearly }: ChartsProps) {
  const c = Colors[useScheme()];
  const styles = makeStyles(c);
  const yAxisWidth = 52;
  const chartWidth = Math.min(Dimensions.get('window').width - 60, 700) - yAxisWidth;

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

  const totalPrincipal = useMemo(() => yearly.reduce((s, r) => s + r.totalPrincipal, 0), [yearly]);
  const totalInterest = useMemo(() => yearly.reduce((s, r) => s + r.totalInterest, 0), [yearly]);
  const total = totalPrincipal + totalInterest;

  const pieData = useMemo(
    () => [
      { value: Math.round(totalPrincipal), color: c.chartPrincipal },
      { value: Math.round(totalInterest), color: c.chartInterest },
    ],
    [totalPrincipal, totalInterest, c]
  );

  const stackData = useMemo(
    () =>
      yearly.map((r) => ({
        stacks: [
          { value: Math.round(r.totalPrincipal), color: c.chartPrincipal },
          { value: Math.round(r.totalInterest), color: c.chartInterest },
        ],
        label:
          r.year % 5 === 0 || r.year === 1 || r.year === yearly[yearly.length - 1]?.year
            ? String(r.year)
            : '',
      })),
    [yearly, c]
  );

  return (
    <View>
      {/* Line chart: remaining balance over time */}
      <View style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: c.textSecondary }]}>Vývoj zůstatku úvěru</Text>
        <LineChart
          data={lineData}
          width={chartWidth}
          height={180}
          yAxisLabelWidth={yAxisWidth}
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
          backgroundColor={c.surfaceContainer}
          rulesColor={c.border}
          rulesType="solid"
          initialSpacing={10}
          textColor={c.textSecondary}
          textFontSize={10}
          formatYLabel={(v: string) => `${Math.round(Number(v) / 1000)} tis.`}
        />
      </View>

      {/* Stacked bar chart: principal vs interest per year */}
      <View style={[styles.chartCard, { marginTop: 8 }]}>
        <Text style={[styles.chartTitle, { color: c.textSecondary }]}>Jistina vs. úrok ročně</Text>
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
          yAxisLabelWidth={yAxisWidth}
          barWidth={Math.max(8, Math.floor((chartWidth / yearly.length) * 0.6))}
          xAxisColor={c.border}
          yAxisColor={c.border}
          yAxisTextStyle={{ color: c.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: c.textSecondary, fontSize: 10 }}
          noOfSections={4}
          backgroundColor={c.surfaceContainer}
          rulesColor={c.border}
          rulesType="solid"
          initialSpacing={10}
          barBorderRadius={2}
          labelsExtraHeight={16}
          formatYLabel={(v: string) => `${Math.round(Number(v) / 1000)} tis.`}
        />
      </View>
      {/* Pie chart: principal vs interest totals */}
      <View style={[styles.chartCard, { marginTop: 8 }]}>
        <Text style={[styles.chartTitle, { color: c.textSecondary }]}>Rozložení celkových plateb</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: c.chartPrincipal }]} />
            <Text style={[styles.legendText, { color: c.textSecondary }]}>
              Jistina — {Math.round((totalPrincipal / total) * 100)} %
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: c.chartInterest }]} />
            <Text style={[styles.legendText, { color: c.textSecondary }]}>
              Úrok — {Math.round((totalInterest / total) * 100)} %
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <PieChart
            donut
            data={pieData}
            radius={90}
            innerRadius={55}
            innerCircleColor={c.surfaceContainer}
            centerLabelComponent={() => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.textMuted, fontSize: 9 }}>celkem</Text>
                <Text style={{ color: c.text, fontSize: 11, fontWeight: '700' }}>
                  {`${Math.round(total / 1000)} tis.`}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    chartCard: {
      backgroundColor: c.surfaceContainer,
      borderRadius: 16,
      padding: 16,
      overflow: 'hidden',
    },
    chartTitle: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.1,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    legend: {
      flexDirection: 'row',
      marginBottom: 10,
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
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });
}
