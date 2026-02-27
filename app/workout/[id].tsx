import { FinishWorkoutModal } from "@/components/workout/finish-workout-modal";
import { getWorkoutHistory } from "@/data/storage/workouts";
import { useFinishWorkout } from "@/hooks/use-finish-workout";
import { WorkoutSession } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkoutScreen() {
  const { id, name } = useLocalSearchParams();
  const [startTime] = useState(new Date().toISOString());
  const [workoutCount, setWorkoutCount] = useState(1);

  // Load workout count on mount
  useEffect(() => {
    const loadWorkoutCount = async () => {
      try {
        const history = await getWorkoutHistory();
        setWorkoutCount(history.length + 1);
      } catch (error) {
        console.error("Error loading workout count:", error);
      }
    };
    loadWorkoutCount();
  }, []);

  // Mock workout session - replace with actual data from context/storage
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>({
    id: id as string,
    templateId: "template-1",
    date: new Date().toISOString(),
    exercises: [
      {
        exerciseId: "smith-machine",
        sets: [
          { weight: 25, reps: 6, completed: true },
          { weight: 25, reps: 6, completed: false }, // Valid but not completed
          { weight: 35, reps: 6, completed: true },
          { weight: 0, reps: 0, completed: false }, // Invalid
          { weight: 35, reps: 6, completed: true },
          { weight: 35, reps: 6, completed: true },
        ],
      },
    ],
  });

  const {
    modalVisible,
    hasValidUnfinishedSets,
    initiateFinish,
    handleCompleteUnfinished,
    handleDiscardUnfinished,
    handleSimpleFinish,
    handleCancel,
  } = useFinishWorkout({
    workoutSession,
    onWorkoutFinished: (session, stats) => {
      console.log("Workout finished:", session);
      console.log("Stats:", stats);

      // Calculate duration
      const duration = Math.floor(
        (new Date(session.completedAt!).getTime() -
          new Date(startTime).getTime()) /
          1000,
      );

      // Navigate to summary screen with workout data
      router.push({
        pathname: "/workout/summary",
        params: {
          session: JSON.stringify(session),
          workoutCount: workoutCount.toString(),
          duration: duration.toString(),
          workoutName: (name as string) || "Quick Workout",
        },
      });
    },
  });

  const toggleSetComplete = (setIndex: number) => {
    setWorkoutSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, exIndex) => {
        if (exIndex === 0) {
          return {
            ...exercise,
            sets: exercise.sets.map((set, sIndex) => {
              if (sIndex === setIndex) {
                return { ...set, completed: !set.completed };
              }
              return set;
            }),
          };
        }
        return exercise;
      }),
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>

        <Text style={styles.timer}>2:40:59</Text>

        <TouchableOpacity style={styles.finishButton} onPress={initiateFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Name */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>(Smith Machine)</Text>
          <View style={styles.exerciseActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="link-outline" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Set Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.setColumn]}>Set</Text>
          <Text style={[styles.headerText, styles.previousColumn]}>
            Previous
          </Text>
          <Text style={[styles.headerText, styles.valueColumn]}>kg</Text>
          <Text style={[styles.headerText, styles.valueColumn]}>Reps</Text>
          <View style={styles.checkColumn} />
        </View>

        {/* Sets */}
        {workoutSession.exercises[0].sets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <Text style={[styles.setText, styles.setColumn]}>{index + 1}</Text>
            <Text style={[styles.previousText, styles.previousColumn]}>
              {index === 0 ? "25 kg × 6" : "—"}
            </Text>
            <Text style={[styles.valueText, styles.valueColumn]}>
              {set.weight || "—"}
            </Text>
            <Text style={[styles.valueText, styles.valueColumn]}>
              {set.reps || "—"}
            </Text>
            <TouchableOpacity
              style={styles.checkColumn}
              onPress={() => toggleSetComplete(index)}
            >
              <View
                style={[
                  styles.checkmarkBox,
                  set.completed && styles.checkmarkBoxCompleted,
                ]}
              >
                {set.completed && (
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                )}
              </View>
            </TouchableOpacity>

            {/* Rest Timer */}
            {set.completed &&
              index < workoutSession.exercises[0].sets.length - 1 && (
                <View style={styles.restTimer}>
                  <Text style={styles.restTimerText}>
                    {index === 0 ? "0:11" : index === 5 ? "2:00" : "1:59"}
                  </Text>
                </View>
              )}
          </View>
        ))}

        {/* Add Set Button */}
        <TouchableOpacity style={styles.addSetButton}>
          <Text style={styles.addSetText}>+ Add Set (2:00)</Text>
        </TouchableOpacity>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.addExercisesButton}>
            <Text style={styles.addExercisesText}>Add Exercises</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelWorkoutButton}>
            <Text style={styles.cancelWorkoutText}>Cancel Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FinishWorkoutModal
        visible={modalVisible}
        hasValidUnfinishedSets={hasValidUnfinishedSets}
        onCancel={handleCancel}
        onFinish={handleSimpleFinish}
        onCompleteUnfinished={handleCompleteUnfinished}
        onDiscardUnfinished={handleDiscardUnfinished}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    fontSize: 18,
    color: "#94a3b8",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  finishButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  finishButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exerciseName: {
    fontSize: 18,
    color: "#3b82f6",
    fontWeight: "600",
  },
  exerciseActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  setColumn: {
    width: 40,
  },
  previousColumn: {
    flex: 1,
  },
  valueColumn: {
    width: 60,
    textAlign: "center",
  },
  checkColumn: {
    width: 50,
    alignItems: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    position: "relative",
  },
  setText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  previousText: {
    color: "#64748b",
    fontSize: 14,
  },
  valueText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  checkmarkBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkBoxCompleted: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  restTimer: {
    position: "absolute",
    left: 16,
    bottom: -12,
    backgroundColor: "#1e40af",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  restTimerText: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  addSetButton: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  addSetText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  bottomActions: {
    marginTop: 40,
    marginBottom: 40,
    gap: 16,
  },
  addExercisesButton: {
    marginHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#1e3a5f",
    borderRadius: 12,
    alignItems: "center",
  },
  addExercisesText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelWorkoutButton: {
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelWorkoutText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "700",
  },
});
