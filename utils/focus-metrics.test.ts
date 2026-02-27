// Simple test file to verify exports work correctly
import {
  calculateFocusMetric,
  calculateTotalVolume,
  getMetricDisplayName,
} from "./focus-metrics";

describe("focus-metrics", () => {
  it("should calculate total volume correctly", () => {
    const testSets = [
      { id: "1", weight: "100", reps: "10", completed: true },
      { id: "2", weight: "100", reps: "8", completed: true },
    ];

    const volume = calculateTotalVolume(testSets);
    expect(volume).toBe(1800); // (100 * 10) + (100 * 8)
  });

  it("should get metric display name", () => {
    const name = getMetricDisplayName("total_volume");
    expect(name).toBe("Total Volume");
  });

  it("should calculate focus metric", () => {
    const testSets = [
      { id: "1", weight: "100", reps: "10", completed: true },
      { id: "2", weight: "100", reps: "8", completed: true },
    ];

    const result = calculateFocusMetric("total_volume", testSets);
    expect(result.current).toBe(1800);
    expect(result.displayValue).toBe("1800 kg");
  });
});

