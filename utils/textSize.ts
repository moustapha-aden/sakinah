import { TextSize } from "../contexts/SettingsContext";

const TEXT_SIZE_MULTIPLIERS = {
  small: 0.85,
  medium: 1.0,
  large: 1.15,
};

/**
 * Calcule la taille du texte selon le paramètre utilisateur
 * @param baseSize Taille de base en pixels
 * @param textSize Paramètre de taille (small, medium, large)
 * @returns Taille ajustée en pixels
 */
export function getTextSize(baseSize: number, textSize: TextSize): number {
  const multiplier = TEXT_SIZE_MULTIPLIERS[textSize] || 1.0;
  return Math.round(baseSize * multiplier);
}

/**
 * Calcule le lineHeight proportionnel à la taille de police
 * @param fontSize Taille de la police
 * @param ratio Ratio par défaut (1.5 = 150% de la taille de police)
 * @returns LineHeight calculé
 */
export function getLineHeight(fontSize: number, ratio: number = 1.5): number {
  return Math.round(fontSize * ratio);
}

