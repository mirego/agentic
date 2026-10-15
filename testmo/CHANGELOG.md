# Changelog

## v1.4.0 — non publiée

Première version du package testmo, issue d'une preuve de concept menée sur un projet Mirego (web, Elixir et Go).

### Skills

- `/testmo-setup` — Intégration d'un projet : détection de la stack (catalogue de reporters JUnit : Elixir, Go, JS/TS, Kotlin Multiplatform, Android, iOS, Maestro), `.testmo.json`, publication CI, journal, demande de token CI. Mode `--dry-run`.
- `/testmo-plan` — Plan de test manuel généré depuis la codebase (`product`) ou réconcilié avec un changement (`pr:<n>`, `branch`, `jira:<clé>`, `doc:<chemin>`, texte libre), avec approbation avant toute écriture.

### Brique CI

- `ci/publish.sh` — Publication JUnit XML indépendante de la CI, jamais bloquante, token jamais exposé. `ci/action.yml` — enveloppe GitHub Actions (`uses: mirego/agentic/testmo/ci@<tag>`). Voir [`ci/README.md`](ci/README.md).

### Adaptateur

- `testmo.mjs` (`doctor`, `snapshot`, `apply [--dry-run]`) — aucune suppression, un `PATCH` par cas, union des tags, trace « Change log (auto) » et tags `ai-*` dans la même requête que le changement, journal du repo.

### Prérequis

- Node ≥ 22, APM ≥ 0.18. Champ « Change log (auto) » à créer une fois par un admin Testmo. Voir [README](README.md#prérequis).
