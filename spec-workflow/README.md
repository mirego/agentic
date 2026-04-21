# spec-workflow

Pipeline structuré pour passer d'une vision produit à une implémentation livrée. Technologiquement agnostique — s'adapte à tout projet via `make doctor` et `make check`.

## Prompts

| Commande | Description |
|----------|-------------|
| `/spec-workflow` | Dashboard du pipeline : état des initiatives/specs/impls, prochaine action suggérée, routage intelligent |
| `/initiative` | Créer une initiative produit (vision, personas, user stories, découpage en specs) |
| `/spec` | Créer une spécification technique (discussion → spec → PR) |
| `/impl` | Implémenter une spec à partir d'un slug de spec |

### `/spec-workflow`

Orchestrateur du pipeline. Donne une vue d'ensemble de l'état du travail en cours et chaîne vers le bon prompt selon le contexte. Lecture seule — ne crée aucun fichier lui-même.

**Sous-commandes :**

| Commande | Action |
|----------|--------|
| `/spec-workflow` ou `/spec-workflow status` | Affiche le dashboard complet du pipeline (initiatives, specs, PRs, statuts) |
| `/spec-workflow next` | Détermine et propose la prochaine action logique du pipeline |
| `/spec-workflow start <description>` | Évalue le scope et route vers `/initiative` ou `/spec` |
| `/spec-workflow impl <slug>` | Raccourci vers `/impl <slug>` avec vérification des prérequis |

**Exemple de dashboard :**

```
📋 Pipeline Status

Branche courante : feature/refonte-onboarding

Initiative: Refonte onboarding (1/4 specs done)
├─ ✅ welcome-screen — implémentée (PR #42 merged)
├─ 🔨 profile-setup — impl en cours (PR impl #51 draft)
├─ 📬 email-verification — prête pour /impl (PR spec #55 merged)
├─ 📄 tutorial-tour — spec locale non pushée
└─ ⏳ permissions-onboarding — pending

**Prochaine action suggérée :** reprendre l'impl `profile-setup` (PR #51 draft)

Autres options :
- Lancer /impl email-verification (spec mergée, prête)
- Pousser la spec tutorial-tour vers une PR
- Créer la spec pending permissions-onboarding
```

Icônes : ⏳ pending · 📄 spec locale · 📝 spec en review · 📬 prête pour /impl · 🔨 impl en cours · ✅ done.

Principe directeur du `next` : **finir avant de commencer** — les fast-tracks en draft ont priorité sur le démarrage d'une nouvelle impl. Les états passifs (📝, PR impl en review) apparaissent en options secondaires, jamais en recommandation principale.

### `/initiative`

Workflow Product Owner pour créer une initiative — une unité de planification de haut niveau qui regroupe plusieurs specs sous une même vision produit.

**Phases :** Discovery produit → Exploration du codebase → Vision et user stories → Découpage en specs → Rédaction du document → Backlog et GitHub

**Produit :** `docs/initiatives/<slug>.md` + items dans `BACKLOG.md` + PR

### `/spec`

Workflow architecte pour planifier un changement et produire une spécification formelle (PRD, RFC ou Libre).

**Phases :** Vérification de l'environnement → Discovery (avec résolution intelligente d'initiative) → Exploration du codebase → Design itératif → Rédaction du document → Intégration

**Produit :** `docs/specs/<slug>.md` + PR — soit séparée (flow classique, review dédiée de la spec), soit combinée avec `/impl` en mode **fast-track** (une seule PR contenant spec et impl).

À la phase d'intégration, `/spec` détecte le contexte (solo vs équipe, via `git log`) et propose le mode approprié; l'utilisateur garde toujours le choix final.

### `/impl`

Workflow développeur senior pour implémenter un changement défini par une spec. Vérifie que la PR de spec est mergée avant de démarrer (sauf en mode fast-track, où spec et impl partagent la même branche).

**Phases :** Vérification de l'environnement → Chargement du contexte → Exploration du codebase → Plan d'exécution → Implémentation (commits atomiques + tests) → GitHub

**Produit :** Commits atomiques + archivage de la spec dans `docs/specs/impl/` + PR draft

### Pipeline complet

```
/initiative "vision"  →  PR d'initiative  →  review/merge
                              │
                              ├── /spec (spec 1)
                              ├── /spec (spec 2)
                              └── /spec (spec 3)
                                      │
                                      └── /impl <slug>  →  PR d'impl (draft)
```

Pour les changements techniques (RFC) ou petits changements (Libre), le pipeline peut démarrer directement à `/spec` sans initiative.

En mode fast-track, `/spec` enchaîne directement avec `/impl` sur la même branche et produit une seule PR combinée — utile en solo ou quand la spec est suffisamment claire pour ne pas nécessiter de review séparée.

`/spec-workflow` sert de porte d'entrée à tout le pipeline : en cas de doute sur l'état du travail en cours ou sur la prochaine étape, lance `/spec-workflow` pour voir le dashboard ou `/spec-workflow next` pour laisser l'orchestrateur proposer la prochaine action.

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
