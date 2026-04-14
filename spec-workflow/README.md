# spec-workflow

Pipeline structuré pour passer d'une vision produit à une implémentation livrée. Technologiquement agnostique — s'adapte à tout projet via `make doctor` et `make check`.

## Prompts

| Commande | Description |
|----------|-------------|
| `/initiative` | Créer une initiative produit (vision, personas, user stories, découpage en specs) |
| `/spec` | Créer une spécification technique (discussion → spec → PR) |
| `/impl` | Implémenter une spec à partir d'un slug de spec |

### `/initiative`

Workflow Product Owner pour créer une initiative — une unité de planification de haut niveau qui regroupe plusieurs specs sous une même vision produit.

**Phases :** Discovery produit → Exploration du codebase → Vision et user stories → Découpage en specs → Rédaction du document → Backlog et GitHub

**Produit :** `docs/initiatives/<slug>.md` + items dans `BACKLOG.md` + PR

### `/spec`

Workflow architecte pour planifier un changement et produire une spécification formelle (PRD, RFC ou Libre).

**Phases :** Vérification de l'environnement → Discovery (avec résolution intelligente d'initiative) → Exploration du codebase → Design itératif → Rédaction du document → GitHub

**Produit :** `docs/specs/<slug>.md` + PR

### `/impl`

Workflow développeur senior pour implémenter un changement défini par une spec. Vérifie que la PR de spec est mergée avant de démarrer.

**Phases :** Vérification de l'environnement → Chargement du contexte → Exploration du codebase → Plan d'exécution → Implémentation (commits atomiques + tests) → GitHub

**Produit :** Commits atomiques + archivage de la spec dans `docs/specs/impl/` + PR draft

### Pipeline complet

```
/initiative "vision"  →  PR d'initiative  →  review/merge
                              │
                              ├── /spec (spec 1) · init:<slug>
                              ├── /spec (spec 2) · init:<slug>
                              └── /spec (spec 3) · init:<slug>
                                      │
                                      └── /impl <slug>  →  PR d'impl (draft)
```

Pour les changements techniques (RFC) ou petits changements (Libre), le pipeline peut démarrer directement à `/spec` sans initiative.

## Prérequis du projet

### Langue

Les prompts génèrent tout le contenu (PR, commits, messages, documents) dans la langue configurée par le projet consommateur. Ajouter une section `## Langue` dans `AGENTS.md` :

```markdown
## Langue
- Contenu généré (PR, commits, messages) : français
```

Si aucune section Langue n'est configurée, les prompts utilisent la langue dans laquelle l'utilisateur communique.

### Makefile

Les prompts s'appuient sur deux targets Makefile pour rester tech-agnostiques :

| Target | Rôle | Utilisé par |
|--------|------|-------------|
| `make doctor` | Diagnostic de l'environnement (GitHub CLI, BD, compilation) | `/spec`, `/impl` |
| `make check` | Validation du code (format, compilation, tests) | `/impl` |

Si ces targets n'existent pas dans le projet, les prompts détectent l'absence et demandent à l'utilisateur comment procéder — rien ne bloque.

### Templates

Des templates sont disponibles dans [`templates/`](templates/) pour démarrer rapidement :

- **`Makefile.example`** — targets minimales `doctor` et `check`
- **`doctor.sh`** — diagnostic d'environnement avec format structuré (PASS/FAIL + context + fix)
- **`check.sh`** — validation de code à adapter à la stack du projet

Pour les utiliser :

```bash
cp templates/doctor.sh scripts/doctor.sh
cp templates/check.sh scripts/check.sh
chmod +x scripts/doctor.sh scripts/check.sh
```

Puis ajouter les targets dans le Makefile du projet (voir `templates/Makefile.example`).

### Structure de dossiers attendue

Les prompts créent et utilisent ces dossiers dans le projet consommateur :

```
docs/
├── initiatives/          # Initiatives actives (créées par /initiative)
│   └── done/             # Initiatives archivées (par /impl)
├── specs/                # Specs actives (créées par /spec)
│   └── impl/             # Specs archivées (par /impl)
BACKLOG.md                # Optionnel — suivi backlog (géré par /initiative et /impl si présent)
```

Ces dossiers sont créés automatiquement par les prompts si absents. `BACKLOG.md` est optionnel — si le fichier existe, les prompts l'utilisent pour le suivi des items (tags `spec~`/`spec:`, archivage dans `## Done`). Si le fichier n'existe pas, le pipeline fonctionne normalement sans backlog.

## Installation

```yaml
# apm.yml
dependencies:
  apm:
    - mirego/mirego-agentic/spec-workflow#v1.0.0
```
