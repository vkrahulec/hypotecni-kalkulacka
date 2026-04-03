import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';
import { YearlyAmortizationRow } from '../utils/calculator';
import { useScheme } from '../context/ThemeContext';

interface ChartsProps {
  yearly: YearlyAmortizationRow[];
}

export function Charts({ yearly }: ChartsProps) {
  const c = Colors[useScheme()];
  const styles = makeStyles(c);

  const maxBalance = Math.max(...yearly.map((r) => r.remainingBalance), 1);
  const maxTotal = Math.max(...yearly.map((r) => r.totalPrincipal + r.totalInterest), 1);

  return (
    <View>
      {/* Line chart: remaining balance */}
      <View style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: c.text }]}>Vývoj zůstatku úvěru</Text>
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
      borderRadius: 2,
    },
    webBarLabel: {
      fontSize: 9,
      marginTop: 3,
    },
  });
}
