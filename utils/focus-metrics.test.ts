// Simple test file to verify exports work correctly
import {
    calculateFocusMetric,
    calculateTotalVolume,
    getMetricDisplayName,
} from "./focus-metrics";

// This file exists to verify that the exports are working correctly
// If this file has no TypeScript errors, the exports are correct

const testSets = [
  { id: "1", weight: "100", reps: "10", completed: true },
  { id: "2", weight: "100", reps: "8", completed: true },
];

const result = calculateFocusMetric("total_volume", testSets);
const volume = calculateTotalVolume(testSets);
const name = getMetricDisplayName("total_volume");

console.log("Test passed:", { result, volume, name });
