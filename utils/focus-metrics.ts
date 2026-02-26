import type { SetData } from "@/contexts/workout-context";
import type { ExerciseLog, FocusMetricType, Set } from "@/types/workout";

export interface MetricResult {
  current: number | null;
  previous: number | null;
  change: number | null;
  changePercent: number | null;
  displayValue: string;
  displayChange: string;
}

/**
 * Calculate total volume (weight × reps) for a set of sets
 */
export function calculateTotalVolume(sets: SetData[] | Set[]): number {
  return sets.reduce((total, set) => {
    const weight =
      typeof set.weight === "string" ? parseFloat(set.weight) : set.weight;
    const reps = typeof set.reps === "string" ? parseFloat(set.reps) : set.reps;

    if (!weight || !reps || isNaN(weight) || isNaN(reps)) return total;
    return total + weight * reps;
  }, 0);
}

/**
 * Calculate total reps for a set of sets
 */
export function calculateTotalReps(sets: SetData[] | Set[]): number {
  return sets.reduce((total, set) => {
    const reps = typeof set.reps === "string" ? parseFloat(set.reps) : set.reps;
    if (!reps || isNaN(reps)) return total;
    return total + reps;
  }, 0);
}

/**
 * Calculate average weight per rep
 */
export function calculateWeightPerRep(sets: SetData[] | Set[]): number {
  const totalVolume = calculateTotalVolume(sets);
  const totalReps = calculateTotalReps(sets);

  if (totalReps === 0) return 0;
  return totalVolume / totalReps;
}

/**
 * Calculate average reps per set
 */
export function calculateRepsPerSet(sets: SetData[] | Set[]): number {
  const completedSets = sets.filter((s) => {
    const reps = typeof s.reps === "string" ? parseFloat(s.reps) : s.reps;
    return reps && !isNaN(reps);
  });

  if (completedSets.length === 0) return 0;

  const totalReps = calculateTotalReps(completedSets);
  return totalReps / completedSets.length;
}

/**
 * Get the previous workout data for an exercise
 */
export function getPreviousExerciseLog(
  exerciseId: string,
  workoutHistory: any[],
): ExerciseLog | null {
  // Sort by date descending
  const sortedHistory = [...workoutHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Find the most recent workout that includes this exercise
  for (const workout of sortedHistory) {
    const exerciseLog = workout.exercises?.find(
      (ex: ExerciseLog) => ex.exerciseId === exerciseId,
    );
    if (exerciseLog) {
      return exerciseLog;
    }
  }

  return null;
}

/**
 * Calculate focus metric comparison
 */
export function calculateFocusMetric(
  metricType: FocusMetricType,
  currentSets: SetData[],
  previousSets?: Set[],
): MetricResult {
  let current: number | null = null;
  let previous: number | null = null;
  let change: number | null = null;
  let changePercent: number | null = null;
  let displayValue = "N/A";
  let displayChange = "—";

  // Calculate current value
  switch (metricType) {
    case "total_volume":
      current = calculateTotalVolume(currentSets);
      if (previousSets) previous = calculateTotalVolume(previousSets);
      if (current > 0) displayValue = `${current.toFixed(0)} kg`;
      break;

    case "volume_increase":
      current = calculateTotalVolume(currentSets);
      if (previousSets) {
        previous = calculateTotalVolume(previousSets);
        if (previous > 0) {
          changePercent = ((current - previous) / previous) * 100;
          displayValue = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(0)}%`;
        } else if (current > 0) {
          displayValue = "+100%";
        }
      }
      break;

    case "weight_per_rep":
      current = calculateWeightPerRep(currentSets);
      if (previousSets) previous = calculateWeightPerRep(previousSets);
      if (current > 0) displayValue = `${current.toFixed(1)} kg`;
      break;

    case "total_reps":
      current = calculateTotalReps(currentSets);
      if (previousSets) previous = calculateTotalReps(previousSets);
      if (current > 0) displayValue = `${current.toFixed(0)}`;
      break;

    case "reps_per_set":
      current = calculateRepsPerSet(currentSets);
      if (previousSets) previous = calculateRepsPerSet(previousSets);
      if (current > 0) displayValue = `${current.toFixed(1)}`;
      break;

    default:
      break;
  }

  // Calculate change
  if (current !== null && previous !== null && previous !== 0) {
    change = current - previous;
    if (metricType !== "volume_increase") {
      changePercent = (change / previous) * 100;
      displayChange = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(0)}%`;
    }
  }

  return {
    current,
    previous,
    change,
    changePercent,
    displayValue,
    displayChange,
  };
}

/**
 * Get available metrics for an exercise category
 */
export function getAvailableMetrics(category?: string): FocusMetricType[] {
  switch (category) {
    case "time":
      return ["total_time", "average_time"];
    case "distance":
      return ["total_distance"];
    case "bodyweight":
      return ["total_reps", "reps_per_set"];
    case "weight_reps":
    default:
      return [
        "total_volume",
        "volume_increase",
        "weight_per_rep",
        "total_reps",
        "reps_per_set",
      ];
  }
}

/**
 * Calculate focus metric comparison with previous workout data
 */
export async function calculateFocusMetricWithHistory(
  metricType: FocusMetricType,
  exerciseId: string,
  currentSets: SetData[],
): Promise<MetricResult> {
  // For now, calculate without history (history integration can be added later)
  // This allows the feature to work immediately
  return calculateFocusMetric(metricType, currentSets);
}

/**
 * Get display name for a metric type
 */
export function getMetricDisplayName(metricType: FocusMetricType): string {
  const names: Record<FocusMetricType, string> = {
    total_volume: "Total Volume",
    volume_increase: "Volume Increase",
    weight_per_rep: "Weight/Rep",
    total_reps: "Total Reps",
    reps_per_set: "Reps/Set",
    total_time: "Total Time",
    average_time: "Average Time",
    total_distance: "Total Distance",
  };
  return names[metricType];
}
