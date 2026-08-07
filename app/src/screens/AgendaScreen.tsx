import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { getAgendaScans, scanAgendaImage } from "@/services/api";
import { AgendaScan } from "@/types";
import {
  colors,
  spacing,
  type as typeScale,
  radius,
  shadow,
} from "@/theme/theme";
import { ChildSelector } from "@/components/ChildPill";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AgendaDayCard } from "@/components/AgendaDayCard";

export function AgendaScreen() {
  const { children, selectedChildId, selectChild } = useApp();
  const [scans, setScans] = useState<AgendaScan[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const loadScans = useCallback(async () => {
    if (!selectedChildId) return;
    setLoading(true);
    try {
      const data = await getAgendaScans(selectedChildId);
      setScans(data.sort((a, b) => (a.scannedAt < b.scannedAt ? 1 : -1)));
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  async function handleCapture(fromCamera: boolean) {
    if (!selectedChildId) return;

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        fromCamera
          ? "Camera access is needed to photograph the agenda."
          : "Photo library access is needed to pick an agenda photo.",
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsEditing: true,
        });

    if (result.canceled || !result.assets?.[0]) return;

    setScanning(true);
    try {
      const scan = await scanAgendaImage(selectedChildId, result.assets[0].uri);
      setScans((prev) => [scan, ...prev]);
    } catch (err) {
      Alert.alert(
        "Scan failed",
        "We couldn't read that agenda photo. Try a clearer, well-lit shot.",
      );
    } finally {
      setScanning(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={typeScale.h1}>Agenda</Text>

      <Text style={typeScale.h1}>Coming Soon!</Text>

      <Text
        style={[
          typeScale.body,
          { color: colors.inkMuted, marginTop: 4, marginBottom: spacing.md },
        ]}
      >
        Photograph the daycare's agenda board and we'll turn it into a readable
        weekly view.
      </Text>

      {/* <ChildSelector
        childList={children}
        selectedChildId={selectedChildId}
        onSelect={selectChild}
      />

      <View style={styles.captureRow}>
        <PrimaryButton
          label="Take a photo"
          onPress={() => handleCapture(true)}
          loading={scanning}
          style={{ flex: 1, marginRight: spacing.sm }}
        />
        <PrimaryButton
          label="Choose from library"
          variant="ghost"
          onPress={() => handleCapture(false)}
          disabled={scanning}
          style={{ flex: 1 }}
        />
      </View>

      {scanning && (
        <View style={[styles.scanningCard, shadow.card]}>
          <ActivityIndicator color={colors.pine} />
          <Text
            style={[
              typeScale.body,
              { marginLeft: spacing.sm, color: colors.inkMuted },
            ]}
          >
            Reading the agenda…
          </Text>
        </View>
      )}

      {loading && !scanning ? (
        <ActivityIndicator
          style={{ marginTop: spacing.lg }}
          color={colors.pine}
        />
      ) : scans.length === 0 ? (
        <EmptyState />
      ) : (
        scans.map((scan) => (
          <View key={scan.id} style={{ marginTop: spacing.lg }}>
            <View style={styles.scanHeader}>
              <Ionicons
                name="camera-outline"
                size={16}
                color={colors.inkFaint}
              />
              <Text
                style={[
                  typeScale.captionMedium,
                  { color: colors.inkFaint, marginLeft: 6 },
                ]}
              >
                Scanned{" "}
                {new Date(scan.scannedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {scan.detectedLanguage
                  ? ` · ${scan.detectedLanguage.toUpperCase()}`
                  : ""}
              </Text>
            </View>
            {scan.days.map((day) => (
              <AgendaDayCard key={day.date} day={day} />
            ))}
          </View>
        ))
      )} */}
    </ScrollView>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons
        name="document-text-outline"
        size={32}
        color={colors.inkFaint}
      />
      <Text
        style={[
          typeScale.bodyMedium,
          {
            color: colors.inkMuted,
            marginTop: spacing.sm,
            textAlign: "center",
          },
        ]}
      >
        No agenda scanned yet
      </Text>
      <Text
        style={[
          typeScale.caption,
          { color: colors.inkFaint, marginTop: 4, textAlign: "center" },
        ]}
      >
        Snap a photo of the board by the daycare entrance to get started.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingVertical: 50,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  captureRow: {
    flexDirection: "row",
    marginTop: spacing.lg,
  },
  scanningCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  scanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  empty: {
    alignItems: "center",
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
});
