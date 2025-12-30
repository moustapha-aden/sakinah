import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

export default function HelpScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const faqItems = [
    {
      question: "Comment ajouter une invocation aux favoris ?",
      answer:
        "Lorsque vous consultez une invocation, cliquez sur l'icône étoile dans le header ou dans la carte de l'invocation pour l'ajouter à vos favoris.",
    },
    {
      question: "Comment rechercher une invocation ?",
      answer:
        "Utilisez la barre de recherche en haut de l'écran des invocations. Vous pouvez rechercher par titre, texte arabe ou traduction.",
    },
    {
      question: "Comment changer le mode sombre ?",
      answer:
        "Allez dans Paramètres > Apparence et activez le mode sombre. Vous pouvez également choisir le mode automatique pour suivre les paramètres de votre appareil.",
    },
    {
      question: "Comment naviguer entre les adkâr ?",
      answer:
        "Sélectionnez une catégorie (matin, soir, après la prière), puis utilisez les boutons Précédent/Suivant pour naviguer entre les invocations.",
    },
    {
      question: "Les invocations sont-elles authentiques ?",
      answer:
        "Oui, toutes les invocations proviennent de sources authentiques (Coran, hadiths authentiques) et sont référencées avec leur source.",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>Aide et Support</Text>
          <Text style={styles.subtitle}>
            Questions fréquentes et assistance
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={colors.accent}
                  style={styles.faqIcon}
                />
                <Text style={styles.faqQuestionText}>{item.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              Pour toute question ou suggestion, n'hésitez pas à nous contacter.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                Linking.openURL("mailto:support@sakinah.app");
              }}
            >
              <Ionicons name="mail" size={20} color={colors.textPrimary} />
              <Text style={styles.contactButtonText}>Envoyer un email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              <Text style={styles.aboutBold}>Sakīnah</Text> est une application
              dédiée aux invocations et adkâr islamiques. Notre objectif est de
              faciliter l'accès aux invocations authentiques et de vous aider à
              les intégrer dans votre quotidien.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}> Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    headerSection: {
      alignItems: "center",
      marginBottom: 32,
      paddingTop: 16,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 16,
    },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    faqQuestion: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    faqIcon: {
      marginRight: 8,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    faqAnswer: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginLeft: 28,
    },
    contactCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    contactButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    contactButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    aboutCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aboutText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    aboutBold: {
      fontWeight: "700",
      color: colors.textPrimary,
    },
    versionText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    buttonContainer: {
      marginTop: 24,
      marginBottom: 32,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
  });

