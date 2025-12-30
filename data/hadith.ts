// Liste des hadiths et citations avec leurs clés de traduction
// Les traductions sont appliquées dans le composant via le système de traduction

export interface Hadith {
  id: number;
  translationKey: string; // Clé pour accéder aux traductions dans translations.ts
  imageIndex: number; // Index pour choisir une image parmi les images disponibles
}

export const hadiths: Hadith[] = [
  { id: 1, translationKey: "quote1", imageIndex: 0 },
  { id: 2, translationKey: "quote2", imageIndex: 1 },
  { id: 3, translationKey: "quote3", imageIndex: 2 },
  { id: 4, translationKey: "quote4", imageIndex: 3 },
  { id: 5, translationKey: "quote5", imageIndex: 0 },
  { id: 6, translationKey: "quote6", imageIndex: 1 },
  { id: 7, translationKey: "quote7", imageIndex: 2 },
  { id: 8, translationKey: "quote8", imageIndex: 3 },
  { id: 9, translationKey: "quote9", imageIndex: 0 },
  { id: 10, translationKey: "quote10", imageIndex: 1 },
  { id: 11, translationKey: "quote11", imageIndex: 2 },
  { id: 12, translationKey: "quote12", imageIndex: 3 },
  { id: 13, translationKey: "quote13", imageIndex: 0 },
  { id: 14, translationKey: "quote14", imageIndex: 1 },
  { id: 15, translationKey: "quote15", imageIndex: 2 },
  { id: 16, translationKey: "quote16", imageIndex: 3 },
  { id: 17, translationKey: "quote17", imageIndex: 0 },
  { id: 18, translationKey: "quote18", imageIndex: 1 },
  { id: 19, translationKey: "quote19", imageIndex: 2 },
  { id: 20, translationKey: "quote20", imageIndex: 3 },
  { id: 21, translationKey: "quote21", imageIndex: 0 },
  { id: 22, translationKey: "quote22", imageIndex: 1 },
  { id: 23, translationKey: "quote23", imageIndex: 2 },
  { id: 24, translationKey: "quote24", imageIndex: 3 },
  { id: 25, translationKey: "quote25", imageIndex: 0 },
  { id: 26, translationKey: "quote26", imageIndex: 1 },
  { id: 27, translationKey: "quote27", imageIndex: 2 },
  { id: 28, translationKey: "quote28", imageIndex: 3 },
  { id: 29, translationKey: "quote29", imageIndex: 0 },
  { id: 30, translationKey: "quote30", imageIndex: 1 },
];

// Images pour les citations (images locales)
export const quoteImages = [
  require("../assets/bg1.png"),
  require("../assets/bg2.png"),
  require("../assets/bg3.png"),
  require("../assets/bg4.png"),
];
