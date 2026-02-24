import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
    { id: "1", weight: "20", reps: "10", completed: false },
  ]);
  const [restTimer, setRestTimer] = useState(120); // 2:00 minutes

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: cardBackground }]}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={[styles.exerciseName, { color: tintColor }]}>
          {exercise.name}
        </Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="link" size={20} color={tintColor} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onRemove}>
            <Ionicons name="ellipsis-horizontal" size={20} color={tintColor} />
          </Pressable>
        </View>
      </View>

      {/* Sets Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { color: textColor }]}>Set</Text>
        <Text style={[styles.tableHeaderText, { color: textColor }]}>
          Previous
        </Text>
        <Text style={[styles.tableHeaderText, { color: textColor }]}>kg</Text>
        <Text style={[styles.tableHeaderText, { color: textColor }]}>Reps</Text>
        <View style={styles.checkmarkHeader} />
      </View>

      {/* Sets List */}
      {sets.map((set, index) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={[styles.setNumber, { color: textColor }]}>
            {index + 1}
          </Text>

          <Text style={[styles.previousText, { color: "#9ca3af" }]}>
            20 kg × 10
          </Text>

          <TextInput
            style={[
              styles.input,
              { color: textColor, backgroundColor: backgroundColor },
            ]}
            value={set.weight}
            onChangeText={(value) => updateSet(set.id, "weight", value)}
            keyboardType="numeric"
            selectTextOnFocus
          />

          <TextInput
            style={[
              styles.input,
              { color: textColor, backgroundColor: backgroundColor },
            ]}
            value={set.reps}
            onChangeText={(value) => updateSet(set.id, "reps", value)}
            keyboardType="numeric"
            selectTextOnFocus
          />

          <Pressable
            style={[
              styles.checkmark,
              set.completed && { backgroundColor: tintColor },
            ]}
            onPress={() => toggleSetComplete(set.id)}
          >
            {set.completed && (
              <Ionicons name="checkmark" size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      ))}

      {/* Rest Timer */}
      <View style={styles.restTimer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { backgroundColor: tintColor }]} />
        </View>
        <Text style={[styles.timerText, { color: tintColor }]}>
          {formatTime(restTimer)}
        </Text>
      </View>

      {/* Add Set Button */}
      <Pressable
        style={[styles.addSetButton, { backgroundColor: backgroundColor }]}
        onPress={addSet}
      >
        <Text style={[styles.addSetText, { color: textColor }]}>
          + Add Set ({formatTime(restTimer)})
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.2)",
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    width: 70,
    textAlign: "center",
  },
  checkmarkHeader: {
    width: 32,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "600",
    width: 30,
    textAlign: "center",
  },
  previousText: {
    fontSize: 14,
    width: 90,
    textAlign: "center",
  },
  input: {
    width: 60,
    height: 40,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  restTimer: {
    marginTop: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    width: "50%",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  addSetButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
