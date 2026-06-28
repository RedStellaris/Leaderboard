import { useMemo } from "react";
import { C, LOGO } from "../../config.js";

// ── Helpers locaux ────────────────────────────────────────────────────────────
function normalizeDate(str) {
  if (!str) return "";
  const mDMY = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2})$/);
  if (mDMY) return `${mDMY[3]}-${mDMY[2]}-${mDMY[1]}T${mDMY[4]}`;
  const mYMD = str.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/);
  if (mYMD) return `${mYMD[1]}T${mYMD[2]}`;
  return str;
}

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

function formatMs(ms) {
  if (!isFinite(ms) || ms <= 0) return "—";
  const s   = Math.floor(ms / 1000);
  const mil = ms % 1000;
  return `${s}.${String(mil).padStart(3, "0")}s`;
}

// ── Sous-composants ───────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent, gold }) {
  const color = gold ? C.gold : accent ? C.accent : C.text;
  const border = gold ? `${C.gold}44` : accent ? `${C.accent}44` : C.border;
  return (
    <div style={{ background: C.card, border: `1px solid ${border}`, borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "2.8rem", fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: C.text, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "0.72rem", color: C.soft }}>{sub}</div>
    </div>
  );
}

function InfoCard({ icon, label, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ color: C.soft, fontSize: "0.7rem", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 12 }}>
        {icon} {label.toUpperCase()}
      </div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>{children}</div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export function AdminDashboard({ data, onBack }) {
  const TYPE_LABELS = {
    essais:         "🔧 Essais",
    qualifications: "⏱ Qualifications",
    course:         "🏆 Courses",
  };
  const TYPE_COLORS = {
    essais:         C.accent,
    qualifications: "#6366f1",
    course:         C.gold,
  };

  const stats = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Attacher timestamp parsé à chaque ligne
    const withTs = data.map(r => ({
      ...r,
      _ts: new Date(normalizeDate(r.date)).getTime() || 0,
    }));

    // ── 1. Sessions uniques (type + circuit + jour) ──────────────────────────
    const sessionKeys = new Set(
      withTs.map(r => `${r.type}|${r.course}|${normalizeDate(r.date).slice(0, 10)}`)
    );
    const totalSessions = sessionKeys.size;

    // ── 2. Pilotes actifs (30j) ──────────────────────────────────────────────
    const activeDrivers = new Set(
      withTs.filter(r => r._ts >= cutoff).map(r => r.pilote)
    ).size;

    // ── 3. Records battus (30j) ──────────────────────────────────────────────
    // Meilleur temps AVANT la fenêtre vs meilleur temps DANS la fenêtre
    const bestBefore = {}; // "type|course|pilote" → ms
    const bestIn30   = {}; // idem
    for (const r of withTs) {
      const key = `${r.type}|${r.course}|${r.pilote}`;
      const ms  = parseTime(r.temps);
      if (!isFinite(ms)) continue;
      if (r._ts < cutoff) {
        if (bestBefore[key] === undefined || ms < bestBefore[key]) bestBefore[key] = ms;
      } else {
        if (bestIn30[key] === undefined || ms < bestIn30[key])   bestIn30[key]   = ms;
      }
    }
    let recordsBroken = 0;
    for (const key of Object.keys(bestIn30)) {
      // Record battu si : aucun historique antérieur, ou temps amélioré
      if (bestBefore[key] === undefined || bestIn30[key] < bestBefore[key]) recordsBroken++;
    }

    // ── 4. Meilleure progression (30j) ──────────────────────────────────────
    // Pour chaque pilote : premier temps enregistré (30j) vs meilleur temps (30j)
    const pilotFirstTs = {}; // pilote → { ts, ms }
    const pilotBestMs  = {}; // pilote → ms
    for (const r of withTs.filter(r => r._ts >= cutoff).sort((a, b) => a._ts - b._ts)) {
      const ms = parseTime(r.temps);
      if (!isFinite(ms)) continue;
      if (!pilotFirstTs[r.pilote]) pilotFirstTs[r.pilote] = ms;
      if (pilotBestMs[r.pilote] === undefined || ms < pilotBestMs[r.pilote]) pilotBestMs[r.pilote] = ms;
    }
    let bestProgPilot = null, bestProgGainMs = 0;
    for (const p of Object.keys(pilotFirstTs)) {
      const gain = pilotFirstTs[p] - pilotBestMs[p];
      if (gain > bestProgGainMs) { bestProgGainMs = gain; bestProgPilot = p; }
    }

    // ── 5. Circuit le plus actif ─────────────────────────────────────────────
    const circuitCount = {};
    for (const r of data) circuitCount[r.course] = (circuitCount[r.course] || 0) + 1;
    const topCircuit = Object.entries(circuitCount).sort((a, b) => b[1] - a[1])[0] ?? null;

    // ── 6. Course la plus disputée (spread P1-dernier le plus serré) ─────────
    const courseGroups = {};
    for (const r of data.filter(r => r.type === "course")) {
      if (!courseGroups[r.course]) courseGroups[r.course] = [];
      const ms = parseTime(r.temps);
      if (isFinite(ms)) courseGroups[r.course].push(ms);
    }
    let tightestCircuit = null, tightestSpreadMs = Infinity;
    for (const [circuit, times] of Object.entries(courseGroups)) {
      if (times.length < 2) continue;
      const spread = Math.max(...times) - Math.min(...times);
      if (spread < tightestSpreadMs) { tightestSpreadMs = spread; tightestCircuit = circuit; }
    }

    // ── 7. Répartition par type ──────────────────────────────────────────────
    const typeCount = {};
    for (const r of data) typeCount[r.type] = (typeCount[r.type] || 0) + 1;

    return {
      totalSessions,
      activeDrivers,
      recordsBroken,
      totalDrivers:  [...new Set(data.map(r => r.pilote))].size,
      totalEntries:  data.length,
      bestProgPilot,
      bestProgGain:  formatMs(bestProgGainMs),
      topCircuit:    topCircuit ? { name: topCircuit[0], count: topCircuit[1] } : null,
      tightestCircuit,
      tightestSpread: formatMs(tightestSpreadMs),
      typeCount,
    };
  }, [data]);

  const maxTypeCount = Math.max(...Object.values(stats.typeCount), 1);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif", color: C.text }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(160deg,#0E0E16 0%,#110610 100%)", borderBottom: `1px solid ${C.border}`, padding: "22px 20px 18px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={LOGO} alt="logo" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <div style={{ color: C.accent, fontSize: "0.65rem", letterSpacing: "0.18em", fontWeight: 700 }}>ADMIN</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.7rem", fontWeight: 700, color: "#FFF", lineHeight: 1 }}>
                Dashboard
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* ── Contenu ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          <KpiCard icon="🏁" label="Sessions totales"  value={stats.totalSessions}  sub="tous types confondus"  />
          <KpiCard icon="👤" label="Pilotes actifs"    value={stats.activeDrivers}  sub="30 derniers jours"    accent />
          <KpiCard icon="⚡" label="Records battus"    value={stats.recordsBroken}  sub="30 derniers jours"    gold />
        </div>

        {/* Ligne 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <InfoCard icon="📈" label="Meilleure progression (30j)">
            {stats.bestProgPilot ? (
              <>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>
                  {stats.bestProgPilot}
                </span>
                <span style={{ color: "#4ade80", fontFamily: "'Rajdhani',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginLeft: 8 }}>
                  {stats.bestProgGain}
                </span>
              </>
            ) : (
              <span style={{ color: C.soft, fontSize: "0.85rem" }}>Aucune donnée (30j)</span>
            )}
          </InfoCard>

          <InfoCard icon="🏟" label="Circuit le plus actif">
            {stats.topCircuit ? (
              <>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>
                  {stats.topCircuit.name}
                </span>
                <span style={{ color: C.soft, fontSize: "0.85rem", marginLeft: 8 }}>
                  {stats.topCircuit.count} entrées
                </span>
              </>
            ) : (
              <span style={{ color: C.soft, fontSize: "0.85rem" }}>—</span>
            )}
          </InfoCard>
        </div>

        {/* Ligne 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <InfoCard icon="⚔️" label="Course la plus disputée">
            {stats.tightestCircuit ? (
              <>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>
                  {stats.tightestCircuit}
                </span>
                <span style={{ color: C.soft, fontSize: "0.85rem", marginLeft: 8 }}>
                  spread {stats.tightestSpread}
                </span>
              </>
            ) : (
              <span style={{ color: C.soft, fontSize: "0.85rem" }}>Aucune course enregistrée</span>
            )}
          </InfoCard>

          <InfoCard icon="📋" label="Données totales">
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>
              {stats.totalEntries}
            </span>
            <span style={{ color: C.soft, fontSize: "0.85rem", marginLeft: 8 }}>
              entrées · {stats.totalDrivers} pilotes
            </span>
          </InfoCard>
        </div>

        {/* Répartition par type */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ color: C.soft, fontSize: "0.7rem", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 18 }}>
            📊 RÉPARTITION PAR TYPE DE SESSION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(stats.typeCount).map(([type, count]) => {
              const pct = Math.round((count / maxTypeCount) * 100);
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{TYPE_LABELS[type] || type}</span>
                    <span style={{ color: C.soft, fontSize: "0.82rem" }}>{count} entrées</span>
                  </div>
                  <div style={{ background: C.row, borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: TYPE_COLORS[type] || C.accent,
                      borderRadius: 4,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
