/**
 * 📊 ÉVALUATEUR
 * Vérifie que le code produit par un Worker répond à l'instruction donnée.
 * Détecte les erreurs évidentes : syntaxe, logique cassée, prop manquante.
 * Valide ou rejette — ne réécrit jamais le code lui-même.
 * Sortie : "OK" ou liste des problèmes détectés (string).
 */
export const EvaluatorAgent = {
  name: "evaluator",
  model: "glm-4.7",
  systemPrompt: "",
  allowedTools: ["read_file"],   // lecture seule pour comparer avec l'existant si besoin
  allowedPaths: ["src/"],
  forbiddenPaths: [],
  maxDiffLines: 0,
};
