import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Dimensions, StatusBar, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePlayerStore } from '../../store/usePlayerStore';
import { MiniPlayer } from './MiniPlayer';
import { FullScreenPlayer } from './FullScreenPlayer';
import { screenHeight } from '../../utils/constants';

const ANIMATION_DURATION = 380;

/**
 * GlobalPlayer
 *
 * Root component mounted once near the bottom of the app (see RootNavigator).
 * It renders the collapsed MiniPlayer inline, and the FullScreenPlayer inside
 * a native Modal so it can cover the *entire* screen regardless of where
 * GlobalPlayer itself is mounted in the view hierarchy.
 *
 * The open/close transition (slide up / slide down + fade) is driven by a
 * single shared value ("progress") that goes from 0 (collapsed) to 1 (expanded).
 * Opening/closing itself is triggered by gestures (swipe up on the MiniPlayer,
 * swipe down on the FullScreenPlayer) - see those components.
 */
export const GlobalPlayer = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isExpanded = usePlayerStore((state) => state.isExpanded);
  const setIsExpanded = usePlayerStore((state) => state.setIsExpanded);

  // Keeps the Modal mounted until the closing animation has fully finished,
  // otherwise the modal would just pop away instantly instead of sliding down.
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 0 = fully collapsed (mini player only), 1 = fully expanded (full screen player)
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isExpanded) {
      setIsModalVisible(true);
      progress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = withTiming(
        0,
        { duration: ANIMATION_DURATION, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            scheduleOnRN(setIsModalVisible, false);
          }
        },
      );
    }
  }, [isExpanded, progress]);

  const miniPlayerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const fullPlayerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * screenHeight }],
  }));

  // Nothing is playing yet -> render nothing at all
  if (!currentTrack) return null;

  return (
    <>
      <Animated.View
        style={miniPlayerAnimatedStyle}
        pointerEvents={isExpanded ? 'none' : 'auto'}
      >
        <MiniPlayer />
      </Animated.View>

      <Modal
        visible={isModalVisible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setIsExpanded(false)}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.fullPlayerContainer, fullPlayerAnimatedStyle]}>
            <FullScreenPlayer />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#121212',
  },
  fullPlayerContainer: {
    flex: 1,
  },
});



// import React, { useState } from 'react';
// import { StyleSheet } from 'react-native';
// import { MiniPlayer } from './MiniPlayer';
// import FullScreenPlayer from './FullScreenPlayer';
// import Animated, {
//   Extrapolation,
//   interpolate,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   useAnimatedReaction,
// } from 'react-native-reanimated';
// import { scheduleOnRN } from 'react-native-worklets';
// import { BOTTOM_TAB_HEIGHT, screenHeight } from '../../utils/constants';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { usePlayerColors } from './usePlayerColors';

// export const GlobalPlayer = () => {
//   const MIN_HEIGHT = 60;
//   const MAX_HEIGHT = screenHeight
//   const insets = useSafeAreaInsets();
//    const { primary, secondary } = usePlayerColors();
//   // 0 Mini player
//   const expandProgress = useSharedValue(0);

//   const [miniPointerEvents, setMiniPointerEvents] = useState<'auto' | 'none'>('auto');
//   const [fullPointerEvents, setFullPointerEvents] = useState<'auto' | 'none'>('none');

//   const toggleExpand = () => {
//     expandProgress.value = withSpring(expandProgress.value > 0.5 ? 0 : 1, {
//       damping: 20,
//       stiffness: 90,
//     });
//   };

//   useAnimatedReaction(
//     () => expandProgress.value,
//     (current) => {
//       if (current < 0.5) {
//         // mini show
//         scheduleOnRN(() => setMiniPointerEvents('auto'));
//         scheduleOnRN(() => setFullPointerEvents('none'));
//       } else {
//         // full show
//         scheduleOnRN(() => setMiniPointerEvents('none'));
//         scheduleOnRN(() => setFullPointerEvents('auto'));
//       }
//     }
//   );

//   const miniStyle = useAnimatedStyle(() => ({
//     opacity: interpolate(expandProgress.value, [0, 0.3], [1, 0], Extrapolation.CLAMP),
//     height: MIN_HEIGHT,
//     bottom: BOTTOM_TAB_HEIGHT + insets.bottom,
//   }));

//    const fullStyle = useAnimatedStyle(() => {
//     const h = interpolate(
//       expandProgress.value,
//       [0, 1],
//       [MIN_HEIGHT, screenHeight + BOTTOM_TAB_HEIGHT],
//       Extrapolation.CLAMP
//     );
    
//     const bottom = interpolate(
//       expandProgress.value,
//       [0, 1],
//       [BOTTOM_TAB_HEIGHT + insets.bottom, 0],
//       Extrapolation.CLAMP
//     );
    
//     return {
//       opacity: interpolate(expandProgress.value, [0.7, 1], [0, 1], Extrapolation.CLAMP),
//       height: h,
//       bottom,
//     };
//   });


//   return (
//     <>
//       {/* MINI PLAYER */}
//       <Animated.View 
//         style={[
//           styles.root, 
//           miniStyle,
//           { backgroundColor: "rgba(0,0,0,0.4)" }
//         ]}
//         pointerEvents={miniPointerEvents}
//       >
//         <MiniPlayer onTap={toggleExpand} />
//       </Animated.View>

//       {/* FULL PLAYER  */}
//       <Animated.View 
//         style={[
//           styles.root,
//           fullStyle,
//           { backgroundColor: "rgba(0,0,0,0.9)" }
//         ]}
//         pointerEvents={fullPointerEvents}
//       >
//         <FullScreenPlayer 
//           onClose={toggleExpand}
//           expandProgress={expandProgress}
//           colors={{ primary, secondary }} 
//         />
//       </Animated.View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   root: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     overflow: 'hidden',
//   },
// });