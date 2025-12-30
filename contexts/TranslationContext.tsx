import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { translations } from "../utils/translations";
import { useSettings } from "./SettingsContext";

interface TranslationContextType {
  t: (key: string) => string;
  language: string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const lang = settings.language || "fr";
  const langTranslations = translations[lang] || translations.fr;

  // Mémoriser la fonction t pour qu'elle se mette à jour quand la langue change
  const t = useMemo(() => {
    return (key: string): string => {
      const keys = key.split(".");
      let value: any = langTranslations;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k as keyof typeof value];
        } else {
          // Fallback to French if key not found
          let fallbackValue: any = translations.fr;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk as keyof typeof fallbackValue];
            } else {
              return key; // Return key if not found in fallback
            }
          }
          return typeof fallbackValue === "string" ? fallbackValue : key;
        }
      }

      return typeof value === "string" ? value : key;
    };
  }, [lang, langTranslations]);

  const value = useMemo(() => ({ t, language: lang }), [t, lang]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}

