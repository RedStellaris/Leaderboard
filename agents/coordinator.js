/**
 * 🤝 COORDINATEUR DES AGENTS
 * Reçoit la liste de tâches et assigne chacune au Worker compétent.
 * Vérifie l'absence de conflits entre tâches (même fichier modifié deux fois).
 * Applique les listes blanches avant toute exécution.
 * Impose un ordre d'exécution si des tâches sont interdépendantes.
 * Ne code rien — répartiteur avec contrôle d'accès.
 * Sortie : JSON — [{ task, assignedWorker, model, order }]
 */
export const CoordinatorAgent = {
  name: "coordinator",
  model: "glm-4.7",
  systemPrompt: "",
  allowedTools: [],
  allowedPaths: [],
  forbiddenPaths: [],
  maxDiffLines: 0,
};
