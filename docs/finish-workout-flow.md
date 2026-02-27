# Finish Workout Flow Documentation

## Overview

This document explains the intelligent "Finish Workout" flow implementation, inspired by the Strong app's UX pattern.

## User Scenarios

### Scenario 1: All Sets Completed ✅

When all sets have:

- Valid weight (> 0)
- Valid reps (> 0)
- Marked as completed (✓)

**Flow:**

1. User presses "Finish" button
2. Simple modal appears with two options:
   - Cancel
   - Finish
3. If user confirms:
   - Stop workout timer
   - Calculate workout duration
   - Calculate total volume (weight × reps × sets)
   - Save to database
   - Record PRs if any
   - Navigate to Summary screen

### Scenario 2: Valid Unfinished Sets ⚠️

When there are sets with:

- Valid weight (> 0)
- Valid reps (> 0)
- BUT not marked as completed (no ✓)

**Flow:**

1. User presses "Finish" button
2. Advanced modal appears with three options:

   **🟢 Complete Unfinished Sets**
   - Marks all valid unfinished sets as completed
   - Saves all data
   - Protects user from losing data

   **🔴 Discard Unfinished Sets**
   - Removes all unfinished sets
   - Only saves completed sets
   - User explicitly chooses to discard

   **⚫ Cancel**
   - Closes modal
   - Returns to workout
   - No changes made

## Technical Implementation

### Core Files

```
utils/workout-validation.ts       # Validation logic
components/workout/finish-workout-modal.tsx  # UI component
hooks/use-finish-workout.ts       # State management hook
app/workout/[id].tsx              # Example usage
```

### Validation Logic

```typescript
validateWorkoutSets(exercises: ExerciseLog[]): ValidationResult
```

Returns:

- `hasValidUnfinishedSets`: Sets with data but not marked complete
- `hasInvalidSets`: Sets with missing or zero values
- `allSetsCompleted`: All sets properly completed
- `validUnfinishedSets`: Array of unfinished set locations
- `invalidSets`: Array of invalid set locations

### Set Classification

| Weight | Reps | Completed | Classification   |
| ------ | ---- | --------- | ---------------- |
| > 0    | > 0  | ✓         | Valid Completed  |
| > 0    | > 0  | ✗         | Valid Unfinished |
| 0      | any  | any       | Invalid          |
| any    | 0    | any       | Invalid          |

**Note (MVP):** Current validation is for weighted reps-based exercises only. Future versions will support exercise-type-specific validation (bodyweight, timed, distance-based exercises).

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

## UI Design Principles

### Visual Hierarchy

- **Primary Action (Green)**: Complete/Finish - Safe, recommended action
- **Destructive Action (Red)**: Discard - Potentially data loss
- **Safe Action (Gray)**: Cancel - No changes

### Modal Behavior

- Dark overlay (70% opacity)
- Blurred background
- Tap outside to cancel
- Clear visual feedback
- Emoji for emotional connection (🎉)

## Statistics Calculation

After finishing, the system calculates:

```typescript
{
  totalVolume: sum(weight × reps) for all completed sets
  totalReps: sum(reps) for all completed sets
  totalSets: count of completed sets
  duration: workout end time - start time
}
```

## Why This Approach?

### User Protection

- Prevents accidental data loss
- Gives users control over their data
- Clear communication about what will happen

### UX Best Practices

- Follows Strong app's proven pattern
- Visual hierarchy guides user decisions
- Destructive actions clearly marked
- Easy to cancel and return

### Technical Benefits

- Clean separation of concerns
- Testable validation logic
- Reusable components
- Type-safe implementation

## Testing

Run tests with:

```bash
npm test utils/workout-validation.test.ts
```

Tests cover:

- All sets completed scenario
- Valid unfinished sets detection
- Invalid sets detection
- Mixed scenarios
- Complete unfinished sets function
- Discard unfinished sets function
- Statistics calculation

## Future Enhancements

- [ ] Add haptic feedback on button press
- [ ] Animate modal transitions
- [ ] Add workout summary preview in modal
- [ ] Support for time-based exercises
- [ ] PR detection and celebration
- [ ] Cloud sync after finish
