// Workout Types
export interface Template {
  id: string;
  name: string;
  exercises: string[];
  lastPlayed?: string;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  category?: "weight_reps" | "time" | "distance" | "bodyweight";
}

export type FocusMetricType =
  | "total_volume"
  | "volume_increase"
  | "weight_per_rep"
  | "total_reps"
  | "reps_per_set"
  | "total_time"
  | "average_time"
  | "total_distance";

export interface ExerciseFocusMetric {
  exerciseId: string;
  metricType: FocusMetricType;
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  date: string;
  exercises: ExerciseLog[];
  completedAt?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: Set[];
  focusMetric?: FocusMetricType;
}

export interface Set {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface ExerciseStickyNote {
  text: string;
  createdAt: string;
}

export interface ConsistencyData {
  completedDays: number;
  totalDays: number;
}
