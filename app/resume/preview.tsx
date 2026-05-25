import { Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LockBadge } from '@/components/ui/LockBadge';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { emptyResume, exportResumePdf, getResumeTemplates } from '@/services/resume.service';
import { useAuth } from '@/store/userStore';
import type { ResumeTemplate } from '@/types/template.types';

const sampleResume = {
  ...emptyResume,
  personal: { ...emptyResume.personal, fullName: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 98765 43210', location: 'Bengaluru' },
  summary: 'Frontend engineer focused on React, React Native, performance, and accessible product experiences.',
  skills: 'React, React Native, TypeScript, Next.js, AEM, Supabase',
  experience: 'Built reusable component systems for enterprise web apps\nImproved page performance and reduced UI defects through testable architecture',
  projects: 'CareerMate India - Expo app for resume building, salary planning, and interview prep',
};

export default function ResumePreviewScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [templateId, setTemplateId] = useState('classic_basic');

  useEffect(() => {
    getResumeTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  async function handleExport() {
    try {
      await exportResumePdf({ resume: sampleResume, userId: user?.id, templateId });
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <Screen>
      <View>
        <Text variant="title">Preview</Text>
        <Text variant="muted">Choose an ATS-friendly template. Free exports keep a small watermark.</Text>
      </View>
      <Card>
        <Text variant="heading">Templates</Text>
        {templates.map((template) => (
          <Pressable
            key={template.id}
            onPress={() => setTemplateId(template.id)}
            style={{ alignItems: 'center', backgroundColor: templateId === template.id ? colors.primarySoft : colors.surfaceLow, borderColor: templateId === template.id ? colors.primary : colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 48, paddingHorizontal: 12 }}>
            <Text style={{ flex: 1, fontFamily: 'PlusJakartaSans_700Bold' }}>{template.name}</Text>
            {template.isPremium ? <LockBadge label="Premium" /> : <Text variant="label">Free</Text>}
          </Pressable>
        ))}
      </Card>
      <Card>
        <Text variant="heading">{sampleResume.personal.fullName}</Text>
        <Text variant="muted">{sampleResume.personal.email} | {sampleResume.personal.phone} | {sampleResume.personal.location}</Text>
        <Text variant="label">Summary</Text>
        <Text>{sampleResume.summary}</Text>
        <Text variant="label">Skills</Text>
        <Text>{sampleResume.skills}</Text>
        <Text variant="label">Experience</Text>
        <Text>{sampleResume.experience}</Text>
      </Card>
      <Button title="Export sample PDF" icon={Share2} onPress={handleExport} />
    </Screen>
  );
}
