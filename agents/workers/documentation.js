/**
 * 📝 DOCUMENTATION WORKER
 * Maintient AGENTS.md, CLAUDE.md, commentaires inline.
 * Met à jour automatiquement la doc après chaque run.
 * Ne touche jamais au code source — uniquement fichiers .md et commentaires.
 */
export const DocumentationWorker = {
  name: "documentation-worker",
  model: "glm-4.7",
  systemPrompt: "",
  allowedTools: ["read_file", "write_file"],
  allowedPaths: ["AGENTS.md", "CLAUDE.md", "README.md"],
  forbiddenPaths: ["src/", "api/", ".env"],
  maxDiffLines: 100,
};
