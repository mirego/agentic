# Changelog

## Unreleased

### Sécurité

- Anti-injection LLM dans les prompts core (`/initiative`, `/spec`, `/impl`, `/spec-workflow`) :
  - `$ARGUMENTS` encadré comme données non fiables (`$user_input_start` / `$user_input_end`)
  - Protocole d'extensions `AGENTS.md` : politique d'intégration déclarative, périmètre MCP/CLI uniquement, refus des actions hors scope / injection
  - Specs, initiatives, backlog et tickets externes traités comme données métier (pas d'instructions système)
  - Validation stricte des slugs avant shell/chemins
  - `/impl` Phase 4c : hooks `spec-workflow:…` et config agent hors mise à jour auto (diff + confirmation)

## v1.2.0 — 2026-04-21

### Ajouts

- Extensions projet via événements de cycle de vie — huit hooks (`initiative:started/created/completed`, `spec:started/created/completed`, `impl:started/completed`) branchables depuis une section homonyme dans `AGENTS.md`. Voir [README](README.md#intégrations-externes).
- Progression visible dans `/impl` — Phase 3 matérialise le plan en tâches via `TaskCreate`/`TaskUpdate`, une par phase + Tests + PR.
- Prompt `/spec-workflow` — orchestrateur lecture seule : `status`, `next`, `start <desc>`, `impl <slug>`.

### Changements

- Format de tag backlog — retrait du tag inline `· init:<slug>`, redondant avec la section `> init:<slug>`.
- Fast-track généralisé — `/spec` Phase 5 propose la PR combinée spec+impl pour tous les types (PRD, RFC, Libre).

## v1.1.0 — 2026-04-13

### Changements

- Langue dynamique — les prompts (`/initiative`, `/spec`, `/impl`) utilisent la langue configurée dans la section `## Langue` de `AGENTS.md` du projet consommateur. Fallback sur la langue de l'utilisateur si non configurée.
- Onboarding auto-suffisant — les instructions de création de prompts APM sont inlinées dans `docs/onboarding.md` (étape 2g). L'onboarding recommande aussi d'ajouter une section Langue dans `AGENTS.md`.

## v1.0.0 — 2026-04-09

Première version du package spec-workflow.

### Prompts

- `/initiative` — Planification produit stratégique (vision, personas, user stories, découpage en specs)
- `/spec` — Spécification technique avec résolution intelligente d'initiative et formats PRD/RFC/Libre
- `/impl` — Implémentation guidée par une spec (commits atomiques, tests, archivage, traçabilité)

### Optimisations

- Exploration parallele systematique (3 agents simultanes) dans `/spec` et `/impl`
- Validation continue en background dans `/impl` (detection precoce des regressions)
- Mode fast-track pour les specs de type Libre (spec + impl sur une seule branche/PR)

### Prérequis

- `make doctor` et `make check` comme abstraction tech-agnostique
- Templates fournis dans `templates/` (doctor.sh, check.sh, Makefile.example)
- Résilience : les prompts détectent l'absence des targets et ne bloquent pas
- Backlog conditionnel : `BACKLOG.md` utilise si present, sinon skip
