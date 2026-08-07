import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useApp } from "@/context/AppContext";
import { register } from "@/services/api";
import { colors, spacing, type as typeScale, radius } from "@/theme/theme";
import { PrimaryButton } from "@/components/PrimaryButton";

export function SignupScreen({
  onNavigateLogin,
}: {
  onNavigateLogin: () => void;
}) {
  const { signIn } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // async function handleSignup() {
  //   setLoading(true);
  //   try {
  //     await register(name, email, password);
  //     signIn();
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function handleSignup() {
    setLoading(true);

    try {
      await register(name, email, password);

      await signIn();
    } catch (e: any) {
      alert(e.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={[typeScale.h1, { color: colors.pine }]}>
          Start your free month
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
          No card needed today — cancel anytime during the trial.
        </Text>

        <Text style={typeScale.captionMedium}>NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={colors.inkFaint}
          placeholder="Your name"
        />

        <Text style={[typeScale.captionMedium, { marginTop: spacing.md }]}>
          EMAIL
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.inkFaint}
        />

        <Text style={[typeScale.captionMedium, { marginTop: spacing.md }]}>
          PASSWORD
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.inkFaint}
        />

        <PrimaryButton
          label="Create account"
          onPress={handleSignup}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />

        <Pressable
          onPress={onNavigateLogin}
          style={{ marginTop: spacing.lg, alignItems: "center" }}
        >
          <Text style={[typeScale.body, { color: colors.pineLight }]}>
            Already have an account? Log in
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
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
