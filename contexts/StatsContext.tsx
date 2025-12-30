import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "@sakinah_stats";
const LAST_ADKAR_DATE_KEY = "@sakinah_last_adkar_date";
const STREAK_START_DATE_KEY = "@sakinah_streak_start_date";

interface Stats {
  streakDays: number;
  completedAdkar: number;
  lastAdkarDate: string | null;
  streakStartDate: string | null;
}

const defaultStats: Stats = {
  streakDays: 0,
  completedAdkar: 0,
  lastAdkarDate: null,
  streakStartDate: null,
};

interface StatsContextType {
  stats: Stats;
  loading: boolean;
  recordAdkarCompletion: () => Promise<void>;
  resetStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(true);

  const calculateStreakDays = useCallback((startDate: string): number => {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays + 1);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const [storedStats, lastAdkarDate, streakStartDate] = await Promise.all([
        AsyncStorage.getItem(STATS_KEY),
        AsyncStorage.getItem(LAST_ADKAR_DATE_KEY),
        AsyncStorage.getItem(STREAK_START_DATE_KEY),
      ]);

      const loadedStats: Stats = {
        ...defaultStats,
        ...(storedStats ? JSON.parse(storedStats) : {}),
        lastAdkarDate: lastAdkarDate || null,
        streakStartDate: streakStartDate || null,
      };

      // Vérifier et mettre à jour la série de jours
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      if (loadedStats.lastAdkarDate === today) {
        // Aujourd'hui déjà complété, mettre à jour le streak si nécessaire
        const streakStart = loadedStats.streakStartDate || today;
        const streakDays = calculateStreakDays(streakStart);
        setStats({
          ...loadedStats,
          streakDays,
        });
      } else if (loadedStats.lastAdkarDate === yesterday) {
        // Hier complété, continuer la série
        const streakStart = loadedStats.streakStartDate || yesterday;
        const streakDays = calculateStreakDays(streakStart);
        setStats({
          ...loadedStats,
          streakDays,
          streakStartDate: streakStart,
        });
      } else if (loadedStats.lastAdkarDate) {
        // Série rompue, réinitialiser le streak mais garder le compteur
        setStats({
          ...loadedStats,
          streakDays: 0,
          streakStartDate: null,
        });
      } else {
        setStats(loadedStats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  }, [calculateStreakDays]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const recordAdkarCompletion = useCallback(async () => {
    try {
      console.log(`🟢 recordAdkarCompletion appelé`);
      
      // Charger les stats actuelles depuis le storage pour éviter les problèmes de closure
      const [storedStats, lastAdkarDate, streakStartDate] = await Promise.all([
        AsyncStorage.getItem(STATS_KEY),
        AsyncStorage.getItem(LAST_ADKAR_DATE_KEY),
        AsyncStorage.getItem(STREAK_START_DATE_KEY),
      ]);

      const currentStats: Stats = {
        ...defaultStats,
        ...(storedStats ? JSON.parse(storedStats) : {}),
        lastAdkarDate: lastAdkarDate || null,
        streakStartDate: streakStartDate || null,
      };

      console.log(`🟢 Stats actuelles:`, currentStats);

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      console.log(`🟢 Aujourd'hui: ${today}, Hier: ${yesterday}`);
      console.log(`🟢 lastAdkarDate: ${currentStats.lastAdkarDate}`);
      
      // Si déjà complété aujourd'hui, ne pas modifier le streak mais incrémenter le compteur
      if (currentStats.lastAdkarDate === today) {
        console.log(`🟢 Même jour - incrémentation du compteur seulement`);
        // Incrémenter seulement le compteur d'adhkar complétés
        const updatedStats: Stats = {
          ...currentStats,
          completedAdkar: currentStats.completedAdkar + 1,
        };
        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
        setStats(updatedStats);
        console.log(`📊 Stats mises à jour (même jour): ${updatedStats.completedAdkar} adkâr complétés, streak: ${updatedStats.streakDays} jours`);
        return;
      }

      // Nouveau jour : mettre à jour le streak et le compteur
      let newStreakDays = currentStats.streakDays;
      let newStreakStartDate = currentStats.streakStartDate;

      if (currentStats.lastAdkarDate === yesterday || currentStats.lastAdkarDate === null) {
        // Continuer ou commencer la série
        if (!currentStats.streakStartDate) {
          newStreakStartDate = today;
        }
        newStreakDays = calculateStreakDays(newStreakStartDate || today);
      } else if (currentStats.lastAdkarDate) {
        // Série rompue, recommencer
        newStreakStartDate = today;
        newStreakDays = 1;
      } else {
        // Première fois
        newStreakStartDate = today;
        newStreakDays = 1;
      }

      const updatedStats: Stats = {
        streakDays: newStreakDays,
        completedAdkar: currentStats.completedAdkar + 1,
        lastAdkarDate: today,
        streakStartDate: newStreakStartDate,
      };

      console.log(`🟢 Nouveau jour - Stats à enregistrer:`, updatedStats);

      await Promise.all([
        AsyncStorage.setItem(STATS_KEY, JSON.stringify(updatedStats)),
        AsyncStorage.setItem(LAST_ADKAR_DATE_KEY, today),
        AsyncStorage.setItem(STREAK_START_DATE_KEY, newStreakStartDate || ""),
      ]);

      setStats(updatedStats);
      console.log(`🎉 Nouveau jour! Stats: ${updatedStats.completedAdkar} adkâr complétés, streak: ${updatedStats.streakDays} jours`);
      
      // Vérifier que les stats ont bien été sauvegardées
      const verifyStats = await AsyncStorage.getItem(STATS_KEY);
      console.log(`🟢 Vérification - Stats sauvegardées:`, verifyStats);
    } catch (error) {
      console.error("Error recording adkar completion:", error);
    }
  }, [calculateStreakDays]);

  const resetStats = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STATS_KEY),
        AsyncStorage.removeItem(LAST_ADKAR_DATE_KEY),
        AsyncStorage.removeItem(STREAK_START_DATE_KEY),
      ]);
      setStats(defaultStats);
    } catch (error) {
      console.error("Error resetting stats:", error);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  return (
    <StatsContext.Provider
      value={{
        stats,
        loading,
        recordAdkarCompletion,
        resetStats,
        refreshStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
}

