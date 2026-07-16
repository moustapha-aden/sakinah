import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState, useRef, useLayoutEffect, useMemo, useEffect, useCallback } from "react";
import { useLocalSearchParams, router, useNavigation, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { useStats } from "../../contexts/StatsContext";
import { getTextSize, getLineHeight } from "../../utils/textSize";
import { adkar } from "../../data/adkar";
import { adkarCategories } from "../../data/categories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { analytics } from "../../lib/firebase";
import { getResponsivePadding, getResponsiveMargin, getResponsiveSize, isSmallScreen } from "../../utils/responsive";
import { COMPLETED_CATEGORIES_KEY } from "../../constants/storageKeys";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AdkarCategoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { recordAdkarCompletion, refreshStats } = useStats();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);
  
  // Rafraîchir les stats quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats])
  );
  const { category } = useLocalSearchParams<{ category: string }>();
  const navigation = useNavigation();
  const categoryAdkar = adkar.filter((item) => item.category === category);
  const categoryTitle =
    adkarCategories.find((cat) => cat.id === category)?.title || t("adkar.title");

  // Définir le titre du header dynamiquement
  useLayoutEffect(() => {
    navigation.setOptions({
      title: categoryTitle,
    });
    if (analytics && analytics.logEvent) {
      analytics.logEvent("view_adkar_category", { category });
    }
  }, [category, categoryTitle, navigation]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasRecordedRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryRef = useRef<string | null>(null);
  const [completedToday, setCompletedToday] = useState(false);

  // Afficher le badge "Complété" si la catégorie a déjà été faite aujourd'hui
  useEffect(() => {
    const today = new Date().toDateString();
    const completedKey = `${COMPLETED_CATEGORIES_KEY}_${category}_${today}`;
    AsyncStorage.getItem(completedKey)
      .then((value) => setCompletedToday(value === "true"))
      .catch(() => {});
  }, [category]);

  // Réinitialiser le flag quand on change de catégorie
  useEffect(() => {
    if (categoryRef.current !== category) {
      categoryRef.current = category;
      hasRecordedRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [category]);

  // Enregistrer automatiquement la complétion quand l'utilisateur atteint le dernier adkâr
  useEffect(() => {
    const checkAndRecordCompletion = async () => {
      // Vérifier si l'utilisateur est au dernier adkâr (utilise le nombre réel d'adhkar de la catégorie)
      const lastIndex = categoryAdkar.length - 1;
      const today = new Date().toDateString();
      const completionId = `${category}_${today}`;
      
      // Si déjà enregistré pour cette catégorie aujourd'hui, ne rien faire
      if (hasRecordedRef.current === completionId) {
        return;
      }
      
      if (currentIndex === lastIndex && categoryAdkar.length > 0) {
        // Nettoyer le timeout précédent s'il existe
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Attendre 2 secondes pour s'assurer que l'utilisateur a vraiment vu le dernier adkâr
        timeoutRef.current = setTimeout(async () => {
          try {
            const completedKey = `${COMPLETED_CATEGORIES_KEY}_${category}_${today}`;
            
            // Vérifier si cette catégorie a déjà été complétée aujourd'hui
            const alreadyCompleted = await AsyncStorage.getItem(completedKey);
            
            if (!alreadyCompleted && hasRecordedRef.current !== completionId) {
              // Marquer comme enregistré AVANT d'enregistrer
              hasRecordedRef.current = completionId;
              
              // Enregistrer la complétion automatiquement
              await AsyncStorage.setItem(completedKey, "true");
              await recordAdkarCompletion();
              setCompletedToday(true);

              if (analytics && analytics.logEvent) {
                analytics.logEvent("complete_adkar", { category, count: categoryAdkar.length });
              }

              // Les stats seront automatiquement mises à jour via le contexte

              console.log(`✅ Adkâr complété automatiquement: ${category} (${categoryAdkar.length} adkâr)`);
            }
          } catch (error) {
            console.error("Error recording adkar completion:", error);
          } finally {
            timeoutRef.current = null;
          }
        }, 2000); // Attendre 2 secondes pour confirmer que l'utilisateur est vraiment au dernier
      }
    };

    checkAndRecordCompletion();
    
    // Nettoyer le timeout si l'utilisateur change de page avant la fin du délai
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [currentIndex, categoryAdkar.length, category, recordAdkarCompletion]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const goToNext = () => {
    if (currentIndex < categoryAdkar.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  if (categoryAdkar.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📿</Text>
                <Text style={styles.emptyTitle}>{t("adkar.empty")}</Text>
                <Text style={styles.emptyText}>
                  {t("adkar.emptyText")}
                </Text>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.backButtonText}>{t("adkar.back")}</Text>
                </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {categoryAdkar.map((item, index) => {
          const isLastItem = index === categoryAdkar.length - 1;
          return (
            <View key={item.id} style={styles.slide}>
              <ScrollView
                style={styles.verticalScroll}
                contentContainerStyle={styles.cardContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.card}>
                  <Text style={styles.categoryTitle}>{categoryTitle}</Text>
                  <Text style={styles.arabicText}>{item.arabic}</Text>
                  <Text style={styles.translationText}>{item.translation}</Text>
                  {"note" in item && item.note && (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                  )}
                  {item.repeat && (
                    <Text style={styles.repeatText}>
                      {t("adkar.repeat")} {item.repeat} {t("adkar.times")}
                    </Text>
                  )}
                  
                  {/* Badge affiché quand la catégorie est marquée complétée
                      (automatique : 2 s passées sur le dernier adkâr) */}
                  {isLastItem && completedToday && (
                    <View style={styles.completedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={getTextSize(20, settings.textSize)}
                        color="#2ECC71"
                      />
                      <Text style={styles.completedBadgeText}>{t("adkar.completed")}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            {currentIndex + 1} / {categoryAdkar.length}
          </Text>
        </View>

        <View style={styles.navigation}>
            <TouchableOpacity
              style={[
                styles.navButtonContainer,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={goToPrevious}
              disabled={currentIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={colors.textPrimary}
              />
                  <Text style={styles.navButton}> {t("adkar.previous")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navButtonContainer,
                currentIndex === categoryAdkar.length - 1 &&
                  styles.navButtonDisabled,
              ]}
              onPress={goToNext}
              disabled={currentIndex === categoryAdkar.length - 1}
            >
                  <Text style={styles.navButton}>{t("adkar.next")} </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: getResponsivePadding(16),
    paddingHorizontal: getResponsivePadding(20),
  },
  verticalScroll: {
    flex: 1,
    width: "100%",
  },
  cardContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: getResponsiveSize(16),
    padding: getResponsivePadding(24),
    width: "100%",
    maxWidth: isSmallScreen ? SCREEN_WIDTH * 0.95 : 400,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: getResponsiveSize(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: getTextSize(12, textSize),
    color: colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  arabicText: {
    fontSize: getTextSize(isSmallScreen ? 24 : 28, textSize),
    color: colors.textPrimary,
    textAlign: "right",
    fontFamily: "System",
    lineHeight: getLineHeight(getTextSize(isSmallScreen ? 24 : 28, textSize)),
    fontWeight: "500",
    width: "100%",
  },
  translationText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: getLineHeight(getTextSize(16, textSize)),
    width: "100%",
  },
  repeatText: {
    fontSize: getTextSize(14, textSize),
    color: colors.accent,
    fontWeight: "600",
    marginTop: 4,
  },
  noteBox: {
    width: "100%",
    backgroundColor: colors.background,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 8,
    padding: getResponsivePadding(12),
  },
  noteText: {
    fontSize: getTextSize(14, textSize),
    color: colors.textSecondary,
    textAlign: "left",
    lineHeight: getLineHeight(getTextSize(14, textSize)),
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2ECC7120",
    borderWidth: 1,
    borderColor: "#2ECC7160",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  completedBadgeText: {
    fontSize: getTextSize(14, textSize),
    color: "#2ECC71",
    fontWeight: "700",
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  pagination: {
    paddingVertical: 8,
    alignItems: "center",
  },
  paginationText: {
    fontSize: getTextSize(14, textSize),
    color: colors.textSecondary,
    fontWeight: "500",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  navButtonContainer: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  navButton: {
    fontSize: getTextSize(14, textSize),
    color: colors.textPrimary,
    fontWeight: "500",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: getTextSize(20, textSize),
    color: colors.textPrimary,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: getLineHeight(getTextSize(16, textSize)),
  },
  backButton: {
    marginTop: 16,
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textPrimary,
    fontWeight: "500",
  },
});

