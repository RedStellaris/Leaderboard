// ==================== CONFIG GLOBALE ====================
export const LOGO = "/logo.png";

export const CHAMPIONSHIP_NAME   = "GT3 Championship";   // ← à personnaliser
export const CHAMPIONSHIP_SEASON = "Saison 2026";        // ← à personnaliser
export const DISCORD_URL         = "https://discord.gg/MtrBMDxCkG"; // ← à remplacer
export const CURRENT_CHAMPION    = "";                   // ← Nom du champion ou "" pour auto-détection
export const NEXT_SESSION_DATE   = "";                   // ← "2026-07-15T18:00:00" ou "" pour désactiver

export const SHEET_ID = "1mABgHcqT9kzriAIuscMitRH72WuWJmYUOtxDmnKGSRg";

export const F1_POINTS = [25, 18, 15, 10, 8];

export const SESSIONS = [
  { key: "essais",         label: "🔧 Essais"         },
  { key: "qualifications", label: "⏱️ Qualifications"  },
  { key: "course",         label: "🏆 Courses"         },
];

export const C = {
  bg: "#09090E", card: "#111118", row: "#13131C", rowAlt: "#181826",
  accent: "#C41230", accentDim: "#6B0A1A", gold: "#F5A623",
  text: "#EEEEF5", soft: "#6A6A80", border: "#222230",
};

// ==================== QUIZ ====================
export const QUIZ_MAX_ATTEMPTS   = 3;
export const QUIZ_BLOCK_MS       = 10 * 60 * 1000; // 10 minutes

export const QUIZ_QUESTIONS_BASE = [
  {
    id: "q1",
    question: "Que signifie AMCR ?",
    options: [
      { text: "Automobile Motorsport Club Roblox",      correct: true  },
      { text: "Advanced Motorsport Championship Racing", correct: false },
      { text: "Advanced Motor Cup Racing",              correct: false },
      { text: "Advanced Motorists' Cup Racing",         correct: false },
    ],
  },
  {
    id: "q2",
    question: "Quels sont les circuits proposés ?",
    options: [
      { text: "Monza, SPA, Suzuka, Nürburgring (nord), Le Mans",           correct: true  },
      { text: "Daytona, Monaco, Nürburgring (sud), SPA, Silverstone",      correct: false },
      { text: "Monza, Suzuka, Le Mans, SPA, Sebring",                      correct: false },
      { text: "SPA, Monaco, Nürburgring (sud), Nürburgring (nord), Monza", correct: false },
    ],
  },
];

// ==================== XP ====================
// Valeurs placeholders : à recalibrer une fois que tu as un historique réel
// d'attribution (volume XP/session encore à définir).
export const XP_TIERS = [
  { key: "bronze",  name: "Bronze",  min: 0,   badge: "/badges/bronze.png"  },
  { key: "argent",  name: "Argent",  min: 100, badge: "/badges/argent.png"  },
  { key: "or",      name: "Or",      min: 300, badge: "/badges/or.png"      },
  { key: "platine", name: "Platine", min: 600, badge: "/badges/platine.png" },
];

// Catégories fixes réutilisables — remplace par ton propre barème.
// `amount` est une valeur par défaut pré-remplie dans l'UI d'attribution admin,
// modifiable au moment de l'attribution (couvre catégorie fixe + montant ajustable).
export const XP_CATEGORIES = [
  // { key: "podium_propre", label: "Podium propre", amount: 20 },
  // { key: "fair_play",     label: "Fair-play",      amount: 5  },
];

// Résout le palier courant à partir d'un total XP.
export function resolveXpTier(totalXp) {
  let current = XP_TIERS[0];
  for (const tier of XP_TIERS) {
    if (totalXp >= tier.min) current = tier;
  }
  return current;
}

// Palier suivant (pour la barre de progression), ou null si palier max atteint.
export function nextXpTier(totalXp) {
  const idx = XP_TIERS.findIndex(t => t.key === resolveXpTier(totalXp).key);
  return idx >= 0 && idx < XP_TIERS.length - 1 ? XP_TIERS[idx + 1] : null;
}

// ==================== MOCK DATA ====================
export const MOCK_DATA = [
  // Essais
  { pilote:"Leclerc",    numero:"16", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:23.456", date:"2026-05-10", type:"essais",         position:"2"                 },
  { pilote:"Verstappen", numero:"1",  ecurie:"Red Bull", course:"Circuit de l'Aube", temps:"01:21.789", date:"2026-05-10", type:"essais",         position:"1"                 },
  { pilote:"Hamilton",   numero:"44", ecurie:"Mercedes", course:"Circuit de l'Aube", temps:"01:24.201", date:"2026-05-10", type:"essais",         position:"3"                 },
  { pilote:"Norris",     numero:"4",  ecurie:"McLaren",  course:"Circuit de l'Aube", temps:"01:22.934", date:"2026-05-10", type:"essais",         position:"4"                 },
  { pilote:"Sainz",      numero:"55", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:25.678", date:"2026-05-10", type:"essais",         position:"5"                 },
  // Qualifications
  { pilote:"Leclerc",    numero:"16", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:21.100", date:"2026-05-10", type:"qualifications", position:"1"                 },
  { pilote:"Verstappen", numero:"1",  ecurie:"Red Bull", course:"Circuit de l'Aube", temps:"01:21.500", date:"2026-05-10", type:"qualifications", position:"2"                 },
  { pilote:"Hamilton",   numero:"44", ecurie:"Mercedes", course:"Circuit de l'Aube", temps:"01:22.300", date:"2026-05-10", type:"qualifications", position:"3"                 },
  { pilote:"Norris",     numero:"4",  ecurie:"McLaren",  course:"Circuit de l'Aube", temps:"01:22.800", date:"2026-05-10", type:"qualifications", position:"4"                 },
  { pilote:"Sainz",      numero:"55", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:23.200", date:"2026-05-10", type:"qualifications", position:"5"                 },
  // Courses
  { pilote:"Verstappen", numero:"1",  ecurie:"Red Bull", course:"Circuit de l'Aube", temps:"01:24.789", date:"2026-05-10", type:"course",         position:"1", pos_depart:"2" },
  { pilote:"Leclerc",    numero:"16", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:23.456", date:"2026-05-10", type:"course",         position:"2", pos_depart:"1" },
  { pilote:"Norris",     numero:"4",  ecurie:"McLaren",  course:"Circuit de l'Aube", temps:"01:25.100", date:"2026-05-10", type:"course",         position:"3", pos_depart:"4" },
  { pilote:"Hamilton",   numero:"44", ecurie:"Mercedes", course:"Circuit de l'Aube", temps:"01:25.900", date:"2026-05-10", type:"course",         position:"4", pos_depart:"3" },
  { pilote:"Sainz",      numero:"55", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:26.400", date:"2026-05-10", type:"course",         position:"5", pos_depart:"5" },
];
