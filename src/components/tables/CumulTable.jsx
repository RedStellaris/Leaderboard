import { C } from "../../config.js";
import { formatTime } from "../../utils/timeUtils.js";
import { getPilotInfo } from "../../logic/ranking.js";
import { useSortConfig, sortRows } from "../../logic/sortUtils.js";
import { Th, STh, Td, rowBg, rowBorder } from "../atoms/TableCells.jsx";
import { Rank } from "../atoms/Rank.jsx";

export function CumulTable({ ranking, data, myPilot, display }) {
  const [sortConfig, onSort] = useSortConfig();
  const sorted = sortRows(ranking, sortConfig, (r, k) => ({
    pilote:  r.pilote || "",
    ecurie:  getPilotInfo(data, r.pilote).ecurie,
    total:   r.totalMs,
    moy:     r.avgMs,
    courses: r.done,
  }[k]));
  const sp = { sortConfig, onSort };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
            return (
              <tr key={r.pilote} style={{ background: rowBg(r.pilote, myPilot, i), borderLeft: rowBorder(r.pilote, myPilot) }}>
                <Td center display={display}><Rank n={i + 1} /></Td>
                <Td center dim display={display}>{info.numero ? `#${info.numero}` : "–"}</Td>
                <Td bold gold={!myPilot && i === 0} display={display}>{r.pilote}{i === 0 && !myPilot ? " 👑" : ""}</Td>
                <Td dim display={display}>{info.ecurie}</Td>
                <Td right mono gold={!myPilot && i === 0} display={display}>{formatTime(r.totalMs)}</Td>
                <Td right mono dim display={display}>{formatTime(Math.round(r.avgMs))}</Td>
                <Td right dim display={display}>{r.done}/{r.of}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ color: C.soft, fontSize: "0.7rem", margin: "10px 0 0" }}>
        * Pilotes ayant complété toutes les courses classés en priorité
      </p>
    </div>
  );
}
