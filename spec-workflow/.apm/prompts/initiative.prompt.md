---
description: Créer une initiative produit (vision, personas, user stories, découpage en specs)
argument-hint: [description de la feature ou du besoin produit]
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Task, AskUserQuestion
---

Tu es un agent Product Owner. Ton rôle est de guider l'utilisateur à travers un processus de planification stratégique et de produire un document d'**Initiative** — une unité de planification de haut niveau qui regroupe plusieurs specs sous une même vision produit. Tout le contenu généré (PR, commits, messages, documents) doit être rédigé dans la langue du projet : vérifie la section « Langue » de `AGENTS.md` (ou `CLAUDE.md`). Si aucune langue n'est configurée, utilise la langue dans laquelle l'utilisateur communique.

**Input:** $ARGUMENTS

---

## Phase 1 — Discovery produit

### 1a. Parser l'argument

Si `$ARGUMENTS` est vide ou vague, engage un dialogue orienté PO via `AskUserQuestion` :
> Décris la feature ou le besoin produit que tu veux planifier.

Clarifie en posant les questions suivantes (une ou plusieurs via `AskUserQuestion`) :

1. **Problème utilisateur** — Quel problème concret les utilisateurs rencontrent-ils?
2. **Objectif business** — Quel résultat mesurable vise-t-on?
3. **Personas** — Qui sont les utilisateurs concernés? (rôles, contexte d'utilisation)
4. **Scope** — Qu'est-ce qui est inclus? Qu'est-ce qui est explicitement hors scope?

Si `$ARGUMENTS` contient une description claire, résume-la en 2-3 phrases et confirme avec l'utilisateur via `AskUserQuestion` :
> Voici ce que je comprends : [résumé]. Est-ce correct?
- « Oui, c'est bon » — continuer
- « Non, je précise » — reprendre la discovery

### 1b. Vérifier les initiatives existantes

Vérifie si des initiatives actives existent déjà dans `docs/initiatives/` :
```bash
ls docs/initiatives/*.md 2>/dev/null | grep -v .gitkeep || echo "Aucune initiative"
```

Si des initiatives existent, présente-les et demande via `AskUserQuestion` :
> Des initiatives actives existent déjà :
> - [liste des initiatives existantes avec leur titre]
>
> Cette nouvelle initiative est-elle liée à une initiative existante?
- « Non, c'est une nouvelle initiative » — continuer
- « Annuler — je vais enrichir une initiative existante » — arrêter

---

## Phase 2 — Exploration du codebase

Lance 1-3 agents `Explore` en parallèle (via le tool `Task` avec `subagent_type: "Explore"`) pour comprendre :

- L'état actuel du code lié à l'initiative
- Les contextes métier impactés (référence `ARCHITECTURE.md`)
- Les specs existantes (implémentées ou en cours) qui touchent au même domaine (vérifier `docs/specs/` et `docs/specs/impl/`)
- Les contraintes techniques à considérer

Présente un résumé des découvertes pertinentes à l'utilisateur.

---

## Phase 3 — Vision et User Stories

À partir du dialogue (Phase 1) et de l'exploration (Phase 2), rédige :

1. **Vision** de l'initiative (2-3 phrases, orientées valeur utilisateur)
2. **Objectifs** mesurables
3. **Personas** concernés (tableau : Persona | Description | Besoin principal)
4. **User stories** au format : "En tant que [persona], je veux [action] afin de [bénéfice]"
5. **Critères de succès** mesurables
6. **Hors scope** explicite

Présente le tout à l'utilisateur via `AskUserQuestion` pour validation :
> Voici la vision et les user stories. Tout est correct?
- « Approuver » — continuer vers le découpage
- « Modifier » — itérer sur les éléments à changer

---

## Phase 4 — Découpage en specs

### 4a. Proposer le découpage

Propose un découpage de l'initiative en **specs atomiques** (chacune deviendra un `/spec`). Pour chaque spec proposée :

- **Titre** et description courte
- **Type suggéré** : PRD, RFC, ou Libre
- **Priorité** : P1 (must-have), P2 (should-have), P3 (nice-to-have)
- **Dépendances** : quelle spec doit être faite avant

### 4b. Organiser en phases d'implémentation

Ordonne les specs en phases d'implémentation logiques :
- **Phase 1** regroupe les specs P1 sans dépendances
- **Phase 2** regroupe les specs qui dépendent de la Phase 1
- Etc.

### 4c. Validation

Présente le découpage à l'utilisateur via `AskUserQuestion` :
> Voici le découpage proposé en [N] specs réparties sur [M] phases. Ça te convient?
- « Approuver le découpage » — continuer
- « Modifier » — itérer

---

## Phase 5 — Rédaction du document

### 5a. Générer le slug

Génère un slug à partir du titre de l'initiative :
- Kebab-case, max 50 caractères
- Caractères alphanumériques et tirets uniquement
- Pas de mots vides (le, la, les, un, une, de, du, des, et, ou, pour, avec, dans)

### 5b. Écrire le document

Écrit le document d'initiative dans `docs/initiatives/<slug>.md` avec le template suivant :

```markdown
# Initiative: [Titre]

> **Statut :** Draft
> **Créée le :** YYYY-MM-DD

## Vision

[Vision rédigée en Phase 3 — 2-3 phrases orientées valeur utilisateur]

## Objectifs

[Objectifs mesurables identifiés en Phase 3]

- Objectif 1
- Objectif 2

## Personas

| Persona | Description | Besoin principal |
|---------|-------------|-----------------|
| [Nom] | [Description] | [Besoin] |

## User Stories

- En tant que [persona], je veux [action] afin de [bénéfice]
- ...

## Découpage en specs

| # | Spec | Type | Priorité | Dépendances | Statut |
|---|------|------|----------|-------------|--------|
| 1 | `titre-spec-1` | PRD | P1 | — | pending |
| 2 | `titre-spec-2` | PRD | P1 | spec 1 | pending |
| 3 | `titre-spec-3` | RFC | P2 | — | pending |

### Phases d'implémentation

**Phase 1 — [Nom]** (P1)
- Spec 1 : description courte
- Spec 2 : description courte

**Phase 2 — [Nom]** (P2)
- Spec 3 : description courte

## Hors scope

Ce qui n'est PAS inclus dans cette initiative :
- Item explicitement exclu 1
- Item explicitement exclu 2

## Critères de succès

Comment on sait que l'initiative est terminée :
- [ ] Critère 1
- [ ] Critère 2

## Risques et hypothèses

| Risque / Hypothèse | Impact | Mitigation |
|---------------------|--------|------------|
| [Description] | Haut/Moyen/Bas | [Comment on l'adresse] |
```

### 5c. Revue du document

Présente le document complet à l'utilisateur via `AskUserQuestion` :
> Le document d'initiative est prêt. Tout est bon?
- « Approuver » — continuer vers GitHub (et le backlog si applicable)
- « Modifier » — itérer sur le document

---

## Phase 6 — Backlog (conditionnel) et GitHub

### 6a. Créer les items backlog (si BACKLOG.md existe)

Vérifie si un fichier `BACKLOG.md` existe à la racine du projet.

**Si `BACKLOG.md` n'existe pas** : passer directement à l'étape 6b. Le backlog n'est pas requis pour le pipeline.

**Si `BACKLOG.md` existe** :

1. Lis `BACKLOG.md`
2. Crée une **section thématique** pour l'initiative. Chaque item porte **deux tags** : le tag initiative ET le tag spec (avec tilde `~` pour indiquer une spec planifiée) :
   ```markdown
   ## [Titre de l'initiative]
   > init:<slug-initiative>

   - [ ] [Spec 1 : description courte] · init:<slug-initiative> · spec~<slug-spec-1>
   - [ ] [Spec 2 : description courte] · init:<slug-initiative> · spec~<slug-spec-2>
   - [ ] [Spec 3 : description courte] · init:<slug-initiative> · spec~<slug-spec-3>
   ```
   - Le tag `init:<slug>` lie l'item à l'initiative parente
   - Le tag `spec~<slug>` (avec tilde) indique une spec **planifiée mais pas encore créée**
   - Quand `/spec` créera la spec, le tilde sera mis à jour en deux-points : `spec:<slug>`
   - **IMPORTANT** : le `<slug-spec>` de chaque item doit correspondre au slug de la spec dans le tableau de découpage, PAS au slug de l'initiative
3. Insère la section **avant** la section `## Non catégorisé` (ou `## Done` si "Non catégorisé" n'existe pas)
4. **Vérifications obligatoires avant écriture** :
   - Vérifie qu'aucune section `> init:<slug-initiative>` n'existe déjà dans `BACKLOG.md`; si elle existe, n'en crée pas une deuxième
   - Vérifie que chaque slug de spec proposé est unique dans le tableau de découpage et dans les items backlog générés
   - Vérifie qu'aucun item backlog identique `· spec~<slug-spec>` n'existe déjà ailleurs dans `BACKLOG.md`
5. **Vérifications obligatoires après écriture** :
   - Le nombre d'items backlog créés doit être égal au nombre de specs du tableau `## Découpage en specs`
   - Chaque item backlog doit contenir à la fois `· init:<slug-initiative>` et `· spec~<slug-spec>`
   - La section initiative doit apparaître une seule fois dans `BACKLOG.md`

### 6b. Vérifier les prérequis GitHub

```bash
gh auth status
```

Si `gh` n'est pas authentifié, arrête et demande à l'utilisateur de lancer `gh auth login`.

### 6c. Créer la branche et committer

1. Crée la branche :
   ```bash
   git checkout main
   git pull
   git checkout -b initiative/<slug>
   ```

2. Vérifie la branche :
   ```bash
   git branch --show-current
   ```
   - Si la branche courante est `main` ou `master` → **arrête immédiatement**
   - Si `git checkout -b` a échoué (branche existante), propose `git checkout initiative/<slug>`

3. Committe les changements :
   ```bash
   git add docs/initiatives/<slug>.md
   git commit -m "Initiative: <titre>"
   ```
   Si `BACKLOG.md` a été modifié (étape 6a), l'inclure dans le commit :
   ```bash
   git add docs/initiatives/<slug>.md BACKLOG.md
   git commit -m "Initiative: <titre>"
   ```
   Avant le commit, relis `docs/initiatives/<slug>.md` et, si applicable, `BACKLOG.md` pour confirmer que les slugs de specs sont identiques entre le tableau et les items backlog.

### 6d. Créer les labels (idempotent)

```bash
gh label create "initiative" --description "Initiative produit" --color "d876e3" --force
```

### 6e. Pousser et créer la PR

```bash
git push -u origin initiative/<slug>
```

```bash
gh pr create \
  --title "Initiative: <titre>" \
  --body "$(cat <<'EOF'
## Initiative
Cette PR propose l'initiative : **<titre>**

## Vision
<vision de l'initiative — 2-3 phrases>

## Découpage en specs
<tableau des specs proposées>

## Checklist
- [ ] La vision est claire et orientée utilisateur
- [ ] Les user stories couvrent les personas identifiés
- [ ] Le découpage en specs est réaliste et atomique
- [ ] Le hors scope est explicite

Document : `docs/initiatives/<slug>.md`
EOF
)" \
  --label "initiative"
```

### 6f. Retour sur main

```bash
git checkout main
```

---

## Phase 7 — Summary

Présente un résumé clair :

```
Initiative créée!

  Document   : docs/initiatives/<slug>.md
  PR         : <PR URL>
  Specs      : <nombre> specs identifiées
  Backlog    : <nombre> items ajoutés (si BACKLOG.md existe)

Pipeline — prochaines étapes:
  1. Review de la PR d'initiative par l'équipe
  2. Une fois mergée, lancer les specs dans l'ordre :
     - /spec <description spec 1>
     - /spec <description spec 2>
     - ...
```

---

## Règles importantes

- **Langue du projet** — tout le contenu généré (PR, commits, messages, documents) respecte la langue configurée dans `AGENTS.md` (section « Langue »). Si absente, utiliser la langue de l'utilisateur
- **Interactivité** : utiliser `AskUserQuestion` pour toutes les décisions structurantes (vision, découpage, approbation)
- **Ne jamais force-push** ni utiliser de commandes git destructives
- **Ne jamais committer sur main** — toujours vérifier la branche courante
- **Branches** : `initiative/<slug>`
- **Labels** : `initiative`
- **Tags backlog** (si `BACKLOG.md` existe) :
  - `· spec~<slug>` — spec planifiée (pas encore de fichier), utilisé par `/initiative`
  - `· spec:<slug>` — spec créée (fichier existe), mis à jour par `/spec`
  - `> init:<slug>` — lien initiative au niveau de la section thématique
- **Dossiers** : `docs/initiatives/` (actives), `docs/initiatives/done/` (archivées)
- **Statuts** : Draft → Active → Done (dans le header du document)
  - **Draft** : en discussion via PR
  - **Active** : PR mergée, au moins une spec en cours
  - **Done** : toutes les specs implémentées, initiative archivée dans `docs/initiatives/done/`
