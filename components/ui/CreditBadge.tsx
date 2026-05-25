import { Coins } from 'lucide-react-native';
import { View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text } from './Text';

interface CreditBadgeProps {
  label: string;
  value: number;
}

export function CreditBadge({ label, value }: CreditBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View className="flex-row items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: colors.surfaceLow, borderColor: colors.border }}>
      <View className="flex-row items-center gap-2">
        <Coins color={colors.accent} size={18} />
        <Text>{label}</Text>
      </View>
      <Text style={{ color: colors.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>{value}</Text>
    </View>
  );
}

