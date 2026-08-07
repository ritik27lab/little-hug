import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { getSubscription } from "@/services/api";
import { Subscription } from "@/types";
import {
  colors,
  spacing,
  type as typeScale,
  radius,
  shadow,
} from "@/theme/theme";
import { PrimaryButton } from "@/components/PrimaryButton";

export function SettingsScreen() {
  const { signOut } = useApp();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    getSubscription().then(setSubscription);
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={typeScale.h1}>Settings</Text>

      {subscription && (
        <View style={[styles.subCard, shadow.card]}>
          <View style={styles.subHeader}>
            <Ionicons
              name="sparkles-outline"
              size={20}
              color={colors.honeyDark}
            />
            <Text style={[typeScale.h3, { marginLeft: spacing.sm }]}>
              {subscription.status === "trialing"
                ? "Free trial"
                : "Little Log Premium"}
            </Text>
          </View>
          {subscription.status === "trialing" && subscription.trialEndsAt && (
            <Text
              style={[
                typeScale.body,
                { color: colors.inkMuted, marginTop: spacing.xs },
              ]}
            >
              Your free month ends{" "}
              {new Date(subscription.trialEndsAt).toLocaleDateString(
                undefined,
                {
                  month: "long",
                  day: "numeric",
                },
              )}
              . Then €1.99/month, or €11.99/year for 2 months free.
            </Text>
          )}
          <View style={styles.planRow}>
            <PlanOption
              label="Monthly"
              price="€1.99/mo"
              active={subscription.plan === "monthly"}
            />
            <PlanOption
              label="Yearly"
              price="€11.99/yr"
              active={subscription.plan === "yearly"}
              badge="Best value"
            />
          </View>
        </View>
      )}

      <SettingsRow icon="notifications-outline" label="Notifications" />
      <SettingsRow icon="lock-closed-outline" label="Privacy & data" />
      <SettingsRow icon="help-circle-outline" label="Help & support" />
      <SettingsRow
        icon="document-text-outline"
        label="Terms & privacy policy"
      />

      <PrimaryButton
        label="Sign out"
        variant="ghost"
        onPress={signOut}
        style={{ marginTop: spacing.xl }}
      />
    </ScrollView>
  );
}

function PlanOption({
  label,
  price,
  active,
  badge,
}: {
  label: string;
  price: string;
  active: boolean;
  badge?: string;
}) {
  return (
    <View style={[planStyles.option, active && planStyles.optionActive]}>
      {badge && (
        <View style={planStyles.badge}>
          <Text style={[typeScale.caption, { color: colors.white }]}>
            {badge}
          </Text>
        </View>
      )}
      <Text style={typeScale.bodyMedium}>{label}</Text>
      <Text style={[typeScale.caption, { color: colors.inkMuted }]}>
        {price}
      </Text>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable style={[rowStyles.row, shadow.card]}>
      <Ionicons name={icon} size={20} color={colors.pine} />
      <Text style={[typeScale.body, { marginLeft: spacing.sm, flex: 1 }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
    </Pressable>
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
  subCard: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  planRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});

const planStyles = StyleSheet.create({
  option: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.paperLine,
    borderRadius: radius.md,
    padding: spacing.sm,
    position: "relative",
  },
  optionActive: {
    borderColor: colors.honey,
  },
  badge: {
    position: "absolute",
    top: -10,
    right: 8,
    backgroundColor: colors.honey,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
