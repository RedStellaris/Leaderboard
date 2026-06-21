// api/check.js — Bot de surveillance Leaderboard GT3
// Déclenché toutes les minutes par Vercel Cron ou cron-job.org
import { kv } from "@vercel/kv";

// ==================== CONFIG ====================
const GITHUB_REPO      = "RedStellaris/leaderboard";
const SHEET_ID         = "1mABgHcqT9kzriAIuscMitRH72WuWJmYUOtxDmnKGSRg";
const INACTIVITY_LIMIT = 15 * 60; // 15 minutes en secondes

// Variables d'environnement Vercel (à configurer dans le dashboard)
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
const GITHUB_TOKEN    = process.env.GITHUB_TOKEN;   // Optionnel mais recommandé
const CRON_SECRET     = process.env.CRON_SECRET;    // Protection de l'endpoint

// ==================== SÉCURITÉ ====================
function isAuthorized(req) {
  if (!CRON_SECRET) return true; // Pas de secret configuré = accès libre
  const auth = req.headers["authorization"];
  return auth === `Bearer ${CRON_SECRET}`;
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
async function getSheetHash() {
  try {
    const r = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
    );
    if (!r.ok) return null;
    const buf  = await r.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  } catch { return null; }
}

// ==================== DISCORD ====================
async function sendDiscord(message) {
  if (!DISCORD_WEBHOOK) return;
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch (e) {
    console.error("Erreur Discord :", e);
  }
}

// ==================== HANDLER ====================
export default async function handler(req, res) {
  // Sécurité
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000); // Timestamp Unix

  // Lire l'état persistant depuis Vercel KV
  const state = (await kv.get("leaderboard_state")) ?? {
    lastCommitSha:  null,
    lastSheetHash:  null,
    lastChangeAt:   now,
    inactivitySent: true, // true au départ = pas de notif immédiate
  };

  let changed = false;
  const log   = [];

  // ── Vérifier GitHub ──────────────────────────────────────────
  const commit = await getLastCommit();
  if (commit) {
    if (state.lastCommitSha === null) {
      // Premier run : initialiser sans notifier
      state.lastCommitSha = commit.sha;
      log.push(`Init commit : ${commit.sha}`);
    } else if (commit.sha !== state.lastCommitSha) {
      // Nouveau commit détecté
      await sendDiscord(
        `🔧 **Nouveau déploiement** — Leaderboard GT3\n` +
        `\`\`\`\n` +
        `Commit  : ${commit.sha}\n` +
        `Message : ${commit.message}\n` +
        `Auteur  : ${commit.author}\n` +
        `\`\`\``
      );
      log.push(`Nouveau commit : ${commit.sha}`);
      state.lastCommitSha  = commit.sha;
      state.lastChangeAt   = now;
      state.inactivitySent = false;
      changed = true;
    }
  }

  // ── Vérifier Google Sheets ───────────────────────────────────
  const sheetHash = await getSheetHash();
  if (sheetHash) {
    if (state.lastSheetHash === null) {
      // Premier run : initialiser sans notifier
      state.lastSheetHash = sheetHash;
      log.push(`Init hash Sheets : ${sheetHash}`);
    } else if (sheetHash !== state.lastSheetHash) {
      // Données modifiées
      const heure = new Date().toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" });
      await sendDiscord(
        `📊 **Données mises à jour** — Leaderboard GT3\n` +
        `_Heure : ${heure}_`
      );
      log.push(`Sheets modifié : ${sheetHash}`);
      state.lastSheetHash  = sheetHash;
      state.lastChangeAt   = now;
      state.inactivitySent = false;
      changed = true;
    }
  }

  // ── Vérifier inactivité ──────────────────────────────────────
  if (!changed && !state.inactivitySent) {
    const secs = now - state.lastChangeAt;
    if (secs >= INACTIVITY_LIMIT) {
      const minutes = Math.floor(secs / 60);
      const heure   = new Date(state.lastChangeAt * 1000)
        .toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" });
      await sendDiscord(
        `⏸️ **Aucune modification depuis ${minutes} minutes** — Leaderboard GT3\n` +
        `_Dernière mise à jour : ${heure}_\n` +
        `<https://leaderboardgt3.vercel.app>`
      );
      log.push(`Notification inactivité : ${minutes} min`);
      state.inactivitySent = true;
    }
  }

  // Sauvegarder l'état dans Vercel KV (expire après 7 jours pour éviter les données stales)
  await kv.set("leaderboard_state", state, { ex: 604800 });

  return res.status(200).json({ ok: true, changed, log });
}
