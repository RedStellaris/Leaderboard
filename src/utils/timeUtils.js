export function parseTime(str) {
  if (!str || typeof str !== "string") return Infinity;
  try {
    const dotIdx = str.lastIndexOf(".");
    const colIdx = str.indexOf(":");
    if (colIdx === -1) return Infinity;
    const min = parseInt(str.slice(0, colIdx), 10);
    const sec = parseInt(str.slice(colIdx + 1, dotIdx !== -1 ? dotIdx : undefined), 10);
    const ms  = dotIdx !== -1 ? parseInt(str.slice(dotIdx + 1).padEnd(3, "0"), 10) : 0;
    if (isNaN(min) || isNaN(sec) || isNaN(ms)) return Infinity;
    return min * 60000 + sec * 1000 + ms;
  } catch { return Infinity; }
}

export function formatTime(ms) {
  if (!isFinite(ms)) return "--:--.---";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(mil).padStart(3, "0")}`;
}

// Dédiée aux durées cumulées (peuvent dépasser 59 min, contrairement à un
// temps de tour). formatTime() n'est PAS modifiée : elle reste correcte pour
// son usage d'origine (temps de tour unique, toujours < 60 min).
export function formatDuration(ms) {
  if (!isFinite(ms) || ms < 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const h   = Math.floor(totalSec / 3600);
  const m   = Math.floor((totalSec % 3600) / 60);
  const s   = totalSec % 60;
  const mil = ms % 1000;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(mil).padStart(3, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}.${String(mil).padStart(3, "0")}`;
}

export function formatDelta(ms) {
  if (ms === 0) return "LEADER";
  const s = Math.floor(ms / 1000), mil = ms % 1000;
  return `+${s}.${String(mil).padStart(3, "0")}`;
}

export function computeTimeAgo(date) {
  if (!date) return "";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60)   return "à l'instant";
  if (secs < 3600) return `il y a ${Math.floor(secs / 60)} min`;
  return `il y a ${Math.floor(secs / 3600)}h`;
}
