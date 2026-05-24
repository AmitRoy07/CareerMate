import { Redirect, router } from 'expo-router';
import { LogIn, Mail, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { FormField } from '@/components/forms/FormField';
import { APP_NAME } from '@/constants/app.constants';
import { signInWithEmail, signInWithGoogle } from '@/services/auth.service';
import { isSupabaseConfigured } from '@/services/supabase';
import { useAuth } from '@/store/userStore';

export default function LoginScreen() {
  const { session, demoMode, enableDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (session || demoMode) return <Redirect href="/(tabs)" />;

  async function handleLogin() {
    try {
      setLoading(true);
      await signInWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Authentication issue', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Google login issue', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="title" style={styles.brand}>{APP_NAME}</Text>
      </View>

      <Card style={styles.authCard}>
        <Text variant="heading" style={styles.center}>Welcome to CareerMate</Text>
        <Text variant="muted" style={styles.center}>Login to build your dream career</Text>
        <Button title="Continue with Google" variant="secondary" loading={loading} onPress={handleGoogle} />
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text variant="muted">or continue with</Text>
          <View style={styles.divider} />
        </View>
        <FormField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <FormField label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Minimum 6 characters" />
        <Button title="Login" icon={LogIn} loading={loading} onPress={handleLogin} />
        <View style={styles.authModes}>
          <Button title="Email" icon={Mail} variant="secondary" loading={loading} onPress={() => undefined} style={styles.modeButton} />
          <Button title="Phone" icon={Phone} variant="secondary" loading={loading} onPress={() => router.push('/(auth)/phone')} style={styles.modeButton} />
        </View>
      </Card>

      <Text variant="muted" style={styles.legal}>
        By continuing, you agree to our{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
          Privacy Policy
        </Text>
        .
      </Text>

      <Pressable onPress={() => router.push('/(auth)/signup')}>
        <Text variant="muted" style={styles.center}>New to CareerMate? <Text style={styles.link}>Create an account</Text></Text>
      </Pressable>

      {!isSupabaseConfigured ? (
        <Card>
          <Text variant="heading">Demo mode available</Text>
          <Text variant="muted">Add Supabase env vars for real authentication. Until then, you can explore the app locally.</Text>
          <Button title="Enter demo app" onPress={() => enableDemoMode()} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  authCard: { gap: 18 },
  authModes: { flexDirection: 'row', gap: 12 },
  brand: { color: '#000000', textAlign: 'center' },
  center: { textAlign: 'center' },
  divider: { backgroundColor: '#C6C6CD', flex: 1, height: 1 },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  hero: { gap: 10, paddingTop: 80 },
  legal: { textAlign: 'center' },
  link: { color: '#0051D5', fontFamily: 'PlusJakartaSans_700Bold' },
  modeButton: { flex: 1 },
});
