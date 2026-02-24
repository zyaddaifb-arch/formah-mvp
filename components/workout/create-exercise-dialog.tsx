import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface CreateExerciseDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  initialName?: string;
}

export function CreateExerciseDialog({
  visible,
  onClose,
  onSave,
  initialName = "",
}: CreateExerciseDialogProps) {
  const [name, setName] = useState(initialName);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Update name when initialName changes (when dialog opens with search term)
  useEffect(() => {
    if (visible && initialName) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const bodyParts = [
    "Arms",
    "Back",
    "Cardio",
    "Chest",
    "Core",
    "Full Body",
    "Legs",
    "Olympic",
    "Other",
    "Shoulders",
  ];

  const categories = [
    "Dumbbell",
    "Machine",
    "Weighted",
    "Assisted Bodyweight",
    "Reps Only",
    "Cardio",
    "Barbell",
    "Cable",
    "Bodyweight",
    "Smith Machine",
    "Kettlebell",
    "Resistance Band",
    "Other",
  ];

  const handleSave = () => {
    if (!name.trim() || !selectedBodyPart) {
      return;
    }

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      bodyPart: selectedBodyPart,
      equipment: selectedCategory || "Other",
    };

    onSave(newExercise);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setSelectedBodyPart("");
    setSelectedCategory("");
    onClose();
  };

  const canSave = name.trim() && selectedBodyPart;

  // If category picker is showing, show that instead
  if (showCategoryPicker) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View
            style={[styles.pickerContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.pickerTitle, { color: textColor }]}>
              Select Category
            </Text>
            <ScrollView style={styles.pickerList}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.pickerItem,
                    selectedCategory === category && {
                      backgroundColor: tintColor,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      {
                        color:
                          selectedCategory === category ? "#fff" : textColor,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialogContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </Pressable>

            <Text style={[styles.headerTitle, { color: textColor }]}>
              Create New Exercise
            </Text>

            <Pressable onPress={handleSave} disabled={!canSave}>
              <Text
                style={[
                  styles.saveButton,
                  { color: canSave ? tintColor : "#6b7280" },
                ]}
              >
                Save
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.contentContainer}
          >
            {/* Name Input */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Name
              </Text>
              <TextInput
                style={[
                  styles.nameInput,
                  { backgroundColor: cardBackground, color: textColor },
                ]}
                placeholder="Add Name"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Body Part Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Body Part
              </Text>
              <View style={styles.chipsContainer}>
                {bodyParts.map((part) => (
                  <Pressable
                    key={part}
                    style={[
                      styles.chip,
                      { backgroundColor: cardBackground },
                      selectedBodyPart === part && {
                        backgroundColor: tintColor,
                      },
                    ]}
                    onPress={() => setSelectedBodyPart(part)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: textColor },
                        selectedBodyPart === part && { color: "#fff" },
                      ]}
                    >
                      {part}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Category Selection (Optional) */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Category{" "}
                <Text style={[styles.optionalText, { color: "#6b7280" }]}>
                  (Optional)
                </Text>
              </Text>
              <Pressable
                style={[
                  styles.categorySelector,
                  { backgroundColor: cardBackground },
                ]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text
                  style={[
                    styles.categorySelectorText,
                    {
                      color: selectedCategory ? textColor : "#6b7280",
                    },
                  ]}
                >
                  {selectedCategory || "Select an Option"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={textColor} />
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    width: "85%",
    maxHeight: "70%",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.2)",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  optionalText: {
    fontSize: 14,
    fontWeight: "400",
  },
  nameInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  categorySelectorText: {
    fontSize: 16,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: 16,
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
