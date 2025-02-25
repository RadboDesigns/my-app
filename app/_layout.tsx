import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import "./global.css";
import { useEffect, useState, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create auth context
export const AuthContext = createContext({
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

  // Load user data from AsyncStorage
  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        console.log("User data from AsyncStorage:", userData);
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

  // Redirect users based on authentication status
  useEffect(() => {
    if (!isLoading) {
      const inAuthScreen = segments[0] === "sign-in" || segments[0] === "sign-up";
      const inProtectedRoute = segments[0] === "(root)";

      if (!user && inProtectedRoute) {
        router.replace("/sign-in");
      } else if (user && inAuthScreen) {
        router.replace("/(root)/(tabs)");
      }
    }
  }, [user, segments, isLoading]);

  const signIn = async (userData: any) => {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

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
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.replace("/sign-in");
      }
      setIsReady(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !isReady) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
