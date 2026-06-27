import { useMemo } from "react";
import { C } from "../../config.js";

const MEDAL = ["🥇", "🥈", "🥉"];

export function PredictionPanel({ data }) {
  // Lignes course avec pos_predit renseignée
  const rows = useMemo(() => {
    const courseRows = data.filter(
      d => d.type === "course" && d.pos_predit && !isNaN(parseInt(d.pos_predit))
    );
    if (!courseRows.length) return [];

    // Circuit le plus récent avec des prédictions
    const circuits = [...new Set(courseRows.map(d => d.course))];
    const circuit  = circuits[circuits.length - 1];

    return courseRows
      .filter(d => d.course === circuit)
      .sort((a, b) => parseInt(a.pos_predit) - parseInt(b.pos_predit));
  }, [data]);

  if (!rows.length) return null;

  const circuit = rows[0]?.course;

  return (
    <div style={{ marginTop: 32 }}>
      {/* En-tête */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
      }}>
        <div style={{
          height: 2, flex: 1,
          background: `linear-gradient(90deg, ${C.accentDim}, transparent)`,
        }} />
        <div style={{
          color: C.soft, fontSize: "0.65rem", letterSpacing: "0.2em",
          fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          🔮 Prédiction admin — {circuit}
        </div>
        <div style={{
          height: 2, flex: 1,
          background: `linear-gradient(270deg, ${C.accentDim}, transparent)`,
        }} />
      </div>

      {/* Tableau */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, overflow: "hidden",
      }}>
        {/* Header tableau */}
        <div style={{
          display: "grid", gridTemplateColumns: "48px 1fr 1fr",
          padding: "8px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bg,
        }}>
          {["Pos.", "Pilote", "Écurie"].map(h => (
            <div key={h} style={{
              color: C.soft, fontSize: "0.65rem",
              letterSpacing: "0.12em", fontWeight: 700,
              textTransform: "uppercase",
            }}>{h}</div>
          ))}
        </div>

        {/* Lignes */}
        {rows.map((row, i) => {
          const pos = parseInt(row.pos_predit);
          return (
            <div key={`${row.pilote}-${i}`} style={{
              display: "grid", gridTemplateColumns: "48px 1fr 1fr",
              padding: "11px 16px",
              background: i % 2 === 0 ? C.row : C.rowAlt,
              borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none",
              alignItems: "center",
            }}>
              {/* Position */}
              <div style={{
                fontFamily: "'Rajdhani',sans-serif",
                fontSize: "1.1rem", fontWeight: 700,
                color: pos <= 3 ? C.gold : C.soft,
              }}>
                {pos <= 3 ? MEDAL[pos - 1] : `P${pos}`}
              </div>

              {/* Pilote */}
              <div style={{
                color: C.text, fontWeight: 600, fontSize: "0.9rem",
              }}>
                {row.pilote}
                {row.numero && (
                  <span style={{
                    marginLeft: 8, color: C.soft,
                    fontSize: "0.75rem", fontWeight: 400,
                  }}>#{row.numero}</span>
                )}
              </div>

              {/* Écurie */}
              <div style={{ color: C.soft, fontSize: "0.82rem" }}>
                {row.ecurie || "–"}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{
        color: C.soft, fontSize: "0.68rem",
        margin: "8px 0 0", textAlign: "right",
        fontStyle: "italic",
      }}>
        Prédiction établie par l'administration AMCR
      </p>
    </div>
  );
}
