import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore, Track } from '../store/usePlayerStore';

const DEMO_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight City Beats',
    artist: 'Neon Waves',
    duration: 210,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Deep Focus Flow',
    artist: 'Acoustic Mind',
    duration: 185,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
];

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const setTrack = usePlayerStore((state) => state.setTrack);
  const setPlaying = usePlayerStore((state) => state.setPlaying);

  const handlePlayTrack = (track: Track) => {
    setTrack(track);
    setPlaying(true);
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-slate-950 px-4">
      <Text className="text-3xl font-extrabold text-white my-4">Discover</Text>
      <Text className="text-xl font-extrabold text-green-500 my-4">Enjoi</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Text className="text-lg font-bold text-slate-300 mb-3">Featured Tracks</Text>
        
        {DEMO_TRACKS.map((track) => (
          <Pressable
            key={track.id}
            onPress={() => handlePlayTrack(track)}
            className="flex-row items-center bg-slate-900 p-4 rounded-xl mb-3 border border-slate-800 active:bg-slate-800"
          >
            <View className="w-12 h-12 bg-sky-500/20 rounded-lg items-center justify-center mr-4">
              <Text className="text-xl">🎵</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">{track.title}</Text>
              <Text className="text-slate-400 text-sm">{track.artist}</Text>
            </View>
            <Text className="text-sky-400 font-medium">Play</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};