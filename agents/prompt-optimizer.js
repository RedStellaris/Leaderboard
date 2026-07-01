/**
 * ⚡ OPTIMISEUR DE PROMPT
 * Reformule la demande utilisateur en instruction précise et sans ambiguïté.
 * Ne change jamais le périmètre ni l'intention — clarification uniquement.
 * Sortie : string (demande reformulée, langage naturel).
 */
export const PromptOptimizerAgent = {
  name: "prompt-optimizer",
  model: "glm-4.7",
  systemPrompt: "",
  allowedTools: [],
  allowedPaths: [],
  forbiddenPaths: [],
  maxDiffLines: 0,
};
