import React from "react";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { Child } from "@/types";
import { colors, radius, type as typeScale } from "@/theme/theme";
import { ChildAvatar } from "@/components/ChildAvatar";

interface ChildSelectorProps {
  childList: Child[];
  selectedChildId: string | null;
  onSelect: (id: string) => void;
}

export function ChildSelector({
  childList,
  selectedChildId,
  onSelect,
}: ChildSelectorProps) {
  if (childList.length <= 1) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {childList.map((child) => {
        const selected = child.id === selectedChildId;
        return (
          <Pressable
            key={child.id}
            onPress={() => onSelect(child.id)}
            style={[
              styles.pill,
              { borderColor: child.avatarColor },
              selected && { backgroundColor: child.avatarColor },
            ]}
          >
            <ChildAvatar
              color={selected ? colors.white : child.avatarColor}
              size={22}
            />
            <Text
              style={[
                typeScale.bodyMedium,
                { color: selected ? colors.white : colors.ink, marginLeft: 8 },
              ]}
            >
              {child.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: colors.paperRaised,
  },
});
