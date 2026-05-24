import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function GlassBackground({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.root, { backgroundColor: Colors[colorScheme].background }]}>
      <LinearGradient
        colors={isDark ? ['#0B1220', '#111827', '#0B1220'] : ['#F8F9FF', '#F8F9FF', '#EFF4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={isDark ? ['rgba(49,107,243,0.12)', 'rgba(0,0,0,0)', 'rgba(104,219,169,0.08)'] : ['rgba(219,225,255,0.75)', 'rgba(255,255,255,0)', 'rgba(229,238,255,0.9)']}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.aurora}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  aurora: {
    bottom: 0,
    left: 0,
    opacity: 0.9,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
