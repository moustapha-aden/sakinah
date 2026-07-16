import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { useStats, type DayHistory } from "../contexts/StatsContext";
import { getTextSize } from "../utils/textSize";
import { analytics } from "../lib/firebase";
import {
  SCREEN_WIDTH,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveSize,
} from "../utils/responsive";

// Nombre de jours couverts par la grille calendrier
const HISTORY_DAYS = 30;

// Taille d'une case de la grille : 7 colonnes dans la carte
const GRID_GAP = 6;
const GRID_CONTENT_WIDTH =
  SCREEN_WIDTH - getResponsivePadding(20) * 2 - getResponsivePadding(14) * 2;
const GRID_CELL = Math.floor((GRID_CONTENT_WIDTH - GRID_GAP * 6) / 7);

export default function StatsScreen() {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { settings } = useSettings();
  const { stats, loading: statsLoading, refreshStats, getHistory } = useStats();
  const styles = useMemo(
    () => createStyles(colors, settings.textSize),
    [colors, settings.textSize]
  );

  const [history, setHistory] = useState<DayHistory[]>([]);

  const locale = language === "ar" ? "ar" : language === "en" ? "en-US" : "fr-FR";
  const todayStr = new Date().toDateString();

  useFocusEffect(
    useCallback(() => {
      refreshStats();
      getHistory(HISTORY_DAYS).then(setHistory);
      if (analytics && analytics.logEvent) {
        analytics.logEvent("open_stats");
      }
    }, [refreshStats, getHistory])
  );

  // Graphe : 7 derniers jours, barres en cascade
  const last7 = history.slice(-7);
  const weekAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    if (last7.length > 0) {
      Animated.stagger(
        60,
        weekAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
        )
      ).start();
    }
  }, [history]);

  const maxCount = Math.max(...history.map((day) => day.count), 1);
  const activeDays = history.filter((day) => day.count > 0).length;
  const hasActivity = activeDays > 0;

  // Couleur d'une case selon l'intensité du jour (style habit tracker)
  const cellColor = (count: number): string => {
    if (count <= 0) return colors.background;
    const ratio = count / maxCount;
    if (ratio <= 0.34) return colors.accent + "45";
    if (ratio <= 0.67) return colors.accent + "90";
    return colors.accent;
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      {/* RÉSUMÉ : 3 indicateurs dans une seule carte */}
      <View style={styles.heroCard}>
        <View style={styles.heroItem}>
          <Ionicons name="flame" size={24} color="#FF6B6B" />
          <Text style={styles.heroValue}>{statsLoading ? "…" : stats.streakDays}</Text>
          <Text style={styles.heroLabel}>{t("home.streakDays")}</Text>
        </View>

        <View style={styles.heroDivider} />

        <View style={styles.heroItem}>
          <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
          <Text style={styles.heroValue}>{statsLoading ? "…" : stats.completedAdkar}</Text>
          <Text style={styles.heroLabel}>{t("home.completedAdkar")}</Text>
        </View>

        <View style={styles.heroDivider} />

        <View style={styles.heroItem}>
          <Ionicons name="calendar" size={24} color={colors.accent} />
          <Text style={styles.heroValue}>
            {activeDays}
            <Text style={styles.heroValueMuted}>/{HISTORY_DAYS}</Text>
          </Text>
          <Text style={styles.heroLabel}>{t("stats.activeDays")}</Text>
        </View>
      </View>

      {!hasActivity ? (
        /* ÉTAT VIDE */
        <View style={styles.emptyCard}>
          <Ionicons name="sparkles-outline" size={36} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t("stats.empty")}</Text>
        </View>
      ) : (
        <>
          {/* 7 DERNIERS JOURS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>{t("stats.last7Days")}</Text>
            </View>
            <View style={styles.weeklyRow}>
              {last7.map((day, index) => {
                const ratio = day.count / maxCount;
                const weekdayLabel = new Date(day.date).toLocaleDateString(locale, {
                  weekday: "short",
                });
                const isToday = day.date === todayStr;
                return (
                  <Animated.View
                    key={day.date}
                    style={[
                      styles.weeklyDayColumn,
                      {
                        opacity: weekAnims[index],
                        transform: [
                          {
                            translateY: weekAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [16, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.weeklyCount}>{day.count > 0 ? day.count : ""}</Text>
                    <View style={styles.weeklyBarTrack}>
                      <View
                        style={[
                          styles.weeklyBarFill,
                          {
                            height: `${Math.max(ratio * 100, day.count > 0 ? 12 : 0)}%`,
                            backgroundColor: day.count > 0 ? colors.accent : colors.border,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.weeklyDayLabel, isToday && styles.weeklyDayLabelToday]}
                    >
                      {weekdayLabel}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* GRILLE DES 30 DERNIERS JOURS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="grid" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>{t("stats.last30Days")}</Text>
            </View>

            <View style={styles.gridCard}>
              <View style={styles.grid}>
                {history.map((day) => {
                  const date = new Date(day.date);
                  const isToday = day.date === todayStr;
                  const filled = day.count > 0;
                  return (
                    <View
                      key={day.date}
                      style={[
                        styles.gridCell,
                        { backgroundColor: cellColor(day.count) },
                        isToday && styles.gridCellToday,
                      ]}
                    >
                      <Text style={[styles.gridDayNum, filled && styles.gridDayNumFilled]}>
                        {date.getDate()}
                      </Text>
                      {filled && <Text style={styles.gridCount}>{day.count}</Text>}
                    </View>
                  );
                })}
              </View>

              {/* Légende */}
              <View style={styles.legendRow}>
                <Text style={styles.legendText}>{t("stats.legendLess")}</Text>
                {[colors.background, colors.accent + "45", colors.accent + "90", colors.accent].map(
                  (color, index) => (
                    <View key={index} style={[styles.legendSwatch, { backgroundColor: color }]} />
                  )
                )}
                <Text style={styles.legendText}>{t("stats.legendMore")}</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any, textSize: any) =>
  StyleSheet.create({
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      padding: getResponsivePadding(20),
      paddingBottom: getResponsivePadding(32),
    },

    // CARTE RÉSUMÉ
    heroCard: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(16),
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: getResponsivePadding(16),
      marginBottom: getResponsiveMargin(20),
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },

    heroItem: {
      flex: 1,
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 4,
    },

    heroDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },

    heroValue: {
      fontSize: getTextSize(22, textSize),
      fontWeight: "800",
      color: colors.textPrimary,
      fontVariant: ["tabular-nums"],
    },

    heroValueMuted: {
      fontSize: getTextSize(13, textSize),
      color: colors.textSecondary,
      fontWeight: "600",
    },

    heroLabel: {
      fontSize: getTextSize(10, textSize),
      color: colors.textSecondary,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },

    section: {
      marginBottom: getResponsiveMargin(20),
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: getTextSize(14, textSize),
      fontWeight: "700",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },

    // GRAPHE 7 JOURS
    weeklyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(16),
      borderWidth: 1,
      borderColor: colors.border,
      padding: getResponsivePadding(16),
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },

    weeklyDayColumn: {
      alignItems: "center",
      gap: 6,
      flex: 1,
    },

    weeklyCount: {
      fontSize: getTextSize(11, textSize),
      color: colors.textSecondary,
      fontWeight: "700",
      height: getTextSize(14, textSize),
      fontVariant: ["tabular-nums"],
    },

    weeklyBarTrack: {
      width: 10,
      height: 56,
      borderRadius: 5,
      backgroundColor: colors.background,
      justifyContent: "flex-end",
      overflow: "hidden",
    },

    weeklyBarFill: {
      width: "100%",
      borderRadius: 5,
    },

    weeklyDayLabel: {
      fontSize: getTextSize(11, textSize),
      color: colors.textSecondary,
      textTransform: "capitalize",
    },

    weeklyDayLabelToday: {
      color: colors.accent,
      fontWeight: "700",
    },

    // GRILLE 30 JOURS
    gridCard: {
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(16),
      borderWidth: 1,
      borderColor: colors.border,
      padding: getResponsivePadding(14),
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: GRID_GAP,
    },

    gridCell: {
      width: GRID_CELL,
      height: GRID_CELL,
      borderRadius: getResponsiveSize(10),
      alignItems: "center",
      justifyContent: "center",
    },

    gridCellToday: {
      borderWidth: 2,
      borderColor: colors.accent,
    },

    gridDayNum: {
      fontSize: getTextSize(10, textSize),
      color: colors.textSecondary,
      fontVariant: ["tabular-nums"],
    },

    gridDayNumFilled: {
      color: "#1F2A44",
      opacity: 0.75,
    },

    gridCount: {
      fontSize: getTextSize(13, textSize),
      fontWeight: "800",
      color: "#1F2A44",
      fontVariant: ["tabular-nums"],
      marginTop: -1,
    },

    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 5,
      marginTop: getResponsiveMargin(12),
    },

    legendSwatch: {
      width: 12,
      height: 12,
      borderRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },

    legendText: {
      fontSize: getTextSize(10, textSize),
      color: colors.textSecondary,
      marginHorizontal: 3,
    },

    // ÉTAT VIDE
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(16),
      borderWidth: 1,
      borderColor: colors.border,
      padding: getResponsivePadding(28),
      alignItems: "center",
      gap: 12,
    },

    emptyText: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });
