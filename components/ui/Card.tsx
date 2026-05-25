import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <View className={`rounded-card border gap-4 p-6 ${className ?? ''}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 4,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
  },
});
