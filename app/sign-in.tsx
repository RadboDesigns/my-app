import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BACKEND_URL, API_CONFIG } from '@/config/DjangoConfig';
import images from '@/constants/images';

export default function SignIn() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}${API_CONFIG.ENDPOINTS.USER}login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Save user data and token
      await SignIn(data);
      
      // Router will automatically redirect to /(tabs) based on auth state change
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="bg-white flex-1">
      <View className="items-center">
        <Image
          source={images.onboarding}
          className="w-[450px] h-[250px]"
          resizeMode="contain"
        />
      </View>

      <View className="px-6">
        <Text className="text-center font-rubik text-primary-100 text-2xl mt-10">
          Welcome to{"\n"}
          <Text className="text-3xl font-rubik-semibold text-primary-100">
            Ponnudurai Digi
            <Text className="text-accent-100">Gold</Text>
          </Text>
        </Text>

        <View className="mt-4 space-y-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg mb-4">
            <TextInput
              className="flex-1 p-4"
              placeholder="Enter your email"
              value={phone}
              onChangeText={setPhone}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="flex-row items-center border border-gray-300 rounded-lg mb-4">
            <TextInput
              className="flex-1 p-4"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-green-500 rounded-lg p-4"
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">
            {loading ? 'Processing...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}