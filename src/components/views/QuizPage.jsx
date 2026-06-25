import { useState, useEffect } from "react";
import { C, QUIZ_MAX_ATTEMPTS, QUIZ_BLOCK_MS, QUIZ_QUESTIONS_BASE } from "../../config.js";

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizPage({ onPass, onSavePilot }) {
  const [questions] = useState(() =>
    shuffleArr(QUIZ_QUESTIONS_BASE).map(q => ({ ...q, options: shuffleArr(q.options) }))
  );
  const [answers,      setAnswers]      = useState({});
  const [wrongIds,     setWrongIds]     = useState([]);
  const [pilotName,    setPilotName]    = useState(() => {
    try { return localStorage.getItem("leaderboard_myPilot") || ""; } catch { return ""; }
  });
  const [phase,        setPhase]        = useState(() => {
    try {
      const b = parseInt(localStorage.getItem("quiz_block_until") || "0");
      return b > Date.now() ? "blocked" : "quiz";
    } catch { return "quiz"; }
  });
  const [blockSecs,    setBlockSecs]    = useState(() => {
    try {
      const b = parseInt(localStorage.getItem("quiz_block_until") || "0");
      return Math.max(0, Math.ceil((b - Date.now()) / 1000));
    } catch { return 0; }
  });
  const [attemptsLeft, setAttemptsLeft] = useState(() => {
    try {
      const used = parseInt(localStorage.getItem("quiz_attempts") || "0");
      return Math.max(0, QUIZ_MAX_ATTEMPTS - used);
    } catch { return QUIZ_MAX_ATTEMPTS; }
  });
  const [stay, setStay] = useState(true);

  // Compte à rebours blocage
  useEffect(() => {
    if (phase !== "blocked") return;
    const id = setInterval(() => {
      try {
        const b   = parseInt(localStorage.getItem("quiz_block_until") || "0");
        const rem = Math.ceil((b - Date.now()) / 1000);
        if (rem <= 0) {
          localStorage.removeItem("quiz_block_until");
          localStorage.setItem("quiz_attempts", "0");
          setPhase("quiz");
          setAttemptsLeft(QUIZ_MAX_ATTEMPTS);
          setBlockSecs(0);
          setWrongIds([]);
        } else {
          setBlockSecs(rem);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  function handleSelect(qId, idx) {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
    setWrongIds(prev => prev.filter(id => id !== qId));
  }

  function handleSubmit() {
    const wrong = questions
      .filter(q => answers[q.id] === undefined || !q.options[answers[q.id]]?.correct)
      .map(q => q.id);

    if (wrong.length === 0) {
      if (pilotName.trim()) onSavePilot(pilotName.trim());
      setPhase("passed");
    } else {
      setWrongIds(wrong);
      try {
        const used = parseInt(localStorage.getItem("quiz_attempts") || "0") + 1;
        localStorage.setItem("quiz_attempts", String(used));
        const left = QUIZ_MAX_ATTEMPTS - used;
        if (left <= 0) {
          const blockUntil = Date.now() + QUIZ_BLOCK_MS;
          localStorage.setItem("quiz_block_until", String(blockUntil));
          setBlockSecs(Math.ceil(QUIZ_BLOCK_MS / 1000));
          setPhase("blocked");
        } else {
          setAttemptsLeft(left);
        }
      } catch {}
    }
  }

  function handleEnter() {
    try {
      if (stay) localStorage.setItem("quiz_passed", "true");
      localStorage.removeItem("quiz_attempts");
    } catch {}
    onPass();
  }

  function fmtTime(secs) {
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  }

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  // ── Écran : Bloqué ──────────────────────────────────────────────────────────
  if (phase === "blocked") return (
    <div style={{
      position:"fixed", inset:0, background:C.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Inter',system-ui,sans-serif", color:C.text,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg, transparent, ${C.accent}, transparent)` }} />
      <div style={{
        background:C.card, border:`1px solid ${C.accent}44`,
        borderRadius:12, padding:"48px 40px",
        maxWidth:360, width:"100%", boxSizing:"border-box", textAlign:"center",
      }}>
        <div style={{ fontSize:"2.8rem", marginBottom:16 }}>🔒</div>
        <div style={{ color:C.accent, fontSize:"0.62rem", letterSpacing:"0.22em",
          fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>
          Accès temporairement bloqué
        </div>
        <div style={{
          fontFamily:"'Rajdhani',sans-serif", fontSize:"4.5rem", fontWeight:700,
          color:C.accent, lineHeight:1, marginBottom:12, fontVariantNumeric:"tabular-nums",
        }}>
          {fmtTime(blockSecs)}
        </div>
        <p style={{ color:C.soft, fontSize:"0.82rem", margin:0, lineHeight:1.6 }}>
          Trop de tentatives incorrectes.<br />
          Réessayez dans {Math.ceil(blockSecs / 60)} minute{blockSecs > 60 ? "s" : ""}.
        </p>
      </div>
    </div>
  );

  // ── Écran : Réussi ──────────────────────────────────────────────────────────
  if (phase === "passed") return (
    <div style={{
      position:"fixed", inset:0, background:C.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Inter',system-ui,sans-serif", color:C.text,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg, transparent, ${C.accent}, transparent)` }} />
      <div style={{
        background:C.card, border:`1px solid ${C.border}`,
        borderRadius:12, padding:"40px",
        maxWidth:380, width:"100%", boxSizing:"border-box", textAlign:"center",
        boxShadow:`0 0 48px ${C.accent}1A`,
      }}>
        <div style={{ fontSize:"2.5rem", marginBottom:10 }}>✅</div>
        <div style={{ color:C.soft, fontSize:"0.62rem", letterSpacing:"0.22em",
          fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>
          Accès accordé
        </div>
        <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"2rem",
          fontWeight:700, margin:"0 0 28px", color:C.text }}>
          Bienvenue !
        </h2>
        <label style={{
          display:"flex", alignItems:"center", gap:12,
          background:"#09090E", border:`1px solid ${C.border}`,
          borderRadius:8, padding:"13px 16px",
          cursor:"pointer", marginBottom:20, textAlign:"left",
        }}>
          <input type="checkbox" checked={stay} onChange={e => setStay(e.target.checked)}
            style={{ accentColor:C.accent, width:16, height:16, flexShrink:0, cursor:"pointer" }} />
          <div>
            <div style={{ color:C.text, fontSize:"0.87rem", fontWeight:600, marginBottom:2 }}>
              Rester connecté
            </div>
            <div style={{ color:C.soft, fontSize:"0.72rem" }}>
              Ne plus afficher ce quiz sur cet appareil
            </div>
          </div>
        </label>
        <button onClick={handleEnter} style={{
          width:"100%", background:C.accent, border:"none",
          color:"#fff", padding:"13px", borderRadius:7, cursor:"pointer",
          fontSize:"0.88rem", fontWeight:700, letterSpacing:"0.12em",
          fontFamily:"'Rajdhani',sans-serif", textTransform:"uppercase",
        }}>
          Entrer dans le classement ›
        </button>
      </div>
    </div>
  );

  // ── Écran : Quiz ────────────────────────────────────────────────────────────
  return (
    <div style={{
      position:"fixed", inset:0, background:C.bg, overflowY:"auto",
      display:"flex", flexDirection:"column", alignItems:"center",
      fontFamily:"'Inter',system-ui,sans-serif", color:C.text, padding:"40px 16px",
    }}>
      {/* Kerb stripes */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`repeating-linear-gradient(-20deg, transparent, transparent 18px,
          rgba(196,18,48,0.04) 18px, rgba(196,18,48,0.04) 20px)` }} />
      {/* Liseré rouge haut */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:3, zIndex:1,
        background:`linear-gradient(90deg, transparent, ${C.accent}, transparent)` }} />

      <div style={{ position:"relative", zIndex:2, maxWidth:480, width:"100%", paddingBottom:32 }}>

        {/* En-tête */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ color:C.soft, fontSize:"0.62rem", letterSpacing:"0.28em",
            fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>
            Vérification d'accès
          </div>
          <h1 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"1.8rem",
            fontWeight:700, margin:"0 0 6px", color:C.text }}>
            Quiz AMCR
          </h1>
          <div style={{ color:C.soft, fontSize:"0.78rem" }}>
            Réponds correctement pour accéder au classement
          </div>
        </div>

        {/* Questions obligatoires */}
        {questions.map((q, qi) => {
          const isWrong = wrongIds.includes(q.id);
          return (
            <div key={q.id} style={{
              background:C.card, border:`1px solid ${isWrong ? C.accent + "66" : C.border}`,
              borderRadius:10, padding:"20px", marginBottom:16, transition:"border-color 0.2s",
            }}>
              <div style={{ color:C.soft, fontSize:"0.62rem", letterSpacing:"0.15em",
                fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>
                Question {qi + 1}/{questions.length}
              </div>
              <div style={{ color:C.text, fontSize:"0.95rem", fontWeight:600, marginBottom:14 }}>
                {q.question}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {q.options.map((opt, idx) => {
                  const selected = answers[q.id] === idx;
                  const badPick  = isWrong && selected;
                  return (
                    <button key={idx} onClick={() => handleSelect(q.id, idx)} style={{
                      background: badPick ? `${C.accent}20` : selected ? `${C.accent}14` : "#09090E",
                      border:`1px solid ${badPick ? C.accent : selected ? C.accent + "77" : C.border}`,
                      borderRadius:7, padding:"11px 14px",
                      color: badPick ? C.accent : selected ? C.text : C.soft,
                      cursor:"pointer", fontSize:"0.85rem",
                      textAlign:"left", fontWeight: selected ? 600 : 400, transition:"all 0.15s",
                    }}>
                      {badPick && <span style={{ marginRight:8 }}>✗</span>}
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {isWrong && (
                <p style={{ color:C.accent, fontSize:"0.72rem", margin:"10px 0 0", fontWeight:600 }}>
                  ✗ Mauvaise réponse — réessaie
                </p>
              )}
            </div>
          );
        })}

        {/* Q3 — Pseudo pilote (optionnel) */}
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:10, padding:"20px", marginBottom:20,
        }}>
          <div style={{ color:C.soft, fontSize:"0.62rem", letterSpacing:"0.15em",
            fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>
            Question bonus <span style={{ fontWeight:400, opacity:0.7 }}>(optionnel)</span>
          </div>
          <div style={{ color:C.text, fontSize:"0.95rem", fontWeight:600, marginBottom:14 }}>
            Quel est ton pseudo sur le classement ?
          </div>
          <input
            value={pilotName} onChange={e => setPilotName(e.target.value)}
            placeholder="Exactement comme sur le leaderboard…"
            style={{
              width:"100%", boxSizing:"border-box",
              background:"#09090E", border:`1px solid ${C.border}`,
              borderRadius:7, padding:"11px 14px",
              color:C.text, fontSize:"0.875rem", outline:"none", fontFamily:"inherit",
            }}
          />
          <p style={{ color:C.soft, fontSize:"0.7rem", margin:"8px 0 0" }}>
            Sera utilisé pour te mettre en surbrillance dans les tableaux.
          </p>
        </div>

        {/* Bandeau erreurs */}
        {wrongIds.length > 0 && (
          <div style={{
            background:`${C.accent}12`, border:`1px solid ${C.accent}44`,
            borderRadius:8, padding:"11px 16px", marginBottom:16,
            color:C.accent, fontSize:"0.82rem", fontWeight:600,
          }}>
            ✗ {wrongIds.length} réponse{wrongIds.length > 1 ? "s" : ""} incorrecte{wrongIds.length > 1 ? "s" : ""} —{" "}
            {attemptsLeft} tentative{attemptsLeft > 1 ? "s" : ""} restante{attemptsLeft > 1 ? "s" : ""}
          </div>
        )}

        {/* Bouton valider */}
        <button onClick={handleSubmit} disabled={!allAnswered} style={{
          width:"100%",
          background: allAnswered ? C.accent : C.card,
          border:`1px solid ${allAnswered ? C.accent : C.border}`,
          color: allAnswered ? "#fff" : C.soft,
          padding:"14px", borderRadius:7,
          cursor: allAnswered ? "pointer" : "not-allowed",
          fontSize:"0.9rem", fontWeight:700, letterSpacing:"0.12em",
          fontFamily:"'Rajdhani',sans-serif", textTransform:"uppercase", transition:"all 0.2s",
        }}>
          Valider ›
        </button>
      </div>
    </div>
  );
}
