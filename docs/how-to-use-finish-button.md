# How to Use the Finish Button Feature

## Overview

The intelligent Finish Button has been integrated into your existing workout flow in `workout-bottom-sheet.tsx`. It automatically validates your workout sets and shows the appropriate modal based on the workout state.

## How It Works

### When You Press "Finish"

The system checks all your sets and determines:

1. **All Sets Completed** ✅
   - Shows simple modal: "Finish Workout?"
   - Options: [Cancel] [Finish]

2. **Has Valid Unfinished Sets** ⚠️
   - Shows advanced modal with 3 options:
   - **Complete Unfinished Sets** (Green) - Marks all valid sets as complete
   - **Discard Unfinished Sets** (Red) - Removes unfinished sets
   - **Cancel** (Gray) - Returns to workout

### What Are "Valid Unfinished Sets"?

Sets that have:

- Weight > 0
- Reps > 0
- BUT not marked with ✓ (completed checkbox)

### What Are "Invalid Sets"?

**Invalid Sets (MVP):** Any set missing required values for weighted reps-based exercises (weight <= 0 or reps <= 0). These are removed during finishing before saving.

**Note:** In future versions, validation will be based on exercise type (e.g., bodyweight and timed sets).

## User Flow Example

### Scenario 1: Perfect Workout

```
Set 1: 25kg × 6 ✓
Set 2: 25kg × 6 ✓
Set 3: 30kg × 5 ✓

Press Finish → Simple Modal → Finish → Done!
```

### Scenario 2: Forgot to Check Some Sets

```
Set 1: 25kg × 6 ✓
Set 2: 25kg × 6 ← Has data but no ✓
Set 3: 30kg × 5 ✓

Press Finish → Advanced Modal → Choose:
- Complete Unfinished Sets → Set 2 gets ✓ automatically
- Discard Unfinished Sets → Set 2 is removed
- Cancel → Go back and check Set 2 manually
```

### Scenario 3: Empty Sets

```
Set 1: 25kg × 6 ✓
Set 2: 0kg × 0 ← Empty set
Set 3: 30kg × 5 ✓

Press Finish → Set 2 is automatically removed
```

## Testing the Feature

1. **Start a workout** from the home screen
2. **Add exercises** using "Add Exercises" button
3. **Add some sets** with different states:
   - Some completed (with ✓)
   - Some with data but not checked
   - Some empty
4. **Press Finish** button (top right)
5. **See the modal** based on your workout state

## Code Integration

The feature is integrated in `components/workout/workout-bottom-sheet.tsx`:

```typescript
// When Finish button is pressed
const initiateFinish = () => {
  // Validates all sets
  // Shows appropriate modal
};

// Three possible outcomes
const handleSimpleFinish = async () => {
  // All sets are good, just save
};

const handleCompleteUnfinished = async () => {
  // Mark unfinished sets as complete, then save
};

const handleDiscardUnfinished = async () => {
  // Remove unfinished sets, then save
};
```

## Statistics Calculated

When workout finishes, the system calculates:

- **Total Volume**: sum(weight × reps) for all completed sets
- **Total Reps**: sum(reps) for all completed sets
- **Total Sets**: count of completed sets

**Stats are computed after applying your Finish choice:**

- **Complete Unfinished** → those sets are included
- **Discard Unfinished** → those sets are excluded

These stats are logged to console and saved with the workout.

## What Happens After Finish

1. Workout is saved to AsyncStorage
2. All workout data is cleared
3. Timer is reset
4. You return to home screen
5. Workout appears in history

## Troubleshooting

**Q: Modal doesn't show?**

- Make sure you have exercises added
- Check that you pressed the green "Finish" button

**Q: Wrong modal appears?**

- Check your sets - do they have weight and reps?
- Are they marked with ✓?

**Q: Sets disappear after finish?**

- Empty sets (0kg or 0 reps) are automatically removed
- This is expected behavior

**Q: Want to keep unfinished sets?**

- Choose "Complete Unfinished Sets" option
- Or go back and mark them manually before finishing

## Tips

1. **Always check your sets** before finishing to avoid the advanced modal
2. **Use the checkmark** (✓) to mark sets as complete
3. **Empty sets are okay** - they'll be removed automatically
4. **Can't decide?** Press Cancel and review your workout

## Next Steps

The feature is ready to use! Just:

1. Start a workout
2. Add exercises
3. Complete your sets
4. Press Finish
5. Choose your option if needed

Enjoy your workouts! 💪
