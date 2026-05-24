import { router } from 'expo-router';
import { ArrowRight, Bot, Brain, Calculator, FileText, Search } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppTopBar } from '@/components/ui/AppTopBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/store/userStore';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, demoMode } = useAuth();
  const name = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? (demoMode ? 'Rahul' : 'Rahul');

  return (
    <Screen>
      <AppTopBar title="CareerMate India" />
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={[styles.avatar, { backgroundColor: colors.navy }]}>
            <Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text variant="title">Hello, {name}!</Text>
        </View>
        <Text variant="muted">Your career toolkit for resumes, interview prep, and compensation planning.</Text>
      </View>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.muted} size={20} />
        <TextInput placeholder="Search for tools, guides, or jobs..." placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text }]} />
      </View>

      <View style={styles.grid}>
        <FeatureCard title="Build Resume" description="Create your professional ATS-friendly resume for the Indian market." icon={FileText} primary onPress={() => router.push('/resume/builder')} />
        <FeatureCard title="Salary Calculator" description="Calculate your in-hand CTC breakdown including PF and Tax." icon={Calculator} tone="green" onPress={() => router.push('/(tabs)/salary')} />
        <FeatureCard title="Interview Prep" description="Practice with top company questions and focused revision." icon={Brain} tone="violet" onPress={() => router.push('/(tabs)/interview')} />
      </View>

      <Text variant="heading">Coming Soon</Text>
      <Card style={{ backgroundColor: colors.surfaceLow }}>
        <GlassIcon icon={Bot} tone="blue" />
        <Text variant="label" style={styles.badge}>New Technology</Text>
        <Text variant="heading">AI Resume Analyzer</Text>
        <Text variant="muted">Instant scoring and optimization tips for your current resume.</Text>
      </Card>
    </Screen>
  );
}

function FeatureCard({ title, description, icon: Icon, onPress, primary, tone = 'blue' }: { title: string; description: string; icon: typeof FileText; onPress: () => void; primary?: boolean; tone?: 'blue' | 'green' | 'violet' | 'cyan' | 'orange' }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.feature, primary && styles.primaryFeature]}>
        <GlassIcon icon={Icon} tone={tone} size={56} />
        <Text variant="heading" style={primary ? styles.featureTitle : undefined}>{title}</Text>
        <Text variant="muted">{description}</Text>
        {primary ? <Button title="Get Started" icon={ArrowRight} onPress={onPress} style={styles.startButton} /> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  avatarText: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold' },
  badge: { alignSelf: 'flex-start', backgroundColor: '#000000', borderRadius: 999, color: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 3 },
  feature: { minHeight: 190 },
  featureTitle: { marginTop: 8 },
  greetingRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  grid: { gap: 24 },
  header: { gap: 8 },
  primaryFeature: { minHeight: 300 },
  search: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 12, minHeight: 50, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16 },
  startButton: { alignSelf: 'flex-start', marginTop: 16, minWidth: 148 },
});
