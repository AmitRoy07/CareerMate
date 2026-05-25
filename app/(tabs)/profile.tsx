import { router } from 'expo-router';
import { Bot, Camera, ChevronRight, Crown, FileLock2, FileText, LogOut, MessageSquareText, Moon, ShieldCheck, Sun, Trash2, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppTopBar } from '@/components/ui/AppTopBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CreditBadge } from '@/components/ui/CreditBadge';
import { PremiumFeatureCard } from '@/components/ui/PremiumFeatureCard';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { pickProfileImage, getLocalAvatar, saveProfileAvatar } from '@/services/profile.service';
import { getPremiumSnapshot, getSnapshotCreditBalance, snapshotHasEntitlement } from '@/services/monetization.service';
import { signOut } from '@/services/auth.service';
import { useAppSettings } from '@/store/appSettings';
import { useAuth } from '@/store/userStore';
import type { PremiumSnapshot } from '@/types/monetization.types';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, demoMode, clearDemoMode } = useAuth();
  const { toggleTheme } = useAppSettings();
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.user_metadata?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [premium, setPremium] = useState<PremiumSnapshot | null>(null);

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Rahul Sharma';
  const phone = user?.phone ?? '+91 98765 43210';

  useEffect(() => {
    getLocalAvatar().then((uri) => {
      if (uri && !avatarUri) setAvatarUri(uri);
    });
  }, [avatarUri]);

  useEffect(() => {
    getPremiumSnapshot(user?.id)
      .then(setPremium)
      .catch((error) => Alert.alert('Premium status unavailable', error instanceof Error ? error.message : 'Please try again.'));
  }, [user?.id]);

  async function handleAvatarUpload() {
    try {
      setUploading(true);
      const picked = await pickProfileImage();
      if (!picked) return;
      const savedUri = await saveProfileAvatar(user?.id, picked.uri);
      setAvatarUri(savedUri);
    } catch (error) {
      Alert.alert('Profile image issue', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      clearDemoMode();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Logout failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <Screen>
      <AppTopBar title="CareerMate" />
      <View style={styles.header}>
        <Pressable onPress={handleAvatarUpload} style={[styles.avatar, { backgroundColor: colors.surfaceLow, borderColor: colors.border }]}>
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <UserRound color={colors.primary} size={42} />}
          <View style={[styles.camera, { backgroundColor: colors.success }]}>
            <Camera color={colors.successText} size={16} />
          </View>
        </Pressable>
        <Text variant="title">{displayName}</Text>
        <Text variant="muted">{user?.email ?? (demoMode ? 'Demo mode' : 'No active session')}</Text>
        <Text variant="muted">{phone}</Text>
        {uploading ? <Text variant="label">Uploading image...</Text> : null}
      </View>

      <Card>
        <Text variant="heading">App Settings</Text>
        <View style={styles.settingRow}>
          <View style={styles.rowLabel}>
            {colorScheme === 'dark' ? <Moon color={colors.primary} size={22} /> : <Sun color={colors.primary} size={22} />}
            <View>
              <Text>Dark mode</Text>
              <Text variant="muted">Toggle light and dark theme</Text>
            </View>
          </View>
          <Switch value={colorScheme === 'dark'} onValueChange={toggleTheme} thumbColor="#FFFFFF" trackColor={{ false: colors.border, true: colors.primary }} />
        </View>
      </Card>

      <Card>
        <Text variant="heading">Plan & Credits</Text>
        <View style={styles.planRow}>
          <View style={[styles.linkIcon, { backgroundColor: colors.primarySoft }]}>
            <Crown color={colors.primary} size={22} />
          </View>
          <View style={styles.linkCopy}>
            <Text>{formatPlanName(premium?.plan.planType ?? 'free')}</Text>
            <Text variant="muted">{premium?.plan.status ?? 'active'} plan</Text>
          </View>
        </View>
        <CreditBadge label="AI resume scans" value={getCreditValue(premium, 'ai_resume_scan')} />
        <CreditBadge label="Job matches" value={getCreditValue(premium, 'job_match')} />
        <CreditBadge label="HR mails" value={getCreditValue(premium, 'hr_mail')} />
        <CreditBadge label="Mock interviews" value={getCreditValue(premium, 'mock_interview')} />
      </Card>

      <PremiumFeatureCard
        title="Vault cloud sync"
        description="Premium entitlement foundation only. Payment gateway will unlock this later."
        icon={FileLock2}
        unlocked={premium ? snapshotHasEntitlement(premium, 'vault_cloud_sync') : false}
      />
      <PremiumFeatureCard
        title="AI Resume Analyzer"
        description="ATS score, weak sections, keywords, and professional rewrite suggestions."
        icon={Bot}
        unlocked={premium ? snapshotHasEntitlement(premium, 'ai_resume_analyzer') : false}
      />
      <PremiumFeatureCard
        title="Job Match and HR mails"
        description="Compare resumes with JDs and generate professional HR letters."
        icon={MessageSquareText}
        unlocked={premium ? snapshotHasEntitlement(premium, 'job_match') || snapshotHasEntitlement(premium, 'hr_mail_generator') : false}
      />

      <Card>
        <Text variant="heading">Account</Text>
        <ProfileLink icon={FileText} title="Saved resumes" subtitle="View and manage your resume drafts" onPress={() => router.push('/(tabs)/resume')} />
        <ProfileLink icon={FileLock2} title="Document Vault" subtitle="Local-only personal document storage" onPress={() => router.push('/vault' as never)} />
        <ProfileLink icon={ShieldCheck} title="Privacy Policy" subtitle="How CareerMate handles your data" onPress={() => router.push('/legal/privacy')} />
        <ProfileLink icon={FileText} title="Terms & Conditions" subtitle="Rules for using CareerMate India" onPress={() => router.push('/legal/terms')} />
        <ProfileLink icon={Trash2} title="Delete account" subtitle="Request permanent account deletion" onPress={() => router.push('/legal/delete-account' as never)} danger />
      </Card>

      <Card>
        <Text variant="heading">Subscription</Text>
        <Text variant="muted">Manage subscription and Restore Purchases are placeholders until Play Store/App Store billing is connected.</Text>
        <Button title="Manage Subscription" icon={Crown} variant="secondary" onPress={() => Alert.alert('Coming soon', 'Payment gateway is intentionally not connected yet.')} />
        <Button title="Restore Purchases" variant="ghost" onPress={() => Alert.alert('Coming soon', 'Store purchase restore will be added with billing integration.')} />
      </Card>

      <Button title="Logout" icon={LogOut} variant="secondary" onPress={handleLogout} />
    </Screen>
  );
}

function getCreditValue(snapshot: PremiumSnapshot | null, creditType: 'ai_resume_scan' | 'job_match' | 'hr_mail' | 'mock_interview') {
  return snapshot ? getSnapshotCreditBalance(snapshot, creditType) : 0;
}

function formatPlanName(plan: string) {
  return plan
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function ProfileLink({
  icon: Icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: typeof FileText;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Pressable onPress={onPress} style={styles.linkRow}>
      <View style={[styles.linkIcon, { backgroundColor: danger ? (colorScheme === 'dark' ? '#3A1C24' : '#FFEBE8') : colors.primarySoft }]}>
        <Icon color={danger ? colors.danger : colors.primary} size={21} />
      </View>
      <View style={styles.linkCopy}>
        <Text style={danger ? { color: colors.danger } : undefined}>{title}</Text>
        <Text variant="muted">{subtitle}</Text>
      </View>
      <ChevronRight color={colors.muted} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 52,
    borderWidth: 1,
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  avatarImage: { borderRadius: 52, height: 104, width: 104 },
  camera: {
    alignItems: 'center',
    borderRadius: 18,
    bottom: 0,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 34,
  },
  header: { alignItems: 'center', gap: 6 },
  linkCopy: { flex: 1, gap: 2 },
  linkIcon: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  linkRow: { alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 8 },
  planRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  rowLabel: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12 },
  settingRow: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
});
