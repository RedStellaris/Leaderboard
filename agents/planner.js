/**
 * 📋 PLANIFICATEUR + CRÉATEUR DE PROMPTS
 * Découpe la demande optimisée en tâches concrètes, une par fichier à modifier.
 * Rédige un prompt précis destiné au Worker pour chaque tâche.
 * Sortie : JSON — [{ file, instruction, estimatedLines, isSensitive }]
 */
export const PlannerAgent = {
  name: "planner",
  model: "glm-5.2",           // découpage complexe — grand modèle
  systemPrompt: "",
  allowedTools: ["list_files", "read_file"],  // lecture seule pour comprendre la structure
  allowedPaths: ["src/"],
  forbiddenPaths: [],
  maxDiffLines: 0,
};
