import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useScheme } from './src/context/ThemeContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { ContactScreen } from './src/screens/ContactScreen';

function AppInner() {
  const scheme = useScheme();
  const { route } = useNavigation();

  let screen: React.ReactNode;
  if (route === '/privacy-policy') screen = <PrivacyPolicyScreen />;
  else if (route === '/o-aplikaci') screen = <AboutScreen />;
  else if (route === '/kontakt') screen = <ContactScreen />;
  else screen = <CalculatorScreen />;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {screen}
    </>
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
