import { useState, useEffect } from "react";
import { C } from "../../config.js";

const FORM_ID        = "1FAIpQLScpjVR5bK8cSth_B3kO5zI6uwktpsOGAN8SOzwzj9M3oB9umQ";
const FORM_URL       = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;
const RESPONSE_SHEET = "1LdxTn0CmFP_MA6deCrIPXUaM3xQPGRH6slpVOrIkfCU";

const ENTRY_PILOTE  = "entry.524535381";
const ENTRY_CIRCUIT = "entry.168811865";
const ENTRY_NOTE    = "entry.504715090";

function Stars({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= (hovered || value);
        return (
          <span
            key={n}
            onClick={() => !readOnly && onChange?.(n)}
            onMouseEnter={() => !readOnly && setHovered(n)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            style={{
              fontSize: readOnly ? "1.2rem" : "1.8rem",
              cursor: readOnly ? "default" : "pointer",
              color: filled ? C.gold : C.border,
              transition: "color 0.1s",
              userSelect: "none",
            }}
          >★</span>
        );
      })}
    </div>
  );
}

async function fetchRatings() {
  try {
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/${RESPONSE_SHEET}/export?format=csv`
    );
    if (!res.ok) return {};
    const text = await res.text();
    const [, ...lines] = text.trim().split("\n");
    const byCircuit = {};
    lines.forEach(l => {
      // Colonnes : Timestamp, Pilote, Circuit, Note
      const cols = l.split(",").map(v => v.trim().replace(/"/g, ""));
      const circuit = cols[2];
      const note    = parseInt(cols[3]);
      if (!circuit || isNaN(note)) return;
      if (!byCircuit[circuit]) byCircuit[circuit] = [];
      byCircuit[circuit].push(note);
    });
    const avg = {};
    Object.entries(byCircuit).forEach(([c, notes]) => {
      avg[c] = { avg: notes.reduce((s, n) => s + n, 0) / notes.length, count: notes.length };
    });
    return avg;
  } catch { return {}; }
}

export function CircuitRating({ circuit, myPilot }) {
  const [note,      setNote]      = useState(0);
  const [phase,     setPhase]     = useState("idle"); // idle | submitting | done | error
  const [ratings,   setRatings]   = useState({});
  const [hasVoted,  setHasVoted]  = useState(false);

  const storageKey = `voted_${circuit}`;

  useEffect(() => {
    if (!circuit) return;
    setHasVoted(!!localStorage.getItem(storageKey));
    fetchRatings().then(setRatings);
  }, [circuit]);

  async function handleSubmit() {
    if (!note || !myPilot?.trim() || !circuit) return;
    setPhase("submitting");
    try {
      await fetch(FORM_URL, {
        method: "POST",
        mode:   "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          [ENTRY_PILOTE]:  myPilot.trim(),
          [ENTRY_CIRCUIT]: circuit,
          [ENTRY_NOTE]:    String(note),
        }),
      });
      localStorage.setItem(storageKey, "1");
      setHasVoted(true);
      setPhase("done");
      // Recharger les notes après 2s (délai propagation Sheets)
      setTimeout(() => fetchRatings().then(setRatings), 2000);
    } catch {
      setPhase("error");
    }
  }

  if (!circuit) return null;

  const circuitRating = ratings[circuit];

  return (
    <div style={{ marginTop: 28 }}>
      {/* Séparateur */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${C.accentDim}, transparent)` }} />
        <div style={{ color: C.soft, fontSize: "0.65rem", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          ⭐ Notation du circuit
        </div>
        <div style={{ height: 2, flex: 1, background: `linear-gradient(270deg, ${C.accentDim}, transparent)` }} />
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 24px" }}>

        {/* Moyenne actuelle */}
        {circuitRating && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <Stars value={Math.round(circuitRating.avg)} readOnly />
            <div>
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: C.gold }}>
                {circuitRating.avg.toFixed(1)}
              </span>
              <span style={{ color: C.soft, fontSize: "0.78rem", marginLeft: 8 }}>
                / 5 — {circuitRating.count} vote{circuitRating.count > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Formulaire de vote */}
        {hasVoted || phase === "done" ? (
          <div style={{ color: C.soft, fontSize: "0.85rem", textAlign: "center", padding: "8px 0" }}>
            ✅ Tu as déjà noté ce circuit. Merci !
          </div>
        ) : !myPilot?.trim() ? (
          <div style={{ color: C.soft, fontSize: "0.85rem", textAlign: "center" }}>
            👤 Définis ton pseudo pilote pour voter
          </div>
        ) : (
          <div>
            <div style={{ color: C.soft, fontSize: "0.78rem", marginBottom: 10 }}>
              Ta note pour <strong style={{ color: C.text }}>{circuit}</strong> :
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Stars value={note} onChange={setNote} />
              <button
                onClick={handleSubmit}
                disabled={!note || phase === "submitting"}
                style={{
                  background: note ? C.accent : C.card,
                  border: `1px solid ${note ? C.accent : C.border}`,
                  color: note ? "#fff" : C.soft,
                  padding: "8px 20px", borderRadius: 6,
                  cursor: note ? "pointer" : "not-allowed",
                  fontSize: "0.82rem", fontWeight: 700,
                  fontFamily: "'Rajdhani',sans-serif",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  transition: "all 0.15s",
                }}
              >
                {phase === "submitting" ? "Envoi…" : "Voter"}
              </button>
              {phase === "error" && (
                <span style={{ color: C.accent, fontSize: "0.75rem" }}>
                  ✗ Erreur — réessaie
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
