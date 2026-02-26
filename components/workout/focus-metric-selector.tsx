import { useThemeColor } from "@/hooks/use-theme-color";
import type { FocusMetricType } from "@/types/workout";
import {
    getAvailableMetrics,
    getMetricDisplayName,
} from "@/utils/focus-metrics";
import { Ionicons } from "@expo/vector-icons";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface FocusMetricSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (metricType: FocusMetricType) => void;
  currentMetric?: FocusMetricType;
  exerciseCategory?: string;
}

export function FocusMetricSelector({
  visible,
  onClose,
  onSelect,
  currentMetric,
  exerciseCategory = "weight_reps",
}: FocusMetricSelectorProps) {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cardBackground");
  const tintColor = useThemeColor({}, "tint");

  const availableMetrics = getAvailableMetrics(exerciseCategory);

  const handleSelect = (metricType: FocusMetricType) => {
    onSelect(metricType);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.container, { backgroundColor }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              Select Focus Metric
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>

          <Text style={[styles.description, { color: "#9ca3af" }]}>
            Choose a metric to track your progress for this exercise
          </Text>

          <ScrollView
            style={styles.metricsList}
            showsVerticalScrollIndicator={false}
          >
            {availableMetrics.map((metricType) => {
              const isSelected = currentMetric === metricType;
              return (
                <Pressable
                  key={metricType}
                  style={[
                    styles.metricItem,
                    { backgroundColor: cardBackground },
                    isSelected && { borderColor: tintColor, borderWidth: 2 },
                  ]}
                  onPress={() => handleSelect(metricType)}
                >
                  <View style={styles.metricContent}>
                    <Text style={[styles.metricName, { color: textColor }]}>
                      {getMetricDisplayName(metricType)}
                    </Text>
                    <Text
                      style={[styles.metricDescription, { color: "#9ca3af" }]}
                    >
                      {getMetricDescription(metricType)}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={tintColor}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

function getMetricDescription(metricType: FocusMetricType): string {
  const descriptions: Record<FocusMetricType, string> = {
    total_volume: "Total weight × reps across all sets",
    volume_increase: "Percentage change in volume from last workout",
    weight_per_rep: "Average weight per rep across all sets",
    total_reps: "Total number of reps across all sets",
    reps_per_set: "Average reps per set",
    total_time: "Total time across all sets",
    average_time: "Average time per set",
    total_distance: "Total distance covered",
  };
  return descriptions[metricType];
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  metricsList: {
    flex: 1,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  metricContent: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
