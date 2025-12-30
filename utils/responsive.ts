import { Dimensions, Platform } from "react-native";
import { getTextSize } from "./textSize";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Définir les breakpoints
const isSmallScreen = SCREEN_WIDTH < 375; // iPhone SE, petits Android
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414; // iPhone standard
const isLargeScreen = SCREEN_WIDTH >= 414; // iPhone Plus, grands Android

// Facteurs de réduction pour petits écrans
const getResponsiveSize = (baseSize: number): number => {
  if (isSmallScreen) {
    return baseSize * 0.85; // Réduire de 15% sur petits écrans
  } else if (isMediumScreen) {
    return baseSize * 0.95; // Réduire de 5% sur écrans moyens
  }
  return baseSize; // Taille normale sur grands écrans
};

// Padding responsive
const getResponsivePadding = (basePadding: number): number => {
  if (isSmallScreen) {
    return basePadding * 0.75; // Réduire le padding de 25%
  } else if (isMediumScreen) {
    return basePadding * 0.9; // Réduire de 10%
  }
  return basePadding;
};

// Margin responsive
const getResponsiveMargin = (baseMargin: number): number => {
  if (isSmallScreen) {
    return baseMargin * 0.7; // Réduire les marges de 30%
  } else if (isMediumScreen) {
    return baseMargin * 0.85; // Réduire de 15%
  }
  return baseMargin;
};

// Taille de police responsive (en plus de textSize)
const getResponsiveFontSize = (baseSize: number, textSize: any): number => {
  const adjustedSize = getTextSize(baseSize, textSize);
  if (isSmallScreen) {
    return adjustedSize * 0.9; // Réduire encore un peu sur petits écrans
  }
  return adjustedSize;
};

export {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  getResponsiveSize,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveFontSize,
};

