import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function RootLayoutNav() {
  const { colors, theme } = useTheme();

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
        <Stack.Screen name="index" options={{ title: "Sakīnah" }} />
        <Stack.Screen name="adkar/index" options={{ title: "Adkâr" }} />
        <Stack.Screen name="dua/index" options={{ title: "Duʿāʾ" }} />
        <Stack.Screen name="settings/favorites" options={{ title: "Favoris" }} />
        <Stack.Screen name="dua/onboarding" options={{ title: "Bienvenue" }} />
        <Stack.Screen name="settings/settings" options={{ title: "Paramètres" }} />
        <Stack.Screen name="settings/language" options={{ title: "Langue" }} />
        <Stack.Screen name="settings/textSize" options={{ title: "Taille du texte" }} />
        <Stack.Screen name="settings/help" options={{ title: "Aide" }} />
        <Stack.Screen name="counter" options={{ title: "Tasbih" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
