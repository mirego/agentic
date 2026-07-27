# Changelog

## Unreleased

### Ajouts

- Package initial `sidekick` — équipe multi-modèles pour OpenCode basée sur le patron « sidekick » de Devin Fusion, adapté depuis [opencode-fusion](https://github.com/mihneaptu/opencode-fusion) (MIT).
  - Agents primaires : `build` (planifie, délègue, révise — `edit` refusé), `plan` (même posture, sans accès au sidekick ni à git en écriture), `normal` (trappe de sortie non restreinte).
  - Sous-agents : `sidekick` (exécution), `research`, `reviewer`, `design`, `vision`.
  - Commande `/sidekick-status` — vérification de santé en trois couches : application réelle dans la session courante, config sur disque, agents résolus via `opencode agent list`.

### Différences avec l'upstream

- **Aucun `model:` dans les frontmatter** — le routage des modèles appartient au `opencode.json` de chaque personne. Le frontmatter écraserait la config en silence.
- **Plugins retirés** — `fusion-audit` est remplacé par `opencode stats --models` / `--tools` (natif, et l'attribution par agent découle du routage par rôle). `fusion-claude` est écarté : dépendance externe par poste, statut incertain côté Anthropic, et APM ne distribue pas les plugins OpenCode. Un `reviewer` chez un autre fournisseur couvre la revue croisée.
- **`plan` allégé** — prompt court qui référence `build` au lieu de redupliquer sa discipline (l'upstream duplique ~480 mots). Sa posture de permissions est un sous-ensemble strict de celle de `build`.
- **Trappe de sortie distribuée** — `normal` est dans le package plutôt que laissé en instruction manuelle. Sans elle, le `plan` natif d'OpenCode survivrait avec `edit: ask` et contournerait le patron par accident.
- **Allowlist bash élargie** — `pnpm`, `make` et `mix` en plus de `npm`/`npx`, pour couvrir les stacks Mirego.
