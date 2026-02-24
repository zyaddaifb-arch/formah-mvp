import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

interface ExerciseLogItemProps {
  exercise: Exercise;
  onRemove: () => void;
}

interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export function ExerciseLogItem({ exercise, onRemove }: ExerciseLogItemProps) {
  const [sets, setSets] = useState<SetData[]>([
    { id: "1", weight: "", reps: "", completed: false },
  ]);
  const [showMenu, setShowMenu] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const backgroundColor = useThemeColor({}, "background");

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        id: String(sets.length + 1),
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false,
      },
    ]);
  };

  const toggleSetComplete = (setId: string) => {
    setSets(
      sets.map((set) =>
        set.id === setId ? { ...set, completed: !set.completed } : set,
      ),
    );
  };

  const updateSet = (
    setId: string,
    field: "weight" | "reps",
    value: string,
  ) => {
    setSets(
      sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
    );
  };

  const deleteSet = (setId: string) => {
    const newSets = sets.filter((set) => set.id !== setId);

    // If no sets left, remove the entire exercise
    if (newSets.length === 0) {
      onRemove();
    } else {
      setSets(newSets);
    }
  };

  const renderRightActions = (setId: string) => {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: "#ef4444" }]}
          onPress={() => deleteSet(setId)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </Pressable>
      </View>
    );
  };

  const toggleMetric = (metric: FocusMetric) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric],
    );
  };

  const metrics = [
    { id: "totalVolume" as FocusMetric, label: "Total Volume", value: "N/A" },
    {
      id: "volumeIncrease" as FocusMetric,
      label: "Volume Increase",
      value: "-100%",
    },
    { id: "totalReps" as FocusMetric, label: "Total Reps", value: "N/A" },
    { id: "weightPerRep" as FocusMetric, label: "Weight/Rep", value: "N/A" },
  ];

  return (
    <View style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={[styles.exerciseName, { color: tintColor }]}>
          {exercise.name}
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setShowMetrics(!showMetrics)}
          >
            <Ionicons
              name={showMetrics ? "chevron-up" : "stats-chart"}
              size={20}
              color={tintColor}
            />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={tintColor} />
          </Pressable>
        </View>
      </View>

      {/* Metrics Section */}
      {showMetrics && (
        <View
          style={[styles.metricsSection, { backgroundColor: backgroundColor }]}
        >
          <View style={styles.metricsSectionHeader}>
            <Text style={[styles.metricsSectionTitle, { color: textColor }]}>
              Focus Metrics
            </Text>
            <Pressable style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={20} color="#9ca3af" />
            </Pressable>
          </View>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <Text style={[styles.metricLabel, { color: "#9ca3af" }]}>
                  {metric.label}
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sets Table Header */}
      <View style={styles.tableHeader}>
        <Text
          style={[
            styles.tableHeaderText,
            styles.setNumberHeader,
            { color: textColor },
          ]}
        >
          Set
        </Text>
        <Text
          style={[
            styles.tableHeaderText,
            styles.previousHeader,
            { color: textColor },
          ]}
        >
          Previous
        </Text>
        <Text
          style={[
            styles.tableHeaderText,
            styles.inputHeader,
            { color: textColor },
          ]}
        >
          kg
        </Text>
        <Text
          style={[
            styles.tableHeaderText,
            styles.inputHeader,
            { color: textColor },
          ]}
        >
          Reps
        </Text>
        <View style={styles.checkmarkHeader}>
          <Ionicons name="checkmark" size={24} color={textColor} />
        </View>
      </View>

      {/* Sets List */}
      {sets.map((set, index) => (
        <Swipeable
          key={set.id}
          renderRightActions={() => renderRightActions(set.id)}
          overshootRight={false}
        >
          <View style={styles.setRow}>
            <Text style={[styles.setNumber, { color: textColor }]}>
              {index + 1}
            </Text>

            <Text style={[styles.previousText, { color: "#6b7280" }]}>
              {set.weight && set.reps ? `${set.weight} kg × ${set.reps}` : "—"}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor: cardBackground,
                  borderWidth: 1,
                  borderColor: "rgba(107, 114, 128, 0.3)",
                },
              ]}
              value={set.weight}
              onChangeText={(value) => updateSet(set.id, "weight", value)}
              keyboardType="numeric"
              selectTextOnFocus
              placeholder="0"
              placeholderTextColor="#6b7280"
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor: cardBackground,
                  borderWidth: 1,
                  borderColor: "rgba(107, 114, 128, 0.3)",
                },
              ]}
              value={set.reps}
              onChangeText={(value) => updateSet(set.id, "reps", value)}
              keyboardType="numeric"
              selectTextOnFocus
              placeholder="0"
              placeholderTextColor="#6b7280"
            />

            <Pressable
              style={[
                styles.checkmark,
                set.completed && {
                  backgroundColor: "#10b981",
                  borderColor: "#10b981",
                },
              ]}
              onPress={() => toggleSetComplete(set.id)}
            >
              {set.completed && (
                <Ionicons name="checkmark" size={24} color="#fff" />
              )}
            </Pressable>
          </View>
        </Swipeable>
      ))}

      {/* Add Set Button */}
      <Pressable
        style={[styles.addSetButton, { backgroundColor: backgroundColor }]}
        onPress={addSet}
      >
        <Text style={[styles.addSetText, { color: textColor }]}>+ Add Set</Text>
      </Pressable>

      {/* Exercise Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[styles.menuContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                // TODO: Add note functionality
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={textColor}
              />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Add Note
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                // TODO: Add sticky note functionality
              }}
            >
              <Ionicons name="bookmark-outline" size={20} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Add Sticky Note
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                // TODO: Add warm up sets functionality
              }}
            >
              <Ionicons name="flame-outline" size={20} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Add Warm Up Sets
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                // TODO: Replace exercise functionality
              }}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color={textColor}
              />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Replace Exercise
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                // TODO: Preferences functionality
              }}
            >
              <Ionicons name="settings-outline" size={20} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Preferences
              </Text>
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onRemove();
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                Remove Exercise
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 2,
    gap: 8,
  },
  tableHeaderText: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  setNumberHeader: {
    width: 40,
  },
  previousHeader: {
    width: 100,
  },
  inputHeader: {
    width: 70,
  },
  checkmarkHeader: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: "700",
    width: 40,
    textAlign: "center",
  },
  previousText: {
    fontSize: 15,
    width: 100,
    textAlign: "center",
  },
  input: {
    width: 70,
    height: 48,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  checkmark: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  addSetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 16,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "600",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: "80%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    marginVertical: 8,
  },
  metricsSection: {
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  helpButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minWidth: "48%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});
