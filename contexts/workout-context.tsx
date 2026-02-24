import React, { createContext, ReactNode, useContext, useState } from "react";

export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ExerciseWithSets {
  exerciseId: string;
  sets: SetData[];
}

interface WorkoutContextType {
  isWorkoutActive: boolean;
  isModalOpen: boolean;
  exerciseSets: Record<string, SetData[]>;
  startWorkout: () => void;
  endWorkout: () => void;
  openWorkout: () => void;
  closeModal: () => void;
  updateExerciseSets: (exerciseId: string, sets: SetData[]) => void;
  clearExerciseSets: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetData[]>>(
    {},
  );

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setIsModalOpen(true);
  };

  const endWorkout = () => {
    setIsWorkoutActive(false);
    setIsModalOpen(false);
    setExerciseSets({});
  };

  const openWorkout = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const updateExerciseSets = (exerciseId: string, sets: SetData[]) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: sets,
    }));
  };

  const clearExerciseSets = () => {
    setExerciseSets({});
  };

  return (
    <WorkoutContext.Provider
      value={{
        isWorkoutActive,
        isModalOpen,
        exerciseSets,
        startWorkout,
        endWorkout,
        openWorkout,
        closeModal,
        updateExerciseSets,
        clearExerciseSets,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
