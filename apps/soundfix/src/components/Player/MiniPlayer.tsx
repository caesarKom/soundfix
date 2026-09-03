import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { MEDIA_URL } from '../../config/env';
import { useIsPlaying, useProgress } from '@rntp/player';

export const MiniPlayer = () => {
  const { setIsExpanded, play, pause, currentTrack } = usePlayerStore();
  const isPlaying = useIsPlaying()
    const { position, duration } = useProgress();

  if (!currentTrack) {
    return null;
  }

  const isVideo = currentTrack.mimeType?.startsWith('video/');

   const calculateProgressWidth: any = () => {
    if (duration > 0) {
      const procentage = (position / duration) * 100;
      return `${procentage}%`;
    }
    return '0%';
  };

  return (
   
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setIsExpanded(true)}
      className="absolute bottom-[125px] left-2 right-2 h-14 bg-neutral-900/95 rounded-md flex-row items-center px-3 border border-neutral-800 shadow-lg"
    >

   <View className="w-10 h-10 rounded bg-neutral-800 overflow-hidden mr-3 justify-center items-center">
        {isVideo ? (
          <View className="bg-neutral-800 w-full h-full justify-center items-center">
            <Icon name="videocam" size={18} color="#1DB954" />
          </View>
        ) : (
          <Image
            source={{ uri: `${MEDIA_URL}/${currentTrack.coverUrl}` || 'https://via.placeholder.com/150' }}
            className="w-full h-full resize-cover"
          />
        )}
      </View>
    
{/* Info artist */}
      <View className="flex-1 justify-center">
        <Text className="text-white font-semibold text-xs" numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text className="text-neutral-400 text-[11px]" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      <TouchableOpacity onPress={() => {isPlaying ? pause() : play()}} className="p-2">
        <Icon
          name={isPlaying ? 'pause-sharp' : 'play-sharp'}
          size={22}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      <View className='absolute bottom-0 left-2 right-2 h-[3px] w-full'>
            <View className='h-[3px] bg-white/25'>
              <View
                style={[{height: 3, backgroundColor:'#fff', width: calculateProgressWidth() }]}
              />
            </View>
          </View>
     </TouchableOpacity>
     
       
  );
};