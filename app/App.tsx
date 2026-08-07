import React, { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts as useFraunces,
  Fraunces_600SemiBold,
  Fraunces_500Medium_Italic,
} from "@expo-google-fonts/fraunces";
import {
  useFonts as useNunitoSans,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_800ExtraBold,
} from "@expo-google-fonts/nunito-sans";
import { AppProvider } from "@/context/AppContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { colors } from "@/theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op if already hidden */
});

export default function App() {
  const [frauncesLoaded] = useFraunces({
    Fraunces_600SemiBold,
    Fraunces_500Medium_Italic,
  });
  const [nunitoLoaded] = useNunitoSans({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_800ExtraBold,
  });

  const fontsReady = frauncesLoaded && nunitoLoaded;

  const onLayoutRootView = useCallback(async () => {
    if (fontsReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.paper }}
      onLayout={onLayoutRootView}
    >
      <AppProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppProvider>
    </View>
  );
}
