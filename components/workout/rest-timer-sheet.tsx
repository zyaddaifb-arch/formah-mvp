import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RestTimerSheetProps {
  visible: boolean;
  remainingTime: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjust: (seconds: number) => void;
  onOpenKeyboard: () => void;
  onClose: () => void;
}

export function RestTimerSheet({
  visible,
  remainingTime,
  isRunning,
  onPause,
  onResume,
  onReset,
  onSkip,
  onAdjust,
  onOpenKeyboard,
  onClose,
}: RestTimerSheetProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const actionBg = "rgba(55, 65, 81, 0.4)"; // Light gray background

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Text style={[styles.timerText, { color: textColor }]}>
          {formatTime(remainingTime)}
        </Text>
      </View>

      {/* Row 1: Keyboard Icon, Pause/Resume, - + */}
      <View style={styles.row}>
        <Pressable style={styles.smallButton} onPress={onOpenKeyboard}>
          <Ionicons name="keypad" size={18} color="#fff" />
          <Ionicons
            name="chevron-down"
            size={14}
            color="#fff"
            style={{ marginTop: -2 }}
          />
        </Pressable>

        <Pressable
          style={[styles.pauseButton, { backgroundColor: actionBg }]}
          onPress={isRunning ? onPause : onResume}
        >
          <Text style={[styles.pauseText, { color: "#fff" }]}>
            {isRunning ? "Pause" : "Resume"}
          </Text>
        </Pressable>

        <View style={styles.minusPlusContainer}>
          <Pressable
            style={[styles.smallActionKey, { backgroundColor: actionBg }]}
            onPress={() => onAdjust(-15)}
          >
            <Text style={[styles.actionText, { color: "#fff" }]}>−</Text>
          </Pressable>
          <Pressable
            style={[styles.smallActionKey, { backgroundColor: actionBg }]}
            onPress={() => onAdjust(15)}
          >
            <Text style={[styles.actionText, { color: "#fff" }]}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Row 2: Reset and Skip */}
      <View style={styles.row}>
        <Pressable style={styles.numberKey} onPress={onReset}>
          <Text style={[styles.resetText, { color: "#fff" }]}>Reset</Text>
        </Pressable>
        <Pressable
          style={[styles.nextKey, { backgroundColor: tintColor }]}
          onPress={onSkip}
        >
          <Text style={[styles.nextText, { color: "#fff" }]}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 20,
    gap: 8,
  },
  timerDisplay: {
    alignItems: "center",
    paddingVertical: 12,
  },
  timerText: {
    fontSize: 36,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  smallButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(55, 65, 81, 0.4)",
  },
  pauseButton: {
    flex: 2,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseText: {
    fontSize: 18,
    fontWeight: "700",
  },
  minusPlusContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  smallActionKey: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 24,
    fontWeight: "600",
  },
  numberKey: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(55, 65, 81, 0.4)",
  },
  resetText: {
    fontSize: 16,
    fontWeight: "700",
  },
  nextKey: {
    flex: 1.5,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  nextText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
