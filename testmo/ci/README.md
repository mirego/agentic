# Brique CI — publication des résultats dans Testmo

Publie les résultats des tests automatisés (JUnit XML) dans [Testmo](https://www.testmo.com) sous forme de run automatisé, relié au changement (PR), au commit, à son auteur et au build. Fonctionne pour toute stack capable de produire du JUnit XML, et pour toute CI.

Deux couches :

| Fichier | Rôle |
|---------|------|
| `publish.sh` | Cœur indépendant de la CI (bash + jq + `npx @testmo/testmo-cli@1.5.0`). Toutes les entrées sont des variables d'environnement explicites. |
| `action.yml` | Enveloppe GitHub Actions : déduit du contexte GitHub le nom du run, le commit, la branche, les liens et les tags, puis appelle `publish.sh`. |

**Jamais bloquant.** Token absent, fichiers de résultats absents, configuration absente ou échec du CLI : avertissement et sortie 0. Un run en échec est justement celui que la QA doit voir : l'étape tourne même quand les tests échouent, mais seulement une fois le code récupéré (voir plus bas).

**Token protégé.** Le token n'est lu que dans `TESTMO_TOKEN` par le CLI Testmo. Il n'est jamais affiché ni passé en argument.

## Prérequis

- Un `.testmo.json` à la racine du repo (voir le skill `/testmo-setup`), avec au minimum :

  ```json
  { "instance": "https://<nom>.testmo.net", "project_id": 123 }
  ```

- Un secret `TESTMO_TOKEN` : la clé d'API d'un utilisateur API Testmo autorisé à soumettre des runs automatisés dans le projet. De préférence un secret d'organisation, partagé par tous les repos.
- Node ≥ 22 et `jq` sur le runner. L'action installe Node elle-même ; `jq` est présent sur les runners hébergés par GitHub.

## GitHub Actions

```yaml
- id: checkout
  uses: actions/checkout@v4

- run: mix test   # ou toute commande qui écrit du JUnit XML
  env:
    JUNIT_REPORT: "1"

- name: Publish results to Testmo
  # Tourne même si les tests échouent, mais pas si le job a échoué avant le
  # checkout : l'action n'existerait pas et l'étape ajouterait une erreur trompeuse.
  if: always() && steps.checkout.outcome == 'success'
  uses: mirego/agentic/testmo/ci@<tag>
  with:
    token: ${{ secrets.TESTMO_TOKEN }}
    results: _build/test/lib/my_app/test-junit-report.xml
    source: backend-unit
```

Utiliser le même `<tag>` que la dépendance `mirego/agentic/testmo#<tag>` de `apm.yml`. Quand le workflow est réutilisé par un autre (`workflow_call`, par exemple depuis un workflow de déploiement), transmettre le secret avec `secrets: inherit`.

### Entrées

| Entrée | Requise | Défaut | Description |
|--------|---------|--------|-------------|
| `token` | Non | `''` | Clé d'API Testmo. Vide : publication sautée avec un avertissement (ex. PR d'un fork). |
| `results` | ✅ Oui | - | Glob des fichiers JUnit XML. Le mettre entre guillemets pour utiliser `**`. |
| `source` | ✅ Oui | - | Source Testmo, une par suite (`backend-unit`, `ios-unit`, `android-unit`…). |
| `config-file` | Non | `.testmo.json` | Chemin de la configuration du projet. |

### Ce que l'action déduit

| Valeur | Sur une pull request | Sinon |
|--------|----------------------|-------|
| Nom du run | `PR #<n> — <titre>` | `<branche> @ <sha court>` |
| Commit | SHA de tête de la PR (pas le commit de fusion que GitHub teste) | `github.sha` |
| Branche | branche de tête de la PR | `github.ref_name` |
| Tags | `pr` | le nom de la branche (`/` et `:` deviennent `-`) |
| Champs | Commit, Branch, Author (auteur de la PR), Triggered by (`github.actor`) | Commit, Branch, Triggered by |
| Liens | Change (PR), Commit, Build | Commit, Build |

Un run Testmo est créé par source et par exécution de la CI. Chaque résultat de test hérite des liens de son run.

## Toute autre CI (ou Fastlane)

APM ne déploie pas la brique CI dans le projet consommateur. Récupérer `publish.sh` au même tag que le paquet, puis l'appeler avec les variables d'environnement ci-dessous :

```bash
curl -fsSL https://raw.githubusercontent.com/mirego/agentic/<tag>/testmo/ci/publish.sh -o publish.sh

TESTMO_TOKEN=*** \
TESTMO_RESULTS="build/test-results/**/*.xml" \
TESTMO_SOURCE=android-unit \
TESTMO_RUN_NAME="main @ $(git rev-parse --short HEAD)" \
TESTMO_COMMIT="$(git rev-parse HEAD)" \
TESTMO_BRANCH="$(git rev-parse --abbrev-ref HEAD)" \
bash publish.sh
```

| Variable | Requise | Description |
|----------|---------|-------------|
| `TESTMO_TOKEN` | ✅ Oui | Clé d'API Testmo (secret) |
| `TESTMO_RESULTS` | ✅ Oui | Glob des fichiers JUnit XML |
| `TESTMO_SOURCE` | ✅ Oui | Source Testmo, une par suite |
| `TESTMO_RUN_NAME` | ✅ Oui | Nom du run |
| `TESTMO_COMMIT`, `TESTMO_BRANCH` | ✅ Oui | SHA et branche du changement |
| `TESTMO_CONFIG` | Non | Chemin de `.testmo.json` (défaut : `.testmo.json`) |
| `TESTMO_CHANGE_URL`, `TESTMO_CHANGE_AUTHOR` | Non | Lien et auteur du changement (PR, MR…) |
| `TESTMO_TRIGGERED_BY`, `TESTMO_BUILD_URL`, `TESTMO_COMMIT_URL` | Non | Qui a déclenché le build, lien du build, lien du commit |
| `TESTMO_TAGS` | Non | Tags du run, séparés par des virgules ou des espaces |
| `TESTMO_CLI` | Non | Remplace la commande du CLI (utilisé par les tests du paquet) |

## Dépannage

### « TESTMO_TOKEN absent — publication Testmo sautée. »

Le secret n'est pas disponible pour le job : secret manquant, PR d'un fork, ou workflow réutilisé sans `secrets: inherit`.

### « aucun fichier de résultats pour … »

Le reporter JUnit n'est pas activé, ou il écrit ailleurs. Vérifier la configuration du reporter de la stack (voir `testmo-setup/references/stacks.md`).

### « échec du CLI Testmo »

Lire la sortie du CLI juste au-dessus de l'avertissement :

- `401 Unauthenticated` : la valeur du secret n'est pas une clé valide ;
- `404 The project does not exist or you do not have the permissions to access it` : la clé est valide, mais son utilisateur n'a pas accès au projet ;
- Testmo indisponible.

Le build n'est pas affecté.
