import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFamily, inviteFamilyMember } from "@/services/api";
import { FamilyMember } from "@/types";
import {
  colors,
  spacing,
  type as typeScale,
  radius,
  shadow,
} from "@/theme/theme";
import { PrimaryButton } from "@/components/PrimaryButton";

export function FamilyScreen() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    getFamily().then(setMembers);
  }, []);

  async function handleInvite() {
    if (!email.trim()) return;
    setInviting(true);
    try {
      const member = await inviteFamilyMember(email.trim(), "other");
      setMembers((prev) => [...prev, member]);
      setEmail("");
    } finally {
      setInviting(false);
    }
  }

  function handleShareReferral() {
    Share.share({
      message:
        "I've been using Little Log to automatically track daycare drop-off and pickup times — here's a free month on me: https://littlelog.app/invite/demo",
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={typeScale.h1}>Family</Text>
      <Text
        style={[
          typeScale.body,
          { color: colors.inkMuted, marginTop: 4, marginBottom: spacing.lg },
        ]}
      >
        Share access with the other parent, a grandparent, or a nanny.
      </Text>

      {members.map((member) => (
        <View key={member.id} style={[styles.memberRow, shadow.card]}>
          <View style={styles.memberIcon}>
            <Ionicons name="person-outline" size={18} color={colors.pine} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={typeScale.bodyMedium}>{member.name}</Text>
            <Text style={[typeScale.caption, { color: colors.inkFaint }]}>
              {member.email}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              member.status === "active"
                ? styles.statusActive
                : styles.statusInvited,
            ]}
          >
            <Text style={typeScale.captionMedium}>
              {member.status === "active" ? "Active" : "Invited"}
            </Text>
          </View>
        </View>
      ))}

      <View style={[styles.inviteCard, shadow.card]}>
        <Text style={[typeScale.bodyMedium, { marginBottom: spacing.sm }]}>
          Invite someone
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={colors.inkFaint}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <PrimaryButton
          label="Send invite"
          onPress={handleInvite}
          loading={inviting}
          style={{ marginTop: spacing.sm }}
        />
      </View>

      <View style={[styles.referralCard, shadow.card]}>
        <Ionicons name="gift-outline" size={22} color={colors.honeyDark} />
        <Text style={[typeScale.bodyMedium, { marginTop: spacing.sm }]}>
          Give a free month, get a free month
        </Text>
        <Text
          style={[
            typeScale.caption,
            { color: colors.inkMuted, marginTop: 4, marginBottom: spacing.sm },
          ]}
        >
          Share Little Log with another daycare parent — you both get a month
          free when they subscribe.
        </Text>
        <PrimaryButton
          label="Share invite link"
          variant="secondary"
          onPress={handleShareReferral}
        />
      </View>
    </ScrollView>
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
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  memberIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusActive: {
    backgroundColor: "#DDEBDC",
  },
  statusInvited: {
    backgroundColor: "#F3E6D0",
  },
  inviteCard: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.paperLine,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: "NunitoSans_400Regular",
    color: colors.ink,
  },
  referralCard: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
});
