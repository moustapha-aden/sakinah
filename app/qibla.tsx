import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize } from "../utils/textSize";
import { analytics } from "../lib/firebase";
import {
  SCREEN_WIDTH,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveSize,
} from "../utils/responsive";

// Coordonnées de la Kaaba (Masjid al-Haram, La Mecque)
const KAABA = { latitude: 21.4225, longitude: 39.8262 };

const COMPASS_SIZE = Math.min(SCREEN_WIDTH - 80, 300);

// Tolérance d'alignement avec la Qibla (en degrés)
const ALIGNED_TOLERANCE = 5;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const normalize = (deg: number) => ((deg % 360) + 360) % 360;

// Cap initial du grand cercle vers la Kaaba depuis la position donnée
function qiblaBearing(latitude: number, longitude: number): number {
  const phi1 = toRad(latitude);
  const phi2 = toRad(KAABA.latitude);
  const deltaLambda = toRad(KAABA.longitude - longitude);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return normalize(toDeg(Math.atan2(y, x)));
}

// Distance grand cercle (haversine) jusqu'à la Kaaba, en km
function distanceToKaabaKm(latitude: number, longitude: number): number {
  const R = 6371;
  const phi1 = toRad(latitude);
  const phi2 = toRad(KAABA.latitude);
  const deltaPhi = toRad(KAABA.latitude - latitude);
  const deltaLambda = toRad(KAABA.longitude - longitude);
  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CARDINAL_KEYS = ["north", "east", "south", "west"] as const;

export default function QiblaScreen() {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [compassAvailable, setCompassAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  const bearing = useMemo(
    () => (coords ? qiblaBearing(coords.latitude, coords.longitude) : null),
    [coords]
  );
  const distanceKm = useMemo(
    () => (coords ? distanceToKaabaKm(coords.latitude, coords.longitude) : null),
    [coords]
  );

  const delta = heading != null && bearing != null ? normalize(bearing - heading) : null;
  const isAligned =
    delta != null && (delta <= ALIGNED_TOLERANCE || delta >= 360 - ALIGNED_TOLERANCE);

  // Rotation du cadran : accumulée pour toujours tourner par le chemin le plus court
  const dialAnim = useRef(new Animated.Value(0)).current;
  const dialValue = useRef(0);
  useEffect(() => {
    if (heading == null) return;
    const current = normalize(dialValue.current);
    const target = normalize(-heading);
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const next = dialValue.current + diff;
    dialValue.current = next;
    Animated.timing(dialAnim, {
      toValue: next,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [heading]);

  // Pulsation douce quand on est aligné avec la Qibla
  const alignedScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isAligned) {
      Animated.spring(alignedScale, { toValue: 1.04, friction: 4, useNativeDriver: true }).start();
    } else {
      Animated.spring(alignedScale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    }
  }, [isAligned]);

  const lastHeadingRef = useRef<number | null>(null);
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);

  const init = useCallback(async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      // Position : la dernière connue suffit largement pour la Qibla
      let position = await Location.getLastKnownPositionAsync();
      if (!position) {
        position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });

      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          setLocationLabel(
            [place.city || place.subregion, place.country].filter(Boolean).join(", ")
          );
        }
      } catch {
        // Libellé de position facultatif
      }

      // Boussole : cap vrai si dispo, sinon cap magnétique
      try {
        headingSubRef.current?.remove();
        headingSubRef.current = await Location.watchHeadingAsync((data) => {
          const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          const rounded = Math.round(raw);
          if (lastHeadingRef.current !== rounded) {
            lastHeadingRef.current = rounded;
            setHeading(rounded);
          }
        });
      } catch {
        setCompassAvailable(false);
      }
    } catch (error) {
      console.error("Error initializing qibla screen:", error);
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (analytics && analytics.logEvent) {
      analytics.logEvent("open_qibla");
    }
    init();
    return () => {
      headingSubRef.current?.remove();
    };
  }, [init]);

  const dialRotation = dialAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // ÉTAT : PERMISSION REFUSÉE
  if (permissionDenied) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="location-outline" size={56} color={colors.textSecondary} />
        <Text style={styles.errorTitle}>{t("qibla.permissionDeniedTitle")}</Text>
        <Text style={styles.errorText}>{t("qibla.permissionDeniedText")}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={init}
          android_ripple={{ color: "#FFFFFF30" }}
        >
          <Text style={styles.retryButtonText}>{t("qibla.retry")}</Text>
        </Pressable>
      </View>
    );
  }

  // ÉTAT : CHARGEMENT
  if (loading || bearing == null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>{t("qibla.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* POSITION */}
      {locationLabel !== "" && (
        <View style={styles.locationChip}>
          <Ionicons name="location" size={14} color={colors.accent} />
          <Text style={styles.locationText}>{locationLabel}</Text>
        </View>
      )}

      {/* INSTRUCTION / ALIGNÉ */}
      <Text style={[styles.instruction, isAligned && styles.instructionAligned]}>
        {isAligned ? t("qibla.facing") : t("qibla.instruction")}
      </Text>

      {/* BOUSSOLE */}
      <Animated.View style={{ transform: [{ scale: alignedScale }] }}>
        <View style={styles.compassZone}>
          {/* Repère fixe (direction du téléphone) */}
          <View style={styles.topPointer}>
            <Ionicons
              name="caret-down"
              size={28}
              color={isAligned ? "#2ECC71" : colors.accent}
            />
          </View>

          {/* Cadran rotatif */}
          <Animated.View
            style={[
              styles.dial,
              isAligned && styles.dialAligned,
              { transform: [{ rotate: dialRotation }] },
            ]}
          >
            {/* Graduations */}
            {Array.from({ length: 24 }).map((_, i) => (
              <View
                key={i}
                style={[styles.tickWrapper, { transform: [{ rotate: `${i * 15}deg` }] }]}
              >
                <View style={[styles.tick, i % 6 === 0 && styles.tickMajor]} />
              </View>
            ))}

            {/* Points cardinaux */}
            {CARDINAL_KEYS.map((key, i) => (
              <View
                key={key}
                style={[styles.tickWrapper, { transform: [{ rotate: `${i * 90}deg` }] }]}
              >
                <Text style={[styles.cardinal, i === 0 && styles.cardinalNorth]}>
                  {t(`qibla.${key}`)}
                </Text>
              </View>
            ))}

            {/* Aiguille Qibla : fixe sur le cadran, à l'azimut de la Kaaba */}
            <View style={[styles.tickWrapper, { transform: [{ rotate: `${bearing}deg` }] }]}>
              <Text style={styles.kaabaEmoji}>🕋</Text>
              <View
                style={[
                  styles.needle,
                  { backgroundColor: isAligned ? "#2ECC71" : colors.accent },
                ]}
              />
            </View>

            {/* Centre */}
            <View style={styles.centerDot} />
          </Animated.View>
        </View>
      </Animated.View>

      {/* CAP ACTUEL */}
      {compassAvailable && heading != null && (
        <View style={styles.headingChip}>
          <MaterialCommunityIcons name="compass-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.headingChipText}>{Math.round(heading)}°</Text>
        </View>
      )}

      {/* BOUSSOLE INDISPONIBLE (émulateur, capteur absent) */}
      {!compassAvailable && (
        <Text style={styles.noCompassText}>
          {t("qibla.compassUnavailable").replace("{degrees}", String(Math.round(bearing)))}
        </Text>
      )}

      {/* INFOS */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="compass" size={24} color={colors.accent} />
          <Text style={styles.infoValue}>{Math.round(bearing)}°</Text>
          <Text style={styles.infoLabel}>{t("qibla.qiblaDirection")}</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="map-marker-distance" size={24} color={colors.accent} />
          <Text style={styles.infoValue}>
            {Math.round(distanceKm ?? 0).toLocaleString(
              language === "ar" ? "ar" : language === "en" ? "en-US" : "fr-FR"
            )}{" "}
            km
          </Text>
          <Text style={styles.infoLabel}>{t("qibla.distance")}</Text>
        </View>
      </View>

      {/* ASTUCE CALIBRATION */}
      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.hintText}>{t("qibla.calibrationHint")}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any, textSize: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: getResponsivePadding(20),
      alignItems: "center",
    },

    centered: {
      justifyContent: "center",
      gap: 12,
    },

    locationChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 14,
      marginBottom: getResponsiveMargin(12),
    },

    locationText: {
      fontSize: getTextSize(13, textSize),
      color: colors.textPrimary,
      fontWeight: "600",
    },

    instruction: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: getResponsiveMargin(18),
      paddingHorizontal: 10,
    },

    instructionAligned: {
      color: "#2ECC71",
      fontWeight: "700",
    },

    compassZone: {
      width: COMPASS_SIZE,
      alignItems: "center",
    },

    topPointer: {
      marginBottom: -8,
      zIndex: 2,
    },

    dial: {
      width: COMPASS_SIZE,
      height: COMPASS_SIZE,
      borderRadius: COMPASS_SIZE / 2,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },

    dialAligned: {
      borderColor: "#2ECC71",
      shadowColor: "#2ECC71",
      shadowOpacity: 0.4,
    },

    tickWrapper: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
    },

    tick: {
      width: 2,
      height: 10,
      marginTop: 10,
      borderRadius: 1,
      backgroundColor: colors.border,
    },

    tickMajor: {
      width: 3,
      height: 16,
      backgroundColor: colors.textSecondary,
    },

    cardinal: {
      marginTop: 28,
      fontSize: getTextSize(16, textSize),
      fontWeight: "700",
      color: colors.textSecondary,
    },

    cardinalNorth: {
      color: "#E74C3C",
    },

    kaabaEmoji: {
      marginTop: COMPASS_SIZE * 0.17,
      fontSize: getTextSize(26, textSize),
    },

    needle: {
      width: 4,
      height: COMPASS_SIZE * 0.33 - 26,
      borderRadius: 2,
      marginTop: 2,
    },

    centerDot: {
      position: "absolute",
      top: COMPASS_SIZE / 2 - 7,
      left: COMPASS_SIZE / 2 - 7,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.background,
    },

    headingChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: getResponsiveMargin(16),
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 12,
    },

    headingChipText: {
      fontSize: getTextSize(13, textSize),
      color: colors.textSecondary,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },

    noCompassText: {
      fontSize: getTextSize(13, textSize),
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: getResponsiveMargin(16),
      paddingHorizontal: 16,
    },

    infoRow: {
      flexDirection: "row",
      gap: getResponsiveSize(12),
      marginTop: getResponsiveMargin(20),
      alignSelf: "stretch",
    },

    infoCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: getResponsiveSize(16),
      padding: getResponsivePadding(14),
      alignItems: "center",
      gap: 4,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },

    infoValue: {
      fontSize: getTextSize(20, textSize),
      fontWeight: "800",
      color: colors.textPrimary,
      fontVariant: ["tabular-nums"],
    },

    infoLabel: {
      fontSize: getTextSize(11, textSize),
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    hintRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: "auto",
      marginBottom: getResponsiveMargin(8),
      paddingHorizontal: 10,
    },

    hintText: {
      flex: 1,
      fontSize: getTextSize(11, textSize),
      color: colors.textSecondary,
      fontStyle: "italic",
    },

    errorTitle: {
      fontSize: getTextSize(18, textSize),
      fontWeight: "700",
      color: colors.textPrimary,
      textAlign: "center",
    },

    errorText: {
      fontSize: getTextSize(14, textSize),
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
    },

    retryButton: {
      marginTop: 8,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 28,
    },

    retryButtonText: {
      fontSize: getTextSize(15, textSize),
      color: "#FFFFFF",
      fontWeight: "700",
    },
  });
