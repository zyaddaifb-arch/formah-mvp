import { ExerciseLog } from "@/types/workout";
import {
    calculateWorkoutStats,
    completeUnfinishedSets,
    discardUnfinishedSets,
    validateWorkoutSets,
} from "./workout-validation";

describe("workout-validation", () => {
  describe("validateWorkoutSets", () => {
    it("should detect all sets completed", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true },
            { weight: 30, reps: 5, completed: true },
          ],
        },
      ];

      const result = validateWorkoutSets(exercises);

      expect(result.allSetsCompleted).toBe(true);
      expect(result.hasValidUnfinishedSets).toBe(false);
      expect(result.hasInvalidSets).toBe(false);
    });

    it("should detect valid unfinished sets", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true },
            { weight: 25, reps: 6, completed: false }, // Valid but not completed
          ],
        },
      ];

      const result = validateWorkoutSets(exercises);

      expect(result.hasValidUnfinishedSets).toBe(true);
      expect(result.validUnfinishedSets).toHaveLength(1);
      expect(result.validUnfinishedSets[0]).toEqual({
        exerciseId: "bench-press",
        setIndex: 1,
      });
    });

    it("should detect invalid sets", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true },
            { weight: 0, reps: 0, completed: false }, // Invalid
            { weight: 0, reps: 5, completed: false }, // Invalid (no weight)
          ],
        },
      ];

      const result = validateWorkoutSets(exercises);

      expect(result.hasInvalidSets).toBe(true);
      expect(result.invalidSets).toHaveLength(2);
    });

    it("should handle mixed scenarios", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true }, // Valid completed
            { weight: 30, reps: 5, completed: false }, // Valid unfinished
            { weight: 0, reps: 0, completed: false }, // Invalid
          ],
        },
      ];

      const result = validateWorkoutSets(exercises);

      expect(result.allSetsCompleted).toBe(false);
      expect(result.hasValidUnfinishedSets).toBe(true);
      expect(result.hasInvalidSets).toBe(true);
      expect(result.validUnfinishedSets).toHaveLength(1);
      expect(result.invalidSets).toHaveLength(1);
    });
  });

  describe("completeUnfinishedSets", () => {
    it("should mark valid unfinished sets as completed", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true },
            { weight: 30, reps: 5, completed: false }, // Should be completed
            { weight: 0, reps: 0, completed: false }, // Should stay incomplete
          ],
        },
      ];

      const result = completeUnfinishedSets(exercises);

      expect(result[0].sets[0].completed).toBe(true);
      expect(result[0].sets[1].completed).toBe(true); // Now completed
      expect(result[0].sets[2].completed).toBe(false); // Still incomplete
    });
  });

  describe("discardUnfinishedSets", () => {
    it("should remove all unfinished sets", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true },
            { weight: 30, reps: 5, completed: false }, // Should be removed
            { weight: 0, reps: 0, completed: false }, // Should be removed
          ],
        },
      ];

      const result = discardUnfinishedSets(exercises);

      expect(result[0].sets).toHaveLength(1);
      expect(result[0].sets[0]).toEqual({
        weight: 25,
        reps: 6,
        completed: true,
      });
    });

    it("should remove exercises with no valid sets", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [{ weight: 25, reps: 6, completed: true }],
        },
        {
          exerciseId: "squat",
          sets: [
            { weight: 0, reps: 0, completed: false }, // All invalid
          ],
        },
      ];

      const result = discardUnfinishedSets(exercises);

      expect(result).toHaveLength(1);
      expect(result[0].exerciseId).toBe("bench-press");
    });
  });

  describe("calculateWorkoutStats", () => {
    it("should calculate total volume, reps, and sets", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true }, // 150
            { weight: 30, reps: 5, completed: true }, // 150
          ],
        },
        {
          exerciseId: "squat",
          sets: [
            { weight: 50, reps: 10, completed: true }, // 500
          ],
        },
      ];

      const stats = calculateWorkoutStats(exercises);

      expect(stats.totalVolume).toBe(800); // 150 + 150 + 500
      expect(stats.totalReps).toBe(21); // 6 + 5 + 10
      expect(stats.totalSets).toBe(3);
    });

    it("should ignore incomplete sets", () => {
      const exercises: ExerciseLog[] = [
        {
          exerciseId: "bench-press",
          sets: [
            { weight: 25, reps: 6, completed: true },
            { weight: 30, reps: 5, completed: false }, // Should be ignored
          ],
        },
      ];

      const stats = calculateWorkoutStats(exercises);

      expect(stats.totalVolume).toBe(150);
      expect(stats.totalReps).toBe(6);
      expect(stats.totalSets).toBe(1);
    });
  });
});
