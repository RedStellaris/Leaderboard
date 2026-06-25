import { C } from "../../config.js";
import { getPilotInfo } from "../../logic/ranking.js";
import { useSortConfig, sortRows } from "../../logic/sortUtils.js";
import { Th, STh, Td, rowBg, rowBorder } from "../atoms/TableCells.jsx";
import { Rank } from "../atoms/Rank.jsx";

export function PtsTable({ ranking, courses, data, myPilot, display }) {
  const [sortConfig, onSort] = useSortConfig();
  const sorted = sortRows(ranking, sortConfig, (r, k) => ({
    pilote: r.pilote || "",
    ecurie: getPilotInfo(data, r.pilote).ecurie,
    points: r.points,
  }[k]));
  const sp = { sortConfig, onSort };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>
          <Th center display={display}>Pos</Th>
          <Th center display={display}>#</Th>
          <STh sortKey="pilote" {...sp} display={display}>Pilote</STh>
          <STh sortKey="ecurie" {...sp} display={display}>Écurie</STh>
          <STh sortKey="points" {...sp} right display={display}>Points</STh>
          {courses.map(c => (
            <Th key={c} right display={display}><span style={{ fontSize: "0.65rem" }}>{c}</span></Th>
          ))}
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
                <Td right bold gold={!myPilot && i === 0} display={display}>{r.points} pts</Td>
                {courses.map(c => {
                  const d = r.detail[c];
                  return (
                    <Td key={c} right dim display={display}>
                      {d
                        ? <span style={{ color: d.rank <= 3 ? C.gold : C.soft }}>{d.pts}</span>
                        : <span style={{ color: "#2a2a3a" }}>–</span>}
                    </Td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ color: C.soft, fontSize: "0.7rem", margin: "10px 0 0" }}>
        Barème : 25 – 18 – 15 – 10 – 8 pts · Au-delà de la 5ème place : 0 pt
      </p>
    </div>
  );
}
