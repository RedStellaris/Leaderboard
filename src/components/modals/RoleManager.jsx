import { useEffect, useState } from "react";
import { C } from "../../config.js";
import { supabase } from "../../auth/supabaseClient.js";

const ROLES = ["pilote", "co_organisateur", "admin"];
const ROLE_LABELS = { pilote: "Pilote", co_organisateur: "Co-organisateur", admin: "Admin" };

export function RoleManager({ onClose }) {
  const [profiles, setProfiles] = useState(null);
  const [error,     setError]   = useState("");
  const [busyId,    setBusyId]  = useState(null);

  useEffect(() => {
    let active = true;
    supabase.from("profiles").select("*").order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setProfiles(data);
      });
    return () => { active = false; };
  }, []);

  async function changeRole(id, newRole) {
    setBusyId(id);
    setError("");
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
    }
    setBusyId(null);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 16 }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px", width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#FFF" }}>
            🔐 Gestion des rôles
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontSize: "1rem" }}>✕</button>
        </div>

        {error && <p style={{ color: C.accent, fontSize: "0.8rem", marginBottom: 12 }}>⚠ {error}</p>}
        {!profiles && !error && <p style={{ color: C.soft, fontSize: "0.85rem" }}>Chargement…</p>}

        {profiles && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: C.row, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.text, fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.pseudo}</div>
                  <div style={{ color: C.soft, fontSize: "0.72rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email}</div>
                </div>
                <select
                  value={p.role}
                  disabled={busyId === p.id}
                  onChange={e => changeRole(p.id, e.target.value)}
                  style={{ background: "#09090E", border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "6px 10px", fontSize: "0.8rem", cursor: busyId === p.id ? "wait" : "pointer" }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
