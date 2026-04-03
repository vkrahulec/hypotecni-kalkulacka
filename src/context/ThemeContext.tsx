import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeOverride = 'system' | 'light' | 'dark';
export type Scheme = 'light' | 'dark';

interface ThemeContextValue {
  themeOverride: ThemeOverride;
  setThemeOverride: (t: ThemeOverride) => void;
  scheme: Scheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeOverride: 'system',
  setThemeOverride: () => {},
  scheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [themeOverride, setThemeOverride] = useState<ThemeOverride>('system');
  const scheme: Scheme = themeOverride === 'system' ? systemScheme : themeOverride;

  return (
    <ThemeContext.Provider value={{ themeOverride, setThemeOverride, scheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useScheme(): Scheme {
  return useContext(ThemeContext).scheme;
}

export function useThemeOverride() {
  const { themeOverride, setThemeOverride } = useContext(ThemeContext);
  return { themeOverride, setThemeOverride };
}
