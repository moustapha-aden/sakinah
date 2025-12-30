import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useState, useMemo } from "react";
import { Stack, router, useNavigation, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLayoutEffect, useCallback } from "react";

import AppButton from "../components/AppButton";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize } from "../utils/textSize";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Recréer les styles quand textSize change
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

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
    <View style={styles.container}>
        {/* MODAL MENU */}
        <Modal
          visible={menuVisible}
          transparent
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
              >
                <Ionicons name="star" size={22} color={colors.accent} />
                <Text style={styles.menuItemText}>{t("menu.favorites")}</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => handleMenuAction("settings")}
              >
                <Ionicons name="settings" size={22} color={colors.accent} />
                <Text style={styles.menuItemText}>{t("menu.settings")}</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* CONTENT */}
        <Text style={styles.title}>🕊️ {t("home.title")}</Text>

        <AppButton title={t("home.adkar")} onPress={() => router.push("/adkar")} />
        <AppButton title={t("home.dua")} onPress={() => router.push("/dua")} />
        <AppButton title={t("home.counter")} onPress={() => router.push("/counter")} />
      </View>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },

  title: {
    fontSize: getTextSize(28, textSize),
    textAlign: "center",
    color: colors.textPrimary,
    marginBottom: 24,
    fontWeight: "600",
  },

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
  },

  menuItemText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textPrimary,
  },
});
