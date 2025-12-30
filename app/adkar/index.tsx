import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { getTextSize } from "../../utils/textSize";
import { analytics } from "../../lib/firebase";

export default function AdkarScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  useEffect(() => {
    if (analytics && analytics.logEvent) {
      analytics.logEvent("open_adkar");
    }
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
          <Pressable
            onPress={() => handleCategoryPress("morning")}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <MaterialIcons
                name="wb-sunny"
                size={32}
                color={colors.accent}
                style={styles.cardIcon}
              />
                    <View style={styles.cardText}>
                      <Text style={styles.nom_en_Arabe}>{t("adkar.morning")}</Text>
                      <Text style={styles.nom_en_francais}>{t("adkar.morningFr")}</Text>
                    </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleCategoryPress("evening")}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <MaterialIcons
                name="nights-stay"
                size={32}
                color={colors.accent}
                style={styles.cardIcon}
              />
                    <View style={styles.cardText}>
                      <Text style={styles.nom_en_Arabe}>{t("adkar.evening")}</Text>
                      <Text style={styles.nom_en_francais}>{t("adkar.eveningFr")}</Text>
                    </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleCategoryPress("after_prayer")}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <MaterialIcons
                name="mosque"
                size={32}
                color={colors.accent}
                style={styles.cardIcon}
              />
                    <View style={styles.cardText}>
                      <Text style={styles.nom_en_Arabe}>{t("adkar.afterPrayer")}</Text>
                      <Text style={styles.nom_en_francais}>{t("adkar.afterPrayerFr")}</Text>
                    </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>
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
  cardIcon: {
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

