import { useState, useMemo, useEffect } from "react";
import { MOCK_DATA, SESSIONS, C, LOGO, CURRENT_CHAMPION, DISCORD_URL, F1_POINTS } from "./config.js";
import { fetchSheetData, fetchSheetConfig } from "./utils/sheetsFetch.js";
import { computeTimeAgo, parseTime, formatTime, formatDuration } from "./utils/timeUtils.js";
import { cumulativeRanking, pointsRanking } from "./logic/ranking.js";
import { Spinner }     from "./components/atoms/Spinner.jsx";
import { HeaderBtn }   from "./components/atoms/Pill.jsx";
import { SessionView } from "./components/views/SessionView.jsx";
import { QuizPage }    from "./components/views/QuizPage.jsx";
import { LandingPage }      from "./components/views/LandingPage.jsx";
import { PredictionPanel } from "./components/views/PredictionPanel.jsx";
import { CircuitRating }  from "./components/views/CircuitRating.jsx";
import { PilotModal }  from "./components/modals/PilotModal.jsx";
import { SheetsLoader }    from "./components/modals/SheetsLoader.jsx";
import { PilotProfileModal } from "./components/modals/PilotProfileModal.jsx";
import { AdminDashboard }  from "./components/views/AdminDashboard.jsx";
import { useAuthContext }  from "./auth/AuthProvider.jsx";

// Normalise DD/MM/YYYY HH:MM:SS (format Google Sheets) → YYYY-MM-DDTHH:MM:SS
function normalizeDate(str) {
  if (!str) return "";
  // DD/MM/YYYY HH:MM:SS → ISO
  const mDMY = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2})$/);
  if (mDMY) return `${mDMY[3]}-${mDMY[2]}-${mDMY[1]}T${mDMY[4]}`;
  // YYYY-MM-DD HH:MM:SS → ISO (espace → T)
  const mYMD = str.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/);
  if (mYMD) return `${mYMD[1]}T${mYMD[2]}`;
  return str; // déjà ISO ou format inconnu
}

const CACHE_KEY      = "leaderboard_gt3_cache";
const CACHE_DURATION = 5 * 60 * 1000;

export default function App() {
  const {
    session, profile, loading: authLoading,
    isAdmin, canViewDashboard, signOut,
  } = useAuthContext();

  const [data,           setData]          = useState(MOCK_DATA);
  const [page,           setPage]          = useState(() => {
    try { return localStorage.getItem("quiz_passed") === "true" ? "home" : "quiz"; }
    catch { return "quiz"; }
  });
  const [activeSession,  setActiveSession]  = useState("essais");
  const [showSheet,      setShowSheet]      = useState(false);
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [showProfile,    setShowProfile]    = useState(false);
  const [displayMode,    setDisplayMode]    = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [lastUpdate,     setLastUpdate]     = useState(null);
  const [timeAgoStr,     setTimeAgoStr]     = useState("");
  const [countdown,      setCountdown]      = useState("");
  const [nextSessionDate, setNextSessionDate] = useState("");
  const [autoErr,        setAutoErr]        = useState("");

  const isMock  = data === MOCK_DATA;
  const myPilot = profile?.pseudo || "";

  function toggleDisplay() {
    const next = !displayMode;
    setDisplayMode(next);
    try { next ? document.documentElement.requestFullscreen?.() : document.exitFullscreen?.(); } catch {}
  }

  async function handleLogout() {
    if (!window.confirm("Se déconnecter ?")) return;
    await signOut();
  }

  // Chargement initial + cache
  useEffect(() => {
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
            }).catch(() => {});
            return;
          }
        }
      } catch {}
      try {
        const rows = await fetchSheetData(); const now = new Date();
        setData(rows); setLastUpdate(now); setTimeAgoStr(computeTimeAgo(now)); setAutoErr("");
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rows, ts: now.getTime() }));
      } catch (e) { setAutoErr(e.message); }
      finally { setLoading(false); }
    }
    // Toujours exécuté, même en cas de cache — hors de load()
    async function loadConfig() {
      try {
        const cfg = await fetchSheetConfig();
        if (cfg.next_session) setNextSessionDate(normalizeDate(cfg.next_session));
      } catch {}
    }
    load();
    loadConfig();
  }, []);

  // Mise à jour du "il y a Xmin"
  useEffect(() => {
    if (!lastUpdate) return;
    const id = setInterval(() => setTimeAgoStr(computeTimeAgo(lastUpdate)), 30000);
    return () => clearInterval(id);
  }, [lastUpdate]);

  // Polling toutes les 60s
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden) return;
      try {
        const fresh = await fetchSheetData();
        setData(prev => {
          if (JSON.stringify(fresh) !== JSON.stringify(prev)) {
            const now = new Date(); setLastUpdate(now); setTimeAgoStr(computeTimeAgo(now));
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rows: fresh, ts: now.getTime() }));
            return fresh;
          }
          return prev;
        });
      } catch {}
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Compte à rebours — lu depuis l'onglet "config" du Google Sheet
  useEffect(() => {
    if (!nextSessionDate) { setCountdown(""); return; }
    function tick() {
      const diff = new Date(nextSessionDate) - Date.now();
      if (diff <= 0) { setCountdown(""); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}j ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextSessionDate]);

  // Police Rajdhani
  useEffect(() => {
    const link = document.createElement("link"); link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const sessionData = useMemo(() => data.filter(d => !d.type || d.type === activeSession), [data, activeSession]);
  const champion    = useMemo(() => {
    if (CURRENT_CHAMPION) return CURRENT_CHAMPION;
    const cd  = data.filter(d => d.type === "course");
    const src = cd.length ? cd : data;
    if (!src.length) return null;
    const courses = [...new Set(src.map(d => d.course))];
    const pilots  = [...new Set(src.map(d => d.pilote))];
    return cumulativeRanking(src, pilots, courses)[0]?.pilote ?? null;
  }, [data]);

  const sessionLabel   = SESSIONS.find(s => s.key === activeSession)?.label || activeSession;
  const currentCircuit = useMemo(() => {
    const rows = data.filter(d => d.type === "course" && d.course);
    return rows.length ? rows[rows.length - 1].course : null;
  }, [data]);

  // Top 3 pour podium landing (courses uniquement)
  const top3 = useMemo(() => {
    const cd = data.filter(d => d.type === "course");
    if (!cd.length) return [];
    const courses = [...new Set(cd.map(d => d.course))];
    const pilots  = [...new Set(cd.map(d => d.pilote))];
    try { return (pointsRanking(cd, pilots, courses) || []).slice(0, 3); }
    catch { return []; }
  }, [data]);

  // Stats rapides pour landing
  const globalStats = useMemo(() => ({
    pilots:   new Set(data.map(d => d.pilote)).size,
    sessions: new Set(data.filter(d => d.type === "course").map(d => `${d.course}|${(d.date || "").slice(0, 10)}`)).size,
    circuits: new Set(data.map(d => d.course)).size,
  }), [data]);

  // Infos carte pilote connecté
  const pilotStats = useMemo(() => {
    if (!myPilot || isMock) return null;
    const rows = data.filter(r => r.pilote === myPilot);
    if (!rows.length) return null;
    const times   = rows.map(r => parseTime(r.temps)).filter(isFinite);
    const avgMs   = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
    const cumulMs = times.length ? times.reduce((a, b) => a + b, 0) : null;
    const ecurie  = rows.find(r => r.ecurie)?.ecurie || null;
    // formatTime (MM:SS.mmm) reste utilisé pour "avg" — un temps de tour unique
    // ne dépasse jamais 59 min, c'est son domaine de validité d'origine.
    // formatDuration (H:MM:SS.mmm au-delà de 59min) est utilisé pour "cumulated",
    // qui peut légitimement dépasser 1h pour un pilote avec beaucoup de sessions.
    return {
      ecurie,
      avg:       avgMs   ? formatTime(avgMs)       : null,
      cumulated: cumulMs ? formatDuration(cumulMs)  : null,
    };
  }, [data, myPilot, isMock]);

  // Indicateur live (dernière mise à jour < 30 min)
  const isLive = !!(lastUpdate && !isMock && Date.now() - lastUpdate.getTime() < 30 * 60 * 1000);

  // ── Quiz d'accès ────────────────────────────────────────────────────────────
  if (page === "quiz") return <QuizPage onPass={() => setPage("home")} />;

  // ── Gate authentification (obligatoire après le quiz) ───────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }
  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PilotModal onClose={() => {}} />
      </div>
    );
  }

  // ── Dashboard admin / co-organisateur ────────────────────────────────────────
  if (page === "admin" && canViewDashboard) {
    return <AdminDashboard data={data} onBack={() => setPage("leaderboard")} isAdmin={isAdmin} />;
  }
  if (page === "admin" && !canViewDashboard) {
    // Accès refusé (rôle insuffisant ou changé entre-temps) : retour silencieux au leaderboard.
    setTimeout(() => setPage("leaderboard"), 0);
    return null;
  }

  // ── Landing ─────────────────────────────────────────────────────────────────
  if (page === "home") return <LandingPage champion={champion} onEnter={() => setPage("leaderboard")} top3={top3} stats={globalStats} />;

  // ── Mode affichage ───────────────────────────────────────────────────────────
  if (displayMode) return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 500, overflowY: "auto", fontFamily: "'Inter',system-ui,sans-serif", color: C.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: "#0D0D14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={LOGO} alt="logo" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#FFF" }}>Leaderboard</span>
          {champion && <span style={{ color: C.gold, fontSize: "0.85rem", fontWeight: 600 }}>🏆 {champion}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {SESSIONS.map(s => {
            const active = activeSession === s.key;
            return <button key={s.key} onClick={() => setActiveSession(s.key)} style={{ background: active ? C.accent : "transparent", border: `1px solid ${active ? C.accent : C.border}`, color: active ? "#fff" : C.soft, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem", fontWeight: active ? 700 : 400 }}>{s.label}</button>;
          })}
          <button onClick={toggleDisplay} style={{ background: C.accentDim, border: `1px solid ${C.accent}`, color: "#fff", padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, marginLeft: 8 }}>✕ Quitter</button>
        </div>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {loading ? <Spinner /> : <SessionView key={activeSession} sessionData={sessionData} isRace={activeSession === "course"} myPilot={myPilot} display={true} sessionLabel={sessionLabel} data={data} />}
      </div>
    </div>
  );

  // ── Vue normale ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif", color: C.text, animation: "pageIn 0.3s ease-out" }}>
      <style>{`
        @keyframes pageIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes livePulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
      `}</style>
      <div style={{ background: "linear-gradient(160deg,#0E0E16 0%,#110610 100%)", borderBottom: `1px solid ${C.border}`, padding: "22px 20px 18px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ color: "#FFF", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", marginBottom: 5 }}>CLASSEMENT OFFICIEL</div>
              <h1 style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontSize: "2rem", fontWeight: 700, letterSpacing: "0.03em", lineHeight: 1, color: "#FFF" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={LOGO} alt="logo" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                  Leaderboard
                </span>
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {champion && (
                <div style={{ background: `linear-gradient(135deg,${C.accentDim}55,#1a100222)`, border: `1px solid ${C.gold}33`, borderRadius: 8, padding: "8px 18px", textAlign: "center" }}>
                  <div style={{ color: C.gold, fontSize: "0.62rem", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 3 }}>🏆 CHAMPION</div>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: C.gold }}>{champion}</div>
                </div>
              )}
              <button onClick={() => setShowProfile(true)} title="Voir mon profil" style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "6px 14px", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ fontSize: "0.6rem", color: C.soft, marginBottom: 1 }}>
                  👤 {pilotStats?.ecurie || "Pilote"}
                </div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1rem", fontWeight: 700, color: C.text, lineHeight: 1 }}>
                  {myPilot}
                </div>
                {pilotStats?.avg && (
                  <div style={{ fontSize: "0.62rem", color: C.soft, fontFamily: "monospace", marginTop: 1 }}>
                    moy. {pilotStats.avg}
                  </div>
                )}
              </button>
              {canViewDashboard && <HeaderBtn onClick={() => setPage("admin")}>📊 Dashboard</HeaderBtn>}
              <HeaderBtn onClick={toggleDisplay}>🖥️ Affichage</HeaderBtn>
              <HeaderBtn onClick={() => setPage("home")}>← Accueil</HeaderBtn>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><HeaderBtn>💬 Discord</HeaderBtn></a>
            </div>
          </div>
          {countdown && (
            <div style={{ marginTop: 10, color: C.soft, fontSize: "0.75rem", letterSpacing: "0.1em", fontVariantNumeric: "tabular-nums" }}>
              ⏱ Prochaine session dans <span style={{ color: C.text, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>{countdown}</span>
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <button onClick={() => setShowSheet(v => !v)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 6 }}>
              📊 {isMock ? "Connecter Google Sheets" : "Changer de feuille"}
            </button>
            {showSheet && <SheetsLoader onLoad={rows => { setData(rows); setShowSheet(false); setActiveSession("essais"); }} />}
          </div>
          {autoErr && <p style={{ color: C.accent, fontSize: "0.7rem", margin: "8px 0 0" }}>⚠ {autoErr}</p>}
          {isMock && !autoErr && <p style={{ color: C.soft, fontSize: "0.7rem", margin: "8px 0 0" }}>Chargement des données…</p>}
        </div>
      </div>
      <div style={{ background: "#0D0D14", borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex" }}>
          {SESSIONS.map(s => {
            const active = activeSession === s.key;
            return <button key={s.key} onClick={() => setActiveSession(s.key)} style={{ background: "transparent", border: "none", borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent", color: active ? C.text : C.soft, padding: "13px 22px", cursor: "pointer", fontSize: "0.9rem", fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</button>;
          })}
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {loading ? <Spinner /> : <SessionView key={activeSession} sessionData={sessionData} isRace={activeSession === "course"} myPilot={myPilot} display={false} sessionLabel={sessionLabel} data={data} />}
        {!loading && activeSession === "course" && <PredictionPanel data={data} />}
        {!loading && activeSession === "course" && <CircuitRating circuit={currentCircuit} myPilot={myPilot} />}
      </div>
      <div style={{ textAlign: "center", padding: "14px", color: C.soft, fontSize: "0.7rem", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {isMock ? <span>Mode démonstration</span> : <span>{data.length} entrées · {[...new Set(data.map(d => d.pilote))].length} pilotes</span>}
        {lastUpdate && !isMock && <span style={{ color: C.border, fontSize: "0.65rem" }}>|</span>}
        {lastUpdate && !isMock && <span title={lastUpdate.toLocaleString("fr-FR")}>🕐 Mis à jour à {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {timeAgoStr}</span>}
        {isLive && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#4ade80", fontSize: "0.7rem", fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "livePulse 1.5s ease-in-out infinite" }} />
            En direct
          </span>
        )}
      </div>
      {showProfile && (
        <PilotProfileModal
          profile={profile}
          pilotStats={pilotStats}
          cumulated={pilotStats?.cumulated}
          onClose={() => setShowProfile(false)}
          onLogout={async () => {
            setShowProfile(false);
            await handleLogout();
          }}
        />
      )}
    </div>
  );
}
