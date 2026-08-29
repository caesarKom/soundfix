import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LibraryScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-slate-950 px-4">
      <Text className="text-3xl font-extrabold text-white my-4">Your Library</Text>
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-400 text-center">Your playlists and saved tracks will appear here.</Text>
      </View>
    </View>
  );
};