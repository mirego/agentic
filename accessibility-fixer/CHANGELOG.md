# Changelog

## v1.3.0 — 2026-10-06

Première version du package accessibility-fixer.

### Prompts

- `/a11y-audit` — Audit WCAG 2.2 AA d'une plateforme ou d'une feature, rapport dans `accessibility-audit/reports/<platform>/`.
- `/a11y-fix` — Application des correctifs d'un rapport d'audit, par sévérité.
- `/a11y-review` — Review accessibilité d'une PR via `gh`, avec commentaires inline et mode CI.

### Skill

- `a11y-guides` — Bibliothèque de guides WCAG 2.2 embarquée (Web, iOS, Android, React Native, Flutter, TV), sans accès réseau. Remplace le repo archivé `dominiclabbe/accessibility-fixer-guides`. Voir [README](README.md#bibliothèque-de-guides).

### Prérequis

- `gh` CLI authentifié pour `/a11y-review` seulement. Voir [README](README.md#prérequis).
- Harnais sans slash commands natives : voir [README](README.md#autres-harnais-pi-et-autres-agents).
