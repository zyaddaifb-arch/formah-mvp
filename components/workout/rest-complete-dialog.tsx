import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useRef } from "react";
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text
} from "react-native";

interface RestCompleteDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export function RestCompleteDialog({
  visible,
  onDismiss,
}: RestCompleteDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 2 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Reset animation
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim, onDismiss]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: cardBackground,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>🏋️</Text>
          <Text style={[styles.title, { color: textColor }]}>
            Rest Complete!
          </Text>
          <Text style={[styles.subtitle, { color: "#9ca3af" }]}>
            Get back to work!
          </Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
