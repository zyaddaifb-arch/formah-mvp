# Formah App - Project Structure Plan

## Overview

Formah App is a fitness workout tracking application built with Expo and React Native. The app helps users create, manage, and execute workout templates with exercise tracking capabilities.

---

## Proposed Folder Structure

### `/app` - Routing & Screens

```
/app
├── _layout.tsx                    # Root layout with theme provider
├── (tabs)/                        # Tab navigation group
│   ├── _layout.tsx               # Tab navigator configuration
│   ├── index.tsx                 # Home: Workout templates list
│   └── history.tsx               # History: Workout log and statistics
├── workout/                       # Workout screens
│   ├── [id].tsx                  # Active workout execution screen
│   └── summary.tsx               # Workout summary after completion
├── templates/                     # Template management
│   ├── create.tsx                # Create new template
│   ├── [id]/
│   │   ├── edit.tsx              # Edit template
│   │   └── details.tsx           # Template details
│   └── archived.tsx              # Archived templates
└── exercises/                     # Exercise library
    ├── index.tsx                 # Exercise list with search and filters
    └── [id].tsx                  # Exercise details
```

### `/components` - Reusable Components

```
/components
├── themed-text.tsx               # Text with theme support
├── themed-view.tsx               # View with theme support
├── workout/                      # Workout-specific components
│   ├── template-card.tsx         # Template display card
│   ├── exercise-item.tsx         # Exercise list item
│   ├── set-tracker.tsx           # Set tracking component
│   └── workout-timer.tsx         # Workout timer
├── exercises/                    # Exercise library components
│   ├── exercise-card.tsx         # Exercise card
│   ├── exercise-filter.tsx       # Filter by body part and equipment
│   └── exercise-search.tsx       # Exercise search
├── history/                      # History components
│   ├── workout-history-item.tsx  # Workout history item
│   ├── consistency-chart.tsx     # Consistency chart
│   └── stats-card.tsx            # Statistics card
└── ui/                           # UI primitives
    ├── button.tsx                # Custom button
    ├── card.tsx                  # Card component
    ├── input.tsx                 # Input field
    ├── modal.tsx                 # Modal
    └── collapsible.tsx           # (existing)
```

### `/data` - Data & State Management

```
/data
├── exercises.ts                  # Exercise data (can be JSON)
├── mock-templates.ts             # Mock template data
└── storage/                      # Local storage utilities
    ├── templates.ts              # Save/load templates
    ├── workouts.ts               # Save/load workout history
    └── settings.ts               # User settings
```

### `/types` - TypeScript Types

```
/types
├── workout.ts                    # Workout types
│   ├── Template
│   ├── Exercise
│   ├── WorkoutSession
│   ├── Set
│   └── ExerciseLog
├── filters.ts                    # Filter types
│   ├── BodyPart
│   ├── Equipment
│   └── FilterOptions
└── stats.ts                      # Statistics types
    ├── WorkoutStats
    └── ConsistencyData
```

### `/utils` - Utility Functions

```
/utils
├── date.ts                       # Date and time functions
├── workout-calculator.ts         # Workout calculations (volume, weight)
├── storage-helpers.ts            # Local storage helpers
└── validation.ts                 # Data validation
```

### `/hooks` - Custom Hooks

```
/hooks
├── use-color-scheme.ts           # (existing)
├── use-theme-color.ts            # (existing)
├── use-templates.ts              # Template management
├── use-workout-session.ts        # Workout session management
├── use-exercises.ts              # Fetch and filter exercises
└── use-workout-history.ts        # Workout history
```

### `/constants` - Constants

```
/constants
├── theme.ts                      # (existing) Colors and fonts
├── exercises.ts                  # Exercise constants
│   ├── BODY_PARTS
│   ├── EQUIPMENT_TYPES
│   └── EXERCISE_CATEGORIES
└── workout.ts                    # Workout constants
    ├── DEFAULT_REST_TIME
    └── WORKOUT_TYPES
```

### `/assets` - Static Assets

```
/assets
├── images/                       # (existing)
│   ├── icon.png
│   ├── splash-icon.png
│   └── workout-placeholder.png   # Default workout image
└── animations/                   # (optional) Lottie animations
    └── workout-complete.json
```

---

## Proposed User Flow

### 1. Home Screen (Home Tab)

- Display active workout templates
- "Start Workout" button for each template
- "Create New Template" button
- Show last completed workout

### 2. Create New Template

- Template name
- Select exercises from library
- Order exercises
- Save template

### 3. Exercise Library

- Display all exercises
- Search by name
- Filter by:
  - Body Part (chest, back, legs, etc.)
  - Equipment (dumbbell, barbell, bodyweight, etc.)

### 4. Execute Workout

- Display exercises in template
- Track sets, reps, and weight
- Rest timer between sets
- Complete workout and save log

### 5. History & Statistics (History Tab)

- Display previous workout history
- Consistency chart
- Statistics (workout count, total volume, etc.)

---

## Next Implementation Steps

1. **Create Types** in `/types`
2. **Add Exercise Data** in `/data/exercises.ts`
3. **Build Core Components** in `/components`
4. **Implement Hooks** for state management
5. **Build Screens** in `/app`
6. **Add Local Storage** (AsyncStorage or SQLite)
7. **Testing and Optimization**

---

## Technical Notes

- Use **Expo Router** for routing
- **AsyncStorage** or **expo-sqlite** for local storage
- **react-native-reanimated** for animations
- **expo-haptics** for haptic feedback on set completion
- Support **Dark/Light Mode** via existing themed components
