import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function HeroVisual() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.wrap, { shadowColor: colors.shadow }]}>
      <Svg width="100%" height="100%" viewBox="0 0 320 190">
        <Defs>
          <LinearGradient id="base" x1="34" y1="8" x2="286" y2="184">
            <Stop offset="0" stopColor={colorScheme === 'dark' ? '#22D3EE' : '#60A5FA'} />
            <Stop offset="0.56" stopColor={colorScheme === 'dark' ? '#8B5CF6' : '#2563EB'} />
            <Stop offset="1" stopColor={colorScheme === 'dark' ? '#FB923C' : '#F97316'} />
          </LinearGradient>
          <LinearGradient id="paper" x1="106" y1="32" x2="215" y2="150">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor={colorScheme === 'dark' ? '#CBD5E1' : '#EFF6FF'} />
          </LinearGradient>
        </Defs>
        <Ellipse cx="160" cy="158" rx="106" ry="18" fill={colorScheme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(37,99,235,0.14)'} />
        <Path d="M67 42c0-17.7 14.3-32 32-32h122c17.7 0 32 14.3 32 32v70c0 17.7-14.3 32-32 32H99c-17.7 0-32-14.3-32-32V42Z" fill="url(#base)" />
        <Path d="M77 45c0-13.8 11.2-25 25-25h116c13.8 0 25 11.2 25 25v12c-40 20-96 22-166 5V45Z" fill="rgba(255,255,255,0.22)" />
        <Rect x="112" y="36" width="96" height="116" rx="14" fill="url(#paper)" />
        <Rect x="128" y="58" width="64" height="8" rx="4" fill={colors.primary} opacity="0.92" />
        <Rect x="128" y="78" width="48" height="6" rx="3" fill="#94A3B8" />
        <Rect x="128" y="94" width="63" height="6" rx="3" fill="#94A3B8" />
        <Rect x="128" y="110" width="42" height="6" rx="3" fill="#94A3B8" />
        <Path d="M211 78h35c8.3 0 15 6.7 15 15v22c0 8.3-6.7 15-15 15h-35c-8.3 0-15-6.7-15-15V93c0-8.3 6.7-15 15-15Z" fill={colorScheme === 'dark' ? '#111827' : '#FFFFFF'} opacity="0.94" />
        <Path d="M213 105l10 10 23-26" fill="none" stroke={colors.success} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M67 90h42c7.2 0 13 5.8 13 13v26c0 7.2-5.8 13-13 13H67c-7.2 0-13-5.8-13-13v-26c0-7.2 5.8-13 13-13Z" fill={colorScheme === 'dark' ? '#111827' : '#FFFFFF'} opacity="0.94" />
        <Path d="M74 111h31M74 125h22" stroke={colors.accent} strokeWidth="7" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    aspectRatio: 1.68,
    elevation: 10,
    marginVertical: 4,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    width: '100%',
  },
});

