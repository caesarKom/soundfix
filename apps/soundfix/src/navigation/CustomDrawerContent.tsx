import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/useAuthStore';

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props: DrawerContentComponentProps) => {

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View className="flex-1 bg-slate-900">
      <DrawerContentScrollView {...props} className='pt-5'>
        {/* Górna sekcja - Krótkie info o profilu */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => props.navigation.navigate('Profile')}
          className="flex-row items-center px-4 py-4 mb-2 border-b border-slate-800"
        >
          <Avatar
            imageUrl={user?.profile?.avatar}
            name={user?.name || user?.email}
            size={56}
          />
          <View className="ml-3 flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              {user?.name || 'Użytkownik'}
            </Text>
            <Text className="text-sky-400 text-xs font-semibold mt-0.5">
              Zobacz profil
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>

        {/* Pozycje menu */}
        <View className="px-2 mt-2">
          <TouchableOpacity
            onPress={() => props.navigation.navigate('Profile')}
            className="flex-row items-center px-4 py-3 rounded-lg active:bg-slate-800"
          >
            <Ionicons name="person-outline" size={22} color="#f8fafc" />
            <Text className="text-slate-200 font-medium ml-4 text-base">Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => props.navigation.navigate('Settings')}
            className="flex-row items-center px-4 py-3 rounded-lg active:bg-slate-800"
          >
            <Ionicons name="settings-outline" size={22} color="#f8fafc" />
            <Text className="text-slate-200 font-medium ml-4 text-base">
              Ustawienia i prywatność
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Dolna sekcja - Wyloguj */}
      <View className="p-4 border-t border-slate-800 mb-6">
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center px-4 py-3 rounded-lg bg-slate-800/50"
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-4 text-base">
            Wyloguj się
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};