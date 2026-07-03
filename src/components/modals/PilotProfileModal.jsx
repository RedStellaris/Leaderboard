import { useEffect, useState } from "react";
import { C, XP_TIERS, resolveXpTier, nextXpTier } from "../../config.js";
import { supabase } from "../../auth/supabaseClient.js";

// ── Overlay générique, cohérent avec Converter / AvgCalculator ──────────────
function ModalShell({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 24, width: "100%", maxWidth: 360,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Props:
 * - profile: { id, pseudo, ... } (depuis useAuthContext)
 * - pilotStats: { ecurie, avg } | null (déjà calculé dans App.jsx)
 * - cumulated: string | null (temps cumulé formaté, à calculer en amont — voir patch App.jsx)
 * - onClose: () => void
 * - onLogout: () => void  (réutilise le handleLogout existant d'App.jsx)
 */
export function PilotProfileModal({ profile, pilotStats, cumulated, onClose, onLogout }) {
  const [xp, setXp]     = useState(null);   // null = chargement
  const [xpErr, setXpErr] = useState(false);

  useEffect(() => {
    let active = true;
    if (!profile?.id) { setXp(0); return; }
    supabase
      .from("pilot_xp")
      .select("total_xp")
      .eq("pilot_id", profile.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) { setXpErr(true); setXp(0); return; }
        setXp(data?.total_xp ?? 0);
      });
    return () => { active = false; };
  }, [profile?.id]);

  const tier      = xp !== null ? resolveXpTier(xp) : XP_TIERS[0];
  const next      = xp !== null ? nextXpTier(xp) : null;
  const progress  = next ? Math.min(100, Math.round(((xp - tier.min) / (next.min - tier.min)) * 100)) : 100;

  return (
    <ModalShell onClose={onClose}>
      {/* En-tête pilote */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: "0.65rem", color: C.soft, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 4 }}>
          {pilotStats?.ecurie || "PILOTE"}
        </div>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#FFF" }}>
          {profile?.pseudo || "—"}
        </div>
      </div>

      {/* Temps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: C.row, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "0.62rem", color: C.soft, marginBottom: 4 }}>MOYENNE</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.95rem", color: C.text }}>
            {pilotStats?.avg || "—"}
          </div>
        </div>
        <div style={{ background: C.row, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "0.62rem", color: C.soft, marginBottom: 4 }}>CUMULÉ</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.95rem", color: C.text }}>
            {cumulated || "—"}
          </div>
        </div>
      </div>

      {/* Badge de grade */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <img
          src={tier.badge}
          alt={tier.name}
          style={{ width: 64, height: 64, objectFit: "contain" }}
          onError={e => { e.currentTarget.style.visibility = "hidden"; }}
        />
      </div>

      {/* Barre XP */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: C.gold, fontSize: "1rem" }}>
            {tier.name}
          </span>
          <span style={{ fontSize: "0.75rem", color: C.soft, fontFamily: "monospace" }}>
            {xp === null ? "…" : `${xp} XP`}
          </span>
        </div>
        <div style={{ background: C.row, borderRadius: 4, height: 8, overflow: "hidden" }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: `linear-gradient(to right, ${C.accentDim}, ${C.gold})`,
            borderRadius: 4, transition: "width 0.4s ease",
          }} />
        </div>
        {next && xp !== null && (
          <div style={{ fontSize: "0.68rem", color: C.soft, marginTop: 5, textAlign: "right" }}>
            {next.min - xp} XP avant {next.name}
          </div>
        )}
        {xpErr && (
          <div style={{ fontSize: "0.68rem", color: C.accent, marginTop: 5 }}>
            XP indisponible pour le moment.
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
        <button onClick={onClose} style={{
          flex: 1, background: "transparent", border: `1px solid ${C.border}`, color: C.soft,
          padding: "9px 0", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
        }}>
          Fermer
        </button>
        <button onClick={onLogout} style={{
          flex: 1, background: C.accentDim, border: `1px solid ${C.accent}`, color: "#fff",
          padding: "9px 0", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
        }}>
          Déconnexion
        </button>
      </div>
    </ModalShell>
  );
}
