import { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Card } from './Card';
import { GlassIcon } from './GlassIcon';
import { LockBadge } from './LockBadge';
import { Text } from './Text';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked?: boolean;
  onPress?: () => void;
}

export function PremiumFeatureCard({ title, description, icon, unlocked = false, onPress }: PremiumFeatureCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card className="gap-4">
        <View className="flex-row items-start justify-between gap-3">
          <GlassIcon icon={icon} tone={unlocked ? 'green' : 'violet'} size={52} />
          {unlocked ? (
            <Text className="rounded-full px-3 py-1 normal-case" style={{ backgroundColor: colors.success, color: colors.successText, fontFamily: 'PlusJakartaSans_700Bold', overflow: 'hidden' }}>
              Unlocked
            </Text>
          ) : (
            <LockBadge />
          )}
        </View>
        <Text variant="heading">{title}</Text>
        <Text variant="muted">{description}</Text>
      </Card>
    </Pressable>
  );
}

