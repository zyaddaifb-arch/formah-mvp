import { useWorkout } from "@/contexts/workout-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { CompactTimer } from "./compact-timer";
import { ExerciseLogItem } from "./exercise-log-item";
import { ExerciseSelectionDialog } from "./exercise-selection-dialog";
import { RestTimerModal } from "./rest-timer-modal";
import { WorkoutNoteItem } from "./workout-note-item";

export function WorkoutBottomSheet() {
  const [workoutName, setWorkoutName] = useState("Quick Workout");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showWorkoutMenu, setShowWorkoutMenu] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showHeaderTimer, setShowHeaderTimer] = useState(false);
  const [showAddNoteInput, setShowAddNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const scrollYRef = useRef(0);
  const [restTimerData, setRestTimerData] = useState<{
    remainingTime: number;
    totalDuration: number;
    isRunning: boolean;
  } | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const {
    isWorkoutActive,
    isModalOpen,
    endWorkout,
    closeModal,
    workoutNotes,
    workoutPhoto,
    addWorkoutNote,
    updateWorkoutNote,
    deleteWorkoutNote,
    setWorkoutPhoto,
  } = useWorkout();

  // Reset selected exercises when workout is ended
  useEffect(() => {
    if (!isWorkoutActive) {
      // Clear exercises when workout is ended
      setSelectedExercises([]);
      setWorkoutName("Quick Workout");
      setIsEditingName(false);
      setRestTimerData(null);
      setShowRestTimer(false);
      setShowAddNoteInput(false);
      setNoteText("");
    }
  }, [isWorkoutActive]);

  // Timer
  useEffect(() => {
    if (!isWorkoutActive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  // Rest Timer
  useEffect(() => {
    if (!restTimerData?.isRunning || restTimerData.remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRestTimerData((prev) => {
        if (!prev || prev.remainingTime <= 1) {
          return null;
        }
        return {
          ...prev,
          remainingTime: prev.remainingTime - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerData?.isRunning, restTimerData?.remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("en", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel workout? Progress will be lost.",
      [
        {
          text: "Resume",
          style: "cancel",
        },
        {
          text: "Cancel Workout",
          style: "destructive",
          onPress: () => {
            // Reset everything when canceling workout
            setElapsedTime(0);
            setWorkoutName("Quick Workout");
            setIsEditingName(false);
            setSelectedExercises([]);
            setRestTimerData(null);
            setShowRestTimer(false);
            setShowAddNoteInput(false);
            setNoteText("");
            endWorkout(); // This will also clear exerciseSets
          },
        },
      ],
    );
  };

  const handleFinish = () => {
    // Reset everything when finishing workout
    setElapsedTime(0);
    setWorkoutName("Quick Workout");
    setIsEditingName(false);
    setSelectedExercises([]);
    setRestTimerData(null);
    setShowRestTimer(false);
    setShowAddNoteInput(false);
    setNoteText("");
    endWorkout(); // This will also clear exerciseSets
  };

  const handleMinimize = () => {
    setIsExerciseDialogOpen(false);
    closeModal();
  };

  const handleAddExercises = () => {
    setIsExerciseDialogOpen(true);
  };

  const handleSelectExercises = (exercises: Exercise[]) => {
    setSelectedExercises((prev) => [...prev, ...exercises]);
    setIsExerciseDialogOpen(false);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplaceExercise = (
    oldExercise: Exercise,
    newExercise: Exercise,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => (ex.id === oldExercise.id ? newExercise : ex)),
    );
  };

  const handleTimerMinimize = (
    remainingTime: number,
    totalDuration: number,
  ) => {
    setRestTimerData({ remainingTime, totalDuration, isRunning: true });
    setShowRestTimer(false);
  };

  const handleCompactTimerPress = () => {
    setShowRestTimer(true);
  };

  const handleRestTimerClose = () => {
    setShowRestTimer(false);
    setRestTimerData(null);
  };

  const handleTimerComplete = () => {
    setRestTimerData(null);
  };

  const handleTimerUpdate = (remainingTime: number, totalDuration: number) => {
    setRestTimerData({
      remainingTime,
      totalDuration,
      isRunning: true,
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    scrollYRef.current = scrollY;
    console.log("Scroll Y:", scrollY, "Show Timer:", scrollY > 100);
    // Show header timer when scrolled past 100px
    const shouldShow = scrollY > 100;
    if (shouldShow !== showHeaderTimer) {
      setShowHeaderTimer(shouldShow);
    }
  };

  const handleAddPhoto = async () => {
    setShowWorkoutMenu(false);

    Alert.alert("Add Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();

          if (permissionResult.granted === false) {
            Alert.alert(
              "Permission Required",
              "You need to allow camera access to take a photo.",
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            setWorkoutPhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (permissionResult.granted === false) {
            Alert.alert(
              "Permission Required",
              "You need to allow access to your photos.",
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            setWorkoutPhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handlePhotoPress = () => {
    Alert.alert("Workout Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();

          if (permissionResult.granted === false) {
            Alert.alert(
              "Permission Required",
              "You need to allow camera access to take a photo.",
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            setWorkoutPhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (permissionResult.granted === false) {
            Alert.alert(
              "Permission Required",
              "You need to allow access to your photos.",
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            setWorkoutPhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: "Remove Current Photo",
        style: "destructive",
        onPress: () => setWorkoutPhoto(null),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleRemovePhoto = () => {
    setShowWorkoutMenu(false);
    setWorkoutPhoto(null);
  };

  const handleAddNote = () => {
    // Always add note, even if empty
    addWorkoutNote(noteText.trim());
    setNoteText("");
    setShowAddNoteInput(false);
  };

  const handleRemoveNote = () => {
    setShowWorkoutMenu(false);
    if (workoutNotes.length > 0) {
      deleteWorkoutNote(workoutNotes[0].id);
    }
  };

  const renderExerciseItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Exercise>) => {
    const index = getIndex();

    const dragHandleComponent = (
      <Pressable
        onLongPress={drag}
        disabled={isActive}
        style={styles.inlineDragHandle}
      >
        <Ionicons name="reorder-three" size={20} color={tintColor} />
      </Pressable>
    );

    return (
      <ScaleDecorator>
        <View
          style={[
            styles.exerciseItemWrapper,
            isActive && styles.exerciseItemActive,
          ]}
        >
          <ExerciseLogItem
            exercise={item}
            onRemove={() => handleRemoveExercise(index ?? 0)}
            onReplace={handleReplaceExercise}
            dragHandle={dragHandleComponent}
          />
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <Modal
      visible={isModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={handleMinimize}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          {/* Left Side: Back Arrow + Workout Timer */}
          <View style={styles.headerLeft}>
            <Pressable onPress={handleMinimize} style={styles.headerButton}>
              <Ionicons name="chevron-down" size={28} color={textColor} />
            </Pressable>
            {showHeaderTimer && (
              <View style={styles.workoutTimerContainer}>
                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                <Text style={styles.workoutTimerText}>
                  {formatTime(elapsedTime)}
                </Text>
              </View>
            )}
          </View>

          {/* Right Side: Timer + Finish Button */}
          <View style={styles.headerRight}>
            {restTimerData ? (
              <CompactTimer
                remainingTime={restTimerData.remainingTime}
                totalDuration={restTimerData.totalDuration}
                onPress={handleCompactTimerPress}
              />
            ) : (
              <Pressable
                onPress={() => setShowRestTimer(true)}
                style={styles.headerButton}
              >
                <Ionicons name="timer-outline" size={24} color={textColor} />
              </Pressable>
            )}

            <Pressable
              onPress={handleFinish}
              style={[styles.finishButton, { backgroundColor: "#10b981" }]}
            >
              <Text style={styles.finishButtonText}>Finish</Text>
            </Pressable>
          </View>
        </View>

        {selectedExercises.length === 0 ? (
          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              const scrollY = e.nativeEvent.contentOffset.y;
              setShowHeaderTimer(scrollY > 100);
            }}
            scrollEventThrottle={16}
          >
            <View style={styles.workoutInfo}>
              <View style={styles.titleRow}>
                {isEditingName ? (
                  <TextInput
                    style={[styles.titleInput, { color: textColor }]}
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                    selectTextOnFocus
                  />
                ) : (
                  <Pressable
                    onPress={() => setIsEditingName(true)}
                    style={{ flex: 1 }}
                  >
                    <Text style={[styles.title, { color: textColor }]}>
                      {workoutName}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.menuButton}
                  onPress={() => setShowWorkoutMenu(true)}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color="#6b7280"
                  />
                </Pressable>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                  <Text style={styles.metaText}>{formatDate()}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#9ca3af" />
                  <Text style={styles.metaText}>{formatTime(elapsedTime)}</Text>
                </View>
              </View>

              {/* Workout Photo */}
              {workoutPhoto && (
                <Pressable
                  style={styles.workoutPhotoContainer}
                  onPress={handlePhotoPress}
                >
                  <Image
                    source={{ uri: workoutPhoto }}
                    style={styles.workoutPhoto}
                    resizeMode="cover"
                  />
                </Pressable>
              )}

              {/* Workout Notes - Only show first note */}
              {workoutNotes.length > 0 && (
                <View style={styles.workoutNoteWrapper}>
                  <WorkoutNoteItem
                    note={workoutNotes[0]}
                    onUpdate={updateWorkoutNote}
                    onDelete={deleteWorkoutNote}
                  />
                </View>
              )}

              {/* Add Note Input - Only show if no notes exist */}
              {showAddNoteInput && workoutNotes.length === 0 && (
                <View style={styles.workoutNoteWrapper}>
                  <View
                    style={[
                      styles.addNoteContainer,
                      { backgroundColor: cardBackground },
                    ]}
                  >
                    <Ionicons name="document-text" size={16} color="#9ca3af" />
                    <TextInput
                      style={[styles.addNoteInput, { color: textColor }]}
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Add a note..."
                      placeholderTextColor="#9ca3af"
                      autoFocus
                      multiline
                      onBlur={handleAddNote}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.exerciseArea}>
              <Text style={[styles.emptyText, { color: "#6b7280" }]}>
                No exercises yet. Tap "Add Exercises" to get started.
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleAddExercises}
                style={[
                  styles.button,
                  styles.addButton,
                  { backgroundColor: tintColor },
                ]}
              >
                <Text style={styles.addButtonText}>Add Exercises</Text>
              </Pressable>

              <Pressable
                onPress={handleCancel}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel Workout</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <DraggableFlatList
            data={selectedExercises}
            onDragEnd={({ data }) => setSelectedExercises(data)}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderExerciseItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScrollBeginDrag={(e) => {
              const scrollY = e.nativeEvent.contentOffset.y;
              setShowHeaderTimer(scrollY > 100);
            }}
            onMomentumScrollEnd={(e) => {
              const scrollY = e.nativeEvent.contentOffset.y;
              setShowHeaderTimer(scrollY > 100);
            }}
            onScroll={(e) => {
              const scrollY = e.nativeEvent.contentOffset.y;
              setShowHeaderTimer(scrollY > 100);
            }}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <View style={styles.workoutInfo}>
                <View style={styles.titleRow}>
                  {isEditingName ? (
                    <TextInput
                      style={[styles.titleInput, { color: textColor }]}
                      value={workoutName}
                      onChangeText={setWorkoutName}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      selectTextOnFocus
                    />
                  ) : (
                    <Pressable
                      onPress={() => setIsEditingName(true)}
                      style={{ flex: 1 }}
                    >
                      <Text style={[styles.title, { color: textColor }]}>
                        {workoutName}
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setShowWorkoutMenu(true)}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#9ca3af"
                    />
                    <Text style={styles.metaText}>{formatDate()}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#9ca3af" />
                    <Text style={styles.metaText}>
                      {formatTime(elapsedTime)}
                    </Text>
                  </View>
                </View>

                {/* Workout Photo */}
                {workoutPhoto && (
                  <Pressable
                    style={styles.workoutPhotoContainer}
                    onPress={handlePhotoPress}
                  >
                    <Image
                      source={{ uri: workoutPhoto }}
                      style={styles.workoutPhoto}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}

                {/* Workout Notes - Only show first note */}
                {workoutNotes.length > 0 && (
                  <View style={styles.workoutNoteWrapper}>
                    <WorkoutNoteItem
                      note={workoutNotes[0]}
                      onUpdate={updateWorkoutNote}
                      onDelete={deleteWorkoutNote}
                    />
                  </View>
                )}

                {/* Add Note Input - Only show if no notes exist */}
                {showAddNoteInput && workoutNotes.length === 0 && (
                  <View style={styles.workoutNoteWrapper}>
                    <View
                      style={[
                        styles.addNoteContainer,
                        { backgroundColor: cardBackground },
                      ]}
                    >
                      <Ionicons
                        name="document-text"
                        size={16}
                        color="#9ca3af"
                      />
                      <TextInput
                        style={[styles.addNoteInput, { color: textColor }]}
                        value={noteText}
                        onChangeText={setNoteText}
                        placeholder="Add a note..."
                        placeholderTextColor="#9ca3af"
                        autoFocus
                        multiline
                        onBlur={handleAddNote}
                      />
                    </View>
                  </View>
                )}
              </View>
            }
            ListFooterComponent={
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={handleAddExercises}
                  style={[
                    styles.button,
                    styles.addButton,
                    { backgroundColor: tintColor },
                  ]}
                >
                  <Text style={styles.addButtonText}>Add Exercises</Text>
                </Pressable>

                <Pressable
                  onPress={handleCancel}
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel Workout</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </View>

      <ExerciseSelectionDialog
        visible={isExerciseDialogOpen}
        onClose={() => setIsExerciseDialogOpen(false)}
        onSelectExercises={handleSelectExercises}
      />

      <RestTimerModal
        visible={showRestTimer}
        onClose={handleRestTimerClose}
        onMinimize={handleTimerMinimize}
        onTimerUpdate={handleTimerUpdate}
        initialRemainingTime={restTimerData?.remainingTime}
        initialTotalDuration={restTimerData?.totalDuration}
        onTimerComplete={handleTimerComplete}
      />

      {/* Workout Menu Modal */}
      <Modal
        visible={showWorkoutMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWorkoutMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowWorkoutMenu(false)}
        >
          <View style={styles.menuPositioner}>
            <View
              style={[
                styles.menuContainer,
                { backgroundColor: cardBackground },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setShowWorkoutMenu(false);
                  setIsEditingName(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color={textColor} />
                <Text style={[styles.menuItemText, { color: textColor }]}>
                  Edit Workout Name
                </Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  if (workoutPhoto) {
                    handleRemovePhoto();
                  } else {
                    handleAddPhoto();
                  }
                }}
              >
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={workoutPhoto ? "#ef4444" : textColor}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: workoutPhoto ? "#ef4444" : textColor },
                  ]}
                >
                  {workoutPhoto ? "Remove Photo" : "Add Photo"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  if (workoutNotes.length > 0) {
                    handleRemoveNote();
                  } else {
                    setShowWorkoutMenu(false);
                    setShowAddNoteInput(true);
                  }
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={workoutNotes.length > 0 ? "#ef4444" : textColor}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: workoutNotes.length > 0 ? "#ef4444" : textColor },
                  ]}
                >
                  {workoutNotes.length > 0 ? "Remove Note" : "Add Note"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  workoutTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  workoutTimerText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  finishButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  workoutInfo: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
    padding: 0,
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  exerciseArea: {
    flex: 1,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 100,
  },
  actionButtons: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButton: {},
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  menuPositioner: {
    position: "absolute",
    top: 140,
    right: 20,
  },
  menuContainer: {
    width: 220,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  exerciseItemWrapper: {
    marginBottom: 12,
  },
  exerciseItemActive: {
    opacity: 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inlineDragHandle: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  workoutPhotoContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  workoutPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  workoutNoteWrapper: {
    marginTop: 8,
  },
  addNoteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6b7280",
  },
  addNoteInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 40,
  },
});
