import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-slate-900 justify-center items-center px-6"
    >
      <View className="bg-slate-800 p-6 rounded-2xl border border-slate-700 w-full items-center">
        <Text className="text-3xl font-bold text-sky-400 mb-2">
          Soundfix 🎧
        </Text>
        <Text className="text-slate-400 text-center mb-6">
          Wszystkie systemy działają! React 19 + RN 0.87 + NativeWind gotowe.
        </Text>

        <Pressable 
          className="bg-sky-500 active:bg-sky-600 px-6 py-3 rounded-xl w-full items-center"
          onPress={() => console.log('Przycisk działa!')}
        >
          <Text className="text-white font-semibold text-lg">
            Rozpocznij
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}