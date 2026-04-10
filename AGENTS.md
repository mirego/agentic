# mirego-agentic

Repo de packages APM partagés chez Mirego. Distribue des skills, commandes et prompts vers Claude Code, OpenCode et GitHub Copilot.

## Structure du repo

```
mirego-agentic/
├── apm.yml                      # Metapackage root
├── spec-workflow/               # Package : pipeline initiative → spec → impl
│   ├── apm.yml
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── .apm/prompts/            # Prompts distribués par APM
│   └── templates/               # Templates make doctor / make check
├── docs/
│   ├── onboarding.md            # Guide d'accompagnement APM (prompt pour agents)
│   └── AGENT-apm.md             # Instructions projet pour la création de prompts via APM
└── [futurs packages]/
```

## Conventions

### Langue

- **Documentation** (README, CHANGELOG, AGENTS.md) : français
- **Prompts** (.prompt.md) : français pour le contenu généré, anglais acceptable dans les blocs de code
- **Commits** : français

### Créer un nouveau package

Chaque package est un sous-dossier à la racine avec sa propre structure APM :

```
mon-package/
├── apm.yml                      # name + version
├── README.md                    # Documentation du package (prérequis, prompts, usage)
├── CHANGELOG.md                 # Historique des versions
└── .apm/prompts/
    └── mon-prompt.prompt.md     # Un fichier par prompt/commande
```

Le `apm.yml` minimal :

```yaml
name: mon-package
version: 1.0.0
```

### Frontmatter des prompts

Chaque `.prompt.md` doit inclure un frontmatter YAML :

```yaml
---
description: Ce que le prompt fait et quand l'utiliser
argument-hint: [paramètres attendus]
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Task, AskUserQuestion
---
```

- `description` est obligatoire — les agents l'utilisent pour l'auto-invocation
- `argument-hint` est recommandé pour guider l'utilisateur
- `allowed-tools` est recommandé pour les prompts qui utilisent des outils spécifiques

### Tech-agnosticisme

Les prompts partagés doivent être indépendants de la stack technique du projet consommateur :

- Utiliser `make doctor` pour le diagnostic d'environnement (pas `mix compile`, `npm run build`, etc.)
- Utiliser `make check` pour la validation de code (pas `mix test`, `cargo test`, etc.)
- Prévoir la résilience : si `make doctor` ou `make check` n'existent pas, détecter l'absence et demander à l'utilisateur comment procéder — ne jamais bloquer
- Fournir des templates dans `templates/` quand un prérequis est introduit
- Ne pas hardcoder de labels GitHub spécifiques à un projet (pas de `--label "mirego-dugout"`)
- Ne pas référencer de skills qui ne sont pas dans le même package (pas de `/fix-pr` dans spec-workflow si fix-pr n'est pas distribué)

### Versioning

- APM résout les versions via les **refs git** (tags, branches, SHA) — pas via le champ `version` de `apm.yml` qui est purement informatif
- Les tags sont au niveau du **repo** : `v1.0.0` s'applique à tous les packages du monorepo simultanément
- Les consommateurs pinnent sur un tag : `mirego/mirego-agentic/spec-workflow#v1.0.0`
- Pas de semver ranges (`^1.0.0`) — seulement des refs exactes
- Le `apm.lock.yaml` du consommateur capture le commit SHA exact pour la reproductibilité
- Chaque package a son propre `CHANGELOG.md` pour documenter ses changements
- Le flow de release est documenté dans le [README](README.md#release)

### Workflow de contribution

1. Créer une branche (`add/`, `fix/`, `update/`)
2. Modifier les prompts, mettre à jour le CHANGELOG du package concerné
3. Créer une PR
4. Après merge, suivre le flow de release si c'est un changement distribué
