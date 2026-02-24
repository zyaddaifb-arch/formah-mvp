import { Exercise } from "@/types/workout";

export const exercises: Exercise[] = [
  {
    id: "1",
    name: "Deadlift High Pull (Barbell)",
    bodyPart: "Olympic",
    equipment: "Barbell",
  },
  {
    id: "2",
    name: "Bench Press (Dumbbell)",
    bodyPart: "Chest",
    equipment: "Dumbbell",
  },
  {
    id: "3",
    name: "Incline Bench Press (Smith Machine)",
    bodyPart: "Chest",
    equipment: "Smith Machine",
  },
  {
    id: "4",
    name: "Lat Pulldown - Wide Grip (Cable)",
    bodyPart: "Back",
    equipment: "Cable",
  },
  {
    id: "5",
    name: "Preacher Curl (Dumbbell)",
    bodyPart: "Arms",
    equipment: "Dumbbell",
  },
  {
    id: "6",
    name: "Reverse Grip Curls",
    bodyPart: "Arms",
    equipment: "Barbell",
  },
  {
    id: "7",
    name: "SA Rear Delt Flies",
    bodyPart: "Shoulders",
    equipment: "Dumbbell",
  },
  {
    id: "8",
    name: "Squat (Barbell)",
    bodyPart: "Legs",
    equipment: "Barbell",
  },
  {
    id: "9",
    name: "Romanian Deadlift (Barbell)",
    bodyPart: "Legs",
    equipment: "Barbell",
  },
  {
    id: "10",
    name: "Overhead Press (Barbell)",
    bodyPart: "Shoulders",
    equipment: "Barbell",
  },
  {
    id: "11",
    name: "Pull-ups",
    bodyPart: "Back",
    equipment: "Bodyweight",
  },
  {
    id: "12",
    name: "Dips",
    bodyPart: "Chest",
    equipment: "Bodyweight",
  },
  {
    id: "13",
    name: "Leg Press (Machine)",
    bodyPart: "Legs",
    equipment: "Machine",
  },
  {
    id: "14",
    name: "Cable Fly",
    bodyPart: "Chest",
    equipment: "Cable",
  },
  {
    id: "15",
    name: "Face Pulls (Cable)",
    bodyPart: "Shoulders",
    equipment: "Cable",
  },
];

export const bodyParts = [
  "Any Body Part",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Olympic",
];

export const categories = [
  "Any Category",
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Smith Machine",
];
