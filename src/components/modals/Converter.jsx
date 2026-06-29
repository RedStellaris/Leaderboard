import { useState } from "react";
import { C } from "../../config.js";

export function Converter({ onClose }) {
  const [mmss, setMmss] = useState("");
  const [sss,  setSss]  = useState("");
  const [err,  setErr]  = useState("");

  function toTotalMs(str) {
    const m = str.trim().match(/^(\d{1,2}):(\d{2}),(\d{1,3})$/);
    if (!m) return null;
    const [, mm, ss, dec] = m;
    return parseInt(mm) * 60000 + parseInt(ss) * 1000 + parseInt(dec.padEnd(3, "0"));
  }
  function fromTotalMs(ms) {
    const mm = Math.floor(ms / 60000), ss = Math.floor((ms % 60000) / 1000), dec = ms % 1000;
    return {
      mmss: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")},${String(dec).padStart(3, "0")}`,
      sss:  `${Math.floor(ms / 1000)},${String(dec).padStart(3, "0")}`,
    };
  }
  function handleMmss(val) {
    setMmss(val); setErr("");
    const ms = toTotalMs(val);
    if (ms !== null) setSss(fromTotalMs(ms).sss);
    else if (val && !val.match(/^[\d:,]*$/)) setErr("Format attendu : mm:ss,cc");
    else setSss("");
  }
  function handleSss(val) {
    setSss(val); setErr("");
    const m = val.trim().match(/^(\d+),(\d{1,3})$/);
    if (m) { const [, s, dec] = m; const ms = parseInt(s) * 1000 + parseInt(dec.padEnd(3, "0")); setMmss(fromTotalMs(ms).mmss); }
    else if (val && !val.match(/^[\d,]*$/)) setErr("Format attendu : sss,cc");
    else setMmss("");
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: "#09090E",
    border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px",
    color: C.gold, fontFamily: "'Courier New',monospace", fontSize: "1.2rem",
    fontWeight: 700, outline: "none", letterSpacing: "0.05em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 32px", width: 340, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ color: C.soft, fontSize: "0.65rem", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 4 }}>OUTIL</div>
            <h2 style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#FFF" }}>⏱ Convertisseur</h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: C.soft, fontSize: "0.72rem", letterSpacing: "0.1em", fontWeight: 700, display: "block", marginBottom: 6 }}>FORMAT mm:ss,cc</label>
          <input value={mmss} onChange={e => handleMmss(e.target.value)} placeholder="01:23,456" style={inputStyle} />
        </div>
        <div style={{ textAlign: "center", color: C.soft, fontSize: "1.2rem", marginBottom: 16 }}>⇅</div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: C.soft, fontSize: "0.72rem", letterSpacing: "0.1em", fontWeight: 700, display: "block", marginBottom: 6 }}>FORMAT sss,cc</label>
          <input value={sss} onChange={e => handleSss(e.target.value)} placeholder="83,456" style={inputStyle} />
        </div>
        {err && <p style={{ color: C.accent, fontSize: "0.75rem", margin: "0 0 12px", textAlign: "center" }}>⚠ {err}</p>}
        <p style={{ color: C.soft, fontSize: "0.7rem", margin: 0, textAlign: "center" }}>Exemple : 01:23,456 ↔ 83,456</p>
      </div>
    </div>
  );
}
