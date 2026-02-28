import type { SetData } from "@/contexts/workout-context";
import { useWorkout } from "@/contexts/workout-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise, FocusMetricType } from "@/types/workout";
import {
    calculateFocusMetric,
    getMetricDisplayName,
} from "@/utils/focus-metrics";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { ExerciseSelectionDialog } from "./exercise-selection-dialog";
import { FocusMetricSelector } from "./focus-metric-selector";

interface ExerciseLogItemProps {
  exercise: Exercise;
  onRemove: () => void;
  onReplace: (oldExercise: Exercise, newExercise: Exercise) => void;
  onLongPress?: () => void;
  isReorderMode?: boolean;
  isActive?: boolean;
  onSetComplete?: (exerciseId: string, setId: string) => void;
  onSetUncomplete?: (exerciseId: string, setId: string) => void;
  onSetDelete?: (exerciseId: string, setId: string) => void;
}

export function ExerciseLogItem({
  exercise,
  onRemove,
  onReplace,
  onLongPress,
  isReorderMode = false,
  isActive = false,
  onSetComplete,
  onSetUncomplete,
  onSetDelete,
}: ExerciseLogItemProps) {
  const {
    exerciseSets,
    updateExerciseSets,
    exerciseNotes,
    addExerciseNote,
    updateExerciseNote,
    deleteExerciseNote,
    exerciseStickyNotes,
    setExerciseStickyNote,
    deleteExerciseStickyNote,
    exerciseFocusMetrics,
    setExerciseFocusMetric,
  } = useWorkout();

  // Initialize sets from context or use default
  const [sets, setSets] = useState<SetData[]>(() => {
    const savedSets = exerciseSets[exercise.id];
    return savedSets && savedSets.length > 0
      ? savedSets
      : [{ id: "1", weight: "", reps: "", completed: false }];
  });

  // Sync sets to context whenever they change
  useEffect(() => {
    updateExerciseSets(exercise.id, sets);
  }, [sets, exercise.id]);
  const [showMenu, setShowMenu] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showAddNoteInput, setShowAddNoteInput] = useState(false);
  const [showStickyNoteInput, setShowStickyNoteInput] = useState(false);
  const [showWarmupDialog, setShowWarmupDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [showFocusMetricSelector, setShowFocusMetricSelector] = useState(false);
  const [expandedPreference, setExpandedPreference] = useState<
    "weightUnit" | null
  >(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [stickyNoteText, setStickyNoteText] = useState("");
  const [warmupCount, setWarmupCount] = useState("3");
  const [weightUnit, setWeightUnit] = useState<"default" | "kg" | "lbs">(
    "default",
  );
  const [previousWeightUnit, setPreviousWeightUnit] = useState<
    "default" | "kg" | "lbs"
  >("default");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { weight?: boolean; reps?: boolean }>
  >({});

  // Convert weights when unit changes
  useEffect(() => {
    if (weightUnit !== previousWeightUnit && previousWeightUnit !== "default") {
      const conversionFactor = weightUnit === "lbs" ? 2.20462 : 1 / 2.20462;

      setSets((currentSets) =>
        currentSets.map((set) => {
          if (!set.weight || set.weight === "") return set;
          const numWeight = parseFloat(set.weight);
          if (isNaN(numWeight)) return set;

          const convertedWeight =
            Math.round(numWeight * conversionFactor * 10) / 10;
          return { ...set, weight: convertedWeight.toString() };
        }),
      );
    }
    setPreviousWeightUnit(weightUnit);
  }, [weightUnit]);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const backgroundColor = useThemeColor({}, "background");

  const addSet = () => {
    const lastSet = sets.length > 0 ? sets[sets.length - 1] : null;
    setSets([
      ...sets,
      {
        id: String(sets.length + 1),
        weight: lastSet?.weight || "",
        reps: lastSet?.reps || "",
        completed: false,
        isWarmup: false,
      },
    ]);
  };

  const addWarmupSets = (count: number) => {
    const newWarmupSets: SetData[] = [];
    for (let i = 0; i < count; i++) {
      newWarmupSets.push({
        id: `warmup-${Date.now()}-${i}`,
        weight: "",
        reps: "",
        completed: false,
        isWarmup: true,
      });
    }
    // Add warmup sets at the beginning
    setSets([...newWarmupSets, ...sets]);
    setShowWarmupDialog(false);
  };

  const toggleSetComplete = (setId: string) => {
    const currentSet = sets.find((s) => s.id === setId);
    if (!currentSet) return;

    // If trying to complete the set, validate inputs first
    if (!currentSet.completed) {
      const hasWeight = currentSet.weight && currentSet.weight.trim() !== "";
      const hasReps = currentSet.reps && currentSet.reps.trim() !== "";

      // For warmup sets, only reps is required
      if (currentSet.isWarmup) {
        if (!hasReps) {
          // Show validation error
          setValidationErrors({
            ...validationErrors,
            [setId]: { reps: true },
          });
          // Clear error after 2 seconds
          setTimeout(() => {
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[setId];
              return newErrors;
            });
          }, 2000);
          return;
        }
      } else {
        // For regular sets, both weight and reps are required
        if (!hasWeight || !hasReps) {
          // Show validation errors
          setValidationErrors({
            ...validationErrors,
            [setId]: { weight: !hasWeight, reps: !hasReps },
          });
          // Clear errors after 2 seconds
          setTimeout(() => {
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[setId];
              return newErrors;
            });
          }, 2000);
          return;
        }
      }
    }

    const updatedSets = sets.map((set) =>
      set.id === setId ? { ...set, completed: !set.completed } : set,
    );
    setSets(updatedSets);

    // Notify parent about set completion/uncompletion
    const toggledSet = updatedSets.find((s) => s.id === setId);
    if (toggledSet) {
      if (toggledSet.completed && onSetComplete) {
        onSetComplete(exercise.id, setId);
      } else if (!toggledSet.completed && onSetUncomplete) {
        onSetUncomplete(exercise.id, setId);
      }
    }
  };

  const updateSet = (
    setId: string,
    field: "weight" | "reps",
    value: string,
  ) => {
    setSets(
      sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
    );
  };

  const updateSetBoth = (setId: string, weight: string, reps: string) => {
    setSets(
      sets.map((set) => (set.id === setId ? { ...set, weight, reps } : set)),
    );
  };

  const deleteSet = (setId: string) => {
    // Notify parent before deleting the set
    if (onSetDelete) {
      onSetDelete(exercise.id, setId);
    }

    const newSets = sets.filter((set) => set.id !== setId);

    // If no sets left, remove the entire exercise
    if (newSets.length === 0) {
      onRemove();
    } else {
      setSets(newSets);
    }
  };

  const renderRightActions = (setId: string) => {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: "#ef4444" }]}
          onPress={() => deleteSet(setId)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </Pressable>
      </View>
    );
  };

  const handleReplaceExercise = (newExercise: Exercise) => {
    setShowReplaceDialog(false);
    onReplace(exercise, newExercise);
  };

  const handleAddNote = () => {
    if (editingNoteId) {
      // Update existing note
      const updatedNotes = notes.map((note) =>
        note.id === editingNoteId ? { ...note, text: noteText.trim() } : note,
      );
      // We need to update through context - delete old and add new
      deleteExerciseNote(exercise.id, editingNoteId);
      addExerciseNote(exercise.id, noteText.trim());
      setEditingNoteId(null);
    } else {
      // Add new note (even if empty)
      addExerciseNote(exercise.id, noteText.trim());
    }
    setNoteText("");
    setShowAddNoteInput(false);
  };

  const handleCancelNote = () => {
    setNoteText("");
    setEditingNoteId(null);
    setShowAddNoteInput(false);
  };

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setNoteText(note.text);
  };

  const handleAddStickyNote = () => {
    // Save sticky note (even if empty)
    setExerciseStickyNote(exercise.id, stickyNoteText.trim());
    setStickyNoteText("");
    setShowStickyNoteInput(false);
  };

  const handleCancelStickyNote = () => {
    setStickyNoteText("");
    setShowStickyNoteInput(false);
  };

  const handleEditStickyNote = () => {
    if (stickyNote) {
      setStickyNoteText(stickyNote.text);
      setShowStickyNoteInput(true);
    }
  };

  const renderNoteRightActions = (noteId: string) => {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: "#ef4444" }]}
          onPress={() => deleteExerciseNote(exercise.id, noteId)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </Pressable>
      </View>
    );
  };

  const renderStickyNoteRightActions = () => {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: "#ef4444" }]}
          onPress={() => deleteExerciseStickyNote(exercise.id)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </Pressable>
      </View>
    );
  };

  const notes = exerciseNotes[exercise.id] || [];
  const stickyNote = exerciseStickyNotes[exercise.id];
  const currentFocusMetric = (exerciseFocusMetrics[exercise.id] ||
    "volume_increase") as FocusMetricType;

  // Calculate metrics for display (exclude warmup sets)
  const completedSets = sets.filter((s) => s.completed && !s.isWarmup);

  // Get previous workout data from history
  const [previousSets, setPreviousSets] = useState<
    Array<{ weight: number; reps: number; completed: boolean }>
  >([]);

  useEffect(() => {
    // Load previous workout data for this exercise
    const loadPreviousData = async () => {
      const { getLastWorkoutForExercise } =
        await import("@/data/storage/workouts");
      const lastWorkout = await getLastWorkoutForExercise(exercise.id);

      if (lastWorkout) {
        const exerciseLog = lastWorkout.exercises.find(
          (ex) => ex.exerciseId === exercise.id,
        );
        if (exerciseLog && exerciseLog.sets) {
          const prevSets = exerciseLog.sets.map((set) => ({
            weight: set.weight,
            reps: set.reps,
            completed: set.completed,
          }));
          setPreviousSets(prevSets);

          // Auto-populate sets if this is a new exercise (only 1 empty set)
          const currentSets = exerciseSets[exercise.id];
          if (
            !currentSets ||
            (currentSets.length === 1 &&
              !currentSets[0].weight &&
              !currentSets[0].reps)
          ) {
            // Create sets matching previous workout count
            const newSets = prevSets.map((_, index) => ({
              id: String(index + 1),
              weight: "",
              reps: "",
              completed: false,
              isWarmup: false,
            }));
            setSets(newSets);
          }
        }
      }
    };

    loadPreviousData();
  }, [exercise.id]);

  const metrics = {
    volume_increase: (() => {
      const result = calculateFocusMetric(
        "volume_increase",
        // Convert current sets to kg for comparison if using lbs
        completedSets.map((set) => {
          const weight = parseFloat(set.weight) || 0;
          const convertedWeight =
            weightUnit === "lbs" ? weight / 2.20462 : weight;
          return {
            ...set,
            weight: convertedWeight.toString(),
          };
        }),
        previousSets,
      );
      return result;
    })(),
    total_volume: (() => {
      const result = calculateFocusMetric(
        "total_volume",
        completedSets.map((set) => {
          const weight = parseFloat(set.weight) || 0;
          const convertedWeight =
            weightUnit === "lbs" ? weight / 2.20462 : weight;
          return {
            ...set,
            weight: convertedWeight.toString(),
          };
        }),
        previousSets,
      );
      // Convert display value to lbs if needed
      if (weightUnit === "lbs" && result.current !== null) {
        const volumeInLbs = result.current * 2.20462;
        result.displayValue = `${volumeInLbs.toFixed(0)} lbs`;
      }
      return result;
    })(),
    total_reps: calculateFocusMetric("total_reps", completedSets, previousSets),
    weight_per_rep: (() => {
      const result = calculateFocusMetric(
        "weight_per_rep",
        completedSets.map((set) => {
          const weight = parseFloat(set.weight) || 0;
          const convertedWeight =
            weightUnit === "lbs" ? weight / 2.20462 : weight;
          return {
            ...set,
            weight: convertedWeight.toString(),
          };
        }),
        previousSets,
      );
      // Convert display value to lbs if needed
      if (weightUnit === "lbs" && result.current !== null) {
        const weightInLbs = result.current * 2.20462;
        result.displayValue = `${weightInLbs.toFixed(1)} lbs`;
      }
      return result;
    })(),
  };

  const handleSelectFocusMetric = (metricType: FocusMetricType) => {
    setExerciseFocusMetric(exercise.id, metricType);
  };

  return (
    <View
      style={[
        styles.container,
        isReorderMode && styles.containerCompact,
        isActive && styles.containerDragging,
      ]}
    >
      {/* Reorder Mode - Show only drag handle with name */}
      {isReorderMode ? (
        <Pressable onLongPress={onLongPress} style={styles.reorderHeader}>
          <Ionicons
            name="reorder-three"
            size={20}
            color={tintColor}
            style={styles.dragIcon}
          />
          <Text style={[styles.exerciseName, { color: tintColor }]}>
            {exercise.name}
          </Text>
        </Pressable>
      ) : (
        <>
          {/* Exercise Header */}
          <View style={styles.header}>
            <Pressable onLongPress={onLongPress} style={styles.exerciseNameRow}>
              <Ionicons
                name="reorder-three"
                size={20}
                color={tintColor}
                style={styles.dragIcon}
              />
              <Text style={[styles.exerciseName, { color: tintColor }]}>
                {exercise.name}
              </Text>
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.iconButton}
                onPress={() => setShowMetrics(!showMetrics)}
              >
                <Ionicons
                  name={showMetrics ? "chevron-up" : "stats-chart"}
                  size={20}
                  color={tintColor}
                />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => setShowMenu(true)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color={tintColor}
                />
              </Pressable>
            </View>
          </View>
        </>
      )}
      {/* Sticky Note - Always at top if exists */}
      {!isReorderMode && stickyNote && (
        <Swipeable
          renderRightActions={renderStickyNoteRightActions}
          overshootRight={false}
        >
          {showStickyNoteInput ? (
            <View
              style={[
                styles.stickyNoteContainer,
                { backgroundColor: "#fbbf24", borderColor: "#f59e0b" },
              ]}
            >
              <Ionicons name="bookmark" size={16} color="#78350f" />
              <TextInput
                style={[styles.stickyNoteText, { color: "#78350f" }]}
                value={stickyNoteText}
                onChangeText={setStickyNoteText}
                placeholder="Sticky Note"
                placeholderTextColor="#d97706"
                autoFocus
                multiline
                onBlur={() => {
                  handleAddStickyNote();
                }}
              />
            </View>
          ) : (
            <Pressable onPress={handleEditStickyNote}>
              <View
                style={[
                  styles.stickyNoteContainer,
                  { backgroundColor: "#fbbf24", borderColor: "#f59e0b" },
                ]}
              >
                <Ionicons name="bookmark" size={16} color="#78350f" />
                <Text style={[styles.stickyNoteText, { color: "#78350f" }]}>
                  {stickyNote.text}
                </Text>
              </View>
            </Pressable>
          )}
        </Swipeable>
      )}
      {/* Sticky Note Inline Input - For adding new */}
      {!isReorderMode && showStickyNoteInput && !stickyNote && (
        <View
          style={[
            styles.stickyNoteInputContainer,
            { backgroundColor: "#fbbf24" },
          ]}
        >
          <TextInput
            style={[styles.stickyNoteInput, { color: "#78350f" }]}
            value={stickyNoteText}
            onChangeText={setStickyNoteText}
            placeholder="Sticky Note"
            placeholderTextColor="#d97706"
            autoFocus
            multiline
            onBlur={() => {
              handleAddStickyNote();
            }}
          />
        </View>
      )}
      {/* Regular Notes */}
      {!isReorderMode &&
        notes.map((note) => (
          <Swipeable
            key={note.id}
            renderRightActions={() => renderNoteRightActions(note.id)}
            overshootRight={false}
          >
            {editingNoteId === note.id ? (
              <View
                style={[
                  styles.noteContainer,
                  { backgroundColor: cardBackground, borderColor: "#6b7280" },
                ]}
              >
                <Ionicons name="document-text" size={16} color="#9ca3af" />
                <TextInput
                  style={[styles.noteText, { color: textColor }]}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Note"
                  placeholderTextColor="#9ca3af"
                  autoFocus
                  multiline
                  onBlur={() => {
                    updateExerciseNote(exercise.id, note.id, noteText.trim());
                    setEditingNoteId(null);
                    setNoteText("");
                  }}
                />
              </View>
            ) : (
              <Pressable onPress={() => handleEditNote(note)}>
                <View
                  style={[
                    styles.noteContainer,
                    { backgroundColor: cardBackground, borderColor: "#6b7280" },
                  ]}
                >
                  <Ionicons name="document-text" size={16} color="#9ca3af" />
                  <Text style={[styles.noteText, { color: textColor }]}>
                    {note.text}
                  </Text>
                </View>
              </Pressable>
            )}
          </Swipeable>
        ))}
      {/* Add Note Inline Input */}
      {!isReorderMode && showAddNoteInput && (
        <View
          style={[
            styles.noteInputContainer,
            { backgroundColor: cardBackground },
          ]}
        >
          <TextInput
            style={[styles.noteInput, { color: textColor }]}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Note"
            placeholderTextColor="#9ca3af"
            autoFocus
            multiline
            onBlur={() => {
              handleAddNote();
            }}
          />
        </View>
      )}
      {/* Metrics Section */}
      {!isReorderMode && showMetrics && (
        <View
          style={[styles.metricsSection, { backgroundColor: backgroundColor }]}
        >
          <View style={styles.metricsSectionHeader}>
            <Text style={[styles.metricsSectionTitle, { color: textColor }]}>
              Focus Metrics
            </Text>
          </View>

          {/* Current Focus Metric - Highlighted */}
          <Pressable
            style={[styles.primaryMetricCard, { backgroundColor: tintColor }]}
            onPress={() => setShowFocusMetricSelector(true)}
          >
            <View style={styles.primaryMetricHeader}>
              <Text style={styles.primaryMetricLabel}>
                {getMetricDisplayName(currentFocusMetric)}
              </Text>
              <Ionicons name="star" size={16} color="#fff" />
            </View>
            <Text style={styles.primaryMetricValue}>
              {metrics[currentFocusMetric as keyof typeof metrics]
                ?.displayValue || "N/A"}
            </Text>
            <Text style={styles.primaryMetricPrevious}>vs Last Time</Text>
          </Pressable>

          {/* Other Metrics */}
          <View style={styles.metricsGrid}>
            {Object.entries(metrics)
              .filter(([key]) => key !== currentFocusMetric)
              .map(([key, value]) => (
                <Pressable
                  key={key}
                  style={styles.metricCard}
                  onPress={() =>
                    handleSelectFocusMetric(key as FocusMetricType)
                  }
                >
                  <Text style={[styles.metricLabel, { color: "#9ca3af" }]}>
                    {getMetricDisplayName(key as FocusMetricType)}
                  </Text>
                  <Text style={[styles.metricValue, { color: textColor }]}>
                    {value.displayValue}
                  </Text>
                </Pressable>
              ))}
          </View>
        </View>
      )}
      {/* Sets Table Header */}
      {!isReorderMode && (
        <View style={styles.tableHeader}>
          <Text
            style={[
              styles.tableHeaderText,
              styles.setNumberHeader,
              { color: textColor },
            ]}
          >
            Set
          </Text>
          <Text
            style={[
              styles.tableHeaderText,
              styles.previousHeader,
              { color: textColor },
            ]}
          >
            Previous
          </Text>
          <Text
            style={[
              styles.tableHeaderText,
              styles.inputHeader,
              { color: textColor },
            ]}
          >
            {weightUnit === "default" ? "kg" : weightUnit}
          </Text>
          <Text
            style={[
              styles.tableHeaderText,
              styles.inputHeader,
              { color: textColor },
            ]}
          >
            Reps
          </Text>
          <View style={styles.checkmarkHeader}>
            <Ionicons name="checkmark" size={24} color={textColor} />
          </View>
        </View>
      )}
      {/* Sets List */}
      {!isReorderMode &&
        sets.map((set, index) => {
          // Calculate set number based on warmup status
          const warmupSets = sets.filter((s) => s.isWarmup);
          const regularSets = sets.filter((s) => !s.isWarmup);
          const isWarmup = set.isWarmup;

          let setNumber: string;
          if (isWarmup) {
            const warmupIndex = warmupSets.findIndex((s) => s.id === set.id);
            setNumber = `W${warmupIndex + 1}`;
          } else {
            const regularIndex = regularSets.findIndex((s) => s.id === set.id);
            setNumber = String(regularIndex + 1);
          }

          return (
            <Swipeable
              key={set.id}
              renderRightActions={() => renderRightActions(set.id)}
              overshootRight={false}
            >
              <View
                style={[
                  styles.setRow,
                  isWarmup && {
                    backgroundColor: "rgba(251, 146, 60, 0.15)",
                  },
                  set.completed &&
                    !isWarmup && {
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                    },
                  set.completed &&
                    isWarmup && {
                      backgroundColor: "rgba(251, 146, 60, 0.25)",
                    },
                ]}
              >
                <Text
                  style={[
                    styles.setNumber,
                    { color: isWarmup ? "#fb923c" : textColor },
                  ]}
                >
                  {setNumber}
                </Text>

                <Pressable
                  onPress={() => {
                    // Calculate set index for previous data
                    const regularSets = sets.filter((s) => !s.isWarmup);
                    const regularIndex = regularSets.findIndex(
                      (s) => s.id === set.id,
                    );
                    const prevSet = previousSets[regularIndex];

                    // Copy previous values to current set (both weight and reps together)
                    if (prevSet && (prevSet.weight || prevSet.reps)) {
                      // Convert weight based on selected unit
                      let weightValue = prevSet.weight;
                      if (weightUnit === "lbs") {
                        // Convert kg to lbs (1 kg = 2.20462 lbs)
                        weightValue =
                          Math.round(prevSet.weight * 2.20462 * 10) / 10;
                      }

                      updateSetBoth(
                        set.id,
                        weightValue.toString(),
                        prevSet.reps.toString(),
                      );
                    }
                  }}
                >
                  <Text style={[styles.previousText, { color: "#6b7280" }]}>
                    {(() => {
                      // Calculate set index for previous data
                      const regularSets = sets.filter((s) => !s.isWarmup);
                      const regularIndex = regularSets.findIndex(
                        (s) => s.id === set.id,
                      );
                      const prevSet = previousSets[regularIndex];

                      // Only show previous for non-warmup sets
                      if (set.isWarmup) return "—";
                      if (!prevSet || (!prevSet.weight && !prevSet.reps))
                        return "—";

                      // Convert weight based on selected unit for display
                      let displayWeight = prevSet.weight;
                      if (weightUnit === "lbs") {
                        // Convert kg to lbs (1 kg = 2.20462 lbs)
                        displayWeight =
                          Math.round(prevSet.weight * 2.20462 * 10) / 10;
                      }

                      return `${displayWeight.toString()} ${weightUnit === "default" ? "kg" : weightUnit} × ${prevSet.reps.toString()}`;
                    })()}
                  </Text>
                </Pressable>

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      backgroundColor: isWarmup
                        ? "rgba(251, 146, 60, 0.1)"
                        : cardBackground,
                      borderWidth: 2,
                      borderColor: validationErrors[set.id]?.weight
                        ? "#ef4444"
                        : isWarmup
                          ? "rgba(251, 146, 60, 0.3)"
                          : "rgba(107, 114, 128, 0.3)",
                    },
                  ]}
                  value={set.weight}
                  onChangeText={(value) => {
                    updateSet(set.id, "weight", value);
                    // Clear validation error when user starts typing
                    if (validationErrors[set.id]?.weight) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        if (newErrors[set.id]) {
                          delete newErrors[set.id].weight;
                          if (
                            !newErrors[set.id].weight &&
                            !newErrors[set.id].reps
                          ) {
                            delete newErrors[set.id];
                          }
                        }
                        return newErrors;
                      });
                    }
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholder=""
                  placeholderTextColor="#6b7280"
                />

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      backgroundColor: isWarmup
                        ? "rgba(251, 146, 60, 0.1)"
                        : cardBackground,
                      borderWidth: 2,
                      borderColor: validationErrors[set.id]?.reps
                        ? "#ef4444"
                        : isWarmup
                          ? "rgba(251, 146, 60, 0.3)"
                          : "rgba(107, 114, 128, 0.3)",
                    },
                  ]}
                  value={set.reps}
                  onChangeText={(value) => {
                    updateSet(set.id, "reps", value);
                    // Clear validation error when user starts typing
                    if (validationErrors[set.id]?.reps) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        if (newErrors[set.id]) {
                          delete newErrors[set.id].reps;
                          if (
                            !newErrors[set.id].weight &&
                            !newErrors[set.id].reps
                          ) {
                            delete newErrors[set.id];
                          }
                        }
                        return newErrors;
                      });
                    }
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholder=""
                  placeholderTextColor="#6b7280"
                />

                <Pressable
                  style={[
                    styles.checkmark,
                    set.completed && {
                      backgroundColor: isWarmup ? "#fb923c" : "#10b981",
                      borderColor: isWarmup ? "#fb923c" : "#10b981",
                    },
                    !set.completed &&
                      isWarmup && {
                        borderColor: "#fb923c",
                      },
                  ]}
                  onPress={() => toggleSetComplete(set.id)}
                >
                  {set.completed && (
                    <Ionicons name="checkmark" size={24} color="#fff" />
                  )}
                </Pressable>
              </View>
            </Swipeable>
          );
        })}
      {/* Add Set Button */}
      {!isReorderMode && (
        <Pressable
          style={[styles.addSetButton, { backgroundColor: backgroundColor }]}
          onPress={addSet}
        >
          <Text style={[styles.addSetText, { color: textColor }]}>
            + Add Set
          </Text>
        </Pressable>
      )}
      {/* Exercise Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[styles.menuContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowAddNoteInput(true);
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={textColor}
              />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Add Note
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setStickyNoteText(stickyNote?.text || "");
                setShowStickyNoteInput(true);
              }}
            >
              <Ionicons name="bookmark-outline" size={20} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                {stickyNote ? "Edit Sticky Note" : "Add Sticky Note"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowWarmupDialog(true);
              }}
            >
              <Ionicons name="flame-outline" size={20} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Add Warm Up Sets
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowReplaceDialog(true);
              }}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color={textColor}
              />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Replace Exercise
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowPreferencesDialog(true);
              }}
            >
              <Ionicons name="settings-outline" size={20} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Preferences
              </Text>
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onRemove();
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                Remove Exercise
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      {/* Replace Exercise Dialog */}
      <ExerciseSelectionDialog
        visible={showReplaceDialog}
        onClose={() => setShowReplaceDialog(false)}
        onSelectExercises={(exercises: Exercise[]) => {
          if (exercises.length > 0) {
            handleReplaceExercise(exercises[0]);
          }
        }}
        singleSelect={true}
      />
      {/* Focus Metric Selector */}
      <FocusMetricSelector
        visible={showFocusMetricSelector}
        onClose={() => setShowFocusMetricSelector(false)}
        onSelect={handleSelectFocusMetric}
        currentMetric={currentFocusMetric}
        exerciseCategory={exercise.category}
      />
      {/* Warm Up Sets Dialog */}
      <Modal
        visible={showWarmupDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWarmupDialog(false)}
      >
        <Pressable
          style={styles.dialogOverlay}
          onPress={() => setShowWarmupDialog(false)}
        >
          <View
            style={[styles.dialogContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.dialogTitle, { color: textColor }]}>
              Add Warm Up Sets
            </Text>
            <Text
              style={[
                styles.dialogDescription,
                { color: "#9ca3af", marginBottom: 16 },
              ]}
            >
              How many warm-up sets would you like to add?
            </Text>
            <TextInput
              style={[
                styles.dialogInput,
                {
                  color: textColor,
                  backgroundColor: cardBackground,
                  borderColor: "#6b7280",
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: "700",
                },
              ]}
              value={warmupCount}
              onChangeText={setWarmupCount}
              keyboardType="number-pad"
              selectTextOnFocus
              autoFocus
            />
            <View style={styles.dialogButtons}>
              <Pressable
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={() => {
                  setWarmupCount("3");
                  setShowWarmupDialog(false);
                }}
              >
                <Text style={styles.dialogButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dialogButton,
                  styles.dialogButtonConfirm,
                  { backgroundColor: "#fb923c" },
                ]}
                onPress={() => {
                  const count = parseInt(warmupCount) || 3;
                  addWarmupSets(count);
                  setWarmupCount("3");
                }}
              >
                <Text style={styles.dialogButtonConfirmText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
      {/* Preferences Dialog */}
      <Modal
        visible={showPreferencesDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowPreferencesDialog(false);
          setExpandedPreference(null);
        }}
      >
        <Pressable
          style={styles.dialogOverlay}
          onPress={() => {
            setShowPreferencesDialog(false);
            setExpandedPreference(null);
          }}
        >
          <View
            style={[styles.preferencesContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.dialogTitle, { color: textColor }]}>
              Exercise Preferences
            </Text>

            {/* Weight Unit Section */}
            <View style={styles.preferenceSection}>
              <Pressable
                style={styles.preferenceSectionHeader}
                onPress={() =>
                  setExpandedPreference(
                    expandedPreference === "weightUnit" ? null : "weightUnit",
                  )
                }
              >
                <View style={styles.preferenceSectionHeaderContent}>
                  <Text
                    style={[
                      styles.preferenceSectionTitle,
                      { color: textColor },
                    ]}
                  >
                    Weight Unit
                  </Text>
                  <Text
                    style={[
                      styles.preferenceSectionValue,
                      { color: "#9ca3af" },
                    ]}
                  >
                    {weightUnit === "default"
                      ? "Default (kg)"
                      : weightUnit === "kg"
                        ? "Kilograms"
                        : "Pounds"}
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedPreference === "weightUnit"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color={textColor}
                />
              </Pressable>

              {expandedPreference === "weightUnit" && (
                <View style={styles.optionGroup}>
                  <Pressable
                    style={[
                      styles.optionButton,
                      weightUnit === "default" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setWeightUnit("default");
                      setExpandedPreference(null);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          {
                            color:
                              weightUnit === "default" ? "#fff" : textColor,
                          },
                        ]}
                      >
                        Default
                      </Text>
                      <Text
                        style={[
                          styles.optionSubtext,
                          {
                            color:
                              weightUnit === "default"
                                ? "rgba(255,255,255,0.8)"
                                : "#9ca3af",
                          },
                        ]}
                      >
                        Use your preferred unit (kg)
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      weightUnit === "kg" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setWeightUnit("kg");
                      setExpandedPreference(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: weightUnit === "kg" ? "#fff" : textColor },
                      ]}
                    >
                      Kilograms (kg)
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      weightUnit === "lbs" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setWeightUnit("lbs");
                      setExpandedPreference(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: weightUnit === "lbs" ? "#fff" : textColor },
                      ]}
                    >
                      Pounds (lbs)
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Pressable
              style={[
                styles.dialogButton,
                styles.dialogButtonConfirm,
                { backgroundColor: tintColor, marginTop: 8 },
              ]}
              onPress={() => {
                setShowPreferencesDialog(false);
                setExpandedPreference(null);
              }}
            >
              <Text style={styles.dialogButtonConfirmText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.2)",
  },
  containerCompact: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  containerDragging: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reorderHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  dragIcon: {
    marginRight: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  exerciseNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 2,
    gap: 8,
  },
  tableHeaderText: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  setNumberHeader: {
    width: 40,
  },
  previousHeader: {
    width: 100,
  },
  inputHeader: {
    width: 70,
  },
  checkmarkHeader: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: "700",
    width: 40,
    textAlign: "center",
  },
  previousText: {
    fontSize: 15,
    width: 100,
    textAlign: "center",
  },
  input: {
    width: 70,
    height: 48,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  checkmark: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  addSetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 16,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "600",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: "80%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    marginVertical: 8,
  },
  metricsSection: {
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  helpButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryMetricCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryMetricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  primaryMetricLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  primaryMetricContent: {
    marginBottom: 8,
  },
  primaryMetricValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  primaryMetricPrevious: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.8,
  },
  primaryMetricChangeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  primaryMetricChange: {
    fontSize: 15,
    fontWeight: "700",
  },
  metricCard: {
    flex: 1,
    minWidth: "48%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  metricChange: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  stickyNoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  stickyNoteText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 14,
    flex: 1,
  },
  noteInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  noteInput: {
    fontSize: 14,
    flex: 1,
    paddingVertical: 4,
  },
  stickyNoteInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  stickyNoteInput: {
    fontSize: 14,
    flex: 1,
    paddingVertical: 4,
    fontWeight: "600",
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  dialogDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  dialogInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  dialogButtons: {
    flexDirection: "row",
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  dialogButtonCancel: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6b7280",
  },
  dialogButtonCancelText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  dialogButtonConfirm: {},
  dialogButtonConfirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  preferencesContainer: {
    width: "85%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  preferenceSection: {
    marginBottom: 16,
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    marginVertical: 12,
  },
  preferenceSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  preferenceSectionHeaderContent: {
    flex: 1,
  },
  preferenceSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  preferenceSectionValue: {
    fontSize: 13,
  },
  optionGroup: {
    gap: 6,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(107, 114, 128, 0.2)",
    backgroundColor: "transparent",
  },
  optionButtonActive: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionContent: {
    gap: 2,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionSubtext: {
    fontSize: 12,
  },
});
