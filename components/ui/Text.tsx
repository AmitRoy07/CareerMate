import { PropsWithChildren } from 'react';
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface TextProps extends RNTextProps, PropsWithChildren {
  variant?: 'title' | 'heading' | 'body' | 'muted' | 'label' | 'metric';
  className?: string;
}

export function Text({ children, style, variant = 'body', className, ...props }: TextProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <RNText
      {...props}
      className={className}
      style={[
        styles.base,
        { color: variant === 'muted' || variant === 'label' ? colors.muted : colors.text },
        styles[variant],
        style,
      ]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: { fontFamily: 'PlusJakartaSans_400Regular', letterSpacing: 0 },
  title: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 30, lineHeight: 38 },
  heading: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, lineHeight: 30 },
  body: { fontSize: 16, lineHeight: 24 },
  muted: { fontSize: 16, lineHeight: 24 },
  label: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, textTransform: 'uppercase' },
  metric: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 28, lineHeight: 34 },
});
