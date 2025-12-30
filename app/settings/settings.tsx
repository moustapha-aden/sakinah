import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { router } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { colors } from "../../constants/colors";

export default function DuaSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [textSize, setTextSize] = useState("medium");

  const textSizeOptions = [
    { value: "small", label: "Petite" },
    { value: "medium", label: "Moyenne" },
    { value: "large", label: "Grande" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="settings" size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>
            Personnalisez votre expérience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.settingsCard}>
            <Pressable style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={colors.accent}
                  style={styles.settingIcon}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Recevoir des rappels pour les invocations
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: colors.border,
                  true: colors.accent,
                }}
                thumbColor={colors.textPrimary}
              />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <MaterialIcons
                  name="language"
                  size={24}
                  color={colors.accent}
                  style={styles.settingIcon}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Langue de traduction</Text>
                  <Text style={styles.settingDescription}>Français</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <MaterialIcons
                  name="text-fields"
                  size={24}
                  color={colors.accent}
                  style={styles.settingIcon}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Taille du texte</Text>
                  <Text style={styles.settingDescription}>
                    {textSizeOptions.find((opt) => opt.value === textSize)?.label}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.settingsCard}>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="info"
                size={24}
                color={colors.accent}
                style={styles.settingIcon}
              />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingDescription}>1.0.0</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <MaterialIcons
                name="update"
                size={24}
                color={colors.accent}
                style={styles.settingIcon}
              />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dernière mise à jour</Text>
                <Text style={styles.settingDescription}>
                  {new Date().toLocaleDateString("fr-FR")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <Pressable style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons
                  name="help-circle"
                  size={24}
                  color={colors.accent}
                  style={styles.settingIcon}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Aide</Text>
                  <Text style={styles.settingDescription}>
                    Questions fréquentes et support
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
});
