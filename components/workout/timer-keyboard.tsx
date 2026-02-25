import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TimerKeyboardProps {
  value: string;
  onValueChange: (value: string) => void;
  onReset: () => void;
  onNext: () => void;
  onDismiss: () => void;
}

export function TimerKeyboard({
  value,
  onValueChange,
  onReset,
  onNext,
  onDismiss,
}: TimerKeyboardProps) {
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  const handleNumberPress = (num: string) => {
    // Max 3 digits (up to 999 seconds = 16:39)
    if (value.length < 3) {
      onValueChange(value + num);
    }
  };

  const handleBackspace = () => {
    onValueChange(value.slice(0, -1));
  };

  const handleMinusPlus = (amount: number) => {
    const currentValue = parseInt(value) || 0;
    const newValue = Math.max(0, Math.min(999, currentValue + amount));
    onValueChange(newValue.toString());
  };

  const actionBg = "rgba(55, 65, 81, 0.4)"; // Light gray background

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Row 1: 1, 2, 3, Dismiss */}
      <View style={styles.row}>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("1")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>1</Text>
        </Pressable>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("2")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>2</Text>
        </Pressable>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("3")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>3</Text>
        </Pressable>
        <Pressable
          style={[styles.actionKey, { backgroundColor: actionBg }]}
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
      </View>

      {/* Row 2: 4, 5, 6, - + */}
      <View style={styles.row}>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("4")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>4</Text>
        </Pressable>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("5")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>5</Text>
        </Pressable>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("6")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>6</Text>
        </Pressable>
        <View style={styles.minusPlusContainer}>
          <Pressable
            style={[styles.smallActionKey, { backgroundColor: actionBg }]}
            onPress={() => handleMinusPlus(-15)}
          >
            <Text style={[styles.actionText, { color: "#fff" }]}>−</Text>
          </Pressable>
          <Pressable
            style={[styles.smallActionKey, { backgroundColor: actionBg }]}
            onPress={() => handleMinusPlus(15)}
          >
            <Text style={[styles.actionText, { color: "#fff" }]}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Row 3: 7, 8, 9, Reset */}
      <View style={styles.row}>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("7")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>7</Text>
        </Pressable>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("8")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>8</Text>
        </Pressable>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("9")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>9</Text>
        </Pressable>
        <Pressable
          style={[styles.actionKey, { backgroundColor: actionBg }]}
          onPress={onReset}
        >
          <Text style={[styles.resetText, { color: "#fff" }]}>Reset</Text>
        </Pressable>
      </View>

      {/* Row 4: 0, Backspace, Next */}
      <View style={styles.row}>
        <Pressable
          style={styles.numberKey}
          onPress={() => handleNumberPress("0")}
        >
          <Text style={[styles.numberText, { color: "#fff" }]}>0</Text>
        </Pressable>
        <Pressable style={styles.numberKey} onPress={handleBackspace}>
          <Ionicons name="backspace-outline" size={28} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.nextKey, { backgroundColor: tintColor }]}
          onPress={onNext}
        >
          <Text style={[styles.nextText, { color: "#fff" }]}>Next</Text>
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
  row: {
    flexDirection: "row",
    gap: 8,
  },
  numberKey: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionKey: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  nextKey: {
    flex: 1.5,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 28,
    fontWeight: "600",
  },
  actionText: {
    fontSize: 24,
    fontWeight: "600",
  },
  resetText: {
    fontSize: 16,
    fontWeight: "700",
  },
  nextText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
