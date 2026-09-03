import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSharedValue, useAnimatedStyle, interpolate, withTiming, Extrapolation } from 'react-native-reanimated';

const MIN_PLAYER_HEIGHT = 60 + 50;

export const usePlayerAnimation = () => {
  const { height: screenHeight } = useWindowDimensions();
  const MAX_PLAYER_HEIGHT = screenHeight;
  const scrollMaxLimit = -(MAX_PLAYER_HEIGHT - MIN_PLAYER_HEIGHT);

  const translationY = useSharedValue(0);

  useEffect(() => {
    translationY.value = withTiming(0, { duration: 0 });
  }, [translationY]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const calculatedHeight = interpolate(
      translationY.value,
      [scrollMaxLimit, 0],
      [MAX_PLAYER_HEIGHT, MIN_PLAYER_HEIGHT],
      Extrapolation.CLAMP
    );
    return {
      height: calculatedHeight,
      borderTopLeftRadius: translationY.value < -10 ? 20 : 0,
      borderTopRightRadius: translationY.value < -10 ? 20 : 0,
    };
  });

  const collapseOpacityStyle = useAnimatedStyle(() => {
    const calculatedOpacity = interpolate(
      translationY.value, 
      [-100, 0], 
      [0, 1], 
      Extrapolation.CLAMP
    );
    return { opacity: calculatedOpacity };
  });

  const expandedOpacityStyle = useAnimatedStyle(() => {
    const calculatedOpacity = interpolate(
      translationY.value,
      [scrollMaxLimit + 150, scrollMaxLimit],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity: calculatedOpacity };
  });

  return {
    translationY,
    scrollMaxLimit,
    MIN_PLAYER_HEIGHT,
    animatedContainerStyle,
    collapseOpacityStyle,
    expandedOpacityStyle,
  };
};
