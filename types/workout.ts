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
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  date: string;
  exercises: ExerciseLog[];
}

export interface ExerciseLog {
  exerciseId: string;
  sets: Set[];
}

export interface Set {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ConsistencyData {
  completedDays: number;
  totalDays: number;
}
