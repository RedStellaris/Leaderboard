import { useMemo } from "react";
import { C } from "../../config.js";
import { courseRanking } from "../../logic/ranking.js";
import { usePDFExport } from "../../utils/pdfExport.js";
import { CourseTable } from "../tables/CourseTable.jsx";

export function CourseView({ course, data, isRace, myPilot, display, sessionLabel }) {
  const ranking           = useMemo(() => courseRanking(data, course), [data, course]);
  const best              = ranking[0];
  const timeFs            = display ? "2.2rem" : "1.6rem";
  const [exporting, doExport] = usePDFExport();

  function handleExport() {
    const cols = [
      ...(isRace ? ["Grille"] : []),
      "Pos.", "#", "Pilote", "Écurie", "Temps", "Écart", "Pts",
    ];
    const rows = ranking.map(r => [
      ...(isRace ? [r.pos_depart ? `P${r.pos_depart}` : "–"] : []),
      r.position ? `P${r.position}` : `P${r.rank}`,
      r.numero   ? `#${r.numero}`   : "–",
      r.pilote, r.ecurie || "–", r.temps,
      r.delta === 0 ? "LEADER" : `+${Math.floor(r.delta / 1000)}.${String(r.delta % 1000).padStart(3, "0")}`,
      r.points > 0 ? String(r.points) : "–",
    ]);
    doExport({
      title:        `${course} — ${sessionLabel}`,
      sessionLabel: `${sessionLabel} · ${course}`,
      columns:      cols,
      rows,
      filename:     `classement_${course.replace(/\s+/g, "_")}_${sessionLabel}.pdf`,
    });
  }

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12, marginBottom: 20,
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 20px",
      }}>
        <div>
          <div style={{ color: C.soft, fontSize: "0.65rem", letterSpacing: "0.12em", marginBottom: 4 }}>MEILLEUR TEMPS</div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: timeFs, color: C.gold, fontWeight: 700 }}>
            {best?.temps ?? "--:--.---"}
          </div>
          <div style={{ color: C.soft, fontSize: "0.8rem", marginTop: 2 }}>{best?.pilote}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.soft, fontSize: "0.65rem", letterSpacing: "0.12em", marginBottom: 4 }}>PILOTES</div>
            <div style={{ fontSize: timeFs, fontWeight: 700 }}>{ranking.length}</div>
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
      </div>
      <CourseTable ranking={ranking} isRace={isRace} myPilot={myPilot} display={display} />
    </div>
  );
}
