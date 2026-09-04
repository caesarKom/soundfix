import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MEDIA_URL } from '../config/env';
import { useQuery } from '@tanstack/react-query';
import { Track, usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';


export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore.getState();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  
 const {currentTrack,setAllTracks,playTrackFromLoadedQueue} = usePlayerStore()


  const { data: musicData, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['music'],
    queryFn: async () => {
      const res = await api.get('/music');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
  });

   useEffect(() => {
    if (Array.isArray(musicData) && musicData.length > 0) {
      setAllTracks(musicData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicData?.length]);

  const { data: PlayListData } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const res = await api.get('/music/playlists');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
  });

  const avatarUrl = user?.profile?.avatar ? `${MEDIA_URL}/${user.profile.avatar}` : undefined;
  const userName = user?.name || user?.email || 'User';

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-950 items-center justify-center">
        <ActivityIndicator size="large" color="#1DB954" />
        <Text className="text-white mt-4">Loading music...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-950 items-center justify-center">
        <Text className="text-red-500 mb-4">Failed to load music</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-neutral-800 px-4 py-2 rounded-lg">
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} tintColor="#1DB954" onRefresh={() => { void refetch(); }} />
        }
      >
        <View className="flex-1 bg-slate-950" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center justify-between px-4 py-3">
            <Avatar
              imageUrl={avatarUrl}
              name={userName}
              size={36}
              onPress={() => navigation.openDrawer()}
            />
            <Text className="text-white font-bold text-xl">SoundFix</Text>
            <View className='w-16' />
          </View>
        </View>

        {/* 2-Column Quick Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {Array.isArray(musicData) && musicData.map((track: Track) => {
            const isSelected = currentTrack?.id === track.id;
            return (
              <TouchableOpacity
                key={track.id}
                activeOpacity={0.8}
        
                onPress={() => {
                  void playTrackFromLoadedQueue(track.id);
                }}
                className="w-[48.5%] h-14 bg-neutral-900/80 rounded-md flex-row items-center mb-2 overflow-hidden border border-neutral-800/50"
              >
                <Image
                  source={{
                    uri: track.coverUrl ? `${MEDIA_URL}/${track.coverUrl}` : 'https://via.placeholder.com/150',
                  }}
                  className="w-14 h-14 resize-cover"
                />
                <Text
                  className={`flex-1 text-xs font-semibold px-2 ${isSelected ? 'text-emerald-500' : 'text-white'}`}
                  numberOfLines={2}
                >
                  {track.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Featured Playlists */}
        {Array.isArray(PlayListData) && PlayListData.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-3">Featured Playlists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PlayListData.map((playlist: any) => (
                <TouchableOpacity key={playlist.id} className="mr-4 w-36" activeOpacity={0.7}>
                  <Image
                    source={{
                      uri: playlist.coverUrl ? `${MEDIA_URL}/${playlist.coverUrl}` : 'https://via.placeholder.com/300',
                    }}
                    className="w-36 h-36 rounded-md mb-2 bg-neutral-900"
                  />
                  <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text className="text-neutral-400 text-xs" numberOfLines={1}>
                    {playlist.description || 'Playlist'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Section */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-3">Trending Right Now</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.isArray(musicData) && musicData.map((track: Track) => (
              <TouchableOpacity
                key={track.id}
                // ✅ POPRAWKA 3: Tutaj również przekazujemy ID utworu
                onPress={() => {
                  void playTrackFromLoadedQueue(track.id);
                }}
                className="mr-4 w-36"
                activeOpacity={0.7}
              >
                <View className="relative">
                  <Image
                    source={{
                      uri: track.coverUrl ? `${MEDIA_URL}/${track.coverUrl}` : 'https://via.placeholder.com/300',
                    }}
                    className="w-36 h-36 rounded-md mb-2 bg-neutral-900"
                  />
                  {track.mimeType?.startsWith('video/') && (
                    <View className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded flex-row items-center">
                      <Icon name="videocam" size={12} color="#1DB954" />
                    </View>
                  )}
                </View>
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                  {track.title}
                </Text>
                <Text className="text-neutral-400 text-xs" numberOfLines={1}>
                  {track.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
   
    </SafeAreaView>
  );
 };
