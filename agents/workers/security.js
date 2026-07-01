/**
 * 🔐 SÉCURITÉ WORKER
 * Revue des modifications pour failles : injection, exposition de secrets,
 * mauvaise gestion CORS, validation d'input manquante.
 * Rôle de contrôle uniquement — lecture seule, jamais d'écriture.
 * Intervient en revue après les Workers de production, avant l'Évaluateur.
 */
export const SecurityWorker = {
  name: "security-worker",
  model: "glm-4.7",           // rôle de revue — pas besoin du grand modèle systématiquement
  systemPrompt: "",
  allowedTools: ["read_file", "list_files"],
  allowedPaths: ["src/", "api/"],   // lecture seule sur tout
  forbiddenPaths: [".env"],
  maxDiffLines: 0,            // n'écrit jamais
};
