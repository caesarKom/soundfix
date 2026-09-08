import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Icon from '../Icon';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Track, usePlayerStore } from '../../store/usePlayerStore';
import { runOnJS } from 'react-native-reanimated';
import { MEDIA_URL } from '../../config/env';
import { noSongImg } from '../../utils/images';
import { useProgress } from '@rntp/player';
import { usePlayerColors } from './usePlayerColors';
import LinearGradient from 'react-native-linear-gradient';
import { MovingText } from '../MovingText';
import { fontR, FONTS } from '../../utils/constants';
import CustomText from '../CustomText';
import { PlayButton } from './PlayButton';

type Props = {
  onTap: () => void;
  isPlaying: boolean;
  track: Track | null;
};

export const MiniPlayer = ({onTap, isPlaying, track}:Props) => {
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const { duration, position } = useProgress()


  const progressPercent = duration > 0 ? Math.min(position / duration, 1) * 100 : 0;

  const pan = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationY < -50) {
        runOnJS(onTap)();
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)();
  });

  
  const togglePlayback = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const gesture = Gesture.Race(pan, tap);

  const backgroundColor = usePlayerColors(track?.coverUrl);

  if (!track) return null;

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
  <GestureDetector gesture={gesture}>
      <View style={{ flex: 1 }}>
        <LinearGradient colors={[backgroundColor, 'rgba(0,0,0,0.9)']} style={styles.container}>
          <View style={styles.flexRowBetween}>
            <View style={styles.flexRow}>
              <Image
                source={{ uri: `${MEDIA_URL}/${track.coverUrl}` || noSongImg }}
                style={styles.img}
              />
              <View style={{ width: '68%' }}>
                <MovingText
                style={styles.title}
                  text={track.title}
                />
                <CustomText
                  fontFamily={FONTS.Medium}
                  numberOfLines={1}
                  fontSize={fontR(6)}
                  style={{ opacity: 0.8, paddingLeft: 4 }}>
                  {track.artist}
                </CustomText>
              </View>
            </View>

            <View style={styles.flexRow}>
              <Icon
                name="broadcast-on-home"
                iconFamily="MaterialIcons"
                color="#ccc"
                size={fontR(20)}
              />
            </View>
             
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressBar, { width: progressPercent }]}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </GestureDetector>
  <View style={styles.playButton}>
         <PlayButton />
 </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
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
    gap: 6,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    height: 2,
    width: '100%',
    marginTop: 5,
  },
  progressBackground: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'green',
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