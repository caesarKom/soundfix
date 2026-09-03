import { useEffect, useState } from 'react'
import { Dimensions, LayoutChangeEvent, StyleSheet } from 'react-native'
import { View } from 'react-native'
import { Text } from 'react-native'
import Animated, {
	Easing,
	StyleProps,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated'

export type MovingTextProps = {
	text: string
	style?: StyleProps
}

export const MovingText = ({text, style}: MovingTextProps) => {
  const [textWidth, setTextWidth] = useState<number>(0);
  const containerWidth = Dimensions.get('window').width - 160;

  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });
  const handleTextLayout = (e: LayoutChangeEvent) => {
    const {width} = e.nativeEvent.layout;
    setTextWidth(width);
  };

  useEffect(() => {
    if (textWidth > containerWidth) {

      translateX.value = 0;

      translateX.value = withRepeat(
        withTiming(-textWidth + containerWidth - 20, {
          duration: 6000, 
          easing: Easing.linear,
        }),
        -1,  
        true
      );
    } else {
      translateX.value = 0;
    }
  }, [textWidth, containerWidth, text, translateX]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.textContainer, animatedStyle]}>
        <Text
          numberOfLines={1}
          style={[style, styles.securePadding]}
          onLayout={handleTextLayout as (event: object) => void}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    width: 600,
  },
  securePadding: {
    paddingHorizontal: 6,
  }
});