<div align="center">
  <img src="assets/logo.png" width="600" />
  <p><br />Packages <a href="https://github.com/microsoft/apm">APM</a> et guides pour standardiser le travail AI chez Mirego. Centralise les skills, commandes et prompts partagés entre projets et les distribue automatiquement vers les agents de développement.</p>
</div>

| Section                                                    | Description                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| [🚀 Démarrage rapide](#-démarrage-rapide)                 | Configurer le projet en quelques minutes                    |
| [📦 Adopter APM](#-adopter-apm-dans-un-projet)            | Guide d'intégration APM dans un projet existant             |
| [🧩 Concepts clés](#-concepts-clés)                       | Packages, conventions et source de vérité                   |
| [🤖 CI Pi / Forra](#-ci-pi--forra)                        | Workflows GitHub Actions réutilisables pour reviews et maintenance |
| [🏷️ Release](#release)                                    | Publier, mettre à jour et stratégies de pinning             |

## 🚀 Démarrage rapide

### Prérequis

- [mise](https://mise.jdx.dev/) pour la gestion des versions d'outils
- [APM](https://github.com/microsoft/apm) — testé sous `0.8.11`, privilégier la dernière version disponible via `latest`

### Installation

```bash
make setup
```

## 📦 Adopter APM dans un projet

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
- Configuration `.gitignore` et fichiers d'instructions agent

## 🧩 Concepts clés

### Packages APM externes

Skills, commandes et prompts partagés entre projets, hébergés sur un repo git et référencés par version. Ce repo (`agentic`) est le point de distribution des packages partagés Mirego.

#### `spec-workflow` — Pipeline de développement

Pipeline structuré pour passer d'une vision produit à une implémentation livrée.

| Commande | Description |
|----------|-------------|
| `/spec-workflow` | Dashboard du pipeline : état, prochaine action, routage intelligent |
| `/initiative` | Créer une initiative produit (vision, personas, user stories, découpage en specs) |
| `/spec` | Créer une spécification technique (discussion → spec → PR) |
| `/impl` | Implémenter une spec à partir d'un slug de spec |

```
/spec-workflow  ←  porte d'entrée : dashboard + routage
       │
       ▼
/initiative "vision"  →  PR d'initiative  →  review/merge
                              │
                              ├── /spec (spec 1)
                              ├── /spec (spec 2)
                              └── /spec (spec 3)
                                      │
                                      └── /impl <slug>  →  PR d'impl (draft)
```

`/spec-workflow` est la porte d'entrée du pipeline : `status` pour voir l'état, `next` pour la prochaine action suggérée, `start <desc>` pour router vers le bon prompt selon le scope.

Pour les changements techniques (RFC) ou petits changements (Libre), le pipeline peut démarrer directement à `/spec` sans initiative. `/spec` propose aussi un mode **fast-track** qui enchaîne directement avec `/impl` sur une seule PR combinée (recommandé en solo).

Voir le [README du package](spec-workflow/README.md) pour les prérequis, les templates et la documentation complète.

```yaml
# apm.yml
dependencies:
  apm:
    - mirego/agentic/spec-workflow#v1.0.0
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

## 🤖 CI Pi / Forra

Ce dépôt expose aussi un toolkit public de workflows GitHub Actions basés sur Pi et Forra :

- `setup-harness` — installe Pi et configure un `models.json` Forra isolé
- `pi-pr-review` — review PR générique avec commentaires structurés
- `pi-maintenance` — maintenance générique qui ouvre une PR automatiquement
- profils prêts à l’emploi : sécurité, bugs, performance, dependency updates

Exemple minimal :

```yaml
jobs:
  review:
    uses: mirego/agentic/.github/workflows/pi-security-review.yml@v1.0.0
    secrets:
      FORRA_API_KEY: ${{ secrets.FORRA_API_KEY }}
```

Voir le [guide CI](docs/ci.md) pour l’architecture, les inputs et la composition custom.

## Release

APM résout les versions via les refs git. Un tag sur ce repo s'applique à **tous les packages** simultanément.

### Publier une nouvelle version

1. Merger la PR avec les changements
2. Mettre à jour le CHANGELOG du ou des packages concernés
3. Tagger et pousser :
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
4. Créer la release GitHub :
   ```bash
   gh release create v1.1.0 --title "v1.1.0" --generate-notes
   ```

### Mettre à jour dans un projet consommateur

1. Modifier la version dans `apm.yml` :
   ```yaml
   - mirego/agentic/spec-workflow#v1.1.0
   ```
2. Réinstaller :
   ```bash
   apm install
   ```
3. Commiter le `apm.lock.yaml` mis à jour

### Stratégies de pinning

| Stratégie | Syntaxe | Usage |
|-----------|---------|-------|
| Tag | `#v1.0.0` | Production — référence immutable |
| Branche | `#main` | Développement — suit les derniers changements |
| Commit SHA | `#abc123d` | Reproductibilité maximale |
| Sans ref | (rien) | Résout la branche par défaut au moment de l'install |

## Licence

Agentic est © 2026-present [Mirego](https://www.mirego.com) et peut être distribué librement sous la licence [New BSD](http://opensource.org/licenses/BSD-3-Clause). Voir le fichier [`LICENSE.md`](https://github.com/mirego/agentic/blob/main/LICENSE.md).

## À propos de Mirego

[Mirego](https://www.mirego.com) est une équipe de gens passionnés qui croit que le travail est un lieu où l'on peut innover et s'amuser. Nous sommes une équipe de [gens talentueux](https://www.mirego.com/fr/culture) qui imaginent et construisent de belles applications Web et mobiles. Nous nous réunissons pour partager des idées et [changer le monde](http://www.mirego.org).

Nous aimons aussi les [logiciels libres](https://open.mirego.com) et nous essayons de redonner à la communauté autant que nous le pouvons.
