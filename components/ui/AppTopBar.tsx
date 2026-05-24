import { Bell, Menu, Share2, Bookmark, LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text } from './Text';

interface AppTopBarProps {
  title?: string;
  backIcon?: LucideIcon;
  onBack?: () => void;
  actions?: 'default' | 'question';
}

export function AppTopBar({ title = 'CareerMate', backIcon: BackIcon = Menu, onBack, actions = 'default' }: AppTopBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.bar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.iconButton}>
          <BackIcon color={colors.primary} size={22} />
        </Pressable>
        <Text variant="heading" style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.actions}>
        {actions === 'question' ? <Bookmark color={colors.primary} size={22} /> : null}
        {actions === 'question' ? <Share2 color={colors.primary} size={22} /> : <Bell color={colors.primary} size={22} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  bar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: { padding: 6 },
  left: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  title: { fontSize: 24, lineHeight: 30 },
});
