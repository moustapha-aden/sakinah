import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useState } from "react";
import { Stack, router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLayoutEffect } from "react";

import AppButton from "../components/AppButton";
import { useTheme } from "../contexts/ThemeContext";

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const styles = createStyles(colors);

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
                <Text style={styles.menuTitle}>Menu</Text>
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
                <Text style={styles.menuItemText}>Favoris</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => handleMenuAction("settings")}
              >
                <Ionicons name="settings" size={22} color={colors.accent} />
                <Text style={styles.menuItemText}>Paramètres</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* CONTENT */}
        <Text style={styles.title}>🕊️ Sakīnah</Text>

        <AppButton title="📿 Adkâr" onPress={() => router.push("/adkar")} />
        <AppButton title="🤲 Duʿāʾ" onPress={() => router.push("/dua")} />
        <AppButton title="🔢 Compteur" onPress={() => router.push("/counter")} />
      </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },

  title: {
    fontSize: 28,
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
    fontSize: 18,
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
    fontSize: 16,
    color: colors.textPrimary,
  },
});
