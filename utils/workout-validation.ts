import { ExerciseLog } from "@/types/workout";

export interface ValidationResult {
  hasValidUnfinishedSets: boolean;
  hasInvalidSets: boolean;
  validUnfinishedSets: Array<{ exerciseId: string; setIndex: number }>;
  invalidSets: Array<{ exerciseId: string; setIndex: number }>;
  allSetsCompleted: boolean;
}

/**
 * Validates workout sets before finishing
 * Returns information about valid unfinished sets and invalid sets
 */
export function validateWorkoutSets(
  exercises: ExerciseLog[],
): ValidationResult {
  const validUnfinishedSets: Array<{ exerciseId: string; setIndex: number }> =
    [];
  const invalidSets: Array<{ exerciseId: string; setIndex: number }> = [];
  let allCompleted = true;

  exercises.forEach((exercise) => {
    exercise.sets.forEach((set, index) => {
      // Check if set is valid (has weight and reps)
      const isValid = set.weight > 0 && set.reps > 0;

      if (!set.completed) {
        allCompleted = false;

        if (isValid) {
          // Valid but not marked as completed
          validUnfinishedSets.push({
            exerciseId: exercise.exerciseId,
            setIndex: index,
          });
        } else {
          // Invalid set (empty or incomplete)
          invalidSets.push({
            exerciseId: exercise.exerciseId,
            setIndex: index,
          });
        }
      } else if (!isValid) {
        // Marked as completed but invalid data
        invalidSets.push({
          exerciseId: exercise.exerciseId,
          setIndex: index,
        });
      }
    });
  });

  return {
    hasValidUnfinishedSets: validUnfinishedSets.length > 0,
    hasInvalidSets: invalidSets.length > 0,
    validUnfinishedSets,
    invalidSets,
    allSetsCompleted: allCompleted && invalidSets.length === 0,
  };
}

/**
 * Marks all valid unfinished sets as completed
 */
export function completeUnfinishedSets(
  exercises: ExerciseLog[],
): ExerciseLog[] {
  return exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => {
      // If set has valid data but not completed, mark it as completed
      if (!set.completed && set.weight > 0 && set.reps > 0) {
        return { ...set, completed: true };
      }
      return set;
    }),
  }));
}

/**
 * Removes invalid and unfinished sets from workout
 */
export function discardUnfinishedSets(exercises: ExerciseLog[]): ExerciseLog[] {
  return exercises
    .map((exercise) => ({
      ...exercise,
      sets: exercise.sets.filter(
        (set) => set.completed && set.weight > 0 && set.reps > 0,
      ),
    }))
    .filter((exercise) => exercise.sets.length > 0); // Remove exercises with no valid sets
}

/**
 * Calculates workout statistics
 */
export function calculateWorkoutStats(exercises: ExerciseLog[]) {
  let totalVolume = 0;
  let totalReps = 0;
  let totalSets = 0;

  exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        totalVolume += set.weight * set.reps;
        totalReps += set.reps;
        totalSets++;
      }
    });
  });

  return {
    totalVolume,
    totalReps,
    totalSets,
  };
}
