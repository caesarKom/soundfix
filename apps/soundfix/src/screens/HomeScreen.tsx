import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MEDIA_URL } from '../config/env';



export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const {user, accessToken} = useAuthStore();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View className="flex-1 bg-slate-950" style={{ paddingTop: insets.top }}>
      {/* Top Header - Style Spotify */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Avatar
          imageUrl={MEDIA_URL+user?.profile?.avatar}
          name={user?.name || user?.email}
          size={36}
          onPress={() => navigation.openDrawer()}
        />
        <Text className="text-white font-bold text-xl">SoundFix</Text>
        <View className='w-16' />
      </View>

      {/* Zawartość ekranu */}
      <View className="flex-1 px-4 justify-center items-center">
        <Text className="text-slate-400">Główna zawartość ekranu Home</Text>
        <Text className="text-slate-400">User: {JSON.stringify(user)}</Text>
        <Text className="text-slate-400">AccessToken: {JSON.stringify(accessToken)}</Text>
      </View>
    </View>
  );
};