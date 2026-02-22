import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(17, 24, 39, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
          borderTopWidth: 1,
          borderTopColor:
            colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
          height: 80,
          paddingBottom: 20,
          paddingTop: 12,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <IconSymbol size={24} name="clock.fill" color={color} />
              <Text style={[styles.tabLabel, { color }]}>History</Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <View style={styles.centerTabContainer}>
              <View
                style={[
                  styles.centerTab,
                  { backgroundColor: Colors[colorScheme ?? "light"].primary },
                ]}
              >
                <Text style={styles.centerTabIcon}>+</Text>
              </View>
              <Text
                style={[
                  styles.centerTabLabel,
                  { color: Colors[colorScheme ?? "light"].primary },
                ]}
              >
                Start Workout
              </Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <IconSymbol size={24} name="person.fill" color={color} />
              <Text style={[styles.tabLabel, { color }]}>Profile</Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: 80,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  centerTabContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -32,
    width: 100,
  },
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerTabIcon: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "700",
  },
  centerTabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
    flexWrap: "nowrap",
  },
});
