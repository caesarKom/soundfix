import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { usePlayerStore } from '../../store/usePlayerStore';
import { MiniPlayer } from './MiniPlayer';
import { FullScreenPlayer } from './FullScreenPlayer';
import { BOTTOM_TAB_HEIGHT, screenHeight } from '../../utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsPlaying } from '@rntp/player';

export const GlobalPlayer = () => {
  const insets = useSafeAreaInsets();
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = useIsPlaying()
  const MIN_HEIGHT = 60;
  // 0 = fully collapsed (mini player only), 1 = fully expanded (full screen player)
  const expandProgress = useSharedValue(0);

  const [miniPointerEvents, setMiniPointerEvents] = useState<'auto' | 'none'>(
    'auto',
  );
  const [fullPointerEvents, setFullPointerEvents] = useState<'auto' | 'none'>(
    'none',
  );

  const toggleExpand = () => {
    expandProgress.value = withSpring(expandProgress.value > 0.5 ? 0 : 1, {
      damping: 20,
      stiffness: 90,
    });
  };

  useAnimatedReaction(
    () => expandProgress.value,
    current => {
      if (current < 0.5) {
        // mini visible
        runOnJS(setMiniPointerEvents)('auto');
        runOnJS(setFullPointerEvents)('none');
      } else {
        // full visible
        runOnJS(setMiniPointerEvents)('none');
        runOnJS(setFullPointerEvents)('auto');
      }
    },
  );

  const miniStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      expandProgress.value,
      [0, 0.3],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    height: MIN_HEIGHT, // ← always 60px
    bottom: BOTTOM_TAB_HEIGHT + insets.bottom,
  }));

  const fullStyle = useAnimatedStyle(() => {
    const h = interpolate(
      expandProgress.value,
      [0, 1],
      [MIN_HEIGHT, screenHeight + BOTTOM_TAB_HEIGHT + insets.bottom],
      Extrapolation.CLAMP,
    );

    const bottom = interpolate(
      expandProgress.value,
      [0, 1],
      [BOTTOM_TAB_HEIGHT + insets.bottom, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: interpolate(
        expandProgress.value,
        [0.7, 1],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      height: h,
      bottom,
    };
  });

  return (
    <>
      <Animated.View
        style={[styles.root, miniStyle]}
        pointerEvents={miniPointerEvents}
      >
        <MiniPlayer onTap={toggleExpand} isPlaying={isPlaying} track={currentTrack} />
      </Animated.View>

      <Animated.View
        pointerEvents={fullPointerEvents}
        style={[styles.root, fullStyle]}
      >
        <FullScreenPlayer
          onClose={toggleExpand}
          expandProgress={expandProgress}
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#121212',
  },
  fullPlayerContainer: {
    flex: 1,
  },
});
