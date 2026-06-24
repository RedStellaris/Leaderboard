import { useState, useMemo, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ==================== LOGO ====================
const LOGO = "/logo.png";

// ==================== CHAMPIONSHIP ====================
const CHAMPIONSHIP_NAME   = "GT3 Championship";          // ← à personnaliser
const CHAMPIONSHIP_SEASON = "Saison 2026";               // ← à personnaliser
const DISCORD_URL         = "https://discord.gg/LIEN";   // ← à remplacer
const CURRENT_CHAMPION    = "";                          // ← Nom du champion (ex: "Dupont") ou "" pour auto-détection depuis les courses

// ==================== MOCK DATA ====================
const MOCK_DATA = [
  // Essais
  { pilote:"Leclerc",    numero:"16", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:23.456", date:"2026-05-10", type:"essais",         position:"2"                },
  { pilote:"Verstappen", numero:"1",  ecurie:"Red Bull", course:"Circuit de l'Aube", temps:"01:21.789", date:"2026-05-10", type:"essais",         position:"1"                },
  { pilote:"Hamilton",   numero:"44", ecurie:"Mercedes", course:"Circuit de l'Aube", temps:"01:24.201", date:"2026-05-10", type:"essais",         position:"3"                },
  { pilote:"Norris",     numero:"4",  ecurie:"McLaren",  course:"Circuit de l'Aube", temps:"01:22.934", date:"2026-05-10", type:"essais",         position:"4"                },
  { pilote:"Sainz",      numero:"55", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:25.678", date:"2026-05-10", type:"essais",         position:"5"                },
  // Qualifications
  { pilote:"Leclerc",    numero:"16", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:21.100", date:"2026-05-10", type:"qualifications", position:"1"                },
  { pilote:"Verstappen", numero:"1",  ecurie:"Red Bull", course:"Circuit de l'Aube", temps:"01:21.500", date:"2026-05-10", type:"qualifications", position:"2"                },
  { pilote:"Hamilton",   numero:"44", ecurie:"Mercedes", course:"Circuit de l'Aube", temps:"01:22.300", date:"2026-05-10", type:"qualifications", position:"3"                },
  { pilote:"Norris",     numero:"4",  ecurie:"McLaren",  course:"Circuit de l'Aube", temps:"01:22.800", date:"2026-05-10", type:"qualifications", position:"4"                },
  { pilote:"Sainz",      numero:"55", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:23.200", date:"2026-05-10", type:"qualifications", position:"5"                },
  // Courses
  { pilote:"Verstappen", numero:"1",  ecurie:"Red Bull", course:"Circuit de l'Aube", temps:"01:24.789", date:"2026-05-10", type:"course",         position:"1", pos_depart:"2" },
  { pilote:"Leclerc",    numero:"16", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:23.456", date:"2026-05-10", type:"course",         position:"2", pos_depart:"1" },
  { pilote:"Norris",     numero:"4",  ecurie:"McLaren",  course:"Circuit de l'Aube", temps:"01:25.100", date:"2026-05-10", type:"course",         position:"3", pos_depart:"4" },
  { pilote:"Hamilton",   numero:"44", ecurie:"Mercedes", course:"Circuit de l'Aube", temps:"01:25.900", date:"2026-05-10", type:"course",         position:"4", pos_depart:"3" },
  { pilote:"Sainz",      numero:"55", ecurie:"Ferrari",  course:"Circuit de l'Aube", temps:"01:26.400", date:"2026-05-10", type:"course",         position:"5", pos_depart:"5" },
];

// ==================== CONSTANTES ====================
const F1_POINTS = [25, 18, 15, 10, 8];
const SHEET_ID  = "1mABgHcqT9kzriAIuscMitRH72WuWJmYUOtxDmnKGSRg";
const SESSIONS  = [
  { key:"essais",         label:"🔧 Essais"        },
  { key:"qualifications", label:"⏱️ Qualifications" },
  { key:"course",         label:"🏆 Courses"        },
];
const C = {
  bg:"#09090E", card:"#111118", row:"#13131C", rowAlt:"#181826",
  accent:"#C41230", accentDim:"#6B0A1A", gold:"#F5A623",
  text:"#EEEEF5", soft:"#6A6A80", border:"#222230",
};

// ==================== FETCH ====================
async function fetchSheetData() {
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

// ==================== UTILS ====================
function parseTime(str) {
  if (!str || typeof str !== "string") return Infinity;
  try {
    const dotIdx = str.lastIndexOf(".");
    const colIdx = str.indexOf(":");
    if (colIdx === -1) return Infinity;
    const min = parseInt(str.slice(0, colIdx), 10);
    const sec = parseInt(str.slice(colIdx + 1, dotIdx !== -1 ? dotIdx : undefined), 10);
    const ms  = dotIdx !== -1 ? parseInt(str.slice(dotIdx + 1).padEnd(3, "0"), 10) : 0;
    if (isNaN(min) || isNaN(sec) || isNaN(ms)) return Infinity;
    return min * 60000 + sec * 1000 + ms;
  } catch { return Infinity; }
}
function formatTime(ms) {
  if (!isFinite(ms)) return "--:--.---";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}.${String(mil).padStart(3,"0")}`;
}
function formatDelta(ms) {
  if (ms === 0) return "LEADER";
  const s = Math.floor(ms / 1000), mil = ms % 1000;
  return `+${s}.${String(mil).padStart(3,"0")}`;
}
function computeTimeAgo(date) {
  if (!date) return "";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60)   return "à l'instant";
  if (secs < 3600) return `il y a ${Math.floor(secs / 60)} min`;
  return `il y a ${Math.floor(secs / 3600)}h`;
}


// ==================== EXPORT PDF ====================
async function loadLogoBase64() {
  try {
    const r   = await fetch("/logo.png");
    const buf = await r.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return "data:image/png;base64," + b64;
  } catch { return null; }
}

async function exportPDF({ title, sessionLabel, columns, rows, filename }) {
  const doc  = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const logo = await loadLogoBase64();

  // ── En-tête ──────────────────────────────────────────────────────────────
  const W = 297;
  doc.setFillColor(9, 9, 14);
  doc.rect(0, 0, W, 28, "F");

  // Logo
  if (logo) {
    try { doc.addImage(logo, "PNG", 8, 4, 20, 20); } catch {}
  }

  // Titre
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(238, 238, 245);
  doc.text("Leaderboard GT3", logo ? 32 : 12, 13);

  // Sous-titre (session + vue)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(106, 106, 128);
  doc.text(sessionLabel, logo ? 32 : 12, 21);

  // Date à droite
  const now = new Date().toLocaleString("fr-FR", { dateStyle:"short", timeStyle:"short" });
  doc.setFontSize(8);
  doc.text(now, W - 10, 13, { align: "right" });
  doc.text("classement-ten.vercel.app", W - 10, 21, { align: "right" });

  // ── Tableau ───────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY:    32,
    head:      [columns],
    body:      rows,
    margin:    { left: 8, right: 8 },
    styles:    { fontSize: 9, cellPadding: 3, textColor: [30, 30, 40] },
    headStyles:{
      fillColor: [196, 18, 48], textColor: [255, 255, 255],
      fontStyle: "bold", fontSize: 9,
    },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: { 0: { halign: "center" } },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 160);
    doc.text(`Page ${i} / ${pageCount}`, W / 2, 205, { align: "center" });
  }

  doc.save(filename);
}

function usePDFExport() {
  const [exporting, setExporting] = useState(false);
  async function doExport(config) {
    setExporting(true);
    try { await exportPDF(config); }
    finally { setExporting(false); }
  }
  return [exporting, doExport];
}

// ==================== COMPUTE ====================
function courseRanking(data, course) {
  const rows   = data.filter(d => d.course === course);
  const hasPos = rows.some(r => r.position && !isNaN(parseInt(r.position)));
  const sorted = [...rows].sort((a, b) => {
    if (hasPos) return (parseInt(a.position) || 999) - (parseInt(b.position) || 999);
    return parseTime(a.temps) - parseTime(b.temps);
  });
  const best = parseTime(sorted[0]?.temps);
  return sorted.map((r, i) => ({
    ...r, rank: i + 1, ms: parseTime(r.temps),
    delta: parseTime(r.temps) - best,
    points: F1_POINTS[(parseInt(r.position) || i + 1) - 1] ?? 0,
  }));
}
function cumulativeRanking(data, pilots, courses) {
  return pilots.map(pilote => {
    const rows  = data.filter(d => d.pilote === pilote);
    const total = rows.reduce((s, r) => s + parseTime(r.temps), 0);
    const done  = courses.filter(c => rows.some(r => r.course === c)).length;
    return { pilote, totalMs: total, avgMs: done ? total / done : Infinity, done, of: courses.length };
  }).sort((a, b) => b.done - a.done || a.totalMs - b.totalMs);
}
function pointsRanking(data, pilots, courses) {
  const pts = {}, details = {};
  pilots.forEach(p => { pts[p] = 0; details[p] = {}; });
  courses.forEach(course => {
    courseRanking(data, course).forEach(r => {
      if (pts[r.pilote] !== undefined) {
        pts[r.pilote] += r.points;
        details[r.pilote][course] = { rank: r.rank, pts: r.points };
      }
    });
  });
  return pilots.map(p => ({ pilote: p, points: pts[p], detail: details[p] }))
    .sort((a, b) => b.points - a.points);
}
function getPilotInfo(data, pilote) {
  const r = data.find(d => d.pilote === pilote);
  return { ecurie: r?.ecurie || "–", numero: r?.numero || "" };
}

// ==================== SORT UTILS ====================
function useSortConfig() {
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });
  function onSort(key) {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  }
  return [sortConfig, onSort];
}
function sortRows(rows, sortConfig, getVal) {
  if (!sortConfig.key) return rows;
  return [...rows].sort((a, b) => {
    const va = getVal(a, sortConfig.key);
    const vb = getVal(b, sortConfig.key);
    if (typeof va === "string") {
      return sortConfig.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortConfig.dir === "asc" ? va - vb : vb - va;
  });
}

// ==================== UI ATOMS ====================
const medal = ["🥇","🥈","🥉"];
function Rank({ n }) {
  if (n <= 3) return <span style={{ fontSize:"1rem" }}>{medal[n - 1]}</span>;
  return <span style={{ color:C.soft, fontSize:"0.82rem", fontWeight:600 }}>P{n}</span>;
}

// Th normal (non triable)
function Th({ children, right, center, display }) {
  const fs = display ? "0.8rem" : "0.68rem";
  return (
    <th style={{
      padding:"9px 12px", textAlign: right ? "right" : center ? "center" : "left",
      fontSize:fs, fontWeight:700, letterSpacing:"0.1em",
      color:C.soft, textTransform:"uppercase",
      background:C.card, borderBottom:`1px solid ${C.border}`,
    }}>{children}</th>
  );
}
// Th triable
function STh({ children, sortKey, sortConfig, onSort, right, center, display }) {
  const isActive = sortConfig.key === sortKey;
  const arrow    = isActive ? (sortConfig.dir === "asc" ? " ↑" : " ↓") : " ·";
  const fs       = display ? "0.8rem" : "0.68rem";
  return (
    <th onClick={() => onSort(sortKey)} style={{
      padding:"9px 12px", textAlign: right ? "right" : center ? "center" : "left",
      fontSize:fs, fontWeight:700, letterSpacing:"0.1em",
      color: isActive ? C.text : C.soft, textTransform:"uppercase",
      background:C.card, borderBottom:`1px solid ${C.border}`,
      cursor:"pointer", userSelect:"none", whiteSpace:"nowrap",
    }}>
      {children}<span style={{ opacity:0.5 }}>{arrow}</span>
    </th>
  );
}

function Td({ children, right, center, mono, bold, dim, gold, display }) {
  const fs = display ? "1.05rem" : "0.875rem";
  const pd = display ? "14px 14px" : "11px 12px";
  return (
    <td style={{
      padding:pd, textAlign: center ? "center" : right ? "right" : "left",
      fontFamily: mono ? "'Courier New',monospace" : "inherit",
      fontWeight: bold ? 600 : 400, fontSize:fs,
      color: gold ? C.gold : dim ? C.soft : C.text,
      borderBottom:`1px solid ${C.border}22`,
    }}>{children}</td>
  );
}
function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.accent : "transparent",
      border:`1px solid ${active ? C.accent : C.border}`,
      color: active ? "#fff" : C.soft,
      padding:"6px 16px", borderRadius:20, cursor:"pointer",
      fontSize:"0.8rem", fontWeight: active ? 600 : 400,
    }}>{children}</button>
  );
}
function HeaderBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background:"transparent", border:`1px solid ${C.border}`,
      color:C.soft, padding:"8px 14px", borderRadius:8,
      cursor:"pointer", fontSize:"0.8rem",
      display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
    }}>{children}</button>
  );
}

// ==================== ROW HIGHLIGHT ====================
function rowBg(pilote, myPilot, i) {
  if (myPilot && pilote === myPilot) return "#C4123020";
  return i % 2 === 0 ? C.row : C.rowAlt;
}
function rowBorder(pilote, myPilot) {
  return myPilot && pilote === myPilot
    ? `3px solid ${C.accent}`
    : "3px solid transparent";
}

// ==================== TABLES ====================
function CourseTable({ ranking, isRace, myPilot, display }) {
  const [sortConfig, onSort] = useSortConfig();
  const sorted = sortRows(ranking, sortConfig, (r, k) => ({
    pilote: r.pilote || "", ecurie: r.ecurie || "",
    temps: parseTime(r.temps), delta: r.delta, pts: r.points,
  }[k]));
  const sp = { sortConfig, onSort };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          {isRace && <Th center display={display}>Grille</Th>}
          <Th center display={display}>Pos.</Th>
          <Th center display={display}>#</Th>
          <STh sortKey="pilote" {...sp} display={display}>Pilote</STh>
          <STh sortKey="ecurie" {...sp} display={display}>Écurie</STh>
          <STh sortKey="temps"  {...sp} right display={display}>Temps</STh>
          <STh sortKey="delta"  {...sp} right display={display}>Écart</STh>
          <STh sortKey="pts"    {...sp} right display={display}>Pts</STh>
        </tr></thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.pilote} style={{
              background: rowBg(r.pilote, myPilot, i),
              borderLeft: rowBorder(r.pilote, myPilot),
            }}>
              {isRace && <Td center dim display={display}>{r.pos_depart ? `P${r.pos_depart}` : "–"}</Td>}
              <Td center display={display}><Rank n={parseInt(r.position) || r.rank} /></Td>
              <Td center dim display={display}>{r.numero ? `#${r.numero}` : "–"}</Td>
              <Td bold gold={!myPilot && i===0} display={display}
                  style={myPilot && r.pilote===myPilot ? {color:C.accent,fontWeight:700} : {}}>
                {r.pilote}
              </Td>
              <Td dim display={display}>{r.ecurie || "–"}</Td>
              <Td right mono gold={!myPilot && i===0} display={display}>{r.temps}</Td>
              <Td right mono dim display={display}>{r.delta === 0 ? "–" : formatDelta(r.delta)}</Td>
              <Td right bold display={display}>{r.points > 0 ? r.points : "–"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CumulTable({ ranking, data, myPilot, display }) {
  const [sortConfig, onSort] = useSortConfig();
  const sorted = sortRows(ranking, sortConfig, (r, k) => ({
    pilote: r.pilote || "", ecurie: getPilotInfo(data, r.pilote).ecurie,
    total: r.totalMs, moy: r.avgMs, courses: r.done,
  }[k]));
  const sp = { sortConfig, onSort };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th center display={display}>Pos</Th>
          <Th center display={display}>#</Th>
          <STh sortKey="pilote"  {...sp} display={display}>Pilote</STh>
          <STh sortKey="ecurie"  {...sp} display={display}>Écurie</STh>
          <STh sortKey="total"   {...sp} right display={display}>Temps total</STh>
          <STh sortKey="moy"     {...sp} right display={display}>Moy / course</STh>
          <STh sortKey="courses" {...sp} right display={display}>Courses</STh>
        </tr></thead>
        <tbody>
          {sorted.map((r, i) => {
            const info = getPilotInfo(data, r.pilote);
            const mine = myPilot && r.pilote === myPilot;
            return (
              <tr key={r.pilote} style={{ background: rowBg(r.pilote, myPilot, i), borderLeft: rowBorder(r.pilote, myPilot) }}>
                <Td center display={display}><Rank n={i + 1} /></Td>
                <Td center dim display={display}>{info.numero ? `#${info.numero}` : "–"}</Td>
                <Td bold gold={!myPilot && i===0} display={display}>{r.pilote}{i===0 && !myPilot ? " 👑" : ""}</Td>
                <Td dim display={display}>{info.ecurie}</Td>
                <Td right mono gold={!myPilot && i===0} display={display}>{formatTime(r.totalMs)}</Td>
                <Td right mono dim display={display}>{formatTime(Math.round(r.avgMs))}</Td>
                <Td right dim display={display}>{r.done}/{r.of}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"10px 0 0" }}>
        * Pilotes ayant complété toutes les courses classés en priorité
      </p>
    </div>
  );
}

function PtsTable({ ranking, courses, data, myPilot, display }) {
  const [sortConfig, onSort] = useSortConfig();
  const sorted = sortRows(ranking, sortConfig, (r, k) => ({
    pilote: r.pilote || "", ecurie: getPilotInfo(data, r.pilote).ecurie,
    points: r.points,
  }[k]));
  const sp = { sortConfig, onSort };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th center display={display}>Pos</Th>
          <Th center display={display}>#</Th>
          <STh sortKey="pilote" {...sp} display={display}>Pilote</STh>
          <STh sortKey="ecurie" {...sp} display={display}>Écurie</STh>
          <STh sortKey="points" {...sp} right display={display}>Points</STh>
          {courses.map(c => <Th key={c} right display={display}><span style={{fontSize:"0.65rem"}}>{c}</span></Th>)}
        </tr></thead>
        <tbody>
          {sorted.map((r, i) => {
            const info = getPilotInfo(data, r.pilote);
            return (
              <tr key={r.pilote} style={{ background: rowBg(r.pilote, myPilot, i), borderLeft: rowBorder(r.pilote, myPilot) }}>
                <Td center display={display}><Rank n={i + 1} /></Td>
                <Td center dim display={display}>{info.numero ? `#${info.numero}` : "–"}</Td>
                <Td bold gold={!myPilot && i===0} display={display}>{r.pilote}{i===0 && !myPilot ? " 👑" : ""}</Td>
                <Td dim display={display}>{info.ecurie}</Td>
                <Td right bold gold={!myPilot && i===0} display={display}>{r.points} pts</Td>
                {courses.map(c => {
                  const d = r.detail[c];
                  return (
                    <Td key={c} right dim display={display}>
                      {d ? <span style={{color: d.rank<=3 ? C.gold : C.soft}}>{d.pts}</span>
                         : <span style={{color:"#2a2a3a"}}>–</span>}
                    </Td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"10px 0 0" }}>
        Barème : 25 – 18 – 15 – 10 – 8 pts · Au-delà de la 5ème place : 0 pt
      </p>
    </div>
  );
}

// ==================== VIEWS ====================
function GlobalView({ sub, setSub, cumul, pts, courses, data, myPilot, display, sessionLabel }) {
  const [exporting, doExport] = usePDFExport();

  function handleExport() {
    if (sub === "cumul") {
      const cols = ["Pos", "#", "Pilote", "Écurie", "Temps total", "Moy / course", "Courses"];
      const rows = cumul.map((r, i) => {
        const info = getPilotInfo(data, r.pilote);
        return [
          `P${i+1}`, info.numero ? `#${info.numero}` : "–",
          r.pilote, info.ecurie,
          formatTime(r.totalMs), formatTime(Math.round(r.avgMs)),
          `${r.done}/${r.of}`,
        ];
      });
      doExport({ title:"Classement global — Temps cumulé", sessionLabel:`${sessionLabel} · Temps cumulé`, columns:cols, rows, filename:`classement_global_temps_${sessionLabel}.pdf` });
    } else {
      const cols = ["Pos", "#", "Pilote", "Écurie", "Points", ...courses];
      const rows = pts.map((r, i) => {
        const info = getPilotInfo(data, r.pilote);
        return [
          `P${i+1}`, info.numero ? `#${info.numero}` : "–",
          r.pilote, info.ecurie, `${r.points} pts`,
          ...courses.map(c => r.detail[c] ? String(r.detail[c].pts) : "–"),
        ];
      });
      doExport({ title:"Classement global — Points", sessionLabel:`${sessionLabel} · Points`, columns:cols, rows, filename:`classement_global_points_${sessionLabel}.pdf` });
    }
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:8 }}>
          <Pill active={sub==="cumul"} onClick={()=>setSub("cumul")}>⏱ Temps cumulé</Pill>
          <Pill active={sub==="pts"}   onClick={()=>setSub("pts")}>🏆 Points</Pill>
        </div>
        {!display && (
          <button onClick={handleExport} disabled={exporting} style={{
            background: exporting ? C.card : C.accentDim,
            border:`1px solid ${C.accent}`, color: exporting ? C.soft : "#fff",
            padding:"8px 14px", borderRadius:7, cursor: exporting ? "wait" : "pointer",
            fontSize:"0.8rem", fontWeight:600, display:"flex", alignItems:"center", gap:6,
          }}>
            {exporting ? "⏳ Export…" : "📄 PDF"}
          </button>
        )}
      </div>
      {sub==="cumul"
        ? <CumulTable ranking={cumul} data={data} myPilot={myPilot} display={display} />
        : <PtsTable   ranking={pts}   courses={courses} data={data} myPilot={myPilot} display={display} />}
    </div>
  );
}

function CourseView({ course, data, isRace, myPilot, display, sessionLabel }) {
  const ranking          = useMemo(() => courseRanking(data, course), [data, course]);
  const best             = ranking[0];
  const timeFs           = display ? "2.2rem" : "1.6rem";
  const [exporting, doExport] = usePDFExport();

  function handleExport() {
    const medal = ["🥇","🥈","🥉"];
    const cols = [
      ...(isRace ? ["Grille"] : []),
      "Pos.", "#", "Pilote", "Écurie", "Temps", "Écart", "Pts"
    ];
    const rows = ranking.map((r, i) => [
      ...(isRace ? [r.pos_depart ? `P${r.pos_depart}` : "–"] : []),
      r.position ? `P${r.position}` : `P${r.rank}`,
      r.numero   ? `#${r.numero}`  : "–",
      r.pilote, r.ecurie || "–", r.temps,
      r.delta === 0 ? "LEADER" : `+${Math.floor(r.delta/1000)}.${String(r.delta%1000).padStart(3,"0")}`,
      r.points > 0 ? String(r.points) : "–",
    ]);
    doExport({
      title:        `${course} — ${sessionLabel}`,
      sessionLabel: `${sessionLabel} · ${course}`,
      columns:      cols,
      rows,
      filename:     `classement_${course.replace(/\s+/g,"_")}_${sessionLabel}.pdf`,
    });
  }

  return (
    <div>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:12, marginBottom:20,
        background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 20px",
      }}>
        <div>
          <div style={{ color:C.soft, fontSize:"0.65rem", letterSpacing:"0.12em", marginBottom:4 }}>MEILLEUR TEMPS</div>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:timeFs, color:C.gold, fontWeight:700 }}>
            {best?.temps ?? "--:--.---"}
          </div>
          <div style={{ color:C.soft, fontSize:"0.8rem", marginTop:2 }}>{best?.pilote}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:C.soft, fontSize:"0.65rem", letterSpacing:"0.12em", marginBottom:4 }}>PILOTES</div>
            <div style={{ fontSize:timeFs, fontWeight:700 }}>{ranking.length}</div>
          </div>
          {!display && (
            <button onClick={handleExport} disabled={exporting} style={{
              background: exporting ? C.card : C.accentDim,
              border:`1px solid ${C.accent}`, color: exporting ? C.soft : "#fff",
              padding:"8px 14px", borderRadius:7, cursor: exporting ? "wait" : "pointer",
              fontSize:"0.8rem", fontWeight:600, display:"flex", alignItems:"center", gap:6,
            }}>
              {exporting ? "⏳ Export…" : "📄 PDF"}
            </button>
          )}
        </div>
      </div>
      <CourseTable ranking={ranking} isRace={isRace} myPilot={myPilot} display={display} />
    </div>
  );
}

function SessionView({ sessionData, isRace, myPilot, display, sessionLabel }) {
  const [activeTab, setActiveTab] = useState("global");
  const [sub, setSub]             = useState("cumul");
  const courses = useMemo(() => [...new Set(sessionData.map(d => d.course))], [sessionData]);
  const pilots  = useMemo(() => [...new Set(sessionData.map(d => d.pilote))], [sessionData]);
  const cumul   = useMemo(() => cumulativeRanking(sessionData, pilots, courses), [sessionData,pilots,courses]);
  const pts     = useMemo(() => pointsRanking(sessionData, pilots, courses),     [sessionData,pilots,courses]);
  return (
    <div>
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, overflowX:"auto", marginBottom:24 }}>
        <div style={{ display:"flex" }}>
          {["global",...courses].map(tab => {
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={()=>setActiveTab(tab)} style={{
                background:"transparent", border:"none",
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                color: active ? C.text : C.soft,
                padding: display ? "12px 20px" : "10px 16px",
                cursor:"pointer", fontSize: display ? "1rem" : "0.82rem",
                fontWeight: active ? 600 : 400, whiteSpace:"nowrap",
              }}>
                {tab==="global" ? "🌍 Global" : tab}
              </button>
            );
          })}
        </div>
      </div>
      {activeTab==="global"
        ? <GlobalView sub={sub} setSub={setSub} cumul={cumul} pts={pts} courses={courses} data={sessionData} myPilot={myPilot} display={display} sessionLabel={sessionLabel} />
        : <CourseView course={activeTab} data={sessionData} isRace={isRace} myPilot={myPilot} display={display} sessionLabel={sessionLabel} />}
    </div>
  );
}

// ==================== SHEETS LOADER ====================
function SheetsLoader({ onLoad }) {
  const [url,setBusy_url]=useState(""); const [busy,setBusy]=useState(false); const [err,setErr]=useState("");
  async function load() {
    if (!url.trim()) return;
    setBusy(true); setErr("");
    try {
      const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!m) throw new Error("URL invalide — copiez l'URL depuis la barre d'adresse de Sheets");
      const csv = await fetch(`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`);
      if (!csv.ok) throw new Error("Feuille inaccessible — partagez-la en public (Lecteur)");
      const text = await csv.text();
      const [header,...lines] = text.trim().split("\n");
      const keys = header.split(",").map(k=>k.trim().replace(/"/g,"").toLowerCase());
      const rows = lines.map(l=>Object.fromEntries(l.split(",").map((v,i)=>[keys[i],v.trim().replace(/"/g,"")])))
        .filter(r=>r.pilote&&r.course&&r.temps);
      if (!rows.length) throw new Error("Aucune ligne valide — vérifiez les colonnes");
      onLoad(rows);
    } catch(e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <div style={{marginTop:12}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <input value={url} onChange={e=>setBusy_url(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…"
          style={{flex:1,minWidth:260,background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 12px",color:C.text,fontSize:"0.8rem",outline:"none"}} />
        <button onClick={load} disabled={busy} style={{background:C.accent,border:"none",color:"#fff",padding:"7px 18px",borderRadius:6,cursor:busy?"wait":"pointer",fontSize:"0.8rem",fontWeight:600}}>
          {busy?"Chargement…":"Charger"}
        </button>
      </div>
      {err && <p style={{color:C.accent,fontSize:"0.75rem",margin:"6px 0 0"}}>⚠ {err}</p>}
      <p style={{color:C.soft,fontSize:"0.7rem",margin:"8px 0 0"}}>
        Colonnes : <code style={{color:C.text}}>pilote, numero, ecurie, course, temps, date, type, position</code> · Courses : <code style={{color:C.text}}>pos_depart</code>
      </p>
    </div>
  );
}

// ==================== SPINNER ====================
function Spinner() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"60px 0",gap:16}}>
      <div style={{width:40,height:40,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
      <span style={{color:C.soft,fontSize:"0.8rem"}}>Chargement des données…</span>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

// ==================== CONVERTISSEUR ====================
function Converter({ onClose }) {
  const [mmss,setMmss]=useState(""); const [sss,setSss]=useState(""); const [err,setErr]=useState("");
  function toTotalMs(str) {
    const m=str.trim().match(/^(\d{1,2}):(\d{2})\.(\d{1,3})$/);
    if (!m) return null;
    const [,mm,ss,dec]=m;
    return parseInt(mm)*60000+parseInt(ss)*1000+parseInt(dec.padEnd(3,"0"));
  }
  function fromTotalMs(ms) {
    const mm=Math.floor(ms/60000),ss=Math.floor((ms%60000)/1000),dec=ms%1000;
    return { mmss:`${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}.${String(dec).padStart(3,"0")}`, sss:`${Math.floor(ms/1000)}.${String(dec).padStart(3,"0")}` };
  }
  function handleMmss(val) {
    setMmss(val); setErr("");
    const ms=toTotalMs(val);
    if (ms!==null) setSss(fromTotalMs(ms).sss);
    else if (val&&!val.match(/^[\d:\.]*$/)) setErr("Format attendu : mm:ss.cc");
    else setSss("");
  }
  function handleSss(val) {
    setSss(val); setErr("");
    const m=val.trim().match(/^(\d+)\.(\d{1,3})$/);
    if (m) { const [,s,dec]=m; const ms=parseInt(s)*1000+parseInt(dec.padEnd(3,"0")); setMmss(fromTotalMs(ms).mmss); }
    else if (val&&!val.match(/^[\d\.]*$/)) setErr("Format attendu : sss.cc");
    else setMmss("");
  }
  const inputStyle = { width:"100%", boxSizing:"border-box", background:"#09090E", border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 14px", color:C.gold, fontFamily:"'Courier New',monospace", fontSize:"1.2rem", fontWeight:700, outline:"none", letterSpacing:"0.05em" };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"28px 32px",width:340,boxShadow:"0 8px 40px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{color:C.soft,fontSize:"0.65rem",letterSpacing:"0.15em",fontWeight:700,marginBottom:4}}>OUTIL</div>
            <h2 style={{margin:0,fontFamily:"'Rajdhani',sans-serif",fontSize:"1.3rem",fontWeight:700,color:"#FFF"}}>⏱ Convertisseur</h2>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.soft,width:32,height:32,borderRadius:6,cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{color:C.soft,fontSize:"0.72rem",letterSpacing:"0.1em",fontWeight:700,display:"block",marginBottom:6}}>FORMAT mm:ss.cc</label>
          <input value={mmss} onChange={e=>handleMmss(e.target.value)} placeholder="01:23.456" style={inputStyle} />
        </div>
        <div style={{textAlign:"center",color:C.soft,fontSize:"1.2rem",marginBottom:16}}>⇅</div>
        <div style={{marginBottom:20}}>
          <label style={{color:C.soft,fontSize:"0.72rem",letterSpacing:"0.1em",fontWeight:700,display:"block",marginBottom:6}}>FORMAT sss.cc</label>
          <input value={sss} onChange={e=>handleSss(e.target.value)} placeholder="83.456" style={inputStyle} />
        </div>
        {err && <p style={{color:C.accent,fontSize:"0.75rem",margin:"0 0 12px",textAlign:"center"}}>⚠ {err}</p>}
        <p style={{color:C.soft,fontSize:"0.7rem",margin:0,textAlign:"center"}}>Exemple : 01:23.456 ↔ 83.456</p>
      </div>
    </div>
  );
}

// ==================== MON PILOTE MODAL ====================
function PilotModal({ current, onSave, onClose }) {
  const [val, setVal] = useState(current || "");
  function save() { onSave(val.trim()); onClose(); }
  function clear() { onSave(""); onClose(); }
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"28px 32px",width:320,boxShadow:"0 8px 40px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{color:C.soft,fontSize:"0.65rem",letterSpacing:"0.15em",fontWeight:700,marginBottom:4}}>SURBRILLANCE</div>
            <h2 style={{margin:0,fontFamily:"'Rajdhani',sans-serif",fontSize:"1.3rem",fontWeight:700,color:"#FFF"}}>👤 Mon pilote</h2>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.soft,width:32,height:32,borderRadius:6,cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <p style={{color:C.soft,fontSize:"0.8rem",margin:"0 0 16px"}}>Ton pseudo sera mis en évidence dans tous les tableaux.</p>
        <input
          value={val} onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&save()}
          placeholder="Ton pseudo exact..."
          autoFocus
          style={{width:"100%",boxSizing:"border-box",background:"#09090E",border:`1px solid ${C.accent}`,borderRadius:6,padding:"10px 14px",color:C.text,fontSize:"1rem",outline:"none",marginBottom:16}}
        />
        <div style={{display:"flex",gap:8}}>
          <button onClick={save} style={{flex:1,background:C.accent,border:"none",color:"#fff",padding:"9px",borderRadius:6,cursor:"pointer",fontSize:"0.9rem",fontWeight:600}}>
            Confirmer
          </button>
          <button onClick={clear} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.soft,padding:"9px 14px",borderRadius:6,cursor:"pointer",fontSize:"0.85rem"}}>
            Effacer
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== LANDING PAGE ====================
function LandingPage({ champion, onEnter }) {
  return (
    <div style={{
      position:"fixed", inset:0,
      background:C.bg,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      fontFamily:"'Inter',system-ui,sans-serif",
      color:C.text, overflow:"hidden",
    }}>
      <style>{`
        @keyframes drawLine {
          from { width: 0; opacity: 0; }
          to   { width: 80px; opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .land-logo  { animation: fadeUp 0.45s ease-out 0s both; }
        .land-title { animation: fadeUp 0.45s ease-out 0.12s both; }
        .land-line  { animation: drawLine 0.5s ease-out 0.35s both; }
        .land-champ { animation: fadeUp 0.45s ease-out 0.28s both; }
        .land-btns  { animation: fadeUp 0.45s ease-out 0.42s both; }
        .land-enter:hover  { opacity: 0.82 !important; }
        .land-discord:hover { border-color: #5865F2 !important; color: #5865F2 !important; }
      `}</style>

      {/* Kerb stripes — signature motorsport */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:`repeating-linear-gradient(
          -20deg,
          transparent, transparent 18px,
          rgba(196,18,48,0.045) 18px, rgba(196,18,48,0.045) 20px
        )`,
      }} />

      {/* Liseré rouge haut */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg, transparent 0%, ${C.accent} 25%, ${C.accent} 75%, transparent 100%)`,
      }} />

      {/* Contenu centré */}
      <div style={{
        position:"relative", zIndex:1,
        display:"flex", flexDirection:"column",
        alignItems:"center",
        padding:"32px 24px",
        maxWidth:420, width:"100%",
        textAlign:"center",
      }}>

        {/* Logo */}
        <div className="land-logo" style={{ marginBottom:28 }}>
          <img src={LOGO} alt="logo" style={{
            width:88, height:88, borderRadius:"50%",
            objectFit:"cover",
            border:`2px solid ${C.border}`,
            boxShadow:`0 0 52px ${C.accent}3A, 0 0 18px ${C.accent}1A`,
          }} />
        </div>

        {/* Nom du championnat */}
        <div className="land-title" style={{ marginBottom:28 }}>
          <div style={{
            fontSize:"0.6rem", letterSpacing:"0.28em",
            color:C.soft, fontWeight:700,
            textTransform:"uppercase", marginBottom:10,
          }}>
            {CHAMPIONSHIP_SEASON}
          </div>
          <h1 style={{
            margin:"0 0 14px",
            fontFamily:"'Rajdhani', sans-serif",
            fontSize:"clamp(2rem, 9vw, 3rem)",
            fontWeight:700, letterSpacing:"0.04em",
            color:C.text, lineHeight:1.0,
          }}>
            {CHAMPIONSHIP_NAME}
          </h1>
          {/* Ligne chronométrage animée */}
          <div className="land-line" style={{
            height:2, background:C.accent,
            margin:"0 auto", display:"block", borderRadius:1,
          }} />
        </div>

        {/* Champion en titre */}
        {champion && (
          <div className="land-champ" style={{
            background:`linear-gradient(135deg, ${C.card} 0%, #17100A 100%)`,
            border:`1px solid ${C.gold}50`,
            borderRadius:10,
            padding:"14px 28px",
            width:"100%", boxSizing:"border-box",
            marginBottom:28,
          }}>
            <div style={{
              color:C.gold, fontSize:"0.58rem",
              letterSpacing:"0.22em", fontWeight:700,
              marginBottom:5, textTransform:"uppercase",
            }}>🏆 Champion en titre</div>
            <div style={{
              fontFamily:"'Rajdhani', sans-serif",
              fontSize:"1.8rem", fontWeight:700,
              color:C.gold, letterSpacing:"0.02em",
            }}>
              {champion}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="land-btns" style={{
          display:"flex", flexDirection:"column",
          gap:10, width:"100%",
        }}>
          <button className="land-enter" onClick={onEnter} style={{
            background:C.accent, border:"none",
            color:"#fff", padding:"13px",
            borderRadius:7, cursor:"pointer",
            fontSize:"0.88rem", fontWeight:700,
            letterSpacing:"0.12em",
            fontFamily:"'Rajdhani', sans-serif",
            textTransform:"uppercase",
            transition:"opacity 0.15s",
          }}>
            Entrer dans le classement ›
          </button>

          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
             className="land-discord"
             style={{
               display:"block", background:"transparent",
               border:`1px solid ${C.border}`, color:C.soft,
               padding:"11px", borderRadius:7,
               textDecoration:"none", fontSize:"0.82rem",
               fontWeight:500, letterSpacing:"0.04em",
               transition:"border-color 0.15s, color 0.15s",
             }}>
            💬 Rejoindre le Discord
          </a>
        </div>
      </div>

      {/* URL bas de page */}
      <div style={{
        position:"absolute", bottom:18,
        color:`${C.soft}70`, fontSize:"0.6rem",
        letterSpacing:"0.15em",
      }}>
        classement-ten.vercel.app
      </div>
    </div>
  );
}

// ==================== APP ====================
export default function App() {
  const [data,          setData]         = useState(MOCK_DATA);
  const [page,          setPage]         = useState("home");
  const [activeSession, setActiveSession] = useState("essais");
  const [showSheet,     setShowSheet]    = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showPilotModal,setShowPilotModal]= useState(false);
  const [displayMode,   setDisplayMode]  = useState(false);
  const [loading,       setLoading]      = useState(true);
  const [lastUpdate,    setLastUpdate]   = useState(null);
  const [timeAgoStr,    setTimeAgoStr]   = useState("");
  const [autoErr,       setAutoErr]      = useState("");
  const [myPilot,       setMyPilot]      = useState(() => {
    try { return localStorage.getItem("leaderboard_myPilot") || ""; } catch { return ""; }
  });
  const isMock = data === MOCK_DATA;

  function savePilot(name) {
    setMyPilot(name);
    try { if (name) localStorage.setItem("leaderboard_myPilot", name); else localStorage.removeItem("leaderboard_myPilot"); } catch {}
  }

  function toggleDisplay() {
    const next = !displayMode;
    setDisplayMode(next);
    try { if (next) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); } catch {}
  }

  useEffect(() => {
    const CACHE_KEY = "leaderboard_gt3_cache";
    const CACHE_DURATION = 5 * 60 * 1000;
    async function load() {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const { rows, ts } = JSON.parse(raw);
          if (Date.now() - ts < CACHE_DURATION && rows?.length) {
            const d = new Date(ts);
            setData(rows); setLastUpdate(d); setTimeAgoStr(computeTimeAgo(d));
            setLoading(false); setAutoErr("");
            fetchSheetData().then(fresh => {
              if (JSON.stringify(fresh) !== JSON.stringify(rows)) {
                const now = new Date();
                setData(fresh); setLastUpdate(now); setTimeAgoStr(computeTimeAgo(now));
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rows: fresh, ts: now.getTime() }));
              }
            }).catch(()=>{});
            return;
          }
        }
      } catch {}
      try {
        const rows = await fetchSheetData(); const now = new Date();
        setData(rows); setLastUpdate(now); setTimeAgoStr(computeTimeAgo(now)); setAutoErr("");
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rows, ts: now.getTime() }));
      } catch(e) { setAutoErr(e.message); } finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (!lastUpdate) return;
    const id = setInterval(()=>setTimeAgoStr(computeTimeAgo(lastUpdate)), 30000);
    return ()=>clearInterval(id);
  }, [lastUpdate]);

  useEffect(() => {
    const CACHE_KEY = "leaderboard_gt3_cache";
    const id = setInterval(async () => {
      if (document.hidden) return;
      try {
        const fresh = await fetchSheetData();
        setData(prev => {
          if (JSON.stringify(fresh)!==JSON.stringify(prev)) {
            const now=new Date(); setLastUpdate(now); setTimeAgoStr(computeTimeAgo(now));
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rows:fresh, ts:now.getTime() }));
            return fresh;
          }
          return prev;
        });
      } catch {}
    }, 60000);
    return ()=>clearInterval(id);
  }, []);

  useEffect(() => {
    const link=document.createElement("link"); link.rel="stylesheet";
    link.href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const sessionData = useMemo(()=>data.filter(d=>!d.type||d.type===activeSession),[data,activeSession]);
  const champion = useMemo(()=>{
    if (CURRENT_CHAMPION) return CURRENT_CHAMPION;
    // Auto-détection : priorité aux courses, sinon toutes sessions
    const cd = data.filter(d=>d.type==="course");
    const src = cd.length ? cd : data;
    if (!src.length) return null;
    const courses=[...new Set(src.map(d=>d.course))], pilots=[...new Set(src.map(d=>d.pilote))];
    return cumulativeRanking(src,pilots,courses)[0]?.pilote ?? null;
  }, [data]);

  // ── Page d'accueil ──────────────────────────────────────────────────────
  if (page === "home") return <LandingPage champion={champion} onEnter={() => setPage("leaderboard")} />;

  // ── Mode affichage plein écran ───────────────────────────────────────────
  if (displayMode) return (
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:500,overflowY:"auto",fontFamily:"'Inter',system-ui,sans-serif",color:C.text}}>
      {/* Mini header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 24px",borderBottom:`1px solid ${C.border}`,background:"#0D0D14"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src={LOGO} alt="logo" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}} />
          <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.4rem",fontWeight:700,color:"#FFF"}}>Leaderboard</span>
          {champion && <span style={{color:C.gold,fontSize:"0.85rem",fontWeight:600}}>🏆 {champion}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* Session tabs inline */}
          {SESSIONS.map(s=>{
            const active=activeSession===s.key;
            return <button key={s.key} onClick={()=>setActiveSession(s.key)} style={{background:active?C.accent:"transparent",border:`1px solid ${active?C.accent:C.border}`,color:active?"#fff":C.soft,padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:"0.85rem",fontWeight:active?700:400}}>{s.label}</button>;
          })}
          <button onClick={toggleDisplay} style={{background:C.accentDim,border:`1px solid ${C.accent}`,color:"#fff",padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:"0.85rem",fontWeight:600,marginLeft:8}}>
            ✕ Quitter
          </button>
        </div>
      </div>
      {/* Content display */}
      <div style={{padding:"20px 24px"}}>
        {loading ? <Spinner /> : <SessionView key={activeSession} sessionData={sessionData} isRace={activeSession==="course"} myPilot={myPilot} display={true} sessionLabel={SESSIONS.find(s=>s.key===activeSession)?.label||activeSession} />}
      </div>
    </div>
  );

  // ── Vue normale ──────────────────────────────────────────────────────────
  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:C.text}}>
      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#0E0E16 0%,#110610 100%)",borderBottom:`1px solid ${C.border}`,padding:"22px 20px 18px"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{color:"#FFF",fontSize:"0.65rem",fontWeight:700,letterSpacing:"0.18em",marginBottom:5}}>CLASSEMENT OFFICIEL</div>
              <h1 style={{margin:0,fontFamily:"'Rajdhani',sans-serif",fontSize:"2rem",fontWeight:700,letterSpacing:"0.03em",lineHeight:1,color:"#FFF"}}>
                <span style={{display:"flex",alignItems:"center",gap:10}}>
                  <img src={LOGO} alt="logo" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover"}} />
                  Leaderboard
                </span>
              </h1>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              {champion && (
                <div style={{background:`linear-gradient(135deg,${C.accentDim}55,#1a100222)`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:"8px 18px",textAlign:"center"}}>
                  <div style={{color:C.gold,fontSize:"0.62rem",letterSpacing:"0.15em",fontWeight:700,marginBottom:3}}>🏆 CHAMPION</div>
                  <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.4rem",fontWeight:700,color:C.gold}}>{champion}</div>
                </div>
              )}
              <HeaderBtn onClick={()=>setShowPilotModal(true)}>
                👤 {myPilot || "Mon pilote"}
              </HeaderBtn>
              <HeaderBtn onClick={()=>setShowConverter(true)}>⏱ Convertisseur</HeaderBtn>
              <HeaderBtn onClick={toggleDisplay}>🖥️ Affichage</HeaderBtn>
            </div>
          </div>
          <div style={{marginTop:14}}>
            <button onClick={()=>setShowSheet(v=>!v)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.soft,padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:6}}>
              📊 {isMock?"Connecter Google Sheets":"Changer de feuille"}
            </button>
            {showSheet && <SheetsLoader onLoad={rows=>{setData(rows);setShowSheet(false);setActiveSession("essais");}} />}
          </div>
          {autoErr && <p style={{color:C.accent,fontSize:"0.7rem",margin:"8px 0 0"}}>⚠ {autoErr}</p>}
          {isMock && !autoErr && <p style={{color:C.soft,fontSize:"0.7rem",margin:"8px 0 0"}}>Chargement des données…</p>}
        </div>
      </div>

      {/* SESSION TABS */}
      <div style={{background:"#0D0D14",borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex"}}>
          {SESSIONS.map(s=>{
            const active=activeSession===s.key;
            return <button key={s.key} onClick={()=>setActiveSession(s.key)} style={{background:"transparent",border:"none",borderBottom:active?`2px solid ${C.accent}`:"2px solid transparent",color:active?C.text:C.soft,padding:"13px 22px",cursor:"pointer",fontSize:"0.9rem",fontWeight:active?700:400,whiteSpace:"nowrap"}}>{s.label}</button>;
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 16px"}}>
        {loading ? <Spinner /> : <SessionView key={activeSession} sessionData={sessionData} isRace={activeSession==="course"} myPilot={myPilot} display={false} sessionLabel={SESSIONS.find(s=>s.key===activeSession)?.label||activeSession} />}
      </div>

      {showConverter   && <Converter  onClose={()=>setShowConverter(false)} />}
      {showPilotModal  && <PilotModal current={myPilot} onSave={savePilot} onClose={()=>setShowPilotModal(false)} />}

      {/* FOOTER */}
      <div style={{textAlign:"center",padding:"14px",color:C.soft,fontSize:"0.7rem",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"center",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        {isMock ? <span>Mode démonstration</span> : <span>{data.length} entrées · {[...new Set(data.map(d=>d.pilote))].length} pilotes</span>}
        {lastUpdate && !isMock && <span style={{color:C.border,fontSize:"0.65rem"}}>|</span>}
        {lastUpdate && !isMock && <span title={lastUpdate.toLocaleString("fr-FR")}>🕐 Mis à jour à {lastUpdate.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})} · {timeAgoStr}</span>}
      </div>
    </div>
  );
}
