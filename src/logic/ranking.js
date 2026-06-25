import { F1_POINTS } from "../config.js";
import { parseTime } from "../utils/timeUtils.js";

export function courseRanking(data, course) {
  const rows   = data.filter(d => d.course === course);
  const hasPos = rows.some(r => r.position && !isNaN(parseInt(r.position)));
  const sorted = [...rows].sort((a, b) => {
    if (hasPos) return (parseInt(a.position) || 999) - (parseInt(b.position) || 999);
    return parseTime(a.temps) - parseTime(b.temps);
  });
  const best = parseTime(sorted[0]?.temps);
  return sorted.map((r, i) => ({
    ...r,
    rank:   i + 1,
    ms:     parseTime(r.temps),
    delta:  parseTime(r.temps) - best,
    points: F1_POINTS[(parseInt(r.position) || i + 1) - 1] ?? 0,
  }));
}

export function cumulativeRanking(data, pilots, courses) {
  return pilots.map(pilote => {
    const rows  = data.filter(d => d.pilote === pilote);
    const total = rows.reduce((s, r) => s + parseTime(r.temps), 0);
    const done  = courses.filter(c => rows.some(r => r.course === c)).length;
    return { pilote, totalMs: total, avgMs: done ? total / done : Infinity, done, of: courses.length };
  }).sort((a, b) => b.done - a.done || a.totalMs - b.totalMs);
}

export function pointsRanking(data, pilots, courses) {
  const pts = {}, details = {};
  pilots.forEach(p => { pts[p] = 0; details[p] = {}; });
  courses.forEach(course => {
    courseRanking(data, course).forEach(r => {
      if (pts[r.pilote] !== undefined) {
        pts[r.pilote] += r.points;
        details[r.pilote][course] = { rank: r.rank, pts: r.points };
      }
    });
  });
  return pilots
    .map(p => ({ pilote: p, points: pts[p], detail: details[p] }))
    .sort((a, b) => b.points - a.points);
}

export function getPilotInfo(data, pilote) {
  const r = data.find(d => d.pilote === pilote);
  return { ecurie: r?.ecurie || "–", numero: r?.numero || "" };
}
