import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { useApp } from "@/context/AppContext";
import { login } from "@/services/api";
import { colors, spacing, type as typeScale, radius } from "@/theme/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getErrorMessage } from "@/services/apiError";

export function LoginScreen({
  onNavigateSignup,
}: {
  onNavigateSignup: () => void;
}) {
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const result = await login(email, password);
      await signIn(result.token, result.refreshToken);
    } catch (err) {
      Alert.alert("Couldn't log in", getErrorMessage(err));
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
        <Text style={[typeScale.h1, { color: colors.pine }]}>Little Log</Text>
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
          Know the moment they're dropped off and picked up.
        </Text>

        <Text style={typeScale.captionMedium}>EMAIL</Text>
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
          label="Log in"
          onPress={handleLogin}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />

        <Pressable
          onPress={onNavigateSignup}
          style={{ marginTop: spacing.lg, alignItems: "center" }}
        >
          <Text style={[typeScale.body, { color: colors.pineLight }]}>
            New here? Start your free month
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
