import { Link } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function NotFoundScreen() {
  return (
    <Screen>
      <Text variant="title">Screen not found</Text>
      <Link href="/(tabs)">
        <Text>Go home</Text>
      </Link>
    </Screen>
  );
}

