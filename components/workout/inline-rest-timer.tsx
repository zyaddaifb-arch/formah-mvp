import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TimerControlsKeyboard } from "./timer-controls-keyboard";
import { TimerKeyboard } from "./timer-keyboard";

interface InlineRestTimerProps {
  remainingTime: number;
  totalDuration: number;
  isRunning: boolean;
  isCompleted: boolean;
  onUpdate: (remainingTime: number, totalDuration: number) => void;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onKeyboardOpen?: (yPosition: number) => void;
}

function InlineRestTimer({
  remainingTime,
  totalDuration,
  isRunning,
  isCompleted,
  onUpdate,
  onStart,
  onPause,
  onSkip,
  onKeyboardOpen,
}: InlineRestTimerProps) {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showTimerControls, setShowTimerControls] = useState(false); // Track if we're in timer mode
  const [timeInput, setTimeInput] = useState("");
  const progressAnim = useRef(new Animated.Value(1)).current;
  const containerRef = useRef<View>(null);

  const tintColor = useThemeColor({}, "tint");

  // Don't auto-show timer sheet - only show when user clicks

  const parseInputToSeconds = (input: string): number => {
    if (!input) return 0;

    const num = parseInt(input);

    // 1 digit = seconds (e.g., "5" = 5 seconds)
    if (input.length === 1) {
      return num;
    }
    // 2 digits = seconds (e.g., "45" = 45 seconds)
    else if (input.length === 2) {
      return num;
    }
    // 3 digits = M:SS (e.g., "145" = 1:45 = 105 seconds)
    else {
      const mins = Math.floor(num / 100);
      const secs = num % 100;
      return mins * 60 + Math.min(secs, 59); // Cap seconds at 59
    }
  };

  // Calculate display time based on current input or remaining time
  const displayTime =
    showKeyboard && timeInput ? parseInputToSeconds(timeInput) : remainingTime;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: remainingTime / totalDuration,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [remainingTime, totalDuration]);

  // Update timer in real-time when typing - REMOVED
  // The display will update automatically when timeInput changes

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleKeyboardClose = () => {
    // Update timer with current input before closing
    if (timeInput) {
      const time = parseInputToSeconds(timeInput);
      onUpdate(time, time);
    }
    setTimeInput("");
    setShowKeyboard(false);
  };

  const handleKeyboardNext = () => {
    handleKeyboardClose();
  };

  const handleKeyboardReset = () => {
    setTimeInput("");
    // Reset to default 120 seconds
    onUpdate(120, 120);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Determine color based on state
  // Blue when running, green when timer reaches 0
  const timerColor = remainingTime === 0 ? "#10b981" : tintColor;
  const isSelected = showKeyboard;

  return (
    <>
      <View ref={containerRef}>
        <View style={styles.container}>
          {/* Line - Time - Line */}
          <View style={styles.timerRow}>
            <View style={styles.line}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: timerColor, width: progressWidth },
                ]}
              />
            </View>
            <Pressable
              onPress={() => {
                // Determine which keyboard to show based on timer state
                if (
                  remainingTime > 0 &&
                  (isRunning || remainingTime < totalDuration)
                ) {
                  // Timer has been started (running or paused) - show controls
                  setShowTimerControls(true);
                } else {
                  // Timer not started yet - show number keyboard
                  setShowTimerControls(false);
                  setTimeInput("");
                }
                setShowKeyboard(true);

                // Measure position and notify parent to scroll
                if (onKeyboardOpen && containerRef.current) {
                  setTimeout(() => {
                    containerRef.current?.measureInWindow(
                      (_x, y, _width, _height) => {
                        if (y !== undefined) {
                          onKeyboardOpen(y);
                        }
                      },
                    );
                  }, 150);
                }
              }}
              style={[
                styles.timeTextContainer,
                isSelected && {
                  backgroundColor: tintColor,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  {
                    color: isSelected ? "#fff" : timerColor,
                  },
                ]}
              >
                {formatTime(remainingTime === 0 ? totalDuration : displayTime)}
              </Text>
            </Pressable>
            <View style={styles.line}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: timerColor, width: progressWidth },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Keyboard for when timer is NOT running - Regular number keyboard */}
      <Modal
        visible={showKeyboard && !showTimerControls}
        transparent={true}
        animationType="slide"
        onRequestClose={handleKeyboardClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleKeyboardClose}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <TimerKeyboard
              value={timeInput}
              onValueChange={setTimeInput}
              onReset={handleKeyboardReset}
              onNext={handleKeyboardNext}
              onDismiss={handleKeyboardClose}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Keyboard for when timer IS running - Timer controls */}
      <Modal
        visible={showKeyboard && showTimerControls}
        transparent={true}
        animationType="slide"
        onRequestClose={handleKeyboardClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleKeyboardClose}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <TimerControlsKeyboard
              remainingTime={remainingTime}
              isRunning={isRunning}
              onPause={onPause}
              onResume={onStart}
              onReset={handleKeyboardReset}
              onSkip={() => {
                onSkip();
                setShowKeyboard(false);
              }}
              onAdjust={(seconds: number) => {
                const newTime = Math.max(0, remainingTime + seconds);
                onUpdate(newTime, totalDuration);
              }}
              onDismiss={handleKeyboardClose}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default InlineRestTimer;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  timeTextContainer: {
    // Container for time text with selection highlight
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 45,
    textAlign: "center",
    padding: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "transparent",
  },
});
