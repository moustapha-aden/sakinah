import { View, Text, StyleSheet, Animated, Pressable, Vibration, ScrollView } from "react-native";
import { useMemo, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTasbih, TARGET_OPTIONS } from "../hooks/useTasbih";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize, getLineHeight } from "../utils/textSize";
import { analytics } from "../lib/firebase";
import { getResponsiveSize, getResponsivePadding, getResponsiveMargin, isSmallScreen } from "../utils/responsive";

export default function TasbihScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);
  const { dhikrList, counts, selected, setSelected, count, target, setTarget, increment, reset } = useTasbih();
  const dhikrLabel = t(`tasbih.${dhikrList.find((d) => d.id === selected)?.translationKey || "subhanAllah"}`);
  const virtueText = t(`tasbih.virtue.${selected}`);

  useEffect(() => {
    if (analytics && analytics.logEvent) {
      analytics.logEvent("open_tasbih");
    }
  }, []);

  const countScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(countScale, {
        toValue: 1.12,
        tension: 150,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(countScale, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: (count % target) / target,
      duration: 250,
      useNativeDriver: false,
    }).start();

    if (count > 0 && count % target === 0) {
      Vibration.vibrate([0, 80, 60, 80]);
    }
  }, [count, target, selected]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const handleIncrement = () => {
    Vibration.vibrate(10);
    increment();
  };

  const handleReset = () => {
    Vibration.vibrate([0, 50, 50, 50]);
    reset();
  };

  const milestone = Math.floor(count / target) * target;
  const nextMilestone = milestone + target;
  const progress = count % target;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Titre avec icône */}
      <View style={styles.header}>
        <Ionicons name="finger-print" size={getTextSize(32, settings.textSize)} color={colors.accent} />
        <Text style={styles.headerText}>{t("tasbih.title")}</Text>
      </View>

      {/* Sélecteur de dhikr */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dhikrSelector}
        contentContainerStyle={styles.dhikrSelectorContent}
      >
        {dhikrList.map((dhikr) => {
          const isActive = dhikr.id === selected;
          return (
            <Pressable
              key={dhikr.id}
              onPress={() => setSelected(dhikr.id)}
              style={[styles.dhikrChip, isActive && styles.dhikrChipActive]}
            >
              <Text style={[styles.dhikrChipText, isActive && styles.dhikrChipTextActive]}>
                {t(`tasbih.${dhikr.translationKey}`)}
              </Text>
              <Text style={[styles.dhikrChipBadge, isActive && styles.dhikrChipBadgeActive]}>
                {counts[dhikr.id] || 0}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Cercle de progression */}
      <View style={styles.progressCircle}>
        <Animated.View style={{ transform: [{ scale: countScale }] }}>
          <LinearGradient
            colors={[colors.accent + "20", colors.accent + "10"]}
            style={styles.countCircle}
          >
            <Text style={styles.count}>{count}</Text>
            <Text style={styles.countLabel}>{t("tasbih.total")}</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Sélecteur d'objectif */}
      <View style={styles.targetSelector}>
        <Text style={styles.targetLabel}>{t("tasbih.chooseTarget")}</Text>
        <View style={styles.targetOptions}>
          {TARGET_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setTarget(option)}
              style={[styles.targetPill, target === option && styles.targetPillActive]}
            >
              <Text
                style={[
                  styles.targetPillText,
                  target === option && styles.targetPillTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Barre de progression vers le prochain jalon */}
      <View style={styles.milestoneContainer}>
        <View style={styles.milestoneHeader}>
          <Text style={styles.milestoneText}>
            {t("tasbih.progress")
              .replace("{progress}", progress.toString())
              .replace("{nextMilestone}", nextMilestone.toString())
              .replace("{target}", target.toString())}
          </Text>
          <Text style={styles.milestoneCount}>
            {t("tasbih.seriesCount")
              .replace("{count}", Math.floor(count / target).toString())
              .replace("{target}", target.toString())}
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={handleIncrement}
          style={({ pressed }: { pressed: boolean }) => [
            styles.incrementButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={[colors.accent, colors.accent + "CC"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={getTextSize(32, settings.textSize)} color="#FFFFFF" />
            <Text style={styles.incrementButtonText}>{dhikrLabel}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={handleReset}
          style={({ pressed }: { pressed: boolean }) => [
            styles.resetButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="refresh" size={getTextSize(20, settings.textSize)} color={colors.textSecondary} />
          <Text style={styles.resetButtonText}>{t("tasbih.reset")}</Text>
        </Pressable>
      </View>

      {/* Vertu du dhikr sélectionné */}
      {!!virtueText && virtueText !== `tasbih.virtue.${selected}` && (
        <View style={styles.reminderCard}>
          <Ionicons name="bulb-outline" size={getTextSize(20, settings.textSize)} color={colors.accent} />
          <Text style={styles.reminderText}>"{virtueText}"</Text>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: getResponsivePadding(20),
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },

  headerText: {
    fontSize: getTextSize(24, textSize),
    fontWeight: "700",
    color: colors.textPrimary,
  },

  // Sélecteur de dhikr
  dhikrSelector: {
    marginBottom: getResponsiveMargin(20),
    width: "100%",
    flexGrow: 0,
  },

  dhikrSelectorContent: {
    gap: 10,
    paddingHorizontal: 2,
  },

  dhikrChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  dhikrChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  dhikrChipText: {
    fontSize: getTextSize(14, textSize),
    fontWeight: "600",
    color: colors.textPrimary,
  },

  dhikrChipTextActive: {
    color: "#FFFFFF",
  },

  dhikrChipBadge: {
    fontSize: getTextSize(12, textSize),
    fontWeight: "700",
    color: colors.textSecondary,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
  },

  dhikrChipBadgeActive: {
    color: colors.accent,
    backgroundColor: "#FFFFFF",
  },

  // Sélecteur d'objectif
  targetSelector: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getResponsiveMargin(16),
  },

  targetLabel: {
    fontSize: getTextSize(13, textSize),
    color: colors.textSecondary,
    fontWeight: "600",
  },

  targetOptions: {
    flexDirection: "row",
    gap: 8,
  },

  targetPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  targetPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  targetPillText: {
    fontSize: getTextSize(13, textSize),
    fontWeight: "700",
    color: colors.textPrimary,
  },

  targetPillTextActive: {
    color: "#FFFFFF",
  },

  // Cercle de progression
  progressCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  countCircle: {
    width: getResponsiveSize(240),
    height: getResponsiveSize(240),
    borderRadius: getResponsiveSize(120),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.accent + "30",
    backgroundColor: colors.card,
    elevation: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  count: {
    fontSize: getTextSize(isSmallScreen ? 56 : 72, textSize),
    color: colors.textPrimary,
    fontWeight: "700",
  },

  countLabel: {
    fontSize: getTextSize(14, textSize),
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Jalon
  milestoneContainer: {
    width: "100%",
    marginBottom: 24,
  },

  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  milestoneText: {
    fontSize: getTextSize(14, textSize),
    color: colors.textPrimary,
    fontWeight: "600",
  },

  milestoneCount: {
    fontSize: getTextSize(14, textSize),
    color: colors.accent,
    fontWeight: "700",
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 4,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 4,
  },

  // Boutons
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },

  incrementButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  incrementButtonText: {
    fontSize: getTextSize(20, textSize),
    fontWeight: "700",
    color: "#FFFFFF",
  },

  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary + "30",
  },

  resetButtonText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
    fontWeight: "600",
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // Rappel
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.accent + "10",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    width: "100%",
  },

  reminderText: {
    flex: 1,
    fontSize: getTextSize(13, textSize),
    color: colors.textPrimary,
    lineHeight: getLineHeight(getTextSize(13, textSize)),
    fontStyle: "italic",
  },
});
