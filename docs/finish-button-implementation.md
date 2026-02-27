# Finish Button Implementation Guide

## Overview

The Finish Workout feature has been fully implemented with intelligent validation and user-friendly modals, matching the Strong app's UX pattern.

## Files Created

### Core Logic

- `utils/workout-validation.ts` - Validation functions for sets
- `utils/workout-validation.test.ts` - Unit tests (12 tests passing)

### UI Components

- `components/workout/finish-workout-modal.tsx` - Smart modal with two variants

### Hooks

- `hooks/use-finish-workout.ts` - State management for finish flow

### Screens

- `app/workout/[id].tsx` - Complete workout screen with finish functionality

## Features Implemented

### ✅ Intelligent Set Validation

- Detects valid unfinished sets (has weight & reps but not marked complete)
- Identifies invalid sets (missing weight or reps)
- Calculates workout statistics (volume, reps, sets)

### ✅ Two Modal Variants

**Simple Modal** (all sets completed):

```
🎉 Finish Workout?
[Cancel] [Finish]
```

**Advanced Modal** (has valid unfinished sets):

```
🎉 Finish Workout?
There are valid sets in this workout that have not been marked as complete.
Invalid or empty sets will be removed.

[Complete Unfinished Sets]  ← Green (safe action)
[Discard Unfinished Sets]   ← Red (destructive)
[Cancel]                     ← Gray (safe exit)
```

### ✅ Workout Screen Features

- Real-time set tracking with checkmarks
- Rest timer display between sets
- Toggle set completion by tapping checkmark
- Exercise header with actions
- Add set functionality
- Bottom actions (Add Exercises, Cancel Workout)

## Usage Example

```typescript
import { useFinishWorkout } from "@/hooks/use-finish-workout";
import { FinishWorkoutModal } from "@/components/workout/finish-workout-modal";

function WorkoutScreen() {
  const {
    modalVisible,
    hasValidUnfinishedSets,
    initiateFinish,
    handleCompleteUnfinished,
    handleDiscardUnfinished,
    handleSimpleFinish,
    handleCancel,
  } = useFinishWorkout({
    workoutSession,
    onWorkoutFinished: (session, stats) => {
      // Save to storage
      // Navigate to summary
    },
  });

  return (
    <>
      <TouchableOpacity onPress={initiateFinish}>
        <Text>Finish</Text>
      </TouchableOpacity>

      <FinishWorkoutModal
        visible={modalVisible}
        hasValidUnfinishedSets={hasValidUnfinishedSets}
        onCancel={handleCancel}
        onFinish={handleSimpleFinish}
        onCompleteUnfinished={handleCompleteUnfinished}
        onDiscardUnfinished={handleDiscardUnfinished}
      />
    </>
  );
}
```

## Testing

All tests passing:

```bash
npm test

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
```

### Test Coverage

- ✅ Detect all sets completed
- ✅ Detect valid unfinished sets
- ✅ Detect invalid sets
- ✅ Handle mixed scenarios
- ✅ Mark valid unfinished sets as completed
- ✅ Remove all unfinished sets
- ✅ Remove exercises with no valid sets
- ✅ Calculate total volume, reps, and sets
- ✅ Ignore incomplete sets

## Design Specifications

### Colors

- Background: `#0f172a` (dark blue)
- Modal: `#1e293b` (slate)
- Primary (Finish): `#10b981` (green)
- Destructive (Discard): `#dc2626` (red)
- Cancel: `#2d3748` (gray)
- Text: `#ffffff` (white)
- Secondary Text: `#94a3b8` (slate-400)

### Typography

- Title: 22px, weight 700
- Description: 15px, weight 400
- Buttons: 17px, weight 700

### Spacing

- Modal padding: 28px
- Button padding: 18px vertical
- Gap between buttons: 14px
- Border radius: 12px

## Next Steps

To integrate with your app:

1. **Connect to WorkoutContext**

   ```typescript
   const { workoutSession } = useWorkoutContext();
   ```

2. **Implement Storage**

   ```typescript
   onWorkoutFinished: async (session, stats) => {
     await saveWorkout(session);
     await updateHistory(stats);
     router.push("/workout/summary");
   };
   ```

3. **Add Haptic Feedback**

   ```typescript
   import * as Haptics from "expo-haptics";

   onFinish: () => {
     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
   };
   ```

4. **Implement Timer**

   ```typescript
   const [elapsedTime, setElapsedTime] = useState(0);

   useEffect(() => {
     const interval = setInterval(() => {
       setElapsedTime((prev) => prev + 1);
     }, 1000);
     return () => clearInterval(interval);
   }, []);
   ```

## API Reference

### `validateWorkoutSets(exercises: ExerciseLog[])`

Returns validation result with:

- `hasValidUnfinishedSets: boolean`
- `hasInvalidSets: boolean`
- `allSetsCompleted: boolean`
- `validUnfinishedSets: Array<{exerciseId, setIndex}>`
- `invalidSets: Array<{exerciseId, setIndex}>`

### `completeUnfinishedSets(exercises: ExerciseLog[])`

Marks all valid unfinished sets as completed.

### `discardUnfinishedSets(exercises: ExerciseLog[])`

Removes all unfinished and invalid sets.

### `calculateWorkoutStats(exercises: ExerciseLog[])`

Returns:

- `totalVolume: number` (kg)
- `totalReps: number`
- `totalSets: number`

**Important:** Stats are calculated AFTER applying the user's finish choice:

- If user chooses "Complete Unfinished Sets" → unfinished sets are marked complete and included in stats
- If user chooses "Discard Unfinished Sets" → unfinished sets are removed and excluded from stats

## Troubleshooting

**Modal not showing?**

- Check `modalVisible` state
- Ensure `initiateFinish()` is called

**Wrong modal variant?**

- Check `hasValidUnfinishedSets` value
- Verify set data has weight and reps

**Stats calculation wrong?**

- Only completed sets are counted
- Weight and reps must be > 0
- Check set.completed flag

## Resources

- [Strong App UX Reference](docs/finish-workout-flow.md)
- [Test Suite](utils/workout-validation.test.ts)
- [Type Definitions](types/workout.ts)
