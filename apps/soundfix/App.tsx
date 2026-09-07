import './global.css';

import { StatusBar, StatusBarProps } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { queryClient } from './queryClient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useEffect, useState } from 'react';
import TrackPlayer from '@rntp/player';

export default function App() {
  const [isReady, setIsReady] = useState(false);

useEffect(() => {
    try {
      TrackPlayer.setupPlayer({
        contentType: 'music',
       // handleAudioBecomingNoisy: true,
        cache: {},
        // progressSync: {
        //   intervalSeconds: 5,
        //   http: {
        //     url: 'http://localhost:3333/progress',
        //   },
        // },
        android: {
          wakeMode: 'network',
          // skipSilenceEnabled: false,
          // cast: DEFAULT_CAST_RECEIVER_APP_ID,
        },
      });
      setIsReady(true);
    } catch (error) {
      if ((error as Error).message?.includes('already set up')) {
        setIsReady(true);
      } else {
        console.error('Failed to setup player:', error);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          barStyle="light-content"
          {...({ backgroundColor: '#0f172a' } as StatusBarProps)}
        />
        <GestureHandlerRootView>
          <RootNavigator />
          <Toast />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
