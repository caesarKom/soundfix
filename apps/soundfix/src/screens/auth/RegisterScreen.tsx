import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRegisterMutation } from '../../hooks/useAuthHook';

interface Props {
  navigation: any;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const registerMutation = useRegisterMutation();

  const handleRegister = () => {
    if (!email || !name || !password) {
      Alert.alert('Error', 'Complete all fields');
      return;
    }

    registerMutation.mutate(
      { email, name, password },
      {
        onSuccess: () => {
        
          navigation.navigate('VerifyOtp', { email });
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || 'Coś poszło nie tak';
          Alert.alert('Błąd rejestracji', Array.isArray(msg) ? msg.join('\n') : msg);
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#020617' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: 32, paddingBottom:32 }} className="px-6 py-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white mb-2">Join to SoundFix</Text>
          <Text className="text-slate-400">Create a free account and listen to music</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-slate-300 mb-2 font-medium">User name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="np. jan_kowalski"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              className="bg-slate-900 text-white px-4 py-3.5 rounded-xl border border-slate-800 focus:border-sky-500"
            />
          </View>

          <View className="mt-4">
            <Text className="text-slate-300 mb-2 font-medium">Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="jan@example.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-slate-900 text-white px-4 py-3.5 rounded-xl border border-slate-800 focus:border-sky-500"
            />
          </View>

          <View className="mt-4">
            <Text className="text-slate-300 mb-2 font-medium">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
              className="bg-slate-900 text-white px-4 py-3.5 rounded-xl border border-slate-800 focus:border-sky-500"
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={registerMutation.isPending}
            className="bg-sky-500 py-4 rounded-xl mt-6 items-center justify-center"
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">Register</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 space-x-1">
          <Text className="text-slate-400">You already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-sky-400 font-semibold ml-1">Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};