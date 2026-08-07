import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, type as typeScale, shadow } from "@/theme/theme";

interface StatusStampProps {
  label: string;
  time?: string | null;
  tone: "present" | "absent" | "closed" | "neutral";
  size?: "large" | "small";
}

const toneColor: Record<StatusStampProps["tone"], string> = {
  present: colors.present,
  absent: colors.absent,
  closed: colors.closed,
  neutral: colors.pine,
};

/**
 * A stamped-ticket shape used everywhere the app confirms something has
 * happened: a drop-off logged, a day marked present, a scan completed.
 * The notch on the left edge is the recurring "torn ticket" detail.
 */
export function StatusStamp({
  label,
  time,
  tone,
  size = "large",
}: StatusStampProps) {
  const tint = toneColor[tone];
  const isLarge = size === "large";

  return (
    <View
      style={[
        styles.wrapper,
        isLarge ? styles.wrapperLarge : styles.wrapperSmall,
        shadow.stamp,
      ]}
    >
      <View style={[styles.notch, { backgroundColor: colors.paper }]} />
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text
        style={[
          isLarge ? typeScale.h3 : typeScale.captionMedium,
          { color: colors.ink },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {time ? (
        <Text
          style={[typeScale.caption, { color: colors.inkMuted, marginTop: 2 }]}
        >
          {time}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    position: "relative",
    overflow: "hidden",
  },
  wrapperLarge: {
    // minWidth: 200,
    minWidth: "49%",
  },
  wrapperSmall: {
    minWidth: 96,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  notch: {
    position: "absolute",
    left: -8,
    top: "50%",
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
});
