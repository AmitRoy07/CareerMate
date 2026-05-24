import { router } from 'expo-router';
import { Building2, Filter, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { GradientPanel } from '@/components/ui/GradientPanel';
import { AppTopBar } from '@/components/ui/AppTopBar';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  interviewBankMeta,
  interviewCategories,
  interviewCompanies,
  interviewDifficulties,
  interviewQuestions,
  interviewSources,
} from '@/services/interview.service';

export default function InterviewScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('JavaScript');
  const [source, setSource] = useState('All');
  const [company, setCompany] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const questions = useMemo(
    () =>
      interviewQuestions
        .filter((item) => item.category === category)
        .filter((item) => source === 'All' || item.source.name === source)
        .filter((item) => company === 'All' || item.company === company)
        .filter((item) => difficulty === 'All' || item.difficulty === difficulty)
        .filter((item) => {
          const needle = query.toLowerCase();
          return (
            item.question.toLowerCase().includes(needle) ||
            item.answer.toLowerCase().includes(needle) ||
            item.tags.join(' ').toLowerCase().includes(needle) ||
            (item.company ?? '').toLowerCase().includes(needle)
          );
        })
        .slice(0, 120),
    [category, company, difficulty, query, source],
  );

  const categoryCount = interviewQuestions.filter((item) => item.category === category).length;
  const visibleCompanies = interviewCompanies.slice(0, 24);

  return (
    <Screen>
      <AppTopBar title="CareerMate" />
      <View style={styles.header}>
        <Text variant="label" style={{ color: colors.primary }}>Interview Preparation</Text>
        <Text variant="title">Interview Prep</Text>
        <Text variant="muted">Master key concepts with {interviewBankMeta.total.toLocaleString('en-IN')} questions from frontend, quizzes, and company-wise DSA practice.</Text>
      </View>

      <View style={styles.moduleGrid}>
        {interviewCategories.slice(0, 6).map((item) => {
          const count = interviewQuestions.filter((question) => question.category === item).length;
          return (
            <Pressable key={item} onPress={() => setCategory(item)}>
              <Card style={[styles.moduleCard, item === category && { borderColor: colors.primary }]}>
                <GlassIcon icon={Building2} tone={item === 'DSA' ? 'orange' : 'blue'} size={64} />
                <Text variant="heading">{item}</Text>
                <Text variant="muted">{count.toLocaleString('en-IN')} questions</Text>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <GradientPanel>
        <Text variant="label" style={{ color: '#E0F2FE' }}>Selected track</Text>
        <Text variant="metric" style={{ color: '#FFFFFF' }}>{categoryCount.toLocaleString('en-IN')} questions</Text>
        <Text style={{ color: '#EFF6FF' }}>Showing the first 120 matches for speed. Search or filter to narrow it down.</Text>
      </GradientPanel>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.muted} size={18} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search questions" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text }]} />
      </View>

      <FilterRow label="Category" values={interviewCategories} selected={category} onSelect={(value) => setCategory(value)} colors={colors} />
      <FilterRow label="Source" values={['All', ...interviewSources]} selected={source} onSelect={(value) => setSource(value)} colors={colors} />
      {category === 'DSA' ? (
        <>
          <FilterRow label="Difficulty" values={['All', ...interviewDifficulties]} selected={difficulty} onSelect={(value) => setDifficulty(value)} colors={colors} />
          <FilterRow label="Company" values={['All', ...visibleCompanies]} selected={company} onSelect={(value) => setCompany(value)} colors={colors} />
        </>
      ) : null}

      <View style={styles.chips}>
        <Filter color={colors.muted} size={16} />
        <Text variant="muted">{questions.length.toLocaleString('en-IN')} visible matches</Text>
      </View>

      {questions.map((item) => (
        <Pressable key={item.id} onPress={() => router.push({ pathname: '/interview/[id]', params: { id: item.id } })}>
          <Card>
            <View style={styles.cardHeader}>
              <Text variant="label">{item.type.toUpperCase()}{item.difficulty ? ` | ${item.difficulty}` : ''}</Text>
              {item.company ? <Text variant="label">{item.company}</Text> : null}
            </View>
            <Text variant="heading" style={styles.question}>{item.question}</Text>
            <Text variant="muted" numberOfLines={2}>{item.answer}</Text>
            <Text variant="label">{item.source.name}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

function FilterRow({
  label,
  values,
  selected,
  onSelect,
  colors,
}: {
  label: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text variant="label">{label}</Text>
      <View style={styles.chips}>
        {values.map((item) => (
          <Pressable key={item} onPress={() => onSelect(item)} style={[styles.chip, { borderColor: colors.border, backgroundColor: item === selected ? colors.primary : colors.surface }]}>
            <Text style={{ color: item === selected ? '#FFFFFF' : colors.text, fontWeight: '800' }}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  search: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 48, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 15 },
  filterBlock: { gap: 8 },
  moduleCard: { minHeight: 180 },
  moduleGrid: { gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  cardHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  question: { fontSize: 17, lineHeight: 23 },
});
