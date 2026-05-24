import { Redirect, router } from 'expo-router';
import { MessageSquareText, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { sendPhoneOtp, verifyPhoneOtp } from '@/services/auth.service';
import { useAuth } from '@/store/userStore';

export default function PhoneAuthScreen() {
  const { session, demoMode } = useAuth();
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (session || demoMode) return <Redirect href="/(tabs)" />;

  async function handleSendOtp() {
    if (!/^\+\d{10,15}$/.test(phone.trim())) {
      Alert.alert('Invalid phone number', 'Use country code format, for example +919876543210.');
      return;
    }

    try {
      setLoading(true);
      await sendPhoneOtp(phone.trim());
      setOtpSent(true);
      Alert.alert('OTP sent', 'Check your SMS inbox.');
    } catch (error) {
      Alert.alert('Could not send OTP', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.trim().length < 4) {
      Alert.alert('Enter OTP', 'Enter the SMS code you received.');
      return;
    }

    try {
      setLoading(true);
      await verifyPhoneOtp(phone.trim(), otp.trim());
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('OTP verification failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="label">Fast mobile login</Text>
        <Text variant="title">Sign in with phone OTP</Text>
        <Text variant="muted">Enable Phone provider in Supabase Auth and configure SMS before production release.</Text>
      </View>

      <Card>
        <FormField label="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="+919876543210" />
        {otpSent ? <FormField label="OTP code" keyboardType="number-pad" value={otp} onChangeText={setOtp} placeholder="6 digit code" /> : null}
        <Button title={otpSent ? 'Resend OTP' : 'Send OTP'} icon={Phone} variant={otpSent ? 'secondary' : 'primary'} loading={loading} onPress={handleSendOtp} />
        {otpSent ? <Button title="Verify and continue" icon={MessageSquareText} loading={loading} onPress={handleVerifyOtp} /> : null}
        <Button title="Use email login" variant="ghost" onPress={() => router.replace('/(auth)/login')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 10, paddingTop: 4 },
});
