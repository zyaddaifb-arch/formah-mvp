import React, { createContext, ReactNode, useContext, useState } from "react";

export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  isWarmup?: boolean;
}

export interface ExerciseWithSets {
  exerciseId: string;
  sets: SetData[];
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

export interface WorkoutNote {
  id: string;
  text: string;
  createdAt: string;
}

interface WorkoutContextType {
  isWorkoutActive: boolean;
  isModalOpen: boolean;
  exerciseSets: Record<string, SetData[]>;
  exerciseNotes: Record<string, ExerciseNote[]>;
  exerciseStickyNotes: Record<string, ExerciseStickyNote>;
  workoutNotes: WorkoutNote[];
  workoutPhoto: string | null;
  startWorkout: () => void;
  endWorkout: () => void;
  openWorkout: () => void;
  closeModal: () => void;
  updateExerciseSets: (exerciseId: string, sets: SetData[]) => void;
  clearExerciseSets: () => void;
  addExerciseNote: (exerciseId: string, text: string) => void;
  updateExerciseNote: (
    exerciseId: string,
    noteId: string,
    text: string,
  ) => void;
  deleteExerciseNote: (exerciseId: string, noteId: string) => void;
  setExerciseStickyNote: (exerciseId: string, text: string) => void;
  deleteExerciseStickyNote: (exerciseId: string) => void;
  addWorkoutNote: (text: string) => void;
  updateWorkoutNote: (noteId: string, text: string) => void;
  deleteWorkoutNote: (noteId: string) => void;
  setWorkoutPhoto: (uri: string | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetData[]>>(
    {},
  );
  const [exerciseNotes, setExerciseNotes] = useState<
    Record<string, ExerciseNote[]>
  >({});
  const [exerciseStickyNotes, setExerciseStickyNotes] = useState<
    Record<string, ExerciseStickyNote>
  >({});
  const [workoutNotes, setWorkoutNotes] = useState<WorkoutNote[]>([]);
  const [workoutPhoto, setWorkoutPhoto] = useState<string | null>(null);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setIsModalOpen(true);
  };

  const endWorkout = () => {
    setIsWorkoutActive(false);
    setIsModalOpen(false);
    setExerciseSets({});
    setExerciseNotes({});
    setExerciseStickyNotes({});
    setWorkoutNotes([]);
    setWorkoutPhoto(null);
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

  const addExerciseNote = (exerciseId: string, text: string) => {
    const newNote: ExerciseNote = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
    };
    setExerciseNotes((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), newNote],
    }));
  };

  const updateExerciseNote = (
    exerciseId: string,
    noteId: string,
    text: string,
  ) => {
    setExerciseNotes((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).map((note) =>
        note.id === noteId ? { ...note, text } : note,
      ),
    }));
  };

  const deleteExerciseNote = (exerciseId: string, noteId: string) => {
    setExerciseNotes((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).filter(
        (note) => note.id !== noteId,
      ),
    }));
  };

  const setExerciseStickyNote = (exerciseId: string, text: string) => {
    setExerciseStickyNotes((prev) => ({
      ...prev,
      [exerciseId]: {
        text,
        createdAt: new Date().toISOString(),
      },
    }));
  };

  const deleteExerciseStickyNote = (exerciseId: string) => {
    setExerciseStickyNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[exerciseId];
      return newNotes;
    });
  };

  const addWorkoutNote = (text: string) => {
    const newNote: WorkoutNote = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
    };
    setWorkoutNotes((prev) => [...prev, newNote]);
  };

  const updateWorkoutNote = (noteId: string, text: string) => {
    setWorkoutNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, text } : note)),
    );
  };

  const deleteWorkoutNote = (noteId: string) => {
    setWorkoutNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  return (
    <WorkoutContext.Provider
      value={{
        isWorkoutActive,
        isModalOpen,
        exerciseSets,
        exerciseNotes,
        exerciseStickyNotes,
        workoutNotes,
        workoutPhoto,
        startWorkout,
        endWorkout,
        openWorkout,
        closeModal,
        updateExerciseSets,
        clearExerciseSets,
        addExerciseNote,
        updateExerciseNote,
        deleteExerciseNote,
        setExerciseStickyNote,
        deleteExerciseStickyNote,
        addWorkoutNote,
        updateWorkoutNote,
        deleteWorkoutNote,
        setWorkoutPhoto,
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
