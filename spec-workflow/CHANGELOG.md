# Changelog

## À venir

### Ajouts

- Prompt `/spec-workflow` — orchestrateur lecture seule du pipeline. Quatre sous-commandes : `status` (dashboard de l'état des initiatives/specs/impls avec icônes ⏳📝🔨✅), `next` (propose la prochaine action logique), `start <description>` (route vers `/initiative` ou `/spec` selon le scope), `impl <slug>` (raccourci vers `/impl` avec vérification des prérequis GitHub). Ne crée aucun fichier — délègue toujours aux prompts dédiés après confirmation via `AskUserQuestion`.

### Changements

- Format de tag backlog — les items `/initiative` ne portent plus le tag inline `· init:<slug>` (l'association à l'initiative est déjà assurée par la section `> init:<slug>` qui les contient). Supprime la redondance signalée par Claude bot reviews et aligne `/initiative`, `/spec` et `/impl` sur les trois tags valides définis dans l'onboarding (`> init:<slug>`, `· spec~<slug>`, `· spec:<slug>`).
- Fast-track généralisé — `/spec` Phase 5 propose maintenant le fast-track (PR combinée spec+impl) pour tous les types de specs (PRD, RFC, Libre), pas seulement Libre. La recommandation est basée sur une heuristique `git log` (contexte solo ou équipe) mais l'utilisateur conserve toujours le choix final. Comportement Libre existant identique.

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
