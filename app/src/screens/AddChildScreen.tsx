import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import * as Location from "expo-location";
import { useApp } from "@/context/AppContext";
import { addChild } from "@/services/api";
import { colors, spacing, type as typeScale, radius } from "@/theme/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusStamp } from "@/components/StatusStamp";

// Cycled through automatically per child, so a parent never has to think
// about picking a color — one less decision during onboarding.
const AVATAR_PALETTE = [
  colors.honey,
  colors.present,
  colors.pineLight,
  colors.absent,
  colors.closed,
];

export function AddChildScreen({ onDone }: { onDone?: () => void } = {}) {
  const { children, refreshChildren } = useApp();
  const isFirstChild = children.length === 0;

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [daycareName, setDaycareName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleUseCurrentLocation() {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Location permission needed",
          "Little Log uses the daycare's location to detect drop-off and pickup automatically. You can grant this later and set the location from Settings instead.",
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch {
      Alert.alert(
        "Couldn't get your location",
        "You can try again, or skip this for now and add it later.",
      );
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !daycareName.trim() || !birthDate.trim()) {
      Alert.alert(
        "A few things missing",
        "Fill in the child's name, birth date, and daycare name.",
      );
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) {
      Alert.alert(
        "Check the birth date",
        "Use the format YYYY-MM-DD, e.g. 2023-04-12.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await addChild({
        name: name.trim(),
        birthDate: birthDate.trim(),
        daycareName: daycareName.trim(),
        // Falls back to 0,0 if a parent skips location capture — automatic
        // detection just won't trigger until it's set properly later.
        daycareLat: coords?.lat ?? 0,
        daycareLng: coords?.lng ?? 0,
        geofenceRadiusM: 120,
        avatarColor: AVATAR_PALETTE[children.length % AVATAR_PALETTE.length],
      });
      await refreshChildren();
      onDone?.();
    } catch {
      Alert.alert(
        "Couldn't add your child",
        "Check that the app can reach the server and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, paddingVertical: Platform.OS == "android" ? 50 : 0 }}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[typeScale.h1, { color: colors.pine }]}>
            {isFirstChild ? "Add your first child" : "Add a child"}
          </Text>
          <Text
            style={[
              typeScale.body,
              {
                color: colors.inkMuted,
                marginTop: spacing.xs,
                marginBottom: spacing.xl,
              },
            ]}
          >
            Just the basics for now — everything here can be fine-tuned later in
            Settings.
          </Text>

          <Text style={typeScale.captionMedium}>CHILD'S NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Aarav"
            placeholderTextColor={colors.inkFaint}
          />

          <Text style={[typeScale.captionMedium, { marginTop: spacing.md }]}>
            BIRTH DATE
          </Text>
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.inkFaint}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={[typeScale.captionMedium, { marginTop: spacing.md }]}>
            DAYCARE NAME
          </Text>
          <TextInput
            value={daycareName}
            onChangeText={setDaycareName}
            style={styles.input}
            placeholder="Little Sprouts Crèche"
            placeholderTextColor={colors.inkFaint}
          />

          <Text
            style={[
              typeScale.captionMedium,
              { marginTop: spacing.md, marginBottom: spacing.xs },
            ]}
          >
            DAYCARE LOCATION
          </Text>
          {coords ? (
            <StatusStamp label="Location saved" tone="present" size="small" />
          ) : (
            <PrimaryButton
              label="Use my current location"
              variant="ghost"
              onPress={handleUseCurrentLocation}
              loading={locating}
            />
          )}
          <Text
            style={[
              typeScale.caption,
              { color: colors.inkFaint, marginTop: spacing.xs },
            ]}
          >
            Stand at (or near) the daycare when you tap this — it's what powers
            automatic drop-off detection. You can skip it and set it later if
            you're not there right now.
          </Text>

          <PrimaryButton
            label={isFirstChild ? "Add child & continue" : "Add child"}
            onPress={handleSubmit}
            loading={submitting}
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 120,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.paperLine,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: spacing.xs,
    fontFamily: "NunitoSans_400Regular",
    color: colors.ink,
    backgroundColor: colors.paperRaised,
  },
});
