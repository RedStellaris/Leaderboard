import { C, LOGO, CHAMPIONSHIP_NAME, CHAMPIONSHIP_SEASON, DISCORD_URL } from "../../config.js";

// Carte podium individuelle
function PodiumCard({ rank, pilot }) {
  const cfg = {
    1: { bg: "#F5A62318", border: "#F5A62355", color: C.gold,    medal: "🥇", scale: true  },
    2: { bg: "#8899AA14", border: "#8899AA44", color: "#9BA8B2", medal: "🥈", scale: false },
    3: { bg: "#CD7F3214", border: "#CD7F3244", color: "#CD7F32", medal: "🥉", scale: false },
  }[rank];

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: cfg.scale ? "16px 12px 14px" : "12px 10px 10px",
      flex: cfg.scale ? "0 0 36%" : "0 0 28%",
      textAlign: "center",
      alignSelf: cfg.scale ? "flex-start" : "flex-end",
      marginBottom: cfg.scale ? 0 : 8,
    }}>
      <div style={{ fontSize: cfg.scale ? "1.5rem" : "1.1rem", marginBottom: 6 }}>{cfg.medal}</div>
      <div style={{
        fontFamily: "'Rajdhani',sans-serif",
        fontSize: cfg.scale ? "1.05rem" : "0.88rem",
        fontWeight: 700, color: cfg.color,
        lineHeight: 1.2, marginBottom: 4,
        wordBreak: "break-word",
      }}>{pilot.pilote}</div>
      <div style={{
        fontSize: cfg.scale ? "0.82rem" : "0.72rem",
        color: cfg.color, opacity: 0.85,
        fontFamily: "'Courier New',monospace", fontWeight: 700,
      }}>{pilot.points} pts</div>
    </div>
  );
}

export function LandingPage({ champion, onEnter, top3, stats }) {
  const showPodium = top3 && top3.length >= 2;

  return (
    <div style={{
      position: "fixed", inset: 0, background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',system-ui,sans-serif",
      color: C.text, overflow: "hidden",
      animation: "pageIn 0.3s ease-out",
    }}>
      <style>{`
        @keyframes pageIn   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes drawLine { from { width:0; opacity:0; } to { width:80px; opacity:1; } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
        .land-logo    { animation: fadeUp 0.45s ease-out 0s both; }
        .land-title   { animation: fadeUp 0.45s ease-out 0.12s both; }
        .land-line    { animation: drawLine 0.5s ease-out 0.35s both; }
        .land-podium  { animation: fadeUp 0.45s ease-out 0.28s both; }
        .land-stats   { animation: fadeUp 0.45s ease-out 0.36s both; }
        .land-btns    { animation: fadeUp 0.45s ease-out 0.42s both; }
        .land-enter:hover   { opacity:0.82 !important; }
        .land-discord:hover { border-color:#5865F2 !important; color:#5865F2 !important; }
      `}</style>

      {/* Kerb stripes motorsport */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(
          -20deg, transparent, transparent 18px,
          rgba(196,18,48,0.045) 18px, rgba(196,18,48,0.045) 20px
        )`,
      }} />

      {/* Liseré rouge haut */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent 0%, ${C.accent} 25%, ${C.accent} 75%, transparent 100%)`,
      }} />

      {/* Contenu centré */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "32px 24px", maxWidth: 440, width: "100%", textAlign: "center",
      }}>

        {/* Logo */}
        <div className="land-logo" style={{ marginBottom: 24 }}>
          <img src={LOGO} alt="logo" style={{
            width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
            border: `2px solid ${C.border}`,
            boxShadow: `0 0 52px ${C.accent}3A, 0 0 18px ${C.accent}1A`,
          }} />
        </div>

        {/* Nom du championnat */}
        <div className="land-title" style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: "0.6rem", letterSpacing: "0.28em",
            color: C.soft, fontWeight: 700,
            textTransform: "uppercase", marginBottom: 10,
          }}>
            {CHAMPIONSHIP_SEASON}
          </div>
          <h1 style={{
            margin: "0 0 14px",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "clamp(2rem, 9vw, 3rem)",
            fontWeight: 700, letterSpacing: "0.04em",
            color: C.text, lineHeight: 1.0,
          }}>
            {CHAMPIONSHIP_NAME}
          </h1>
          <div className="land-line" style={{
            height: 2, background: C.accent,
            margin: "0 auto", display: "block", borderRadius: 1,
          }} />
        </div>

        {/* Podium animé (si ≥ 2 pilotes en courses) */}
        {showPodium && (
          <div className="land-podium" style={{
            width: "100%", marginBottom: 22,
            background: `linear-gradient(135deg, ${C.card} 0%, #0f0f18 100%)`,
            border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "14px 16px 12px",
            boxSizing: "border-box",
          }}>
            <div style={{
              color: C.soft, fontSize: "0.58rem",
              letterSpacing: "0.22em", fontWeight: 700,
              marginBottom: 12, textTransform: "uppercase",
            }}>🏆 Podium du championnat</div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "center" }}>
              {top3[1] && <PodiumCard rank={2} pilot={top3[1]} />}
              {top3[0] && <PodiumCard rank={1} pilot={top3[0]} />}
              {top3[2] && <PodiumCard rank={3} pilot={top3[2]} />}
            </div>
          </div>
        )}

        {/* Fallback : champion simple si pas assez de données courses */}
        {!showPodium && champion && (
          <div className="land-podium" style={{
            background: `linear-gradient(135deg, ${C.card} 0%, #17100A 100%)`,
            border: `1px solid ${C.gold}50`,
            borderRadius: 10, padding: "14px 28px",
            width: "100%", boxSizing: "border-box", marginBottom: 22,
          }}>
            <div style={{ color: C.gold, fontSize: "0.58rem", letterSpacing: "0.22em", fontWeight: 700, marginBottom: 5, textTransform: "uppercase" }}>
              🏆 Champion en titre
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "1.8rem", fontWeight: 700, color: C.gold, letterSpacing: "0.02em" }}>
              {champion}
            </div>
          </div>
        )}

        {/* Statistiques rapides */}
        {stats && stats.pilots > 0 && (
          <div className="land-stats" style={{
            display: "flex", width: "100%", marginBottom: 22,
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 10, overflow: "hidden",
          }}>
            {[
              { value: stats.pilots,   label: "Pilotes"  },
              { value: stats.sessions, label: "Sessions" },
              { value: stats.circuits, label: "Circuits" },
            ].map(({ value, label }, i, arr) => (
              <div key={label} style={{
                flex: 1, textAlign: "center",
                padding: "12px 8px",
                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{
                  fontFamily: "'Rajdhani',sans-serif",
                  fontSize: "1.7rem", fontWeight: 700,
                  color: C.text, lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontSize: "0.6rem", color: C.soft,
                  letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3,
                }}>{label}</div>
              </div>
            ))}
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

          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
             className="land-discord"
             style={{
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

      {/* URL bas de page */}
      <div style={{
        position: "absolute", bottom: 18,
        color: `${C.soft}70`, fontSize: "0.6rem", letterSpacing: "0.15em",
      }}>
        classement-ten.vercel.app
      </div>
    </div>
  );
}
