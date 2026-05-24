import { router } from 'expo-router';
import { Edit3, FileText, MoreVertical, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppTopBar } from '@/components/ui/AppTopBar';
import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ResumeTabScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Screen>
      <AppTopBar title="CareerMate" />
      <View style={styles.hero}>
        <Text variant="title">Your Resumes</Text>
        <Text variant="muted">Craft, manage, and optimize your professional identity for the Indian job market.</Text>
      </View>

      <Pressable onPress={() => router.push('/resume/builder')}>
        <Card style={[styles.createCard, { backgroundColor: colors.navy }]}>
          <View style={[styles.plus, { backgroundColor: colors.secondary }]}>
            <Plus color="#FFFFFF" size={26} />
          </View>
          <Text variant="heading" style={[styles.createTitle, { color: colors.onNavy }]}>Create New Resume</Text>
          <Text variant="muted" style={{ color: colorScheme === 'dark' ? colors.muted : '#7C839B' }}>Start with a template or AI-assisted generator.</Text>
          <Text style={[styles.quickStart, { color: colorScheme === 'dark' ? colors.primary : '#DBE1FF' }]}>Quick Start {'->'}</Text>
        </Card>
      </Pressable>

      <ResumeItem title="Senior Developer Resume" status="Complete" date="Oct 24, 2023" />
      <ResumeItem title="Product Manager Draft" status="Draft" date="2 hours ago" />
      <ResumeItem title="UX Design Portfolio" status="Complete" date="Jan 18, 2024" />

      <Pressable onPress={() => router.push('/resume/builder')} style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Plus color="#FFFFFF" size={30} />
      </Pressable>
    </Screen>
  );
}

function ResumeItem({ title, status, date }: { title: string; status: 'Complete' | 'Draft'; date: string }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const complete = status === 'Complete';

  return (
    <Card>
      <View style={styles.itemHeader}>
        <GlassIcon icon={FileText} tone="blue" size={42} />
        <Text style={[styles.status, { backgroundColor: complete ? colors.success : colors.primarySoft, color: complete ? colors.successText : colors.text }]}>{status}</Text>
      </View>
      <Text variant="heading" style={styles.itemTitle}>{title}</Text>
      <Text variant="muted">Last modified: {date}</Text>
      <View style={styles.itemActions}>
        <View style={styles.avatarSmall} />
        <View style={styles.actionIcons}>
          <Edit3 color={colors.muted} size={20} />
          <MoreVertical color={colors.muted} size={20} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actionIcons: { flexDirection: 'row', gap: 20 },
  avatarSmall: { backgroundColor: '#0B1C30', borderRadius: 14, height: 28, width: 28 },
  createCard: { borderWidth: 0, minHeight: 256 },
  createTitle: { marginTop: 8 },
  fab: { alignItems: 'center', borderRadius: 28, bottom: 88, elevation: 10, height: 56, justifyContent: 'center', position: 'absolute', right: 24, width: 56 },
  hero: { gap: 8 },
  itemActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  itemHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  itemTitle: { fontSize: 20 },
  plus: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  quickStart: { fontFamily: 'PlusJakartaSans_700Bold', marginTop: 8 },
  status: { borderRadius: 999, fontFamily: 'PlusJakartaSans_600SemiBold', overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 6 },
});
