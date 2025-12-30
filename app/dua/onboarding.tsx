import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import AppButton from "../../components/AppButton";
import { useTheme } from "../../contexts/ThemeContext";

export default function DuaOnboardingScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleGetStarted = () => {
    router.replace("/dua");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🤲</Text>
        </View>

        <Text style={styles.title}>Bienvenue dans Duʿāʾ</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qu'est-ce que Duʿāʾ ?</Text>
          <Text style={styles.sectionText}>
            Les duʿāʾ sont des invocations et supplications que nous adressons à
            Allah. Elles sont un moyen de communication directe avec notre
            Créateur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment utiliser cette section</Text>
          <Text style={styles.sectionText}>
            • Parcourez les différentes catégories de duʿāʾ{"\n"}
            • Lisez les invocations en arabe et leur traduction{"\n"}
            • Marquez vos favorites pour y accéder rapidement{"\n"}
            • Récitez-les avec sincérité et concentration
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <AppButton title="Commencer" onPress={handleGetStarted} />
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
});

