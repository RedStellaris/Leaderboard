import { useState } from "react";
import { C } from "../../config.js";

export function SheetsLoader({ onLoad }) {
  const [url,  setUrl]  = useState("");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  async function load() {
    if (!url.trim()) return;
    setBusy(true); setErr("");
    try {
      const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!m) throw new Error("URL invalide — copiez l'URL depuis la barre d'adresse de Sheets");
      const csv = await fetch(`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`);
      if (!csv.ok) throw new Error("Feuille inaccessible — partagez-la en public (Lecteur)");
      const text = await csv.text();
      const [header, ...lines] = text.trim().split("\n");
      const keys = header.split(",").map(k => k.trim().replace(/"/g, "").toLowerCase());
      const rows = lines
        .map(l => Object.fromEntries(l.split(",").map((v, i) => [keys[i], v.trim().replace(/"/g, "")])))
        .filter(r => r.pilote && r.course && r.temps);
      if (!rows.length) throw new Error("Aucune ligne valide — vérifiez les colonnes");
      onLoad(rows);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/…"
          style={{ flex: 1, minWidth: 260, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 12px", color: C.text, fontSize: "0.8rem", outline: "none" }}
        />
        <button onClick={load} disabled={busy} style={{ background: C.accent, border: "none", color: "#fff", padding: "7px 18px", borderRadius: 6, cursor: busy ? "wait" : "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
          {busy ? "Chargement…" : "Charger"}
        </button>
      </div>
      {err && <p style={{ color: C.accent, fontSize: "0.75rem", margin: "6px 0 0" }}>⚠ {err}</p>}
      <p style={{ color: C.soft, fontSize: "0.7rem", margin: "8px 0 0" }}>
        Colonnes : <code style={{ color: C.text }}>pilote, numero, ecurie, course, temps, date, type, position</code> · Courses : <code style={{ color: C.text }}>pos_depart</code>
      </p>
    </div>
  );
}
