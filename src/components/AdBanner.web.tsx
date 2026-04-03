import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';

const AD_CLIENT = 'ca-pub-7234855145203844';
const AD_CONTAINER_ID = 'adsense-banner-container';

export function AdBanner() {
  const c = Colors[useScheme()];

  useEffect(() => {
    const container = document.getElementById(AD_CONTAINER_ID);
    if (!container || container.querySelector('ins')) return;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.cssText = 'display:block;width:100%;';
    ins.setAttribute('data-ad-client', AD_CLIENT);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    container.appendChild(ins);

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  return (
    <View
      nativeID={AD_CONTAINER_ID}
      style={[styles.container, { backgroundColor: c.adBackground, borderTopColor: c.border }]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 90,
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
