import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Link, router } from "expo-router";
import { icons } from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL, API_CONFIG } from '@/config/DjangoConfig';
import RazorpayCheckout from 'react-native-razorpay';

interface SchemeData {
  schemeCode: string;
  installment_months: number;
  scheme_type: string;
  joiningDate: string;
  total_savings: number;
  remainingPayments: number;
  payAmount: number; // Add payAmount to the interface
}

const MySchemes = () => {
  const [userSchemes, setUserSchemes] = useState<SchemeData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const fetchUserSchemes = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const { phoneNumber } = JSON.parse(userData);
        console.log("Fetching schemes for phone number:", phoneNumber);

        const response = await fetch(
          `${BACKEND_URL}${API_CONFIG.ENDPOINTS.SCHEMESS}?phone=${encodeURIComponent(phoneNumber)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        console.log("API response:", data);

        if (data.status === 'success') {
          setUserSchemes(data.data);
        } else {
          Alert.alert("Error", data.message || "Failed to fetch schemes");
        }
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
      Alert.alert("Error", "An error occurred while fetching schemes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSchemes();
  }, []);

  const handlePayment = async (scheme: SchemeData) => {
    try {
      // Create a Razorpay order
      const orderResponse = await fetch(`${BACKEND_URL}/create-razorpay-order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schemeCode: scheme.schemeCode,
          amount: scheme.payAmount * 100, // Convert to paise
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.status !== 'success') {
        throw new Error(orderData.message || "Failed to create Razorpay order");
      }

      const options = {
        description: 'Payment for Scheme',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: 'rzp_test_6DPEFbutV2mNls', // Replace with your Razorpay key
        amount: scheme.payAmount * 100, // Amount in paise
        name: 'Ponnudurai Schemes',
        order_id: orderData.order_id, // Use the order ID from the backend
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name',
        },
        theme: { color: '#F37254' },
      };

      // Open Razorpay checkout
      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Handle successful payment
          console.log('Payment successful:', data);

          // Save payment details to the backend
          const paymentResponse = await fetch(`${BACKEND_URL}/handle-payment-success/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              schemeCode: scheme.schemeCode,
              amount: scheme.payAmount,
            }),
          });

          const paymentData = await paymentResponse.json();

          if (paymentData.status === 'success') {
            Alert.alert("Success", "Payment recorded successfully");
            fetchUserSchemes(); // Refresh the schemes list
          } else {
            Alert.alert("Error", paymentData.message || "Failed to record payment");
          }
        })
        .catch((error) => {
          // Handle payment failure
          console.error('Payment failed:', error);
          Alert.alert("Error", "Payment failed or was canceled");
        });
    } catch (error) {
      console.error('Error during payment:', error);
      Alert.alert("Error", "An error occurred during payment");
    }
  };

  const renderScheme = (scheme: SchemeData) => (
    <View key={scheme.schemeCode} className="mt-6 bg-white rounded-lg shadow-lg border border-gray-200 w-[371px] h-[320px]">
      <View className="p-6">
        <Text className="text-xl font-rubik-medium text-center text-primary-100 mb-4">
          {scheme.schemeCode}
        </Text>

        <View className="h-[1px] bg-gray-200 mb-4" />

        <Text className="text-lg font-rubik text-primary-100 mb-4">
          Remaining months - {scheme.remainingPayments}
        </Text>

        <View className="h-2 bg-gray-200 rounded-full mb-2">
          <View
            className="h-full bg-primary-100 rounded-full"
            style={{
              width: `${((scheme.installment_months - scheme.remainingPayments) / scheme.installment_months) * 100}%`,
            }}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-base font-rubik-semibold text-primary-100">Scheme</Text>
          <Text className="text-base font-rubik text-gray-600">
            PONNUDURAI - MONTHLY
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-base font-rubik-semibold text-primary-100">Installment</Text>
          <Text className="text-base font-rubik text-gray-600">
            {scheme.installment_months} Months
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-base font-rubik-semibold text-primary-100">Scheme Type</Text>
          <Text className="text-base font-rubik text-gray-600">
            {scheme.scheme_type}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-base font-rubik-semibold text-primary-100">Joining Date</Text>
          <Text className="text-base font-rubik text-gray-600">
            {scheme.joiningDate}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-base font-rubik-semibold text-primary-100">Total Savings</Text>
          <Text className="text-base font-rubik text-gray-600">
            {scheme.total_savings} Grams
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary-100 px-8 py-3 rounded-full mb-4 w-full mt-5"
          onPress={() => handlePayment(scheme)}
        >
          <Text className="text-white text-center font-rubik-medium text-lg">
            Pay
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="w-full h-[100px] bg-primary-100 justify-end pb-4">
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack} className="absolute left-4 z-10">
            <Image 
              source={icons.backArrow}
              className="w-6 h-6"
              tintColor="white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="flex-1 text-white text-2xl font-rubik-medium text-center">
            My Schemes
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text>Loading schemes...</Text>
          </View>
        ) : userSchemes.length > 0 ? (
          userSchemes.map((scheme) => renderScheme(scheme))
        ) : (
          <Text className="text-gray-500 text-center mt-6">
            No active schemes found. Join a scheme to get started!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MySchemes;