import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { AttendanceDay, AttendanceStatus } from "@/types";
import { colors, radius, spacing, type as typeScale } from "@/theme/theme";

interface CalendarGridProps {
  monthDate: Date;
  attendance: AttendanceDay[];
  onDayPress: (date: string) => void;
}

const statusColor: Record<AttendanceStatus, string | null> = {
  present: colors.present,
  absent: colors.absent,
  closed: colors.closed,
  unknown: null,
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarGrid({ monthDate, attendance, onDayPress }: CalendarGridProps) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const attendanceByDate = new Map(attendance.map((a) => [a.date, a]));

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((d, i) => (
          <Text key={i} style={[typeScale.captionMedium, styles.weekdayLabel]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const entry = attendanceByDate.get(dateStr);
          const inMonth = isSameMonth(day, monthDate);
          const tint = entry ? statusColor[entry.status] : null;

          return (
            <Pressable
              key={dateStr}
              onPress={() => inMonth && onDayPress(dateStr)}
              disabled={!inMonth}
              style={styles.cell}
            >
              <View
                style={[
                  styles.sticker,
                  tint ? { backgroundColor: tint } : styles.stickerEmpty,
                  isToday(day) && styles.todayRing,
                  !inMonth && styles.cellFaded,
                ]}
              >
                <Text
                  style={[
                    typeScale.bodyMedium,
                    { color: tint ? colors.white : inMonth ? colors.ink : colors.inkFaint },
                  ]}
                >
                  {format(day, "d")}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Legend />
    </View>
  );
}

function Legend() {
  const items: { label: string; color: string }[] = [
    { label: "Present", color: colors.present },
    { label: "Absent", color: colors.absent },
    { label: "Closed", color: colors.closed },
  ];
  return (
    <View style={styles.legendRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={[typeScale.caption, { color: colors.inkMuted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 42;

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: colors.inkFaint,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  cellFaded: {
    opacity: 0.35,
  },
  sticker: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerEmpty: {
    backgroundColor: colors.paperLine,
  },
  todayRing: {
    borderWidth: 2,
    borderColor: colors.honey,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
