import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { TodayScreen } from "@/screens/TodayScreen";
import { AgendaScreen } from "@/screens/AgendaScreen";
import { CalendarScreen } from "@/screens/CalendarScreen";
import { FamilyScreen } from "@/screens/FamilyScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { colors, fonts } from "@/theme/theme";

export type MainTabParamList = {
  Today: undefined;
  Agenda: undefined;
  Calendar: undefined;
  Family: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Today: "sunny-outline",
  Agenda: "book-outline",
  Calendar: "calendar-outline",
  Family: "people-outline",
  Settings: "settings-outline",
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.pine,
        tabBarInactiveTintColor: colors.inkFaint,

        tabBarHideOnKeyboard: true,

        tabBarStyle: styles.tabBar,

        tabBarItemStyle: {
          paddingVertical: 6,
        },

        tabBarLabelStyle: {
          fontFamily: fonts.display,
          fontSize: 10,
          marginBottom: 4,
        },

        tabBarIconStyle: {
          marginTop: 1,
        },

        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={null}
            style={({ pressed }) => [
              props.style,
              {
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          />
        ),

        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="systemUltraThinMaterialLight"
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.glassOverlay} />
          </BlurView>
        ),

        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={ICONS[route.name as keyof MainTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Family" component={FamilyScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",

    // left: 16,
    // right: 16,
    // bottom: 20,

    height: 90,

    borderTopWidth: 0,
    backgroundColor: "transparent",

    borderRadius: 30,

    overflow: "hidden",

    elevation: 0,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },

  glassOverlay: {
    flex: 1,

    backgroundColor: "rgba(255,255,255,0.10)",

    borderRadius: 30,

    borderWidth: 0.5,

    borderColor: "rgba(255,255,255,0.35)",
  },
});
