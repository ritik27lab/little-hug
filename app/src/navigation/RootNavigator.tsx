import React, { useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";

import { MainTabNavigator } from "./MainTabNavigator";

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F6F6F3",
  },
};

export function RootNavigator() {
  const { isAuthenticated } = useApp();

  const [authScreen, setAuthScreen] = useState<"login" | "signup">("signup");

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer theme={NavigationTheme}>
        {isAuthenticated ? (
          <MainTabNavigator />
        ) : authScreen === "login" ? (
          <LoginScreen onNavigateSignup={() => setAuthScreen("signup")} />
        ) : (
          <SignupScreen onNavigateLogin={() => setAuthScreen("login")} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
