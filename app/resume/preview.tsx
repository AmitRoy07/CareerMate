import { Share2 } from 'lucide-react-native';
import { Alert, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { emptyResume, exportResumePdf } from '@/services/resume.service';

const sampleResume = {
  ...emptyResume,
  personal: { ...emptyResume.personal, fullName: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 98765 43210', location: 'Bengaluru' },
  summary: 'Frontend engineer focused on React, React Native, performance, and accessible product experiences.',
  skills: 'React, React Native, TypeScript, Next.js, AEM, Supabase',
  experience: 'Built reusable component systems for enterprise web apps\nImproved page performance and reduced UI defects through testable architecture',
  projects: 'CareerMate India - Expo app for resume building, salary planning, and interview prep',
};

export default function ResumePreviewScreen() {
  async function handleExport() {
    try {
      await exportResumePdf(sampleResume);
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <Screen>
      <View>
        <Text variant="title">Preview</Text>
        <Text variant="muted">Default clean template for ATS-friendly exports.</Text>
      </View>
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

