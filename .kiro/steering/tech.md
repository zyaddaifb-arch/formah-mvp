# Formah App - Proposed Technologies & Libraries

## Core Technologies (Currently Installed)

### Framework & Runtime

- **React Native 0.81.5** - Core framework
- **React 19.1.0** - Latest version
- **Expo SDK ~54.0** - With new architecture
- **TypeScript 5.9.2** - With strict mode
- **Expo Router 6.0** - File-based routing

---

## Recommended Libraries to Add

### 1. State Management & Data Storage

#### **Zustand** (Highly Recommended)

```bash
npm install zustand
```

- Lightweight and easy to use
- Perfect for managing workout and template state
- Better than Redux for medium-sized projects

**Usage Example:**

```typescript
// stores/workout-store.ts
import { create } from "zustand";

interface WorkoutStore {
  activeWorkout: WorkoutSession | null;
  startWorkout: (template: Template) => void;
  endWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  activeWorkout: null,
  startWorkout: (template) => set({ activeWorkout: createSession(template) }),
  endWorkout: () => set({ activeWorkout: null }),
}));
```

#### **@react-native-async-storage/async-storage**

```bash
npx expo install @react-native-async-storage/async-storage
```

- Local storage for templates and settings
- Easy to use
- Suitable for simple data

#### **expo-sqlite** (For Large Data)

```bash
npx expo install expo-sqlite
```

- Local database
- Suitable for long workout history
- Powerful SQL queries

**When to Use Which:**

- AsyncStorage: For templates and settings (small data)
- SQLite: For workout history (large data with complex queries)

---

### 2. UI Components & Styling

#### **React Native Paper**

```bash
npm install react-native-paper
```

- Ready-made UI components library
- Material Design
- Full theming support
- Components: Button, Card, TextInput, Modal, FAB

#### **NativeWind** (Tailwind for React Native)

```bash
npm install nativewind
npm install --save-dev tailwindcss
```

- Tailwind CSS in React Native
- Fast to write
- Easy responsive design

#### **react-native-ui-lib** (Alternative)

```bash
npm install react-native-ui-lib
```

- Comprehensive UI library
- Many ready components
- High performance

---

### 3. Forms & Validation

#### **React Hook Form**

```bash
npm install react-hook-form
```

- Form management (creating templates)
- Excellent performance
- Easy validation

#### **Zod**

```bash
npm install zod
```

- Schema validation
- TypeScript-first
- Integrates with React Hook Form

**Example:**

```typescript
import { z } from "zod";
import { useForm } from "react-hook-form";

const templateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  exercises: z.array(z.string()).min(1, "Select at least one exercise"),
});
```

---

### 4. Charts & Visualization

#### **Victory Native**

```bash
npm install victory-native
```

- Charts for statistics
- Animated charts
- Suitable for consistency tracking

#### **react-native-chart-kit** (Lighter Alternative)

```bash
npm install react-native-chart-kit
```

- Lighter and simpler
- Line charts, Bar charts
- Suitable for simple statistics

---

### 5. Date & Time

#### **date-fns**

```bash
npm install date-fns
```

- Date manipulation
- Lightweight (moment.js alternative)
- Tree-shakeable

**Example:**

```typescript
import { format, differenceInDays } from "date-fns";

const formattedDate = format(new Date(), "PPP");
// "February 22nd, 2026"
```

#### **expo-calendar** (Optional)

```bash
npx expo install expo-calendar
```

- Add workouts to calendar
- Reminders

---

### 6. Animations & Interactions

#### **react-native-reanimated** (Existing)

- Smooth animations
- Gesture-based interactions

#### **expo-haptics** (Existing)

- Haptic feedback on set completion
- UX improvement

#### **Lottie** (Optional)

```bash
npx expo install lottie-react-native
```

- Ready-made animations
- Example: animation on workout completion

---

### 7. Icons & Images

#### **@expo/vector-icons** (Existing)

- Thousands of icons
- FontAwesome, MaterialIcons, Ionicons

#### **expo-image** (Existing)

- Efficient image loading
- Automatic caching

#### **react-native-svg**

```bash
npx expo install react-native-svg
```

- SVG graphics
- Suitable for custom icons

---

### 8. Notifications & Background Tasks

#### **expo-notifications**

```bash
npx expo install expo-notifications
```

- Workout reminders
- Rest time notifications

#### **expo-background-fetch** (Optional)

```bash
npx expo install expo-background-fetch
```

- Background data sync
- Statistics updates

---

### 9. Testing

#### **Jest** (Built-in with Expo)

- Unit testing
- Component testing

#### **@testing-library/react-native**

```bash
npm install --save-dev @testing-library/react-native
```

- Component testing
- User-centric testing

---

### 10. Utilities

#### **lodash** or **lodash-es**

```bash
npm install lodash
```

- Utility functions
- Array/Object manipulation

#### **clsx** or **classnames**

```bash
npm install clsx
```

- Conditional className
- Useful with NativeWind

---

## Recommended Implementation Priorities

### Phase 1 (Essential)

1. **Zustand** - State management
2. **AsyncStorage** - Template storage
3. **React Hook Form + Zod** - Forms
4. **date-fns** - Dates

### Phase 2 (UI)

5. **React Native Paper** or **NativeWind** - UI
6. **Victory Native** - Charts
7. **expo-haptics** - Feedback

### Phase 3 (Enhancements)

8. **expo-sqlite** - Database
9. **expo-notifications** - Reminders
10. **Lottie** - Animations

---

## Options Comparison

### State Management

| Library       | Size  | Difficulty | Performance | Recommendation |
| ------------- | ----- | ---------- | ----------- | -------------- |
| Zustand       | Small | Easy       | Excellent   | ⭐⭐⭐⭐⭐     |
| Redux Toolkit | Large | Medium     | Good        | ⭐⭐⭐         |
| Context API   | -     | Easy       | Medium      | ⭐⭐           |

### UI Libraries

| Library            | Components | Customization | Size   | Recommendation |
| ------------------ | ---------- | ------------- | ------ | -------------- |
| React Native Paper | Many       | Good          | Medium | ⭐⭐⭐⭐       |
| NativeWind         | -          | Excellent     | Small  | ⭐⭐⭐⭐⭐     |
| UI Lib             | Very Many  | Excellent     | Large  | ⭐⭐⭐⭐       |

### Storage

| Option       | Suitable Size | Queries | Difficulty | Recommendation |
| ------------ | ------------- | ------- | ---------- | -------------- |
| AsyncStorage | Small         | Simple  | Easy       | ⭐⭐⭐⭐       |
| SQLite       | Large         | Complex | Medium     | ⭐⭐⭐⭐⭐     |
| Realm        | Very Large    | Complex | Hard       | ⭐⭐⭐         |

---

## Quick Installation Commands

```bash
# State & Storage
npm install zustand
npx expo install @react-native-async-storage/async-storage

# Forms
npm install react-hook-form zod

# UI
npm install react-native-paper
# or
npm install nativewind
npm install --save-dev tailwindcss

# Charts
npm install victory-native

# Utilities
npm install date-fns lodash clsx

# Notifications
npx expo install expo-notifications

# Testing
npm install --save-dev @testing-library/react-native
```

---

## Summary

The recommended technologies are balanced between:

- **Ease of Use**: Easy-to-learn libraries
- **Performance**: High performance
- **Size**: Reasonable app size
- **Flexibility**: Easy to customize and scale

Start with the essentials (Zustand + AsyncStorage + React Hook Form) and then add other libraries as needed.
