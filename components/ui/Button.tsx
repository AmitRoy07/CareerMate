import { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text } from './Text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, icon: Icon, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const backgroundColor = isPrimary ? '#000000' : isDanger ? colors.danger : colors.surface;
  const textColor = isPrimary || isDanger ? '#FFFFFF' : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variant === 'ghost' ? 'transparent' : backgroundColor,
          borderColor: variant === 'secondary' ? colors.primary : variant === 'ghost' ? 'transparent' : colors.border,
          shadowColor: colors.shadow,
          opacity: pressed || disabled ? 0.72 : 1,
        },
        style,
      ]}>
      {isPrimary ? <LinearGradient colors={['#000000', '#000000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /> : null}
      {loading ? <ActivityIndicator color={textColor} /> : Icon ? <Icon color={textColor} size={18} /> : null}
      <Text style={[styles.title, { color: variant === 'secondary' ? colors.primary : textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    overflow: 'hidden',
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  title: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 },
});
