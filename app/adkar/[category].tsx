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
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { useStats } from "../../contexts/StatsContext";
import { getTextSize, getLineHeight } from "../../utils/textSize";
import { adkar } from "../../data/adkar";
import { adkarCategories } from "../../data/categories";
import AsyncStorage from "@react-native-async-storage/async-storage";

const defaultStats = {
  streakDays: 0,
  completedAdkar: 0,
  lastAdkarDate: null,
  streakStartDate: null,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COMPLETED_CATEGORIES_KEY = "@sakinah_completed_categories";

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
  }, [category, categoryTitle, navigation]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasRecordedRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryRef = useRef<string | null>(null);

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

  // Fonction pour marquer comme terminé manuellement
  const handleComplete = async () => {
    try {
      const today = new Date().toDateString();
      const completedKey = `${COMPLETED_CATEGORIES_KEY}_${category}_${today}`;
      const completionId = `${category}_${today}`;
      
      console.log(`🔵 handleComplete appelé pour: ${category}`);
      console.log(`🔵 completionId: ${completionId}`);
      console.log(`🔵 hasRecordedRef.current: ${hasRecordedRef.current}`);
      
      // Vérifier si cette catégorie a déjà été complétée aujourd'hui
      const alreadyCompleted = await AsyncStorage.getItem(completedKey);
      console.log(`🔵 alreadyCompleted: ${alreadyCompleted}`);
      
      // Si déjà complétée, vérifier si les stats ont été incrémentées
      if (alreadyCompleted) {
        const statsData = await AsyncStorage.getItem("@sakinah_stats");
        const currentStats = statsData ? JSON.parse(statsData) : defaultStats;
        const today = new Date().toDateString();
        
        console.log(`🔵 Stats actuelles:`, currentStats);
        console.log(`🔵 lastAdkarDate: ${currentStats.lastAdkarDate}, today: ${today}`);
        
        // Compter combien de catégories ont été complétées aujourd'hui
        const allKeys = await AsyncStorage.getAllKeys();
        const completedToday = allKeys.filter(key => 
          key.startsWith(COMPLETED_CATEGORIES_KEY) && key.includes(today)
        );
        const categoriesCompletedCount = completedToday.length;
        
        console.log(`🔵 Catégories complétées aujourd'hui: ${categoriesCompletedCount}`);
        console.log(`🔵 Compteur actuel: ${currentStats.completedAdkar}`);
        
        // Si le nombre de catégories complétées est supérieur au compteur, forcer la mise à jour
        if (categoriesCompletedCount > currentStats.completedAdkar || currentStats.lastAdkarDate !== today) {
          console.log(`🔵 Désynchronisation détectée - Forcer l'incrémentation`);
          // Calculer combien de catégories manquent dans le compteur
          const missingCount = categoriesCompletedCount - currentStats.completedAdkar;
          
          if (currentStats.lastAdkarDate === today) {
            // Même jour, juste incrémenter le compteur
            const updatedStats = {
              ...currentStats,
              completedAdkar: currentStats.completedAdkar + missingCount,
            };
            await AsyncStorage.setItem("@sakinah_stats", JSON.stringify(updatedStats));
            await refreshStats();
            console.log(`✅ Stats corrigées: ${updatedStats.completedAdkar} adkâr complétés`);
          } else {
            // Nouveau jour, utiliser recordAdkarCompletion qui gère le streak
            await recordAdkarCompletion();
            await refreshStats();
            console.log(`✅ Stats forcées à jour pour: ${category}`);
          }
          return;
        } else {
          console.log(`⚠️ Cette catégorie a déjà été complétée ET les stats sont synchronisées: ${category}`);
          return;
        }
      }
      
      if (!alreadyCompleted && hasRecordedRef.current !== completionId) {
        // Marquer comme enregistré AVANT d'enregistrer pour éviter les doubles clics
        hasRecordedRef.current = completionId;
        
        console.log(`🔵 Enregistrement de la complétion...`);
        
        // Enregistrer la complétion D'ABORD dans AsyncStorage
        await AsyncStorage.setItem(completedKey, "true");
        
        // PUIS enregistrer les stats
        await recordAdkarCompletion();
        
        // Attendre un peu pour que les stats soient sauvegardées
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Rafraîchir les stats pour mettre à jour l'écran d'accueil
        await refreshStats();
        
        console.log(`✅ Adkâr complété manuellement: ${category} (${categoryAdkar.length} adkâr)`);
      } else {
        console.log(`⚠️ Cette catégorie a déjà été complétée aujourd'hui ou en cours d'enregistrement: ${category}`);
      }
    } catch (error) {
      console.error("❌ Error recording adkar completion:", error);
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
                  {item.repeat && (
                    <Text style={styles.repeatText}>
                      {t("adkar.repeat")} {item.repeat} {t("adkar.times")}
                    </Text>
                  )}
                  
                  {/* Bouton Terminé visible uniquement sur le dernier adkâr */}
                  {isLastItem && (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={handleComplete}
                    >
                      <Ionicons name="checkmark-circle" size={getTextSize(24, settings.textSize)} color="#FFFFFF" />
                      <Text style={styles.completeButtonText}>{t("adkar.complete")}</Text>
                    </TouchableOpacity>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
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
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 20,
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
    fontSize: getTextSize(28, textSize),
    color: colors.textPrimary,
    textAlign: "right",
    fontFamily: "System",
    lineHeight: getLineHeight(getTextSize(28, textSize)),
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
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButtonText: {
    fontSize: getTextSize(16, textSize),
    color: "#FFFFFF",
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

