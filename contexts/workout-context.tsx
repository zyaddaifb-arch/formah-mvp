import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const DRAFT_WORKOUT_KEY = "@formah_draft_workout";

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
  focusMetric?: string;
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
  exerciseFocusMetrics: Record<string, string>;
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
  setExerciseFocusMetric: (exerciseId: string, metricType: string) => void;
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
  const [exerciseFocusMetrics, setExerciseFocusMetrics] = useState<
    Record<string, string>
  >({});
  const [workoutNotes, setWorkoutNotes] = useState<WorkoutNote[]>([]);
  const [workoutPhoto, setWorkoutPhoto] = useState<string | null>(null);

  // Auto-save workout draft whenever data changes
  useEffect(() => {
    if (isWorkoutActive) {
      const draftData = {
        exerciseSets,
        exerciseNotes,
        exerciseStickyNotes,
        exerciseFocusMetrics,
        workoutNotes,
        workoutPhoto,
        timestamp: new Date().toISOString(),
      };
      AsyncStorage.setItem(DRAFT_WORKOUT_KEY, JSON.stringify(draftData)).catch(
        (error) => console.error("Error saving draft:", error),
      );
    }
  }, [
    isWorkoutActive,
    exerciseSets,
    exerciseNotes,
    exerciseStickyNotes,
    exerciseFocusMetrics,
    workoutNotes,
    workoutPhoto,
  ]);

  // Load draft workout on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem(DRAFT_WORKOUT_KEY);
        if (draft) {
          const data = JSON.parse(draft);
          // Check if draft is less than 24 hours old
          const draftTime = new Date(data.timestamp).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - draftTime) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            // Restore draft
            setExerciseSets(data.exerciseSets || {});
            setExerciseNotes(data.exerciseNotes || {});
            setExerciseStickyNotes(data.exerciseStickyNotes || {});
            setExerciseFocusMetrics(data.exerciseFocusMetrics || {});
            setWorkoutNotes(data.workoutNotes || []);
            setWorkoutPhoto(data.workoutPhoto || null);
            setIsWorkoutActive(true);
          } else {
            // Draft too old, clear it
            await AsyncStorage.removeItem(DRAFT_WORKOUT_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };

    loadDraft();
  }, []);

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
    setExerciseFocusMetrics({});
    setWorkoutNotes([]);
    setWorkoutPhoto(null);
    // Clear draft when workout ends
    AsyncStorage.removeItem(DRAFT_WORKOUT_KEY).catch((error) =>
      console.error("Error clearing draft:", error),
    );
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

  const setExerciseFocusMetric = (exerciseId: string, metricType: string) => {
    setExerciseFocusMetrics((prev) => ({
      ...prev,
      [exerciseId]: metricType,
    }));
  };

  return (
    <WorkoutContext.Provider
      value={{
        isWorkoutActive,
        isModalOpen,
        exerciseSets,
        exerciseNotes,
        exerciseStickyNotes,
        exerciseFocusMetrics,
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
        setExerciseFocusMetric,
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
