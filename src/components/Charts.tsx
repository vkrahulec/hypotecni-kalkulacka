import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import Svg, { Polygon, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { Colors, ThemeColors } from '../constants/colors';
import { YearlyAmortizationRow } from '../utils/calculator';
import { useScheme } from '../context/ThemeContext';

// Native-only Charts (Android / iOS).
// On web the bundler picks Charts.web.tsx — this file is never bundled for web.

interface StackedAreaProps {
  data: { year: number; principal: number; interest: number }[];
  svgWidth: number;
  svgHeight: number;
  plotHeight: number;
  yAxisWidth: number;
  colors: { principal: string; interest: string };
  textColor: string;
  borderColor: string;
}

function StackedAreaChart({ data, svgWidth, svgHeight, plotHeight, yAxisWidth, colors, textColor, borderColor }: StackedAreaProps) {
  const n = data.length;
  if (n === 0) return null;
  const plotWidth = svgWidth - yAxisWidth;
  const maxVal = Math.max(...data.map((d) => d.principal + d.interest), 1);
  const xScale = (i: number) => yAxisWidth + (n > 1 ? (i / (n - 1)) * plotWidth : plotWidth / 2);
  const yScale = (v: number) => plotHeight - (v / maxVal) * plotHeight;

  const principalPts = [
    ...data.map((d, i) => `${xScale(i)},${yScale(d.principal)}`),
    `${xScale(n - 1)},${plotHeight}`,
    `${xScale(0)},${plotHeight}`,
  ].join(' ');

  const interestPts = [
    ...data.map((d, i) => `${xScale(i)},${yScale(d.principal + d.interest)}`),
    ...[...data].reverse().map((d, i) => `${xScale(n - 1 - i)},${yScale(d.principal)}`),
  ].join(' ');

  const gridValues = [0.25, 0.5, 0.75, 1].map((p) => ({ v: maxVal * p, y: yScale(maxVal * p) }));
  const xLabels = data.filter((d, i) => d.year % 5 === 0 || i === 0 || i === n - 1);

  return (
    <Svg width={svgWidth} height={svgHeight}>
      {gridValues.map(({ y }, i) => (
        <SvgLine key={i} x1={yAxisWidth} y1={y} x2={svgWidth} y2={y} stroke={borderColor} strokeWidth={0.5} />
      ))}
      <Polygon points={principalPts} fill={colors.principal} opacity={0.85} />
      <Polygon points={interestPts} fill={colors.interest} opacity={0.85} />
      <SvgLine x1={yAxisWidth} y1={plotHeight} x2={svgWidth} y2={plotHeight} stroke={borderColor} strokeWidth={1} />
      <SvgLine x1={yAxisWidth} y1={0} x2={yAxisWidth} y2={plotHeight} stroke={borderColor} strokeWidth={1} />
      {gridValues.map(({ v, y }) => (
        <SvgText key={v} x={yAxisWidth - 4} y={y + 4} textAnchor="end" fontSize={9} fill={textColor}>
          {`${Math.round(v / 1000)}k`}
        </SvgText>
      ))}
      {xLabels.map((d) => {
        const i = data.indexOf(d);
        return (
          <SvgText key={d.year} x={xScale(i)} y={plotHeight + 13} textAnchor="middle" fontSize={9} fill={textColor}>
            {String(d.year)}
          </SvgText>
        );
      })}
    </Svg>
  );
}

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

  const totalSvgWidth = chartWidth + yAxisWidth;
  const svgPlotH = 180;
  const svgH = svgPlotH + 18; // +18 for x-axis labels

  const areaData = useMemo(
    () => yearly.map((r) => ({ year: r.year, principal: r.totalPrincipal, interest: r.totalInterest })),
    [yearly]
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

      {/* Stacked area chart: principal vs interest per year */}
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
        <StackedAreaChart
          data={areaData}
          svgWidth={totalSvgWidth}
          svgHeight={svgH}
          plotHeight={svgPlotH}
          yAxisWidth={yAxisWidth}
          colors={{ principal: c.chartPrincipal, interest: c.chartInterest }}
          textColor={c.textSecondary}
          borderColor={c.border}
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
