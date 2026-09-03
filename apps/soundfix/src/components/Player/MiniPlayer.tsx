import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { MEDIA_URL } from '../../config/env';
import { useProgress } from '@rntp/player';
import LinearGradient from 'react-native-linear-gradient';
import {MovingText} from '../MovingText';
import { PlayButton } from './PlayButton';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

type Props = {
  onTap: () => void;
};

export const MiniPlayer = ({ onTap }: Props) => {
  const [colors, setColors] = useState(['#666', '#666']);
  const { currentTrack } = usePlayerStore();
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

  const pan = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationY < -50) {
        runOnJS(onTap)();
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)();
  });
  const gesture = Gesture.Race(pan, tap);

  return (

    <View style={{ flex: 1, flexDirection: 'row' }}>
       <GestureDetector gesture={gesture}>
      <View style={{ flexGrow: 1 }}>
        <LinearGradient colors={colors} style={s.container} >
          <View style={s.flexRowBetween}>
              
            <View style={s.flexRow}>
          <Image
            source={{ uri: `${MEDIA_URL}/${currentTrack.coverUrl}` || 'https://via.placeholder.com/150' }}
            style={s.img}
           />
           <View style={{ width: '68%' }}>
            <MovingText text={currentTrack.title} style={{ fontWeight: 'bold', fontSize: 16}} />

            <Text numberOfLines={1} style={{paddingHorizontal: 6, opacity: 5}}>{currentTrack.artist}</Text>
           </View>
            </View>
          </View>

          <View style={s.progressContainer}>
            <View style={s.progressBackground}>
              <View
                style={[s.progressBar, { width: calculateProgressWidth() }]}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </GestureDetector>
      <View style={s.playButton}>
         <PlayButton />
 </View>
    </View>
 
     
       
  );
};

const s = StyleSheet.create({
  container: {
    paddingTop: 4,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    overflow: 'hidden',
    width: '100%',
  },
  img: {
    borderRadius: 5,
    width: 45,
    height: 45,
    resizeMode: 'cover',
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressContainer: {
    height: 2,
    width: '100%',
    marginTop: 5,
  },
  progressBackground: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#fff',
  },
  playButton: {
    position: 'absolute',
    right: 10,
    top: 18,
    transform: [{ translateY: -15 }],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
});