import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useMemo } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings, Language } from "../../hooks/useSettings";
import { getTextSize } from "../../utils/textSize";

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "fr", name: "Français", nativeName: "Français" },
  { code: "ar", name: "Arabe", nativeName: "العربية" },
  { code: "en", name: "Anglais", nativeName: "English" },
];

export default function LanguageScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings, setLanguage } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>{t("language.title")}</Text>
          <Text style={styles.subtitle}>
            {t("language.subtitle")}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {languages.map((lang) => (
            <Pressable
              key={lang.code}
              style={[
                styles.optionItem,
                settings.language === lang.code && styles.optionItemSelected,
              ]}
              onPress={() => {
                setLanguage(lang.code);
                router.back();
              }}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionNativeName}>{lang.nativeName}</Text>
                <Text style={styles.optionName}>{lang.name}</Text>
              </View>
              {settings.language === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}> {t("language.back")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any, textSize: any) =>
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
      fontSize: getTextSize(28, textSize),
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: getTextSize(16, textSize),
      color: colors.textSecondary,
      textAlign: "center",
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
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionItemSelected: {
      backgroundColor: colors.background,
    },
    optionLeft: {
      flex: 1,
    },
    optionNativeName: {
      fontSize: getTextSize(24, textSize),
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    optionName: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
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
      fontSize: getTextSize(16, textSize),
      fontWeight: "600",
      color: colors.textPrimary,
    },
  });

