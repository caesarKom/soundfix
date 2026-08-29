import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { usePlayerStore } from '../../store/usePlayerStore';

export const MiniPlayer = () => {
  const { currentTrack, isPlaying, setPlaying } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  return (
    <View className="mx-3 mb-2 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex-row items-center justify-between shadow-lg">
      <View className="flex-row items-center flex-1 mr-3">
        <View className="w-10 h-10 bg-sky-500 rounded-lg items-center justify-center mr-3">
          <Text className="text-lg">🎶</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text className="text-slate-400 text-xs" numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => setPlaying(!isPlaying)}
        className="w-10 h-10 bg-sky-500 rounded-full items-center justify-center active:bg-sky-600"
      >
        <Text className="text-white font-bold text-sm">
          {isPlaying ? '⏸' : '▶'}
        </Text>
      </Pressable>
    </View>
  );
};