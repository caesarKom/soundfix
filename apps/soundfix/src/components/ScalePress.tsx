import React from 'react';
import {ViewStyle, Animated, TouchableOpacity} from 'react-native';

interface ScalePressProps {
  onPress?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

const ScalePress = ({
  onLongPress,
  onPress,
  style,
  children,
}: ScalePressProps) => {
  const scaleValue = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={style}
      onLongPress={onLongPress}>
      <Animated.View
        style={[{transform: [{scale: scaleValue}], width: '100%'}]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ScalePress;