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

import AppButton from "../components/AppButton";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { useStats } from "../contexts/StatsContext";
import { getTextSize } from "../utils/textSize";
import { hadiths, quoteImages } from "../data/hadith";
import { translations } from "../utils/translations";


export default function HomeScreen() {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { settings } = useSettings();
  const { stats, loading: statsLoading, refreshStats } = useStats();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Recharger les stats quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats])
  );
  
  // Animations refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const button1Translate = useRef(new Animated.Value(50)).current;
  const button2Translate = useRef(new Animated.Value(50)).current;
  const button3Translate = useRef(new Animated.Value(50)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const menuScale = useRef(new Animated.Value(0.8)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  // Obtenir les citations traduites selon la langue
  const getQuotes = useCallback(() => {
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
      .filter((quote): quote is NonNullable<typeof quote> => quote !== null);
  }, [settings.language]);

  const quotes = useMemo(() => getQuotes(), [getQuotes]);
  
  // Sélectionner une citation aléatoire au chargement et quand la langue change
  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuoteIndex(randomIndex);
    }
  }, [language, quotes.length]);

  const currentQuote = quotes[currentQuoteIndex] || (quotes.length > 0 ? quotes[0] : null);

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

        {/* TITRE */}
        <Animated.Text
          style={[
            styles.title,
            {
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          🕊️ {t("home.title")}
        </Animated.Text>

        {/* CARTE CITATION DU JOUR */}
        {currentQuote && (
          <Animated.View style={[styles.quoteCard, { opacity: quoteOpacity }]}>
            <ImageBackground
              source={currentQuote.image}
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
                
                <Text style={styles.quoteArabic}>{currentQuote.text}</Text>
                <Text style={styles.quoteTranslation}>{currentQuote.translation}</Text>
                
                <View style={styles.quoteSourceContainer}>
                  <Ionicons name="bookmark" size={16} color="#FFD700" />
                  <Text style={styles.quoteSource}>{currentQuote.source}</Text>
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

        {/* BOUTONS PRINCIPAUX */}
        <View style={styles.buttonsContainer}>
          <Animated.View
            style={{
              transform: [{ translateY: button1Translate }],
              opacity: fadeAnim,
            }}
          >
            <AppButton title={t("home.adkar")} onPress={() => router.push("/adkar")} />
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ translateY: button2Translate }],
              opacity: fadeAnim,
            }}
          >
            <AppButton title={t("home.dua")} onPress={() => router.push("/dua")} />
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ translateY: button3Translate }],
              opacity: fadeAnim,
            }}
          >
            <AppButton title={t("home.tasbih")} onPress={() => router.push("/tasbih")} />
          </Animated.View>
        </View>

        {/* SECTION HADITHS RAPIDES */}
        <Animated.View style={[styles.hadithsSection, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="library" size={24} color={colors.accent} />
            <Text style={styles.sectionTitle}>{t("home.hadithsOfDay")}</Text>
          </View>

          {quotes.length > 0 ? (() => {
            // Sélectionner 3 hadiths aléatoires différents de celui affiché en haut
            const availableQuotes = currentQuote 
              ? quotes.filter(q => q.id !== currentQuote.id)
              : quotes;
            
            // S'assurer qu'on a au moins 3 hadiths disponibles
            const hadithsToShow = availableQuotes.length >= 3 
              ? availableQuotes.length 
              : quotes.length;
            
            // Mélanger et prendre les premiers
            const shuffled = [...availableQuotes].sort(() => Math.random() - 0.5);
            const randomHadiths = shuffled.slice(0, Math.min(3, hadithsToShow));
            
            return randomHadiths.length > 0 ? randomHadiths.map((quote) => (
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
            )) : (
              <View style={styles.hadithCard}>
                <Text style={styles.hadithText}>Chargement...</Text>
              </View>
            );
          })() : (
            <View style={styles.hadithCard}>
              <Text style={styles.hadithText}>Aucun hadith disponible</Text>
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
    padding: 20,
  },

  title: {
    fontSize: getTextSize(28, textSize),
    textAlign: "center",
    color: colors.textPrimary,
    marginBottom: 20,
    marginTop: 10,
    fontWeight: "600",
  },

  // CARTE CITATION
  quoteCard: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
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
    padding: 20,
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
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
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

  // BOUTONS
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
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
    fontSize: getTextSize(18, textSize),
    fontWeight: "600",
    color: colors.textPrimary,
  },

  hadithCard: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  hadithIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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