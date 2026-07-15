import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { useMemo, useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import {
  usePrayerTimes,
  DISPLAY_PRAYERS,
  DisplayPrayer,
  PRAYER_LABEL_KEYS,
} from "../hooks/usePrayerTimes";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize } from "../utils/textSize";
import { getResponsivePadding, getResponsiveMargin, getResponsiveSize } from "../utils/responsive";

const PRAYER_ICONS: Record<DisplayPrayer, keyof typeof Ionicons.glyphMap> = {
  Fajr: "partly-sunny-outline",
  Sunrise: "sunny",
  Dhuhr: "sunny-outline",
  Asr: "partly-sunny",
  Maghrib: "moon-outline",
  Isha: "moon",
};

export default function PrayerTimesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings: appSettings } = useSettings();
  const styles = useMemo(() => createStyles(colors, appSettings.textSize), [colors, appSettings.textSize]);

  const {
    loading,
    error,
    timings,
    locationLabel,
    hijriDate,
    settings,
    methods,
    setMethod,
    setManualLocation,
    useGps,
    refresh,
    nextPrayer,
    currentPrayer,
    countdownLabel,
  } = usePrayerTimes();

  const [methodModalVisible, setMethodModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [cityInput, setCityInput] = useState(settings.manualLocation?.city || "");
  const [countryInput, setCountryInput] = useState(settings.manualLocation?.country || "");

  const currentMethod = methods.find((m) => m.id === settings.method) || methods[0];

  const openLocationModal = () => {
    setCityInput(settings.manualLocation?.city || "");
    setCountryInput(settings.manualLocation?.country || "");
    setLocationModalVisible(true);
  };

  const handleApplyLocation = () => {
    if (cityInput.trim() && countryInput.trim()) {
      setManualLocation(cityInput.trim(), countryInput.trim());
      setLocationModalVisible(false);
    }
  };

  const handleUseGps = () => {
    useGps();
    setLocationModalVisible(false);
  };

  // Extrait sonore de secours (voir assets/audio/README.md) : à remplacer par un vrai
  // enregistrement d'adhan avant publication.
  // const adhanPlayer = useAudioPlayer(require("../assets/audio/adhan_placeholder.wav"));
  // const adhanStatus = useAudioPlayerStatus(adhanPlayer);

  const toggleAdhan = () => {
    // if (adhanStatus.playing) {
    //   adhanPlayer.pause();
    //   adhanPlayer.seekTo(0);
    // } else {
    //   adhanPlayer.seekTo(0);
    //   adhanPlayer.play();
    // }
    Alert.alert(t("prayerTimes.adhanPlaceholderAlertTitle"), t("prayerTimes.adhanPlaceholderAlertText"));
  };

  const showEmptyState = !timings && !loading;

  // Animations d'entrée : carte prochaine prière, cascade des lignes, pied de page
  const cardAnim = useRef(new Animated.Value(0)).current;
  const rowAnims = useRef(DISPLAY_PRAYERS.map(() => new Animated.Value(0))).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const hasTimings = !!timings;

  useEffect(() => {
    if (!hasTimings) return;
    cardAnim.setValue(0);
    rowAnims.forEach((a) => a.setValue(0));
    footerAnim.setValue(0);

    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.stagger(
        70,
        rowAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
        )
      ),
      Animated.timing(footerAnim, { toValue: 1, duration: 500, delay: 350, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTimings]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="time" size={getTextSize(30, appSettings.textSize)} color={colors.accent} />
        <Text style={styles.headerTitle}>{t("prayerTimes.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("prayerTimes.subtitle")}</Text>
      </View>

      {/* Localisation */}
      <View style={styles.locationRow}>
        <Pressable style={styles.locationInfo} onPress={openLocationModal}>
          <Ionicons name="location" size={18} color={colors.accent} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel || t("prayerTimes.location")}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          style={styles.refreshButton}
          onPress={() => refresh()}
          disabled={loading}
        >
          <Ionicons
            name="refresh"
            size={18}
            color={loading ? colors.textSecondary : colors.accent}
          />
        </Pressable>
      </View>

      {loading && !timings && (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.stateText}>{t("prayerTimes.loading")}</Text>
        </View>
      )}

      {showEmptyState && error === "permission_denied" && (
        <View style={styles.stateCard}>
          <Ionicons name="location-outline" size={36} color={colors.accent} />
          <Text style={styles.stateTitle}>{t("prayerTimes.permissionDeniedTitle")}</Text>
          <Text style={styles.stateText}>{t("prayerTimes.permissionDeniedText")}</Text>
          <Pressable style={styles.stateButton} onPress={openLocationModal}>
            <Text style={styles.stateButtonText}>{t("prayerTimes.enterManually")}</Text>
          </Pressable>
        </View>
      )}

      {showEmptyState && error === "network" && (
        <View style={styles.stateCard}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.accent} />
          <Text style={styles.stateTitle}>{t("prayerTimes.networkErrorTitle")}</Text>
          <Text style={styles.stateText}>{t("prayerTimes.networkErrorText")}</Text>
          <Pressable style={styles.stateButton} onPress={() => refresh()}>
            <Text style={styles.stateButtonText}>{t("prayerTimes.retry")}</Text>
          </Pressable>
        </View>
      )}

      {timings && (
        <>
          {/* Prochaine prière */}
          {nextPrayer && (
            <Animated.View
              style={{
                opacity: cardAnim,
                transform: [
                  {
                    scale: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient
                colors={[colors.accent, colors.accent + "CC"]}
                style={styles.nextPrayerCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.nextPrayerLabel}>{t("prayerTimes.nextPrayer")}</Text>
                <Text style={styles.nextPrayerName}>
                  {t(`prayerTimes.${PRAYER_LABEL_KEYS[nextPrayer]}`)}
                </Text>
                <Text style={styles.nextPrayerCountdown}>
                  {t("prayerTimes.in")} {countdownLabel} · {timings[nextPrayer]}
                </Text>
                {!!hijriDate && <Text style={styles.hijriDate}>{hijriDate}</Text>}
              </LinearGradient>
            </Animated.View>
          )}

          {/* Liste des horaires */}
          <View style={styles.timingsList}>
            {DISPLAY_PRAYERS.map((key, index) => {
              const isCurrent = key === currentPrayer;
              const isNext = key === nextPrayer;
              return (
                <Animated.View
                  key={key}
                  style={[
                    styles.timingRow,
                    isCurrent && styles.timingRowCurrent,
                    isNext && styles.timingRowNext,
                    {
                      opacity: rowAnims[index],
                      transform: [
                        {
                          translateX: rowAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [24, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.timingLeft}>
                    <Ionicons
                      name={PRAYER_ICONS[key]}
                      size={22}
                      color={isNext ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[styles.timingName, isNext && styles.timingNameActive]}
                    >
                      {t(`prayerTimes.${PRAYER_LABEL_KEYS[key]}`)}
                    </Text>
                  </View>
                  <Text style={[styles.timingValue, isNext && styles.timingNameActive]}>
                    {timings[key]}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Méthode de calcul + adhan */}
          <Animated.View
            style={{
              opacity: footerAnim,
              transform: [
                {
                  translateY: footerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            }}
          >
          <Pressable style={styles.methodRow} onPress={() => setMethodModalVisible(true)}>
            <View style={styles.methodLeft}>
              <Ionicons name="calculator-outline" size={20} color={colors.accent} />
              <View>
                <Text style={styles.methodLabel}>{t("prayerTimes.method")}</Text>
                <Text style={styles.methodValue}>
                  {t(`prayerTimes.methods.${currentMethod.key}`)}
                </Text>
              </View>
            </View>
            <Text style={styles.methodChange}>{t("prayerTimes.changeMethod")}</Text>
          </Pressable>

          {/* Adhan */}
          <View style={styles.adhanRow}>
            <Pressable
              style={styles.adhanButton}
              onPress={toggleAdhan}
            >
              <Ionicons
                name="play-circle"
                size={30}
                color={colors.accent}
              />

              <Text style={styles.adhanButtonText}>
                {t("prayerTimes.playAdhan")}
              </Text>
            </Pressable>

            <Text style={styles.adhanNotice}>
              {t("prayerTimes.adhanPlaceholderNotice")}
            </Text>
          </View>
          </Animated.View>
        </>
      )}

      {/* Modal : méthode de calcul */}
      <Modal
        visible={methodModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMethodModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMethodModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t("prayerTimes.method")}</Text>
            <ScrollView style={styles.modalScroll}>
              {methods.map((m) => (
                <Pressable
                  key={m.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setMethod(m.id);
                    setMethodModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{t(`prayerTimes.methods.${m.key}`)}</Text>
                  {m.id === settings.method && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal : localisation manuelle */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLocationModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t("prayerTimes.manualLocation")}</Text>

            <Text style={styles.inputLabel}>{t("prayerTimes.city")}</Text>
            <TextInput
              style={styles.input}
              value={cityInput}
              onChangeText={setCityInput}
              placeholder={t("prayerTimes.cityPlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.inputLabel}>{t("prayerTimes.country")}</Text>
            <TextInput
              style={styles.input}
              value={countryInput}
              onChangeText={setCountryInput}
              placeholder={t("prayerTimes.countryPlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />

            <Pressable style={styles.applyButton} onPress={handleApplyLocation}>
              <Text style={styles.applyButtonText}>{t("prayerTimes.apply")}</Text>
            </Pressable>

            <Pressable style={styles.gpsButton} onPress={handleUseGps}>
              <Ionicons name="locate" size={18} color={colors.accent} />
              <Text style={styles.gpsButtonText}>{t("prayerTimes.useGps")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: any, textSize: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: getResponsivePadding(20),
      paddingBottom: 40,
    },
    header: {
      alignItems: "center",
      marginBottom: getResponsiveMargin(16),
    },
    headerTitle: {
      fontSize: getTextSize(24, textSize),
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 8,
    },
    headerSubtitle: {
      fontSize: getTextSize(13, textSize),
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: getResponsiveMargin(16),
    },
    locationInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    locationText: {
      flex: 1,
      fontSize: getTextSize(14, textSize),
      color: colors.textPrimary,
      fontWeight: "600",
    },
    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    stateCard: {
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(16),
      padding: getResponsivePadding(24),
      gap: 10,
    },
    stateTitle: {
      fontSize: getTextSize(16, textSize),
      fontWeight: "700",
      color: colors.textPrimary,
      textAlign: "center",
    },
    stateText: {
      fontSize: getTextSize(13, textSize),
      color: colors.textSecondary,
      textAlign: "center",
    },
    stateButton: {
      marginTop: 8,
      backgroundColor: colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    stateButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: getTextSize(14, textSize),
    },

    nextPrayerCard: {
      borderRadius: getResponsiveSize(20),
      padding: getResponsivePadding(24),
      alignItems: "center",
      marginBottom: getResponsiveMargin(20),
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    nextPrayerLabel: {
      fontSize: getTextSize(13, textSize),
      color: "#FFFFFF",
      opacity: 0.85,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    nextPrayerName: {
      fontSize: getTextSize(32, textSize),
      color: "#FFFFFF",
      fontWeight: "800",
      marginTop: 6,
    },
    nextPrayerCountdown: {
      fontSize: getTextSize(15, textSize),
      color: "#FFFFFF",
      marginTop: 8,
      fontWeight: "600",
    },
    hijriDate: {
      fontSize: getTextSize(12, textSize),
      color: "#FFFFFF",
      opacity: 0.8,
      marginTop: 10,
    },

    timingsList: {
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(16),
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: getResponsiveMargin(16),
    },
    timingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    timingRowCurrent: {
      backgroundColor: colors.accent + "0F",
    },
    timingRowNext: {
      backgroundColor: colors.accent + "1A",
    },
    timingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    timingName: {
      fontSize: getTextSize(15, textSize),
      color: colors.textPrimary,
      fontWeight: "600",
    },
    timingNameActive: {
      color: colors.accent,
      fontWeight: "800",
    },
    timingValue: {
      fontSize: getTextSize(15, textSize),
      color: colors.textPrimary,
      fontWeight: "700",
    },

    methodRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(14),
      borderWidth: 1,
      borderColor: colors.border,
      padding: getResponsivePadding(14),
    },
    methodLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    methodLabel: {
      fontSize: getTextSize(12, textSize),
      color: colors.textSecondary,
    },
    methodValue: {
      fontSize: getTextSize(14, textSize),
      color: colors.textPrimary,
      fontWeight: "600",
      marginTop: 2,
    },
    methodChange: {
      fontSize: getTextSize(13, textSize),
      color: colors.accent,
      fontWeight: "700",
    },

    adhanRow: {
      marginTop: getResponsiveMargin(16),
      alignItems: "center",
      gap: 8,
    },
    adhanButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: getResponsiveSize(14),
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    adhanButtonText: {
      fontSize: getTextSize(15, textSize),
      fontWeight: "700",
      color: colors.textPrimary,
    },
    adhanNotice: {
      fontSize: getTextSize(11, textSize),
      color: colors.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
      paddingHorizontal: 12,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: getTextSize(18, textSize),
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    modalScroll: {
      maxHeight: 320,
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalOptionText: {
      fontSize: getTextSize(14, textSize),
      color: colors.textPrimary,
      flex: 1,
      paddingRight: 8,
    },

    inputLabel: {
      fontSize: getTextSize(13, textSize),
      color: colors.textSecondary,
      marginTop: 12,
      marginBottom: 6,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: getTextSize(15, textSize),
      color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    applyButton: {
      marginTop: 20,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    applyButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: getTextSize(15, textSize),
    },
    gpsButton: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
    },
    gpsButtonText: {
      color: colors.accent,
      fontWeight: "700",
      fontSize: getTextSize(14, textSize),
    },
  });
