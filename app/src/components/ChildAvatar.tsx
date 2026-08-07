import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ChildAvatarProps {
  color: string;
  size?: number;
}

/**
 * A child's identity everywhere in the app: a colored circle in their
 * assigned avatarColor with a simple kid glyph. Used in the Today screen
 * hero, the child selector pills, and the Family screen's child list —
 * one place to keep that look consistent.
 */
export function ChildAvatar({ color, size = 44 }: ChildAvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.55, lineHeight: size * 0.65 }}>🧒</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
