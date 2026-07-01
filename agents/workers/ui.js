/**
 * 🎨 UI WORKER
 * Style visuel uniquement : couleurs, espacements, animations CSS, layout.
 * Peut lire les mêmes fichiers que React mais n'intervient que sur le style.
 * Si une tâche touche logique ET style, le Coordinateur split en deux tâches distinctes.
 */
export const UIWorker = {
  name: "ui-worker",
  model: null,
  systemPrompt: "",
  allowedTools: ["read_file", "write_file"],
  allowedPaths: ["src/components/", "src/App.jsx"],
  forbiddenPaths: ["src/config.js", "api/check.js", ".env"],
  maxDiffLines: 100,
};
