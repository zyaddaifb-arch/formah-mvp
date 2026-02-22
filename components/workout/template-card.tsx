import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { Template } from "../../types/workout";

interface TemplateCardProps {
  template: Template;
  onPress?: () => void;
}

export function TemplateCard({ template, onPress }: TemplateCardProps) {
  const surfaceColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surfaceColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {template.name}
        </Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[styles.menuIcon, { color: secondaryTextColor }]}>
            ⋮
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text
          style={[styles.exercises, { color: secondaryTextColor }]}
          numberOfLines={1}
        >
          {template.exercises.join(", ")}...
        </Text>
        <Text style={[styles.lastPlayed, { color: primaryColor }]}>
          {template.lastPlayed}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    minHeight: 140,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    paddingRight: 8,
  },
  menuButton: {
    padding: 4,
    marginTop: -8,
    marginRight: -8,
  },
  menuIcon: {
    fontSize: 20,
  },
  footer: {
    marginTop: 16,
  },
  exercises: {
    fontSize: 12,
  },
  lastPlayed: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },
});
