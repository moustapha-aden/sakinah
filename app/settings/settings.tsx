import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useSettings } from "../../hooks/useSettings";

export default function SettingsScreen() {
  const { colors, theme, themeMode, setThemeMode } = useTheme();
  const { settings, setNotifications, setLanguage, setTextSize } = useSettings();

  const styles = createStyles(colors);

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      fr: "Français",
      ar: "العربية",
      en: "English",
    };
    return languages[code] || code;
  };

  const getTextSizeName = (size: string) => {
    const sizes: { [key: string]: string } = {
      small: "Petite",
      medium: "Moyenne",
      large: "Grande",
    };
    return sizes[size] || size;
  };

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

        {/* Section Apparence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          <View style={styles.optionsContainer}>
            <View style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons
                  name={theme === "dark" ? "moon" : "sunny"}
                  size={24}
                  color={colors.accent}
                  style={styles.optionIcon}
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Mode sombre</Text>
                  <Text style={styles.optionDescription}>
                    {themeMode === "auto"
                      ? "Automatique (suit le système)"
                      : themeMode === "dark"
                      ? "Activé"
                      : "Désactivé"}
                  </Text>
                </View>
              </View>
              <Switch
                value={themeMode === "dark"}
                onValueChange={(value) => setThemeMode(value ? "dark" : "light")}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.card}
              />
            </View>

            <Pressable
              style={styles.optionItem}
              onPress={() => {
                const newMode = themeMode === "auto" ? "light" : themeMode === "light" ? "dark" : "auto";
                setThemeMode(newMode);
              }}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="phone-portrait"
                  size={24}
                  color={colors.accent}
                  style={styles.optionIcon}
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Mode automatique</Text>
                  <Text style={styles.optionDescription}>
                    Suivre les paramètres du système
                  </Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>
                  {themeMode === "auto" ? "Activé" : "Désactivé"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Section Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.optionsContainer}>
            <View style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={colors.accent}
                  style={styles.optionIcon}
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Notifications</Text>
                  <Text style={styles.optionDescription}>
                    Recevoir des rappels pour les invocations
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.card}
              />
            </View>

            <Pressable
              style={styles.optionItem}
              onPress={() => router.push("/settings/language")}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons
                  name="language"
                  size={24}
                  color={colors.accent}
                  style={styles.optionIcon}
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Langue</Text>
                  <Text style={styles.optionDescription}>
                    {getLanguageName(settings.language)}
                  </Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>
                  {settings.language.toUpperCase()}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </Pressable>

            <Pressable
              style={styles.optionItem}
              onPress={() => router.push("/settings/textSize")}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons
                  name="text-fields"
                  size={24}
                  color={colors.accent}
                  style={styles.optionIcon}
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Taille du texte</Text>
                  <Text style={styles.optionDescription}>
                    {getTextSizeName(settings.textSize)}
                  </Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>
                  {getTextSizeName(settings.textSize)}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Section À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dernière mise à jour</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.optionsContainer}>
            <Pressable
              style={styles.optionItem}
              onPress={() => router.push("/settings/help")}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="help-circle"
                  size={24}
                  color={colors.accent}
                  style={styles.optionIcon}
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Aide</Text>
                  <Text style={styles.optionDescription}>
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}> Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
    optionsContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    optionIcon: {
      marginRight: 16,
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    optionRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    optionValue: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    infoItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    infoValue: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    buttonContainer: {
      marginTop: 24,
      marginBottom: 32,
    },
    backButton: {
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
    backButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
  });
