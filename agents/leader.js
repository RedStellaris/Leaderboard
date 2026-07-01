/**
 * 👑 LEADER
 * Point d'entrée et de sortie du pipeline.
 * Reçoit la demande brute, déclenche la chaîne, présente le résultat final à l'utilisateur.
 * Ne code rien, ne planifie rien — orchestration globale uniquement.
 */
export const LeaderAgent = {
  name: "leader",
  model: "glm-4.7",
  systemPrompt: "",           // rempli à l'Étape 2
  allowedTools: [],
  allowedPaths: [],
  forbiddenPaths: [],
  maxDiffLines: 0,
};
