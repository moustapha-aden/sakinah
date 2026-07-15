import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  onFinish: () => void;
};

// Durée d'affichage avant le fondu de sortie
const HOLD_DURATION = 1900;
const FADE_OUT_DURATION = 450;

export default function AnimatedSplash({ onFinish }: Props) {
  const { colors } = useTheme();

  const masterOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const arabicAnim = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    // Entrée : badge en spring, puis nom et calligraphie en cascade
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 500,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(arabicAnim, {
        toValue: 1,
        duration: 500,
        delay: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Anneaux de pulsation autour du badge (boucle)
    const makeRingLoop = (ring: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(ring, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    const ringLoops = [makeRingLoop(ring1, 0), makeRingLoop(ring2, 800)];
    ringLoops.forEach((loop) => loop.start());

    // Points de chargement
    const dotLoops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.delay((2 - i) * 180),
        ])
      )
    );
    dotLoops.forEach((loop) => loop.start());

    // Sortie : fondu global puis libération de l'écran
    const exit = Animated.sequence([
      Animated.delay(HOLD_DURATION),
      Animated.timing(masterOpacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
    exit.start(() => {
      ringLoops.forEach((loop) => loop.stop());
      dotLoops.forEach((loop) => loop.stop());
      onFinish();
    });

    return () => {
      ringLoops.forEach((loop) => loop.stop());
      dotLoops.forEach((loop) => loop.stop());
      exit.stop();
    };
  }, []);

  const ringStyle = (ring: Animated.Value) => ({
    opacity: ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.35, 0] }),
    transform: [
      { scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) },
    ],
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: masterOpacity }]}
    >
      <LinearGradient
        colors={[colors.background, colors.card]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <View style={styles.logoZone}>
          <Animated.View
            style={[styles.ring, { borderColor: colors.accent }, ringStyle(ring1)]}
          />
          <Animated.View
            style={[styles.ring, { borderColor: colors.accent }, ringStyle(ring2)]}
          />
          <Animated.View
            style={[
              styles.logoBadge,
              {
                backgroundColor: colors.accent + "1F",
                borderColor: colors.accent + "40",
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Ionicons name="moon" size={44} color={colors.accent} />
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Sakīnah
        </Animated.Text>

        <Animated.Text
          style={[
            styles.arabic,
            {
              color: colors.accent,
              opacity: arabicAnim,
              transform: [
                {
                  translateY: arabicAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          سكينة
        </Animated.Text>
      </View>

      <View style={styles.dotsRow}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { backgroundColor: colors.accent, opacity: dot }]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 999,
    elevation: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    alignItems: "center",
  },

  logoZone: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },

  ring: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
  },

  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  arabic: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 6,
    letterSpacing: 1,
  },

  dotsRow: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    gap: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
