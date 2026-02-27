import { WorkoutSession } from "@/types/workout";
import {
    calculateWorkoutStats,
    completeUnfinishedSets,
    discardUnfinishedSets,
    validateWorkoutSets,
} from "@/utils/workout-validation";
import { useCallback, useState } from "react";

interface UseFinishWorkoutProps {
  workoutSession: WorkoutSession;
  onWorkoutFinished: (session: WorkoutSession, stats: any) => void;
}

export function useFinishWorkout({
  workoutSession,
  onWorkoutFinished,
}: UseFinishWorkoutProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  /**
   * Initiates the finish workout flow
   * Shows appropriate modal based on workout state
   */
  const initiateFinish = useCallback(() => {
    const validation = validateWorkoutSets(workoutSession.exercises);
    setValidationResult(validation);
    setModalVisible(true);
  }, [workoutSession]);

  /**
   * Completes the workout with all valid unfinished sets marked as completed
   */
  const handleCompleteUnfinished = useCallback(() => {
    const updatedExercises = completeUnfinishedSets(workoutSession.exercises);
    const finalSession: WorkoutSession = {
      ...workoutSession,
      exercises: updatedExercises,
      completedAt: new Date().toISOString(),
    };

    const stats = calculateWorkoutStats(updatedExercises);
    setModalVisible(false);
    onWorkoutFinished(finalSession, stats);
  }, [workoutSession, onWorkoutFinished]);

  /**
   * Completes the workout and discards all unfinished sets
   */
  const handleDiscardUnfinished = useCallback(() => {
    const updatedExercises = discardUnfinishedSets(workoutSession.exercises);
    const finalSession: WorkoutSession = {
      ...workoutSession,
      exercises: updatedExercises,
      completedAt: new Date().toISOString(),
    };

    const stats = calculateWorkoutStats(updatedExercises);
    setModalVisible(false);
    onWorkoutFinished(finalSession, stats);
  }, [workoutSession, onWorkoutFinished]);

  /**
   * Simple finish - used when all sets are properly completed
   */
  const handleSimpleFinish = useCallback(() => {
    const finalSession: WorkoutSession = {
      ...workoutSession,
      completedAt: new Date().toISOString(),
    };

    const stats = calculateWorkoutStats(workoutSession.exercises);
    setModalVisible(false);
    onWorkoutFinished(finalSession, stats);
  }, [workoutSession, onWorkoutFinished]);

  /**
   * Cancels the finish operation
   */
  const handleCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  return {
    modalVisible,
    hasValidUnfinishedSets: validationResult?.hasValidUnfinishedSets || false,
    initiateFinish,
    handleCompleteUnfinished,
    handleDiscardUnfinished,
    handleSimpleFinish,
    handleCancel,
  };
}
