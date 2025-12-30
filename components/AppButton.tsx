import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

type Props = {
  title: string;
  onPress: () => void;
};

export default function AppButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    color: colors.textPrimary,
  },
});
