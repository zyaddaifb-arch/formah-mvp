import { exercises as defaultExercises } from "@/data/exercises";
import {
    getCustomExercises,
    saveCustomExercise,
} from "@/data/storage/exercises";
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
import { CreateExerciseDialog } from "./create-exercise-dialog";
import { ExerciseDetailsDialog } from "./exercise-details-dialog";

interface ExerciseSelectionDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercises: (exercises: Exercise[]) => void;
}

type SortOption = "name" | "frequency" | "lastPerformed";

export function ExerciseSelectionDialog({
  visible,
  onClose,
  onSelectExercises,
}: ExerciseSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("Any Body Part");
  const [selectedCategory, setSelectedCategory] = useState("Any Category");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showBodyPartPicker, setShowBodyPartPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [allExercises, setAllExercises] =
    useState<Exercise[]>(defaultExercises);
  const [selectedExerciseForDetails, setSelectedExerciseForDetails] =
    useState<Exercise | null>(null);

  // Load custom exercises
  useEffect(() => {
    if (visible) {
      loadExercises();
    }
  }, [visible]);

  const loadExercises = async () => {
    const customExercises = await getCustomExercises();
    setAllExercises([...defaultExercises, ...customExercises]);
  };

  const bodyParts = [
    "Any Body Part",
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Olympic",
  ];

  const categories = [
    "Any Category",
    "Barbell",
    "Dumbbell",
    "Machine",
    "Cable",
    "Bodyweight",
    "Smith Machine",
  ];

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBodyPart =
      selectedBodyPart === "Any Body Part" ||
      exercise.bodyPart === selectedBodyPart;
    const matchesCategory =
      selectedCategory === "Any Category" ||
      exercise.equipment === selectedCategory;

    return matchesSearch && matchesBodyPart && matchesCategory;
  });

  // Sort exercises based on selected option
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "frequency":
        // TODO: Implement frequency tracking
        return 0;
      case "lastPerformed":
        // TODO: Implement last performed tracking
        return 0;
      default:
        return 0;
    }
  });

  const hasNoResults = searchQuery.trim() && sortedExercises.length === 0;

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const isSelected = prev.some((e) => e.id === exercise.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  const handleAddExercises = () => {
    if (selectedExercises.length > 0) {
      onSelectExercises(selectedExercises);
      setSelectedExercises([]);
      setSearchQuery("");
      setSelectedBodyPart("Any Body Part");
      setSelectedCategory("Any Category");
    }
  };

  const handleClose = () => {
    setSelectedExercises([]);
    setSearchQuery("");
    setSelectedBodyPart("Any Body Part");
    setSelectedCategory("Any Category");
    setSortBy("name");
    onClose();
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.some((e) => e.id === exerciseId);
  };

  const handleCreateExercise = async (exercise: Exercise) => {
    try {
      await saveCustomExercise(exercise);
      await loadExercises();
      setSelectedExercises([exercise]);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to save exercise:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialogContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </Pressable>

            <Text style={[styles.headerTitle, { color: tintColor }]}>
              {selectedExercises.length > 0
                ? `${selectedExercises.length} Selected`
                : "New"}
            </Text>

            <View style={styles.headerActions}>
              <Pressable onPress={() => setShowCreateDialog(true)}>
                <Text style={[styles.headerAction, { color: tintColor }]}>
                  New
                </Text>
              </Pressable>
              <Pressable onPress={handleAddExercises}>
                <Text
                  style={[
                    styles.headerAction,
                    {
                      color:
                        selectedExercises.length > 0 ? tintColor : "#6b7280",
                    },
                  ]}
                >
                  Add
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View
              style={[styles.searchBar, { backgroundColor: cardBackground }]}
            >
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            >
              <Pressable
                style={[
                  styles.filterButton,
                  { backgroundColor: cardBackground },
                ]}
                onPress={() => setShowBodyPartPicker(true)}
              >
                <Text style={[styles.filterButtonText, { color: textColor }]}>
                  {selectedBodyPart}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterButton,
                  { backgroundColor: cardBackground },
                ]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={[styles.filterButtonText, { color: textColor }]}>
                  {selectedCategory}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.sortButton, { backgroundColor: tintColor }]}
                onPress={() => setShowSortMenu(true)}
              >
                <Ionicons name="swap-vertical" size={20} color="#fff" />
              </Pressable>
            </ScrollView>
          </View>

          {/* Exercise List */}
          <ScrollView
            style={styles.exerciseList}
            showsVerticalScrollIndicator={false}
          >
            {hasNoResults ? (
              <View style={styles.noResultsContainer}>
                <Text style={[styles.noResultsText, { color: "#6b7280" }]}>
                  No exercises found for "{searchQuery}"
                </Text>
                <Pressable
                  style={[styles.createButton, { backgroundColor: tintColor }]}
                  onPress={() => setShowCreateDialog(true)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.createButtonText}>
                    Create New Exercise
                  </Text>
                </Pressable>
              </View>
            ) : (
              sortedExercises.map((exercise) => {
                const isSelected = isExerciseSelected(exercise.id);
                return (
                  <Pressable
                    key={exercise.id}
                    style={[
                      styles.exerciseItem,
                      { backgroundColor: cardBackground },
                      isSelected && {
                        borderWidth: 2,
                        borderColor: tintColor,
                      },
                    ]}
                    onPress={() => handleSelectExercise(exercise)}
                  >
                    <View
                      style={[
                        styles.exerciseIcon,
                        isSelected && { backgroundColor: tintColor },
                      ]}
                    >
                      {isSelected ? (
                        <Ionicons name="checkmark" size={24} color="#fff" />
                      ) : (
                        <Text style={styles.exerciseIconText}>
                          {exercise.name.charAt(0)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.exerciseInfo}>
                      <Text style={[styles.exerciseName, { color: textColor }]}>
                        {exercise.name}
                      </Text>
                      <View style={styles.exerciseMeta}>
                        <Text style={styles.exerciseMetaText}>
                          {exercise.bodyPart}
                        </Text>
                        <Text style={styles.exerciseMetaDot}>•</Text>
                        <Text style={styles.exerciseMetaText}>
                          {exercise.equipment}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={styles.infoButton}
                      onPress={() => setSelectedExerciseForDetails(exercise)}
                    >
                      <Ionicons
                        name="help-circle"
                        size={24}
                        color={tintColor}
                      />
                    </Pressable>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>

      {/* Body Part Picker Modal */}
      <Modal
        visible={showBodyPartPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBodyPartPicker(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setShowBodyPartPicker(false)}
        >
          <View
            style={[styles.pickerContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.pickerTitle, { color: textColor }]}>
              Select Body Part
            </Text>
            <ScrollView style={styles.pickerList}>
              {bodyParts.map((part) => (
                <Pressable
                  key={part}
                  style={[
                    styles.pickerItem,
                    selectedBodyPart === part && {
                      backgroundColor: tintColor,
                    },
                  ]}
                  onPress={() => {
                    setSelectedBodyPart(part);
                    setShowBodyPartPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      {
                        color: selectedBodyPart === part ? "#fff" : textColor,
                      },
                    ]}
                  >
                    {part}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
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

      {/* Sort Menu Modal */}
      <Modal
        visible={showSortMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setShowSortMenu(false)}
        >
          <View
            style={[styles.pickerContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.pickerTitle, { color: textColor }]}>
              Sort By
            </Text>
            <View style={styles.sortMenuList}>
              <Pressable
                style={[
                  styles.sortMenuItem,
                  sortBy === "name" && {
                    backgroundColor: tintColor,
                  },
                ]}
                onPress={() => {
                  setSortBy("name");
                  setShowSortMenu(false);
                }}
              >
                <Ionicons
                  name="text-outline"
                  size={20}
                  color={sortBy === "name" ? "#fff" : textColor}
                />
                <Text
                  style={[
                    styles.sortMenuItemText,
                    {
                      color: sortBy === "name" ? "#fff" : textColor,
                    },
                  ]}
                >
                  Name
                </Text>
                {sortBy === "name" && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.sortMenuItem,
                  sortBy === "frequency" && {
                    backgroundColor: tintColor,
                  },
                ]}
                onPress={() => {
                  setSortBy("frequency");
                  setShowSortMenu(false);
                }}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={sortBy === "frequency" ? "#fff" : textColor}
                />
                <Text
                  style={[
                    styles.sortMenuItemText,
                    {
                      color: sortBy === "frequency" ? "#fff" : textColor,
                    },
                  ]}
                >
                  Frequency
                </Text>
                {sortBy === "frequency" && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.sortMenuItem,
                  sortBy === "lastPerformed" && {
                    backgroundColor: tintColor,
                  },
                ]}
                onPress={() => {
                  setSortBy("lastPerformed");
                  setShowSortMenu(false);
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={sortBy === "lastPerformed" ? "#fff" : textColor}
                />
                <Text
                  style={[
                    styles.sortMenuItemText,
                    {
                      color: sortBy === "lastPerformed" ? "#fff" : textColor,
                    },
                  ]}
                >
                  Last Performed
                </Text>
                {sortBy === "lastPerformed" && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Create Exercise Dialog */}
      <CreateExerciseDialog
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateExercise}
        initialName={searchQuery}
      />

      {/* Exercise Details Dialog */}
      {selectedExerciseForDetails && (
        <ExerciseDetailsDialog
          visible={!!selectedExerciseForDetails}
          onClose={() => setSelectedExerciseForDetails(null)}
          exercise={selectedExerciseForDetails}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogContainer: {
    width: "100%",
    maxWidth: 500,
    height: "90%",
    borderRadius: 24,
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
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filtersContent: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  exerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseIconText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  exerciseMetaText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  exerciseMetaDot: {
    fontSize: 13,
    color: "#9ca3af",
  },
  infoButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
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
  sortMenuList: {
    gap: 8,
  },
  sortMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 12,
  },
  sortMenuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
