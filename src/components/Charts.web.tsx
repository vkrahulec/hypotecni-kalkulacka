import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
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

interface ChartsProps {
  yearly: YearlyAmortizationRow[];
}

export function Charts({ yearly }: ChartsProps) {
  const c = Colors[useScheme()];
  const styles = makeStyles(c);

  const maxBalance = Math.max(...yearly.map((r) => r.remainingBalance), 1);
  const maxTotal = Math.max(...yearly.map((r) => r.totalPrincipal + r.totalInterest), 1);

  const totalPrincipal = yearly.reduce((s, r) => s + r.totalPrincipal, 0);
  const totalInterest = yearly.reduce((s, r) => s + r.totalInterest, 0);
  const total = totalPrincipal + totalInterest;
  const principalAngle = (totalPrincipal / total) * 360;
  // Clamp to avoid degenerate arcs
  const pAngle = Math.min(Math.max(principalAngle, 1), 359);
  const cx = 90, cy = 90, outerR = 75, innerR = 46;

  return (
    <View>
      {/* Line chart: remaining balance */}
      <View style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: c.textSecondary }]}>Vývoj zůstatku úvěru</Text>
        <View style={styles.webChart}>
          {yearly.map((r) => (
            <View key={r.year} style={styles.webBarWrapper}>
              <View
                style={[
                  styles.webBar,
                  {
                    height: Math.max(2, (r.remainingBalance / maxBalance) * 120),
                    backgroundColor: c.chartPrimary,
                    opacity: 0.85,
                  },
                ]}
              />
              {(r.year % 5 === 0 || r.year === yearly[yearly.length - 1]?.year) && (
                <Text style={[styles.webBarLabel, { color: c.textSecondary }]}>{r.year}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Stacked bar chart: principal vs interest */}
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
        <View style={styles.webChart}>
          {yearly.map((r) => {
            const total = r.totalPrincipal + r.totalInterest;
            const totalH = (total / maxTotal) * 120;
            const principalH = (r.totalPrincipal / total) * totalH;
            const interestH = totalH - principalH;
            return (
              <View key={r.year} style={[styles.webBarWrapper, { justifyContent: 'flex-end' }]}>
                <View style={{ height: interestH, width: '80%', backgroundColor: c.chartInterest, opacity: 0.85 }} />
                <View style={{ height: principalH, width: '80%', backgroundColor: c.chartPrincipal, opacity: 0.85 }} />
                {(r.year % 5 === 0 || r.year === yearly[yearly.length - 1]?.year) && (
                  <Text style={[styles.webBarLabel, { color: c.textSecondary }]}>{r.year}</Text>
                )}
              </View>
            );
          })}
        </View>
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
    webChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 140,
      paddingHorizontal: 4,
    },
    webBarWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginHorizontal: 1,
    },
    webBar: {
      width: '80%',
      borderRadius: 3,
    },
    webBarLabel: {
      fontSize: 9,
      marginTop: 4,
    },
  });
}
