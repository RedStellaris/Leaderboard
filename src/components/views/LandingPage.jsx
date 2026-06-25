import { LOGO, CHAMPIONSHIP_NAME, CHAMPIONSHIP_SEASON, DISCORD_URL, C } from "../../config.js";

export function LandingPage({ champion, onEnter }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',system-ui,sans-serif",
      color: C.text, overflow: "hidden",
    }}>
      <style>{`
        @keyframes drawLine { from { width: 0; opacity: 0; } to { width: 80px; opacity: 1; } }
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .land-logo  { animation: fadeUp 0.45s ease-out 0s    both; }
        .land-title { animation: fadeUp 0.45s ease-out 0.12s both; }
        .land-line  { animation: drawLine 0.5s ease-out 0.35s both; }
        .land-champ { animation: fadeUp 0.45s ease-out 0.28s both; }
        .land-btns  { animation: fadeUp 0.45s ease-out 0.42s both; }
        .land-enter:hover   { opacity: 0.82 !important; }
        .land-discord:hover { border-color: #5865F2 !important; color: #5865F2 !important; }
      `}</style>

      {/* Kerb stripes */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(-20deg, transparent, transparent 18px, rgba(196,18,48,0.045) 18px, rgba(196,18,48,0.045) 20px)`,
      }} />

      {/* Liseré rouge haut */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent 0%, ${C.accent} 25%, ${C.accent} 75%, transparent 100%)`,
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "32px 24px", maxWidth: 420, width: "100%", textAlign: "center",
      }}>
        {/* Logo */}
        <div className="land-logo" style={{ marginBottom: 28 }}>
          <img src={LOGO} alt="logo" style={{
            width: 88, height: 88, borderRadius: "50%", objectFit: "cover",
            border: `2px solid ${C.border}`,
            boxShadow: `0 0 52px ${C.accent}3A, 0 0 18px ${C.accent}1A`,
          }} />
        </div>

        {/* Nom du championnat */}
        <div className="land-title" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.28em", color: C.soft, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
            {CHAMPIONSHIP_SEASON}
          </div>
          <h1 style={{ margin: "0 0 14px", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 9vw, 3rem)", fontWeight: 700, letterSpacing: "0.04em", color: C.text, lineHeight: 1.0 }}>
            {CHAMPIONSHIP_NAME}
          </h1>
          <div className="land-line" style={{ height: 2, background: C.accent, margin: "0 auto", display: "block", borderRadius: 1 }} />
        </div>

        {/* Champion en titre */}
        {champion && (
          <div className="land-champ" style={{
            background: `linear-gradient(135deg, ${C.card} 0%, #17100A 100%)`,
            border: `1px solid ${C.gold}50`, borderRadius: 10,
            padding: "14px 28px", width: "100%", boxSizing: "border-box", marginBottom: 28,
          }}>
            <div style={{ color: C.gold, fontSize: "0.58rem", letterSpacing: "0.22em", fontWeight: 700, marginBottom: 5, textTransform: "uppercase" }}>🏆 Champion en titre</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "1.8rem", fontWeight: 700, color: C.gold, letterSpacing: "0.02em" }}>{champion}</div>
          </div>
        )}

        {/* Boutons */}
        <div className="land-btns" style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button className="land-enter" onClick={onEnter} style={{
            background: C.accent, border: "none", color: "#fff", padding: "13px",
            borderRadius: 7, cursor: "pointer", fontSize: "0.88rem", fontWeight: 700,
            letterSpacing: "0.12em", fontFamily: "'Rajdhani', sans-serif",
            textTransform: "uppercase", transition: "opacity 0.15s",
          }}>
            Entrer dans le classement ›
          </button>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="land-discord" style={{
            display: "block", background: "transparent",
            border: `1px solid ${C.border}`, color: C.soft,
            padding: "11px", borderRadius: 7, textDecoration: "none",
            fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.04em",
            transition: "border-color 0.15s, color 0.15s",
          }}>
            💬 Rejoindre le Discord
          </a>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 18, color: `${C.soft}70`, fontSize: "0.6rem", letterSpacing: "0.15em" }}>
        classement-ten.vercel.app
      </div>
    </div>
  );
}
