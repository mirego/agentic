# mirego-agentic

Ressources et guides pour l'adoption d'[APM](https://github.com/microsoft/apm) (Agent Package Manager) chez Mirego. APM standardise la distribution des agent skills (Claude Code, OpenCode, GitHub Copilot) avec versioning, reproductibilité et support multi-vendor.

## Adopter APM dans un projet

Le [guide d'accompagnement](docs/onboarding.md) est conçu pour être fourni à un agent AI. Il analyse le projet, identifie les skills existants, et propose un plan d'adoption adapté.

### Utilisation

1. Ouvrir son agent AI préféré (Claude Code, Copilot, OpenCode, etc.)
2. Lui fournir le contenu de [`docs/onboarding.md`](docs/onboarding.md)
3. L'agent diagnostique le projet et guide l'adoption

### Ce que le guide couvre

- Installation d'APM via [mise](https://mise.jdx.dev/)
- Création du manifest `apm.yml` avec sélection des targets
- Intégration dans le setup existant (`Makefile`, scripts)
- Migration des skills existants (comparaison, coexistence)
- Conversion des skills locaux en packages APM locaux (`.apm-local/`)
- Configuration `.gitignore` et `CLAUDE.md`

## Concepts clés

### Packages APM externes

Skills, commandes et prompts partagés entre projets, hébergés sur un repo git et référencés par version. Ce repo (`mirego-agentic`) sera le futur point de distribution des packages partagés Mirego :

```yaml
dependencies:
  apm:
    - mirego/mirego-agentic/groupe#v1.0.0
```

### Packages APM locaux

Skills propres à un projet, structurés comme mini-packages APM :

```
.apm-local/mon-skill/
├── apm.yml
└── .apm/prompts/
    └── mon-skill.prompt.md
```

Référencés par path relatif :

```yaml
dependencies:
  apm:
    - ./.apm-local/mon-skill
```

APM distribue automatiquement les skills (externes et locaux) vers tous les targets configurés — jamais de copie manuelle.

### Source de vérité

`apm.yml` + `apm.lock.yaml` sont la source de vérité (comme `package.json` + `package-lock.json`). Les fichiers générés dans `.claude/commands/`, `.opencode/commands/` et `.github/prompts/` sont gitignorés et régénérés par `apm install`.

### Conventions de frontmatter

Chaque fichier `.prompt.md` doit inclure un frontmatter YAML. Les champs suivants sont supportés cross-vendor (Claude Code, OpenCode, GitHub Copilot) :

```yaml
---
description: Ce que le prompt fait et quand l'utiliser    # recommandé
argument-hint: [paramètres attendus]                      # optionnel
model: opus                                               # optionnel — pour les skills complexes
allowed-tools: Read, Glob, Grep, Bash, Write, Edit        # optionnel
---
```

`description` est le minimum — c'est ce que les agents utilisent pour décider quand invoquer automatiquement un skill.

## Prérequis

- [mise](https://mise.jdx.dev/) pour la gestion des versions d'outils
- [APM](https://github.com/microsoft/apm) >= 0.8.5 — installable via mise :
  ```toml
  [tools]
  "github:microsoft/apm" = "0.8.5"
  ```
