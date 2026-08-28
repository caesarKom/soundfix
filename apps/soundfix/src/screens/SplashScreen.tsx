import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    // Entrance animation sequence
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
    });

    // Fade out and notify parent component when done
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 }, (isFinished) => {
        if (isFinished) {
          onFinish();
        }
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 bg-slate-950 items-center justify-center px-6">
      <Animated.View style={animatedStyle} className="items-center">
        {/* Main Logo Container */}
        <View className="w-24 h-24 bg-sky-500 rounded-3xl items-center justify-center shadow-lg shadow-sky-500/50 mb-6">
          <Text className="text-4xl">🎧</Text>
        </View>

        {/* App Title */}
        <Text className="text-4xl font-extrabold text-white tracking-wider mb-2">
          Soundfix
        </Text>
        <Text className="text-sm font-medium text-slate-400">
          Your Ultimate Audio Experience
        </Text>
      </Animated.View>
    </View>
  );
};