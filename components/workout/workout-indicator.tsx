import { useWorkout } from "@/contexts/workout-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export function WorkoutIndicator() {
  const { isWorkoutActive, openWorkout, endWorkout } = useWorkout();
  const tintColor = useThemeColor({}, "tint");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isWorkoutActive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    Alert.alert(
      "Discard Workout?",
      "Are you sure you want to discard this workout in progress?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Discard Workout",
          style: "destructive",
          onPress: () => endWorkout(),
        },
      ],
      { cancelable: true },
    );
  };

  if (!isWorkoutActive) return null;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: tintColor }]}
      onPress={openWorkout}
    >
      <View style={styles.leftButton}>
        <Ionicons name="chevron-up" size={16} color="#fff" />
      </View>

      <View style={styles.content}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.title}>Workout {formatTime(elapsedTime)}</Text>
        </View>
        <Text style={styles.subtitle}>Quick Workout</Text>
      </View>

      <Pressable style={styles.rightButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={16} color="#fff" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leftButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#10b981",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
  },
  rightButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
});
