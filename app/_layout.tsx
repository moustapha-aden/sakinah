import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useLayoutEffect } from "react";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { TranslationProvider, useTranslation } from "../contexts/TranslationContext";
import { StatsProvider } from "../contexts/StatsContext";
import { useNavigation } from "expo-router";
import { useSettings } from "../hooks/useSettings";
import { useNotifications } from "../hooks/useNotifications";

function RootLayoutNav() {
  const { colors, theme } = useTheme();
  const { t, language } = useTranslation();
  const navigation = useNavigation();
  const { settings, loading: settingsLoading } = useSettings();
  const { scheduleDailyReminders } = useNotifications();

  // Reprogrammer les rappels au démarrage si l'utilisateur les avait activés
  // (ils peuvent être perdus après une réinstallation ou un redémarrage de l'appareil)
  useEffect(() => {
    if (!settingsLoading && settings.notifications) {
      scheduleDailyReminders(settings.language);
    }
  }, [settingsLoading, settings.notifications, settings.language, scheduleDailyReminders]);

  // Mettre à jour les titres des écrans quand la langue change
  useLayoutEffect(() => {
    // Mettre à jour les options de navigation pour forcer le re-render
    navigation.setOptions({
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.textPrimary,
      headerTitleAlign: "center",
    });
  }, [navigation, colors, language]);

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textPrimary,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: t("home.title"),
            headerRight: undefined, // Sera défini dans le composant
          }} 
        />
        <Stack.Screen 
          name="adkar/index" 
          options={{ title: t("adkar.title") }} 
        />
        <Stack.Screen 
          name="dua/index" 
          options={{ title: t("dua.title") }} 
        />
        <Stack.Screen 
          name="settings/favorites" 
          options={{ title: t("favorites.title") }} 
        />
        <Stack.Screen 
          name="dua/onboarding" 
          options={{ title: t("onboarding.title") }} 
        />
        <Stack.Screen 
          name="settings/settings" 
          options={{ title: t("settings.title") }} 
        />
        <Stack.Screen 
          name="settings/language" 
          options={{ title: t("language.title") }} 
        />
        <Stack.Screen 
          name="settings/textSize" 
          options={{ title: t("textSize.title") }} 
        />
        <Stack.Screen 
          name="settings/help" 
          options={{ title: t("help.title") }} 
        />
        <Stack.Screen 
          name="tasbih" 
          options={{ title: t("tasbih.title") }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <StatsProvider>
          <TranslationProvider>
            <RootLayoutNav />
          </TranslationProvider>
        </StatsProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
