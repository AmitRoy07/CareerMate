import { Alert } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function DeleteAccountScreen() {
  return (
    <Screen>
      <Text variant="title">Delete Account</Text>
      <Text variant="muted">Production apps must provide an account deletion path for app store compliance.</Text>

      <Card>
        <Text variant="heading">What Deletion Should Remove</Text>
        <Text>Your auth user, profile, resumes, resume sections, uploaded files, AI reports, salary history, and favorites should be deleted or anonymized where retention is legally required.</Text>
      </Card>

      <Card>
        <Text variant="heading">Backend Requirement</Text>
        <Text>Final deletion should run through a Supabase Edge Function using service-role credentials. The mobile app should only request deletion after re-authentication.</Text>
        <Button
          title="Request account deletion"
          icon={Trash2}
          variant="danger"
          onPress={() => Alert.alert('Deletion request', 'Connect this button to your secure delete-account Edge Function before production release.')}
        />
      </Card>
    </Screen>
  );
}

