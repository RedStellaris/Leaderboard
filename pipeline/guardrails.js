/**
 * pipeline/guardrails.js
 * Garde-fous techniques — appelés avant toute opération d'écriture.
 * Aucun appel LLM ici — logique déterministe uniquement.
 */

import path from "path";
import { diff_size } from "./tools.js";

// ── Liste noire globale ───────────────────────────────────────────────────────
// Fichiers jamais modifiables par aucun agent, quelle que soit la situation
export const GLOBAL_FORBIDDEN = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  "vercel.json",
  "package-lock.json",
];

// ── Helpers internes ──────────────────────────────────────────────────────────

function normalizePath(p) {
  // Normalise les séparateurs et retire le ./ initial
  return path.normalize(p).replace(/^\.[\\/]/, "");
}

function matchesPattern(filePath, pattern) {
  const norm = normalizePath(filePath);
  const pat  = normalizePath(pattern);
  // Pattern terminant par / = dossier → préfixe
  if (pat.endsWith("/") || pat.endsWith("\\")) {
    return norm.startsWith(pat);
  }
  // Pattern exact
  return norm === pat;
}

// ── Fonctions exportées ───────────────────────────────────────────────────────

/**
 * Vérifie si un fichier est dans la liste noire globale.
 * Indépendant de l'agent — certains fichiers sont intouchables sans exception.
 * → { allowed: boolean, reason?: string }
 */
export function isGloballyAllowed(filePath) {
  const norm = normalizePath(filePath);
  for (const forbidden of GLOBAL_FORBIDDEN) {
    if (normalizePath(forbidden) === norm) {
      return { allowed: false, reason: `${filePath} est en liste noire globale — aucun agent ne peut le modifier` };
    }
  }
  return { allowed: true };
}

/**
 * Vérifie si un agent a le droit d'accéder à un fichier donné.
 * Applique allowedPaths ET forbiddenPaths de la définition de l'agent.
 * → { allowed: boolean, reason?: string }
 */
export function isPathAllowed(agent, filePath) {
  // 1. Vérification liste noire globale en premier
  const global = isGloballyAllowed(filePath);
  if (!global.allowed) return global;

  // 2. Liste noire de l'agent
  for (const forbidden of (agent.forbiddenPaths || [])) {
    if (matchesPattern(filePath, forbidden)) {
      return {
        allowed: false,
        reason: `${agent.name} : ${filePath} est dans sa liste interdite (${forbidden})`,
      };
    }
  }

  // 3. Liste blanche de l'agent (si vide → accès libre dans les limites globales)
  const allowed = agent.allowedPaths || [];
  if (allowed.length === 0) return { allowed: true };

  for (const pattern of allowed) {
    if (matchesPattern(filePath, pattern)) return { allowed: true };
  }

  return {
    allowed: false,
    reason: `${agent.name} : ${filePath} n'est pas dans sa liste blanche [${allowed.join(", ")}]`,
  };
}

/**
 * Vérifie que le diff entre deux versions d'un fichier ne dépasse pas
 * la limite de l'agent.
 * → { allowed: boolean, diffLines: number, maxLines: number }
 */
export function checkDiffSize(oldContent, newContent, maxLines) {
  const diffLines = diff_size(oldContent || "", newContent || "");
  if (maxLines <= 0) return { allowed: true, diffLines, maxLines }; // 0 = pas de limite
  return {
    allowed: diffLines <= maxLines,
    diffLines,
    maxLines,
  };
}

/**
 * Détecte les conflits de fichiers dans un plan de tâches.
 * Un conflit = le même fichier assigné à deux Workers différents.
 * → { hasConflicts: boolean, conflicts: [{ file, workers: string[] }] }
 */
export function detectConflicts(tasks) {
  // tasks: [{ file: string, assignedWorker: string }]
  const fileMap = {};
  for (const task of tasks) {
    if (!fileMap[task.file]) fileMap[task.file] = [];
    fileMap[task.file].push(task.assignedWorker);
  }

  const conflicts = Object.entries(fileMap)
    .filter(([, workers]) => new Set(workers).size > 1)
    .map(([file, workers]) => ({ file, workers: [...new Set(workers)] }));

  return { hasConflicts: conflicts.length > 0, conflicts };
}

/**
 * Validation complète avant qu'un Worker écrive un fichier.
 * Appelle isGloballyAllowed + isPathAllowed + checkDiffSize en une seule passe.
 * → { allowed: boolean, reason?: string, details: object }
 */
export function validateWrite(agent, filePath, oldContent, newContent) {
  const pathCheck = isPathAllowed(agent, filePath);
  if (!pathCheck.allowed) {
    return { allowed: false, reason: pathCheck.reason, details: { step: "path" } };
  }

  const diffCheck = checkDiffSize(oldContent, newContent, agent.maxDiffLines || 0);
  if (!diffCheck.allowed) {
    return {
      allowed: false,
      reason: `${agent.name} : diff trop grand (${diffCheck.diffLines} lignes modifiées, max ${diffCheck.maxLines})`,
      details: { step: "diff", diffLines: diffCheck.diffLines, maxLines: diffCheck.maxLines },
    };
  }

  return { allowed: true, details: { diffLines: diffCheck.diffLines } };
}
