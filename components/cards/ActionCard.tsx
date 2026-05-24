import { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Text } from '@/components/ui/Text';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: 'blue' | 'cyan' | 'orange' | 'violet' | 'green';
  onPress: () => void;
}

export function ActionCard({ title, description, icon: Icon, tone = 'blue', onPress }: ActionCardProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Card style={[styles.card, { opacity: pressed ? 0.75 : 1 }]}>
          <GlassIcon icon={Icon} tone={tone} />
          <View style={styles.copy}>
            <Text variant="heading" style={styles.heading}>{title}</Text>
            <Text variant="muted">{description}</Text>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, minHeight: 104 },
  copy: { flex: 1, gap: 4 },
  heading: { fontSize: 17, lineHeight: 22 },
});
