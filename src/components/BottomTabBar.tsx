import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

const TABS = [
  { label: 'Kalkulačka', path: '/' },
  { label: 'Nápověda', path: '/napoveda' },
];

function CalcIcon({ color }: { color: string }) {
  return (
    <View style={iconStyles.calcWrap}>
      <View style={iconStyles.calcGrid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[iconStyles.calcCell, { backgroundColor: color }]} />
        ))}
      </View>
    </View>
  );
}

function HelpIcon({ color }: { color: string }) {
  return (
    <View style={[iconStyles.helpCircle, { borderColor: color }]}>
      <Text style={[iconStyles.helpQ, { color }]}>?</Text>
    </View>
  );
}

export function BottomTabBar() {
  const c = Colors[useScheme()];
  const { route, navigate } = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const active = route === tab.path;
        const color = active ? c.primary : c.textMuted;
        return (
          <Pressable key={tab.path} onPress={() => navigate(tab.path)} style={styles.tab}>
            {active && <View style={[styles.indicator, { backgroundColor: c.primary }]} />}
            {tab.path === '/' ? <CalcIcon color={color} /> : <HelpIcon color={color} />}
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const iconStyles = StyleSheet.create({
  calcWrap: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  calcGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 18, height: 18, gap: 2 },
  calcCell: { width: 8, height: 8, borderRadius: 2 },
  helpCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  helpQ: { fontSize: 13, fontWeight: '800', lineHeight: 16 },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
