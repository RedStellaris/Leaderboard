/**
 * pipeline/model-selector.js
 * Sélectionne le modèle GLM à utiliser pour chaque tâche.
 * Logique 100% déterministe — aucun appel LLM ici.
 *
 * Règle : le risque prime toujours sur la taille apparente de la tâche.
 */

// Fichiers qui imposent toujours le grand modèle, quelle que soit la taille du diff
const ALWAYS_LARGE_MODEL_PATHS = [
  "api/check.js",
  "src/logic/ranking.js",
  "src/config.js",
];

const SMALL_MODEL = "glm-4.7";       // tâches simples, faible risque
const LARGE_MODEL = "glm-5.2";       // tâches complexes ou sensibles

// Seuils de décision
const MAX_LINES_FOR_SMALL = 15;      // au-delà → grand modèle
const MAX_FILES_FOR_SMALL  = 1;      // plus d'un fichier → grand modèle

/**
 * Détermine le modèle à utiliser pour une tâche.
 * task: { file: string, estimatedLines: number, isSensitive?: boolean }
 * → { model: string, reason: string }
 */
export function selectModel(task) {}

/**
 * Détermine si un fichier impose le grand modèle.
 * → boolean
 */
export function isSensitivePath(path) {}
