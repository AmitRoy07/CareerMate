import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface GlassIconProps {
  icon: LucideIcon;
  size?: number;
  tone?: 'blue' | 'cyan' | 'orange' | 'violet' | 'green';
}

const toneStops = {
  blue: ['#60A5FA', '#2563EB'],
  cyan: ['#67E8F9', '#0891B2'],
  orange: ['#FDBA74', '#F97316'],
  violet: ['#C4B5FD', '#7C3AED'],
  green: ['#86EFAC', '#10B981'],
};

export function GlassIcon({ icon: Icon, size = 54, tone = 'blue' }: GlassIconProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [start, end] = toneStops[tone];

  return (
    <View style={[styles.wrap, { height: size, width: size, shadowColor: colors.shadow }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="g" x1="10" y1="4" x2="58" y2="60">
            <Stop offset="0" stopColor={start} />
            <Stop offset="1" stopColor={end} />
          </SvgGradient>
        </Defs>
        <Path d="M14 8h30c7.7 0 14 6.3 14 14v20c0 7.7-6.3 14-14 14H20C12.3 56 6 49.7 6 42V22C6 14.3 12.3 8 20 8Z" fill="url(#g)" />
        <Path d="M16 10h28c6.6 0 12 5.4 12 12v2c-12.4 6.6-29.5 7.4-48 2v-4c0-6.6 5.4-12 12-12Z" fill="rgba(255,255,255,0.24)" />
      </Svg>
      <Icon color="#FFFFFF" size={Math.round(size * 0.42)} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    elevation: 8,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
});

