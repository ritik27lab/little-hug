import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AgendaDay } from "@/types";
import { colors, radius, spacing, type as typeScale, shadow } from "@/theme/theme";

interface AgendaDayCardProps {
  day: AgendaDay;
}

export function AgendaDayCard({ day }: AgendaDayCardProps) {
  const dateLabel = new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.pin} />
      <Text style={[typeScale.h3, { color: colors.pine, marginBottom: spacing.sm }]}>{dateLabel}</Text>

      {day.meals.length > 0 && (
        <Section title="Meals" items={day.meals} />
      )}
      {day.naps.length > 0 && (
        <Section title="Naps" items={day.naps} />
      )}
      {day.activities.length > 0 && (
        <Section
          title="Activities"
          items={day.activities.map((a) => (a.time ? `${a.time} — ${a.label}` : a.label))}
        />
      )}
      {day.notes.length > 0 && (
        <Section title="Notes from the crèche" items={day.notes} accent />
      )}
    </View>
  );
}

function Section({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={[typeScale.captionMedium, { color: colors.inkFaint, marginBottom: 4 }]}>
        {title.toUpperCase()}
      </Text>
      {items.map((item, idx) => (
        <Text
          key={idx}
          style={[
            typeScale.body,
            { color: accent ? colors.honeyDark : colors.ink, marginBottom: 2 },
          ]}
        >
          • {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    position: "relative",
  },
  pin: {
    position: "absolute",
    top: -6,
    left: spacing.md,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.honey,
  },
});
