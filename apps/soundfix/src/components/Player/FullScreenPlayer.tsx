import { Image, Platform, StatusBar, StatusBarProps, StyleSheet, Text, View } from 'react-native'
import Animated, { Extrapolation, interpolate, runOnJS, SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import LinearGradient from 'react-native-linear-gradient';
import { useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { screenHeight, screenWidth } from '../../utils/constants';
import { MEDIA_URL } from '../../config/env';

type Props = {
  onClose: () => void;
  expandProgress: SharedValue<number>;
};

const FullScreenPlayer = ({onClose}:Props) => {
    const [colors, setColors] = useState(['#666', '#666']);
     const translateY = useSharedValue(0);
  const contextY = useSharedValue(0);

  const currentTrack = usePlayerStore((state) => state.currentTrack);

const pan = usePanGesture({
  activeOffsetY: 10,
  failOffsetY: -10,

  onUpdate: (event) => {
    // Only down
    if (event.translationY > 0) {
      translateY.value = event.translationY;
    }
  },

  onDeactivate: (event) => {
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
    opacity: interpolate(translateY.value, [0, 200], [1, 0.5], Extrapolation.CLAMP),
  }));


  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
     
        <StatusBar barStyle="light-content" {...({ backgroundColor: 'transparent' } as StatusBarProps)} />
        <LinearGradient
        style={styles.gradient}
        colors={[...colors, 'rgba(0,0,0,0.9)']}
      />
        {/* Pasek do przeciągania */}
        <View style={styles.dragHandle}>
          <View style={styles.dragIndicator} />
        </View>

        {currentTrack?.mimeType?.includes("audio") ? (
          <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${MEDIA_URL}/${currentTrack?.coverUrl}` || "" }} 
            style={styles.img} 
          />
        </View>
        ) : (
          <View>
            {/* <VideoPlayer video_uri={currentTrack?.url} /> */}
            <Text>VideoPlayer video_uri={currentTrack?.url}</Text>
          </View>
        )}
        

        <View style={styles.albumContainer} />

        {/* Sterowanie */}
        {/* <ControlsAndDetails /> */}
      </Animated.View>
    </GestureDetector>
  )
}

export default FullScreenPlayer

const styles = StyleSheet.create({
  container: { flex: 1 },
  dragHandle: { 
    alignItems: 'center', 
    paddingVertical: 32 
  },
  dragIndicator: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 70
  },
  top: { alignItems: 'center', marginBottom: 24 },
  coverBig: { width: screenWidth * 0.7, height: screenWidth * 0.7, borderRadius: 8 },

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
});