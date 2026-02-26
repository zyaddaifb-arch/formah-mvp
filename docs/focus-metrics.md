# Focus Metrics Feature

## Overview

Focus Metrics allow users to track specific performance indicators for each exercise during their workout. This feature helps users focus on particular training goals and compare their current performance to previous workouts.

## Available Metrics

### Weight & Reps Exercises (Default)

- **Total Volume**: Total weight × reps across all sets
- **Volume Increase**: Percentage change in volume from last workout
- **Weight/Rep**: Average weight per rep across all sets
- **Total Reps**: Total number of reps across all sets
- **Reps/Set**: Average reps per set

### Time-Based Exercises

- **Total Time**: Total time across all sets
- **Average Time**: Average time per set

### Distance-Based Exercises

- **Total Distance**: Total distance covered

### Bodyweight Exercises

- **Total Reps**: Total number of reps across all sets
- **Reps/Set**: Average reps per set

## How It Works

### Setting a Focus Metric

1. During a workout, tap the stats icon on any exercise
2. The metrics panel expands showing all available metrics
3. The current focus metric is highlighted with a star icon
4. Tap the settings icon or any metric card to change the focus metric
5. Select your desired metric from the modal

### Viewing Metrics

- **Primary Metric**: Displayed prominently with a colored background
- **Current Value**: Shows the calculated value for the current workout
- **Change Indicator**: Shows percentage change from previous workout (when available)
- **Secondary Metrics**: Other available metrics shown in smaller cards below

### Metric Calculations

All metrics are calculated in real-time based on completed sets:

```typescript
// Total Volume
volume = Σ(weight × reps) for all completed sets

// Volume Increase
increase = ((current_volume - previous_volume) / previous_volume) × 100

// Weight/Rep
weight_per_rep = total_volume / total_reps

// Reps/Set
reps_per_set = total_reps / number_of_completed_sets
```

## Implementation Details

### Type Definitions

```typescript
// types/workout.ts
export type FocusMetricType =
  | "total_volume"
  | "volume_increase"
  | "weight_per_rep"
  | "total_reps"
  | "reps_per_set"
  | "total_time"
  | "average_time"
  | "total_distance";

export interface ExerciseFocusMetric {
  exerciseId: string;
  metricType: FocusMetricType;
}
```

### Context Integration

Focus metrics are stored per exercise in the workout context:

```typescript
// contexts/workout-context.tsx
exerciseFocusMetrics: Record<string, string>
setExerciseFocusMetric: (exerciseId: string, metricType: string) => void
```

### Utility Functions

Core calculation logic is in `utils/focus-metrics.ts`:

- `calculateTotalVolume()`: Calculate total volume
- `calculateTotalReps()`: Calculate total reps
- `calculateWeightPerRep()`: Calculate average weight per rep
- `calculateFocusMetric()`: Main calculation function
- `getAvailableMetrics()`: Get metrics for exercise category
- `getMetricDisplayName()`: Get display name for metric

### Components

- **FocusMetricSelector**: Modal for selecting focus metric
- **ExerciseLogItem**: Displays metrics and handles selection

## Future Enhancements

### Workout History Integration

Currently, metrics show current workout data only. Future updates will:

1. Store workout history in AsyncStorage/SQLite
2. Compare current performance to previous workouts
3. Show trend indicators (improving/declining)
4. Display historical charts

### Additional Features

- Custom metric goals and targets
- Metric-based workout recommendations
- Progress notifications
- Personal records tracking
- Metric presets per exercise type

## Usage Example

```typescript
import { calculateFocusMetric } from "@/utils/focus-metrics";

const sets = [
  { weight: "100", reps: "10", completed: true },
  { weight: "100", reps: "8", completed: true },
  { weight: "100", reps: "6", completed: true },
];

const result = calculateFocusMetric("total_volume", sets);
// result.displayValue = "2400 kg"
// result.current = 2400
```

## Testing

To test the feature:

1. Start a workout
2. Add an exercise
3. Complete some sets with weight and reps
4. Tap the stats icon to view metrics
5. Try changing the focus metric
6. Complete more sets and watch metrics update in real-time

## Notes

- Metrics only calculate from completed sets (checked sets)
- Empty sets (no weight or reps) are excluded from calculations
- Default focus metric is "Total Volume"
- Metric selection persists during the workout session
- Metrics reset when workout is ended or cancelled
