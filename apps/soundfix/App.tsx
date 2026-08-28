import './global.css';
import React, { useEffect, useState } from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from './src/store/useAuthStore';
import { SplashScreen } from './src/screens/SplashScreen';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    // Perform initial authentication status check during splash screen
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (isSplashVisible) {
    return (
      <SafeAreaProvider>
        <StatusBar 
  barStyle="light-content" 
  {...({ backgroundColor: '#0f172a' } as StatusBarProps)} 
/>
        <SplashScreen onFinish={() => setIsSplashVisible(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar 
  barStyle="light-content" 
  {...({ backgroundColor: '#0f172a' } as StatusBarProps)} 
/>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}