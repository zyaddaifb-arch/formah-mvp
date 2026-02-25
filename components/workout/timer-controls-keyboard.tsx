import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TimerControlsKeyboardProps {
  remainingTime: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjust: (seconds: number) => void;
  onDismiss: () => void;
}

export function TimerControlsKeyboard({
  remainingTime,
  isRunning,
  onPause,
  onResume,
  onReset,
  onSkip,
  onAdjust,
  onDismiss,
}: TimerControlsKeyboardProps) {
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const actionBg = "rgba(55, 65, 81, 0.4)"; // Light gray background

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Text style={[styles.timerText, { color: "#fff" }]}>
          {formatTime(remainingTime)}
        </Text>
      </View>

      {/* Main Row: Big Pause Circle on left, Controls on right */}
      <View style={styles.mainRow}>
        {/* Big Pause/Resume Circle */}
        <Pressable
          style={[styles.pauseCircle, { backgroundColor: actionBg }]}
          onPress={isRunning ? onPause : onResume}
        >
          <Text style={[styles.pauseText, { color: "#fff" }]}>
            {isRunning ? "Pause" : "Resume"}
          </Text>
        </Pressable>

        {/* Right side controls */}
        <View style={styles.rightControls}>
          {/* Keyboard dismiss button */}
          <Pressable
            style={[styles.dismissButton, { backgroundColor: actionBg }]}
            onPress={onDismiss}
          >
            <View style={{ alignItems: "center" }}>
              <Ionicons name="keypad" size={18} color="#fff" />
              <Ionicons
                name="chevron-down"
                size={14}
                color="#fff"
                style={{ marginTop: -2 }}
              />
            </View>
          </Pressable>

          {/* Plus and Minus buttons */}
          <View style={styles.adjustRow}>
            <Pressable
              style={[styles.adjustButton, { backgroundColor: actionBg }]}
              onPress={() => onAdjust(-15)}
            >
              <Text style={[styles.adjustText, { color: "#fff" }]}>−</Text>
            </Pressable>
            <Pressable
              style={[styles.adjustButton, { backgroundColor: actionBg }]}
              onPress={() => onAdjust(15)}
            >
              <Text style={[styles.adjustText, { color: "#fff" }]}>+</Text>
            </Pressable>
          </View>

          {/* Reset button */}
          <Pressable
            style={[styles.resetButton, { backgroundColor: actionBg }]}
            onPress={onReset}
          >
            <Text style={[styles.resetText, { color: "#fff" }]}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* Skip button at bottom */}
      <Pressable
        style={[styles.skipButton, { backgroundColor: tintColor }]}
        onPress={onSkip}
      >
        <Text style={[styles.skipText, { color: "#fff" }]}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  timerDisplay: {
    alignItems: "center",
    paddingVertical: 8,
  },
  timerText: {
    fontSize: 36,
    fontWeight: "700",
  },
  mainRow: {
    flexDirection: "row",
    gap: 16,
    minHeight: 180,
  },
  pauseCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseText: {
    fontSize: 24,
    fontWeight: "700",
  },
  rightControls: {
    flex: 1,
    gap: 8,
    justifyContent: "space-between",
  },
  dismissButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  adjustRow: {
    flexDirection: "row",
    gap: 8,
  },
  adjustButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  adjustText: {
    fontSize: 32,
    fontWeight: "600",
  },
  resetButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  resetText: {
    fontSize: 18,
    fontWeight: "700",
  },
  skipButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
