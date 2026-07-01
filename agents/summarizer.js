/**
 * 📖 RÉSUMEUR DE CONVERSATIONS
 * Compile l'historique du run en résumé lisible pour le Leader et l'utilisateur.
 * Contenu : tâches exécutées, décisions prises, rejets éventuels, fichiers modifiés.
 * N'intervient jamais sur le code.
 * Sortie : string (markdown lisible).
 */
export const SummarizerAgent = {
  name: "summarizer",
  model: "glm-4.7",
  systemPrompt: "",
  allowedTools: [],
  allowedPaths: [],
  forbiddenPaths: [],
  maxDiffLines: 0,
};
