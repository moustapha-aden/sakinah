import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useState, useRef, useMemo, useLayoutEffect, useEffect } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { getTextSize, getLineHeight } from "../../utils/textSize";
import { duas } from "../../data/dua";
import { useFavorites } from "../../hooks/useFavorites";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Fonction pour obtenir l'icône selon la catégorie
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: { name: keyof typeof MaterialIcons.glyphMap; library: 'MaterialIcons' | 'Ionicons' } } = {
    food: { name: "restaurant", library: "MaterialIcons" },
    condolences: { name: "favorite", library: "MaterialIcons" },
    pain: { name: "healing", library: "MaterialIcons" },
    oppressed: { name: "gavel", library: "MaterialIcons" },
    protection: { name: "shield", library: "Ionicons" },
    friday: { name: "calendar-today", library: "MaterialIcons" },
    hardship: { name: "warning", library: "MaterialIcons" },
    laylat_al_qadr: { name: "nights-stay", library: "MaterialIcons" },
    apology: { name: "handshake", library: "MaterialIcons" },
    ease: { name: "check-circle", library: "MaterialIcons" },
    sick: { name: "local-hospital", library: "MaterialIcons" },
    fasting: { name: "fastfood", library: "MaterialIcons" },
    sadness: { name: "mood-bad", library: "MaterialIcons" },
    childbirth: { name: "child-care", library: "MaterialIcons" },
    exams: { name: "school", library: "MaterialIcons" },
    enemy: { name: "security", library: "MaterialIcons" },
    graveyard: { name: "place", library: "MaterialIcons" },
    prayer: { name: "mosque", library: "MaterialIcons" },
    parents: { name: "family-restroom", library: "MaterialIcons" },
    pregnancy: { name: "pregnant-woman", library: "MaterialIcons" },
    istikhara: { name: "help", library: "MaterialIcons" },
    sleep: { name: "bedtime", library: "MaterialIcons" },
    injustice: { name: "gavel", library: "MaterialIcons" },
    death: { name: "church", library: "MaterialIcons" },
    birth_congrats: { name: "celebration", library: "MaterialIcons" },
    sujood: { name: "panorama-vertical", library: "MaterialIcons" },
    adhan: { name: "volume-up", library: "MaterialIcons" },
    mosque_go: { name: "directions-walk", library: "MaterialIcons" },
    mosque_enter: { name: "login", library: "MaterialIcons" },
    mosque_exit: { name: "logout", library: "MaterialIcons" },
    marriage: { name: "favorite", library: "MaterialIcons" },
    morning: { name: "wb-sunny", library: "MaterialIcons" },
    evening: { name: "nights-stay", library: "MaterialIcons" },
    travel: { name: "flight", library: "MaterialIcons" },
    rain: { name: "grain", library: "MaterialIcons" },
  };

  const icon = iconMap[category] || { name: "menu-book", library: "MaterialIcons" };
  return icon;
};

export default function DuaScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);
  
  return <DuaScreenContent styles={styles} colors={colors} />;
}

function DuaScreenContent({ styles, colors }: { styles: any; colors: any }) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ duaId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDuaIndex, setSelectedDuaIndex] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Si un duaId est passé en paramètre, ouvrir directement ce dua
  useEffect(() => {
    if (params.duaId) {
      const index = duas.findIndex((d) => d.id === params.duaId);
      if (index !== -1) {
        setSelectedDuaIndex(index);
      }
    }
  }, [params.duaId]);

  // Filtrer les duas selon la recherche
  const filteredDuas = useMemo(() => {
    if (!searchQuery.trim()) return duas;
    const query = searchQuery.toLowerCase();
    return duas.filter(
      (dua) =>
        dua.title.toLowerCase().includes(query) ||
        dua.translation.toLowerCase().includes(query) ||
        dua.arabic.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleMenuAction = (action: string) => {
    setMenuVisible(false);
    if (action === "favorites") {
      router.push("/settings/favorites");
    } else if (action === "settings") {
      router.push("/settings/settings");
    }
  };

  // Configurer le header avec le menu et le bouton favori
  useLayoutEffect(() => {
    const selectedDua = selectedDuaIndex !== null ? filteredDuas[selectedDuaIndex] : null;
    const isDuaFavorite = selectedDua ? isFavorite(selectedDua.id) : false;

    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          {selectedDuaIndex !== null && selectedDua && (
            <TouchableOpacity
              onPress={() => toggleFavorite(selectedDua.id)}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isDuaFavorite ? "star" : "star-outline"}
                size={24}
                color={isDuaFavorite ? colors.accent : colors.textPrimary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, selectedDuaIndex, filteredDuas, isFavorite, toggleFavorite]);



  const handleDuaSelect = (index: number) => {
    setSelectedDuaIndex(index);
  };

  const handleBackToList = () => {
    setSelectedDuaIndex(null);
  };

  // Vue détail : afficher uniquement le dua sélectionné
  if (selectedDuaIndex !== null) {
    const selectedDua = filteredDuas[selectedDuaIndex];
    const icon = getCategoryIcon(selectedDua.category);
    const IconComponent =
      icon.library === "MaterialIcons" ? MaterialIcons : Ionicons;
    const isDuaFavorite = isFavorite(selectedDua.id);

    return (
      <View style={styles.container}>
        {/* Menu Modal - accessible aussi dans la vue détail */}
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>{t("menu.title")}</Text>
                <TouchableOpacity
                  onPress={() => setMenuVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={styles.menuItems}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => handleMenuAction("favorites")}
                >
                  <View style={styles.menuItemContent}>
                    <Ionicons
                      name="star"
                      size={24}
                      color={colors.accent}
                      style={styles.menuItemIcon}
                    />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>{t("menu.favorites")}</Text>
                      <Text style={styles.menuItemSubtitle}>
                        {t("menu.favoritesSubtitle")}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => handleMenuAction("settings")}
                >
                  <View style={styles.menuItemContent}>
                    <Ionicons
                      name="settings"
                      size={24}
                      color={colors.accent}
                      style={styles.menuItemIcon}
                    />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>{t("menu.settings")}</Text>
                      <Text style={styles.menuItemSubtitle}>
                        {t("menu.settingsSubtitle")}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <ScrollView
          style={styles.detailScrollView}
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.detailIconContainer}>
                <IconComponent
                  name={icon.name as any}
                  size={32}
                  color={colors.accent}
                />
              </View>
              <View style={styles.detailTitleContainer}>
                <Text style={styles.duaTitle}>{selectedDua.title}</Text>
                <TouchableOpacity
                  style={styles.favoriteButtonDetail}
                  onPress={() => toggleFavorite(selectedDua.id)}
                >
                  <Ionicons
                    name={isDuaFavorite ? "star" : "star-outline"}
                    size={28}
                    color={isDuaFavorite ? colors.accent : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {selectedDua.arabic && (
              <View style={styles.arabicContainer}>
                <Text style={styles.arabicText}>{selectedDua.arabic}</Text>
              </View>
            )}

            {selectedDua.translation && (
              <View style={styles.translationContainer}>
                <Text style={styles.translationText}>
                  {selectedDua.translation}
                </Text>
              </View>
            )}

            {selectedDua.source && (
              <View style={styles.sourceContainer}>
                <Ionicons
                  name="book"
                  size={16}
                  color={colors.accent}
                  style={styles.sourceIcon}
                />
                <Text style={styles.sourceText}>{selectedDua.source}</Text>
              </View>
            )}

            {!selectedDua.arabic && !selectedDua.translation && (
              <View style={styles.emptyDuaContainer}>
                <Ionicons
                  name="hourglass-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyDuaText}>
                  Le contenu de cette invocation sera bientôt disponible.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={handleBackToList}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backToListText}> {t("dua.backToList")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Vue liste : afficher tous les titres avec recherche
  return (
    <View style={styles.container}>
      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.menuItems}>
              <Pressable
                style={styles.menuItem}
                onPress={() => handleMenuAction("favorites")}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name="star"
                    size={24}
                    color={colors.accent}
                    style={styles.menuItemIcon}
                  />
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>Favoris</Text>
                    <Text style={styles.menuItemSubtitle}>
                      Mes invocations favorites
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => handleMenuAction("settings")}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name="settings"
                    size={24}
                    color={colors.accent}
                    style={styles.menuItemIcon}
                  />
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>Paramètres</Text>
                    <Text style={styles.menuItemSubtitle}>
                      Préférences et configuration
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t("dua.search")}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.listContainer}>
        {filteredDuas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("dua.empty")} "{searchQuery}"
            </Text>
          </View>
        ) : (
          <View style={styles.listContent}>
            {filteredDuas.map((dua, index) => {
              const icon = getCategoryIcon(dua.category);
              const IconComponent =
                icon.library === "MaterialIcons" ? MaterialIcons : Ionicons;
              return (
                <Pressable
                  key={dua.id}
                  style={({ pressed }) => [
                    styles.duaItem,
                    pressed && styles.duaItemPressed,
                  ]}
                  onPress={() => handleDuaSelect(index)}
                >
                  <View style={styles.duaItemContent}>
                    <IconComponent
                      name={icon.name as any}
                      size={24}
                      color={colors.accent}
                      style={styles.duaItemIcon}
                    />
                    <View style={styles.duaItemText}>
                      <Text style={styles.duaItemTitle}>{dua.title}</Text>
                      {dua.source && (
                        <Text style={styles.duaItemSource}>{dua.source}</Text>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Styles pour la vue liste
  searchContainer: {
    padding: 16,
    backgroundColor: colors.background,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  duaItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  duaItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  duaItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  duaItemIcon: {
    marginRight: 12,
  },
  duaItemText: {
    flex: 1,
  },
  duaItemTitle: {
    fontSize: getTextSize(16, textSize),
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 4,
  },
  duaItemSource: {
    fontSize: getTextSize(12, textSize),
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  // Styles pour la vue détail
  detailScrollView: {
    flex: 1,
  },
  detailContent: {
    padding: 20,
    paddingBottom: 100,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  detailHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  detailTitleContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 16,
  },
  detailIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  duaTitle: {
    fontSize: getTextSize(24, textSize),
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "center",
  },
  arabicContainer: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  arabicText: {
    fontSize: getTextSize(32, textSize),
    color: colors.textPrimary,
    textAlign: "right",
    fontFamily: "System",
    lineHeight: getLineHeight(getTextSize(32, textSize)),
    fontWeight: "500",
  },
  translationContainer: {
    marginBottom: 20,
  },
  translationText: {
    fontSize: getTextSize(18, textSize),
    color: colors.textSecondary,
    textAlign: "left",
    lineHeight: getLineHeight(getTextSize(18, textSize)),
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourceIcon: {
    marginRight: 8,
  },
  sourceText: {
    fontSize: 14,
    color: colors.accent,
    fontStyle: "italic",
    fontWeight: "500",
  },
  emptyDuaContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyDuaText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 16,
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backToListButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backToListText: {
    fontSize: getTextSize(14, textSize),
    color: colors.textPrimary,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  favoriteButtonDetail: {
    marginTop: 16,
    padding: 8,
    alignSelf: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "50%",
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuTitle: {
    fontSize: getTextSize(24, textSize),
    fontWeight: "700",
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    paddingTop: 8,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: getTextSize(18, textSize),
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: getTextSize(14, textSize),
    color: colors.textSecondary,
  },
});

