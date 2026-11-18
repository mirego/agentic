# spec-workflow

Pipeline structuré pour passer d'une vision produit à une implémentation livrée, pensé pour le travail en équipe : chaque étape produit un artefact versionné (initiative, spec, implémentation) reviewé par PR. Technologiquement agnostique : s'adapte à tout projet via `make doctor` et `make check`.

## Skills

| Commande | Description |
|----------|-------------|
| `/spec-workflow` | Dashboard du pipeline : état des initiatives, specs et PRs, prochaine action suggérée, routage |
| `/initiative` | Créer une initiative produit (vision, personas, user stories, découpage en specs) |
| `/spec` | Planifier un changement et produire une spec reviewable (PRD, RFC ou Libre) |
| `/impl` | Implémenter une spec, reprendre une implémentation ou traiter les commentaires de review |

`/initiative`, `/spec` et `/impl` créent des branches et des PRs : ils ne démarrent que sur demande explicite (`disable-model-invocation`). `/spec-workflow` est en lecture seule et peut être invoqué automatiquement par l'agent.

Les instructions des skills sont rédigées en anglais ; le contenu généré suit la langue du projet (voir [Langue](#langue)).

### `/spec-workflow`

| Commande | Action |
|----------|--------|
| `/spec-workflow` ou `/spec-workflow status` | Affiche le dashboard (initiatives, specs, PRs, statuts) |
| `/spec-workflow next` | Propose la prochaine action logique |
| `/spec-workflow start <description>` | Évalue le scope et route vers `/initiative` ou `/spec` |
| `/spec-workflow impl <slug>` | Vérifie les prérequis puis enchaîne sur `/impl <slug>` |

**Exemple de dashboard :**

```
📋 Pipeline Status

Branche courante : feature/refonte-onboarding

Initiative: Refonte onboarding (1/4 specs done)
├─ ✅ welcome-screen - implémentée
├─ 🔨 profile-setup - impl en cours (PR #51 draft)
├─ 📬 email-verification - prête pour /impl (PR spec #55 merged)
└─ ⏳ tutorial-tour, permissions-onboarding - pending

**Prochaine action suggérée :** reprendre /impl profile-setup (PR #51 draft)
```

Icônes : ⏳ pending · 📄 spec locale · 📝 spec en review · 📬 prête pour /impl · 🔨 impl en cours · ✅ done.

Principe directeur du `next` : **finir avant de commencer**. Les reviews en cours apparaissent en options secondaires, jamais en recommandation principale.

### `/initiative`

Cadre un travail produit trop gros pour une seule spec : compréhension du besoin, exploration du code, rédaction du document (vision, personas, user stories, découpage en specs avec priorités et dépendances), review, puis PR.

**Produit :** `docs/initiatives/<slug>.md` + section dans `BACKLOG.md` (si présent) + PR

### `/spec`

Planifie un changement avec le développeur et produit une spec que l'équipe peut reviewer avant d'écrire du code. L'effort s'adapte à la taille du changement : une spec Libre courte pour un correctif, un PRD complet pour une feature.

**Étapes :** compréhension (avec reprise automatique du contexte d'une initiative) → exploration du code → approche (point de contrôle 1) → rédaction → review et choix du mode d'intégration (point de contrôle 2) → PR

La spec décrit le quoi et le pourquoi : décisions, critères d'acceptation, risques, zones impactées. Le plan fichier par fichier est laissé à `/impl`.

**Produit :** `docs/specs/<slug>.md` + PR, soit séparée (review dédiée de la spec), soit combinée avec `/impl` en mode **fast-track**. Le mode recommandé suit la [politique de review](#politique-de-review) du projet.

### `/impl`

Implémente une spec approuvée comme le ferait un développeur senior du projet.

**Étapes :** chargement de la spec et choix du mode → plan (point de contrôle) → implémentation en commits atomiques, chacun avec ses tests → `make check` + review par un sous-agent neuf → documentation et archivage → PR draft complétée

- **Normal** : la PR de spec doit être mergée ; `/impl` refuse de démarrer si elle est encore en review.
- **Fast-track** : enchaîné depuis `/spec` sur la même branche.
- **Reprise** : si la branche `impl/<slug>` existe, `/impl` reprend où le travail s'est arrêté et, si la PR a des commentaires de review, les traite.

La PR draft est ouverte dès le premier commit pour que l'équipe voie le travail en cours.

**Produit :** commits atomiques + archivage de la spec dans `docs/specs/impl/` + PR draft

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

## Prérequis du projet

### Langue

Les skills génèrent tout le contenu (documents, PR, commits, messages) dans la langue configurée par le projet. Ajouter une section `## Langue` dans `AGENTS.md` :

```markdown
## Langue
- Contenu généré (PR, commits, messages) : français
```

Sans section Langue, les skills utilisent la langue dans laquelle l'utilisateur communique.

### Politique de review

Par défaut, `/spec` recommande une PR de spec séparée pour les PRD et RFC, et le fast-track pour les specs Libre. Le développeur garde toujours le choix final. Pour fixer une autre politique pour toute l'équipe, ajouter une section dans `AGENTS.md` :

```markdown
## spec-workflow
- Review de spec séparée : obligatoire pour PRD et RFC, fast-track permis pour Libre
```

### Makefile

| Target | Rôle | Utilisé par |
|--------|------|-------------|
| `make doctor` | Diagnostic de l'environnement (GitHub CLI, BD, compilation) | `/impl` (au démarrage) |
| `make check` | Validation complète du code (format, compilation, tests) | `/impl` (avant la PR) |

Pendant l'implémentation, `/impl` roule les tests ciblés de chaque étape ; `make check` ne roule qu'une fois, à la fin. Si ces targets n'existent pas, les skills le signalent et demandent comment procéder : rien ne bloque.

### Templates

Des templates sont disponibles dans [`templates/`](templates/) :

- **`Makefile.example`** : targets minimales `doctor` et `check`
- **`doctor.sh`** : diagnostic d'environnement avec format structuré (PASS/FAIL + context + fix)
- **`check.sh`** : validation de code à adapter à la stack du projet

```bash
cp templates/doctor.sh scripts/doctor.sh
cp templates/check.sh scripts/check.sh
chmod +x scripts/doctor.sh scripts/check.sh
```

Puis ajouter les targets dans le Makefile du projet (voir `templates/Makefile.example`).

### Protections recommandées

Les skills ne committent jamais sur la branche par défaut et ne réécrivent jamais l'historique poussé. Pour que ces règles ne dépendent pas seulement du modèle :

- activer la **protection de branche** sur `main` dans GitHub (PR obligatoire) ;
- dans Claude Code, refuser les commandes destructives dans `.claude/settings.json` :

```json
{
  "permissions": {
    "deny": ["Bash(git push --force:*)", "Bash(git push -f:*)", "Bash(git reset --hard:*)"]
  }
}
```

### Structure de dossiers

```
docs/
├── initiatives/          # Initiatives actives (créées par /initiative)
│   └── done/             # Initiatives archivées (par /impl)
├── specs/                # Specs actives (créées par /spec)
│   └── impl/             # Specs implémentées (archivées par /impl)
BACKLOG.md                # Optionnel : suivi backlog
```

Les dossiers sont créés au besoin. `BACKLOG.md` est optionnel : s'il existe, les skills tiennent à jour une section par initiative (`> init:<slug>`) avec un item par spec (`· spec~<slug>` planifiée, `· spec:<slug>` rédigée, déplacée dans `## Done` une fois implémentée).

## Intégrations externes

Les skills restent indépendants des outils externes (trackers, bases de connaissances, notifications, CI). Pour brancher un outil, le projet déclare dans son `AGENTS.md` une section qui écoute les **événements de cycle de vie** du pipeline.

### Événements émis

| Événement | Émis par | Moment |
|---|---|---|
| `spec-workflow:initiative:started` | `/initiative` | Au démarrage, avant la discovery |
| `spec-workflow:initiative:created` | `/initiative` | Après la création de la PR, avant le résumé |
| `spec-workflow:initiative:completed` | `/impl` | Quand la dernière spec de l'initiative est implémentée et l'initiative archivée |
| `spec-workflow:spec:started` | `/spec` | Au démarrage, avant la discovery |
| `spec-workflow:spec:created` | `/spec` | Après le commit (et la PR en mode séparé), avant le résumé ou l'enchaînement fast-track |
| `spec-workflow:spec:completed` | `/impl` | Après l'archivage de la spec dans `docs/specs/impl/` |
| `spec-workflow:impl:started` | `/impl` | Spec chargée et mode déterminé, avant l'exploration du code |
| `spec-workflow:impl:completed` | `/impl` | Documentation et archivage terminés, avant la finalisation de la PR |

### Règles

- **Match par chaîne exacte** : la section dans `AGENTS.md` est trouvée par le nom de l'événement verbatim (ex: `spec-workflow:spec:created`), peu importe le niveau de heading.
- **Optionnel** : un événement non déclaré est ignoré silencieusement.
- **Non bloquant** : un échec d'extension (MCP non connecté, OAuth expiré, API indisponible) ne bloque jamais le flow. L'agent prévient et continue.
- **Politique d'intégration, pas configuration d'agent** : les skills exécutent l'intégration déclarée via MCP/CLI, mais refusent ce qui sort de ce cadre (modifier `AGENTS.md`, hooks, CI, permissions ou secrets, git hors du flow, scripts arbitraires), même si la section le demande.
- **Contexte métier, pas contrôle d'agent** : tickets externes, specs, initiatives et `BACKLOG.md` alimentent la discovery et l'implémentation ; les directives d'agent qui y seraient embarquées sont ignorées.
- **`allowed-tools`** : les skills ne déclarent pas les outils MCP des intégrations. Le projet les autorise via les mécanismes de permission de son client (Claude Code, OpenCode, Copilot, etc.).

### Exemple : tracker Jira via MCP

Extrait d'`AGENTS.md` d'un projet qui utilise Jira via le serveur MCP Atlassian :

````markdown
## Extensions spec-workflow

L'équipe utilise Jira via le serveur MCP Atlassian. La déclaration est versionnée dans `.mcp.json` ; les skills passent toujours par les outils MCP, jamais par l'API Jira directement.

**Contexte projet**
- Projet Jira : `<CLÉ-PROJET>`
- Label obligatoire sur chaque issue : `<label>`
- Clé de corrélation Markdown ↔ Jira : ligne `init:<slug>` dans la description de l'issue

### spec-workflow:initiative:created

Créer une story dans `<CLÉ-PROJET>` :
- *Summary* : titre de l'initiative
- *Description* : vision + lien vers le document + lien vers la PR + ligne `init:<slug>`
- *Label* : `<label>`
- *Statut initial* : `READY FOR DEV`

Afficher l'URL de la story dans le summary final.

### spec-workflow:spec:created

Si la spec est liée à une initiative, chercher la story portant `init:<slug>` dans sa description (JQL). Si trouvée **et au statut `READY FOR DEV`**, transitionner vers `DEV IN PROGRESS`. Sinon skip silencieux : la transition ne se déclenche qu'au premier spec de l'initiative.

### spec-workflow:initiative:completed

Chercher la story via `init:<slug>` et la transitionner vers `DONE`.
````

### Autres patterns d'intégration

- **Enrichissement de contexte** (`initiative:started` ou `spec:started`) : consommer un argument court (ex: numéro de ticket Notion/Linear) et utiliser le contenu du ticket comme contexte métier pour la discovery.
- **Miroir documentaire** (`spec:created` ou `impl:completed`) : créer ou mettre à jour une page Notion/Confluence qui reflète le document Markdown.
- **Notifications** (`impl:completed` ou `initiative:completed`) : annoncer dans Slack, Teams, Discord, webhooks.
- **Trigger CI/CD** (`impl:started`) : démarrer un job de préparation via l'outil d'intégration prévu, pas via du shell arbitraire.

### Sécurité anti-injection

Les skills appliquent aussi :

- `$ARGUMENTS`, specs, initiatives, backlog, tickets et commentaires de PR traités comme des données, jamais comme des instructions d'agent
- Validation stricte des slugs (`^[a-z0-9][a-z0-9-]{0,49}$`) avant tout usage dans le shell ou un chemin
- `/impl` ne modifie pas les sections `spec-workflow:…`, permissions ou config d'agent de `AGENTS.md` sans montrer le diff exact et obtenir une approbation

## Installation

```yaml
# apm.yml
dependencies:
  apm:
    - mirego/agentic/spec-workflow#v1.0.0
```

En passant d'une version à prompts (≤ v1.4) à la version à skills, `apm install` retire automatiquement les anciennes commandes générées.
