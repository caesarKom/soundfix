import { Dimensions, Platform } from "react-native";

export const screenWidth: number = Dimensions.get("window").width;
export const screenHeight: number = Dimensions.get("window").height;

export const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 90 : 60;