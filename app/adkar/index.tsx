import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

export default function AdkarScreen() {
  const handleCategoryPress = (categoryId: string) => {
    router.push(`/adkar/${categoryId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📿 Adkâr</Text>
        <Text style={styles.subtitle}>Sélectionnez une catégorie</Text>

        <View style={styles.categoriesContainer}>
          <Pressable
            onPress={() => handleCategoryPress("morning")}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <MaterialIcons
                name="wb-sunny"
                size={32}
                color={colors.accent}
                style={styles.cardIcon}
              />
              <View style={styles.cardText}>
                <Text style={styles.nom_en_Arabe}>أدكار الصباح</Text>
                <Text style={styles.nom_en_francais}>Adkâr du matin</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleCategoryPress("evening")}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <MaterialIcons
                name="nights-stay"
                size={32}
                color={colors.accent}
                style={styles.cardIcon}
              />
              <View style={styles.cardText}>
                <Text style={styles.nom_en_Arabe}>أدكار المساء</Text>
                <Text style={styles.nom_en_francais}>Adkâr du soir</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleCategoryPress("after_prayer")}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <MaterialIcons
                name="mosque"
                size={32}
                color={colors.accent}
                style={styles.cardIcon}
              />
              <View style={styles.cardText}>
                <Text style={styles.nom_en_Arabe}>أدكار بعد الصلاة</Text>
                <Text style={styles.nom_en_francais}>Après la prière</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: colors.card,
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
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    textAlign: "center",
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: 24,
  },
  categoriesContainer: {
    gap: 12,
  },
  nom_en_Arabe: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  nom_en_francais: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

