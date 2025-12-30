import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { getTextSize, getLineHeight } from "../../utils/textSize";
import { adkar } from "../../data/adkar";
import { adkarCategories } from "../../data/categories";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AdkarCategoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);
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
        {categoryAdkar.map((item, index) => (
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
                    Répéter {item.repeat} fois
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        ))}
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
    marginTop: 40,
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

