import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CompactTimerProps {
  remainingTime: number;
  totalDuration: number;
  onPress: () => void;
}

export function CompactTimer({
  remainingTime,
  totalDuration,
  onPress,
}: CompactTimerProps) {
  const progressAnim = useRef(new Animated.Value(1)).current;

  const tintColor = useThemeColor({}, "tint");

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

  const radius = 18;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.timerCircle}>
        <Svg width={44} height={44} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={22}
            cy={22}
            r={radius}
            stroke="rgba(55, 65, 81, 0.3)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={22}
            cy={22}
            r={radius}
            stroke={tintColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [circumference, 0],
            })}
            transform={`rotate(-90 22 22)`}
          />
        </Svg>
        <View style={styles.iconContainer}>
          <Ionicons name="timer" size={16} color={tintColor} />
        </View>
      </View>
      <Text style={[styles.timeText, { color: tintColor }]}>
        {formatTime(remainingTime)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  timerCircle: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  svg: {
    position: "absolute",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
