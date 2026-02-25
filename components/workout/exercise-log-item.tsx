import type { SetData } from "@/contexts/workout-context";
import { useWorkout } from "@/contexts/workout-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
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
import { ExerciseDetailsDialog } from "./exercise-details-dialog";
import { ExerciseSelectionDialog } from "./exercise-selection-dialog";
import InlineRestTimer from "./inline-rest-timer";

interface ExerciseLogItemProps {
  exercise: Exercise;
  onRemove: () => void;
  onReplace: (oldExercise: Exercise, newExercise: Exercise) => void;
  dragHandle?: React.ReactNode;
  onStartRestTimer?: (setId: string, duration: number) => void;
  onScrollToView?: (yPosition: number) => void;
}

export function ExerciseLogItem({
  exercise,
  onRemove,
  onReplace,
  dragHandle,
  onStartRestTimer,
  onScrollToView,
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
  } = useWorkout();

  // Initialize sets from context or use default (empty values, no zeros)
  const [sets, setSets] = useState<SetData[]>(() => {
    const savedSets = exerciseSets[exercise.id];
    return savedSets && savedSets.length > 0
      ? savedSets
      : [{ id: "1", weight: "", reps: "", completed: false }];
  });

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  // Initialize rest timers for all sets
  const [restTimers, setRestTimers] = useState<
    Record<
      string,
      {
        remainingTime: number;
        totalDuration: number;
        isRunning: boolean;
      }
    >
  >(() => {
    // Create timers for all initial sets
    const initialTimers: Record<
      string,
      { remainingTime: number; totalDuration: number; isRunning: boolean }
    > = {};
    const initialSets = exerciseSets[exercise.id] || [
      { id: "1", weight: "", reps: "", completed: false },
    ];
    initialSets.forEach((set) => {
      initialTimers[set.id] = {
        remainingTime: 120, // Default 2:00
        totalDuration: 120,
        isRunning: false,
      };
    });
    return initialTimers;
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
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [expandedPreference, setExpandedPreference] = useState<
    "weightUnit" | "barType" | "restDuration" | null
  >(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [stickyNoteText, setStickyNoteText] = useState("");
  const [warmupCount, setWarmupCount] = useState("3");
  const [weightUnit, setWeightUnit] = useState<"default" | "kg" | "lbs">(
    "default",
  );
  const [barType, setBarType] = useState<
    "olympic" | "short" | "ez" | "hex" | "none"
  >("olympic");
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [selectedSetForTimer, setSelectedSetForTimer] = useState<string | null>(
    null,
  );
  const [defaultRestDuration, setDefaultRestDuration] = useState(120); // Default 2:00

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const backgroundColor = useThemeColor({}, "background");

  // Rest timer countdown effect
  useEffect(() => {
    const activeTimers = Object.keys(restTimers).filter(
      (setId) =>
        restTimers[setId].isRunning && restTimers[setId].remainingTime > 0,
    );

    if (activeTimers.length === 0) return;

    const interval = setInterval(() => {
      setRestTimers((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        activeTimers.forEach((setId) => {
          if (updated[setId] && updated[setId].remainingTime > 0) {
            updated[setId] = {
              ...updated[setId],
              remainingTime: updated[setId].remainingTime - 1,
            };
            hasChanges = true;
          }

          // Stop timer when it reaches 0, but don't delete it
          if (updated[setId] && updated[setId].remainingTime <= 0) {
            updated[setId] = {
              ...updated[setId],
              remainingTime: 0,
              isRunning: false,
            };
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimers]);

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSetId = String(sets.length + 1);
    setSets([
      ...sets,
      {
        id: newSetId,
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false,
        isWarmup: false,
      },
    ]);

    // Add timer for new set automatically
    setRestTimers((prev) => ({
      ...prev,
      [newSetId]: {
        remainingTime: defaultRestDuration,
        totalDuration: defaultRestDuration,
        isRunning: false, // Not running yet, user can customize
      },
    }));
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
    const set = sets.find((s) => s.id === setId);

    // Validate: weight and reps must have values (not empty or zero)
    if (set && !set.completed) {
      const hasWeight = set.weight.trim() !== "" && set.weight !== "0";
      const hasReps = set.reps.trim() !== "" && set.reps !== "0";

      if (!hasWeight || !hasReps) {
        // Show validation error
        setValidationErrors((prev) => ({ ...prev, [setId]: true }));

        // Clear error after 2 seconds
        setTimeout(() => {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[setId];
            return newErrors;
          });
        }, 2000);

        return; // Don't complete the set
      }
    }

    // Clear any validation error for this set
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[setId];
      return newErrors;
    });

    const isCompleting = set && !set.completed;

    setSets(
      sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
    );

    // Start rest timer when completing a set
    if (isCompleting) {
      setRestTimers((prev) => ({
        ...prev,
        [setId]: {
          remainingTime: prev[setId]?.remainingTime || defaultRestDuration,
          totalDuration: prev[setId]?.totalDuration || defaultRestDuration,
          isRunning: true, // Start running when set is completed
        },
      }));
    } else {
      // Stop timer when uncompleting a set
      setRestTimers((prev) => {
        const newTimers = { ...prev };
        if (newTimers[setId]) {
          newTimers[setId] = {
            ...newTimers[setId],
            isRunning: false,
          };
        }
        return newTimers;
      });
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

  const deleteSet = (setId: string) => {
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

  return (
    <View style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <View style={styles.exerciseNameRow}>
          {dragHandle}
          <Pressable
            onPress={() => setShowExerciseDetails(true)}
            style={styles.exerciseNameButton}
          >
            <Text style={[styles.exerciseName, { color: tintColor }]}>
              {exercise.name}
            </Text>
          </Pressable>
        </View>
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
            <Ionicons name="ellipsis-horizontal" size={20} color={tintColor} />
          </Pressable>
        </View>
      </View>

      {/* Sticky Note - Always at top if exists */}
      {stickyNote && (
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
      {showStickyNoteInput && !stickyNote && (
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
      {notes.map((note) => (
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
      {showAddNoteInput && (
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
      {showMetrics && (
        <View
          style={[styles.metricsSection, { backgroundColor: backgroundColor }]}
        >
          <View style={styles.metricsSectionHeader}>
            <Text style={[styles.metricsSectionTitle, { color: textColor }]}>
              Focus Metrics
            </Text>
            <Pressable style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={20} color="#9ca3af" />
            </Pressable>
          </View>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#9ca3af" }]}>
                Total Volume
              </Text>
              <Text style={[styles.metricValue, { color: textColor }]}>
                N/A
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#9ca3af" }]}>
                Volume Increase
              </Text>
              <Text style={[styles.metricValue, { color: textColor }]}>
                -100%
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#9ca3af" }]}>
                Total Reps
              </Text>
              <Text style={[styles.metricValue, { color: textColor }]}>
                N/A
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#9ca3af" }]}>
                Weight/Rep
              </Text>
              <Text style={[styles.metricValue, { color: textColor }]}>
                N/A
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Sets Table Header */}
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

      {/* Sets List */}
      {sets.map((set, index) => {
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

        const hasTimer = restTimers[set.id];

        return (
          <View key={set.id}>
            <Swipeable
              renderRightActions={() => renderRightActions(set.id)}
              overshootRight={false}
            >
              <View
                style={[
                  styles.setRow,
                  isWarmup && {
                    backgroundColor: "rgba(251, 146, 60, 0.15)",
                  },
                  set.completed && {
                    backgroundColor: "rgba(16, 185, 129, 0.1)", // Light green background
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

                {/* Previous data - only show from saved workout history, not current session */}
                <Text style={[styles.previousText, { color: "#6b7280" }]}>
                  —
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      backgroundColor: isWarmup
                        ? "rgba(251, 146, 60, 0.1)"
                        : cardBackground,
                      borderWidth: 2,
                      borderColor: validationErrors[set.id]
                        ? "#ef4444"
                        : isWarmup
                          ? "rgba(251, 146, 60, 0.3)"
                          : "rgba(107, 114, 128, 0.3)",
                    },
                  ]}
                  value={set.weight}
                  onChangeText={(value) => updateSet(set.id, "weight", value)}
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
                      borderColor: validationErrors[set.id]
                        ? "#ef4444"
                        : isWarmup
                          ? "rgba(251, 146, 60, 0.3)"
                          : "rgba(107, 114, 128, 0.3)",
                    },
                  ]}
                  value={set.reps}
                  onChangeText={(value) => updateSet(set.id, "reps", value)}
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

            {/* Inline Rest Timer - Show after each set */}
            {hasTimer && (
              <InlineRestTimer
                remainingTime={hasTimer.remainingTime}
                totalDuration={hasTimer.totalDuration}
                isRunning={hasTimer.isRunning}
                isCompleted={set.completed}
                onUpdate={(remaining: number, total: number) => {
                  setRestTimers((prev) => ({
                    ...prev,
                    [set.id]: {
                      remainingTime: remaining,
                      totalDuration: total,
                      isRunning: prev[set.id]?.isRunning || false,
                    },
                  }));
                }}
                onStart={() => {
                  setRestTimers((prev) => ({
                    ...prev,
                    [set.id]: {
                      ...prev[set.id],
                      isRunning: true,
                    },
                  }));
                }}
                onPause={() => {
                  setRestTimers((prev) => ({
                    ...prev,
                    [set.id]: {
                      ...prev[set.id],
                      isRunning: false,
                    },
                  }));
                }}
                onSkip={() => {
                  setRestTimers((prev) => {
                    const newTimers = { ...prev };
                    delete newTimers[set.id];
                    return newTimers;
                  });
                }}
                onKeyboardOpen={(yPosition: number) => {
                  // Scroll this specific timer into view when keyboard opens
                  if (onScrollToView) {
                    onScrollToView(yPosition);
                  }
                }}
              />
            )}
          </View>
        );
      })}

      {/* Add Set Button */}
      <Pressable
        style={[styles.addSetButton, { backgroundColor: backgroundColor }]}
        onPress={addSet}
      >
        <Text style={[styles.addSetText, { color: textColor }]}>+ Add Set</Text>
      </Pressable>

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

      {/* Exercise Details Dialog */}
      <ExerciseDetailsDialog
        visible={showExerciseDetails}
        onClose={() => setShowExerciseDetails(false)}
        exercise={exercise}
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

            {/* Divider */}
            <View style={styles.preferenceDivider} />

            {/* Bar Type Section */}
            <View style={styles.preferenceSection}>
              <Pressable
                style={styles.preferenceSectionHeader}
                onPress={() =>
                  setExpandedPreference(
                    expandedPreference === "barType" ? null : "barType",
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
                    Bar Type
                  </Text>
                  <Text
                    style={[
                      styles.preferenceSectionValue,
                      { color: "#9ca3af" },
                    ]}
                  >
                    {barType === "olympic"
                      ? "Olympic Bar"
                      : barType === "short"
                        ? "Short Bar"
                        : barType === "ez"
                          ? "EZ Bar"
                          : barType === "hex"
                            ? "Hex Bar"
                            : "None"}
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedPreference === "barType"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color={textColor}
                />
              </Pressable>

              {expandedPreference === "barType" && (
                <View style={styles.optionGroup}>
                  <Pressable
                    style={[
                      styles.optionButton,
                      barType === "olympic" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setBarType("olympic");
                      setExpandedPreference(null);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          { color: barType === "olympic" ? "#fff" : textColor },
                        ]}
                      >
                        Olympic Bar
                      </Text>
                      <Text
                        style={[
                          styles.optionSubtext,
                          {
                            color:
                              barType === "olympic"
                                ? "rgba(255,255,255,0.8)"
                                : "#9ca3af",
                          },
                        ]}
                      >
                        20 kg / 45 lbs
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      barType === "short" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setBarType("short");
                      setExpandedPreference(null);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          { color: barType === "short" ? "#fff" : textColor },
                        ]}
                      >
                        Short Bar
                      </Text>
                      <Text
                        style={[
                          styles.optionSubtext,
                          {
                            color:
                              barType === "short"
                                ? "rgba(255,255,255,0.8)"
                                : "#9ca3af",
                          },
                        ]}
                      >
                        15 kg / 33 lbs
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      barType === "ez" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setBarType("ez");
                      setExpandedPreference(null);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          { color: barType === "ez" ? "#fff" : textColor },
                        ]}
                      >
                        EZ Bar
                      </Text>
                      <Text
                        style={[
                          styles.optionSubtext,
                          {
                            color:
                              barType === "ez"
                                ? "rgba(255,255,255,0.8)"
                                : "#9ca3af",
                          },
                        ]}
                      >
                        10 kg / 22 lbs
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      barType === "hex" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setBarType("hex");
                      setExpandedPreference(null);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          { color: barType === "hex" ? "#fff" : textColor },
                        ]}
                      >
                        Hex Bar
                      </Text>
                      <Text
                        style={[
                          styles.optionSubtext,
                          {
                            color:
                              barType === "hex"
                                ? "rgba(255,255,255,0.8)"
                                : "#9ca3af",
                          },
                        ]}
                      >
                        25 kg / 55 lbs
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      barType === "none" && [
                        styles.optionButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => {
                      setBarType("none");
                      setExpandedPreference(null);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          { color: barType === "none" ? "#fff" : textColor },
                        ]}
                      >
                        None
                      </Text>
                      <Text
                        style={[
                          styles.optionSubtext,
                          {
                            color:
                              barType === "none"
                                ? "rgba(255,255,255,0.8)"
                                : "#9ca3af",
                          },
                        ]}
                      >
                        Dumbbells, machines, etc.
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.preferenceDivider} />

            {/* Rest Duration Section */}
            <View style={styles.preferenceSection}>
              <Pressable
                style={styles.preferenceSectionHeader}
                onPress={() =>
                  setExpandedPreference(
                    expandedPreference === "restDuration"
                      ? null
                      : "restDuration",
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
                    Default Rest Timer
                  </Text>
                  <Text
                    style={[
                      styles.preferenceSectionValue,
                      { color: "#9ca3af" },
                    ]}
                  >
                    {Math.floor(defaultRestDuration / 60)}:
                    {(defaultRestDuration % 60).toString().padStart(2, "0")}
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedPreference === "restDuration"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color={textColor}
                />
              </Pressable>

              {expandedPreference === "restDuration" && (
                <View style={styles.optionGroup}>
                  <View style={styles.restDurationControls}>
                    <Pressable
                      style={[
                        styles.restDurationButton,
                        { borderColor: "#6b7280" },
                      ]}
                      onPress={() =>
                        setDefaultRestDuration((prev) =>
                          Math.max(15, prev - 15),
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.restDurationButtonText,
                          { color: textColor },
                        ]}
                      >
                        -15s
                      </Text>
                    </Pressable>
                    <View style={styles.restDurationDisplay}>
                      <Text
                        style={[styles.restDurationTime, { color: tintColor }]}
                      >
                        {Math.floor(defaultRestDuration / 60)}:
                        {(defaultRestDuration % 60).toString().padStart(2, "0")}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.restDurationButton,
                        { borderColor: "#6b7280" },
                      ]}
                      onPress={() =>
                        setDefaultRestDuration((prev) =>
                          Math.min(300, prev + 15),
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.restDurationButtonText,
                          { color: textColor },
                        ]}
                      >
                        +15s
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.restDurationPresets}>
                    {[30, 45, 60, 90, 120].map((duration) => (
                      <Pressable
                        key={duration}
                        style={[
                          styles.presetButton,
                          defaultRestDuration === duration && {
                            backgroundColor: tintColor,
                          },
                        ]}
                        onPress={() => {
                          setDefaultRestDuration(duration);
                          setExpandedPreference(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.presetButtonText,
                            {
                              color:
                                defaultRestDuration === duration
                                  ? "#fff"
                                  : textColor,
                            },
                          ]}
                        >
                          {Math.floor(duration / 60)}:
                          {(duration % 60).toString().padStart(2, "0")}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
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
    gap: 8,
  },
  exerciseNameButton: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
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
  restDurationControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  restDurationButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  restDurationButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  restDurationDisplay: {
    flex: 2,
    alignItems: "center",
  },
  restDurationTime: {
    fontSize: 32,
    fontWeight: "700",
  },
  restDurationPresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6b7280",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
