import { SHEET_ID } from "../config.js";

export async function fetchSheetConfig() {
  try {
    // gviz/tq est la méthode fiable pour cibler un onglet par nom
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=config`;
    const res = await fetch(url);
    if (!res.ok) { console.warn("[config] fetch échoué :", res.status); return {}; }
    const text = await res.text();
    console.log("[config] CSV brut :", text.slice(0, 200)); // debug — à retirer après confirmation
    const [, ...lines] = text.trim().split("\n");
    const cfg = {};
    lines.forEach(l => {
      const vals = l.split(",").map(v => v.trim().replace(/"/g, ""));
      if (vals[0] && vals[1] !== undefined) cfg[vals[0]] = vals[1];
    });
    console.log("[config] cfg parsé :", cfg); // debug
    return cfg;
  } catch (e) { console.error("[config] erreur :", e); return {}; }
}

export async function fetchSheetData() {
  const res = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`);
  if (!res.ok) throw new Error("Feuille inaccessible — partagez-la en public (Lecteur)");
  const text = await res.text();
  const [header, ...lines] = text.trim().split("\n");
  const keys = header.split(",").map(k => k.trim().replace(/"/g, "").toLowerCase());
  const rows = lines
    .map(l => Object.fromEntries(l.split(",").map((v, i) => [keys[i], v.trim().replace(/"/g, "")])))
    .filter(r => r.pilote && r.course && r.temps);
  if (!rows.length) throw new Error("Aucune ligne valide — vérifiez les colonnes");
  return rows;
}
