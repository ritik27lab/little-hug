import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { addMonths, subMonths, format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import {
  getAttendance,
  correctAttendance,
  exportAttendanceReport,
} from "@/services/api";
import { AttendanceDay, AttendanceStatus } from "@/types";
import {
  colors,
  spacing,
  type as typeScale,
  radius,
  shadow,
} from "@/theme/theme";
import { ChildSelector } from "@/components/ChildPill";
import { CalendarGrid } from "@/components/CalendarGrid";
import { PrimaryButton } from "@/components/PrimaryButton";

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "closed"];

export function CalendarScreen() {
  const { children, selectedChildId, selectChild } = useApp();
  const [monthDate, setMonthDate] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadAttendance = useCallback(async () => {
    if (!selectedChildId) return;
    const data = await getAttendance(selectedChildId);
    setAttendance(data);
  }, [selectedChildId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const summary = summarize(attendance, monthDate);

  async function handleStatusPick(status: AttendanceStatus) {
    if (!selectedChildId || !selectedDate) return;
    const updated = await correctAttendance(
      selectedChildId,
      selectedDate,
      status,
    );
    setAttendance((prev) => {
      const others = prev.filter((d) => d.date !== selectedDate);
      return [...others, updated];
    });
    setSelectedDate(null);
  }

  async function handleExport() {
    if (!selectedChildId) return;
    setExporting(true);
    try {
      const { url } = await exportAttendanceReport(
        selectedChildId,
        format(monthDate, "yyyy-MM"),
      );
      Alert.alert(
        "Report ready",
        "Your monthly attendance report has been generated.",
        [{ text: "Open", onPress: () => Linking.openURL(url) }, { text: "OK" }],
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={typeScale.h1}>Calendar</Text>
      <Text
        style={[
          typeScale.body,
          { color: colors.inkMuted, marginTop: 4, marginBottom: spacing.md },
        ]}
      >
        A month at a glance — tap any day to correct it.
      </Text>

      <ChildSelector
        childList={children}
        selectedChildId={selectedChildId}
        onSelect={selectChild}
      />

      <View style={styles.monthNav}>
        <Pressable
          onPress={() => setMonthDate((d) => subMonths(d, 1))}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.pine} />
        </Pressable>
        <Text style={typeScale.h3}>{format(monthDate, "MMMM yyyy")}</Text>
        <Pressable
          onPress={() => setMonthDate((d) => addMonths(d, 1))}
          hitSlop={12}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.pine} />
        </Pressable>
      </View>

      <View style={[styles.calendarCard, shadow.card]}>
        <CalendarGrid
          monthDate={monthDate}
          attendance={attendance}
          onDayPress={setSelectedDate}
        />
      </View>

      {selectedDate && (
        <View style={[styles.correctCard, shadow.card]}>
          <Text style={[typeScale.bodyMedium, { marginBottom: spacing.sm }]}>
            Mark {format(new Date(selectedDate + "T00:00:00"), "MMM d")} as:
          </Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((status) => (
              <Pressable
                key={status}
                onPress={() => handleStatusPick(status)}
                style={styles.statusChip}
              >
                <Text style={[typeScale.captionMedium, { color: colors.ink }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            label="Cancel"
            variant="ghost"
            onPress={() => setSelectedDate(null)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}

      <View style={[styles.summaryCard, shadow.card]}>
        <SummaryStat
          label="Present"
          value={summary.present}
          color={colors.present}
        />
        <SummaryStat
          label="Absent"
          value={summary.absent}
          color={colors.absent}
        />
        <SummaryStat
          label="Closed"
          value={summary.closed}
          color={colors.closed}
        />
      </View>

      <PrimaryButton
        label="Export monthly report"
        variant="secondary"
        loading={exporting}
        onPress={handleExport}
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
}

function SummaryStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <View style={[styles.summaryDot, { backgroundColor: color }]} />
      <Text style={typeScale.h2}>{value}</Text>
      <Text style={[typeScale.caption, { color: colors.inkMuted }]}>
        {label}
      </Text>
    </View>
  );
}

function summarize(attendance: AttendanceDay[], monthDate: Date) {
  const monthKey = format(monthDate, "yyyy-MM");
  const inMonth = attendance.filter((d) => d.date.startsWith(monthKey));
  return {
    present: inMonth.filter((d) => d.status === "present").length,
    absent: inMonth.filter((d) => d.status === "absent").length,
    closed: inMonth.filter((d) => d.status === "closed").length,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingVertical: 50,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 100,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  calendarCard: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  correctCard: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statusChip: {
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
});
