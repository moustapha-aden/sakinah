import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router, useNavigation } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { getTextSize, getLineHeight } from "../../utils/textSize";
import { duas } from "../../data/dua";
import { useFavorites } from "../../hooks/useFavorites";

// Fonction pour obtenir l'icône selon la catégorie
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: { name: keyof typeof MaterialIcons.glyphMap; library: 'MaterialIcons' | 'Ionicons' } } = {
    food: { name: "restaurant", library: "MaterialIcons" },
    protection: { name: "shield", library: "Ionicons" },
    prayer: { name: "mosque", library: "MaterialIcons" },
    morning: { name: "wb-sunny", library: "MaterialIcons" },
    evening: { name: "nights-stay", library: "MaterialIcons" },
    sadness: { name: "mood-bad", library: "MaterialIcons" },
    travel: { name: "flight", library: "MaterialIcons" },
    fasting: { name: "fastfood", library: "MaterialIcons" },
    sleep: { name: "bedtime", library: "MaterialIcons" },
  };
  const icon = iconMap[category] || { name: "menu-book", library: "MaterialIcons" };
  return icon;
};





export default function DuaFavoritesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);
  const NomHeader = t("favorites.title");
  const navigation = useNavigation();
  
  // Définir le titre du header dynamiquement
  useLayoutEffect(() => {
    navigation.setOptions({
      title: NomHeader,
    });
  }, [NomHeader, navigation]);

  const { favorites: favoriteIds, removeFavorite, loading } = useFavorites();
  const [favoriteDuas, setFavoriteDuas] = useState<any[]>([]);

  useEffect(() => {
    if (!loading) {
      const favorites = duas.filter((dua) => favoriteIds.includes(dua.id));
      setFavoriteDuas(favorites);
    }
  }, [favoriteIds, loading]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>Mes Favoris</Text>
          <Text style={styles.subtitle}>
            Retrouvez toutes vos invocations favorites
          </Text>
        </View>

        {favoriteDuas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>{t("favorites.empty")}</Text>
            <Text style={styles.emptyText}>
              {t("favorites.emptyText")}
            </Text>
            <Pressable
              style={styles.exploreButton}
              onPress={() => router.back()}
            >
              <Text style={styles.exploreButtonText}>
                {t("favorites.browse")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.favoritesContainer}>
            {favoriteDuas.map((favorite) => {
              const icon = getCategoryIcon(favorite.category);
              const IconComponent =
                icon.library === "MaterialIcons" ? MaterialIcons : Ionicons;
              return (
                <Pressable
                  key={favorite.id}
                  style={styles.favoriteItem}
                  onPress={() => {
                    router.push({
                      pathname: "/dua",
                      params: { duaId: favorite.id },
                    });
                  }}
                >
                  <View style={styles.favoriteItemHeader}>
                    <View style={styles.favoriteItemIconContainer}>
                      <IconComponent
                        name={icon.name as any}
                        size={20}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.favoriteItemTextContainer}>
                      <Text style={styles.favoriteItemTitle}>
                        {favorite.title}
                      </Text>
                      {favorite.source && (
                        <Text style={styles.favoriteItemSource}>
                          {favorite.source}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        removeFavorite(favorite.id);
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </Pressable>
                  </View>
                  {favorite.arabic && (
                    <Text style={styles.favoriteArabic} numberOfLines={2}>
                      {favorite.arabic}
                    </Text>
                  )}
                  {favorite.translation && (
                    <Text style={styles.favoriteTranslation} numberOfLines={2}>
                      {favorite.translation}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: getTextSize(22, textSize),
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: getLineHeight(getTextSize(16, textSize)),
    marginBottom: 32,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  exploreButtonText: {
    fontSize: getTextSize(16, textSize),
    fontWeight: "600",
    color: colors.textPrimary,
  },
  favoritesContainer: {
    gap: 16,
  },
  favoriteItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  favoriteItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  favoriteItemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  favoriteItemTextContainer: {
    flex: 1,
  },
  favoriteItemTitle: {
    fontSize: getTextSize(18, textSize),
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  favoriteItemSource: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  removeButton: {
    padding: 4,
  },
  favoriteArabic: {
    fontSize: getTextSize(22, textSize),
    color: colors.textPrimary,
    textAlign: "right",
    fontFamily: "System",
    lineHeight: getLineHeight(getTextSize(22, textSize)),
    marginBottom: 12,
  },
  favoriteTranslation: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
    lineHeight: getLineHeight(getTextSize(16, textSize)),
    marginBottom: 8,
  },
  favoriteSource: {
    fontSize: getTextSize(12, textSize),
    color: colors.accent,
    fontStyle: "italic",
    marginTop: 8,
  },
});
