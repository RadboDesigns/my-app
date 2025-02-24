import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import "./global.css";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Simple auth context
import { createContext, useContext } from "react";

// Create auth context
const AuthContext = createContext({
  signIn: async (userData: any) => {},
  signOut: async () => {},
  user: null as any,
  isLoading: true,
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Check if user is authenticated and redirect accordingly
  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === "sign-in";
      
      if (!user && !inAuthGroup) {
        // Redirect to sign-in if not authenticated
        router.replace("/sign-in");
      } else if (user && inAuthGroup) {
        // Redirect to home if authenticated
        router.replace("/(root)/(tabs)");
      }
    }
  }, [user, segments, isLoading]);

  // Check for existing user session on app start
  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, []);

  // Sign in function - saves user data and updates state
  const signIn = async (userData: any) => {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  // Sign out function - clears user data
  const signOut = async () => {
    await AsyncStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require('../assets/fonts/Rubik-Bold.ttf'),
    "Rubik-ExtraBold": require('../assets/fonts/Rubik-ExtraBold.ttf'),
    "Rubik-Light": require('../assets/fonts/Rubik-Light.ttf'),
    "Rubik-Medium": require('../assets/fonts/Rubik-Medium.ttf'),
    "Rubik-Regular": require('../assets/fonts/Rubik-Regular.ttf'),
    "Rubik-SemiBold": require('../assets/fonts/Rubik-SemiBold.ttf')
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if(!fontsLoaded) return null

  return (
  <AuthProvider>
    <Stack screenOptions={{ headerShown: false}} />
  </AuthProvider>);
}
