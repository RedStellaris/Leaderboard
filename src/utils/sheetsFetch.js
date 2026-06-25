import { SHEET_ID } from "../config.js";

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
