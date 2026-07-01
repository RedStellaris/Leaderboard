/**
 * pipeline/guardrails.js
 * Garde-fous techniques — appelés avant toute opération d'écriture.
 * Aucun appel LLM ici — logique déterministe uniquement.
 */

// Vérifie si un agent a le droit d'accéder à un fichier
// agent: objet agent (avec allowedPaths et forbiddenPaths)
// path: chemin du fichier ciblé
// → { allowed: boolean, reason?: string }
export function isPathAllowed(agent, path) {}

// Vérifie que le diff ne dépasse pas la limite de l'agent
// oldContent: string, newContent: string, maxLines: number
// → { allowed: boolean, diffLines: number }
export function checkDiffSize(oldContent, newContent, maxLines) {}

// Vérifie qu'aucune tâche du plan ne crée de conflit (même fichier, deux workers)
// tasks: [{ file, assignedWorker }]
// → { conflicts: [{ file, workers: [] }] }
export function detectConflicts(tasks) {}

// Vérifie que le fichier n'est pas dans la liste noire globale
// (indépendamment de l'agent — certains fichiers sont intouchables)
// → { allowed: boolean }
export function isGloballyAllowed(path) {}

// Liste noire globale — fichiers jamais modifiables par aucun agent
export const GLOBAL_FORBIDDEN = [
  ".env",
  ".env.local",
  ".env.production",
  "vercel.json",
  "package-lock.json",   // géré uniquement par le Worker Dépendances via npm
];
