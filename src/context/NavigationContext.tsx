import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface NavigationContextValue {
  route: string;
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  route: '/',
  navigate: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  function navigate(path: string) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo(0, 0);
    }
    setRoute(path);
  }

  return (
    <NavigationContext.Provider value={{ route, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
