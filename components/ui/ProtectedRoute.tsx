import { Redirect } from 'expo-router';
import { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/store/userStore';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { loading, session, demoMode } = useAuth();

  if (loading) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session && !demoMode) {
    return <Redirect href="/(auth)/login" />;
  }

  return children;
}
