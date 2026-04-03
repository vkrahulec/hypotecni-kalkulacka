import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Polygon, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { Colors, ThemeColors } from '../constants/colors';
import { YearlyAmortizationRow } from '../utils/calculator';
import { useScheme } from '../context/ThemeContext';

function describeDonutSegment(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number
): string {
  function polar(r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  const os = polar(outerR, startAngle);
  const oe = polar(outerR, endAngle);
  const ie = polar(innerR, endAngle);
  const is_ = polar(innerR, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is_.x} ${is_.y}`,
    'Z',
  ].join(' ');
}

function StackedAreaChart({ data, svgWidth, svgHeight, plotHeight, yAxisWidth, colors, textColor, borderColor }: {
  data: { year: number; principal: number; interest: number }[];
  svgWidth: number; svgHeight: number; plotHeight: number; yAxisWidth: number;
  colors: { principal: string; interest: string }; textColor: string; borderColor: string;
}) {
  const n = data.length;
  if (n === 0) return null;
  const plotWidth = svgWidth - yAxisWidth;
  const maxVal = Math.max(...data.map((d) => d.principal + d.interest), 1);
  const xScale = (i: number) => yAxisWidth + (n > 1 ? (i / (n - 1)) * plotWidth : plotWidth / 2);
  const yScale = (v: number) => plotHeight - (v / maxVal) * plotHeight;

  const principalPts = [
    ...data.map((d, i) => `${xScale(i)},${yScale(d.principal)}`),
    `${xScale(n - 1)},${plotHeight}`, `${xScale(0)},${plotHeight}`,
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

function LineAreaChart({ data, svgWidth, svgHeight, plotHeight, yAxisWidth, color, textColor, borderColor }: {
  data: { year: number; value: number }[];
  svgWidth: number; svgHeight: number; plotHeight: number; yAxisWidth: number;
  color: string; textColor: string; borderColor: string;
}) {
  const n = data.length;
  if (n === 0) return null;
  const plotWidth = svgWidth - yAxisWidth;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const xScale = (i: number) => yAxisWidth + (n > 1 ? (i / (n - 1)) * plotWidth : plotWidth / 2);
  const yScale = (v: number) => plotHeight - (v / maxVal) * plotHeight;

  const linePts = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');
  const areaPts = [
    ...data.map((d, i) => `${xScale(i)},${yScale(d.value)}`),
    `${xScale(n - 1)},${plotHeight}`, `${xScale(0)},${plotHeight}`,
  ].join(' ');

  const gridValues = [0.25, 0.5, 0.75, 1].map((p) => ({ v: maxVal * p, y: yScale(maxVal * p) }));
  const xLabels = data.filter((d, i) => d.year % 5 === 0 || i === 0 || i === n - 1);

  return (
    <Svg width={svgWidth} height={svgHeight}>
      {gridValues.map(({ y }, i) => (
        <SvgLine key={i} x1={yAxisWidth} y1={y} x2={svgWidth} y2={y} stroke={borderColor} strokeWidth={0.5} />
      ))}
      <Polygon points={areaPts} fill={color} opacity={0.15} />
      <Path d={`M ${linePts.replace(/ /g, ' L ')}`} fill="none" stroke={color} strokeWidth={2} />
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
  const svgWidth = Math.min(Dimensions.get('window').width - 64, 736);
  const svgPlotH = 180;
  const svgH = svgPlotH + 18;

  const areaData = yearly.map((r) => ({ year: r.year, principal: r.totalPrincipal, interest: r.totalInterest }));
  const totalPrincipal = yearly.reduce((s, r) => s + r.totalPrincipal, 0);
  const totalInterest = yearly.reduce((s, r) => s + r.totalInterest, 0);
  const total = totalPrincipal + totalInterest;
  const principalAngle = (totalPrincipal / total) * 360;
  // Clamp to avoid degenerate arcs
  const pAngle = Math.min(Math.max(principalAngle, 1), 359);
  const cx = 90, cy = 90, outerR = 75, innerR = 46;

  return (
    <View>
      {/* Line/area chart: remaining balance */}
      <View style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: c.textSecondary }]}>Vývoj zůstatku úvěru</Text>
        <LineAreaChart
          data={yearly.map((r) => ({ year: r.year, value: r.remainingBalance }))}
          svgWidth={svgWidth}
          svgHeight={svgH}
          plotHeight={svgPlotH}
          yAxisWidth={yAxisWidth}
          color={c.chartPrimary}
          textColor={c.textSecondary}
          borderColor={c.border}
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
          svgWidth={svgWidth}
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
          <Svg width={180} height={180} viewBox="0 0 180 180">
            <Path
              d={describeDonutSegment(cx, cy, outerR, innerR, 0, pAngle)}
              fill={c.chartPrincipal}
            />
            <Path
              d={describeDonutSegment(cx, cy, outerR, innerR, pAngle, 360)}
              fill={c.chartInterest}
            />
            <SvgText
              x={cx} y={cy - 6}
              textAnchor="middle"
              fill={c.textMuted}
              fontSize={10}
            >
              celkem
            </SvgText>
            <SvgText
              x={cx} y={cy + 10}
              textAnchor="middle"
              fill={c.text}
              fontSize={12}
              fontWeight="bold"
            >
              {`${Math.round(total / 1000)} tis.`}
            </SvgText>
          </Svg>
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
