# CI workflows Pi / Forra

Toolkit public de workflows GitHub Actions basés sur [Pi](https://pi.dev) et le fournisseur Forra. L’objectif est double :

1. **entrée rapide** — brancher un profil préconstruit (sécurité, bugs, dépendances) ;
2. **extension** — composer des workflows custom à partir du harness et des workflows génériques.

## Architecture

```text
setup-harness                         # composite action : install Pi + models.json Forra
├── pi-pr-review.yml                  # workflow générique de review PR
│   ├── pi-security-review.yml
│   ├── pi-bug-review.yml
│   └── pi-performance-review.yml
└── pi-maintenance.yml                # workflow générique de maintenance / PR auto
    └── pi-dependency-updates.yml
```

### Frontière de sécurité

Les workflows génériques séparent volontairement l’agent et la publication GitHub :

```text
job agent (lecture seule, secret Forra, pas d’écriture GitHub)
        │
        │ artifact JSON / patch
        ▼
job publisher (token GitHub, code déterministe)
```

Conséquences :

- Pi ne reçoit jamais `GITHUB_TOKEN` en écriture ;
- le code écrit par l’agent (commande de validation incluse) tourne seulement dans le job agent ;
- le job publisher n’exécute aucun code du dépôt : le checkout ne garde pas les credentials, et le token va seulement à `git push` / `gh` ;
- Pi tourne avec `--no-approve --no-mcp` : les fichiers projet (`.pi/settings.json`, `.pi/mcp.json`, extensions projet) ne sont pas chargés ;
- les commentaires PR et l’ouverture de PR sont faits par des scripts validés ;
- les findings de review sont ancrés sur le diff avant publication.

> Ces workflows sont conçus pour des PRs de confiance (branches internes). Ne les combinez pas avec `pull_request_target` + checkout du code d’une fork non fiable tout en exposant `FORRA_API_KEY`.

## Prérequis

1. Secret dépôt / organisation : `FORRA_API_KEY`
2. Permissions workflow suffisantes :
   - review : `contents: read`, `pull-requests: write`
   - maintenance : `contents: write`, `pull-requests: write`
3. Runner standard `ubuntu-latest` (l’URL Forra est joignable publiquement)

Pinner la version d’`agentic` comme pour les packages APM :

```yaml
uses: mirego/agentic/.github/workflows/pi-security-review.yml@v1.0.0
```

## Démarrage rapide

Des workflows consommateurs prêts à copier sont disponibles dans
[`docs/examples/ci/`](examples/ci/).

### Review sécurité préconstruite

```yaml
# .github/workflows/ai-security-review.yml
name: AI security review

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    uses: mirego/agentic/.github/workflows/pi-security-review.yml@v1.0.0
    secrets:
      FORRA_API_KEY: ${{ secrets.FORRA_API_KEY }}
```

Profils équivalents :

| Workflow | Usage |
|----------|-------|
| `pi-security-review.yml` | AuthN/AuthZ, injection, secrets, data leakage |
| `pi-bug-review.yml` | Régressions, edge cases, error handling |
| `pi-performance-review.yml` | N+1, complexité, chemins chauds |

### Maintenance dépendances préconstruite

```yaml
# .github/workflows/ai-dependency-updates.yml
name: AI dependency updates

on:
  schedule:
    - cron: "17 6 * * 1"
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  updates:
    uses: mirego/agentic/.github/workflows/pi-dependency-updates.yml@v1.0.0
    with:
      base-branch: main
      validation-command: make check
    secrets:
      FORRA_API_KEY: ${{ secrets.FORRA_API_KEY }}
```

## Workflows génériques

### `pi-pr-review.yml`

Pour un prompt custom :

```yaml
jobs:
  review:
    uses: mirego/agentic/.github/workflows/pi-pr-review.yml@v1.0.0
    with:
      profile-name: api-compat
      prompt: |
        Review this PR for breaking API changes, missing validation,
        and backwards-compatibility risks.
      model: forra/gpt-5.6-terra
      thinking-level: high
      severity-threshold: medium
      include-paths: src/,apps/
      exclude-paths: "**/*.snap,**/generated/**"
    secrets:
      FORRA_API_KEY: ${{ secrets.FORRA_API_KEY }}
```

Inputs utiles :

| Input | Défaut | Description |
|-------|--------|-------------|
| `prompt` / `prompt-file` | — | Prompt inline ou fichier toolkit (`caller:path` pour un fichier du repo appelant) |
| `profile-name` | `custom` | Identifiant stable pour dédupliquer les commentaires |
| `model` | `forra/gpt-5.6-terra` | Modèle Pi `provider/id` |
| `thinking-level` | `high` | Niveau de raisonnement Pi |
| `severity-threshold` | `medium` | Sévérité minimale publiée |
| `max-findings` | `25` | Plafond de findings |
| `base-url` | URL Forra Mirego | Endpoint OpenAI-compatible |
| `pi-version` | `^1` | Version ou plage semver npm de Pi (dernière 1.x) |

Le workflow produit un review GitHub avec :

- commentaires inline ancrés sur le diff ;
- findings non ancrables dans le résumé ;
- marqueurs de déduplication entre re-runs et entre pushes (hash sur chemin, titre et sévérité).

### `pi-maintenance.yml`

Pour une tâche de maintenance custom :

```yaml
jobs:
  maintenance:
    uses: mirego/agentic/.github/workflows/pi-maintenance.yml@v1.0.0
    with:
      task-title: Upgrade ESLint flat config
      prompt: |
        Migrate the repository to ESLint flat config.
        Update dependencies and fix broken rules.
      branch-prefix: ai/eslint-flat-config
      base-branch: main
      validation-command: make check
      denied-path-regex: "^\\.github/workflows/"
    secrets:
      FORRA_API_KEY: ${{ secrets.FORRA_API_KEY }}
```

Le job agent produit un patch + `result.json`, puis exécute la commande de validation (`validation-command`) sur ses changements. Le job publisher :

1. ré-applique le patch sur une base propre ;
2. refuse les chemins hors politique ;
3. pousse la branche `branch-prefix` et ouvre/met à jour une PR (draft par défaut si le JSON le demande).

Le nom de branche est fixe (`branch-prefix` tel quel) : chaque run met à jour la même branche et la même PR, même si le titre généré change. Utilisez un `branch-prefix` différent par tâche de maintenance.

## Composition bas niveau : `setup-harness`

Pour un workflow entièrement custom :

```yaml
jobs:
  agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Checkout agentic toolkit
        uses: actions/checkout@v4
        with:
          repository: mirego/agentic
          ref: v1.0.0
          path: .agentic-toolkit
          persist-credentials: false

      - name: Setup Pi harness
        uses: ./.agentic-toolkit/.github/actions/setup-harness
        with:
          pi-version: "^1"
          provider: forra
          base-url: https://interne.scout.mirego.com/api/chat/openai_compatible
          api-key-env: FORRA_API_KEY

      - name: Run Pi
        env:
          FORRA_API_KEY: ${{ secrets.FORRA_API_KEY }}
        run: |
          pi --no-session --no-context-files --no-approve --no-mcp \
            --model forra/gpt-5.6-terra \
            --thinking high \
            --tools read,grep,find,ls \
            -p "Summarize the architecture of this repository."
```

Inputs de `setup-harness` :

| Input | Défaut | Description |
|-------|--------|-------------|
| `pi-version` | `^1` | Version ou plage semver npm de Pi (dernière 1.x) |
| `provider` | `forra` | Nom du provider dans `models.json` |
| `base-url` | URL Forra Mirego | Endpoint OpenAI-compatible |
| `api-key-env` | `FORRA_API_KEY` | Nom de la variable d’environnement lue par `models.json` |
| `models-json` | _(généré)_ | Contenu `models.json` complet si vous voulez remplacer la config Forra |

La action écrit un répertoire de config isolé dans `$RUNNER_TEMP` et exporte `PI_CODING_AGENT_DIR`.

## Artifacts et formats

### Findings de review

```json
{
  "summary": "…",
  "findings": [
    {
      "path": "src/auth/session.ts",
      "start_line": 84,
      "end_line": 90,
      "side": "RIGHT",
      "severity": "high",
      "title": "Authorization bypass",
      "body": "…",
      "confidence": "high"
    }
  ]
}
```

Schéma : [`.github/ai/schemas/review-findings.schema.json`](../.github/ai/schemas/review-findings.schema.json)

### Résultat de maintenance

```json
{
  "summary": "…",
  "has_changes": true,
  "title": "chore: update dependencies",
  "body": "…",
  "labels": ["dependencies"],
  "draft": true,
  "changed_paths": ["package.json", "package-lock.json"]
}
```

Schéma : [`.github/ai/schemas/maintenance-result.schema.json`](../.github/ai/schemas/maintenance-result.schema.json)

## Prompts bundlés

| Fichier | Profil |
|---------|--------|
| `.github/ai/prompts/security-review.md` | sécurité |
| `.github/ai/prompts/bug-review.md` | bugs / régressions |
| `.github/ai/prompts/performance-review.md` | performance |
| `.github/ai/prompts/dependency-updates.md` | mises à jour de dépendances |

Pour un prompt local au projet consommateur, utilisez :

```yaml
with:
  prompt-file: caller:.github/ai/my-custom-review.md
```

## Limites connues

- Les reviews sur forks externes ne doivent pas exposer le secret Forra.
- L’agent de maintenance n’est pas un gestionnaire de dépendances complet : Dependabot/Renovate restent utiles pour la détection simple ; Pi aide surtout pour migrations et correctifs associés.
- Les commentaires inline exigent un ancrage valide sur le diff courant ; sinon le finding bascule dans le résumé.
- Pi est installé par défaut avec la plage `^1` : chaque run prend la dernière version 1.x (mineures et correctifs), sans passer automatiquement à une version majeure. Pour un run reproductible, passez une version exacte (`pi-version: "1.1.0"`). Le passage à Pi 2.x exige un changement explicite du défaut dans ce dépôt.
- Les versions d’actions tierces (`actions/checkout`, `actions/upload-artifact`, etc.) sont pinnées par tag majeur dans ce dépôt — préférez un tag `agentic` immuable côté consommateur.
