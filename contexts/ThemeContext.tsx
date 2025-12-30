import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: "light" | "dark";
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

const THEME_STORAGE_KEY = "@sakinah_theme_mode";

// Couleurs pour le mode clair
export const lightColors = {
  primary: "#B6DBF2",
  background: "#F9FBFC",
  card: "#EAF4FB",
  accent: "#E6B65C",
  textPrimary: "#1F2A44",
  textSecondary: "#6B7C93",
  border: "#DCE6EE",
};

// Couleurs pour le mode sombre
export const darkColors = {
  primary: "#1A2332",
  background: "#0F1419",
  card: "#1A2332",
  accent: "#E6B65C",
  textPrimary: "#E8EAED",
  textSecondary: "#9AA0A6",
  border: "#2D3748",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Charger le mode de thème sauvegardé
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Mettre à jour le thème selon le mode
  useEffect(() => {
    if (themeMode === "auto") {
      setTheme(systemColorScheme === "dark" ? "dark" : "light");
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === "light" || saved === "dark" || saved === "auto")) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error("Error loading theme mode:", error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Error saving theme mode:", error);
    }
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

