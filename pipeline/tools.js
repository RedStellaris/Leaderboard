/**
 * pipeline/tools.js
 * Fonctions d'accès au système de fichiers exposées aux agents.
 * Toutes les opérations passent ici — jamais d'accès direct fs dans les agents.
 * Les garde-fous (guardrails.js) sont appelés avant chaque opération d'écriture.
 */

// read_file(path) → string | null
export function read_file(path) {}

// write_file(path, content, agentName) → { success, error? }
export function write_file(path, content, agentName) {}

// list_files(directory) → string[]
export function list_files(directory) {}

// diff_size(oldContent, newContent) → number (nb de lignes modifiées)
export function diff_size(oldContent, newContent) {}

// backup_file(path) → string (chemin de la backup)
export function backup_file(path) {}

// restore_backup(backupPath, originalPath) → { success, error? }
export function restore_backup(backupPath, originalPath) {}
