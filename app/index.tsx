import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { router, useNavigation, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLayoutEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

import QuickActionTile from "../components/QuickActionTile";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { useStats } from "../contexts/StatsContext";
import { usePrayerTimes, PRAYER_LABEL_KEYS } from "../hooks/usePrayerTimes";
import { useNotifications } from "../hooks/useNotifications";
import { getTextSize } from "../utils/textSize";
import { hadiths, quoteImages } from "../data/hadith";
import { translations } from "../utils/translations";
import { analytics } from "../lib/firebase";
import { getResponsivePadding, getResponsiveMargin, getResponsiveSize, isSmallScreen } from "../utils/responsive";

type Quote = {
  id: number;
  text: string;
  translation: string;
  source: string;
  image: any;
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { settings } = useSettings();
  const { stats, loading: statsLoading, refreshStats, getWeeklyHistory } = useStats();
  const { timings: prayerTimings, nextPrayer, countdownLabel, progressToNext } = usePrayerTimes();
  const { schedulePrayerReminders } = useNotifications();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [weeklyHistory, setWeeklyHistory] = useState<{ date: string; count: number }[]>([]);
  const [heroQuote, setHeroQuote] = useState<Quote | null>(null);
  const [dailyHadiths, setDailyHadiths] = useState<Quote[]>([]);

  // Animations en cascade des barres d'historique hebdomadaire
  const historyAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    if (weeklyHistory.length > 0) {
      Animated.stagger(
        60,
        historyAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
        )
      ).start();
    }
  }, [weeklyHistory]);

  // Animations refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const button1Translate = useRef(new Animated.Value(50)).current;
  const button2Translate = useRef(new Animated.Value(50)).current;
  const button3Translate = useRef(new Animated.Value(50)).current;
  const button4Translate = useRef(new Animated.Value(50)).current;
  const button5Translate = useRef(new Animated.Value(50)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const menuScale = useRef(new Animated.Value(0.8)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const prayerWidgetAnim = useRef(new Animated.Value(0)).current;
  const prayerWidgetScale = useRef(new Animated.Value(1)).current;
  const prayerProgressAnim = useRef(new Animated.Value(0)).current;

  // Entrée du widget prière dès que les horaires sont disponibles
  useEffect(() => {
    if (nextPrayer) {
      Animated.spring(prayerWidgetAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [nextPrayer]);

  // Progression animée vers la prochaine prière (barre, largeur => pas de native driver)
  useEffect(() => {
    Animated.timing(prayerProgressAnim, {
      toValue: progressToNext,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progressToNext]);

  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  // Date du jour localisée pour l'en-tête
  const dateLabel = useMemo(() => {
    const locale = language === "ar" ? "ar" : language === "en" ? "en-US" : "fr-FR";
    return new Date().toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [language]);

  // Obtenir les citations traduites selon la langue
  const getQuotes = useCallback((): Quote[] => {
    const currentLang = settings.language || "fr";
    const langTranslations = translations[currentLang as keyof typeof translations] || translations.fr;

    return hadiths
      .map((hadith) => {
        try {
          // Accéder directement à l'objet de traduction
          const quoteData = (langTranslations.home?.quotes as any)?.[hadith.translationKey];

          if (quoteData && typeof quoteData === 'object' && 'text' in quoteData && 'translation' in quoteData) {
            return {
              id: hadith.id,
              text: quoteData.text,
              translation: quoteData.translation,
              source: quoteData.source || '',
              image: quoteImages[hadith.imageIndex],
            };
          }
          return null;
        } catch (error) {
          console.error(`Error loading quote ${hadith.translationKey}:`, error);
          return null;
        }
      })
      .filter((quote): quote is Quote => quote !== null);
  }, [settings.language]);

  const quotes = useMemo(() => getQuotes(), [getQuotes]);

  // Recharger les stats et tirer 1 hadith vedette + 3 hadiths à chaque retour sur le home
  useFocusEffect(
    useCallback(() => {
      refreshStats();
      getWeeklyHistory().then(setWeeklyHistory);
      if (analytics && analytics.logEvent) {
        analytics.logEvent("open_home");
      }

      if (quotes.length > 0) {
        const shuffled = [...quotes].sort(() => Math.random() - 0.5);
        setHeroQuote(shuffled[0]);
        setDailyHadiths(shuffled.slice(1, 4));
      }
    }, [refreshStats, getWeeklyHistory, quotes])
  );

  // Reprogrammer les rappels de prière dès que de nouveaux horaires arrivent
  // (nouvelle position, nouvelle méthode de calcul, ou nouveau jour).
  useEffect(() => {
    if (settings.notifications && prayerTimings) {
      schedulePrayerReminders(prayerTimings, settings.language);
    }
  }, [settings.notifications, settings.language, prayerTimings, schedulePrayerReminders]);

  // Animation d'entrée au chargement
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation en cascade des boutons
    Animated.stagger(100, [
      Animated.spring(button1Translate, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(button2Translate, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(button3Translate, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(button4Translate, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(button5Translate, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animation du menu
  useEffect(() => {
    if (menuVisible) {
      Animated.parallel([
        Animated.spring(menuScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(menuScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuVisible]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const handleMenuAction = (action: string) => {
    setMenuVisible(false);

    if (action === "favorites") router.push("/settings/favorites");
    if (action === "settings") router.push("/settings/settings");
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* MODAL MENU */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  opacity: menuOpacity,
                  transform: [{ scale: menuScale }],
                },
              ]}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>{t("menu.title")}</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <Pressable
                style={styles.menuItem}
                onPress={() => handleMenuAction("favorites")}
                android_ripple={{ color: colors.accent + "20" }}
              >
                <Ionicons name="star" size={22} color={colors.accent} />
                <Text style={styles.menuItemText}>{t("menu.favorites")}</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => handleMenuAction("settings")}
                android_ripple={{ color: colors.accent + "20" }}
              >
                <Ionicons name="settings" size={22} color={colors.accent} />
                <Text style={styles.menuItemText}>{t("menu.settings")}</Text>
              </Pressable>
            </Animated.View>
          </TouchableOpacity>
        </Modal>

        {/* EN-TÊTE SALUTATION */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          <Text style={styles.greeting}>{t("home.greeting")}</Text>
          <Text style={styles.dateLine}>{dateLabel}</Text>
        </Animated.View>

        {/* PROCHAINE PRIÈRE */}
        {nextPrayer && prayerTimings && (
          <Animated.View
            style={{
              opacity: prayerWidgetAnim,
              transform: [
                {
                  translateY: prayerWidgetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-18, 0],
                  }),
                },
                { scale: prayerWidgetScale },
              ],
            }}
          >
            <Pressable
              onPress={() => {
                if (analytics && analytics.logEvent) {
                  analytics.logEvent("navigate_to_prayer_times");
                }
                router.push("/prayerTimes");
              }}
              onPressIn={() =>
                Animated.spring(prayerWidgetScale, {
                  toValue: 0.97,
                  useNativeDriver: true,
                  speed: 40,
                  bounciness: 6,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(prayerWidgetScale, {
                  toValue: 1,
                  useNativeDriver: true,
                  speed: 20,
                  bounciness: 8,
                }).start()
              }
            >
              <LinearGradient
                colors={[colors.accent, colors.accent + "D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.prayerWidget}
              >
                <View style={styles.prayerWidgetTop}>
                  <View style={styles.prayerWidgetIcon}>
                    <Ionicons name="moon" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.prayerWidgetLabel}>
                    {t("prayerTimes.nextPrayer")}
                  </Text>
                  <View style={styles.prayerWidgetTimeChip}>
                    <Ionicons name="time-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.prayerWidgetTimeChipText}>
                      {prayerTimings[nextPrayer]}
                    </Text>
                  </View>
                </View>

                <View style={styles.prayerWidgetMain}>
                  <Text style={styles.prayerWidgetName}>
                    {t(`prayerTimes.${PRAYER_LABEL_KEYS[nextPrayer]}`)}
                  </Text>
                  <View style={styles.prayerWidgetCountdownBlock}>
                    <Text style={styles.prayerWidgetCountdown}>{countdownLabel}</Text>
                    <Text style={styles.prayerWidgetCountdownHint}>
                      {t("prayerTimes.remaining")}
                    </Text>
                  </View>
                </View>

                <View style={styles.prayerWidgetProgressTrack}>
                  <Animated.View
                    style={[
                      styles.prayerWidgetProgressFill,
                      {
                        width: prayerProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* CARTE CITATION DU JOUR */}
        {heroQuote && (
          <Animated.View style={[styles.quoteCard, { opacity: quoteOpacity }]}>
            <ImageBackground
              source={heroQuote.image}
              style={styles.quoteImageBackground}
              imageStyle={styles.quoteImage}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']}
                style={styles.quoteGradient}
              >
                <View style={styles.quoteIconContainer}>
                  <Ionicons name="book-outline" size={28} color="#FFD700" />
                </View>

                <Text style={styles.quoteArabic}>{heroQuote.text}</Text>
                <Text style={styles.quoteTranslation}>{heroQuote.translation}</Text>

                <View style={styles.quoteSourceContainer}>
                  <Ionicons name="bookmark" size={16} color="#FFD700" />
                  <Text style={styles.quoteSource}>{heroQuote.source}</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Animated.View>
        )}

        {/* SECTION STATISTIQUES */}
        <Animated.View style={[styles.statsSection, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#FF6B6B" />
            <Text style={styles.statNumber}>{statsLoading ? "..." : stats.streakDays}</Text>
            <Text style={styles.statLabel}>{t("home.streakDays")}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4ECDC4" />
            <Text style={styles.statNumber}>{statsLoading ? "..." : stats.completedAdkar}</Text>
            <Text style={styles.statLabel}>{t("home.completedAdkar")}</Text>
          </View>
        </Animated.View>

        {/* HISTORIQUE DE LA SEMAINE */}
        {weeklyHistory.length > 0 && (
          <View style={styles.weeklySection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={22} color={colors.accent} />
              <Text style={styles.sectionTitle}>{t("home.weeklyHistory")}</Text>
            </View>
            <View style={styles.weeklyRow}>
              {weeklyHistory.map((day, index) => {
                const ratio = day.count / 3;
                const weekdayLabel = new Date(day.date).toLocaleDateString(
                  language === "ar" ? "ar" : language === "en" ? "en-US" : "fr-FR",
                  { weekday: "short" }
                );
                const isToday = day.date === new Date().toDateString();
                return (
                  <Animated.View
                    key={day.date}
                    style={[
                      styles.weeklyDayColumn,
                      {
                        opacity: historyAnims[index],
                        transform: [
                          {
                            translateY: historyAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [16, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
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
                    <Text style={[styles.weeklyDayLabel, isToday && styles.weeklyDayLabelToday]}>
                      {weekdayLabel}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}

        {/* ACCÈS RAPIDE */}
        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>{t("home.quickAccess")}</Text>
          </View>

          <View style={styles.quickAccessRow}>
            <Animated.View
              style={[
                styles.quickAccessItem,
                { transform: [{ translateY: button1Translate }], opacity: fadeAnim },
              ]}
            >
              <QuickActionTile
                label={t("home.adkarShort")}
                icon="star-crescent"
                iconFamily="material-community"
                gradient={["#34C77B", "#1FA36B"]}
                onPress={() => {
                  if (analytics && analytics.logEvent) {
                    analytics.logEvent("navigate_to_adkar");
                  }
                  router.push("/adkar");
                }}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.quickAccessItem,
                { transform: [{ translateY: button2Translate }], opacity: fadeAnim },
              ]}
            >
              <QuickActionTile
                label={t("home.duaShort")}
                icon="hands-pray"
                iconFamily="material-community"
                gradient={["#5B9CF5", "#3C7BE0"]}
                onPress={() => {
                  if (analytics && analytics.logEvent) {
                    analytics.logEvent("navigate_to_dua");
                  }
                  router.push("/dua");
                }}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.quickAccessItem,
                { transform: [{ translateY: button3Translate }], opacity: fadeAnim },
              ]}
            >
              <QuickActionTile
                label={t("home.tasbihShort")}
                icon="dots-circle"
                iconFamily="material-community"
                gradient={["#9B7BF5", "#7B5BE0"]}
                onPress={() => {
                  if (analytics && analytics.logEvent) {
                    analytics.logEvent("navigate_to_tasbih");
                  }
                  router.push("/tasbih");
                }}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.quickAccessItem,
                { transform: [{ translateY: button4Translate }], opacity: fadeAnim },
              ]}
            >
              <QuickActionTile
                label={t("home.prayerTimesShort")}
                icon="mosque"
                iconFamily="material-community"
                gradient={["#E6B65C", "#D19E3C"]}
                onPress={() => {
                  if (analytics && analytics.logEvent) {
                    analytics.logEvent("navigate_to_prayer_times");
                  }
                  router.push("/prayerTimes");
                }}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.quickAccessItem,
                { transform: [{ translateY: button5Translate }], opacity: fadeAnim },
              ]}
            >
              <QuickActionTile
                label={t("home.qiblaShort")}
                icon="compass"
                iconFamily="material-community"
                gradient={["#2BB3A3", "#1A9384"]}
                onPress={() => {
                  if (analytics && analytics.logEvent) {
                    analytics.logEvent("navigate_to_qibla");
                  }
                  router.push("/qibla");
                }}
              />
            </Animated.View>
          </View>
        </View>

        {/* SECTION HADITHS RAPIDES */}
        <Animated.View style={[styles.hadithsSection, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="library" size={24} color={colors.accent} />
            <Text style={styles.sectionTitle}>{t("home.hadithsOfDay")}</Text>
          </View>

          {dailyHadiths.length > 0 ? (
            dailyHadiths.map((quote) => (
              <View key={quote.id} style={styles.hadithCard}>
                <View style={styles.hadithIcon}>
                  <Ionicons name="book" size={20} color={colors.accent} />
                </View>
                <View style={styles.hadithContent}>
                  <Text style={styles.hadithText} numberOfLines={2}>
                    {quote.translation}
                  </Text>
                  <Text style={styles.hadithSource}>{quote.source}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.hadithCard}>
              <Text style={styles.hadithText}>Chargement...</Text>
            </View>
          )}
        </Animated.View>

        {/* PIED DE PAGE INSPIRANT */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Ionicons name="heart" size={16} color="#FF6B6B" />
          <Text style={styles.footerText}>
            "{t("home.footerQuote")}"
          </Text>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: getResponsivePadding(20),
  },

  header: {
    marginTop: getResponsiveMargin(8),
    marginBottom: getResponsiveMargin(18),
  },

  greeting: {
    fontSize: getTextSize(isSmallScreen ? 22 : 26, textSize),
    color: colors.textPrimary,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  dateLine: {
    fontSize: getTextSize(13, textSize),
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },

  // WIDGET PROCHAINE PRIÈRE
  prayerWidget: {
    borderRadius: getResponsiveSize(18),
    padding: getResponsivePadding(16),
    marginBottom: getResponsiveMargin(16),
    elevation: 6,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },

  prayerWidgetTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  prayerWidgetIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },

  prayerWidgetLabel: {
    flex: 1,
    fontSize: getTextSize(11, textSize),
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },

  prayerWidgetTimeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  prayerWidgetTimeChipText: {
    fontSize: getTextSize(12, textSize),
    color: "#FFFFFF",
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },

  prayerWidgetMain: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: getResponsiveMargin(12),
    gap: 12,
  },

  prayerWidgetName: {
    flex: 1,
    fontSize: getTextSize(24, textSize),
    color: "#FFFFFF",
    fontWeight: "800",
  },

  prayerWidgetCountdownBlock: {
    alignItems: "flex-end",
  },

  prayerWidgetCountdown: {
    fontSize: getTextSize(22, textSize),
    color: "#FFFFFF",
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.5,
  },

  prayerWidgetCountdownHint: {
    fontSize: getTextSize(10, textSize),
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 1,
  },

  prayerWidgetProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginTop: getResponsiveMargin(14),
    overflow: "hidden",
  },

  prayerWidgetProgressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },

  // CARTE CITATION
  quoteCard: {
    height: isSmallScreen ? 180 : 220,
    borderRadius: getResponsiveSize(20),
    overflow: "hidden",
    marginBottom: getResponsiveMargin(20),
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  quoteImageBackground: {
    flex: 1,
  },

  quoteImage: {
    borderRadius: 20,
  },

  quoteGradient: {
    flex: 1,
    padding: getResponsivePadding(20),
    justifyContent: "center",
  },

  quoteIconContainer: {
    alignSelf: "center",
    marginBottom: 12,
  },

  quoteArabic: {
    fontSize: getTextSize(20, textSize),
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 32,
  },

  quoteTranslation: {
    fontSize: getTextSize(14, textSize),
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
    lineHeight: 20,
  },

  quoteSourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  quoteSource: {
    fontSize: getTextSize(12, textSize),
    color: "#FFD700",
    fontWeight: "600",
  },

  // STATISTIQUES
  statsSection: {
    flexDirection: "row",
    gap: getResponsiveSize(12),
    marginBottom: getResponsiveMargin(20),
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: getResponsivePadding(16),
    borderRadius: getResponsiveSize(16),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  statNumber: {
    fontSize: getTextSize(24, textSize),
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 8,
  },

  statLabel: {
    fontSize: getTextSize(12, textSize),
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  // HISTORIQUE DE LA SEMAINE
  weeklySection: {
    marginBottom: getResponsiveMargin(20),
  },

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

  // ACCÈS RAPIDE
  quickAccessSection: {
    marginBottom: getResponsiveMargin(24),
  },

  quickAccessRow: {
    flexDirection: "row",
    gap: getResponsiveSize(8),
  },

  quickAccessItem: {
    flex: 1,
  },

  // SECTION HADITHS
  hadithsSection: {
    marginBottom: 20,
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

  hadithCard: {
    backgroundColor: colors.card,
    padding: getResponsivePadding(14),
    borderRadius: getResponsiveSize(12),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: getResponsiveMargin(10),
    flexDirection: "row",
    gap: getResponsiveSize(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  hadithIcon: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: colors.accent + "15",
    justifyContent: "center",
    alignItems: "center",
  },

  hadithContent: {
    flex: 1,
  },

  hadithText: {
    fontSize: getTextSize(14, textSize),
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },

  hadithSource: {
    fontSize: getTextSize(11, textSize),
    color: colors.textSecondary,
    fontStyle: "italic",
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.card + "80",
    borderRadius: 12,
    marginBottom: 20,
  },

  footerText: {
    fontSize: getTextSize(12, textSize),
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    flex: 1,
  },

  // MODAL MENU
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  menuContainer: {
    backgroundColor: colors.card,
    width: "80%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  menuTitle: {
    fontSize: getTextSize(18, textSize),
    fontWeight: "600",
    color: colors.textPrimary,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  menuItemText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textPrimary,
  },
});