import { Platform } from 'react-native';

// Google AdMob
export const ADMOB_BANNER_UNIT_ID =
  Platform.OS === 'android'
    ? 'ca-app-pub-7234855145203844/8365222167' // Production Android banner
    : 'ca-app-pub-3940256099942544/2934735716'; // Google test banner iOS ID (no iOS target)

// AdSense (web) — replace with your publisher ID and ad slot
export const ADSENSE_PUBLISHER_ID = 'ca-pub-7234855145203844';
export const ADSENSE_AD_SLOT = 'XXXXXXXXXX';

export const FIXATION_OPTIONS = [1, 2, 3, 5, 7, 10, 15, 20] as const;
export type FixationYear = (typeof FIXATION_OPTIONS)[number];

export const MIN_REPAYMENT_YEARS = 5;
export const MAX_REPAYMENT_YEARS = 40;

export const LTV_WARNING_THRESHOLD = 80;
export const LTV_MAX_THRESHOLD = 90;
