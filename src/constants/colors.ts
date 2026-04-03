export const Colors = {
  light: {
    background: '#F3F4FB',
    surface: '#FFFFFF',
    surfaceSecondary: '#EEF0F9',
    surfaceContainer: '#EEF0F9',
    surfaceVariant: '#E2E3EE',
    primary: '#1654CC',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DAE2FF',
    primaryLight: '#DAE2FF',
    accent: '#0274D6',
    text: '#1A1B25',
    textSecondary: '#44464E',
    textMuted: '#75777F',
    border: '#C4C6D0',
    borderFocus: '#1654CC',
    success: '#1B6832',
    warning: '#7A5900',
    error: '#BA1A1A',
    errorLight: '#FFDAD6',
    warningLight: '#FFF3CD',
    chartPrimary: '#1654CC',
    chartSecondary: '#0274D6',
    chartInterest: '#DC6803',
    chartPrincipal: '#1B6832',
    shadow: 'rgba(27,27,31,0.10)',
    adBackground: '#F0F2FA',
  },
  dark: {
    background: '#121318',
    surface: '#1C1D27',
    surfaceSecondary: '#262735',
    surfaceContainer: '#262735',
    surfaceVariant: '#2D2E3E',
    primary: '#ADC6FF',
    onPrimary: '#002E6E',
    primaryContainer: '#004498',
    primaryLight: '#004498',
    accent: '#38BDF8',
    text: '#E3E2EC',
    textSecondary: '#C4C6D0',
    textMuted: '#8E9099',
    border: '#44464F',
    borderFocus: '#ADC6FF',
    success: '#6EDA8D',
    warning: '#FFB300',
    error: '#FFB4AB',
    errorLight: '#2D1B1B',
    warningLight: '#2A2000',
    chartPrimary: '#ADC6FF',
    chartSecondary: '#38BDF8',
    chartInterest: '#FFB300',
    chartPrincipal: '#6EDA8D',
    shadow: 'rgba(0,0,0,0.45)',
    adBackground: '#181921',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceContainer: string;
  surfaceVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  primaryLight: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  success: string;
  warning: string;
  error: string;
  errorLight: string;
  warningLight: string;
  chartPrimary: string;
  chartSecondary: string;
  chartInterest: string;
  chartPrincipal: string;
  shadow: string;
  adBackground: string;
};
