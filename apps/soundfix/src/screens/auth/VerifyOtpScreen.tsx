import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useVerifyOtpMutation } from '../../hooks/useAuthHook';

interface Props {
  route: any;
  navigation: any;
}

export const VerifyOtpScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialEmail = route.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');

  const verifyOtpMutation = useVerifyOtpMutation();

  const handleVerify = () => {
    if (!email || !code) {
      Alert.alert('Error', 'Enter your email and 6-digit code');
      return;
    }

    verifyOtpMutation.mutate(
      { email, code },
      {
        onSuccess: () => {
          Alert.alert('Success!', 'Your account has been verified. You can log in now.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || 'Invalid OTP code';
          Alert.alert('Verification error', Array.isArray(msg) ? msg.join('\n') : msg);
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 justify-center">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Confirm email</Text>
        <Text className="text-slate-400">
          We have sent a 6-digit verification code to:{'\n'}
          <Text className="text-sky-400 font-medium">{email}</Text>
        </Text>
      </View>

      <View className="space-y-4">
        {!initialEmail && (
          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="jan@example.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-slate-900 text-white px-4 py-3.5 rounded-xl border border-slate-800"
            />
          </View>
        )}

        <View>
          <Text className="text-slate-300 mb-2 font-medium">OTP code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            maxLength={6}
            className="bg-slate-900 text-white text-center text-2xl tracking-widest py-3.5 rounded-xl border border-slate-800 focus:border-sky-500"
          />
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          disabled={verifyOtpMutation.isPending}
          className="bg-sky-500 py-4 rounded-xl mt-6 items-center justify-center"
        >
          {verifyOtpMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">Verify your account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};