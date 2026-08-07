import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { getEvents, logManualEvent } from "@/services/api";
import { DropoffEvent } from "@/types";
import {
  colors,
  spacing,
  type as typeScale,
  radius,
  shadow,
} from "@/theme/theme";
import { ChildSelector } from "@/components/ChildPill";
import { ChildAvatar } from "@/components/ChildAvatar";
import { StatusStamp } from "@/components/StatusStamp";
import { PrimaryButton } from "@/components/PrimaryButton";

export function TodayScreen() {
  const { children, selectedChildId, selectedChild, selectChild } = useApp();
  const [events, setEvents] = useState<DropoffEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState<"dropoff" | "pickup" | null>(null);

  const loadEvents = useCallback(async () => {
    if (!selectedChildId) return;
    setLoading(true);
    try {
      const data = await getEvents(selectedChildId);
      setEvents(data.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)));
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const todaysDropoff = events.find((e) => e.type === "dropoff");
  const todaysPickup = events.find((e) => e.type === "pickup");

  async function handleManualLog(type: "dropoff" | "pickup") {
    if (!selectedChildId) return;
    setLogging(type);
    try {
      await logManualEvent(selectedChildId, type, new Date().toISOString());
      await loadEvents();
    } finally {
      setLogging(null);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadEvents}
            tintColor={colors.white}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.pine, colors.pineDark]}
          style={styles.hero}
        >
          <SafeAreaView edges={["top"]}>
            <Text style={styles.dateLabel}>
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {selectedChild && (
              <View style={styles.childHeader}>
                <ChildAvatar color={selectedChild.avatarColor} size={56} />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={styles.childName}>{selectedChild.name}</Text>
                  <Text style={styles.daycareName}>
                    {selectedChild.daycareName}
                  </Text>
                </View>
              </View>
            )}

            <ChildSelector
              childList={children}
              selectedChildId={selectedChildId}
              onSelect={selectChild}
            />

            {selectedChild && (
              <View style={styles.stampRow}>
                <StatusStamp
                  label={todaysDropoff ? "Dropped off" : "Not dropped off yet"}
                  time={
                    todaysDropoff
                      ? formatTime(todaysDropoff.timestamp)
                      : undefined
                  }
                  tone={todaysDropoff ? "present" : "neutral"}
                />
                <StatusStamp
                  label={todaysPickup ? "Picked up" : "Still at daycare"}
                  time={
                    todaysPickup
                      ? formatTime(todaysPickup.timestamp)
                      : undefined
                  }
                  tone={todaysPickup ? "present" : "neutral"}
                />
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>

        {selectedChild && (
          <View style={styles.content}>
            <View style={[styles.infoCard, shadow.card]}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.pineLight}
              />
              <Text
                style={[
                  typeScale.caption,
                  { color: colors.inkMuted, flex: 1, marginLeft: spacing.sm },
                ]}
              >
                Detected automatically when {selectedChild.name}'s phone enters
                or leaves the geofence around {selectedChild.daycareName}.
                Missed a detection? Log it manually below.
              </Text>
            </View>

            <View style={styles.manualRow}>
              <PrimaryButton
                label="Log drop-off"
                variant="secondary"
                loading={logging === "dropoff"}
                onPress={() => handleManualLog("dropoff")}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <PrimaryButton
                label="Log pickup"
                variant="ghost"
                loading={logging === "pickup"}
                onPress={() => handleManualLog("pickup")}
                style={{ flex: 1 }}
              />
            </View>

            <Text
              style={[
                typeScale.h3,
                { marginTop: spacing.lg, marginBottom: spacing.sm },
              ]}
            >
              Recent activity
            </Text>
            {events.length === 0 ? (
              <Text style={[typeScale.body, { color: colors.inkFaint }]}>
                Nothing logged yet today.
              </Text>
            ) : (
              events.map((event) => (
                <View key={event.id} style={styles.eventRow}>
                  <View
                    style={[
                      styles.eventIcon,
                      { backgroundColor: colors.paper },
                    ]}
                  >
                    <Ionicons
                      name={
                        event.type === "dropoff"
                          ? "log-in-outline"
                          : "log-out-outline"
                      }
                      size={16}
                      color={colors.pine}
                    />
                  </View>
                  <Text
                    style={[
                      typeScale.body,
                      { marginLeft: spacing.sm, flex: 1 },
                    ]}
                  >
                    {event.type === "dropoff" ? "Dropped off" : "Picked up"}
                    {event.source === "manual" ? " (manual)" : ""}
                  </Text>
                  <Text style={[typeScale.caption, { color: colors.inkFaint }]}>
                    {formatTime(event.timestamp)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  dateLabel: {
    ...typeScale.captionMedium,
    color: "rgba(255,255,255,0.7)",
    marginTop: spacing.sm,
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  childName: {
    ...typeScale.h1,
    color: colors.white,
  },
  daycareName: {
    ...typeScale.body,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  stampRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "flex-start",
  },
  manualRow: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.paperLine,
  },
  eventIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
