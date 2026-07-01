/**
 * 🔍 VÉRIFICATEUR DE COHÉRENCE
 * Contrôle l'intégration globale après tous les Workers.
 * Vérifie : props passées mais jamais lues, imports manquants, doublons de logique entre fichiers.
 * Distinct de l'Évaluateur : juge l'ensemble, pas une tâche isolée.
 * Sortie : "OK" ou liste des incohérences détectées.
 */
export const ConsistencyCheckerAgent = {
  name: "consistency-checker",
  model: "glm-5.2",           // vision globale multi-fichiers — grand modèle
  systemPrompt: "",
  allowedTools: ["read_file", "list_files"],
  allowedPaths: ["src/"],
  forbiddenPaths: [],
  maxDiffLines: 0,
};
