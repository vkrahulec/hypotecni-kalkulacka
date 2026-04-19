import React from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useScheme } from './src/context/ThemeContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { ContactScreen } from './src/screens/ContactScreen';
import { MortgageTypesScreen } from './src/screens/MortgageTypesScreen';
import { ArticlesScreen } from './src/screens/ArticlesScreen';
import { HelpScreen } from './src/screens/HelpScreen';
import { BottomTabBar } from './src/components/BottomTabBar';

const BOTTOM_TAB_ROUTES = ['/', '/napoveda'];

function AppInner() {
  const scheme = useScheme();
  const { route } = useNavigation();

  let screen: React.ReactNode;
  if (route === '/privacy-policy') screen = <PrivacyPolicyScreen />;
  else if (route === '/o-aplikaci') screen = <AboutScreen />;
  else if (route === '/kontakt') screen = <ContactScreen />;
  else if (route === '/typy-hypotek') screen = <MortgageTypesScreen />;
  else if (route === '/clanky') screen = <ArticlesScreen />;
  else if (route === '/napoveda') screen = <HelpScreen />;
  else screen = <CalculatorScreen />;

  const showBottomTabs = Platform.OS !== 'web' && BOTTOM_TAB_ROUTES.includes(route);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>{screen}</View>
      {showBottomTabs && <BottomTabBar />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationProvider>
          <AppInner />
        </NavigationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
