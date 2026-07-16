import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
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
import { usePrayerTimes, PRAYER_LABEL_KEYS, type RealPrayer } from "../hooks/usePrayerTimes";
import { useNotifications } from "../hooks/useNotifications";
import { getTextSize } from "../utils/textSize";
import { hadiths, quoteImages } from "../data/hadith";
import { translations } from "../utils/translations";
import { analytics } from "../lib/firebase";
import { getResponsivePadding, getResponsiveMargin, getResponsiveSize, isSmallScreen, SCREEN_WIDTH } from "../utils/responsive";

// Accès rapide : 4 tuiles pleines visibles, les suivantes se découvrent en scrollant
const QUICK_GAP = getResponsiveSize(10);
const QUICK_PADDING = getResponsivePadding(20);
const QUICK_TILE_WIDTH = (SCREEN_WIDTH - QUICK_PADDING * 2 - QUICK_GAP * 3) / 4;

// Ciel du widget prière : la période avant chaque prière a sa propre lumière
type SkyTheme = {
  gradient: [string, string, string];
  icon: string;
  body: {
    size: number;
    top?: number;
    bottom?: number;
    right: number;
    core: string;
    glow: string;
  };
  stars: boolean;
};

const SKY_THEMES: Record<RealPrayer, SkyTheme> = {
  // Nuit profonde (après l'Isha) : lune et étoiles
  Fajr: {
    gradient: ["#0D1B3E", "#1A2C5B", "#2C4A80"],
    icon: "moon",
    body: { size: 52, top: 12, right: 26, core: "#F2F5F9", glow: "#BFD4F2" },
    stars: true,
  },
  // Matinée : soleil doré qui monte dans un ciel bleu
  Dhuhr: {
    gradient: ["#3E63A8", "#6E97CB", "#E8B86B"],
    icon: "partly-sunny",
    body: { size: 56, bottom: 8, right: 28, core: "#FFD873", glow: "#FFC14D" },
    stars: false,
  },
  // Plein jour : soleil haut et éclatant
  Asr: {
    gradient: ["#0E6FB8", "#2E96D8", "#5CB8E8"],
    icon: "sunny",
    body: { size: 60, top: 6, right: 22, core: "#FFE066", glow: "#FFD34D" },
    stars: false,
  },
  // Heure dorée : le soleil descend vers l'horizon
  Maghrib: {
    gradient: ["#B85C1E", "#DE8038", "#F2B25C"],
    icon: "sunny",
    body: { size: 58, bottom: 2, right: 26, core: "#FFD873", glow: "#FFAD42" },
    stars: false,
  },
  // Nuit tombée (après le Maghrib) : lune montante et étoiles
  Isha: {
    gradient: ["#1D1740", "#332560", "#54398A"],
    icon: "moon",
    body: { size: 52, top: 14, right: 26, core: "#F2F5F9", glow: "#C9B8E8" },
    stars: true,
  },
};

// Petites étoiles semées dans le widget (thèmes nocturnes uniquement)
const WIDGET_STARS = [
  { top: 14, left: "7%", size: 2.5 },
  { top: 34, left: "16%", size: 2 },
  { top: 10, left: "30%", size: 2 },
  { top: 48, left: "42%", size: 2.5 },
  { top: 24, left: "55%", size: 2 },
  { top: 58, left: "66%", size: 2 },
  { top: 18, left: "78%", size: 2.5 },
] as const;

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
  const { stats, loading: statsLoading, refreshStats } = useStats();
  const { timings: prayerTimings, nextPrayer, countdownLabel, progressToNext } = usePrayerTimes();
  const { schedulePrayerReminders } = useNotifications();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [heroQuote, setHeroQuote] = useState<Quote | null>(null);
  const [dailyHadiths, setDailyHadiths] = useState<Quote[]>([]);

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

  // Ciel du widget selon la prochaine prière + pulsation douce du soleil/de la lune
  const sky = SKY_THEMES[nextPrayer ?? "Fajr"];
  const sunGlowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sunGlowAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sunGlowAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

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
      if (analytics && analytics.logEvent) {
        analytics.logEvent("open_home");
      }

      if (quotes.length > 0) {
        const shuffled = [...quotes].sort(() => Math.random() - 0.5);
        setHeroQuote(shuffled[0]);
        setDailyHadiths(shuffled.slice(1, 4));
      }
    }, [refreshStats, quotes])
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

        {/* EN-TÊTE SALUTATION (uniquement si le widget prière n'est pas affiché,
            sinon la salutation vit dans le widget) */}
        {!(nextPrayer && prayerTimings) && (
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
        )}

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
                colors={sky.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.prayerWidget, { shadowColor: sky.gradient[1] }]}
              >
                {/* Ciel décoratif : étoiles + soleil/lune selon le moment */}
                <View style={styles.skyDecor} pointerEvents="none">
                  {sky.stars &&
                    WIDGET_STARS.map((star, index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.star,
                          {
                            top: star.top,
                            left: star.left,
                            width: star.size,
                            height: star.size,
                            borderRadius: star.size / 2,
                            opacity: sunGlowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: index % 2 === 0 ? [0.9, 0.35] : [0.35, 0.9],
                            }),
                          },
                        ]}
                      />
                    ))}

                  <View
                    style={[
                      styles.celestialZone,
                      {
                        width: sky.body.size * 2,
                        height: sky.body.size * 2,
                        right: sky.body.right,
                        ...(sky.body.top != null ? { top: sky.body.top } : {}),
                        ...(sky.body.bottom != null ? { bottom: sky.body.bottom } : {}),
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.celestialCircle,
                        {
                          width: sky.body.size * 2,
                          height: sky.body.size * 2,
                          borderRadius: sky.body.size,
                          backgroundColor: sky.body.glow,
                          opacity: sunGlowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.16, 0.28],
                          }),
                          transform: [
                            {
                              scale: sunGlowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.12],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.celestialCircle,
                        {
                          width: sky.body.size * 1.4,
                          height: sky.body.size * 1.4,
                          borderRadius: sky.body.size * 0.7,
                          backgroundColor: sky.body.glow,
                          opacity: sunGlowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.28, 0.42],
                          }),
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.celestialCircle,
                        {
                          width: sky.body.size,
                          height: sky.body.size,
                          borderRadius: sky.body.size / 2,
                          backgroundColor: sky.body.core,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* SALUTATION */}
                <View style={styles.prayerWidgetGreetingBlock}>
                  <Text style={styles.prayerWidgetGreeting}>{t("home.greeting")}</Text>
                  <Text style={styles.prayerWidgetDate}>{dateLabel}</Text>
                </View>

                <View style={styles.prayerWidgetTop}>
                  <View style={styles.prayerWidgetIcon}>
                    <Ionicons name={sky.icon as any} size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.prayerWidgetLabel}>
                    {t("prayerTimes.nextPrayer")}
                  </Text>
                </View>

                <View style={styles.prayerWidgetMain}>
                  <View style={styles.prayerWidgetNameBlock}>
                    <Text style={styles.prayerWidgetName}>
                      {t(`prayerTimes.${PRAYER_LABEL_KEYS[nextPrayer]}`)}
                    </Text>
                    <View style={styles.prayerWidgetTimeChip}>
                      <Ionicons name="time-outline" size={13} color="#FFFFFF" />
                      <Text style={styles.prayerWidgetTimeChipText}>
                        {prayerTimings[nextPrayer]}
                      </Text>
                    </View>
                  </View>
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

        {/* SECTION STATISTIQUES (touche une carte pour ouvrir l'historique) */}
        <Animated.View style={[styles.statsSection, { opacity: fadeAnim }]}>
          <Pressable
            style={styles.statCard}
            onPress={() => {
              if (analytics && analytics.logEvent) {
                analytics.logEvent("navigate_to_stats");
              }
              router.push("/stats");
            }}
            android_ripple={{ color: colors.accent + "20" }}
          >
            <Ionicons name="flame" size={32} color="#FF6B6B" />
            <Text style={styles.statNumber}>{statsLoading ? "..." : stats.streakDays}</Text>
            <Text style={styles.statLabel}>{t("home.streakDays")}</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.textSecondary}
              style={styles.statCardChevron}
            />
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() => {
              if (analytics && analytics.logEvent) {
                analytics.logEvent("navigate_to_stats");
              }
              router.push("/stats");
            }}
            android_ripple={{ color: colors.accent + "20" }}
          >
            <Ionicons name="checkmark-circle" size={32} color="#4ECDC4" />
            <Text style={styles.statNumber}>{statsLoading ? "..." : stats.completedAdkar}</Text>
            <Text style={styles.statLabel}>{t("home.completedAdkar")}</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.textSecondary}
              style={styles.statCardChevron}
            />
          </Pressable>
        </Animated.View>

        {/* ACCÈS RAPIDE */}
        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>{t("home.quickAccess")}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickAccessScroll}
            contentContainerStyle={styles.quickAccessRow}
          >
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
          </ScrollView>
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
    overflow: "hidden",
    elevation: 6,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },

  // Ciel décoratif du widget (étoiles + soleil/lune)
  skyDecor: {
    ...StyleSheet.absoluteFillObject,
  },

  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },

  celestialZone: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  celestialCircle: {
    position: "absolute",
  },

  prayerWidgetGreetingBlock: {
    marginBottom: getResponsiveMargin(14),
    paddingRight: 76, // laisse la place au soleil/à la lune à droite
  },

  prayerWidgetGreeting: {
    fontSize: getTextSize(19, textSize),
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  prayerWidgetDate: {
    fontSize: getTextSize(12, textSize),
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },

  prayerWidgetTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 64, // le coin droit est réservé au soleil/à la lune
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

  prayerWidgetNameBlock: {
    flex: 1,
    alignItems: "flex-start",
    gap: 6,
  },

  prayerWidgetName: {
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

  statCardChevron: {
    position: "absolute",
    top: 10,
    right: 10,
    opacity: 0.6,
  },

  // ACCÈS RAPIDE
  quickAccessSection: {
    marginBottom: getResponsiveMargin(24),
  },

  // Le scroll déborde du padding du container pour glisser bord à bord
  quickAccessScroll: {
    marginHorizontal: -QUICK_PADDING,
  },

  quickAccessRow: {
    flexDirection: "row",
    gap: QUICK_GAP,
    paddingHorizontal: QUICK_PADDING,
  },

  quickAccessItem: {
    width: QUICK_TILE_WIDTH,
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