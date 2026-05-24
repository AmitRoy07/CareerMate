import { Redirect, router } from 'expo-router';
import { MailPlus, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HeroVisual } from '@/components/ui/HeroVisual';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { signUpWithEmailAndProfile } from '@/services/auth.service';
import { useAuth } from '@/store/userStore';

export default function SignupScreen() {
  const { session, demoMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (session || demoMode) return <Redirect href="/(tabs)" />;

  async function handleSignup() {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Check details', 'Enter your name, email, and a password with at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const data = await signUpWithEmailAndProfile(email.trim(), password, fullName.trim());
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Verify email', 'Account created. Please verify your email, then login.');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      Alert.alert('Sign up failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="label">Create your account</Text>
        <Text variant="title">Start building your career profile</Text>
        <Text variant="muted">Use email now, or continue with phone OTP if you prefer a mobile-first login.</Text>
      </View>
      <HeroVisual />

      <Card>
        <FormField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your name" />
        <FormField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <FormField label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Minimum 6 characters" />
        <Button title="Create account" icon={MailPlus} loading={loading} onPress={handleSignup} />
        <Button title="Use phone OTP instead" icon={Phone} variant="secondary" onPress={() => router.push('/(auth)/phone')} />
        <Button title="Already have an account? Login" variant="ghost" onPress={() => router.replace('/(auth)/login')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 10, paddingTop: 4 },
});

