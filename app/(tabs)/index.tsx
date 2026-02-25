import { ThemedView } from "@/components/themed-view";
import { ConsistencyCard } from "@/components/workout/consistency-card";
import { TemplateCard } from "@/components/workout/template-card";
import { useWorkout } from "@/contexts/workout-context";
import { mockTemplates } from "@/data/mock-templates";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
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

  const [isMyTemplatesExpanded, setIsMyTemplatesExpanded] = useState(true);
  const [isExampleTemplatesExpanded, setIsExampleTemplatesExpanded] =
    useState(true);

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
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            START WORKOUT
          </Text>
        </View>

        {/* Consistency Card */}
        <View style={styles.consistencySection}>
          <ConsistencyCard completedDays={4} totalDays={5} />
        </View>

        {/* Start Empty Workout Button */}
        <View style={styles.startWorkoutSection}>
          <Text style={[styles.sectionSubheadline, { color: textColor }]}>
            QUICK START
          </Text>
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
        <View style={styles.templatesMainSection}>
          {/* Templates Header with Actions */}
          <View style={styles.templatesMainHeader}>
            <Text style={[styles.templatesMainTitle, { color: textColor }]}>
              TEMPLATES
            </Text>
            <View style={styles.templatesActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={[styles.iconButtonText, { color: textColor }]}>
                  +
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={[styles.iconButtonText, { color: textColor }]}>
                  📁
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={[styles.iconButtonText, { color: textColor }]}>
                  ...
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* My Templates Section */}
          <View style={styles.templatesSubSection}>
            <TouchableOpacity
              style={styles.subSectionHeader}
              onPress={() => setIsMyTemplatesExpanded(!isMyTemplatesExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.subSectionLeft}>
                <Text style={[styles.subSectionTitle, { color: textColor }]}>
                  MY TEMPLATES
                </Text>
                <Text
                  style={[
                    styles.templateCount,
                    { color: textColor, opacity: 0.5 },
                  ]}
                >
                  ({mockTemplates.length})
                </Text>
              </View>
              <View style={styles.subSectionRight}>
                <TouchableOpacity style={styles.iconButton}>
                  <Text style={[styles.iconButtonText, { color: textColor }]}>
                    ...
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.collapseIcon, { color: textColor }]}>
                  {isMyTemplatesExpanded ? "−" : "+"}
                </Text>
              </View>
            </TouchableOpacity>

            {isMyTemplatesExpanded && (
              <View style={styles.templatesGrid}>
                {mockTemplates.map((template) => (
                  <View key={template.id} style={styles.templateCardWrapper}>
                    <TemplateCard template={template} />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Example Templates Section */}
          <View style={styles.templatesSubSection}>
            <TouchableOpacity
              style={styles.subSectionHeader}
              onPress={() =>
                setIsExampleTemplatesExpanded(!isExampleTemplatesExpanded)
              }
              activeOpacity={0.7}
            >
              <View style={styles.subSectionLeft}>
                <Text style={[styles.subSectionTitle, { color: textColor }]}>
                  EXAMPLE TEMPLATES
                </Text>
                <Text
                  style={[
                    styles.templateCount,
                    { color: textColor, opacity: 0.5 },
                  ]}
                >
                  ({mockTemplates.slice(0, 2).length})
                </Text>
              </View>
              <View style={styles.subSectionRight}>
                <TouchableOpacity style={styles.iconButton}>
                  <Text style={[styles.iconButtonText, { color: textColor }]}>
                    ...
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.collapseIcon, { color: textColor }]}>
                  {isExampleTemplatesExpanded ? "−" : "+"}
                </Text>
              </View>
            </TouchableOpacity>

            {isExampleTemplatesExpanded && (
              <View style={styles.templatesGrid}>
                {mockTemplates.slice(0, 2).map((template) => (
                  <View key={template.id} style={styles.templateCardWrapper}>
                    <TemplateCard template={template} />
                  </View>
                ))}
              </View>
            )}
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
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  consistencySection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  startWorkoutSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionSubheadline: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.6,
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
  templatesMainSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  templatesMainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  templatesMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  templatesActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonText: {
    fontSize: 20,
    fontWeight: "600",
  },
  templatesSubSection: {
    marginBottom: 24,
  },
  subSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subSectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  templateCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  subSectionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  collapseIcon: {
    fontSize: 24,
    fontWeight: "700",
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
    height: 24,
  },
});
