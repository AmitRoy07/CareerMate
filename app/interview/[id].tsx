import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { AppTopBar } from '@/components/ui/AppTopBar';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { findInterviewQuestion } from '@/services/interview.service';

export default function InterviewQuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = findInterviewQuestion(id);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(`favorite:${id}`).then((value) => setFavorite(value === 'true'));
  }, [id]);

  if (!question) {
    return (
      <Screen>
        <Text variant="title">Question not found</Text>
      </Screen>
    );
  }

  async function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    await AsyncStorage.setItem(`favorite:${id}`, String(next));
    Alert.alert(next ? 'Added to favorites' : 'Removed from favorites');
  }

  return (
    <Screen>
      <AppTopBar title="CareerMate" backIcon={ArrowLeft} onBack={() => router.back()} actions="question" />
      <View style={styles.meta}>
        <Text variant="label">{question.category}</Text>
        <Text variant="label">{question.type.toUpperCase()}{question.difficulty ? ` | ${question.difficulty}` : ''}</Text>
      </View>
      <Text variant="title">{question.question}</Text>
      {question.company ? <Text variant="muted">Company: {question.company}</Text> : null}

      {question.options.length ? (
        <Card>
          <Text variant="heading">Options</Text>
          {question.options.map((option, index) => (
            <Text key={`${question.id}-${option}`} style={option === question.correctOption ? styles.correct : undefined}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          ))}
        </Card>
      ) : null}

      <Card>
        <Text variant="heading">{question.type === 'coding' ? 'Practice notes' : 'Answer'}</Text>
        <Text>{question.answer}</Text>
      </Card>

      {question.tags.length ? (
        <Card>
          <Text variant="heading">Tags</Text>
          <View style={styles.tags}>
            {question.tags.slice(0, 12).map((tag) => (
              <Text key={tag} variant="label" style={styles.tag}>{tag}</Text>
            ))}
          </View>
        </Card>
      ) : null}

      <Card>
        <Text variant="heading">Source</Text>
        <Text>{question.source.name}</Text>
        <Text variant="muted">License: {question.source.license}</Text>
        {question.link ? <Button title="Open practice link" icon={ExternalLink} variant="secondary" onPress={() => Linking.openURL(question.link!)} /> : null}
        {question.source.url !== 'local' ? <Button title="Open source repo" icon={ExternalLink} variant="ghost" onPress={() => Linking.openURL(question.source.url)} /> : null}
      </Card>

      <Button title={favorite ? 'Favorited' : 'Mark favorite'} icon={Star} variant={favorite ? 'primary' : 'secondary'} onPress={toggleFavorite} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  correct: { color: '#10B981', fontWeight: '800' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  tag: { borderColor: 'rgba(148,163,184,0.32)', borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
