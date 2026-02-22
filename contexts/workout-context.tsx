import React, { createContext, ReactNode, useContext, useState } from "react";

interface WorkoutContextType {
  isWorkoutActive: boolean;
  isModalOpen: boolean;
  startWorkout: () => void;
  endWorkout: () => void;
  openWorkout: () => void;
  closeModal: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setIsModalOpen(true);
  };

  const endWorkout = () => {
    setIsWorkoutActive(false);
    setIsModalOpen(false);
  };

  const openWorkout = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <WorkoutContext.Provider
      value={{
        isWorkoutActive,
        isModalOpen,
        startWorkout,
        endWorkout,
        openWorkout,
        closeModal,
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
