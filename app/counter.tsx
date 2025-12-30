import { View, Text, StyleSheet } from "react-native";
import AppButton from "../components/AppButton";
import { useCounter } from "../hooks/useCounter";
import { useTheme } from "../contexts/ThemeContext";

export default function CounterScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { count, increment, reset } = useCounter();

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      <AppButton title="+1" onPress={increment} />
      <AppButton title="Réinitialiser" onPress={reset} />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  count: {
    fontSize: 64,
    color: colors.textPrimary,
    marginBottom: 20,
  },
});
