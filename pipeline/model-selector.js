/**
 * pipeline/model-selector.js
 * Sélectionne le modèle GLM à utiliser pour chaque tâche.
 * Logique 100% déterministe — aucun appel LLM.
 *
 * Principe : le risque prime toujours sur la taille apparente.
 */

// ── Modèles disponibles ───────────────────────────────────────────────────────
export const MODELS = {
  SMALL: "glm-4.7",   // tâches simples, faible risque, rapide
  LARGE: "glm-5.2",   // tâches complexes, sensibles, multi-fichiers
};

// ── Fichiers imposant toujours le grand modèle ────────────────────────────────
// Indépendamment de la taille estimée — la sensibilité prime
const ALWAYS_LARGE_MODEL_PATHS = [
  "api/check.js",
  "src/logic/ranking.js",
  "src/config.js",
  "config.js",
  "logic/ranking.js",
];

// ── Seuils de décision ────────────────────────────────────────────────────────
const MAX_LINES_FOR_SMALL  = 15; // au-delà → grand modèle
const MAX_FILES_FOR_SMALL  = 1;  // plus d'un fichier dans le plan → grand modèle

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Vérifie si un fichier impose le grand modèle (fichier sensible).
 * → boolean
 */
export function isSensitivePath(filePath) {
  const norm = filePath.replace(/^\.[\\/]/, "");
  return ALWAYS_LARGE_MODEL_PATHS.some(p => norm === p || norm.endsWith("/" + p));
}

// ── Sélection principale ──────────────────────────────────────────────────────

/**
 * Détermine le modèle pour une tâche individuelle.
 *
 * task: {
 *   file: string,            // fichier cible
 *   estimatedLines?: number, // estimation du Planificateur (optionnel)
 *   isSensitive?: boolean,   // flag explicite du Planificateur (optionnel)
 * }
 *
 * → { model: string, reason: string }
 */
export function selectModel(task) {
  // Règle 1 — Fichier sensible → toujours grand modèle, sans exception
  if (isSensitivePath(task.file)) {
    return {
      model:  MODELS.LARGE,
      reason: `Fichier sensible (${task.file}) — grand modèle imposé`,
    };
  }

  // Règle 2 — Flag explicite du Planificateur
  if (task.isSensitive === true) {
    return {
      model:  MODELS.LARGE,
      reason: "Tâche marquée sensible par le Planificateur",
    };
  }

  // Règle 3 — Taille estimée dépasse le seuil
  if (task.estimatedLines && task.estimatedLines > MAX_LINES_FOR_SMALL) {
    return {
      model:  MODELS.LARGE,
      reason: `Diff estimé (${task.estimatedLines} lignes) dépasse le seuil (${MAX_LINES_FOR_SMALL})`,
    };
  }

  // Règle 4 — Petit modèle par défaut
  return {
    model:  MODELS.SMALL,
    reason: `Tâche simple (≤ ${MAX_LINES_FOR_SMALL} lignes, fichier non sensible)`,
  };
}

/**
 * Applique la sélection de modèle à toute une liste de tâches.
 * Si la liste contient > MAX_FILES_FOR_SMALL fichiers distincts → grand modèle forcé sur toutes.
 *
 * tasks: [{ file, estimatedLines?, isSensitive? }]
 * → [{ ...task, model, reason }]
 */
export function selectModels(tasks) {
  // Règle globale : trop de fichiers distincts → tout en grand modèle
  const distinctFiles = new Set(tasks.map(t => t.file)).size;
  if (distinctFiles > MAX_FILES_FOR_SMALL) {
    return tasks.map(task => ({
      ...task,
      model:  MODELS.LARGE,
      reason: `Multi-fichiers (${distinctFiles} fichiers distincts) — grand modèle imposé sur toutes les tâches`,
    }));
  }

  return tasks.map(task => ({
    ...task,
    ...selectModel(task),
  }));
}
