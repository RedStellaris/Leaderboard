import { useState, useMemo } from "react";
import { C } from "../../config.js";

// Accepte MM:SS,mmm ou MM:SS.mmm
function parseTimeLocal(str) {
  if (!str || !str.trim()) return null;
  const normalized = str.trim().replace(",", ".");
  const m = normalized.match(/^(\d{1,2}):(\d{2})\.(\d{1,3})$/);
  if (!m) return null;
  const ms = parseInt(m[1]) * 60000 + parseInt(m[2]) * 1000 + parseInt(m[3].padEnd(3, "0"));
  return isNaN(ms) ? null : ms;
}

function formatMs(ms) {
  if (ms === null || ms === undefined) return "–";
  const min  = Math.floor(ms / 60000);
  const sec  = Math.floor((ms % 60000) / 1000);
  const mil  = ms % 1000;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(mil).padStart(3, "0")}`;
}

function formatDelta(ms) {
  if (ms <= 0) return "LEADER";
  const s   = Math.floor(ms / 1000);
  const mil = ms % 1000;
  return `+${s},${String(mil).padStart(3, "0")}`;
}

let _id = 0;
const newRow = () => ({ id: ++_id, value: "" });

export function AvgCalculator({ onClose }) {
  const [rows, setRows] = useState([newRow(), newRow(), newRow()]);

  function updateRow(id, value) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, value } : r));
  }

  function addRow() {
    setRows(prev => [...prev, newRow()]);
  }

  function removeRow(id) {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev.map(r => ({ ...r, value: "" })));
  }

  function reset() {
    _id = 0;
    setRows([newRow(), newRow(), newRow()]);
  }

  // Calcul en temps réel
  const stats = useMemo(() => {
    const parsed = rows.map(r => ({ id: r.id, ms: parseTimeLocal(r.value), raw: r.value }));
    const valid  = parsed.filter(r => r.ms !== null);
    if (!valid.length) return null;
    const best = Math.min(...valid.map(r => r.ms));
    const avg  = Math.round(valid.reduce((s, r) => s + r.ms, 0) / valid.length);
    return { best, avg, count: valid.length, delta: avg - best };
  }, [rows]);

  // Set d'ids valides pour surlignage
  const validIds = useMemo(() => {
    return new Set(rows.filter(r => r.value.trim() && parseTimeLocal(r.value) !== null).map(r => r.id));
  }, [rows]);

  const filledIds = useMemo(() => {
    return new Set(rows.filter(r => r.value.trim()).map(r => r.id));
  }, [rows]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, zIndex:400,
        background:"rgba(9,9,14,0.82)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"16px",
      }}
    >
      <div style={{
        background:C.card, border:`1px solid ${C.border}`,
        borderRadius:12, width:"100%", maxWidth:440,
        maxHeight:"90vh", display:"flex", flexDirection:"column",
        fontFamily:"'Inter',system-ui,sans-serif", color:C.text,
        boxShadow:`0 0 40px rgba(0,0,0,0.6)`,
      }}>

        {/* En-tête */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:`1px solid ${C.border}`,
          flexShrink:0,
        }}>
          <div>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"1.25rem", fontWeight:700, color:C.text }}>
              ⌀ Calculateur de moyenne
            </div>
            <div style={{ color:C.soft, fontSize:"0.7rem", marginTop:2 }}>
              Format : <code style={{ color:C.text }}>MM:SS,mmm</code> — ex: <code style={{ color:C.text }}>01:23,456</code>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"transparent", border:`1px solid ${C.border}`,
            color:C.soft, width:30, height:30, borderRadius:6,
            cursor:"pointer", fontSize:"1rem", display:"flex",
            alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>✕</button>
        </div>

        {/* Résultats — toujours visibles */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          gap:1, background:C.border,
          borderBottom:`1px solid ${C.border}`,
          flexShrink:0,
        }}>
          {[
            { label:"Meilleur",  value: stats ? formatMs(stats.best)  : "–", color: C.gold   },
            { label:"Moyenne",   value: stats ? formatMs(stats.avg)   : "–", color: C.text   },
            { label:"Écart moy", value: stats ? formatDelta(stats.delta) : "–", color: C.soft },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background:C.bg, padding:"12px 14px", textAlign:"center",
            }}>
              <div style={{ color:C.soft, fontSize:"0.6rem", letterSpacing:"0.15em",
                fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>
                {label}
              </div>
              <div style={{
                fontFamily:"'Rajdhani',sans-serif", fontSize:"1.1rem",
                fontWeight:700, color, fontVariantNumeric:"tabular-nums",
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
        {stats && (
          <div style={{
            background:"#09090E", borderBottom:`1px solid ${C.border}`,
            padding:"6px 14px", textAlign:"center",
            color:C.soft, fontSize:"0.7rem", flexShrink:0,
          }}>
            {stats.count} temps valide{stats.count > 1 ? "s" : ""} sur {rows.length}
          </div>
        )}

        {/* Lignes de saisie */}
        <div style={{ overflowY:"auto", padding:"16px 20px", flexGrow:1 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {rows.map((row, i) => {
              const filled  = filledIds.has(row.id);
              const isValid = validIds.has(row.id);
              const isInvalid = filled && !isValid;
              return (
                <div key={row.id} style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{
                    color:C.soft, fontSize:"0.72rem", fontWeight:600,
                    width:20, textAlign:"right", flexShrink:0,
                  }}>
                    {i + 1}
                  </div>
                  <input
                    value={row.value}
                    onChange={e => updateRow(row.id, e.target.value)}
                    placeholder="01:23,456"
                    style={{
                      flex:1,
                      background: isInvalid ? `${C.accent}12` : "#09090E",
                      border:`1px solid ${isInvalid ? C.accent : isValid ? C.accent + "55" : C.border}`,
                      borderRadius:6, padding:"9px 12px",
                      color: isInvalid ? C.accent : C.text,
                      fontSize:"0.9rem", outline:"none",
                      fontFamily:"'Rajdhani',sans-serif",
                      fontVariantNumeric:"tabular-nums",
                      letterSpacing:"0.04em",
                      transition:"border-color 0.15s, background 0.15s",
                    }}
                  />
                  <button
                    onClick={() => removeRow(row.id)}
                    title="Supprimer"
                    style={{
                      background:"transparent", border:`1px solid ${C.border}`,
                      color:C.soft, width:30, height:30, borderRadius:6,
                      cursor:"pointer", fontSize:"0.85rem", flexShrink:0,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}
                  >✕</button>
                </div>
              );
            })}
          </div>

          <button onClick={addRow} style={{
            marginTop:12, width:"100%",
            background:"transparent", border:`1px dashed ${C.border}`,
            color:C.soft, padding:"9px",
            borderRadius:6, cursor:"pointer", fontSize:"0.82rem",
            transition:"border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.soft; }}
          >
            + Ajouter un temps
          </button>
        </div>

        {/* Pied */}
        <div style={{
          padding:"12px 20px", borderTop:`1px solid ${C.border}`,
          display:"flex", justifyContent:"flex-end", flexShrink:0,
        }}>
          <button onClick={reset} style={{
            background:"transparent", border:`1px solid ${C.border}`,
            color:C.soft, padding:"8px 16px", borderRadius:6,
            cursor:"pointer", fontSize:"0.8rem",
          }}>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
