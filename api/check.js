// api/check.js — Bot surveillance Leaderboard GT3 v2
// Embeds Discord + Détection records + Résumé de session
import { kv } from "@vercel/kv";

// ==================== CONFIG ====================
const GITHUB_REPO      = "RedStellaris/leaderboard";
const SHEET_ID         = "1mABgHcqT9kzriAIuscMitRH72WuWJmYUOtxDmnKGSRg";
const INACTIVITY_LIMIT = 15 * 60; // secondes

const DISCORD_WEBHOOK  = process.env.DISCORD_WEBHOOK;
const GITHUB_TOKEN     = process.env.GITHUB_TOKEN;
const CRON_SECRET      = process.env.CRON_SECRET;

// ==================== COULEURS DISCORD (décimal) ====================
const COLOR_RED  = 0xC41230; // Rouge leaderboard
const COLOR_GOLD = 0xF5A623; // Record
const COLOR_GREY = 0x2B2D31; // Session terminée

// ==================== UTILS ====================
function parseTime(str) {
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

function formatDelta(ms) {
  if (ms <= 0) return "LEADER";
  const s   = Math.floor(ms / 1000);
  const mil = ms % 1000;
  return `+${s}.${String(mil).padStart(3, "0")}`;
}

function heureParis() {
  return new Date().toLocaleTimeString("fr-FR", {
    timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit"
  });
}

// ==================== DISCORD ====================
async function sendDiscord(payload) {
  if (!DISCORD_WEBHOOK) return;
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) { console.error("Discord error:", e); }
}

// ==================== GITHUB ====================
async function getLastCommit() {
  const headers = { "Accept": "application/vnd.github.v3+json" };
  if (GITHUB_TOKEN) headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  try {
    const r = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`,
      { headers }
    );
    if (!r.ok) return null;
    const [c] = await r.json();
    return {
      sha:     c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0].slice(0, 80),
      author:  c.commit.author.name,
    };
  } catch { return null; }
}

// ==================== GOOGLE SHEETS ====================
async function fetchSheetRows() {
  try {
    const r = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
    );
    if (!r.ok) return null;
    const text = await r.text();
    const [header, ...lines] = text.trim().split("\n");
    const keys = header.split(",").map(k => k.trim().replace(/"/g, "").toLowerCase());
    return lines
      .map(l => Object.fromEntries(
        l.split(",").map((v, i) => [keys[i], v.trim().replace(/"/g, "")])
      ))
      .filter(r => r.pilote && r.course && r.temps);
  } catch { return null; }
}

async function getSheetHash() {
  try {
    const r   = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
    );
    if (!r.ok) return null;
    const buf  = await r.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  } catch { return null; }
}

// ==================== CLASSEMENT ====================
function buildRanking(rows, type, circuit) {
  const filtered = rows.filter(r => r.type === type && r.course === circuit);
  if (!filtered.length) return [];
  const hasPos = filtered.some(r => r.position && !isNaN(parseInt(r.position)));
  return [...filtered]
    .sort((a, b) => hasPos
      ? (parseInt(a.position) || 999) - (parseInt(b.position) || 999)
      : parseTime(a.temps) - parseTime(b.temps)
    )
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

// ==================== HANDLER ====================
export default async function handler(req, res) {
  if (CRON_SECRET && req.headers["authorization"] !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  const log = [];

  const state = (await kv.get("leaderboard_state")) ?? {
    lastCommitSha:   null,
    lastSheetHash:   null,
    lastSheetData:   null,
    lastChangeAt:    now,
    inactivitySent:  true,
    lastType:        null,
    lastCircuit:     null,
    records:         {},  // "type|circuit|pilote" → { ms, temps }
  };

  // ── Migration : champs absents des anciennes versions du state ────────────
  if (!state.records)                      state.records        = {};
  if (state.lastType    === undefined)     state.lastType       = null;
  if (state.lastCircuit === undefined)     state.lastCircuit    = null;
  if (state.inactivitySent === undefined)  state.inactivitySent = true;
  if (state.lastChangeAt === undefined)    state.lastChangeAt   = now;
  // ─────────────────────────────────────────────────────────────────────────

  let changed = false;

  // ── 1. GitHub ─────────────────────────────────────────────────────────────
  const commit = await getLastCommit();
  if (commit) {
    if (!state.lastCommitSha) {
      state.lastCommitSha = commit.sha; // Init silencieux
    } else if (commit.sha !== state.lastCommitSha) {
      await sendDiscord({
        embeds: [{
          title:       "🔧 Nouveau déploiement",
          description: "**Leaderboard GT3** — mise à jour du code",
          color:       COLOR_RED,
          fields: [
            { name: "Commit",  value: `\`${commit.sha}\``, inline: true  },
            { name: "Auteur",  value: commit.author,        inline: true  },
            { name: "Message", value: commit.message,       inline: false },
          ],
          timestamp: new Date().toISOString(),
          footer:    { text: "Leaderboard GT3" },
        }],
      });
      log.push(`commit:${commit.sha}`);
      state.lastCommitSha  = commit.sha;
      state.lastChangeAt   = now;
      state.inactivitySent = false;
      changed = true;
    }
  }

  // ── 2. Google Sheets ──────────────────────────────────────────────────────
  const sheetHash = await getSheetHash();
  if (sheetHash) {
    if (!state.lastSheetHash) {
      // Premier run : init silencieux
      const rows          = await fetchSheetRows();
      state.lastSheetHash = sheetHash;
      state.lastSheetData = rows;
      // Initialiser les records
      if (rows) {
        for (const r of rows) {
          const key = `${r.type}|${r.course}|${r.pilote}`;
          const ms  = parseTime(r.temps);
          if (!state.records[key] || ms < state.records[key].ms) {
            state.records[key] = { ms, temps: r.temps };
          }
        }
      }
      log.push("init:sheets");

    } else if (sheetHash !== state.lastSheetHash) {
      const newRows  = await fetchSheetRows();
      const oldRows  = state.lastSheetData || [];

      if (newRows) {
        // Trouver les lignes modifiées ou ajoutées
        const changedRows = newRows.filter(nr => {
          const old = oldRows.find(or =>
            or.pilote === nr.pilote &&
            or.course === nr.course &&
            or.type   === nr.type
          );
          return !old || old.temps !== nr.temps;
        });

        // Tracker la session active
        if (changedRows.length > 0) {
          state.lastType    = changedRows[0].type;
          state.lastCircuit = changedRows[0].course;
        }

        // Détecter les nouveaux records
        const newRecords = [];
        for (const row of changedRows) {
          const key    = `${row.type}|${row.course}|${row.pilote}`;
          const ms     = parseTime(row.temps);
          const oldRec = state.records[key];
          if (isFinite(ms) && (!oldRec || ms < oldRec.ms)) {
            if (oldRec) {
              newRecords.push({
                row,
                oldMs:    oldRec.ms,
                oldTemps: oldRec.temps,
                gain:     oldRec.ms - ms,
              });
            }
            state.records[key] = { ms, temps: row.temps };
          }
        }

        // ── Embed : données modifiées ──────────────────────────────────────
        const fields = [];
        if (changedRows.length === 1) {
          const r = changedRows[0];
          fields.push(
            { name: "Pilote",   value: r.pilote || "–",          inline: true  },
            { name: "Circuit",  value: r.course || "–",          inline: true  },
            { name: "Session",  value: r.type   || "–",          inline: true  },
            { name: "Temps",    value: `\`${r.temps}\``,         inline: true  },
          );
          if (r.position)   fields.push({ name: "Position",      value: `P${r.position}`,   inline: true });
          if (r.pos_depart) fields.push({ name: "Grille départ", value: `P${r.pos_depart}`, inline: true });
        } else {
          fields.push(
            { name: "Modifications", value: `${changedRows.length} temps mis à jour`, inline: false },
            { name: "Circuit",       value: state.lastCircuit || "–",                 inline: true  },
            { name: "Session",       value: state.lastType    || "–",                 inline: true  },
          );
        }

        await sendDiscord({
          embeds: [{
            title:       "📊 Données mises à jour",
            description: `**Leaderboard GT3** — ${heureParis()}`,
            color:       COLOR_RED,
            fields,
            timestamp:   new Date().toISOString(),
            footer:      { text: "Leaderboard GT3" },
          }],
        });

        // ── Embeds : nouveaux records ──────────────────────────────────────
        for (const rec of newRecords) {
          const gainMs = rec.gain;
          const gainS  = `${Math.floor(gainMs / 1000)}.${String(gainMs % 1000).padStart(3, "0")}`;
          await sendDiscord({
            embeds: [{
              title:       "🏆 NOUVEAU RECORD !",
              color:       COLOR_GOLD,
              fields: [
                { name: "Pilote",        value: rec.row.pilote,          inline: true },
                { name: "Circuit",       value: rec.row.course,          inline: true },
                { name: "Session",       value: rec.row.type,            inline: true },
                { name: "Nouveau temps", value: `\`${rec.row.temps}\``,  inline: true },
                { name: "Ancien record", value: `\`${rec.oldTemps}\``,   inline: true },
                { name: "Gain",          value: `**-${gainS}s**`,        inline: true },
              ],
              timestamp: new Date().toISOString(),
              footer:    { text: "Leaderboard GT3" },
            }],
          });
          log.push(`record:${rec.row.pilote}@${rec.row.course}:${rec.row.temps}`);
        }

        state.lastSheetHash  = sheetHash;
        state.lastSheetData  = newRows;
        state.lastChangeAt   = now;
        state.inactivitySent = false;
        changed = true;
        log.push(`sheets:${changedRows.length} changements`);
      }
    }
  }

  // ── 3. Inactivité + résumé de session ─────────────────────────────────────
  if (!changed && !state.inactivitySent) {
    const secs = now - state.lastChangeAt;
    if (secs >= INACTIVITY_LIMIT) {
      const minutes = Math.floor(secs / 60);
      const heure   = new Date(state.lastChangeAt * 1000)
        .toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });

      const rows    = state.lastSheetData || [];
      const type    = state.lastType    || null;
      const circuit = state.lastCircuit || null;
      const ranking = (type && circuit) ? buildRanking(rows, type, circuit) : [];

      const medal = ["🥇", "🥈", "🥉"];
      const rankText = ranking.slice(0, 5).map((r, i) => {
        const bestMs = parseTime(ranking[0]?.temps);
        const delta  = parseTime(r.temps) - bestMs;
        const icon   = i < 3 ? medal[i] : `P${r.rank}`;
        const ecart  = delta > 0 ? `  \`${formatDelta(delta)}\`` : "  `LEADER`";
        return `${icon} **${r.pilote}**  \`${r.temps}\`${ecart}`;
      }).join("\n");

      const fields = [];
      if (ranking.length > 0 && type && circuit) {
        fields.push({
          name:   `📍 ${circuit} — ${type}`,
          value:  rankText,
          inline: false,
        });
      }
      fields.push(
        { name: "Dernière modification", value: heure,            inline: true },
        { name: "Inactivité",            value: `${minutes} min`, inline: true },
      );

      await sendDiscord({
        embeds: [{
          title:       "⏸️ Session terminée",
          description: "Aucune modification depuis **" + minutes + " minutes**",
          color:       COLOR_GREY,
          fields,
          url:         "https://classement-ten.vercel.app",
          timestamp:   new Date().toISOString(),
          footer:      { text: "Leaderboard GT3 · Voir le classement complet" },
        }],
      });

      state.inactivitySent = true;
      log.push(`inactivite:${minutes}min`);
    }
  }

  await kv.set("leaderboard_state", state, { ex: 604800 });
  return res.status(200).json({ ok: true, changed, log });
}
