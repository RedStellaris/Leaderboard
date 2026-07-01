/**
 * 🧪 TESTS WORKER
 * Outillage : Vitest + React Testing Library.
 * Priorité de démarrage : fonctions pures critiques (logic/ranking.js, utils/timeUtils.js)
 * avant les composants React plus coûteux à tester.
 * Prérequis : Vitest doit être installé dans le projet avant activation de cet agent.
 */
export const TestsWorker = {
  name: "tests-worker",
  model: null,
  systemPrompt: "",
  allowedTools: ["read_file", "write_file"],
  allowedPaths: ["src/logic/", "src/utils/", "src/__tests__/", "vitest.config.js"],
  forbiddenPaths: ["api/check.js", ".env"],
  maxDiffLines: 200,          // les fichiers de test peuvent être longs
};
