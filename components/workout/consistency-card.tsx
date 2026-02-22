import { StyleSheet, Text, View } from "react-native";
import { useThemeColor } from "../../hooks/use-theme-color";

interface ConsistencyCardProps {
  completedDays: number;
  totalDays: number;
}

export function ConsistencyCard({
  completedDays,
  totalDays,
}: ConsistencyCardProps) {
  const surfaceColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const fireColor = "#f97316";
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>
            Weekly Consistency
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            Keep the streak alive
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={[styles.completedDays, { color: fireColor }]}>
            {completedDays}
          </Text>
          <Text style={[styles.totalDays, { color: secondaryTextColor }]}>
            / {totalDays} Days
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        {Array.from({ length: totalDays }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              {
                backgroundColor:
                  index < completedDays
                    ? primaryColor
                    : "rgba(255, 255, 255, 0.1)",
              },
              index < completedDays && styles.progressBarActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  completedDays: {
    fontSize: 24,
    fontWeight: "700",
  },
  totalDays: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    height: 12,
  },
  progressBar: {
    flex: 1,
    borderRadius: 999,
  },
  progressBarActive: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 4,
  },
});
