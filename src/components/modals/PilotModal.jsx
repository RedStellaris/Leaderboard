import { useState } from "react";
import { C } from "../../config.js";

export function PilotModal({ current, onSave, onClose }) {
  const [val, setVal] = useState(current || "");
  function save()  { onSave(val.trim()); onClose(); }
  function clear() { onSave(""); onClose(); }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 32px", width: 320, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ color: C.soft, fontSize: "0.65rem", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 4 }}>SURBRILLANCE</div>
            <h2 style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#FFF" }}>👤 Mon pilote</h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <p style={{ color: C.soft, fontSize: "0.8rem", margin: "0 0 16px" }}>Ton pseudo sera mis en évidence dans tous les tableaux.</p>
        <input
          value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && save()}
          placeholder="Ton pseudo exact..." autoFocus
          style={{ width: "100%", boxSizing: "border-box", background: "#09090E", border: `1px solid ${C.accent}`, borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: "1rem", outline: "none", marginBottom: 16 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save}  style={{ flex: 1, background: C.accent, border: "none", color: "#fff", padding: "9px", borderRadius: 6, cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>Confirmer</button>
          <button onClick={clear} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, padding: "9px 14px", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem" }}>Effacer</button>
        </div>
      </div>
    </div>
  );
}
