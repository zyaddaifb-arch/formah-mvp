import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: textColor }]}>Profile Screen</Text>
        <Text style={[styles.subtext, { color: textColor }]}>
          Coming Soon...
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtext: {
    fontSize: 16,
    opacity: 0.6,
  },
});
