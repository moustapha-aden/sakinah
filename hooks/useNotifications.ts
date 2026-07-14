import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { hadiths } from "../data/hadith";
import { translations } from "../utils/translations";
import type { Language } from "../contexts/SettingsContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const MORNING_REMINDER_ID = "sakinah-adkar-morning";
const EVENING_REMINDER_ID = "sakinah-adkar-evening";

async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Sakīnah",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function pickRandomQuote(language: Language) {
  const langTranslations = translations[language] || translations.fr;
  const candidates = hadiths
    .map((hadith) => {
      const quoteData = (langTranslations.home?.quotes as any)?.[hadith.translationKey];
      if (quoteData && typeof quoteData === "object" && "translation" in quoteData) {
        return { translation: quoteData.translation as string, source: (quoteData.source as string) || "" };
      }
      return null;
    })
    .filter((q): q is { translation: string; source: string } => q !== null);

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function useNotifications() {
  useEffect(() => {
    ensureAndroidChannel();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  }, []);

  const scheduleDailyReminders = useCallback(async (language: Language) => {
    await ensureAndroidChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();

    const langTranslations = translations[language] || translations.fr;
    const morningTitle = `🌅 ${langTranslations.adkar?.morningFr || langTranslations.adkar?.title}`;
    const eveningTitle = `🌙 ${langTranslations.adkar?.eveningFr || langTranslations.adkar?.title}`;

    await Notifications.scheduleNotificationAsync({
      identifier: MORNING_REMINDER_ID,
      content: { title: morningTitle, body: langTranslations.tasbih?.reminder || "" },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 7, minute: 0 },
    });

    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_REMINDER_ID,
      content: { title: eveningTitle, body: langTranslations.tasbih?.reminder || "" },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 18, minute: 0 },
    });
  }, []);

  const cancelAll = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  const sendTestNotification = useCallback(async (language: Language) => {
    await ensureAndroidChannel();
    const quote = pickRandomQuote(language);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sakīnah",
        body: quote ? `${quote.translation}${quote.source ? ` — ${quote.source}` : ""}` : "Sakīnah",
      },
      trigger: null,
    });
  }, []);

  return { requestPermission, scheduleDailyReminders, cancelAll, sendTestNotification };
}
