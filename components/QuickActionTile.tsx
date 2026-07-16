import { Animated, Pressable, Text, StyleSheet } from "react-native";
import { useMemo, useRef } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize } from "../utils/textSize";
import { getResponsiveSize } from "../utils/responsive";

type Props = {
  label: string;
  icon: string;
  iconFamily?: "ionicons" | "material-community";
  gradient: [string, string];
  onPress: () => void;
};

export default function QuickActionTile({
  label,
  icon,
  iconFamily = "ionicons",
  gradient,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const styles = useMemo(
    () => createStyles(colors, settings.textSize),
    [colors, settings.textSize]
  );
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.tile, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBadge}
        >
          {iconFamily === "material-community" ? (
            <MaterialCommunityIcons name={icon as any} size={26} color="#FFFFFF" />
          ) : (
            <Ionicons name={icon as any} size={26} color="#FFFFFF" />
          )}
        </LinearGradient>
        <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const createStyles = (colors: any, textSize: any) =>
  StyleSheet.create({
    pressable: {
      width: "100%",
    },

    tile: {
      backgroundColor: colors.card,
      borderRadius: getResponsiveSize(16),
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: getResponsiveSize(14),
      paddingHorizontal: 4,
      alignItems: "center",
      gap: getResponsiveSize(8),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },

    iconBadge: {
      width: getResponsiveSize(48),
      height: getResponsiveSize(48),
      borderRadius: getResponsiveSize(15),
      justifyContent: "center",
      alignItems: "center",
    },

    label: {
      fontSize: getTextSize(12, textSize),
      fontWeight: "600",
      color: colors.textPrimary,
      textAlign: "center",
    },
  });
