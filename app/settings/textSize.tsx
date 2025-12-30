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
import { useSettings, TextSize } from "../../hooks/useSettings";
import { getTextSize, getLineHeight } from "../../utils/textSize";

const textSizes: { value: TextSize; label: string; description: string; size: number }[] = [
  { value: "small", label: "Petite", description: "Facile à lire", size: 14 },
  { value: "medium", label: "Moyenne", description: "Taille standard", size: 16 },
  { value: "large", label: "Grande", description: "Plus facile à lire", size: 18 },
];

export default function TextSizeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings, setTextSize } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="text" size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>{t("textSize.title")}</Text>
          <Text style={styles.subtitle}>
            {t("textSize.subtitle")}
          </Text>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>{t("textSize.preview")}</Text>
          <View style={styles.previewCard}>
            <Text
              style={[
                styles.previewText,
                { fontSize: textSizes.find((s) => s.value === settings.textSize)?.size || 16 },
              ]}
            >
              بسم الله الرحمن الرحيم
            </Text>
            <Text
              style={[
                styles.previewText,
                { fontSize: textSizes.find((s) => s.value === settings.textSize)?.size || 16 },
              ]}
            >
              Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux
            </Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {textSizes.map((size) => (
            <Pressable
              key={size.value}
              style={[
                styles.optionItem,
                settings.textSize === size.value && styles.optionItemSelected,
              ]}
              onPress={() => {
                setTextSize(size.value);
                router.back();
              }}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionLabel}>{size.label}</Text>
                <Text style={styles.optionDescription}>{size.description}</Text>
              </View>
              <View style={styles.optionRight}>
                <Text
                  style={[
                    styles.optionSize,
                    { fontSize: size.size },
                  ]}
                >
                  Aa
                </Text>
                {settings.textSize === size.value && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}> {t("textSize.back")}</Text>
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
    previewContainer: {
      marginBottom: 32,
    },
    previewLabel: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    previewCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
    },
    previewText: {
      color: colors.textPrimary,
      textAlign: "center",
      lineHeight: getLineHeight(getTextSize(16, textSize)),
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
    optionLabel: {
      fontSize: getTextSize(18, textSize),
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
    },
    optionRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    optionSize: {
      fontWeight: "600",
      color: colors.textPrimary,
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

