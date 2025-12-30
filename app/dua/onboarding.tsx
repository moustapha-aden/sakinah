import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useMemo } from "react";
import { router } from "expo-router";
import AppButton from "../../components/AppButton";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { useSettings } from "../../hooks/useSettings";
import { getTextSize, getLineHeight } from "../../utils/textSize";

export default function DuaOnboardingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  const handleGetStarted = () => {
    router.replace("/dua");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🤲</Text>
        </View>

        <Text style={styles.title}>{t("onboarding.title")}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("onboarding.whatIs")}</Text>
          <Text style={styles.sectionText}>
            {t("onboarding.whatIsText")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("onboarding.howToUse")}</Text>
          <Text style={styles.sectionText}>
            {t("onboarding.howToUseText")}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <AppButton title={t("onboarding.getStarted")} onPress={handleGetStarted} />
        </View>
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
    gap: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: getTextSize(32, textSize),
    textAlign: "center",
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: getTextSize(20, textSize),
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: getTextSize(16, textSize),
    color: colors.textSecondary,
    lineHeight: getLineHeight(getTextSize(16, textSize)),
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
});

