import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SearchScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-slate-950 px-4">
      <Text className="text-3xl font-extrabold text-white my-4">Search</Text>
      
      <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex-row items-center mb-6">
        <Text className="mr-2 text-slate-400">🔍</Text>
        <TextInput
          placeholder="Search songs, artists, podcasts..."
          placeholderTextColor="#64748b"
          className="flex-1 text-white text-base"
        />
      </View>
    </View>
  );
};