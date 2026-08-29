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
  Alert
} from 'react-native';
import { useLoginMutation } from '../../hooks/useAuthHook';

interface Props {
  navigation: any;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Enter your email and password');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onError: (error: any) => {
          const msg = error?.response?.data?.message || 'Incorrect login details';
          Alert.alert('Błąd logowania', Array.isArray(msg) ? msg.join('\n') : msg);
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
          <Text className="text-4xl font-extrabold text-white mb-2 tracking-tight">SoundFix</Text>
          <Text className="text-slate-400 text-base">Welcome back! Log in to your account.</Text>
        </View>

        <View className="space-y-4">
          <View>
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
              autoCapitalize="none"
              className="bg-slate-900 text-white px-4 py-3.5 rounded-xl border border-slate-800 focus:border-sky-500"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            className="bg-sky-500 py-4 rounded-xl mt-6 items-center justify-center"
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 space-x-1">
          <Text className="text-slate-400">Don't have an account yet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-sky-400 font-semibold ml-1">Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  
  );
};