import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface FinishWorkoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: () => void;
  onCompleteUnfinished?: () => void;
  onDiscardUnfinished?: () => void;
  hasValidUnfinishedSets: boolean;
}

export function FinishWorkoutModal({
  visible,
  onCancel,
  onFinish,
  onCompleteUnfinished,
  onDiscardUnfinished,
  hasValidUnfinishedSets,
}: FinishWorkoutModalProps) {
  if (!hasValidUnfinishedSets) {
    // Simple finish modal - all sets are completed
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <Pressable style={styles.overlay} onPress={onCancel}>
          <View style={styles.modalContainer}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.emoji}>🎉</Text>
                <Text style={styles.title}>Finish Workout?</Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.finishButton]}
                    onPress={onFinish}
                  >
                    <Text style={styles.finishButtonText}>Finish</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    );
  }

  // Advanced modal - has valid unfinished sets
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.modalContainer}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.emoji}>🎉</Text>
              <Text style={styles.title}>Finish Workout?</Text>
              <Text style={styles.description}>
                There are valid sets in this workout that have not been marked
                as complete. Invalid or empty sets will be removed.
              </Text>

              <View style={styles.advancedButtonContainer}>
                <TouchableOpacity
                  style={[styles.fullButton, styles.completeButton]}
                  onPress={onCompleteUnfinished}
                >
                  <Text style={styles.completeButtonText}>
                    Complete Unfinished Sets
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fullButton, styles.discardButton]}
                  onPress={onDiscardUnfinished}
                >
                  <Text style={styles.discardButtonText}>
                    Discard Unfinished Sets
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fullButton, styles.cancelFullButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelFullButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 420,
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#2d3748",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  finishButton: {
    backgroundColor: "#10b981",
  },
  finishButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  advancedButtonContainer: {
    width: "100%",
    gap: 14,
  },
  fullButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButton: {
    backgroundColor: "#10b981",
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  discardButton: {
    backgroundColor: "#dc2626",
  },
  discardButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cancelFullButton: {
    backgroundColor: "#2d3748",
  },
  cancelFullButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
