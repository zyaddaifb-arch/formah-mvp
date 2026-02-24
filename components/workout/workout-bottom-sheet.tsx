import { useWorkout } from "@/contexts/workout-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { ExerciseLogItem } from "./exercise-log-item";
import { ExerciseSelectionDialog } from "./exercise-selection-dialog";

export function WorkoutBottomSheet() {
  const [workoutName, setWorkoutName] = useState("Quick Workout");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showWorkoutMenu, setShowWorkoutMenu] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const { isWorkoutActive, isModalOpen, endWorkout, closeModal } = useWorkout();

  // Timer
  useEffect(() => {
    if (!isWorkoutActive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("en", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleCancel = () => {
    setElapsedTime(0);
    setWorkoutName("Quick Workout");
    setIsEditingName(false);
    setSelectedExercises([]);
    endWorkout();
  };

  const handleFinish = () => {
    setElapsedTime(0);
    setWorkoutName("Quick Workout");
    setIsEditingName(false);
    setSelectedExercises([]);
    endWorkout();
  };

  const handleMinimize = () => {
    closeModal();
  };

  const handleAddExercises = () => {
    setIsExerciseDialogOpen(true);
  };

  const handleSelectExercises = (exercises: Exercise[]) => {
    setSelectedExercises((prev) => [...prev, ...exercises]);
    setIsExerciseDialogOpen(false);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={isModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={handleMinimize}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="power" size={24} color={textColor} />
          </Pressable>

          <Pressable onPress={handleMinimize} style={styles.headerButton}>
            <Ionicons name="chevron-down" size={28} color={textColor} />
          </Pressable>

          <Pressable
            onPress={handleFinish}
            style={[styles.finishButton, { backgroundColor: "#10b981" }]}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.workoutInfo}>
            <View style={styles.titleRow}>
              {isEditingName ? (
                <TextInput
                  style={[styles.titleInput, { color: textColor }]}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  selectTextOnFocus
                />
              ) : (
                <Pressable
                  onPress={() => setIsEditingName(true)}
                  style={{ flex: 1 }}
                >
                  <Text style={[styles.title, { color: textColor }]}>
                    {workoutName}
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={styles.menuButton}
                onPress={() => setShowWorkoutMenu(true)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color="#6b7280"
                />
              </Pressable>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                <Text style={styles.metaText}>{formatDate()}</Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                <Text style={styles.metaText}>{formatTime(elapsedTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.exerciseArea}>
            {selectedExercises.length === 0 ? (
              <Text style={[styles.emptyText, { color: "#6b7280" }]}>
                No exercises yet. Tap "Add Exercises" to get started.
              </Text>
            ) : (
              selectedExercises.map((exercise, index) => (
                <ExerciseLogItem
                  key={`${exercise.id}-${index}`}
                  exercise={exercise}
                  onRemove={() => handleRemoveExercise(index)}
                />
              ))
            )}
          </View>

          <View style={styles.actionButtons}>
            <Pressable
              onPress={handleAddExercises}
              style={[
                styles.button,
                styles.addButton,
                { backgroundColor: tintColor },
              ]}
            >
              <Text style={styles.addButtonText}>Add Exercises</Text>
            </Pressable>

            <Pressable
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel Workout</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <ExerciseSelectionDialog
        visible={isExerciseDialogOpen}
        onClose={() => setIsExerciseDialogOpen(false)}
        onSelectExercises={handleSelectExercises}
      />

      {/* Workout Menu Modal */}
      <Modal
        visible={showWorkoutMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWorkoutMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowWorkoutMenu(false)}
        >
          <View style={styles.menuPositioner}>
            <View
              style={[
                styles.menuContainer,
                { backgroundColor: cardBackground },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setShowWorkoutMenu(false);
                  setIsEditingName(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color={textColor} />
                <Text style={[styles.menuItemText, { color: textColor }]}>
                  Edit Workout Name
                </Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setShowWorkoutMenu(false);
                  // TODO: Add photo functionality
                }}
              >
                <Ionicons name="camera-outline" size={20} color={textColor} />
                <Text style={[styles.menuItemText, { color: textColor }]}>
                  Add Photo
                </Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setShowWorkoutMenu(false);
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
            </View>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  finishButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  workoutInfo: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
    padding: 0,
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  exerciseArea: {
    flex: 1,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 100,
  },
  actionButtons: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButton: {},
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  menuPositioner: {
    position: "absolute",
    top: 140,
    right: 20,
  },
  menuContainer: {
    width: 220,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
