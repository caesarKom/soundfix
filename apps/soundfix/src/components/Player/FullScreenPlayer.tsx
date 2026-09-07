import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolation,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ControllsAndDetails } from './ControlsAndDetails';
import { VideoBackground } from './VideoBackground';
import { MEDIA_URL } from '../../config/env';
import { noSongImg } from '../../utils/images';
import { useIsPlaying, useProgress } from '@rntp/player';
import { screenHeight, screenWidth } from '../../utils/constants';
import { usePlayerColors } from './usePlayerColors';
import { SharedValue } from 'react-native-gesture-handler/lib/typescript/v3/types';

type Props = {
  onClose: () => void;
  expandProgress: SharedValue<number>;
};

export const FullScreenPlayer = ({ onClose }:Props) => {
  const insets = useSafeAreaInsets();
const scrollViewRef = useRef(null);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const getCurrentTrackUrl = usePlayerStore((s) => s.getCurrentTrackUrl);
  
  const { duration, position } = useProgress()
  const isPlaying = useIsPlaying()
  
  const imageUrl = `${MEDIA_URL}/${currentTrack?.coverUrl}` || noSongImg
  const backgroundColor = usePlayerColors(imageUrl);
  
  const isVideoTrack = currentTrack?.mimeType?.startsWith('video/') ?? false;
  const [videoUrl, setVideoUrl] = useState<string>('');

useEffect(() => {
  let isMounted = true;

  if (isVideoTrack) {
  getCurrentTrackUrl().then((url) => {
    if (isMounted && url) {
      setVideoUrl(url);
    }
  });
 }
  return () => {
    isMounted = false;
  };
}, [isVideoTrack, currentTrack?.url, getCurrentTrackUrl]);

  const scrollY = useSharedValue(0);
  const translateY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

   const pan = Gesture.Pan()
  .activeOffsetY(10) // the gesture activates after 10px down
    .failOffsetY(-10) // lock gesture up
    .onUpdate((event) => {
  
      if (event.translationY > 0 && scrollY.value <= 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        translateY.value = withSpring(0);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [0, 200], [1, 0.5], Extrapolation.CLAMP),
  }));

  if (!currentTrack) return null;

  return (
      <Animated.View style={[styles.container, animatedStyle]}>
         <View style={StyleSheet.absoluteFill}>
        {isVideoTrack && videoUrl && videoUrl.trim() !== '' ? (
          <VideoBackground videoUri={videoUrl} />
        ) : (
          <>
            <LinearGradient
              colors={[backgroundColor, 'rgba(0,0,0,0.95)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.artworkWrapper}>
              <Image source={{ uri: imageUrl }} style={styles.artwork} />
            </View>
          </>
        )}
      </View>
         <GestureDetector gesture={Gesture.Simultaneous(pan, Gesture.Native())}>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="never"
        >
            {/* Artificial empty space pushing controls to the bottom of the screen (cover/video visible above it) */}
      <View style={{width: '95%', height: screenHeight*0.60}} />

          <ControllsAndDetails
            track={currentTrack}
            isPlaying={isPlaying}
            position={position}
            duration={duration}
          />

          <View style={styles.bottomIconsRow}>
            <View hitSlop={12}>
              <Icon name="phone-portrait-outline" size={20} color="rgba(255,255,255,0.7)" />
            </View>
            <View hitSlop={12}>
              <Icon name="list-outline" size={22} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

        </Animated.ScrollView>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
      container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000', // Gwarancja braku prześwitów na ekran Home
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  artworkWrapper: {

    width: screenWidth * 0.9,
    height: screenHeight * 0.42,
    overflow: 'hidden',
    borderRadius: 10,
    alignSelf: 'center',
    top: screenHeight * 0.14,
  },
  artwork: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 4,
  },
  gradient: {
    position: 'absolute',
    height: screenHeight + 200,
    width: screenWidth,
    zIndex: -3,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
