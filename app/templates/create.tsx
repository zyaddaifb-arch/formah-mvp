import { ThemedView } from "@/components/themed-view";
import { ExerciseSelectionDialog } from "@/components/workout/exercise-selection-dialog";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function CreateTemplateScreen() {
  const [templateName, setTemplateName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const handleAddExercises = (exercises: Exercise[]) => {
    setSelectedExercises([...selectedExercises, ...exercises]);
    setShowExerciseDialog(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(
      selectedExercises.filter((ex) => ex.id !== exerciseId),
    );
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      Alert.alert("Error", "Please enter a template name");
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    // TODO: Save template to storage
    Alert.alert("Success", "Template created successfully!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  const canSave = templateName.trim() && selectedExercises.length > 0;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: textColor }]}>
          New Template
        </Text>

        <Pressable onPress={handleSave} disabled={!canSave}>
          <Text
            style={[
              styles.saveButton,
              { color: canSave ? tintColor : "#6b7280" },
            ]}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Template Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Template Name
          </Text>
          <TextInput
            style={[
              styles.nameInput,
              { backgroundColor: cardBackground, color: textColor },
            ]}
            placeholder="Enter template name"
            placeholderTextColor="#6b7280"
            value={templateName}
            onChangeText={setTemplateName}
          />
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Exercises ({selectedExercises.length})
            </Text>
            <Pressable
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={() => setShowExerciseDialog(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          {selectedExercises.length === 0 ? (
            <Pressable
              style={[styles.emptyState, { backgroundColor: cardBackground }]}
              onPress={() => setShowExerciseDialog(true)}
            >
              <Ionicons name="barbell-outline" size={48} color="#6b7280" />
              <Text style={[styles.emptyStateText, { color: "#6b7280" }]}>
                No exercises added yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: "#9ca3af" }]}>
                Tap to add exercises
              </Text>
            </Pressable>
          ) : (
            <View style={styles.exercisesList}>
              {selectedExercises.map((exercise, index) => (
                <View
                  key={exercise.id}
                  style={[
                    styles.exerciseItem,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <View style={styles.exerciseNumber}>
                    <Text
                      style={[styles.exerciseNumberText, { color: textColor }]}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: textColor }]}>
                      {exercise.name}
                    </Text>
                    <View style={styles.exerciseMeta}>
                      <Text style={styles.exerciseMetaText}>
                        {exercise.bodyPart}
                      </Text>
                      <Text style={styles.exerciseMetaDot}>•</Text>
                      <Text style={styles.exerciseMetaText}>
                        {exercise.equipment}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleRemoveExercise(exercise.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise Selection Dialog */}
      <ExerciseSelectionDialog
        visible={showExerciseDialog}
        onClose={() => setShowExerciseDialog(false)}
        onSelectExercises={handleAddExercises}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  nameInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: "700",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  exerciseMetaText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  exerciseMetaDot: {
    fontSize: 13,
    color: "#9ca3af",
  },
  removeButton: {
    padding: 4,
  },
});
