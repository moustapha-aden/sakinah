import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@sakinah_settings";

export type Language = "fr" | "ar" | "en";
export type TextSize = "small" | "medium" | "large";

interface Settings {
  notifications: boolean;
  language: Language;
  textSize: TextSize;
}

const defaultSettings: Settings = {
  notifications: true,
  language: "fr",
  textSize: "medium",
};

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  setNotifications: (enabled: boolean) => void;
  setLanguage: (language: Language) => void;
  setTextSize: (textSize: TextSize) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      setSettings(updated);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const setNotifications = (enabled: boolean) => {
    updateSettings({ notifications: enabled });
  };

  const setLanguage = (language: Language) => {
    updateSettings({ language });
  };

  const setTextSize = (textSize: TextSize) => {
    updateSettings({ textSize });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        setNotifications,
        setLanguage,
        setTextSize,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

