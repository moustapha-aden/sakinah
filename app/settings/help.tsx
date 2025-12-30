import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useMemo } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { getTextSize, getLineHeight } from "../../utils/textSize";

export default function HelpScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  // Utiliser useMemo pour recréer les FAQ quand la langue change
  const faqItems = useMemo(() => [
    {
      question: t("help.faq1.question"),
      answer: t("help.faq1.answer"),
    },
    {
      question: t("help.faq2.question"),
      answer: t("help.faq2.answer"),
    },
    {
      question: t("help.faq3.question"),
      answer: t("help.faq3.answer"),
    },
    {
      question: t("help.faq4.question"),
      answer: t("help.faq4.answer"),
    },
    {
      question: t("help.faq5.question"),
      answer: t("help.faq5.answer"),
    },
  ], [t]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>{t("help.title")}</Text>
          <Text style={styles.subtitle}>
            {t("help.subtitle")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("help.faq")}</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={colors.accent}
                  style={styles.faqIcon}
                />
                <Text style={styles.faqQuestionText}>{item.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("help.contact")}</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              {t("help.contactText")}
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                Linking.openURL("mailto:support@sakinah.app");
              }}
            >
              <Ionicons name="mail" size={20} color={colors.textPrimary} />
              <Text style={styles.contactButtonText}>{t("help.sendEmail")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("help.about")}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              <Text style={styles.aboutBold}>Sakīnah</Text> {t("help.aboutText")}
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}> {t("help.back")}</Text>
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: getTextSize(20, textSize),
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 16,
    },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    faqQuestion: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    faqIcon: {
      marginRight: 8,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: getTextSize(16, textSize),
      fontWeight: "600",
      color: colors.textPrimary,
    },
    faqAnswer: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
      lineHeight: getLineHeight(getTextSize(14, textSize)),
      marginLeft: 28,
    },
    contactCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactText: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
      lineHeight: getLineHeight(getTextSize(14, textSize)),
      marginBottom: 16,
    },
    contactButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    contactButtonText: {
      fontSize: getTextSize(16, textSize),
      fontWeight: "600",
      color: colors.textPrimary,
    },
    aboutCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aboutText: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
      lineHeight: getLineHeight(getTextSize(14, textSize)),
      marginBottom: 16,
    },
    aboutBold: {
      fontWeight: "700",
      color: colors.textPrimary,
    },
    versionText: {
      fontSize: getTextSize(12, textSize),
      color: colors.textSecondary,
      fontStyle: "italic",
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

