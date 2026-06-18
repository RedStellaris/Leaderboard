import { useState, useMemo, useEffect } from "react";

// ==================== MOCK DATA ====================
const MOCK_DATA = [
  { pilote: "Leclerc",    course: "Circuit de l'Aube",  temps: "01:23.456", date: "2026-05-10" },
  { pilote: "Verstappen", course: "Circuit de l'Aube",  temps: "01:21.789", date: "2026-05-10" },
  { pilote: "Hamilton",   course: "Circuit de l'Aube",  temps: "01:24.201", date: "2026-05-10" },
  { pilote: "Norris",     course: "Circuit de l'Aube",  temps: "01:22.934", date: "2026-05-10" },
  { pilote: "Sainz",      course: "Circuit de l'Aube",  temps: "01:25.678", date: "2026-05-10" },
  { pilote: "Leclerc",    course: "Baie du Dragon",     temps: "02:10.123", date: "2026-05-17" },
  { pilote: "Verstappen", course: "Baie du Dragon",     temps: "02:08.456", date: "2026-05-17" },
  { pilote: "Hamilton",   course: "Baie du Dragon",     temps: "02:09.789", date: "2026-05-17" },
  { pilote: "Norris",     course: "Baie du Dragon",     temps: "02:11.234", date: "2026-05-17" },
  { pilote: "Sainz",      course: "Baie du Dragon",     temps: "02:12.567", date: "2026-05-17" },
  { pilote: "Leclerc",    course: "Tunnel Alpin",       temps: "01:45.321", date: "2026-05-24" },
  { pilote: "Verstappen", course: "Tunnel Alpin",       temps: "01:46.987", date: "2026-05-24" },
  { pilote: "Hamilton",   course: "Tunnel Alpin",       temps: "01:44.567", date: "2026-05-24" },
  { pilote: "Norris",     course: "Tunnel Alpin",       temps: "01:47.234", date: "2026-05-24" },
  { pilote: "Sainz",      course: "Tunnel Alpin",       temps: "01:43.891", date: "2026-05-24" },
];

// ==================== CONSTANTS ====================
const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const C = {
  bg:        "#09090E",
  card:      "#111118",
  row:       "#13131C",
  rowAlt:    "#181826",
  accent:    "#C41230",
  accentDim: "#6B0A1A",
  gold:      "#F5A623",
  text:      "#EEEEF5",
  soft:      "#6A6A80",
  border:    "#222230",
};

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
  const min  = Math.floor(ms / 60000);
  const sec  = Math.floor((ms % 60000) / 1000);
  const mil  = ms % 1000;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}.${String(mil).padStart(3,"0")}`;
}

function formatDelta(ms) {
  if (ms === 0) return "LEADER";
  const s   = Math.floor(ms / 1000);
  const mil = ms % 1000;
  return `+${s}.${String(mil).padStart(3,"0")}`;
}

// ==================== COMPUTE ====================
function courseRanking(data, course) {
  const rows   = data.filter(d => d.course === course);
  const sorted = [...rows].sort((a, b) => parseTime(a.temps) - parseTime(b.temps));
  const best   = parseTime(sorted[0]?.temps);
  return sorted.map((r, i) => ({
    ...r, rank: i + 1,
    ms:     parseTime(r.temps),
    delta:  parseTime(r.temps) - best,
    points: F1_POINTS[i] ?? 0,
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
  const pts     = Object.fromEntries(pilots.map(p => [p, 0]));
  const details = Object.fromEntries(pilots.map(p => [p, {}]));
  courses.forEach(course => {
    courseRanking(data, course).forEach(r => {
      if (pts[r.pilote] !== undefined) {
        pts[r.pilote]          += r.points;
        details[r.pilote][course] = { rank: r.rank, pts: r.points };
      }
    });
  });
  return pilots
    .map(p => ({ pilote: p, points: pts[p], detail: details[p] }))
    .sort((a, b) => b.points - a.points);
}

// ==================== UI ATOMS ====================
const medal = ["🥇","🥈","🥉"];

function Rank({ n }) {
  if (n <= 3) return <span style={{ fontSize:"1rem" }}>{medal[n-1]}</span>;
  return <span style={{ color: C.soft, fontSize:"0.82rem", fontWeight:600 }}>P{n}</span>;
}

function Th({ children, right }) {
  return (
    <th style={{
      padding:"9px 14px", textAlign: right ? "right" : "left",
      fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em",
      color: C.soft, textTransform:"uppercase",
      background: C.card, borderBottom:`1px solid ${C.border}`,
    }}>{children}</th>
  );
}

function Td({ children, right, center, mono, bold, dim, gold, accent }) {
  return (
    <td style={{
      padding:"11px 14px",
      textAlign: center ? "center" : right ? "right" : "left",
      fontFamily: mono ? "'Courier New', monospace" : "inherit",
      fontWeight: bold ? 600 : 400,
      fontSize:"0.875rem",
      color: gold ? C.gold : dim ? C.soft : accent ? C.accent : C.text,
      borderBottom:`1px solid ${C.border}22`,
    }}>{children}</td>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.accent : "transparent",
      border: `1px solid ${active ? C.accent : C.border}`,
      color: active ? "#fff" : C.soft,
      padding:"6px 18px", borderRadius:20,
      cursor:"pointer", fontSize:"0.8rem", fontWeight: active ? 600 : 400,
      transition:"all 0.15s",
    }}>{children}</button>
  );
}

// ==================== TABLES ====================
function CourseTable({ ranking }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th>Pos</Th><Th>Pilote</Th>
          <Th right>Temps</Th><Th right>Écart</Th><Th right>Pts</Th>
        </tr></thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr key={r.pilote} style={{ background: i%2===0 ? C.row : C.rowAlt }}>
              <Td center><Rank n={r.rank} /></Td>
              <Td bold gold={i===0}>{r.pilote}</Td>
              <Td right mono gold={i===0}>{r.temps}</Td>
              <Td right mono dim>{r.delta === 0 ? "–" : formatDelta(r.delta)}</Td>
              <Td right bold accent={r.points>0}>{r.points > 0 ? r.points : "–"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CumulTable({ ranking }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th>Pos</Th><Th>Pilote</Th>
          <Th right>Temps total</Th><Th right>Moy / course</Th><Th right>Courses</Th>
        </tr></thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr key={r.pilote} style={{ background: i%2===0 ? C.row : C.rowAlt }}>
              <Td center><Rank n={i+1} /></Td>
              <Td bold gold={i===0}>{r.pilote}{i===0 ? " 👑" : ""}</Td>
              <Td right mono gold={i===0}>{formatTime(r.totalMs)}</Td>
              <Td right mono dim>{formatTime(Math.round(r.avgMs))}</Td>
              <Td right dim>{r.done}/{r.of}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"10px 0 0" }}>
        * Pilotes ayant complété toutes les courses classés en priorité
      </p>
    </div>
  );
}

function PtsTable({ ranking, courses }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th>Pos</Th><Th>Pilote</Th><Th right>Points</Th>
          {courses.map(c => <Th key={c} right><span style={{fontSize:"0.65rem"}}>{c}</span></Th>)}
        </tr></thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr key={r.pilote} style={{ background: i%2===0 ? C.row : C.rowAlt }}>
              <Td center><Rank n={i+1} /></Td>
              <Td bold gold={i===0}>{r.pilote}{i===0 ? " 👑" : ""}</Td>
              <Td right bold gold={i===0}>{r.points} pts</Td>
              {courses.map(c => {
                const d = r.detail[c];
                return (
                  <Td key={c} right dim>
                    {d
                      ? <span style={{ color: d.rank<=3 ? C.gold : C.soft }}>{d.pts}</span>
                      : <span style={{ color:"#2a2a3a" }}>–</span>}
                  </Td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"10px 0 0" }}>
        Barème F1 : 25 – 18 – 15 – 12 – 10 – 8 – 6 – 4 – 2 – 1 pts
      </p>
    </div>
  );
}

// ==================== VIEWS ====================
function GlobalView({ sub, setSub, cumul, pts, courses }) {
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <Pill active={sub==="cumul"} onClick={()=>setSub("cumul")}>⏱ Temps cumulé</Pill>
        <Pill active={sub==="pts"}   onClick={()=>setSub("pts")}>🏆 Points</Pill>
      </div>
      {sub==="cumul"
        ? <CumulTable ranking={cumul} />
        : <PtsTable   ranking={pts}   courses={courses} />}
    </div>
  );
}

function CourseView({ course, data }) {
  const ranking = useMemo(() => courseRanking(data, course), [data, course]);
  const best    = ranking[0];
  return (
    <div>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:12, marginBottom:20,
        background: C.card, border:`1px solid ${C.border}`,
        borderRadius:10, padding:"14px 20px",
      }}>
        <div>
          <div style={{ color:C.soft, fontSize:"0.65rem", letterSpacing:"0.12em", marginBottom:4 }}>
            MEILLEUR TEMPS
          </div>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"1.6rem", color:C.gold, fontWeight:700 }}>
            {best?.temps ?? "--:--.---"}
          </div>
          <div style={{ color:C.soft, fontSize:"0.8rem", marginTop:2 }}>{best?.pilote}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:C.soft, fontSize:"0.65rem", letterSpacing:"0.12em", marginBottom:4 }}>PILOTES</div>
          <div style={{ fontSize:"1.6rem", fontWeight:700 }}>{ranking.length}</div>
        </div>
      </div>
      <CourseTable ranking={ranking} />
    </div>
  );
}

// ==================== SHEETS LOADER ====================
function SheetsLoader({ onLoad }) {
  const [url,  setUrl]  = useState("");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  async function load() {
    if (!url.trim()) return;
    setBusy(true); setErr("");
    try {
      const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!m) throw new Error("URL invalide — copiez l'URL depuis la barre d'adresse de Sheets");
      const csv = await fetch(
        `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`
      );
      if (!csv.ok) throw new Error("Feuille inaccessible — vérifiez qu'elle est partagée en public (Lecteur)");
      const text = await csv.text();
      const [header, ...lines] = text.trim().split("\n");
      const keys = header.split(",").map(k => k.trim().replace(/"/g,"").toLowerCase());
      const rows = lines
        .map(l => Object.fromEntries(
          l.split(",").map((v,i) => [keys[i], v.trim().replace(/"/g,"")])
        ))
        .filter(r => r.pilote && r.course && r.temps);
      if (!rows.length) throw new Error("Aucune ligne valide — vérifiez les colonnes : pilote, course, temps, date");
      onLoad(rows);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop:12 }}>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <input
          value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/…"
          style={{
            flex:1, minWidth:260, background:C.card,
            border:`1px solid ${C.border}`, borderRadius:6,
            padding:"7px 12px", color:C.text, fontSize:"0.8rem", outline:"none",
          }}
        />
        <button onClick={load} disabled={busy} style={{
          background: C.accent, border:"none", color:"#fff",
          padding:"7px 18px", borderRadius:6, cursor: busy ? "wait" : "pointer",
          fontSize:"0.8rem", fontWeight:600,
        }}>
          {busy ? "Chargement…" : "Charger"}
        </button>
      </div>
      {err && <p style={{ color:C.accent, fontSize:"0.75rem", margin:"6px 0 0" }}>⚠ {err}</p>}
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"8px 0 0" }}>
        Structure requise dans Sheets : colonnes <code style={{color:C.text}}>pilote</code>, <code style={{color:C.text}}>course</code>, <code style={{color:C.text}}>temps</code>, <code style={{color:C.text}}>date</code>
      </p>
    </div>
  );
}

// ==================== APP ====================
export default function App() {
  const [data,      setData]      = useState(MOCK_DATA);
  const [activeTab, setActiveTab] = useState("global");
  const [sub,       setSub]       = useState("cumul");
  const [showSheet, setShowSheet] = useState(false);
  const isMock = data === MOCK_DATA;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel   = "stylesheet";
    link.href  = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const courses = useMemo(() => [...new Set(data.map(d => d.course))], [data]);
  const pilots  = useMemo(() => [...new Set(data.map(d => d.pilote))], [data]);
  const cumul   = useMemo(() => cumulativeRanking(data, pilots, courses), [data, pilots, courses]);
  const pts     = useMemo(() => pointsRanking(data, pilots, courses),     [data, pilots, courses]);
  const champion = cumul[0]?.pilote;

  const tabs = ["global", ...courses];

  function handleLoad(rows) {
    setData(rows);
    setShowSheet(false);
    setActiveTab("global");
  }

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Inter',system-ui,sans-serif", color:C.text }}>

      {/* ── HEADER ── */}
      <div style={{
        background:`linear-gradient(160deg, #0E0E16 0%, #110610 100%)`,
        borderBottom:`1px solid ${C.border}`,
        padding:"22px 20px 18px",
      }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ color:C.accentDim, fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.18em", marginBottom:5 }}>
                CLASSEMENT OFFICIEL
              </div>
              <h1 style={{
                margin:0, fontFamily:"'Rajdhani',sans-serif",
                fontSize:"2rem", fontWeight:700, letterSpacing:"0.03em", lineHeight:1,
              }}>
                🏁 Leaderboard
              </h1>
            </div>

            {champion && (
              <div style={{
                background:`linear-gradient(135deg, ${C.accentDim}55, #1a100222)`,
                border:`1px solid ${C.gold}33`,
                borderRadius:8, padding:"8px 18px", textAlign:"center",
              }}>
                <div style={{ color:C.gold, fontSize:"0.62rem", letterSpacing:"0.15em", fontWeight:700, marginBottom:3 }}>
                  🏆 CHAMPION
                </div>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"1.4rem", fontWeight:700, color:C.gold }}>
                  {champion}
                </div>
              </div>
            )}
          </div>

          {/* Sheets toggle */}
          <div style={{ marginTop:14 }}>
            <button onClick={() => setShowSheet(v => !v)} style={{
              background:"transparent", border:`1px solid ${C.border}`,
              color:C.soft, padding:"5px 12px", borderRadius:6,
              cursor:"pointer", fontSize:"0.75rem", display:"flex", alignItems:"center", gap:6,
            }}>
              📊 {isMock ? "Connecter Google Sheets" : "Changer de feuille"}
            </button>
            {showSheet && <SheetsLoader onLoad={handleLoad} />}
          </div>

          {isMock && (
            <p style={{ color:C.accentDim, fontSize:"0.7rem", margin:"8px 0 0" }}>
              ⚠ Données de démonstration — connectez votre Google Sheets pour charger les vraies données
            </p>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex" }}>
          {tabs.map(tab => {
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background:"transparent", border:"none",
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                color: active ? C.text : C.soft,
                padding:"12px 18px", cursor:"pointer",
                fontSize:"0.85rem", fontWeight: active ? 600 : 400,
                whiteSpace:"nowrap", transition:"color 0.15s",
              }}>
                {tab === "global" ? "🌍 Global" : tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px" }}>
        {activeTab === "global"
          ? <GlobalView sub={sub} setSub={setSub} cumul={cumul} pts={pts} courses={courses} />
          : <CourseView course={activeTab} data={data} />
        }
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        textAlign:"center", padding:"14px", color:C.soft,
        fontSize:"0.7rem", borderTop:`1px solid ${C.border}`,
      }}>
        {isMock
          ? "Mode démonstration"
          : `${data.length} temps · ${courses.length} courses · ${pilots.length} pilotes`}
      </div>
    </div>
  );
}
