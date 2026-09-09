import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEDIA_URL } from '../config/env';
import { Track, usePlayerStore } from '../store/usePlayerStore';
import { noSongImg } from '../utils/images';
import { useMusicQuery, usePlaylistsQuery } from '../hooks/useMusicQueries';
import HeaderWithAvatarDrawer from '../components/HeaderWithAvatarDrawer';


export const HomeScreen = () => {
 const {currentTrack, playTrackFromLoadedQueue} = usePlayerStore()

  const { data: musicData, isLoading, isError, refetch, isRefetching } = useMusicQuery();
  const { data: playlistsData } = usePlaylistsQuery();

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
      <HeaderWithAvatarDrawer />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop:12, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} tintColor="#1DB954" onRefresh={() => { refetch(); }} />
        }
      >

        {/* 2-Column Quick Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {Array.isArray(musicData) && musicData.map((track: Track) => {
            const isSelected = currentTrack?.id === track.id;
            return (
              <TouchableOpacity
                key={track.id}
                activeOpacity={0.8}
        
                onPress={() => playTrackFromLoadedQueue(track.id)}
                className="w-[48.5%] h-14 bg-neutral-900/80 rounded-md flex-row items-center mb-2 overflow-hidden border border-neutral-800/50"
              >
                <Image
                  source={{
                    uri: track.coverUrl ? `${MEDIA_URL}/${track.coverUrl}` : noSongImg,
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
        {Array.isArray(playlistsData) && playlistsData.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-3">Featured Playlists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {playlistsData.map((playlist: any) => (
                <TouchableOpacity key={playlist.id} className="mr-4 w-36" activeOpacity={0.7}>
                  <Image
                    source={{
                      uri: playlist.coverUrl ? `${MEDIA_URL}/${playlist.coverUrl}` : noSongImg,
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
           
                onPress={() => playTrackFromLoadedQueue(track.id)}
                className="mr-4 w-36"
                activeOpacity={0.7}
              >
                <View className="relative">
                  <Image
                    source={{
                      uri: track.coverUrl ? `${MEDIA_URL}/${track.coverUrl}` : noSongImg,
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
