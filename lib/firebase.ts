// Firebase Analytics pour React Native/Expo
// Supporte @react-native-firebase/analytics (mobile) et firebase/analytics (web)

let analytics: any = null;

// Essayer d'importer @react-native-firebase/analytics pour mobile (React Native)
try {
  const firebaseAnalytics = require("@react-native-firebase/analytics").default;
  analytics = firebaseAnalytics();
  console.log("✅ Firebase Analytics (React Native) initialisé");
} catch (rnError) {
  // Si @react-native-firebase/analytics n'est pas disponible, 
  // essayer firebase/analytics (pour web ou Expo Go)
  try {
    const { initializeApp, getApps } = require("firebase/app");
    const { getAnalytics } = require("firebase/analytics");
    const Constants = require("expo-constants").default;

    const firebaseConfig = {
      apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "sakinah-1358d",
      storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "sakinah-1358d.firebasestorage.app",
      messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "67644805690",
      appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Analytics pour web uniquement (firebase/analytics ne fonctionne que sur web)
    if (typeof window !== "undefined") {
      analytics = getAnalytics(app);
      console.log("✅ Firebase Analytics (Web) initialisé");
    } else {
      // Pour mobile sans @react-native-firebase, créer un mock
      console.warn("⚠️ Firebase Analytics: Utilisation d'un mock pour mobile. Installez @react-native-firebase/analytics pour le support complet.");
      analytics = {
        logEvent: async (eventName: string, params?: any) => {
          console.log("[Analytics Mock]", eventName, params);
        },
      };
    }
  } catch (webError) {
    console.warn("⚠️ Firebase Analytics not available:", webError);
    // Créer un objet mock pour éviter les erreurs
    analytics = {
      logEvent: async (eventName: string, params?: any) => {
        console.log("[Analytics Mock]", eventName, params);
      },
    };
  }
}

export { analytics };

