import { Dimensions, Platform } from "react-native";
import {RFValue} from 'react-native-responsive-fontsize';

export const screenWidth: number = Dimensions.get("window").width;
export const screenHeight: number = Dimensions.get("window").height;

export const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 90 : 60;

export const fontR = (fontSize: number) => {
  return Platform.OS === 'android' ? RFValue(fontSize + 2) : RFValue(fontSize);
};

export const darkColor = (hex: string, amount = 100) => {
  let color = hex?.replace('#', '');
  if (color?.length === 3) {
    color = color
      ?.split('')
      ?.map(c => c + c)
      ?.join('');
  }
  const num = parseInt(color, 16);
  const r = Math.max((num >> 16) - amount, 0);
  const g = Math.max(((num >> 8) & 0x00ff) - amount, 0);
  const b = Math.max((num & 0x0000ff) - amount, 0);
  return `#${((r << 16) | (g << 8) | b)?.toString(16).padStart(6, '0')}`;
};

export enum FONTS {
  Black = 'Roboto-Black',
  Bold = 'Roboto-Bold',
  Light = 'Roboto-Light',
  Medium = 'Roboto-Medium',
  Regular = 'Roboto-Regular',
  Thin = 'Roboto-Thin',
  Number = 'Manrope-Regular',
  NumberSemiBold = 'Manrope-SemiBold',
  Lato = 'Lato-Regular',
}

export const Colors = {
  primary: '#1DB954',
  background: '#121212',
  sub_background: '#1E293B',
  surface: '#282828',
  text: '#FFFFFF',
  text_light: '#E2E8F0',
  textSecondary: '#B3B3B3',
  border: '#404040',
  card: '#334155',

  active_tab: '#06B6D4',
  unactive_tab: '#64748B',

  errorColor: '#F59E0B',
  dark_background_light: '#888',
  dark_text: '#111',
  light_text: '#fff',
  light_border: '#444',
  backgroundDark: '#121212',
  backgroundLight: '#1F1F1F',
  inactive: '#B3B3B3',
};