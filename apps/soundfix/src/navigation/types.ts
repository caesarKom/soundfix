import { NavigatorScreenParams } from '@react-navigation/native';
import { MainTabParamList } from './TabNavigator';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOtp: { email: string };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<MainTabParamList>;
};