import { useMemo, useState } from "react";
import { C, LOGO, F1_POINTS } from "../../config.js";
import { Converter }     from "../modals/Converter.jsx";
import { AvgCalculator } from "../modals/AvgCalculator.jsx";
import { RoleManager }   from "../modals/RoleManager.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  return `${Math.floor(ms / 1000)}.${String(ms % 1000).padStart(3, "0")}s`;
}

const PILOT_COLORS = [
  "#C41230","#F5A623","#6366f1","#4ade80",
  "#f472b6","#38bdf8","#fb923c","#a3e635","#e879f9","#34d399",
];

const MONTH_NAMES = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];

// ── Sous-composants ───────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent, gold }) {
  const color  = gold ? C.gold  : accent ? C.accent : C.text;
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

function SectionCard({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ color: C.soft, fontSize: "0.7rem", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 18 }}>{title}</div>
      {children}
    </div>
  );
}

// Graphe SVG — évolution des points
function EvolutionChart({ evolution, pilots }) {
  if (!evolution.length || !pilots.length) {
    return <div style={{ color: C.soft, fontSize: "0.85rem", padding: "12px 0" }}>Aucune course enregistrée.</div>;
  }

  const W = 700, H = 180;
  const padL = 44, padR = 16, padT = 12, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n      = evolution.length;
  const maxPts = Math.max(...pilots.flatMap(p => evolution.map(e => e.snapshot[p] || 0)), 1);

  const toX = i   => padL + (n === 1 ? chartW / 2 : (i * chartW) / (n - 1));
  const toY = pts => padT + chartH - (pts / maxPts) * chartH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    pts: Math.round(maxPts * f),
    y:   toY(maxPts * f),
  }));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Lignes de grille horizontales */}
        {yTicks.map(({ pts, y }) => (
          <g key={pts}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={C.border} strokeWidth={0.5} />
            <text x={padL - 6} y={y + 4} fill={C.soft} fontSize={9} textAnchor="end">{pts}</text>
          </g>
        ))}

        {/* Labels X (date MM-JJ) */}
        {evolution.map((e, i) => (
          <text key={i} x={toX(i)} y={H - 4} fill={C.soft} fontSize={8} textAnchor="middle">
            {e.date.slice(5)}
          </text>
        ))}

        {/* Courbes */}
        {pilots.map((p, pi) => {
          const color  = PILOT_COLORS[pi % PILOT_COLORS.length];
          const points = evolution.map((e, i) => `${toX(i)},${toY(e.snapshot[p] || 0)}`).join(" ");
          return (
            <g key={p}>
              <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
              {evolution.map((e, i) => (
                <circle key={i} cx={toX(i)} cy={toY(e.snapshot[p] || 0)} r={3} fill={color} />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Légende */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 10 }}>
        {pilots.map((p, pi) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 3, background: PILOT_COLORS[pi % PILOT_COLORS.length], borderRadius: 2 }} />
            <span style={{ fontSize: "0.75rem", color: C.soft }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Graphe bar — taux de participation par mois
function ParticipationChart({ monthlyRates }) {
  if (!monthlyRates.length) {
    return <div style={{ color: C.soft, fontSize: "0.85rem" }}>Aucune donnée mensuelle disponible.</div>;
  }
  const maxCount = Math.max(...monthlyRates.map(m => m.count), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 90 }}>
      {monthlyRates.map(({ month, count, rate }) => {
        const [y, m] = month.split("-");
        const label  = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y.slice(2)}`;
        const barH   = Math.max((count / maxCount) * 56, 4);
        return (
          <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: "0.7rem", color: "#4ade80", fontWeight: 700 }}>{rate}%</div>
            <div style={{
              width: "100%", height: `${barH}px`,
              background: `linear-gradient(to top, ${C.accent}, ${C.accentDim})`,
              borderRadius: "3px 3px 0 0",
              transition: "height 0.4s ease",
            }} />
            <div style={{ fontSize: "0.62rem", color: C.soft, whiteSpace: "nowrap" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export function AdminDashboard({ data, onBack, isAdmin }) {
  const [showConverter, setShowConverter]  = useState(false);
  const [showAvgCalc,   setShowAvgCalc]    = useState(false);
  const [showRoles,     setShowRoles]      = useState(false);
  const TYPE_LABELS = { essais: "🔧 Essais", qualifications: "⏱ Qualifications", course: "🏆 Courses" };
  const TYPE_COLORS = { essais: C.accent,   qualifications: "#6366f1",            course: C.gold };

  const stats = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const withTs = data.map(r => ({ ...r, _ts: new Date(normalizeDate(r.date)).getTime() || 0 }));

    // 1. Sessions uniques
    const sessionKeys   = new Set(withTs.map(r => `${r.type}|${r.course}|${normalizeDate(r.date).slice(0, 10)}`));
    const totalSessions = sessionKeys.size;

    // 2. Pilotes & participation
    const totalDrivers  = [...new Set(data.map(r => r.pilote))].size;
    const activeDrivers = new Set(withTs.filter(r => r._ts >= cutoff).map(r => r.pilote)).size;
    const participationRate = totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0;

    // Évolution mensuelle (6 derniers mois)
    const monthlyMap = {};
    for (const r of withTs) {
      const d = new Date(normalizeDate(r.date));
      if (isNaN(d)) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = new Set();
      monthlyMap[key].add(r.pilote);
    }
    const monthlyRates = Object.keys(monthlyMap).sort().slice(-6).map(m => ({
      month: m,
      count: monthlyMap[m].size,
      rate:  totalDrivers > 0 ? Math.round((monthlyMap[m].size / totalDrivers) * 100) : 0,
    }));

    // 3. Records battus (30j)
    const bestBefore = {}, bestIn30 = {};
    for (const r of withTs) {
      const key = `${r.type}|${r.course}|${r.pilote}`;
      const ms  = parseTime(r.temps);
      if (!isFinite(ms)) continue;
      if (r._ts < cutoff) { if (bestBefore[key] === undefined || ms < bestBefore[key]) bestBefore[key] = ms; }
      else                { if (bestIn30[key]   === undefined || ms < bestIn30[key])   bestIn30[key]   = ms; }
    }
    let recordsBroken = 0;
    for (const key of Object.keys(bestIn30)) {
      if (bestBefore[key] === undefined || bestIn30[key] < bestBefore[key]) recordsBroken++;
    }

    // 4. Meilleure progression (30j)
    const pilotFirstMs = {}, pilotBestMs = {};
    for (const r of withTs.filter(r => r._ts >= cutoff).sort((a, b) => a._ts - b._ts)) {
      const ms = parseTime(r.temps);
      if (!isFinite(ms)) continue;
      if (pilotFirstMs[r.pilote] === undefined) pilotFirstMs[r.pilote] = ms;
      if (pilotBestMs[r.pilote]  === undefined || ms < pilotBestMs[r.pilote]) pilotBestMs[r.pilote] = ms;
    }
    let bestProgPilot = null, bestProgGainMs = 0;
    for (const p of Object.keys(pilotFirstMs)) {
      const gain = pilotFirstMs[p] - pilotBestMs[p];
      if (gain > bestProgGainMs) { bestProgGainMs = gain; bestProgPilot = p; }
    }

    // 5. Circuit le plus actif
    const circuitCount = {};
    for (const r of data) circuitCount[r.course] = (circuitCount[r.course] || 0) + 1;
    const topCircuit = Object.entries(circuitCount).sort((a, b) => b[1] - a[1])[0] ?? null;

    // 6. Course la plus disputée (spread)
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

    // 7. Pilote le plus constant
    // Spread moyen par (pilote × circuit × type), uniquement si ≥ 2 mesures dans le groupe
    const constGroups = {};
    for (const r of data) {
      const key = `${r.pilote}|${r.course}|${r.type}`;
      const ms  = parseTime(r.temps);
      if (!isFinite(ms)) continue;
      if (!constGroups[key]) constGroups[key] = { min: ms, max: ms, count: 1, pilote: r.pilote };
      else { if (ms < constGroups[key].min) constGroups[key].min = ms; if (ms > constGroups[key].max) constGroups[key].max = ms; constGroups[key].count++; }
    }
    const pilotSpreads = {};
    for (const { pilote, min, max, count } of Object.values(constGroups)) {
      if (count < 2) continue;
      if (!pilotSpreads[pilote]) pilotSpreads[pilote] = [];
      pilotSpreads[pilote].push(max - min);
    }
    let mostConstant = null, smallestAvgSpreadMs = Infinity;
    for (const [p, spreads] of Object.entries(pilotSpreads)) {
      const avg = spreads.reduce((a, b) => a + b, 0) / spreads.length;
      if (avg < smallestAvgSpreadMs) { smallestAvgSpreadMs = avg; mostConstant = p; }
    }

    // 8. Évolution du classement (courses, points F1 cumulatifs)
    const courseRows = withTs
      .filter(r => r.type === "course" && isFinite(r._ts) && r.course && r.pilote)
      .sort((a, b) => a._ts - b._ts);

    const sessionOrder = [], sessionRowsMap = {};
    for (const r of courseRows) {
      const key = `${normalizeDate(r.date).slice(0, 10)}|${r.course}`;
      if (!sessionRowsMap[key]) { sessionRowsMap[key] = []; sessionOrder.push(key); }
      sessionRowsMap[key].push(r);
    }
    const allPilots = [...new Set(data.map(r => r.pilote))];
    const cumul     = Object.fromEntries(allPilots.map(p => [p, 0]));
    const evolution = [];
    for (const key of sessionOrder) {
      const sorted = [...sessionRowsMap[key]].sort((a, b) =>
        (parseInt(a.position) || 999) - (parseInt(b.position) || 999)
      );
      sorted.forEach((r, i) => { if (F1_POINTS[i]) cumul[r.pilote] = (cumul[r.pilote] || 0) + F1_POINTS[i]; });
      evolution.push({ date: key.split("|")[0], snapshot: { ...cumul } });
    }
    const racePilots = [...new Set(courseRows.map(r => r.pilote))];

    // 9. Répartition par type
    const typeCount = {};
    for (const r of data) typeCount[r.type] = (typeCount[r.type] || 0) + 1;

    return {
      totalSessions, totalDrivers, totalEntries: data.length,
      activeDrivers, participationRate, monthlyRates,
      recordsBroken,
      bestProgPilot, bestProgGain: formatMs(bestProgGainMs),
      topCircuit:    topCircuit ? { name: topCircuit[0], count: topCircuit[1] } : null,
      tightestCircuit, tightestSpread: formatMs(tightestSpreadMs),
      mostConstant,    mostConstantSpread: formatMs(smallestAvgSpreadMs),
      evolution, racePilots,
      typeCount,
    };
  }, [data]);

  const maxTypeCount = Math.max(...Object.values(stats.typeCount), 1);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(160deg,#0E0E16 0%,#110610 100%)", borderBottom: `1px solid ${C.border}`, padding: "22px 20px 18px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={LOGO} alt="logo" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <div style={{ color: C.accent, fontSize: "0.65rem", letterSpacing: "0.18em", fontWeight: 700 }}>ADMIN</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.7rem", fontWeight: 700, color: "#FFF", lineHeight: 1 }}>Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowConverter(true)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>⏱ Convertisseur</button>
            <button onClick={() => setShowAvgCalc(true)}   style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>⌀ Moyenne</button>
            {isAdmin && <button onClick={() => setShowRoles(true)} style={{ background: "transparent", border: `1px solid ${C.accent}66`, color: C.text, padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>🔐 Rôles</button>}
            <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>← Retour</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          <KpiCard icon="🏁" label="Sessions totales" value={stats.totalSessions} sub="tous types confondus" />
          <KpiCard icon="👤" label="Pilotes actifs"   value={stats.activeDrivers} sub="30 derniers jours"   accent />
          <KpiCard icon="⚡" label="Records battus"   value={stats.recordsBroken} sub="30 derniers jours"   gold />
        </div>

        {/* Ligne 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <InfoCard icon="📈" label="Meilleure progression (30j)">
            {stats.bestProgPilot
              ? <><span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>{stats.bestProgPilot}</span><span style={{ color: "#4ade80", fontFamily: "'Rajdhani',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginLeft: 8 }}>{stats.bestProgGain}</span></>
              : <span style={{ color: C.soft, fontSize: "0.85rem" }}>Aucune donnée (30j)</span>}
          </InfoCard>
          <InfoCard icon="🎯" label="Pilote le plus constant">
            {stats.mostConstant
              ? <><span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>{stats.mostConstant}</span><span style={{ color: C.soft, fontSize: "0.82rem", marginLeft: 8 }}>écart moy. {stats.mostConstantSpread}</span></>
              : <span style={{ color: C.soft, fontSize: "0.85rem" }}>Données insuffisantes (≥ 2 mesures requises par circuit)</span>}
          </InfoCard>
        </div>

        {/* Ligne 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <InfoCard icon="🏟" label="Circuit le plus actif">
            {stats.topCircuit
              ? <><span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>{stats.topCircuit.name}</span><span style={{ color: C.soft, fontSize: "0.85rem", marginLeft: 8 }}>{stats.topCircuit.count} entrées</span></>
              : <span style={{ color: C.soft, fontSize: "0.85rem" }}>—</span>}
          </InfoCard>
          <InfoCard icon="⚔️" label="Course la plus disputée">
            {stats.tightestCircuit
              ? <><span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.text }}>{stats.tightestCircuit}</span><span style={{ color: C.soft, fontSize: "0.85rem", marginLeft: 8 }}>spread {stats.tightestSpread}</span></>
              : <span style={{ color: C.soft, fontSize: "0.85rem" }}>Aucune course enregistrée</span>}
          </InfoCard>
        </div>

        {/* Taux de participation */}
        <SectionCard title={`👥 TAUX DE PARTICIPATION — ${stats.participationRate}% actifs (${stats.activeDrivers} / ${stats.totalDrivers} pilotes sur 30j)`}>
          <ParticipationChart monthlyRates={stats.monthlyRates} />
        </SectionCard>

        {/* Évolution classement */}
        <SectionCard title="📉 ÉVOLUTION DU CLASSEMENT GÉNÉRAL — Points cumulés (courses)">
          <EvolutionChart evolution={stats.evolution} pilots={stats.racePilots} />
        </SectionCard>

        {/* Répartition par type */}
        <SectionCard title="📊 RÉPARTITION PAR TYPE DE SESSION">
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
                    <div style={{ width: `${pct}%`, height: "100%", background: TYPE_COLORS[type] || C.accent, borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div style={{ textAlign: "center", color: C.soft, fontSize: "0.72rem", paddingTop: 4 }}>
          {stats.totalEntries} entrées · {stats.totalDrivers} pilotes enregistrés
        </div>
      </div>
      {showConverter && <Converter     onClose={() => setShowConverter(false)} />}
      {showAvgCalc   && <AvgCalculator onClose={() => setShowAvgCalc(false)} />}
      {showRoles     && isAdmin && <RoleManager onClose={() => setShowRoles(false)} />}
    </div>
  );
}
