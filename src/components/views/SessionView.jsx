import { useState, useMemo } from "react";
import { C } from "../../config.js";
import { cumulativeRanking, pointsRanking } from "../../logic/ranking.js";
import { GlobalView } from "./GlobalView.jsx";
import { CourseView } from "./CourseView.jsx";

export function SessionView({ sessionData, isRace, myPilot, display, sessionLabel }) {
  const [activeTab, setActiveTab] = useState("global");
  const [sub, setSub]             = useState("cumul");

  const courses = useMemo(() => [...new Set(sessionData.map(d => d.course))], [sessionData]);
  const pilots  = useMemo(() => [...new Set(sessionData.map(d => d.pilote))], [sessionData]);
  const cumul   = useMemo(() => cumulativeRanking(sessionData, pilots, courses), [sessionData, pilots, courses]);
  const pts     = useMemo(() => pointsRanking(sessionData, pilots, courses),     [sessionData, pilots, courses]);

  return (
    <div>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, overflowX: "auto", marginBottom: 24 }}>
        <div style={{ display: "flex" }}>
          {["global", ...courses].map(tab => {
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: "transparent", border: "none",
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                color: active ? C.text : C.soft,
                padding: display ? "12px 20px" : "10px 16px",
                cursor: "pointer", fontSize: display ? "1rem" : "0.82rem",
                fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
              }}>
                {tab === "global" ? "🌍 Global" : tab}
              </button>
            );
          })}
        </div>
      </div>
      {activeTab === "global"
        ? <GlobalView sub={sub} setSub={setSub} cumul={cumul} pts={pts} courses={courses} data={sessionData} myPilot={myPilot} display={display} sessionLabel={sessionLabel} />
        : <CourseView course={activeTab} data={sessionData} isRace={isRace} myPilot={myPilot} display={display} sessionLabel={sessionLabel} />}
    </div>
  );
}
