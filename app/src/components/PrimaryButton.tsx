import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { colors, radius, type as typeScale } from "@/theme/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && { backgroundColor: colors.honey },
        isSecondary && { backgroundColor: colors.pine },
        variant === "ghost" && { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.pine },
        (disabled || loading) && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.pine : colors.white} />
      ) : (
        <Text
          style={[
            typeScale.bodyMedium,
            { color: variant === "ghost" ? colors.pine : colors.white },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
