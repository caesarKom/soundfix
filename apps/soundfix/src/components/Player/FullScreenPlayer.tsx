import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolation,
  withSpring,
  runOnJS,
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
import Header from './Header';

type Props = {
  onClose: () => void;
  expandProgress: SharedValue<number>;
};

export const FullScreenPlayer = ({ onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const currentTrack = usePlayerStore(s => s.currentTrack);
  const getCurrentTrackUrl = usePlayerStore(s => s.getCurrentTrackUrl);

  const { duration, position } = useProgress();
  const isPlaying = useIsPlaying();

  const imageUrl = `${MEDIA_URL}/${currentTrack?.coverUrl}` || noSongImg;
  const backgroundColor = usePlayerColors(imageUrl);

  const isVideoTrack = currentTrack?.mimeType?.startsWith('video/') ?? false;
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    if (isVideoTrack) {
      getCurrentTrackUrl().then(url => {
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
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const pan = Gesture.Pan()
    .minPointers(1)
    .activeOffsetY(45)
    .failOffsetY(-15)
    .onUpdate(event => {
      // Allow screen pulldown ONLY when ScrollView is at the very top
      if (event.translationY > 0 && scrollY.value <= 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(event => {
      if (event.translationY > 150 && scrollY.value <= 0) {
        translateY.value = withSpring(0);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  // internal ScrollView scrolling mechanism
  const nativeGesture = Gesture.Native();

  // both gestures can work simultaneously
  const combinedGesture = Gesture.Simultaneous(pan, nativeGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [0, 200],
      [1, 0.5],
      Extrapolation.CLAMP,
    ),
  }));

  if (!currentTrack) return null;

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.container}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[styles.container, { top: insets.top }, animatedStyle]}
        >
          <LinearGradient
            style={styles.gradient}
            colors={[backgroundColor, 'rgba(0,0,0,0.9)']}
          />

          <View style={styles.dragHandle}>
            <View style={styles.dragIndicator} />
          </View>
          {!isVideoTrack && <Header track={currentTrack} />}

          {isVideoTrack && videoUrl && videoUrl.trim() !== '' ? (
            <VideoBackground videoUri={videoUrl} />
          ) : (
            <>
              <LinearGradient
                colors={[backgroundColor, 'rgba(0,0,0,0.95)']}
                style={styles.gradient}
              />
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.img} />
              </View>
            </>
          )}

          <View style={styles.albumContainer} />

          <ControllsAndDetails
            track={currentTrack}
            isPlaying={isPlaying}
            position={position}
            duration={duration}
            colors={backgroundColor}
          />
        </Animated.View>
      </Animated.ScrollView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  dragIndicator: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 40,
  },
  albumContainer: {
    width: '95%',
    height: screenHeight * 0.6,
  },
  imageContainer: {
    position: 'absolute',
    width: screenWidth * 0.9,
    height: screenHeight * 0.42,
    overflow: 'hidden',
    borderRadius: 10,
    alignSelf: 'center',
    top: screenHeight * 0.2,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
