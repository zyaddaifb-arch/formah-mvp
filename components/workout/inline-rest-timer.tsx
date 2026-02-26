import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface InlineRestTimerProps {
  onSkip: () => void;
  onComplete: () => void;
  initialDuration?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function InlineRestTimer({
  onSkip,
  onComplete,
  initialDuration = 150, // 2:30 default
}: InlineRestTimerProps) {
  const [remainingTime, setRemainingTime] = useState(initialDuration);
  const [totalDuration, setTotalDuration] = useState(initialDuration);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");

  // Listen to keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Slide in animation on mount
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (remainingTime <= 0) {
      // Slide out before completing
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, onComplete]);

  // Update progress animation
  useEffect(() => {
    if (totalDuration > 0) {
      Animated.timing(progressAnim, {
        toValue: remainingTime / totalDuration,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [remainingTime, totalDuration, progressAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const adjustTime = (seconds: number) => {
    const newRemainingTime = Math.max(0, remainingTime + seconds);
    const newTotalDuration = Math.max(0, totalDuration + seconds);
    setRemainingTime(newRemainingTime);
    setTotalDuration(newTotalDuration);
  };

  const handleSkip = () => {
    // Slide out before skipping
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSkip();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          transform: [{ translateY: slideAnim }],
          bottom: keyboardHeight,
        },
      ]}
    >
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.timerContent}>
        {/* All in one row: -15, Timer, +15, Skip */}
        <View style={styles.controls}>
          <Pressable
            style={[styles.controlButton, { backgroundColor: "#374151" }]}
            onPress={() => adjustTime(-15)}
            disabled={remainingTime <= 15}
          >
            <Text
              style={[
                styles.controlButtonText,
                remainingTime <= 15 && styles.disabledText,
              ]}
            >
              -15
            </Text>
          </Pressable>

          <View style={styles.timerDisplay}>
            <Text style={[styles.timeDisplay, { color: textColor }]}>
              {formatTime(remainingTime)}
            </Text>
          </View>

          <Pressable
            style={[styles.controlButton, { backgroundColor: "#374151" }]}
            onPress={() => adjustTime(15)}
          >
            <Text style={styles.controlButtonText}>+15</Text>
          </Pressable>

          <Pressable
            style={[styles.skipButton, { backgroundColor: "#3b82f6" }]}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 3,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: "rgba(55, 65, 81, 0.3)",
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderTopLeftRadius: 16,
  },
  timerContent: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  controls: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    alignItems: "center",
  },
  controlButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  timerDisplay: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  timeDisplay: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.4,
  },
});
