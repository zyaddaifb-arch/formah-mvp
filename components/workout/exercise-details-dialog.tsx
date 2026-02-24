import { useThemeColor } from "@/hooks/use-theme-color";
import type { Exercise } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface ExerciseDetailsDialogProps {
  visible: boolean;
  onClose: () => void;
  exercise: Exercise;
}

type TabType = "about" | "history" | "charts" | "records";

export function ExerciseDetailsDialog({
  visible,
  onClose,
  exercise,
}: ExerciseDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("about");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  // Dummy data for demonstration
  const dummyHistory = [
    { date: "2024-02-20", sets: 3, reps: 12, weight: 60 },
    { date: "2024-02-18", sets: 3, reps: 10, weight: 55 },
    { date: "2024-02-15", sets: 4, reps: 8, weight: 65 },
  ];

  const dummyRecords = {
    maxWeight: 70,
    maxVolume: 2160,
    bestSet: { reps: 15, weight: 60 },
  };

  const instructions = [
    "Position handles at the middle to lower chest and adjust seat to appropriate height.",
    "Grab the handles and extend arms at shoulder width.",
    "Retract scapula and have elbows between 45 to 90 degree angle.",
    "As you breathe out, lower handles to the middle chest.",
    "Squeeze chest and push handles.",
    "Repeat for reps.",
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialogContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </Pressable>

            <Text style={[styles.headerTitle, { color: textColor }]}>
              {exercise.name}
            </Text>

            <Pressable style={styles.editButton}>
              <Text style={[styles.editButtonText, { color: tintColor }]}>
                Edit
              </Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <Pressable
              style={[
                styles.tab,
                activeTab === "about" && [
                  styles.activeTab,
                  { borderBottomColor: tintColor },
                ],
              ]}
              onPress={() => setActiveTab("about")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: textColor },
                  activeTab === "about" && { color: tintColor },
                ]}
              >
                About
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "history" && [
                  styles.activeTab,
                  { borderBottomColor: tintColor },
                ],
              ]}
              onPress={() => setActiveTab("history")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: textColor },
                  activeTab === "history" && { color: tintColor },
                ]}
              >
                History
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "charts" && [
                  styles.activeTab,
                  { borderBottomColor: tintColor },
                ],
              ]}
              onPress={() => setActiveTab("charts")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: textColor },
                  activeTab === "charts" && { color: tintColor },
                ]}
              >
                Charts
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "records" && [
                  styles.activeTab,
                  { borderBottomColor: tintColor },
                ],
              ]}
              onPress={() => setActiveTab("records")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: textColor },
                  activeTab === "records" && { color: tintColor },
                ]}
              >
                Records
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {activeTab === "about" && (
              <View style={styles.aboutContent}>
                {/* Exercise Image */}
                <View
                  style={[
                    styles.imageContainer,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <View style={styles.placeholderImage}>
                    <Ionicons name="barbell" size={80} color="#6b7280" />
                  </View>
                  <Pressable
                    style={[styles.playButton, { backgroundColor: tintColor }]}
                  >
                    <Ionicons name="play" size={20} color="#fff" />
                  </Pressable>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Instructions
                  </Text>
                  {instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <Text
                        style={[styles.instructionNumber, { color: textColor }]}
                      >
                        {index + 1}.
                      </Text>
                      <Text
                        style={[styles.instructionText, { color: textColor }]}
                      >
                        {instruction}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activeTab === "history" && (
              <View style={styles.historyContent}>
                {dummyHistory.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={48} color="#6b7280" />
                    <Text style={[styles.emptyStateText, { color: "#6b7280" }]}>
                      No history yet
                    </Text>
                  </View>
                ) : (
                  dummyHistory.map((entry, index) => (
                    <View
                      key={index}
                      style={[
                        styles.historyItem,
                        { backgroundColor: cardBackground },
                      ]}
                    >
                      <View style={styles.historyItemHeader}>
                        <Text
                          style={[styles.historyDate, { color: textColor }]}
                        >
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                      <View style={styles.historyItemStats}>
                        <View style={styles.historyStat}>
                          <Text style={styles.historyStatLabel}>Sets</Text>
                          <Text
                            style={[
                              styles.historyStatValue,
                              { color: textColor },
                            ]}
                          >
                            {entry.sets}
                          </Text>
                        </View>
                        <View style={styles.historyStat}>
                          <Text style={styles.historyStatLabel}>Reps</Text>
                          <Text
                            style={[
                              styles.historyStatValue,
                              { color: textColor },
                            ]}
                          >
                            {entry.reps}
                          </Text>
                        </View>
                        <View style={styles.historyStat}>
                          <Text style={styles.historyStatLabel}>Weight</Text>
                          <Text
                            style={[
                              styles.historyStatValue,
                              { color: textColor },
                            ]}
                          >
                            {entry.weight} kg
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === "charts" && (
              <View style={styles.chartsContent}>
                <View style={styles.emptyState}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={48}
                    color="#6b7280"
                  />
                  <Text style={[styles.emptyStateText, { color: "#6b7280" }]}>
                    Charts coming soon
                  </Text>
                  <Text
                    style={[styles.emptyStateSubtext, { color: "#9ca3af" }]}
                  >
                    Track your progress over time
                  </Text>
                </View>
              </View>
            )}

            {activeTab === "records" && (
              <View style={styles.recordsContent}>
                <View
                  style={[
                    styles.recordCard,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <View style={styles.recordIcon}>
                    <Ionicons name="trophy" size={24} color={tintColor} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordLabel}>Max Weight</Text>
                    <Text style={[styles.recordValue, { color: textColor }]}>
                      {dummyRecords.maxWeight} kg
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.recordCard,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <View style={styles.recordIcon}>
                    <Ionicons name="fitness" size={24} color={tintColor} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordLabel}>Max Volume</Text>
                    <Text style={[styles.recordValue, { color: textColor }]}>
                      {dummyRecords.maxVolume} kg
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.recordCard,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <View style={styles.recordIcon}>
                    <Ionicons name="star" size={24} color={tintColor} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordLabel}>Best Set</Text>
                    <Text style={[styles.recordValue, { color: textColor }]}>
                      {dummyRecords.bestSet.reps} reps ×{" "}
                      {dummyRecords.bestSet.weight} kg
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
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
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    width: 60,
    alignItems: "flex-end",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.2)",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  aboutContent: {
    gap: 24,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  placeholderImage: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  instructionItem: {
    flexDirection: "row",
    gap: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: "700",
    width: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  historyContent: {
    gap: 12,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  historyItemStats: {
    flexDirection: "row",
    gap: 16,
  },
  historyStat: {
    flex: 1,
  },
  historyStatLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  chartsContent: {
    flex: 1,
  },
  recordsContent: {
    gap: 12,
  },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordInfo: {
    flex: 1,
  },
  recordLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});
