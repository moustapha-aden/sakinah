import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../hooks/useSettings";
import { getTextSize } from "../utils/textSize";

type Props = {
  title: string;
  onPress: () => void;
};

export default function AppButton({ title, onPress }: Props) {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const styles = useMemo(() => createStyles(colors, settings.textSize), [colors, settings.textSize]);

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any, textSize: any) => StyleSheet.create({
  button: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: getTextSize(18, textSize),
    textAlign: "center",
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
