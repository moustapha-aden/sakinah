import { useCallback } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { hadiths } from "../data/hadith";
import { translations } from "../utils/translations";
import type { Language } from "../contexts/SettingsContext";
import { REAL_PRAYERS, PRAYER_LABEL_KEYS, type RealPrayer } from "./usePrayerTimes";

const PRAYER_REMINDER_PREFIX = "sakinah-prayer-";

const MORNING_REMINDER_ID = "sakinah-adkar-morning";
const EVENING_REMINDER_ID = "sakinah-adkar-evening";
// Son court joint à la notification (voir assets/audio/notification_chime.wav).
// Nécessite un dev build / build EAS : les sons personnalisés ne jouent pas dans Expo Go.
const PRAYER_NOTIFICATION_SOUND = "notification_chime.wav";

// Depuis le SDK 53, expo-notifications déclenche un ERROR au simple import dans
// Expo Go (Android). On charge donc le module à la demande, et on le neutralise
// dans Expo Go Android pour garder un démarrage propre.
const isExpoGoAndroid =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
  Platform.OS === "android";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null = null;
let expoGoNoticeShown = false;

function getNotifications(): NotificationsModule | null {
  if (isExpoGoAndroid) {
    if (!expoGoNoticeShown) {
      expoGoNoticeShown = true;
      console.log(
        "ℹ️ Notifications indisponibles dans Expo Go (Android) — utilisez un development build pour les tester."
      );
    }
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = require("expo-notifications") as NotificationsModule;
    notificationsModule.setNotificationHandler({
      handleNotification: async (notification) => {
        const isPrayerReminder = notification.request.identifier?.startsWith(PRAYER_REMINDER_PREFIX);
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: !!isPrayerReminder,
          shouldSetBadge: false,
        };
      },
    });
  }
  return notificationsModule;
}

async function ensureAndroidChannel(Notifications: NotificationsModule) {
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
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const Notifications = getNotifications();
    if (!Notifications) return false;
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  }, []);

  const scheduleDailyReminders = useCallback(async (language: Language) => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    await ensureAndroidChannel(Notifications);
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
    const Notifications = getNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  // Planifie une notification (avec son court) pour chaque prière du jour pas encore passée.
  // À rappeler dès que de nouveaux horaires sont disponibles (nouvelle position/jour) :
  // les anciennes notifications de prière sont annulées puis reprogrammées.
  const schedulePrayerReminders = useCallback(
    async (timings: Partial<Record<RealPrayer, string>>, language: Language) => {
      const Notifications = getNotifications();
      if (!Notifications) return;
      await ensureAndroidChannel(Notifications);

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        scheduled
          .filter((n) => n.identifier?.startsWith(PRAYER_REMINDER_PREFIX))
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );

      const langTranslations = translations[language] || translations.fr;
      const today = new Date();
      const dateStamp = today.toDateString();

      for (const key of REAL_PRAYERS) {
        const timeStr = timings[key];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(":").map(Number);
        const date = new Date(today);
        date.setHours(h, m, 0, 0);
        if (date.getTime() <= Date.now()) continue;

        const label = (langTranslations.prayerTimes as any)?.[PRAYER_LABEL_KEYS[key]] || key;
        const bodyTemplate = (langTranslations.prayerTimes as any)?.notificationBody || "{prayer}";

        await Notifications.scheduleNotificationAsync({
          identifier: `${PRAYER_REMINDER_PREFIX}${key}-${dateStamp}`,
          content: {
            title: `🕌 ${label}`,
            body: bodyTemplate.replace("{prayer}", label).replace("{time}", timeStr),
            sound: PRAYER_NOTIFICATION_SOUND,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
        });
      }
    },
    []
  );

  const sendTestNotification = useCallback(async (language: Language) => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    await ensureAndroidChannel(Notifications);
    const quote = pickRandomQuote(language);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sakīnah",
        body: quote ? `${quote.translation}${quote.source ? ` — ${quote.source}` : ""}` : "Sakīnah",
      },
      trigger: null,
    });
  }, []);

  return { requestPermission, scheduleDailyReminders, schedulePrayerReminders, cancelAll, sendTestNotification };
}
