import { Save, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { resumeSteps } from '@/constants/app.constants';
import { emptyResume, exportResumePdf, saveResume } from '@/services/resume.service';
import { useAuth } from '@/store/userStore';
import type { ResumeDraft } from '@/types/resume.types';

export default function ResumeBuilderScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [resume, setResume] = useState<ResumeDraft>(emptyResume);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof ResumeDraft>(key: K, value: ResumeDraft[K]) {
    setResume((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      await saveResume(user?.id, resume);
      Alert.alert('Resume saved', 'Your resume draft is ready.');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      setLoading(true);
      await exportResumePdf(resume);
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">Resume Builder</Text>
        <Text variant="muted">Step {step + 1} of {resumeSteps.length}: {resumeSteps[step]}</Text>
      </View>

      <View style={styles.steps}>
        {resumeSteps.map((item, index) => (
          <View key={item} style={[styles.dot, index <= step && styles.dotActive]} />
        ))}
      </View>

      <Card>{renderStep(step, resume, update)}</Card>

      <View style={styles.actions}>
        <Button title="Back" variant="secondary" disabled={step === 0} onPress={() => setStep((value) => Math.max(0, value - 1))} style={styles.action} />
        <Button title={step === resumeSteps.length - 1 ? 'Save' : 'Next'} loading={loading} onPress={step === resumeSteps.length - 1 ? handleSave : () => setStep((value) => value + 1)} style={styles.action} />
      </View>
      <Button title="Export PDF" icon={Share2} variant="secondary" loading={loading} onPress={handleExport} />
      <Button title="Save Draft" icon={Save} variant="ghost" loading={loading} onPress={handleSave} />
    </Screen>
  );
}

function renderStep(step: number, resume: ResumeDraft, update: <K extends keyof ResumeDraft>(key: K, value: ResumeDraft[K]) => void) {
  switch (step) {
    case 0:
      return (
        <>
          <FormField label="Resume title" value={resume.title} onChangeText={(value) => update('title', value)} />
          <FormField label="Full name" value={resume.personal.fullName} onChangeText={(value) => update('personal', { ...resume.personal, fullName: value })} />
          <FormField label="Email" value={resume.personal.email} onChangeText={(value) => update('personal', { ...resume.personal, email: value })} />
          <FormField label="Phone" value={resume.personal.phone} onChangeText={(value) => update('personal', { ...resume.personal, phone: value })} />
          <FormField label="Location" value={resume.personal.location} onChangeText={(value) => update('personal', { ...resume.personal, location: value })} />
          <FormField label="Links" value={resume.personal.links} onChangeText={(value) => update('personal', { ...resume.personal, links: value })} />
        </>
      );
    case 1:
      return <FormField label="Education" multiline value={resume.education} onChangeText={(value) => update('education', value)} placeholder="Degree, college, year, highlights" />;
    case 2:
      return <FormField label="Work experience" multiline value={resume.experience} onChangeText={(value) => update('experience', value)} placeholder="One impact bullet per line" />;
    case 3:
      return <FormField label="Skills" multiline value={resume.skills} onChangeText={(value) => update('skills', value)} placeholder="React, React Native, TypeScript, AEM..." />;
    case 4:
      return <FormField label="Projects" multiline value={resume.projects} onChangeText={(value) => update('projects', value)} placeholder="Project name, stack, measurable outcome" />;
    case 5:
      return <FormField label="Certifications" multiline value={resume.certifications} onChangeText={(value) => update('certifications', value)} />;
    case 6:
      return <FormField label="Languages" value={resume.languages} onChangeText={(value) => update('languages', value)} placeholder="English, Hindi..." />;
    default:
      return <FormField label="Professional summary" multiline value={resume.summary} onChangeText={(value) => update('summary', value)} placeholder="3-4 lines tailored to your target role" />;
  }
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  steps: { flexDirection: 'row', gap: 6 },
  dot: { backgroundColor: '#D1D5DB', borderRadius: 4, flex: 1, height: 8 },
  dotActive: { backgroundColor: '#0F766E' },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
});

