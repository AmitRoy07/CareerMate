import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface GradientPanelProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function GradientPanel({ children, style }: GradientPanelProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <LinearGradient
      colors={[colors.secondary, colors.primary, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.panel, { shadowColor: colors.shadow }, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 8,
    elevation: 8,
    gap: 10,
    overflow: 'hidden',
    padding: 18,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 26,
  },
});

