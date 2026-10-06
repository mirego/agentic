# Changelog

## v1.0.0 — 2026-10-06

Première version du package accessibility-fixer.

### Prompts

- `/a11y-audit` — Audit d'accessibilité WCAG 2.2 AA d'une plateforme/feature : détection de plateforme, workflow 4 phases (Discovery → Deep Dive → Pattern Verification → Report), rapport dans `accessibility-audit/reports/<platform>/`
- `/a11y-fix` — Appliquer les correctifs d'un rapport d'audit : sélection par sévérité, vérification du code avant chaque fix, résumé `_FIXES_`
- `/a11y-review` — Review accessibilité d'une PR via `gh` CLI : commentaires inline avec détection de doublons, mode CI avec exit codes

### Skill

- `a11y-guides` — Bibliothèque de guides WCAG 2.2 embarquée (36 fichiers : workflow d'audit, référence WCAG, guides par plateforme Web/iOS/Android/RN/Flutter/TV, patterns, mappings composants). Résolution locale via `GUIDES_MANIFEST.json` — aucun téléchargement réseau requis. Anciennement distribuée via le repo `dominiclabbe/accessibility-fixer-guides` (désormais archivé, ce package est la source de vérité).

### Prérequis

- Aucun prérequis pour `/a11y-audit` et `/a11y-fix`
- `gh` CLI authentifié pour `/a11y-review` seulement — dégradation gracieuse si absent
