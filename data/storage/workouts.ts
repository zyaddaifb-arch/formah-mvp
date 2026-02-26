import type { WorkoutSession } from "@/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WORKOUT_HISTORY_KEY = "@formah_workout_history";

/**
 * Save a completed workout to history
 */
export async function saveWorkout(workout: WorkoutSession): Promise<void> {
  try {
    const history = await getWorkoutHistory();
    history.push(workout);
    await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving workout:", error);
    throw error;
  }
}

/**
 * Get all workout history
 */
export async function getWorkoutHistory(): Promise<WorkoutSession[]> {
  try {
    const data = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading workout history:", error);
    return [];
  }
}

/**
 * Get workout history for a specific exercise
 */
export async function getExerciseHistory(
  exerciseId: string,
): Promise<WorkoutSession[]> {
  try {
    const history = await getWorkoutHistory();
    return history.filter((workout) =>
      workout.exercises.some((ex) => ex.exerciseId === exerciseId),
    );
  } catch (error) {
    console.error("Error loading exercise history:", error);
    return [];
  }
}

/**
 * Get the most recent workout containing a specific exercise
 */
export async function getLastWorkoutForExercise(
  exerciseId: string,
): Promise<WorkoutSession | null> {
  try {
    const history = await getExerciseHistory(exerciseId);
    if (history.length === 0) return null;

    // Sort by date descending and return the most recent
    return history.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];
  } catch (error) {
    console.error("Error loading last workout:", error);
    return null;
  }
}

/**
 * Clear all workout history (for testing/reset)
 */
export async function clearWorkoutHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WORKOUT_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing workout history:", error);
    throw error;
  }
}
