import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { MiniPlayer } from './MiniPlayer';
import FullScreenPlayer from './FullScreenPlayer';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { BOTTOM_TAB_HEIGHT, screenHeight } from '../../utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerColors } from './usePlayerColors';

export const GlobalPlayer = () => {
  const MIN_HEIGHT = 60;
  const MAX_HEIGHT = screenHeight
  const insets = useSafeAreaInsets();
   const { primary, secondary } = usePlayerColors();
  // 0 Mini player
  const expandProgress = useSharedValue(0);

  const [miniPointerEvents, setMiniPointerEvents] = useState<'auto' | 'none'>('auto');
  const [fullPointerEvents, setFullPointerEvents] = useState<'auto' | 'none'>('none');

  const toggleExpand = () => {
    expandProgress.value = withSpring(expandProgress.value > 0.5 ? 0 : 1, {
      damping: 20,
      stiffness: 90,
    });
  };

  useAnimatedReaction(
    () => expandProgress.value,
    (current) => {
      if (current < 0.5) {
        // mini show
        scheduleOnRN(() => setMiniPointerEvents('auto'));
        scheduleOnRN(() => setFullPointerEvents('none'));
      } else {
        // full show
        scheduleOnRN(() => setMiniPointerEvents('none'));
        scheduleOnRN(() => setFullPointerEvents('auto'));
      }
    }
  );

  const miniStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0, 0.3], [1, 0], Extrapolation.CLAMP),
    height: MIN_HEIGHT,
    bottom: BOTTOM_TAB_HEIGHT + insets.bottom,
  }));

   const fullStyle = useAnimatedStyle(() => {
    const h = interpolate(
      expandProgress.value,
      [0, 1],
      [MIN_HEIGHT, screenHeight + BOTTOM_TAB_HEIGHT],
      Extrapolation.CLAMP
    );
    
    const bottom = interpolate(
      expandProgress.value,
      [0, 1],
      [BOTTOM_TAB_HEIGHT + insets.bottom, 0],
      Extrapolation.CLAMP
    );
    
    return {
      opacity: interpolate(expandProgress.value, [0.7, 1], [0, 1], Extrapolation.CLAMP),
      height: h,
      bottom,
    };
  });


  return (
    <>
      {/* MINI PLAYER */}
      <Animated.View 
        style={[
          styles.root, 
          miniStyle,
          { backgroundColor: "rgba(0,0,0,0.4)" }
        ]}
        pointerEvents={miniPointerEvents}
      >
        <MiniPlayer onTap={toggleExpand} />
      </Animated.View>

      {/* FULL PLAYER  */}
      <Animated.View 
        style={[
          styles.root,
          fullStyle,
          { backgroundColor: "rgba(0,0,0,0.9)" }
        ]}
        pointerEvents={fullPointerEvents}
      >
        <FullScreenPlayer 
          onClose={toggleExpand}
          expandProgress={expandProgress}
          colors={{ primary, secondary }} 
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
});