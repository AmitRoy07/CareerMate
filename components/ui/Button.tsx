import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Text } from "./Text";

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Button({
  title,
  onPress,
  icon: Icon,
  variant = "primary",
  loading,
  disabled,
  style,
  className,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const scale = useSharedValue(1);
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const primaryBackground =
    colorScheme === "dark" ? colors.secondary : "#000000";
  const backgroundColor = isPrimary
    ? primaryBackground
    : isDanger
      ? colors.danger
      : colors.surface;
  const textColor = isPrimary ? "#FFFFFF" : isDanger ? "#FFFFFF" : colors.text;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-12 flex-row items-center justify-center gap-2 overflow-hidden rounded-lg border px-4 ${className ?? ""}`}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 280 });
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            variant === "ghost" ? "transparent" : backgroundColor,
          borderColor:
            variant === "secondary"
              ? colors.primary
              : variant === "ghost"
                ? "transparent"
                : colors.border,
          shadowColor: colors.shadow,
          opacity: pressed || disabled ? 0.72 : 1,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {isPrimary ? (
          <LinearGradient
            colors={[primaryBackground, primaryBackground]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : Icon ? (
          <Icon color={textColor} size={18} />
        ) : null}
        <Text
          style={[
            styles.title,
            { color: variant === "secondary" ? colors.primary : textColor },
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    elevation: 3,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    position: "relative",
    width: "100%",
  },
  title: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 15 },
});
