import type { WorkoutNote } from "@/contexts/workout-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

interface WorkoutNoteItemProps {
  note: WorkoutNote;
  onUpdate: (noteId: string, text: string) => void;
  onDelete: (noteId: string) => void;
}

export function WorkoutNoteItem({
  note,
  onUpdate,
  onDelete,
}: WorkoutNoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(note.text);

  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");

  const handleSave = () => {
    onUpdate(note.id, noteText.trim());
    setIsEditing(false);
  };

  const renderRightActions = () => {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: "#ef4444" }]}
          onPress={() => onDelete(note.id)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      {isEditing ? (
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
            onBlur={handleSave}
          />
        </View>
      ) : (
        <Pressable
          onPress={() => {
            setIsEditing(true);
            setNoteText(note.text);
          }}
        >
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
  );
}

const styles = StyleSheet.create({
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deleteButton: {
    width: 60,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
});
