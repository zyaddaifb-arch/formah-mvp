import { ThemedView } from "@/components/themed-view";
import { ConsistencyCard } from "@/components/workout/consistency-card";
import { TemplateCard } from "@/components/workout/template-card";
import { useWorkout } from "@/contexts/workout-context";
import { mockTemplates } from "@/data/mock-templates";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const { startWorkout, isWorkoutActive, openWorkout, endWorkout } =
    useWorkout();

  const handleStartWorkout = () => {
    if (isWorkoutActive) {
      Alert.alert(
        "Workout in Progress",
        "You have a workout in progress. What would you like to do?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Resume Workout",
            onPress: () => openWorkout(),
          },
          {
            text: "Start New Workout",
            style: "destructive",
            onPress: () => {
              endWorkout();
              setTimeout(() => startWorkout(), 100);
            },
          },
        ],
        { cancelable: true },
      );
    } else {
      startWorkout();
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.welcomeText, { color: primaryColor }]}>
              WELCOME BACK
            </Text>
            <Text style={[styles.greetingText, { color: textColor }]}>
              GOOD{"\n"}MORNING
            </Text>
          </View>
          <View style={styles.profileContainer}>
            <View style={[styles.profileBorder, { borderColor: primaryColor }]}>
              <View style={styles.profileImage} />
            </View>
            <View
              style={[styles.statusDot, { backgroundColor: primaryColor }]}
            />
          </View>
        </View>

        {/* Consistency Card */}
        <View style={styles.consistencySection}>
          <ConsistencyCard completedDays={4} totalDays={5} />
        </View>

        {/* Start Empty Workout Button */}
        <View style={styles.startWorkoutSection}>
          <TouchableOpacity
            style={[
              styles.startWorkoutButton,
              { backgroundColor: primaryColor },
            ]}
            activeOpacity={0.9}
            onPress={handleStartWorkout}
          >
            <View style={styles.startWorkoutContent}>
              <View>
                <Text style={styles.startWorkoutTitle}>
                  Start Empty Workout
                </Text>
                <Text style={styles.startWorkoutSubtitle}>Log as you go</Text>
              </View>
              <View style={styles.addIconContainer}>
                <Text style={styles.addIcon}>+</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Templates Section */}
        <View style={styles.templatesSection}>
          <View style={styles.templatesSectionHeader}>
            <Text style={[styles.templatesTitle, { color: textColor }]}>
              TEMPLATES
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={[styles.createButtonText, { color: primaryColor }]}>
                + Create New
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.templatesGrid}>
            {mockTemplates.map((template) => (
              <View key={template.id} style={styles.templateCardWrapper}>
                <TemplateCard template={template} />
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing for Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  profileContainer: {
    position: "relative",
  },
  profileBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    padding: 2,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#6b7280",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#111827",
  },
  consistencySection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  startWorkoutSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  startWorkoutButton: {
    borderRadius: 16,
    padding: 24,
    overflow: "hidden",
  },
  startWorkoutContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  startWorkoutTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  startWorkoutSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  templatesSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  templatesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  templatesTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  templateCardWrapper: {
    width: "48%",
  },
  bottomSpacing: {
    height: 100,
  },
});
