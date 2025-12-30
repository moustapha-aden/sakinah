import { View, Text, StyleSheet, Animated, Pressable, Vibration, ScrollView } from "react-native";
import { useMemo, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppButton from "../components/AppButton";
import { usetasbih } from "../hooks/usetasbih";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize, getLineHeight } from "../utils/textSize";
import { analytics } from "../lib/firebase";
import { getResponsiveSize, getResponsivePadding, getResponsiveMargin, isSmallScreen } from "../utils/responsive";

export default function tasbihScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);
  const { count, increment, reset } = usetasbih();

  useEffect(() => {
    if (analytics && analytics.logEvent) {
      analytics.logEvent("open_tasbih");
    }
  }, []);

  // Animations
  const countScale = useRef(new Animated.Value(1)).current;
  const countOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  // Animation du compteur à chaque changement
  useEffect(() => {
    // Animation de pulse pour le compteur
    Animated.sequence([
      Animated.parallel([
        Animated.spring(countScale, {
          toValue: 1.3,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(countOpacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(countScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(countOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animation de l'effet ripple
    rippleScale.setValue(0);
    rippleOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de la barre de progression
    Animated.timing(progressAnim, {
      toValue: (count % 33) / 33,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Confetti animation pour les multiples de 33
    if (count > 0 && count % 33 === 0) {
      triggerConfetti();
      Vibration.vibrate([0, 100, 50, 100]);
    }
  }, [count]);

  // Animation de pulse continue
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const triggerConfetti = () => {
    confettiAnims.forEach((anim, index) => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.opacity.setValue(1);
      anim.rotate.setValue(0);

      const angle = (index * 45) * Math.PI / 180;
      const distance = 150;

      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: Math.sin(angle) * distance,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: Math.cos(angle) * distance,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: 360,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleIncrement = () => {
    Vibration.vibrate(10);
    increment();
  };

  const handleReset = () => {
    Vibration.vibrate([0, 50, 50, 50]);
    
    // Animation de rotation pour le reset
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
      reset();
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const milestone = Math.floor(count / 33) * 33;
  const nextMilestone = milestone + 33;
  const progress = count % 33;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Confetti particles */}
      <View style={styles.confettiContainer}>
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'][index % 4],
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  { rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Titre avec icône */}
      <View style={styles.header}>
        <Ionicons name="finger-print" size={getTextSize(32, settings.textSize)} color={colors.accent} />
        <Text style={styles.headerText}>{t("tasbih.title")}</Text>
      </View>

      {/* Cercle de progression */}
      <Animated.View
        style={[
          styles.progressCircle,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Effet ripple */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
              borderColor: colors.accent,
            },
          ]}
        />

        {/* Compteur principal */}
        <Animated.View
          style={{
            transform: [
              { scale: countScale },
              { rotate: rotateInterpolate },
            ],
            opacity: countOpacity,
          }}
        >
          <LinearGradient
            colors={[colors.accent + "20", colors.accent + "10"]}
            style={styles.countCircle}
          >
            <Text style={styles.count}>{count}</Text>
            <Text style={styles.countLabel}>{t("tasbih.total")}</Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Barre de progression vers le prochain jalon */}
      <View style={styles.milestoneContainer}>
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneInfo}>
            <Ionicons name="trophy" size={getTextSize(20, settings.textSize)} color={colors.accent} />
            <Text style={styles.milestoneText}>
              {t("tasbih.progress").replace("{progress}", progress.toString()).replace("{nextMilestone}", nextMilestone.toString())}
            </Text>
          </View>
          <Text style={styles.milestoneCount}>
            {t("tasbih.seriesCount").replace("{count}", Math.floor(count / 33).toString())}
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

      {/* Statistiques rapides */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="today" size={getTextSize(24, settings.textSize)} color="#4ECDC4" />
          <Text style={styles.statNumber}>{count}</Text>
          <Text style={styles.statLabel}>{t("tasbih.today")}</Text>
        </View>

        <View style={styles.statBox}>
          <Ionicons name="star" size={getTextSize(24, settings.textSize)} color="#FFD700" />
          <Text style={styles.statNumber}>{Math.floor(count / 33)}</Text>
          <Text style={styles.statLabel}>{t("tasbih.series")}</Text>
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={handleIncrement}
          style={({ pressed }) => [
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
            <Ionicons name="add" size={getTextSize(48, settings.textSize)} color="#FFFFFF" />
            <Text style={styles.incrementButtonText}>{t("tasbih.subhanAllah")}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="refresh" size={getTextSize(24, settings.textSize)} color={colors.textSecondary} />
          <Text style={styles.resetButtonText}>{t("tasbih.reset")}</Text>
        </Pressable>
      </View>

      {/* Rappel inspirant */}
      <View style={styles.reminderCard}>
        <Ionicons name="bulb-outline" size={getTextSize(20, settings.textSize)} color={colors.accent} />
        <Text style={styles.reminderText}>
          "{t("tasbih.reminder")}"
        </Text>
      </View>
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

  // Confetti
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  confetti: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Cercle de progression
  progressCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    position: "relative",
  },

  ripple: {
    position: "absolute",
    width: getResponsiveSize(280),
    height: getResponsiveSize(280),
    borderRadius: getResponsiveSize(140),
    borderWidth: 3,
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

  milestoneInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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

  // Statistiques
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },

  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  statNumber: {
    fontSize: getTextSize(28, textSize),
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 8,
  },

  statLabel: {
    fontSize: getTextSize(12, textSize),
    color: colors.textSecondary,
    marginTop: 4,
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
  },

  reminderText: {
    flex: 1,
    fontSize: getTextSize(13, textSize),
    color: colors.textPrimary,
    lineHeight: getLineHeight(getTextSize(13, textSize)),
    fontStyle: "italic",
  },
});