import { useMemo } from "react";
import { C } from "../../config.js";
import { parseTime, formatDelta } from "../../utils/timeUtils.js";
import { useSortConfig, sortRows } from "../../logic/sortUtils.js";
import { Th, STh, Td, rowBg, rowBorder } from "../atoms/TableCells.jsx";
import { Rank } from "../atoms/Rank.jsx";

const PODIUM_BG     = ["#F5A62318", "#8899AA14", "#CD7F3214"];
const PODIUM_BORDER = ["#F5A623",   "#8899AA",   "#CD7F32"  ];

function normalizeDate(str) {
  if (!str) return "";
  const mDMY = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2})$/);
  if (mDMY) return `${mDMY[3]}-${mDMY[2]}-${mDMY[1]}T${mDMY[4]}`;
  const mYMD = str.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/);
  if (mYMD) return `${mYMD[1]}T${mYMD[2]}`;
  return str;
}

function Trend({ currentMs, prevMs }) {
  if (prevMs === undefined) return <span style={{ color: C.soft, fontSize: "0.8rem" }}>–</span>;
  const diff = currentMs - prevMs;
  if (diff < 0) return <span style={{ color: "#4ade80", fontWeight: 700, fontSize: "1rem" }} title="Amélioration">↑</span>;
  if (diff > 0) return <span style={{ color: C.accent, fontWeight: 700, fontSize: "1rem" }} title="Régression">↓</span>;
  return <span style={{ color: C.soft, fontSize: "0.85rem" }}>→</span>;
}

export function CourseTable({ ranking, isRace, myPilot, display, data }) {
  const [sortConfig, onSort] = useSortConfig();
  const sorted = sortRows(ranking, sortConfig, (r, k) => ({
    pilote: r.pilote || "",
    ecurie: r.ecurie || "",
    temps:  parseTime(r.temps),
    delta:  r.delta,
    pts:    r.points,
  }[k]));
  const sp = { sortConfig, onSort };
  const defaultOrder = !sortConfig.key;

  // Temps précédent par pilote (session la plus récente hors session courante)
  const prevTimeMap = useMemo(() => {
    if (!data || !ranking.length) return {};
    const currentKeys = new Set(
      ranking.map(r => `${r.pilote}|${r.course}|${r.type}|${r.date}`)
    );
    const byPilot = {};
    for (const r of data) {
      if (currentKeys.has(`${r.pilote}|${r.course}|${r.type}|${r.date}`)) continue;
      const ms = parseTime(r.temps);
      if (!isFinite(ms)) continue;
      const d = normalizeDate(r.date);
      if (!byPilot[r.pilote] || d > byPilot[r.pilote].date) {
        byPilot[r.pilote] = { ms, date: d };
      }
    }
    return Object.fromEntries(Object.entries(byPilot).map(([p, v]) => [p, v.ms]));
  }, [data, ranking]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>
          {isRace && <Th center display={display}>Grille</Th>}
          <Th center display={display}>Pos.</Th>
          <Th center display={display}>#</Th>
          <STh sortKey="pilote" {...sp} display={display}>Pilote</STh>
          <STh sortKey="ecurie" {...sp} display={display}>Écurie</STh>
          <STh sortKey="temps"  {...sp} right display={display}>Temps</STh>
          <STh sortKey="delta"  {...sp} right display={display}>Écart</STh>
          <STh sortKey="pts"    {...sp} right display={display}>Pts</STh>
          <Th center display={display}>↕</Th>
        </tr></thead>
        <tbody>
          {sorted.map((r, i) => {
            const rank    = parseInt(r.position) || r.rank || (i + 1);
            const isMyP   = !!(myPilot && r.pilote === myPilot);
            const podIdx  = defaultOrder ? rank - 1 : -1;
            const isPodium = podIdx >= 0 && podIdx < 3;

            const bg = isMyP
              ? rowBg(r.pilote, myPilot, i)
              : isPodium ? PODIUM_BG[podIdx] : rowBg(r.pilote, myPilot, i);
            const bl = isMyP
              ? rowBorder(r.pilote, myPilot)
              : isPodium ? `2px solid ${PODIUM_BORDER[podIdx]}` : rowBorder(r.pilote, myPilot);

            const currentMs = parseTime(r.temps);

            return (
              <tr key={r.pilote} style={{ background: bg, borderLeft: bl }}>
                {isRace && <Td center dim display={display}>{r.pos_depart ? `P${r.pos_depart}` : "–"}</Td>}
                <Td center display={display}><Rank n={rank} /></Td>
                <Td center dim display={display}>{r.numero ? `#${r.numero}` : "–"}</Td>
                <Td bold gold={!myPilot && i === 0} display={display}
                    style={isMyP ? { color: C.accent, fontWeight: 700 } : {}}>
                  {r.pilote}
                </Td>
                <Td dim display={display}>{r.ecurie || "–"}</Td>
                <Td right mono gold={!myPilot && i === 0} display={display}>{r.temps}</Td>
                <Td right mono dim display={display}>{r.delta === 0 ? "–" : formatDelta(r.delta)}</Td>
                <Td right bold display={display}>{r.points > 0 ? r.points : "–"}</Td>
                <Td center display={display}>
                  <Trend currentMs={currentMs} prevMs={prevTimeMap[r.pilote]} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
