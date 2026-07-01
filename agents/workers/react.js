/**
 * 💻 REACT WORKER
 * Logique composants uniquement : state, hooks, props, structure JSX.
 * Respecte les conventions AMCR : objet C, rowBg/rowBorder, structure modulaire.
 * Ne touche jamais au style pur (rôle UI) ni aux fichiers sensibles.
 */
export const ReactWorker = {
  name: "react-worker",
  model: null,                // assigné dynamiquement par le Sélecteur de modèle
  systemPrompt: "",
  allowedTools: ["read_file", "write_file"],
  allowedPaths: ["src/components/", "src/App.jsx"],
  forbiddenPaths: ["src/config.js", "api/check.js", ".env"],
  maxDiffLines: 150,
};
