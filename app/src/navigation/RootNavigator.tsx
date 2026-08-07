import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useApp } from "@/context/AppContext";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";
import { AddChildScreen } from "@/screens/AddChildScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import { colors } from "@/theme/theme";

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.pine} />
    </View>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isRestoringSession, isLoadingChildren, children } =
    useApp();
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("signup");

  // Checking SecureStore for a saved token on launch — brief, but avoids a
  // flash of the login screen for someone who's already signed in.
  if (isRestoringSession) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        authScreen === "login" ? (
          <LoginScreen onNavigateSignup={() => setAuthScreen("signup")} />
        ) : (
          <SignupScreen onNavigateLogin={() => setAuthScreen("login")} />
        )
      ) : isLoadingChildren ? (
        <LoadingScreen />
      ) : children.length === 0 ? (
        // A signed-in parent with no children yet always lands here first —
        // this is the "add your first child" onboarding step. Once
        // refreshChildren() picks up the new child, this re-renders
        // straight into the main app with no extra navigation needed.
        <AddChildScreen />
      ) : (
        <MainTabNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
});
