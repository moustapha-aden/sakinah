import { View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import AppButton from "../components/AppButton";
import { useCounter } from "../hooks/useCounter";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize } from "../utils/textSize";

export default function CounterScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);
  const { count, increment, reset } = useCounter();

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      <AppButton title="+1" onPress={increment} />
      <AppButton title={t("counter.reset")} onPress={reset} />
    </View>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  count: {
    fontSize: getTextSize(64, textSize),
    color: colors.textPrimary,
    marginBottom: 20,
  },
});
