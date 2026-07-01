/**
 * pipeline/orchestrator.js
 * Point d'entrée principal — fait tourner la chaîne complète des agents.
 * Appelé par GitHub Actions avec la demande utilisateur en input (ISSUE_BODY).
 *
 * Flux :
 * Leader → PromptOptimizer → Planner → ModelSelector → Coordinator
 *   → Workers (en séquence selon ordre Coordinateur)
 *   → SecurityWorker (revue)
 *   → Evaluator (par tâche)
 *   → ConsistencyChecker (global)
 *   → Summarizer
 *   → Leader (présentation finale)
 */

// À implémenter à l'Étape 2 (Palier 1 : chaîne minimale d'abord)
export async function run(userRequest) {}
