import { C } from "../../config.js";
import { getPilotInfo } from "../../logic/ranking.js";
import { formatTime } from "../../utils/timeUtils.js";
import { usePDFExport } from "../../utils/pdfExport.js";
import { Pill } from "../atoms/Pill.jsx";
import { CumulTable } from "../tables/CumulTable.jsx";
import { PtsTable } from "../tables/PtsTable.jsx";

export function GlobalView({ sub, setSub, cumul, pts, courses, data, myPilot, display, sessionLabel }) {
  const [exporting, doExport] = usePDFExport();

  function handleExport() {
    if (sub === "cumul") {
      const cols = ["Pos", "#", "Pilote", "Écurie", "Temps total", "Moy / course", "Courses"];
      const rows = cumul.map((r, i) => {
        const info = getPilotInfo(data, r.pilote);
        return [
          `P${i + 1}`, info.numero ? `#${info.numero}` : "–",
          r.pilote, info.ecurie,
          formatTime(r.totalMs), formatTime(Math.round(r.avgMs)),
          `${r.done}/${r.of}`,
        ];
      });
      doExport({ title: "Classement global — Temps cumulé", sessionLabel: `${sessionLabel} · Temps cumulé`, columns: cols, rows, filename: `classement_global_temps_${sessionLabel}.pdf` });
    } else {
      const cols = ["Pos", "#", "Pilote", "Écurie", "Points", ...courses];
      const rows = pts.map((r, i) => {
        const info = getPilotInfo(data, r.pilote);
        return [
          `P${i + 1}`, info.numero ? `#${info.numero}` : "–",
          r.pilote, info.ecurie, `${r.points} pts`,
          ...courses.map(c => r.detail[c] ? String(r.detail[c].pts) : "–"),
        ];
      });
      doExport({ title: "Classement global — Points", sessionLabel: `${sessionLabel} · Points`, columns: cols, rows, filename: `classement_global_points_${sessionLabel}.pdf` });
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill active={sub === "cumul"} onClick={() => setSub("cumul")}>⏱ Temps cumulé</Pill>
          <Pill active={sub === "pts"}   onClick={() => setSub("pts")}>🏆 Points</Pill>
        </div>
        {!display && (
          <button onClick={handleExport} disabled={exporting} style={{
            background: exporting ? C.card : C.accentDim,
            border: `1px solid ${C.accent}`, color: exporting ? C.soft : "#fff",
            padding: "8px 14px", borderRadius: 7, cursor: exporting ? "wait" : "pointer",
            fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
          }}>
            {exporting ? "⏳ Export…" : "📄 PDF"}
          </button>
        )}
      </div>
      {sub === "cumul"
        ? <CumulTable ranking={cumul} data={data} myPilot={myPilot} display={display} />
        : <PtsTable   ranking={pts}   courses={courses} data={data} myPilot={myPilot} display={display} />}
    </div>
  );
}
