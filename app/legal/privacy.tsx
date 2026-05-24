import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function PrivacyPolicyScreen() {
  return (
    <Screen>
      <Text variant="title">Privacy Policy</Text>
      <Text variant="muted">Last updated: May 24, 2026</Text>

      <Card>
        <Text variant="heading">What We Collect</Text>
        <Text>CareerMate India may collect account details, resume content, interview favorites, salary calculator inputs, uploaded files, device metadata, and support messages you choose to provide.</Text>
      </Card>

      <Card>
        <Text variant="heading">How We Use Data</Text>
        <Text>We use your data to provide authentication, resume building, PDF export, AI analysis, salary estimates, interview preparation, profile personalization, security, support, and product improvement.</Text>
      </Card>

      <Card>
        <Text variant="heading">AI Processing</Text>
        <Text>Resume analysis must run through a secure backend or serverless function. AI provider keys should never be stored in the mobile app. Uploaded resumes may be processed by configured AI providers only to generate requested feedback.</Text>
      </Card>

      <Card>
        <Text variant="heading">Storage And Security</Text>
        <Text>User-specific records should be protected with Supabase Row Level Security. Files should be stored in protected buckets unless intentionally public, and sensitive access should be rate limited and logged.</Text>
      </Card>

      <Card>
        <Text variant="heading">Your Choices</Text>
        <Text>You can update your profile, delete uploaded files, request account deletion, and contact support for data export or correction. Production builds should publish a support email and deletion SLA.</Text>
      </Card>
    </Screen>
  );
}

