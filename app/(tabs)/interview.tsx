import { router } from 'expo-router';
import { ArrowRight, Braces, Brain, Code2, FileCode2, Globe2, Layout, Network, UsersRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppTopBar } from '@/components/ui/AppTopBar';
import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getInterviewCategoryCount, interviewBankMeta } from '@/services/interview.service';

const modules = [
  { category: 'HTML', label: 'Web Essentials', title: 'HTML', description: 'Semantic structures, accessibility, and modern SEO patterns.', icon: Globe2, tone: 'blue' },
  { category: 'CSS', label: 'Styling', title: 'CSS', description: 'Flexbox, Grid, animations, and responsive architecture.', icon: Layout, tone: 'cyan' },
  { category: 'JavaScript', label: 'Core Logic', title: 'JavaScript', description: 'Closures, prototypes, async/await, and ES6+ behavior.', icon: Braces, tone: 'orange' },
  { category: 'React', label: 'Frontend', title: 'React', description: 'Hooks, Virtual DOM, Context API, and state management.', icon: Network, tone: 'violet' },
  { category: 'React Native', label: 'Mobile', title: 'React Native', description: 'Navigation, native APIs, performance, and mobile UX patterns.', icon: FileCode2, tone: 'green' },
  { category: 'DSA', label: 'Companies', title: 'DSA Practice', description: 'Company-wise coding problems with difficulty and topic tags.', icon: Code2, tone: 'orange' },
  { category: 'HR Questions', label: 'Soft Skills', title: 'HR Questions', description: 'Structured answers for behavioral and career-fit rounds.', icon: UsersRound, tone: 'blue' },
] as const;

export default function InterviewScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Screen>
      <AppTopBar title="CareerMate" />
      <View style={styles.hero}>
        <Text variant="label" style={{ color: colors.primary }}>Interview Preparation</Text>
        <Text variant="title">Master Your Craft</Text>
        <Text variant="muted">Pick one focused module. Search, filters, and question lists open on the next screen so this page stays calm.</Text>
      </View>

      <Card style={[styles.summary, { backgroundColor: colors.navy, borderWidth: 0 }]}>
        <GlassIcon icon={Brain} tone="blue" size={62} />
        <View style={styles.summaryCopy}>
          <Text variant="metric" style={{ color: colors.onNavy }}>{interviewBankMeta.total.toLocaleString('en-IN')}</Text>
          <Text style={{ color: colorScheme === 'dark' ? colors.muted : '#DBE1FF' }}>questions across frontend, HR, quizzes, and company-wise coding rounds.</Text>
        </View>
      </Card>

      <View style={styles.modules}>
        {modules.map((item) => (
          <ModuleCard key={item.category} {...item} colors={colors} />
        ))}
      </View>
    </Screen>
  );
}

function ModuleCard({
  category,
  label,
  title,
  description,
  icon,
  tone,
  colors,
}: (typeof modules)[number] & { colors: typeof Colors.light }) {
  const count = getInterviewCategoryCount(category);

  return (
    <Pressable onPress={() => router.push({ pathname: '/interview/questions', params: { category } })}>
      <Card style={styles.moduleCard}>
        <View style={styles.moduleTop}>
          <GlassIcon icon={icon} tone={tone} size={64} />
          <Text style={[styles.pill, { backgroundColor: colors.primarySoft, color: colors.muted }]}>{label}</Text>
        </View>
        <Text variant="heading">{title}</Text>
        <Text variant="muted">{description}</Text>
        <View style={styles.moduleBottom}>
          <Text style={[styles.count, { color: colors.primary }]}>{count.toLocaleString('en-IN')} Questions</Text>
          <View style={[styles.arrow, { backgroundColor: colors.surfaceLow }]}>
            <ArrowRight color={colors.primary} size={24} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrow: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  count: { fontFamily: 'PlusJakartaSans_700Bold' },
  hero: { gap: 8 },
  moduleBottom: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  moduleCard: { minHeight: 250 },
  moduleTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  modules: { gap: 16 },
  pill: { borderRadius: 999, fontFamily: 'PlusJakartaSans_600SemiBold', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6 },
  summary: { alignItems: 'center', flexDirection: 'row' },
  summaryCopy: { flex: 1, gap: 4 },
});
