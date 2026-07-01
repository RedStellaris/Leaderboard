# AGENTS.md — Pipeline IA AMCR Leaderboard
> Document de référence validé. Tout changement de rôle ou de garde-fou passe par une mise à jour de ce fichier.

## Architecture générale

```
Utilisateur → Leader → Optimiseur → Planificateur → Sélecteur de modèle → Coordinateur
                                                                              │
             React · UI · Sécurité · Backend · Data · Dépendances · Tests · Documentation
                                                                              │
                                         Évaluateur + Vérificateur de cohérence
                                                                              │
                                                                          Résumeur
                                                                              │
                                                               Leader → Validation utilisateur
```

## Hébergement
- **Même repo** que `RedStellaris/leaderboard` (phase de test)
- Déclenchement via **GitHub Actions** sur issue labellisée `ai-task`
- Branche dédiée `ai/issue-N` → Pull Request → jamais de commit direct sur `main`

---

## Fiches de rôle

### 👑 Leader
**Rôle** : Point d'entrée et de sortie du pipeline.  
**Fait** : Reçoit la demande brute, déclenche la chaîne, présente le résultat final.  
**Ne fait pas** : Coder, planifier, modifier des fichiers.  
**Modèle** : glm-4.7

### ⚡ Optimiseur de prompt
**Rôle** : Reformule la demande sans changer son périmètre.  
**Fait** : Clarifie les formulations vagues.  
**Ne fait pas** : Ajouter du scope non demandé.  
**Sortie** : String (langage naturel).  
**Modèle** : glm-4.7

### 📋 Planificateur
**Rôle** : Découpe en tâches concrètes, une par fichier.  
**Fait** : Rédige le prompt du Worker pour chaque tâche.  
**Sortie** : JSON `[{ file, instruction, estimatedLines, isSensitive }]`  
**Modèle** : glm-5.2

### 🧠 Sélecteur de modèle
**Rôle** : Assigne glm-4.7 ou glm-5.2 à chaque tâche.  
**Logique** : 100% déterministe, aucun appel LLM.  
**Règle principale** : Le risque prime sur la taille. Fichiers sensibles → toujours glm-5.2.  
**Seuils** : > 15 lignes estimées OU > 1 fichier OU fichier sensible → glm-5.2.  
**Fichiers toujours glm-5.2** : `api/check.js`, `logic/ranking.js`, `config.js`

### 🤝 Coordinateur
**Rôle** : Distribue les tâches aux Workers, détecte les conflits, impose l'ordre.  
**Fait** : Vérifie les listes blanches avant exécution.  
**Ne fait pas** : Coder.  
**Modèle** : glm-4.7

### 💻 React Worker
**Rôle** : Logique JSX (state, hooks, props, structure).  
**Périmètre** : `src/components/`, `src/App.jsx`  
**Interdit** : `src/config.js`, `api/check.js`, `.env`  
**Max diff** : 150 lignes  
**Conventions** : objet C, rowBg/rowBorder, architecture modulaire

### 🎨 UI Worker
**Rôle** : Style visuel (couleurs, espacements, animations, layout).  
**Périmètre** : `src/components/`, `src/App.jsx`  
**Règle** : Si logique + style → Coordinateur split en 2 tâches (React + UI).  
**Max diff** : 100 lignes

### 🔐 Sécurité Worker
**Rôle** : Revue de failles (injection, secrets exposés, CORS, validation input).  
**Fait** : Lecture seule — revue uniquement.  
**Ne fait pas** : Écrire du code.  
**Intervient** : Après les Workers de production, avant l'Évaluateur.

### ⚙ Backend Worker — GARDE-FOUS RENFORCÉS
**Rôle** : Bot Discord, api/check.js.  
**Périmètre** : `api/check.js` uniquement.  
**Règles permanentes** :
- Validation humaine OBLIGATOIRE, sans exception
- Diff max : 50 lignes (arrêt automatique au-delà)
- PR toujours isolée, jamais mélangée
- Aucun accès Vercel KV ni variables d'env
- Commentaire PR obligatoire : impact sur le bot Discord
- Exécution automatique JAMAIS autorisée  
**Modèle** : glm-5.2 systématiquement

### 📊 Data Worker (inclut Sim Racing)
**Rôle** : Parsing Sheets, classement, temps, règles métier GT3.  
**Périmètre** : `src/utils/sheetsFetch.js`, `src/utils/timeUtils.js`, `src/logic/ranking.js`, `src/logic/sortUtils.js`  
**Expertise métier** : barème F1, format mm:ss,cc, règles de classement GT3.  
**Max diff** : 150 lignes

### 📦 Dépendances Worker
**Rôle** : Audit package.json, compatibilité versions.  
**Périmètre** : `package.json`, `vite.config.js`  
**Max diff** : 30 lignes

### 🧪 Tests Worker
**Rôle** : Écriture/mise à jour tests Vitest + React Testing Library.  
**Priorité** : `logic/ranking.js`, `utils/timeUtils.js` (fonctions pures) avant composants React.  
**Prérequis** : Vitest installé dans le projet.  
**Max diff** : 200 lignes

### 📝 Documentation Worker
**Rôle** : Maintient AGENTS.md, CLAUDE.md, commentaires inline.  
**Périmètre** : fichiers .md uniquement.  
**Ne touche pas** : au code source.

### 📊 Évaluateur
**Rôle** : Valide/rejette chaque tâche isolée.  
**Ne fait pas** : Réécrire le code — verdict uniquement.  
**Sortie** : "OK" ou liste des problèmes.

### 🔍 Vérificateur de cohérence
**Rôle** : Valide l'intégration globale post-run.  
**Vérifie** : Props non utilisées, imports manquants, doublons de logique.  
**Modèle** : glm-5.2 (vision multi-fichiers)

### 📖 Résumeur
**Rôle** : Résumé lisible du run pour Leader + utilisateur.  
**Contenu** : tâches exécutées, décisions, rejets, fichiers modifiés.  
**Ne touche pas** : au code.

---

## Garde-fous globaux

### Fichiers jamais modifiables (aucun agent)
- `.env`, `.env.local`, `.env.production`
- `vercel.json`
- `package-lock.json`

### Règles Git
- Jamais de commit direct sur `main`
- Toujours sur branche `ai/issue-N`
- Jamais de force-push
- Aucun agent ne déclenche `git push` — uniquement GitHub Actions après validation

### Seuil d'abandon / simplification
Si le pipeline prend > 3x le temps d'une session Claude.ai classique,
ou nécessite > 2 corrections manuelles : fusionner Optimiseur + Planificateur en premier.

---

## Paliers de test

| Palier | Objectif | Agents actifs |
|--------|----------|---------------|
| 1 | Mécanique de base | Coordinateur → React Worker → Évaluateur |
| 2 | Orchestration complète sur tâche simple | Tous |
| 3 | Tâche réelle AMCR, comparaison vs session Claude.ai | Tous |
