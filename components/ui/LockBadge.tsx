import { Lock } from 'lucide-react-native';
import { View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text } from './Text';

interface LockBadgeProps {
  label?: string;
}

export function LockBadge({ label = 'Premium' }: LockBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View className="flex-row items-center gap-1 rounded-full px-3 py-1" style={{ backgroundColor: colors.primarySoft }}>
      <Lock color={colors.primary} size={13} />
      <Text className="normal-case" style={{ color: colors.primary, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

