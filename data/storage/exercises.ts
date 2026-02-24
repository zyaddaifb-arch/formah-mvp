import type { Exercise } from "@/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CUSTOM_EXERCISES_KEY = "@formah_custom_exercises";

export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  try {
    const existing = await getCustomExercises();
    const updated = [...existing, exercise];
    await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving custom exercise:", error);
    throw error;
  }
}

export async function getCustomExercises(): Promise<Exercise[]> {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading custom exercises:", error);
    return [];
  }
}

export async function deleteCustomExercise(exerciseId: string): Promise<void> {
  try {
    const existing = await getCustomExercises();
    const updated = existing.filter((ex) => ex.id !== exerciseId);
    await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error deleting custom exercise:", error);
    throw error;
  }
}
