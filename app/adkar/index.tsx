import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { getTextSize } from "../../utils/textSize";
import { analytics } from "../../lib/firebase";
import { getResponsivePadding, getResponsiveMargin, getResponsiveSize, isSmallScreen } from "../../utils/responsive";

const CATEGORIES = [
  {
    id: "morning",
    icon: "wb-sunny" as const,
    gradient: ["#FFB347", "#FF7E5F"],
    nameKey: "adkar.morning",
    nameFrKey: "adkar.morningFr",
  },
  {
    id: "evening",
    icon: "nights-stay" as const,
    gradient: ["#6A85B6", "#3B4B78"],
    nameKey: "adkar.evening",
    nameFrKey: "adkar.eveningFr",
  },
  {
    id: "after_prayer",
    icon: "mosque" as const,
    gradient: ["#3CBBB1", "#E6B65C"],
    nameKey: "adkar.afterPrayer",
    nameFrKey: "adkar.afterPrayerFr",
  },
];

export default function AdkarScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  const cardAnims = useRef(CATEGORIES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (analytics && analytics.logEvent) {
      analytics.logEvent("open_adkar");
    }
    Animated.stagger(
      100,
      cardAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true })
      )
    ).start();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    if (analytics && analytics.logEvent) {
      analytics.logEvent("select_adkar_category", { category: categoryId });
    }
    router.push(`/adkar/${categoryId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📿 {t("adkar.title")}</Text>
        <Text style={styles.subtitle}>{t("adkar.subtitle")}</Text>

        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category, index) => (
            <Animated.View
              key={category.id}
              style={{
                opacity: cardAnims[index],
                transform: [
                  {
                    translateY: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}
            >
              <Pressable
                onPress={() => handleCategoryPress(category.id)}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.cardContent}>
                  <LinearGradient
                    colors={category.gradient as [string, string]}
                    style={styles.cardIconBadge}
                  >
                    <MaterialIcons name={category.icon} size={26} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.cardText}>
                    <Text style={styles.nom_en_Arabe}>{t(category.nameKey)}</Text>
                    <Text style={styles.nom_en_francais}>{t(category.nameFrKey)}</Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}


const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  container: {
    // marginTop: 40,
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: getResponsivePadding(20),
    gap: getResponsiveSize(16),
  },
  card: {
    marginBottom: getResponsiveMargin(16),
    padding: getResponsivePadding(20),
    backgroundColor: colors.card,
    borderRadius: getResponsiveSize(12),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },

  title: {
    fontSize: getTextSize(isSmallScreen ? 24 : 28, textSize),
    textAlign: "center",
    color: colors.textPrimary,
    marginBottom: getResponsiveMargin(8),
    fontWeight: "600",
  },
  subtitle: {
    fontSize: getTextSize(16, textSize),
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: getResponsiveMargin(24),
  },
  categoriesContainer: {
    gap: getResponsiveSize(12),
  },
  nom_en_Arabe: {
    fontSize: getTextSize(20, textSize),
    color: colors.textPrimary,
    fontWeight: "600",
  },
  nom_en_francais: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
  },
});
