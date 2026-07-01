/**
 * pipeline/tools.js
 * Fonctions d'accès au système de fichiers exposées aux agents.
 * Toutes les opérations passent ici — jamais d'accès direct fs dans les agents.
 */

import fs   from "fs";
import path from "path";

// Racine du projet AMCR — le pipeline tourne depuis la racine du repo
const PROJECT_ROOT = process.cwd();

// ── Helpers internes ──────────────────────────────────────────────────────────

function resolvePath(filePath) {
  return path.resolve(PROJECT_ROOT, filePath);
}

// ── Outils exposés aux agents ─────────────────────────────────────────────────

/**
 * Lit le contenu d'un fichier texte.
 * → string | null (null si le fichier n'existe pas)
 */
export function read_file(filePath) {
  try {
    const abs = resolvePath(filePath);
    if (!fs.existsSync(abs)) return null;
    return fs.readFileSync(abs, "utf-8");
  } catch (e) {
    console.error(`[tools] read_file erreur sur ${filePath} :`, e.message);
    return null;
  }
}

/**
 * Écrit du contenu dans un fichier.
 * Crée les dossiers intermédiaires si nécessaire.
 * → { success: boolean, error?: string }
 */
export function write_file(filePath, content) {
  try {
    const abs = resolvePath(filePath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
    return { success: true };
  } catch (e) {
    console.error(`[tools] write_file erreur sur ${filePath} :`, e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Liste les fichiers dans un dossier (récursif, uniquement les fichiers).
 * → string[] (chemins relatifs depuis la racine du projet)
 */
export function list_files(directory) {
  try {
    const abs = resolvePath(directory);
    if (!fs.existsSync(abs)) return [];
    const result = [];
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Ignorer node_modules et .git
          if (entry.name === "node_modules" || entry.name === ".git") continue;
          walk(full);
        } else {
          result.push(path.relative(PROJECT_ROOT, full));
        }
      }
    }
    walk(abs);
    return result;
  } catch (e) {
    console.error(`[tools] list_files erreur sur ${directory} :`, e.message);
    return [];
  }
}

/**
 * Calcule le nombre de lignes modifiées entre deux versions d'un fichier.
 * Méthode simple : compte les lignes qui diffèrent (ajouts + suppressions).
 * → number
 */
export function diff_size(oldContent, newContent) {
  if (!oldContent && !newContent) return 0;
  if (!oldContent) return newContent.split("\n").length;
  if (!newContent) return oldContent.split("\n").length;

  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");

  // Diff ligne par ligne — pas un vrai diff Myers, suffisant pour les garde-fous
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  const added   = newLines.filter(l => !oldSet.has(l)).length;
  const removed = oldLines.filter(l => !newSet.has(l)).length;

  return added + removed;
}

/**
 * Crée une backup d'un fichier avant modification.
 * → string (chemin de la backup) | null si erreur
 */
export function backup_file(filePath) {
  try {
    const abs        = resolvePath(filePath);
    if (!fs.existsSync(abs)) return null;
    const backupPath = abs + `.backup_${Date.now()}`;
    fs.copyFileSync(abs, backupPath);
    return backupPath;
  } catch (e) {
    console.error(`[tools] backup_file erreur sur ${filePath} :`, e.message);
    return null;
  }
}

/**
 * Restaure un fichier depuis sa backup.
 * → { success: boolean, error?: string }
 */
export function restore_backup(backupPath, originalPath) {
  try {
    const absBackup   = resolvePath(backupPath);
    const absOriginal = resolvePath(originalPath);
    if (!fs.existsSync(absBackup)) return { success: false, error: "Backup introuvable" };
    fs.copyFileSync(absBackup, absOriginal);
    fs.unlinkSync(absBackup); // nettoyer la backup après restauration
    return { success: true };
  } catch (e) {
    console.error(`[tools] restore_backup erreur :`, e.message);
    return { success: false, error: e.message };
  }
}
