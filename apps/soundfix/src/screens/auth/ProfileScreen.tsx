import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Avatar } from '../../components/Avatar';
import { useUpdateProfile } from '../../hooks/useUserHook';
import { useAuthStore } from '../../store/useAuthStore';
import { useMe } from '../../hooks/useAuthHook';


export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {user} = useAuthStore()
  const updateProfileMutation = useUpdateProfile();

  const [update, setUpdate] = useState({
    name: '',
    profile: {
      avatar: '',
      bio: ''
    }
  });

  useEffect(() => {
    if (user) {
      setUpdate({
        name: user.name || '',
        profile: {
          avatar: user.profile?.avatar || '',
          bio: user.profile?.bio || ''
        }
      });
    }
  }, [user]);

  const handleSave = () => {
    if (!update.name.trim()) {
      Alert.alert('Błąd walidacji', 'Imię nie może być puste.');
      return;
    }

    const updateData = {
      name: update.name.trim(),
      profile: {
        avatar: update.profile.avatar.trim() || null,
        bio: update.profile.bio.trim() || null,
      }
    };

    updateProfileMutation.mutate( updateData,{
        onSuccess: () => {
          Alert.alert('Sukces', 'Profil został pomyślnie zaktualizowany.');
        },
        onError: (error: any) => {
          const msg =
            error?.response?.data?.message || 'Nie udało się zapisać zmian.';
          Alert.alert('Błąd', Array.isArray(msg) ? msg.join('\n') : msg);
        },
      },
    );
  };

  // Funkcje pomocnicze do aktualizacji pól
  const updateField = (field: string, value: string) => {
    if (field === 'name') {
      setUpdate(prev => ({ ...prev, name: value }));
    } else if (field === 'avatar') {
      setUpdate(prev => ({
        ...prev,
        profile: { ...prev.profile, avatar: value }
      }));
    } else if (field === 'bio') {
      setUpdate(prev => ({
        ...prev,
        profile: { ...prev.profile, bio: value }
      }));
    }
  };

//   if (isLoading) {
//     return (
//       <View className="flex-1 bg-slate-950 items-center justify-center">
//         <ActivityIndicator size="large" color="#38bdf8" />
//       </View>
//     );
//   }

//   if (isError) {
//     return (
//       <View className="flex-1 bg-slate-950 items-center justify-center px-4">
//         <Text className="text-red-400 text-base text-center mb-4">
//           Wystąpił błąd podczas pobierania profilu.
//         </Text>
//       </View>
//     );
//   }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-950"
    >
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Nagłówek */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-900">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full bg-slate-900"
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Edytuj profil</Text>
          <View className='w-32' />
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Sekcja Podglądu Avatara */}
          <View className="items-center mb-8">
            <Avatar
              imageUrl={update.profile.avatar.trim() || user?.profile?.avatar}
              name={update.name || user?.email}
              size={96}
            />
            <Text className="text-slate-400 text-xs mt-6">
              Podgląd zdjęcia profilowego
            </Text>
          </View>

          {/* Formularz */}
          <View className="space-y-4">
            {/* Email (Tylko do odczytu) */}
            <View>
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Adres e-mail
              </Text>
              <View className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-slate-500 font-medium">
                  {user?.email}
                </Text>
              </View>
            </View>

            {/* Imię / Nazwa */}
            <View className="mt-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Nazwa użytkownika / Imię
              </Text>
              <TextInput
                value={update.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Wprowadź imię"
                placeholderTextColor="#64748b"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:border-sky-500"
              />
            </View>

            {/* URL Zdjęcia profilowego */}
            <View className="mt-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                URL zdjęcia profilowego (Avatar)
              </Text>
              <TextInput
                value={update.profile.avatar}
                onChangeText={(text) => updateField('avatar', text)}
                placeholder="https://example.com/avatar.jpg"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="url"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:border-sky-500"
              />
            </View>

            {/* Bio / Opis */}
            <View className="mt-4 mb-8">
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                O mnie (Bio)
              </Text>
              <TextInput
                value={update.profile.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder="Napisz coś o sobie..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:border-sky-500 min-h-[90px]"
              />
            </View>
          </View>

          {/* Przycisk Zapisz */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
            activeOpacity={0.8}
            className="bg-sky-500 rounded-xl py-4 items-center justify-center mb-12 shadow-lg shadow-sky-500/20 active:bg-sky-600"
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text className="text-slate-950 font-bold text-base">
                Zapisz zmiany
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};