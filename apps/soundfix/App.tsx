import './global.css';

import { StatusBar, StatusBarProps } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { queryClient } from './queryClient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          barStyle="light-content"
          {...({ backgroundColor: '#0f172a' } as StatusBarProps)}
        />
        <GestureHandlerRootView>
          <RootNavigator />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
