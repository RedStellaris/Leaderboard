import { useEffect, useState } from "react";
import { C, XP_CATEGORIES } from "../../config.js";
import { supabase } from "../../auth/supabaseClient.js";
import { useAuthContext } from "../../auth/AuthProvider.jsx";

export function XpAwardPanel({ onClose }) {
  const { profile } = useAuthContext(); // profile.id = awarded_by
  const [pilots,   setPilots]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [pilotId,  setPilotId]  = useState("");
  const [category, setCategory] = useState("");        // "" = attribution libre
  const [amount,   setAmount]   = useState("");
  const [reason,   setReason]   = useState("");
  const [status,   setStatus]   = useState(null);       // { type: "ok"|"err", msg }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("profiles")
      .select("id, pseudo")
      .order("pseudo", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error) setPilots(data || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function selectCategory(catKey) {
    setCategory(catKey);
    const cat = XP_CATEGORIES.find(c => c.key === catKey);
    if (cat) setAmount(String(cat.amount));
  }

  async function submit() {
    setStatus(null);
    const amountNum = parseInt(amount, 10);
    if (!pilotId)                    { setStatus({ type: "err", msg: "Choisis un pilote." }); return; }
    if (!Number.isFinite(amountNum) || amountNum === 0) {
      setStatus({ type: "err", msg: "Montant invalide." }); return;
    }
    if (!category && !reason.trim()) {
      setStatus({ type: "err", msg: "Motif requis pour une attribution libre." }); return;
    }
    if (!profile?.id) { setStatus({ type: "err", msg: "Session admin introuvable." }); return; }

    setSubmitting(true);
    const { error } = await supabase.from("xp_log").insert({
      pilot_id:   pilotId,
      amount:     amountNum,
      category:   category || null,
      reason:     category ? (reason.trim() || null) : reason.trim(),
      awarded_by: profile.id,
    });
    setSubmitting(false);

    if (error) {
      setStatus({ type: "err", msg: `Échec : ${error.message}` });
      return;
    }
    setStatus({ type: "ok", msg: "XP attribué." });
    setAmount(""); setReason(""); setCategory("");
  }

  const inputStyle = {
    width: "100%", background: C.row, border: `1px solid ${C.border}`, color: C.text,
    padding: "9px 10px", borderRadius: 6, fontSize: "0.85rem", boxSizing: "border-box",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, width: "100%", maxWidth: 400 }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#FFF", marginBottom: 16 }}>
          🎖 Attribuer de l'XP
        </div>

        {/* Pilote */}
        <label style={{ fontSize: "0.7rem", color: C.soft, display: "block", marginBottom: 4 }}>Pilote</label>
        <select value={pilotId} onChange={e => setPilotId(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} disabled={loading}>
          <option value="">{loading ? "Chargement…" : "— Choisir —"}</option>
          {pilots.map(p => <option key={p.id} value={p.id}>{p.pseudo}</option>)}
        </select>

        {/* Catégories fixes, si définies dans config.js */}
        {XP_CATEGORIES.length > 0 && (
          <>
            <label style={{ fontSize: "0.7rem", color: C.soft, display: "block", marginBottom: 6 }}>Catégorie</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {XP_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => selectCategory(cat.key)}
                  style={{
                    background: category === cat.key ? C.accentDim : "transparent",
                    border: `1px solid ${category === cat.key ? C.accent : C.border}`,
                    color: C.text, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem",
                  }}
                >
                  {cat.label} (+{cat.amount})
                </button>
              ))}
              <button
                onClick={() => setCategory("")}
                style={{
                  background: category === "" ? C.accentDim : "transparent",
                  border: `1px solid ${category === "" ? C.accent : C.border}`,
                  color: C.soft, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem",
                }}
              >
                Libre
              </button>
            </div>
          </>
        )}

        {/* Montant */}
        <label style={{ fontSize: "0.7rem", color: C.soft, display: "block", marginBottom: 4 }}>Montant XP</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} placeholder="ex : 20 ou -10" />

        {/* Motif */}
        <label style={{ fontSize: "0.7rem", color: C.soft, display: "block", marginBottom: 4 }}>
          Motif {category ? "(optionnel)" : "(requis en attribution libre)"}
        </label>
        <input type="text" value={reason} onChange={e => setReason(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} placeholder="ex : dépassement propre en P3" />

        {status && (
          <div style={{ fontSize: "0.78rem", color: status.type === "ok" ? "#4ade80" : C.accent, marginBottom: 12 }}>
            {status.msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, color: C.soft, padding: "9px 0", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
            Fermer
          </button>
          <button onClick={submit} disabled={submitting} style={{ flex: 1, background: C.accentDim, border: `1px solid ${C.accent}`, color: "#fff", padding: "9px 0", borderRadius: 6, cursor: submitting ? "default" : "pointer", fontSize: "0.82rem", fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "…" : "Attribuer"}
          </button>
        </div>
      </div>
    </div>
  );
}
