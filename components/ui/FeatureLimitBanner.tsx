import { AlertCircle } from 'lucide-react-native';
import { View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text } from './Text';

interface FeatureLimitBannerProps {
  title: string;
  message: string;
}

export function FeatureLimitBanner({ title, message }: FeatureLimitBannerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View className="flex-row gap-3 rounded-xl border p-4" style={{ backgroundColor: colors.primarySoft, borderColor: colors.border }}>
      <AlertCircle color={colors.primary} size={22} />
      <View className="flex-1 gap-1">
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>{title}</Text>
        <Text variant="muted">{message}</Text>
      </View>
    </View>
  );
}
