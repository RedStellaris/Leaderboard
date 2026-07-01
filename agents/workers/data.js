/**
 * 📊 DATA WORKER (inclut Sim Racing)
 * Parsing CSV/Sheets, logique de classement, formats de temps, règles métier GT3.
 * Couvre : sheetsFetch.js, logic/ranking.js, utils/timeUtils.js.
 * Détient l'expertise des règles spécifiques au championnat (barème F1, mm:ss,cc, etc.)
 * que les autres Workers ne doivent pas réinventer.
 */
export const DataWorker = {
  name: "data-worker",
  model: null,
  systemPrompt: "",
  allowedTools: ["read_file", "write_file"],
  allowedPaths: [
    "src/utils/sheetsFetch.js",
    "src/utils/timeUtils.js",
    "src/logic/ranking.js",
    "src/logic/sortUtils.js",
  ],
  forbiddenPaths: ["src/config.js", "api/check.js", ".env"],
  maxDiffLines: 150,
};
