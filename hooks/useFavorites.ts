import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@sakinah_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les favoris au démarrage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (duaId: string) => {
    try {
      const newFavorites = [...favorites, duaId];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  const removeFavorite = async (duaId: string) => {
    try {
      const newFavorites = favorites.filter((id) => id !== duaId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const toggleFavorite = async (duaId: string) => {
    if (isFavorite(duaId)) {
      await removeFavorite(duaId);
    } else {
      await addFavorite(duaId);
    }
  };

  const isFavorite = (duaId: string) => {
    return favorites.includes(duaId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}

