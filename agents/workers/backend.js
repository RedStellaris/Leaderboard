/**
 * ⚙ BACKEND WORKER — GARDE-FOUS RENFORCÉS
 * Bot Discord, logique serveur, api/check.js.
 *
 * RÈGLES SPÉCIALES (permanentes, pas seulement en phase de test) :
 * - Validation humaine OBLIGATOIRE à chaque run sans exception
 * - Diff limité à 50 lignes — arrêt automatique au-delà
 * - PR toujours isolée, jamais mélangée à d'autres modifications
 * - Aucun accès Vercel KV ni variables d'environnement
 * - Commentaire PR obligatoire détaillant l'impact sur le bot Discord
 * - Exécution automatique JAMAIS autorisée (lecture/écriture oui, exécution non)
 */
export const BackendWorker = {
  name: "backend-worker",
  model: "glm-5.2",           // toujours grand modèle — sensibilité maximale
  systemPrompt: "",
  allowedTools: ["read_file", "write_file"],
  allowedPaths: ["api/check.js"],
  forbiddenPaths: [".env", "vercel.json"],
  maxDiffLines: 50,           // seuil réduit vs autres workers
  requiresHumanValidation: true,
  isolatedPR: true,
};
