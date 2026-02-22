import { Template } from "../types/workout";

export const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Upper Body Power",
    exercises: ["Bench Press", "Rows", "Overhead Press", "Pullups", "Dips"],
    lastPlayed: "2 days ago",
  },
  {
    id: "2",
    name: "Lower Body Hypertrophy",
    exercises: ["Squats", "Lunges", "RDLs"],
    lastPlayed: "5 days ago",
  },
  {
    id: "3",
    name: "Active Recovery",
    exercises: ["Stretching", "Foam Roll", "Yoga"],
    lastPlayed: "yesterday",
  },
  {
    id: "4",
    name: "Core Blaster",
    exercises: ["Plank", "Crunches", "Leg Raises"],
    lastPlayed: "1 week ago",
  },
];
