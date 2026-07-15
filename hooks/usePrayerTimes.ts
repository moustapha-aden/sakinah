import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export interface CalculationMethod {
  id: number;
  key: string;
}

// Méthodes de calcul disponibles côté API AlAdhan (https://aladhan.com/prayer-times-api)
export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 3, key: "mwl" },
  { id: 2, key: "isna" },
  { id: 5, key: "egyptian" },
  { id: 4, key: "makkah" },
  { id: 1, key: "karachi" },
  { id: 12, key: "uoif" },
  { id: 8, key: "gulf" },
  { id: 13, key: "diyanet" },
];

export const DISPLAY_PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type DisplayPrayer = (typeof DISPLAY_PRAYERS)[number];

// Clé de traduction (namespace prayerTimes.*) associée à chaque prière
export const PRAYER_LABEL_KEYS: Record<DisplayPrayer, string> = {
  Fajr: "fajr",
  Sunrise: "sunrise",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
};

export const REAL_PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type RealPrayer = (typeof REAL_PRAYERS)[number];

type LocationMode = "gps" | "manual";

interface ManualLocation {
  city: string;
  country: string;
}

interface PrayerSettings {
  mode: LocationMode;
  method: number;
  manualLocation: ManualLocation | null;
}

type PrayerTimings = Record<DisplayPrayer, string>;

interface CachedData {
  dateKey: string;
  paramsKey: string;
  timings: PrayerTimings;
  locationLabel: string;
  hijriDate: string;
}

const SETTINGS_KEY = "@sakinah_prayer_settings";
const CACHE_KEY = "@sakinah_prayer_cache";

const defaultSettings: PrayerSettings = {
  mode: "gps",
  method: 3,
  manualLocation: null,
};

function formatDateParam(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function dateKey(d: Date): string {
  return d.toDateString();
}

export function usePrayerTimes() {
  const [settings, setSettingsState] = useState<PrayerSettings>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [hijriDate, setHijriDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"permission_denied" | "network" | null>(null);
  const [now, setNow] = useState(new Date());

  // Tick chaque seconde : le compte à rebours affiche les secondes
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) setSettingsState({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (error) {
        console.error("Error loading prayer settings:", error);
      } finally {
        setSettingsLoaded(true);
      }
    })();
  }, []);

  const persistSettings = useCallback((updated: PrayerSettings) => {
    setSettingsState(updated);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch((error) =>
      console.error("Error saving prayer settings:", error)
    );
  }, []);

  const setMethod = useCallback(
    (method: number) => persistSettings({ ...settings, method }),
    [settings, persistSettings]
  );

  const setManualLocation = useCallback(
    (city: string, country: string) =>
      persistSettings({ ...settings, mode: "manual", manualLocation: { city, country } }),
    [settings, persistSettings]
  );

  const useGps = useCallback(
    () => persistSettings({ ...settings, mode: "gps" }),
    [settings, persistSettings]
  );

  const fetchTimings = useCallback(
    async (opts?: { force?: boolean }) => {
      setLoading(true);
      setError(null);
      const today = new Date();
      const dKey = dateKey(today);

      try {
        let paramsKey: string;
        let url: string;
        let label = "";

        if (settings.mode === "manual" && settings.manualLocation) {
          const { city, country } = settings.manualLocation;
          paramsKey = `city:${city}:${country}:${settings.method}`;
          url = `https://api.aladhan.com/v1/timingsByCity/${formatDateParam(today)}?city=${encodeURIComponent(
            city
          )}&country=${encodeURIComponent(country)}&method=${settings.method}`;
          label = `${city}, ${country}`;
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setError("permission_denied");
            setLoading(false);
            return;
          }
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = position.coords;
          paramsKey = `gps:${latitude.toFixed(2)}:${longitude.toFixed(2)}:${settings.method}`;
          url = `https://api.aladhan.com/v1/timings/${formatDateParam(
            today
          )}?latitude=${latitude}&longitude=${longitude}&method=${settings.method}`;

          try {
            const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (place) {
              label = [place.city || place.subregion, place.country].filter(Boolean).join(", ");
            }
          } catch {
            // La géolocalisation inversée est un bonus d'affichage, pas bloquant.
          }
        }

        if (!opts?.force) {
          const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
          if (cachedRaw) {
            const cached: CachedData = JSON.parse(cachedRaw);
            if (cached.dateKey === dKey && cached.paramsKey === paramsKey) {
              setTimings(cached.timings);
              setLocationLabel(cached.locationLabel);
              setHijriDate(cached.hijriDate);
              setLoading(false);
              return;
            }
          }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("network");
        const json = await response.json();
        const rawTimings = json?.data?.timings;
        if (!rawTimings) throw new Error("network");

        const cleaned = DISPLAY_PRAYERS.reduce((acc, key) => {
          acc[key] = String(rawTimings[key] || "").split(" ")[0];
          return acc;
        }, {} as PrayerTimings);

        const hijri = json?.data?.date?.hijri;
        const hijriLabel = hijri ? `${hijri.day} ${hijri.month?.en ?? ""} ${hijri.year}`.trim() : "";

        if (!label) {
          label = json?.data?.meta?.timezone || "";
        }

        setTimings(cleaned);
        setLocationLabel(label);
        setHijriDate(hijriLabel);

        const toCache: CachedData = {
          dateKey: dKey,
          paramsKey,
          timings: cleaned,
          locationLabel: label,
          hijriDate: hijriLabel,
        };
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCache)).catch(() => {});
      } catch (fetchError) {
        console.error("Error fetching prayer timings:", fetchError);
        try {
          const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
          if (cachedRaw) {
            const cached: CachedData = JSON.parse(cachedRaw);
            setTimings(cached.timings);
            setLocationLabel(cached.locationLabel);
            setHijriDate(cached.hijriDate);
          } else {
            setError("network");
          }
        } catch {
          setError("network");
        }
      } finally {
        setLoading(false);
      }
    },
    [settings]
  );

  useEffect(() => {
    if (settingsLoaded) fetchTimings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded, settings.mode, settings.method, settings.manualLocation?.city, settings.manualLocation?.country]);

  const { nextPrayer, currentPrayer, countdownLabel, minutesRemaining, progressToNext } = useMemo(() => {
    if (!timings) {
      return {
        nextPrayer: null as RealPrayer | null,
        currentPrayer: null as RealPrayer | null,
        countdownLabel: "",
        minutesRemaining: null as number | null,
        progressToNext: 0,
      };
    }

    const base = new Date(now);
    base.setSeconds(0, 0);

    const entries = REAL_PRAYERS.map((key) => {
      const [h, m] = (timings[key] || "00:00").split(":").map(Number);
      const date = new Date(base);
      date.setHours(h, m, 0, 0);
      return { key, date };
    });

    let nextEntry = entries.find((e) => e.date.getTime() > now.getTime());
    let current: RealPrayer | null;
    let prevDate: Date;

    const DAY_MS = 24 * 60 * 60 * 1000;
    if (!nextEntry) {
      // Après Isha : la prochaine est le Fajr de demain (approximé avec l'heure d'aujourd'hui).
      nextEntry = { key: "Fajr", date: new Date(entries[0].date.getTime() + DAY_MS) };
      current = "Isha";
      prevDate = entries[entries.length - 1].date;
    } else {
      const idx = entries.findIndex((e) => e.key === nextEntry!.key);
      current = idx > 0 ? entries[idx - 1].key : null;
      // Avant le Fajr : la période en cours a commencé à l'Isha d'hier (approximé à -24h).
      prevDate = idx > 0 ? entries[idx - 1].date : new Date(entries[entries.length - 1].date.getTime() - DAY_MS);
    }

    const diffSec = Math.max(0, Math.floor((nextEntry.date.getTime() - now.getTime()) / 1000));
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    // Format compte à rebours : "1:05:32" ou "05:32"
    const label = hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
    const diffMin = Math.floor(diffSec / 60);

    const total = nextEntry.date.getTime() - prevDate.getTime();
    const elapsed = now.getTime() - prevDate.getTime();
    const progress = total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : 0;

    return {
      nextPrayer: nextEntry.key,
      currentPrayer: current,
      countdownLabel: label,
      minutesRemaining: diffMin,
      progressToNext: progress,
    };
  }, [timings, now]);

  return {
    loading,
    error,
    timings,
    locationLabel,
    hijriDate,
    settings,
    methods: CALCULATION_METHODS,
    setMethod,
    setManualLocation,
    useGps,
    refresh: () => fetchTimings({ force: true }),
    nextPrayer,
    currentPrayer,
    countdownLabel,
    minutesRemaining,
    progressToNext,
  };
}
