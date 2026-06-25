import { C } from "../../config.js";
import { parseTime, formatDelta } from "../../utils/timeUtils.js";
import { useSortConfig, sortRows } from "../../logic/sortUtils.js";
import { Th, STh, Td, rowBg, rowBorder } from "../atoms/TableCells.jsx";
import { Rank } from "../atoms/Rank.jsx";

export function CourseTable({ ranking, isRace, myPilot, display }) {
  const [sortConfig, onSort] = useSortConfig();
  const sorted = sortRows(ranking, sortConfig, (r, k) => ({
    pilote: r.pilote || "",
    ecurie: r.ecurie || "",
    temps:  parseTime(r.temps),
    delta:  r.delta,
    pts:    r.points,
  }[k]));
  const sp = { sortConfig, onSort };

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
              <Td bold gold={!myPilot && i === 0} display={display}
                  style={myPilot && r.pilote === myPilot ? { color: C.accent, fontWeight: 700 } : {}}>
                {r.pilote}
              </Td>
              <Td dim display={display}>{r.ecurie || "–"}</Td>
              <Td right mono gold={!myPilot && i === 0} display={display}>{r.temps}</Td>
              <Td right mono dim display={display}>{r.delta === 0 ? "–" : formatDelta(r.delta)}</Td>
              <Td right bold display={display}>{r.points > 0 ? r.points : "–"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
