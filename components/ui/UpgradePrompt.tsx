import { Crown } from 'lucide-react-native';
import { Alert } from 'react-native';

import { Button } from './Button';
import { Card } from './Card';
import { LockBadge } from './LockBadge';
import { Text } from './Text';

interface UpgradePromptProps {
  title: string;
  message: string;
  cta?: string;
  onMaybeLater?: () => void;
}

export function UpgradePrompt({ title, message, cta = 'View plans', onMaybeLater }: UpgradePromptProps) {
  return (
    <Card>
      <LockBadge />
      <Text variant="heading">{title}</Text>
      <Text variant="muted">{message}</Text>
      <Button
        title={cta}
        icon={Crown}
        onPress={() => Alert.alert('Premium plans', 'Payment gateway is not connected yet. This is the entitlement foundation only.')}
      />
      {onMaybeLater ? <Button title="Maybe later" variant="ghost" onPress={onMaybeLater} /> : null}
    </Card>
  );
}
