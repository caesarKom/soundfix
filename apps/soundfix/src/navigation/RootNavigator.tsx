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

const RootNavigator = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);

  const { isLoading: isMeLoading } = useMe();

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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {accessToken ? (
          <Stack.Screen name="App" component={AppDrawerNavigator} />
        ) : (
  
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator