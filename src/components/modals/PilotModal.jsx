import { useState } from "react";
import { C } from "../../config.js";
import { useAuthContext } from "../../auth/AuthProvider.jsx";

export function PilotModal({ onClose }) {
  const { signIn, signUp } = useAuthContext();
  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo]   = useState("");
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);

  async function submit() {
    setError("");
    if (!email.trim() || !password) { setError("Email et mot de passe requis."); return; }
    if (mode === "signup" && !pseudo.trim()) { setError("Pseudo requis."); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email.trim(), password, pseudo.trim());
      } else {
        await signIn(email.trim(), password);
      }
      onClose();
    } catch (e) {
      setError(e.message || "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 32px", width: 320, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ color: C.soft, fontSize: "0.65rem", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 4 }}>
              {mode === "login" ? "CONNEXION" : "INSCRIPTION"}
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#FFF" }}>
              👤 {mode === "login" ? "Se connecter" : "Créer un compte"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.soft, width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {mode === "signup" && (
          <input
            value={pseudo} onChange={e => setPseudo(e.target.value)}
            placeholder="Ton pseudo..." autoFocus
            style={{ width: "100%", boxSizing: "border-box", background: "#09090E", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: "1rem", outline: "none", marginBottom: 10 }}
          />
        )}
        <input
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" type="email" autoFocus={mode === "login"}
          style={{ width: "100%", boxSizing: "border-box", background: "#09090E", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: "1rem", outline: "none", marginBottom: 10 }}
        />
        <input
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Mot de passe" type="password"
          style={{ width: "100%", boxSizing: "border-box", background: "#09090E", border: `1px solid ${C.accent}`, borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: "1rem", outline: "none", marginBottom: 12 }}
        />
        {error && <p style={{ color: C.accent, fontSize: "0.75rem", margin: "0 0 12px" }}>⚠ {error}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit} disabled={busy} style={{ flex: 1, background: C.accent, border: "none", color: "#fff", padding: "9px", borderRadius: 6, cursor: busy ? "default" : "pointer", fontSize: "0.9rem", fontWeight: 600, opacity: busy ? 0.6 : 1 }}>
            {busy ? "..." : (mode === "login" ? "Connexion" : "Créer le compte")}
          </button>
        </div>
        <button
          onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(""); }}
          style={{ background: "transparent", border: "none", color: C.soft, fontSize: "0.75rem", marginTop: 12, cursor: "pointer", textDecoration: "underline", width: "100%" }}
        >
          {mode === "login" ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
