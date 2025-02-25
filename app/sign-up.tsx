import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from '@/constants/images';
import { BACKEND_URL, API_CONFIG } from '@/config/DjangoConfig';

interface UserCheckResponse {
  email_exists: boolean;
  phone_exists: boolean;
}

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push('/sign-in');
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Check if password is 6 digits
    const passwordRegex = /^\d{6}$/;
    return passwordRegex.test(password);
  };

  const checkExistingUser = async (): Promise<UserCheckResponse> => {
    try {
      // Changed to POST request to match backend expectations
      const response = await fetch(
        `${BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_USER}`,
        {
          method: 'POST', // Changed from GET to POST
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ // Send data in request body instead of query params
            email: email,
            phone: phoneNumber
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to check user existence');
      return await response.json();
    } catch (error) {
      console.error('User check error:', error);
      throw error;
    }
  };

  // Alternative function using your check_existing_user endpoint which expects GET
  const checkExistingUserAlt = async (): Promise<UserCheckResponse> => {
    try {
      // Make separate calls to check email and phone existence
      // First check if user with email exists
      const emailExists = await fetch(
        `${BACKEND_URL}/api/user/verify/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email }),
        }
      ).then(response => response.status === 200);

      // Then attempt to create user directly
      return {
        email_exists: emailExists,
        phone_exists: false // We'll just check during creation
      };
    } catch (error) {
      console.error('User check error:', error);
      throw error;
    }
  };

  const registerUser = async () => {
    if (!email || !password || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be exactly 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Skip the user check since it's causing issues
      // Just attempt to register directly and handle any errors
      
      // Register new user
      const response = await fetch(`${BACKEND_URL}${API_CONFIG.ENDPOINTS.USER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          username: email, // Using email as username
          password: password,
          phone_number: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases that might be related to duplicate users
        if (response.status === 400) {
          if (data.email && data.email[0].includes('already exists')) {
            throw new Error('Email is already registered');
          }
          if (data.phone_number && data.phone_number[0].includes('already exists')) {
            throw new Error('Phone number is already registered');
          }
          if (data.username && data.username[0].includes('already exists')) {
            throw new Error('Username is already registered');
          }
        }
        const errorMessage = data.detail || 'Registration failed';
        throw new Error(errorMessage);
      }

      // Save user data locally
      await AsyncStorage.setItem('userData', JSON.stringify({
        userId: data.id,
        email: email,
        phoneNumber: phoneNumber,
      }));

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/sign-in'),
          },
        ]
      );
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains unchanged
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
          {/* Email input field */}
          <View className="flex-row items-center border border-gray-300 rounded-lg mb-4">
            <TextInput
              className="flex-1 p-4"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password input field */}
          <View className="flex-row items-center border border-gray-300 rounded-lg mb-4">
            <TextInput
              className="flex-1 p-4"
              placeholder="Enter your password (6 digits)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* Phone number input field */}
          <View className="flex-row items-center border border-gray-300 rounded-lg mb-4">
            <TextInput
              className="flex-1 p-4"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-accent-100 rounded-lg p-4 mb-4"
          onPress={registerUser}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 rounded-lg p-4"
          onPress={handleLogin}
        >
          <Text className="text-white text-center font-bold">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}