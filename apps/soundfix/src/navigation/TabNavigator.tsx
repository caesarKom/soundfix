import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { MiniPlayer } from '../components/Player/MiniPlayer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  LibraryTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// --- Render functions for icons (returns JSX.Element directly to comply with React 19 & RN Nav v7) ---
const renderHomeIcon = ({ color, size }: { focused: boolean; color: string; size: number }) => (
  <Ionicons name="home-outline" size={size} color={color} />
);

const renderSearchIcon = ({ color, size }: { focused: boolean; color: string; size: number }) => (
  <Ionicons name="search-outline" size={size} color={color} />
);

const renderLibraryIcon = ({ color, size }: { focused: boolean; color: string; size: number }) => (
  <Ionicons name="library-outline" size={size} color={color} />
);


export const TabNavigator = () => {
    const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-slate-950">
        <MiniPlayer />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0f172a',
            borderTopColor: '#1e293b',
            height: 60,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#94a3b8',
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: renderHomeIcon,
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: renderSearchIcon,
          }}
        />
        <Tab.Screen
          name="LibraryTab"
          component={LibraryScreen}
          options={{
            tabBarLabel: 'Library',
            tabBarIcon: renderLibraryIcon,
          }}
        />
      </Tab.Navigator>


      
    </View>
  );
};