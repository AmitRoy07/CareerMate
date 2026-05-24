import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Filter, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppTopBar } from '@/components/ui/AppTopBar';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  interviewCompanies,
  interviewDifficulties,
  interviewQuestions,
  interviewSources,
} from '@/services/interview.service';

export default function InterviewQuestionsScreen() {
  const { category = 'JavaScript' } = useLocalSearchParams<{ category?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('All');
  const [company, setCompany] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const isDsa = category === 'DSA';

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
        .slice(0, 80),
    [category, company, difficulty, query, source],
  );

  const totalInCategory = interviewQuestions.filter((item) => item.category === category).length;
  const visibleCompanies = interviewCompanies.slice(0, 24);

  return (
    <Screen>
      <AppTopBar title={category} backIcon={ArrowLeft} onBack={() => router.back()} />
      <View style={styles.hero}>
        <Text variant="label" style={{ color: colors.primary }}>Focused Practice</Text>
        <Text variant="title">{category} Questions</Text>
        <Text variant="muted">{totalInCategory.toLocaleString('en-IN')} total questions. Use search and filters only when needed.</Text>
      </View>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.muted} size={18} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search this module" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text }]} />
      </View>

      <FilterRow label="Source" values={['All', ...interviewSources]} selected={source} onSelect={setSource} colors={colors} />
      {isDsa ? (
        <>
          <FilterRow label="Difficulty" values={['All', ...interviewDifficulties]} selected={difficulty} onSelect={setDifficulty} colors={colors} />
          <FilterRow label="Company" values={['All', ...visibleCompanies]} selected={company} onSelect={setCompany} colors={colors} />
        </>
      ) : null}

      <View style={styles.resultMeta}>
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
            <Text style={{ color: item === selected ? '#FFFFFF' : colors.text, fontFamily: 'PlusJakartaSans_700Bold' }}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterBlock: { gap: 8 },
  hero: { gap: 8 },
  question: { fontSize: 18, lineHeight: 25 },
  resultMeta: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  search: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 50, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16 },
});

