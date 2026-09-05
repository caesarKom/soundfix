import {
  Image,
  Platform,
  StatusBar,
  StatusBarProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import LinearGradient from 'react-native-linear-gradient';
import { useEffect, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { screenHeight, screenWidth } from '../../utils/constants';
import { MEDIA_URL } from '../../config/env';
import { usePlayerColors } from './usePlayerColors';
import VideoPlayer from './VideoPlayer';
import ControlsAndDetails from './ControlsAndDetails';
import { noSongImg } from '../../utils/images';

type Props = {
  onClose: () => void;
  expandProgress: SharedValue<number>;
  colors: any
};

const FullScreenPlayer = ({ onClose, colors }: Props) => {
  const translateY = useSharedValue(0);
  const { currentTrack, getCurrentTrackUrl } = usePlayerStore();
  const [videoSourceUrl, setVideoSourceUrl] = useState<string>('');

  const pan = usePanGesture({
    activeOffsetY: 10,
    failOffsetY: -10,

    onUpdate: event => {
      // Only down
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },

    onDeactivate: event => {
      if (event.translationY > 150) {
        translateY.value = withSpring(0);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [0, 200],
      [1, 0.5],
      Extrapolation.CLAMP,
    ),
  }));

  useEffect(() => {
    if (currentTrack?.mimeType?.includes('video/')) {
      getCurrentTrackUrl().then(url => {
        setVideoSourceUrl(url);
      });
    } else {
      setVideoSourceUrl('');
    }
  }, [currentTrack, getCurrentTrackUrl]);

  return (
    <GestureDetector gesture={pan}>
    <Animated.View style={[styles.container, animatedStyle]}>
      <StatusBar
        barStyle="light-content"
        {...({ backgroundColor: 'transparent' } as StatusBarProps)}
      />

      <LinearGradient
        style={styles.gradient}
        colors={[colors.primary, colors.secondary, 'rgba(0,0,0,0.9)']}
      />

      
        <View style={styles.dragHandle}>
          <View style={styles.dragIndicator} />
        </View>
      

      {currentTrack?.mimeType?.includes('audio/') ? (
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: currentTrack?.coverUrl
                ? `${MEDIA_URL}/${currentTrack.coverUrl}`
                : noSongImg,
            }}
            style={styles.img}
          />
        </View>
      ) : (
        <View>
          {videoSourceUrl !== '' ? (
            <VideoPlayer video_uri={videoSourceUrl} />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={{ color: '#fff' }}>Loading video stream...</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.albumContainer} />

      <ControlsAndDetails />
    </Animated.View>
    </GestureDetector>
  );
};

export default FullScreenPlayer;

const styles = StyleSheet.create({
  container: { flex: 1 },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  dragIndicator: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 70,
  },
  top: { alignItems: 'center', marginBottom: 24 },
  coverBig: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: 8,
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
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  albumContainer: {
    width: '95%',
    height: screenHeight * 0.52,
  },
  imageContainer: {
    position: 'absolute',
    width: screenWidth * 0.9,
    height: screenHeight * 0.42,
    overflow: 'hidden',
    borderRadius: 10,
    alignSelf: 'center',
    top: screenHeight * 0.14,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
