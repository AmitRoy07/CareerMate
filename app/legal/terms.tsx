import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function TermsScreen() {
  return (
    <Screen>
      <Text variant="title">Terms & Conditions</Text>
      <Text variant="muted">Last updated: May 24, 2026</Text>

      <Card>
        <Text variant="heading">Use Of CareerMate</Text>
        <Text>CareerMate India is a career utility app for resume creation, salary estimation, interview preparation, and AI-assisted review. You are responsible for keeping your account secure and providing accurate information.</Text>
      </Card>

      <Card>
        <Text variant="heading">Career And Salary Guidance</Text>
        <Text>Resume suggestions, interview answers, ATS scores, and salary calculations are informational estimates. They do not guarantee employment, interview selection, compensation, tax outcomes, or legal compliance.</Text>
      </Card>

      <Card>
        <Text variant="heading">User Content</Text>
        <Text>You retain ownership of resume text, uploaded files, profile images, and other content you provide. You grant the app permission to process that content only to deliver requested features.</Text>
      </Card>

      <Card>
        <Text variant="heading">Prohibited Use</Text>
        <Text>Do not upload unlawful content, impersonate others, abuse AI analysis, bypass rate limits, reverse engineer protected services, or use the app to create misleading job application materials.</Text>
      </Card>

      <Card>
        <Text variant="heading">Subscriptions And Changes</Text>
        <Text>Future paid plans may include templates, advanced AI analysis, premium interview packs, and Vault Plus document backup. Vault Plus is planned at $1/month. Pricing, features, and availability may change with notice inside the app or store listing.</Text>
      </Card>

      <Card>
        <Text variant="heading">Document Vault</Text>
        <Text>Local vault files remain on your device unless you enable cloud sync. You are responsible for ensuring uploaded identity, education, and employment documents are yours and are stored in compliance with applicable laws.</Text>
      </Card>
    </Screen>
  );
}
