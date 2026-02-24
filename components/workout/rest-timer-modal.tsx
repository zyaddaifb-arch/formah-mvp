import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onMinimize?: (remainingTime: number, totalDuration: number) => void;
  onTimerUpdate?: (remainingTime: number, totalDuration: number) => void;
  initialRemainingTime?: number;
  initialTotalDuration?: number;
  onTimerComplete?: () => void;
}

const ITEM_HEIGHT = 50;
const PRESET_DURATIONS = [30, 45, 60, 75, 90, 105, 120]; // Up to 2 minutes

// Generate time options from 0:15 to 5:00 in 5-second increments (for custom timer)
const generateTimeOptions = () => {
  const options = [];
  for (let seconds = 15; seconds <= 300; seconds += 5) {
    options.push(seconds);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export function RestTimerModal({
  visible,
  onClose,
  onMinimize,
  onTimerUpdate,
  initialRemainingTime,
  initialTotalDuration,
  onTimerComplete,
}: RestTimerModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(
    initialTotalDuration || 60,
  );
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const initialDurationRef = useRef(initialTotalDuration || 60);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  // Use props as source of truth for timer values
  const remainingTime = initialRemainingTime || 60;
  const totalDuration = initialTotalDuration || selectedDuration;

  // Sync with props when modal opens
  useEffect(() => {
    if (visible) {
      if (initialRemainingTime && initialTotalDuration) {
        // Resume existing timer
        setSelectedDuration(initialTotalDuration);
        setIsTimerRunning(true);
        setShowCompleteDialog(false);
      } else {
        // Start fresh
        setIsTimerRunning(false);
        setShowCustomPicker(false);
        setSelectedDuration(60);
        setShowCompleteDialog(false);
      }
    }
  }, [visible, initialRemainingTime, initialTotalDuration]);

  // Check if timer completed
  useEffect(() => {
    if (isTimerRunning && remainingTime <= 0) {
      setIsTimerRunning(false);
      setShowCompleteDialog(true);
    }
  }, [isTimerRunning, remainingTime]);

  // Update progress animation
  useEffect(() => {
    if (isTimerRunning && totalDuration > 0) {
      Animated.timing(progressAnim, {
        toValue: remainingTime / totalDuration,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [remainingTime, totalDuration, isTimerRunning, progressAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = (duration: number) => {
    setSelectedDuration(duration);
    setIsTimerRunning(true);
    onTimerUpdate?.(duration, duration);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const duration = TIME_OPTIONS[index];
    if (duration) {
      setSelectedDuration(duration);
    }
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  useEffect(() => {
    if (visible && !isTimerRunning && showCustomPicker) {
      // Scroll to 1:00 (60 seconds) by default in custom picker
      const defaultIndex = TIME_OPTIONS.indexOf(60);
      setTimeout(() => scrollToIndex(defaultIndex), 100);
    }
  }, [visible, isTimerRunning, showCustomPicker]);

  const adjustTime = (seconds: number) => {
    const newRemainingTime = Math.max(0, remainingTime + seconds);
    const newTotalDuration = Math.max(0, totalDuration + seconds);
    setSelectedDuration(newTotalDuration);
    onTimerUpdate?.(newRemainingTime, newTotalDuration);
  };

  const skipTimer = () => {
    setIsTimerRunning(false);
    onClose();
  };

  const handleCompleteDialogDismiss = () => {
    setShowCompleteDialog(false);
    onTimerComplete?.();
    onClose();
  };

  const handleClose = () => {
    // If timer is running, minimize instead of closing
    if (isTimerRunning && onMinimize) {
      onMinimize(remainingTime, totalDuration);
    } else {
      // Reset state when closing without timer running
      setIsTimerRunning(false);
      setSelectedDuration(60);
      setShowCustomPicker(false);
      onClose();
    }
  };

  const getItemOpacity = (index: number) => {
    const centerIndex = scrollY / ITEM_HEIGHT;
    const distance = Math.abs(index - centerIndex);
    if (distance > 2) return 0.2;
    if (distance > 1) return 0.4;
    return 1 - distance * 0.3;
  };

  const getItemScale = (index: number) => {
    const centerIndex = scrollY / ITEM_HEIGHT;
    const distance = Math.abs(index - centerIndex);
    if (distance > 2) return 0.7;
    if (distance > 1) return 0.85;
    return 1 - distance * 0.15;
  };

  const progress = isTimerRunning
    ? (remainingTime / selectedDuration) * 100
    : 100;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
        accessible={false}
      >
        <Pressable
          style={[styles.container, { backgroundColor: cardBackground }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </Pressable>
            <Text style={[styles.title, { color: textColor }]}>Rest Timer</Text>
            <View style={{ width: 28 }} />
          </View>

          {!isTimerRunning && !showCustomPicker && !showCompleteDialog && (
            <>
              <Text style={[styles.subtitle, { color: "#9ca3af" }]}>
                Choose a duration below or set your own.{"\n"}Custom durations
                are saved for next time.
              </Text>

              {/* Preset Durations (up to 2 minutes) */}
              <View style={styles.pickerContainer}>
                <View style={styles.circle}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.presetList}
                  >
                    {PRESET_DURATIONS.map((duration) => (
                      <Pressable
                        key={duration}
                        onPress={() => startTimer(duration)}
                        style={styles.presetItem}
                      >
                        <Text style={[styles.presetText, { color: textColor }]}>
                          {formatTime(duration)}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <Pressable
                style={[styles.customButton, { backgroundColor: tintColor }]}
                onPress={() => setShowCustomPicker(true)}
              >
                <Text style={styles.customButtonText}>Create Custom Timer</Text>
              </Pressable>
            </>
          )}

          {!isTimerRunning && showCustomPicker && !showCompleteDialog && (
            <>
              <Text style={[styles.subtitle, { color: "#9ca3af" }]}>
                Adjust duration via the +/- buttons.
              </Text>

              {/* iOS-style Wheel Picker for Custom Times */}
              <View style={styles.pickerContainer}>
                <View style={styles.circle}>
                  {/* Selection indicator */}
                  <View
                    style={[
                      styles.selectionIndicator,
                      { backgroundColor: `${tintColor}20` },
                    ]}
                  />

                  <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{
                      paddingVertical: ITEM_HEIGHT * 2,
                    }}
                  >
                    {TIME_OPTIONS.map((duration, index) => {
                      const opacity = getItemOpacity(index);
                      const scale = getItemScale(index);

                      return (
                        <Pressable
                          key={duration}
                          onPress={() => {
                            scrollToIndex(index);
                            setTimeout(() => startTimer(duration), 300);
                          }}
                          style={[styles.pickerItem, { height: ITEM_HEIGHT }]}
                        >
                          <Animated.Text
                            style={[
                              styles.pickerText,
                              {
                                color: textColor,
                                opacity,
                                transform: [{ scale }],
                              },
                            ]}
                          >
                            {formatTime(duration)}
                          </Animated.Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              <Pressable
                style={[styles.customButton, { backgroundColor: tintColor }]}
                onPress={() => startTimer(selectedDuration)}
              >
                <Text style={styles.customButtonText}>
                  Start {formatTime(selectedDuration)} Timer
                </Text>
              </Pressable>
            </>
          )}

          {isTimerRunning && !showCompleteDialog && (
            <>
              <Text style={[styles.subtitle, { color: "#9ca3af" }]}>
                Adjust duration via the +/- buttons.
              </Text>

              {/* Active Timer with SVG Progress Circle */}
              <View style={styles.pickerContainer}>
                <View style={styles.circle}>
                  <Svg
                    width={280}
                    height={280}
                    style={{ position: "absolute" }}
                  >
                    {/* Background circle (dark gray - always full) */}
                    <Circle
                      cx={140}
                      cy={140}
                      r={132}
                      stroke="rgba(55, 65, 81, 0.5)"
                      strokeWidth={8}
                      fill="none"
                    />
                    {/* Progress circle (blue - decreasing) */}
                    <AnimatedCircle
                      cx={140}
                      cy={140}
                      r={132}
                      stroke={tintColor}
                      strokeWidth={8}
                      fill="none"
                      strokeDasharray={2 * Math.PI * 132}
                      strokeDashoffset={progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2 * Math.PI * 132, 0],
                      })}
                      transform="rotate(-90 140 140)"
                    />
                  </Svg>

                  <View style={styles.timerContent}>
                    <Text style={[styles.timeDisplay, { color: textColor }]}>
                      {formatTime(remainingTime)}
                    </Text>
                    <Text style={[styles.totalTime, { color: "#6b7280" }]}>
                      {formatTime(selectedDuration)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.timerControls}>
                <Pressable
                  style={[
                    styles.controlButton,
                    { backgroundColor: cardBackground },
                    remainingTime <= 30 && styles.disabledButton,
                  ]}
                  onPress={() => adjustTime(-30)}
                  disabled={remainingTime <= 30}
                >
                  <Text
                    style={[
                      styles.controlButtonText,
                      { color: textColor },
                      remainingTime <= 30 && styles.disabledText,
                    ]}
                  >
                    -30s
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.controlButton,
                    { backgroundColor: cardBackground },
                  ]}
                  onPress={() => adjustTime(30)}
                >
                  <Text
                    style={[styles.controlButtonText, { color: textColor }]}
                  >
                    +30s
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.skipButton, { backgroundColor: tintColor }]}
                  onPress={skipTimer}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </Pressable>
              </View>
            </>
          )}

          {showCompleteDialog && (
            <View style={styles.completeDialogContainer}>
              <View
                style={[
                  styles.completeDialog,
                  { backgroundColor: cardBackground },
                ]}
              >
                <Text style={styles.emoji}>🏋️</Text>
                <Text style={[styles.completeTitle, { color: textColor }]}>
                  Rest Complete!
                </Text>
                <Text style={[styles.completeSubtitle, { color: "#9ca3af" }]}>
                  Get back to work!
                </Text>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  pickerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  circle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  selectionIndicator: {
    position: "absolute",
    width: "100%",
    height: ITEM_HEIGHT,
    borderRadius: 12,
    zIndex: 1,
  },
  pickerItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 28,
    fontWeight: "600",
  },
  presetList: {
    alignItems: "center",
    paddingVertical: 20,
  },
  presetItem: {
    paddingVertical: 8,
  },
  presetText: {
    fontSize: 20,
    fontWeight: "600",
  },
  customButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  customButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  timerContent: {
    alignItems: "center",
  },
  timeDisplay: {
    fontSize: 56,
    fontWeight: "700",
    marginBottom: 8,
  },
  totalTime: {
    fontSize: 24,
    fontWeight: "600",
  },
  timerControls: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(107, 114, 128, 0.3)",
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.5,
  },
  completeDialogContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  completeDialog: {
    width: "80%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  completeSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
