import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Colors } from '../constants/colors';
import { ADMOB_BANNER_UNIT_ID } from '../constants/config';
import { useScheme } from '../context/ThemeContext';

// Native-only AdBanner (Android / iOS).
// On web the bundler picks AdBanner.web.tsx instead — this file is never bundled for web.
export function AdBanner() {
  const c = Colors[useScheme()];

  return (
    <View style={[styles.container, { backgroundColor: c.adBackground }]}>
      <BannerAd
        unitId={ADMOB_BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
});
