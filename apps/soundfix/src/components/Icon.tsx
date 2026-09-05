import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { StyleProp, TextStyle } from 'react-native';
import { Colors } from '../utils/constants';

interface IconProps {
  color?: string;
  size: number;
  name: any;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons';
  style?: StyleProp<TextStyle>
}

const Icon = ({color = Colors.text, size, name, iconFamily, style}: IconProps) => {
  return (
    <>
       {iconFamily === 'Ionicons' && (
        <Ionicons name={name} size={size} color={color} style={style} />
      )}
      {iconFamily === 'MaterialIcons' && (
        <MaterialIcons name={name} size={size} color={color} style={style} />
      )}
      {iconFamily === 'MaterialCommunityIcons' && (
        <MaterialCommunityIcons name={name} size={size} color={color} style={style} />
      )}
      
    </>
  );
};

export default Icon;