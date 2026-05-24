import { Redirect, Tabs } from 'expo-router';
import { BookOpenText, Calculator, FileText, Home, UserRound } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/store/userStore';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { loading, session, demoMode } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session && !demoMode) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 18,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.14,
          shadowRadius: 20,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={21} /> }} />
      <Tabs.Screen name="resume" options={{ title: 'Resume', tabBarIcon: ({ color }) => <FileText color={color} size={21} /> }} />
      <Tabs.Screen name="salary" options={{ title: 'Tools', tabBarIcon: ({ color }) => <Calculator color={color} size={21} /> }} />
      <Tabs.Screen name="interview" options={{ title: 'Interview', tabBarIcon: ({ color }) => <BookOpenText color={color} size={21} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <UserRound color={color} size={21} /> }} />
    </Tabs>
  );
}
