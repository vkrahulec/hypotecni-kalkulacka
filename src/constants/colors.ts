export const Colors = {
  light: {
    background: '#F5F6FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0F2F8',
    primary: '#1A56DB',
    primaryLight: '#EBF5FF',
    accent: '#0EA5E9',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderFocus: '#1A56DB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    warningLight: '#FFFBEB',
    chartPrimary: '#1A56DB',
    chartSecondary: '#0EA5E9',
    chartInterest: '#F59E0B',
    chartPrincipal: '#10B981',
    shadow: 'rgba(0,0,0,0.08)',
    adBackground: '#F9FAFB',
  },
  dark: {
    background: '#0F1117',
    surface: '#1C1F2E',
    surfaceSecondary: '#252836',
    primary: '#3B82F6',
    primaryLight: '#1E3A5F',
    accent: '#38BDF8',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#374151',
    borderFocus: '#3B82F6',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    errorLight: '#2D1B1B',
    warningLight: '#2D2410',
    chartPrimary: '#3B82F6',
    chartSecondary: '#38BDF8',
    chartInterest: '#FBBF24',
    chartPrincipal: '#34D399',
    shadow: 'rgba(0,0,0,0.4)',
    adBackground: '#161925',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  primary: string;
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
