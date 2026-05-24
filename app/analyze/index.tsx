import { Bot, FileUp } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { analyzeResume, pickResumePdf } from '@/services/ai.service';
import type { AiResumeReport } from '@/types/resume.types';

export default function AnalyzeResumeScreen() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [report, setReport] = useState<AiResumeReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePick() {
    const result = await pickResumePdf();
    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setReport(null);
    }
  }

  async function handleAnalyze() {
    if (!fileUri) {
      Alert.alert('Upload resume', 'Choose a PDF resume first.');
      return;
    }

    try {
      setLoading(true);
      setReport(await analyzeResume(fileUri));
    } catch (error) {
      Alert.alert('Analysis failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View>
        <GlassIcon icon={Bot} tone="violet" size={72} />
        <Text variant="title">AI Resume Analyzer</Text>
        <Text variant="muted">The mobile app calls a backend endpoint only. API keys stay off-device.</Text>
      </View>

      <Card>
        <Text variant="heading">Upload PDF</Text>
        <Text variant="muted">{fileUri ? 'Resume selected and ready for analysis.' : 'Pick a resume PDF from your device.'}</Text>
        <Button title="Choose PDF" icon={FileUp} variant="secondary" onPress={handlePick} />
        <Button title="Analyze resume" icon={Bot} loading={loading} onPress={handleAnalyze} />
      </Card>

      {report ? (
        <>
          <Card>
            <Text variant="label">ATS score</Text>
            <Text variant="metric">{report.atsScore}/100</Text>
          </Card>
          <Card>
            <Text variant="heading">Missing keywords</Text>
            {report.missingKeywords.map((item) => (
              <Text key={item}>- {item}</Text>
            ))}
          </Card>
          <Card>
            <Text variant="heading">Suggestions</Text>
            {report.suggestions.map((item) => (
              <Text key={item}>- {item}</Text>
            ))}
          </Card>
          <Card>
            <Text variant="heading">Rewritten summary</Text>
            <Text>{report.rewrittenSummary}</Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
