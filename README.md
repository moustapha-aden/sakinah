# 🕊️ Sakīnah

Une application mobile dédiée aux invocations et adkâr islamiques, conçue pour faciliter l'accès aux invocations authentiques et vous aider à les intégrer dans votre quotidien.

## 📱 Fonctionnalités

### 🏠 Dashboard
- **Statistiques personnelles** : Suivez vos jours consécutifs et le nombre d'adhkar complétés
- **Citations du jour** : Inspirez-vous avec des versets et hadiths traduits
- **Interface moderne** : Design élégant avec animations fluides

### 📿 Adkâr
- **Trois catégories** :
  - 🌅 Adkâr du matin
  - 🌙 Adkâr du soir
  - 🕌 Après la prière
- **Navigation intuitive** : Parcourez les adkâr avec pagination horizontale
- **Complétion automatique** : Les statistiques s'incrémentent automatiquement quand vous terminez une catégorie
- **Bouton "Terminé"** : Marquez manuellement la complétion d'une catégorie

### 🤲 Duʿāʾ (Invocations)
- **35+ invocations** organisées par catégories
- **Recherche avancée** : Recherchez par titre, texte arabe ou traduction
- **Vue détaillée** : Consultez chaque invocation avec son texte arabe, traduction et source
- **Favoris** : Marquez vos invocations préférées pour un accès rapide
- **Icônes par catégorie** : Identification visuelle rapide

### ⚙️ Paramètres
- **Mode sombre** : Support complet du thème sombre avec mode automatique
- **Langues** : Français, Arabe, Anglais
- **Taille du texte** : Petite, Moyenne, Grande
- **Notifications** : Activez/désactivez les rappels
- **Aide** : FAQ et support

### 🔢 Compteur (tasbih)
- Compteur simple pour vos récitations

## 🚀 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app sur votre téléphone (pour tester)

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd sakinah
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer l'application**
   ```bash
   npm start
   ```

4. **Lancer sur votre appareil**
   - Scannez le QR code avec Expo Go (iOS) ou l'appareil photo (Android)
   - Ou utilisez les commandes :
     ```bash
     npm run android  # Pour Android
     npm run ios      # Pour iOS
     npm run web      # Pour le web
     ```

## 🛠️ Technologies utilisées

- **React Native** : Framework mobile cross-platform
- **Expo Router** : Navigation basée sur les fichiers
- **TypeScript** : Typage statique pour une meilleure maintenabilité
- **AsyncStorage** : Stockage local persistant
- **Context API** : Gestion d'état globale (Thème, Paramètres, Traductions, Statistiques)
- **Expo Linear Gradient** : Dégradés pour l'interface

## 📁 Structure du projet

```
sakinah/
├── app/                    # Écrans de l'application (Expo Router)
│   ├── _layout.tsx        # Layout principal avec providers
│   ├── index.tsx          # Écran d'accueil (Dashboard)
│   ├── adkar/             # Section Adkâr
│   │   ├── index.tsx      # Liste des catégories
│   │   └── [category].tsx # Détail d'une catégorie
│   ├── dua/               # Section Duʿāʾ
│   │   ├── index.tsx      # Liste et détail des invocations
│   │   └── onboarding.tsx # Introduction
│   ├── settings/          # Paramètres
│   │   ├── settings.tsx   # Paramètres principaux
│   │   ├── favorites.tsx  # Favoris
│   │   ├── language.tsx   # Sélection de langue
│   │   ├── textSize.tsx   # Taille du texte
│   │   └── help.tsx       # Aide et FAQ
│   └── tasbih.tsx        # Compteur (tasbih)
├── components/            # Composants réutilisables
│   └── AppButton.tsx
├── contexts/              # Contextes React
│   ├── ThemeContext.tsx   # Gestion du thème (light/dark/auto)
│   ├── SettingsContext.tsx # Paramètres utilisateur
│   ├── TranslationContext.tsx # Système de traduction
│   └── StatsContext.tsx  # Statistiques et progression
├── hooks/                 # Hooks personnalisés
│   ├── usetasbih.ts
│   ├── useFavorites.ts
│   └── useSettings.ts
├── data/                  # Données de l'application
│   ├── adkar.ts          # Données des adkâr
│   ├── dua.ts            # Données des invocations
│   └── categories.ts     # Catégories
├── utils/                 # Utilitaires
│   ├── translations.ts   # Fichier de traductions
│   └── textSize.ts       # Utilitaires pour la taille du texte
├── constants/            # Constantes
│   └── colors.ts         # Palette de couleurs
└── assets/               # Images et ressources
```

## 🎨 Fonctionnalités techniques

### Système de thème
- **Mode clair** : Interface lumineuse et apaisante
- **Mode sombre** : Protection des yeux en conditions de faible luminosité
- **Mode automatique** : Suit les paramètres système

### Internationalisation (i18n)
- **3 langues** : Français, Arabe, Anglais
- **Traductions complètes** : Tous les textes de l'interface sont traduits
- **Changement dynamique** : Les traductions se mettent à jour instantanément

### Statistiques et progression
- **Suivi des jours consécutifs** : Maintenez votre série quotidienne
- **Compteur d'adhkar** : Suivez le nombre total de catégories complétées
- **Persistance** : Toutes les données sont sauvegardées localement
- **Synchronisation automatique** : Détection et correction des désynchronisations

### Stockage local
- **AsyncStorage** : Toutes les préférences et données sont stockées localement
- **Pas de connexion requise** : Fonctionne entièrement hors ligne

## 📖 Utilisation

### Compléter une catégorie d'adhkar
1. Accédez à la section **Adkâr**
2. Sélectionnez une catégorie (matin, soir, après la prière)
3. Parcourez les adkâr avec les boutons Précédent/Suivant
4. Quand vous atteignez le dernier adkâr :
   - **Automatique** : Attendez 2 secondes sur le dernier adkâr
   - **Manuel** : Cliquez sur le bouton "Terminé"
5. Les statistiques s'incrémentent automatiquement

### Ajouter une invocation aux favoris
1. Accédez à la section **Duʿāʾ**
2. Recherchez ou parcourez les invocations
3. Cliquez sur une invocation pour voir les détails
4. Cliquez sur l'icône étoile dans le header
5. Retrouvez-la dans **Paramètres > Favoris**

### Changer la langue
1. Accédez à **Paramètres**
2. Cliquez sur **Langue**
3. Sélectionnez votre langue préférée
4. L'interface se met à jour immédiatement

### Personnaliser l'apparence
1. Accédez à **Paramètres**
2. **Mode sombre** : Activez/désactivez le mode sombre
3. **Taille du texte** : Choisissez Petite, Moyenne ou Grande
4. Les changements sont appliqués instantanément

## 🔧 Configuration

### Variables d'environnement
Aucune configuration supplémentaire n'est requise. L'application fonctionne entièrement hors ligne.

### Personnalisation des données
- **Adkâr** : Modifiez `data/adkar.ts` pour ajouter/modifier les adkâr
- **Invocations** : Modifiez `data/dua.ts` pour ajouter/modifier les invocations
- **Traductions** : Modifiez `utils/translations.ts` pour ajouter/modifier les traductions

## 📝 Scripts disponibles

```bash
npm start      # Démarrer le serveur de développement
npm run android # Lancer sur Android
npm run ios     # Lancer sur iOS
npm run web     # Lancer sur le web
```

## 🎯 Fonctionnalités à venir

- [ ] Notifications de rappel pour les adkâr
- [ ] Partage d'invocations
- [ ] Historique détaillé des complétions
- [ ] Graphiques de progression
- [ ] Mode hors ligne amélioré
- [ ] Synchronisation cloud (optionnelle)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer les traductions
- Ajouter de nouvelles invocations ou adkâr

## 📄 Licence

Ce projet est privé et destiné à un usage personnel.

## 🙏 Remerciements

- Toutes les invocations et adkâr proviennent de sources authentiques (Coran, Hadiths authentiques)
- Merci à la communauté musulmane pour son inspiration

## 📞 Support

Pour toute question ou suggestion :
- Email : support@sakinah.app
- Consultez la section **Aide** dans l'application

---

**Sakīnah** - Paix et sérénité dans votre quotidien 🌙

