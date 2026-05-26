import { router } from 'expo-router';
import { ArrowRight, Bot, Brain, Calculator, Crown, FileLock2, FileText, MailPlus, Search, SearchCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppTopBar } from '@/components/ui/AppTopBar';
import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { PremiumFeatureCard } from '@/components/ui/PremiumFeatureCard';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/store/userStore';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, demoMode } = useAuth();
  const name =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    (demoMode ? "Amit" : "Amit");

  return (
    <Screen>
      <AppTopBar title="CareerMate India" />
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={[styles.avatar, { backgroundColor: colors.navy }]}>
            <Text style={[styles.avatarText, { color: colors.onNavy }]}>{name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text variant="title">Hello, {name}!</Text>
        </View>
        <Text variant="muted">
          Your career toolkit for resumes, interview prep, and compensation
          planning.
        </Text>
      </View>

      <View
        style={[
          styles.search,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Search color={colors.muted} size={20} />
        <TextInput
          placeholder="Search for tools, guides, or jobs..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <View style={styles.grid}>
        <FeatureCard title="Build Resume" description="Create your professional ATS-friendly resume for the Indian market." icon={FileText} primary onPress={() => router.push('/resume/builder')} />
        <FeatureCard title="Salary Calculator" description="Calculate your in-hand CTC breakdown including PF and Tax." icon={Calculator} tone="green" onPress={() => router.push('/(tabs)/salary')} />
        <FeatureCard title="Interview Prep" description="Practice with top company questions and focused revision." icon={Brain} tone="violet" onPress={() => router.push('/(tabs)/interview')} />
        <FeatureCard title="Document Vault" description="Store Aadhaar, PAN, certificates, and offers locally with optional cloud backup." icon={FileLock2} tone="cyan" onPress={() => router.push('/vault' as never)} />
      </View>

      <Text variant="heading">Premium Tools</Text>
      <View style={styles.grid}>
        <PremiumFeatureCard title="Analyze My Resume" description="ATS score, missing keywords, and practical fixes." icon={Bot} onPress={() => router.push('/analyze')} />
        <PremiumFeatureCard title="Match Resume with Job" description="Compare your resume with a job description." icon={SearchCheck} onPress={() => router.push('/analyze/job-match' as never)} />
        <PremiumFeatureCard title="Generate HR Email" description="Create polished professional HR mails and letters." icon={MailPlus} onPress={() => router.push('/tools/hr-mail' as never)} />
        <PremiumFeatureCard title="Premium Templates" description="Unlock ATS-friendly layouts and no-watermark exports." icon={Crown} onPress={() => router.push('/resume/preview')} />
      </View>
    </Screen>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  onPress,
  primary,
  tone = "blue",
}: {
  title: string;
  description: string;
  icon: typeof FileText;
  onPress: () => void;
  primary?: boolean;
  tone?: "blue" | "green" | "violet" | "cyan" | "orange";
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.feature, primary && styles.primaryFeature]}>
        <GlassIcon icon={Icon} tone={tone} size={56} />
        <Text
          variant="heading"
          style={primary ? styles.featureTitle : undefined}
        >
          {title}
        </Text>
        <Text variant="muted">{description}</Text>
        {primary ? (
          <Pressable onPress={onPress} style={styles.startButton}>
            <Text style={styles.startButtonText}>Get Started</Text>
            <ArrowRight color="#FFFFFF" size={17} />
          </Pressable>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  avatar: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarText: { fontFamily: "PlusJakartaSans_700Bold" },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
=======
  avatar: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold' },
  badge: { alignSelf: 'flex-start', borderRadius: 999, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
>>>>>>> 4aa94f765dd3040c827dfb99439f850d651eaac5
  feature: { minHeight: 190 },
  featureTitle: { marginTop: 8 },
  greetingRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  grid: { gap: 24 },
  header: { gap: 8 },
  primaryFeature: { minHeight: 300 },
  search: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 12, minHeight: 50, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16 },
  startButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 44,
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 20,
  },
  startButtonText: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
});
