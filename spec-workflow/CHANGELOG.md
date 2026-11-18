# Changelog

## v2.0.0 - non publiée

Réécriture du workflow pour les modèles récents : instructions plus courtes, centrées sur les objectifs et les contrats d'équipe plutôt que sur la procédure, effort proportionné à la taille du changement. Le format des documents (initiatives, specs, backlog) et les événements d'extension sont inchangés.

### Changements

- Prompts convertis en skills (`.apm/skills/`), instructions en anglais. Le contenu généré suit toujours la section Langue d'`AGENTS.md`. `apm install` retire automatiquement les anciennes commandes générées.
- `/initiative`, `/spec` et `/impl` ne démarrent que sur demande explicite (`disable-model-invocation`) ; `/spec-workflow` reste invocable par l'agent.
- Instructions réduites d'environ 83 KB à 28 KB ; templates de spec et d'initiative chargés seulement au moment de la rédaction.
- Exploration du code directe par défaut ; sous-agents `Explore` seulement quand le périmètre est large (avant : 3 sous-agents obligatoires dans `/spec` et dans `/impl`).
- Moins de points de contrôle : 2 dans `/spec` (approche, puis spec + mode d'intégration), 1 dans `/impl` (plan), 1 dans `/initiative` (document). Le format PRD/RFC/Libre est choisi par l'agent et annoncé.
- La spec décrit le quoi et le pourquoi (décisions, critères d'acceptation, risques, zones impactées) ; le plan fichier par fichier est fait dans `/impl`.
- Fast-track recommandé selon une politique de review déclarée dans `AGENTS.md` (défaut : PR de spec séparée pour PRD et RFC, fast-track pour Libre), au lieu du nombre d'auteurs dans `git log`. Voir [README](README.md#politique-de-review).
- `/impl` documente toujours les écarts par rapport à la spec dans la spec archivée et les liste dans son résumé, au lieu de demander s'il faut les documenter.
- `/impl` : tests écrits dans chaque commit, tests ciblés pendant l'implémentation et `make check` une seule fois à la fin. `make doctor` n'est plus exécuté par `/spec`.
- Protocole d'extensions et règles anti-injection condensés, ton impératif adouci.

### Ajouts

- `/impl` ouvre la PR draft dès le premier commit pour rendre le travail en cours visible à l'équipe.
- `/impl` reprend une branche `impl/<slug>` existante et traite les commentaires de review de sa PR.
- `/impl` fait relire le diff par un sous-agent neuf avant de finaliser la PR (bugs, critères d'acceptation, tests manquants).
- Section « Protections recommandées » du README : protection de branche et règles `deny` Claude Code.

### Corrections

- Contenu spécifique à Elixir/Phoenix retiré (`DataCase`, `ConnCase`, LiveView, `test/support/fixtures/`) : les tests suivent les conventions du projet.
- Fast-track : `/impl` ne repasse plus sur `main` avant de commencer, ce qui rendait la spec introuvable.

## v1.4.0 — 2026-10-15

Aucun changement.

## v1.3.0 — 2026-10-06

### Sécurité

- Anti-injection LLM dans `/initiative`, `/spec`, `/impl` et `/spec-workflow` — `$ARGUMENTS`, specs, backlog et tickets externes traités comme données non fiables. Voir [README](README.md#sécurité-anti-injection-prompts).
- Extensions `AGENTS.md` restreintes à une politique déclarative (MCP/CLI uniquement), avec refus des actions hors scope.
- Validation stricte des slugs avant usage dans le shell ou les chemins.
- `/impl` Phase 4c — les hooks `spec-workflow:…` et la config agent ne sont plus mis à jour automatiquement (diff + confirmation).

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
