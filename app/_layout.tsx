import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../constants/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
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
        <Stack.Screen name="counter" options={{ title: "Tasbih" }} />
      </Stack>
    </>
  );
}
