import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import Colors from '@/constants/Colors';
import { AuthProvider } from '@/store/userStore';
import { AppSettingsProvider } from '@/store/appSettings';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppSettingsProvider>
      <RootLayoutNav />
    </AppSettingsProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerLeft: () => <HeaderBackButton />,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text, fontSize: 17, fontWeight: '800' },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup" options={{ title: 'Create account' }} />
          <Stack.Screen name="(auth)/phone" options={{ title: 'Phone sign in' }} />
          <Stack.Screen name="analyze/index" options={{ title: 'AI Analyzer' }} />
          <Stack.Screen name="interview/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="interview/questions" options={{ headerShown: false }} />
          <Stack.Screen name="legal/privacy" options={{ title: 'Privacy Policy' }} />
          <Stack.Screen name="legal/terms" options={{ title: 'Terms & Conditions' }} />
          <Stack.Screen name="legal/delete-account" options={{ title: 'Delete Account' }} />
          <Stack.Screen name="vault/index" options={{ title: 'Document Vault' }} />
          <Stack.Screen name="resume/builder" options={{ title: 'Edit Resume' }} />
          <Stack.Screen name="resume/preview" options={{ title: 'Resume Preview' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
