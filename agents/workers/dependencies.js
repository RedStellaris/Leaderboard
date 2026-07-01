/**
 * 📦 DÉPENDANCES WORKER
 * Audit et mise à jour de package.json, compatibilité de versions.
 * Vérifie qu'une modification n'introduit pas de dépendance non désirée
 * ou un conflit de version avec Vite/React existants.
 * Rôle d'audit plus que de production — modifications très limitées.
 */
export const DependenciesWorker = {
  name: "dependencies-worker",
  model: "glm-4.7",
  systemPrompt: "",
  allowedTools: ["read_file", "write_file"],
  allowedPaths: ["package.json", "package-lock.json", "vite.config.js"],
  forbiddenPaths: ["src/", "api/", ".env"],
  maxDiffLines: 30,
};
