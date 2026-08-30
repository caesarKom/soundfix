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
import { MEDIA_URL } from '../../config/env';


export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {user, isLoading } = useAuthStore()
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
      Alert.alert('Error', 'Name cannot be empty.');
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
          Alert.alert('Succcess', 'Your profile has been successfully updated.');
        },
        onError: (error: any) => {
          const msg =
            error?.response?.data?.message || 'Failed to save changes.';
          Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
        },
      },
    );
  };


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

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

//   if (isError) {
//     return (
//       <View className="flex-1 bg-slate-950 items-center justify-center px-4">
//         <Text className="text-red-400 text-base text-center mb-4">
//           An error occurred while downloading the profile.
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
        {/* Heading */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-900">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full bg-slate-900"
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Edit profile</Text>
          <View className='w-32' />
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Avatar Preview Section */}
          <View className="items-center mb-8">
            <Avatar
              imageUrl={MEDIA_URL + "/" + update.profile.avatar.trim() || user?.profile?.avatar}
              name={update.name || user?.email}
              size={96}
            />
            <Text className="text-slate-400 text-xs mt-6">
              Profile picture preview
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
     
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

      
            <View className="mt-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
            Username / Name
              </Text>
              <TextInput
                value={update.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:border-sky-500"
              />
            </View>

        
            <View className="mt-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
               Profile Picture URL (Avatar)
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

      
            <View className="mt-4 mb-8">
              <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                About me (Bio)
              </Text>
              <TextInput
                value={update.profile.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder="Write something about yourself..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:border-sky-500 min-h-[90px]"
              />
            </View>
          </View>


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
                Save changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};