import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';

import { useAuthStore } from '../store/useAuthStore';
import { useMe } from '../hooks/useAuthHook';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { ProfileScreen } from '../screens/auth/ProfileScreen';
import { CustomDrawerContent } from './CustomDrawerContent';
import { SplashScreen } from '../screens/SplashScreen';
import { navigationRef } from './NavigationUtils';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalPlayer } from '../components/Player/GlobalPlayer';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const renderDrawerContent = (props: DrawerContentComponentProps) => (
  <CustomDrawerContent {...props} />
);

const AppDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: '#0f172a', // slate-900
          width: 300,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};

const MainStack = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {backgroundColor: ''}
      }}
      initialRouteName="App"
      >
        {accessToken ? (
          <Stack.Screen name="App" component={AppDrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
  )
}

const RootNavigator = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('HomeTab')
  
  const insets = useSafeAreaInsets();

  const { isLoading: isMeLoading } = useMe();

  const getActiveRouteName = (state: any) => {
    if (!state) return 'Splash'
    const route = state.routes[state.index];
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
  }

   const screensWithPlayer = ['HomeTab', 'SearchTab', 'LibraryTab']
   const shouldShowPlayer = screensWithPlayer.includes(currentRoute);

  useEffect(() => {
    // Hide splash screen after state check completed
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isInitializing && isMeLoading) {
    return <SplashScreen onFinish={() => setIsInitializing(false)} />;
  }

  return (
    <NavigationContainer ref={navigationRef} onStateChange={(state) => {
      const routeName = getActiveRouteName(state);
      setCurrentRoute(routeName);
    }}>
        <View style={{ flex: 1 }}>
          <MainStack />
          {shouldShowPlayer && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                elevation: 1000,
                paddingBottom: insets.bottom,
              }}
              pointerEvents='auto'
              >
            <GlobalPlayer />
              </View>
          )}
          </View>
   
  
    </NavigationContainer>
  );
};

export default RootNavigator