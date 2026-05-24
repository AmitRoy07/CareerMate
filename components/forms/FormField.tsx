import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Text } from '@/components/ui/Text';

interface FormFieldProps extends TextInputProps {
  label: string;
}

export function FormField({ label, style, multiline, ...props }: FormFieldProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          multiline && styles.multiline,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  multiline: {
    minHeight: 112,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
});
