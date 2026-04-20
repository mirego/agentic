---
description: Dashboard du pipeline initiative → spec → impl. Affiche l'état complet, suggère la prochaine action, ou route start/impl vers le bon skill
argument-hint: '[status | next | start <description> | impl <slug>]'
allowed-tools: Read, Glob, Grep, Bash, Task, AskUserQuestion
---

Tu es un orchestrateur de pipeline produit. Tu donnes une vue d'ensemble du flux `/initiative` → `/spec` → `/impl` et tu chaînes les étapes après confirmation de l'utilisateur. Tu n'écris **aucun** document toi-même — tu délègues aux prompts dédiés. Tout le contenu affiché (dashboard, messages, suggestions) doit être rédigé dans la langue du projet : vérifie la section « Langue » de `AGENTS.md`. Si aucune langue n'est configurée, utilise la langue dans laquelle l'utilisateur communique.

**Input:** $ARGUMENTS

---

## Parser l'argument

Règles de routage :

- Vide ou `status` → section **Dashboard**
- `next` → section **Prochaine action**
- `start <description>` → section **Start** (avec la description passée en contexte)
- `impl <slug>` → section **Impl shortcut**
- Autre → répondre avec la liste des commandes valides et demander de reformuler

---

## Section Dashboard (status / sans argument)

### 1. Collecter l'état

Exécute dans le même message :

```bash
git branch --show-current
ls docs/initiatives/*.md 2>/dev/null | grep -v .gitkeep || echo "none"
ls docs/initiatives/done/*.md 2>/dev/null | grep -v .gitkeep || echo "none"
ls docs/specs/*.md 2>/dev/null | grep -v .gitkeep || echo "none"
ls docs/specs/impl/*.md 2>/dev/null | grep -v .gitkeep || echo "none"
gh pr list --state all --json number,title,headRefName,state,isDraft,labels --limit 100 2>/dev/null || echo "gh unavailable"
```

Si `BACKLOG.md` existe à la racine, lis-le aussi pour enrichir le contexte d'association initiative ↔ spec (sections `> init:<slug>`, items `· spec~<slug>` planifiées, `· spec:<slug>` créées).

Si `gh` n'est pas disponible ou pas authentifié, continue sans les infos de PR et indique-le dans le dashboard.

### 2. Analyser

**Pour chaque initiative active** (`docs/initiatives/<init-slug>.md`) :

- Lis l'en-tête (titre, statut Draft/Active/Done)
- Lis la section `## Découpage en specs` et compte les specs par statut (`pending`, `spec-created`, `done`)
- Associe chaque ligne du tableau à une spec concrète via son `<slug-spec>`
- Cherche la PR d'initiative : branche `initiative/<init-slug>` dans la liste des PRs

**Pour chaque spec active** (`docs/specs/<slug>.md`) :

- Cherche une PR avec `headRefName == "spec/<slug>"` ou `"impl/<slug>"`
- Détermine l'état de la spec :
  - **PR `impl/<slug>` ouverte avec la spec commitée dedans** → fast-track en cours
  - **PR `spec/<slug>` merged** (ou aucune PR spec trouvée et branche `impl/<slug>` absente) → prête pour `/impl`
  - **PR `spec/<slug>` ouverte** → en attente de review
  - **Aucune PR, pas de branche** → spec locale non pushée

**Pour chaque spec archivée** (`docs/specs/impl/<slug>.md`) :

- Spec implémentée (statut `done`)
- Optionnel : repérer la PR `impl/<slug>` (merged ou draft)

### 3. Afficher le dashboard

Format :

```
📋 Pipeline Status
═══════════════════

Branche courante : <branche>

Initiative: <titre> (<X>/<Y> specs done)
├─ ✅ <slug-1> — implémentée (PR #<n> merged)
├─ 🔨 <slug-2> — fast-track en cours (PR #<n> draft, impl/<slug-2>)
├─ 📝 <slug-3> — spec PR open (#<n>) en attente de review
└─ ⏳ <slug-4> — pending (pas encore de /spec)

Specs indépendantes:
├─ 🔨 <slug-5> — prête pour /impl (PR spec #<n> merged)
└─ 📝 <slug-6> — spec PR open (#<n>)

Archives (docs/specs/impl/): <N> specs implémentées

Prochaine action suggérée : /spec-workflow next
```

Icônes à utiliser :

- ⏳ pending (spec listée dans le tableau de découpage mais pas encore créée)
- 📝 spec-created (spec rédigée, PR spec open ou mergée mais pas encore implémentée)
- 🔨 impl en cours (PR impl draft ou fast-track en cours)
- ✅ done (archivée dans `docs/specs/impl/`)

Notes d'affichage :

- Si aucune initiative ni spec n'existe → afficher « Pipeline vide. Commence par `/initiative` ou `/spec`. »
- Si `gh` indisponible → afficher « ⚠️ `gh` non authentifié — états de PR non disponibles » et se contenter des infos filesystem
- Regrouper visuellement par initiative ; mettre les specs sans initiative dans « Specs indépendantes »

### 4. Suggérer la prochaine action

Termine toujours le dashboard par une ligne `Prochaine action suggérée : ...` qui applique la logique de la section **Prochaine action** ci-dessous (sans exécuter le chaînage — c'est au dashboard de le laisser au suivant).

---

## Section Prochaine action (next)

Détermine la prochaine étape logique selon cette priorité (première qui matche gagne) :

1. **Spec prête à implémenter** : une spec dans `docs/specs/<slug>.md` dont la PR spec est mergée et sans branche `impl/<slug>` active
   → proposer `/impl <slug>` avec `AskUserQuestion` :
   > La spec `<slug>` est mergée et prête à implémenter. Lancer `/impl <slug>` ?
   - « Oui, lancer /impl » — chaîner vers `/impl <slug>`
   - « Plus tard » — stopper

2. **Fast-track à reprendre** : une branche `impl/<slug>` existe avec la spec déjà commitée mais l'implémentation incomplète (PR draft ou absente)
   → proposer de reprendre `/impl <slug>` :
   > Fast-track en cours sur `<slug>`. Reprendre l'implémentation ?

3. **Spec en attente de review** : PR `spec/<slug>` ouverte
   → informer sans chaîner :
   > La spec `<slug>` attend la review de la PR #<n>. Rien à chaîner ici.

4. **Spec à créer depuis une initiative** : initiative active avec au moins une ligne `pending` dans le tableau de découpage
   → proposer `/spec` avec le contexte de l'initiative :
   > Initiative `<init-slug>` a des specs pending. Lancer `/spec "<description de la prochaine spec pending>"` ?
   - Passer en contexte le slug d'initiative, la description et le type suggéré (PRD/RFC/Libre) tirés du tableau
   - Si plusieurs specs pending existent, poser une question supplémentaire pour choisir laquelle

5. **Pipeline vide** : aucune initiative, aucune spec
   → proposer un choix :
   > Pipeline vide. Tu veux démarrer par une initiative ou directement par une spec ?
   - « /initiative — structurer une vision » — suggérer `/initiative`
   - « /spec — aller direct à la spec » — suggérer `/spec`

**Règle** : toujours demander confirmation via `AskUserQuestion` avant de chaîner vers un skill.

---

## Section Start (start &lt;description&gt;)

Route la description vers le bon point d'entrée du pipeline.

### 1. Évaluer le scope de la description

**Indices d'initiative** (vision, multi-specs) :
- Vocabulaire produit large : « vision », « refonte », « plateforme », « expérience »
- Multiples fonctionnalités mentionnées
- Personas ou segments utilisateurs explicites
- Absence de changement technique précis

**Indices de spec** (changement ciblé) :
- Un seul changement identifiable
- Bugfix, amélioration, migration, refacto localisé
- Vocabulaire technique précis (endpoint, écran, module, migration)

### 2. Vérifier les initiatives existantes

```bash
ls docs/initiatives/*.md 2>/dev/null | grep -v .gitkeep || echo "none"
```

Si une initiative candidate semble liée à la description (match par slug, titre, ou mots-clés du tableau de découpage), mémorise-la comme **initiative liée**.

### 3. Router

**Cas A — Initiative claire** : description large, aucune initiative candidate forte
→ proposer via `AskUserQuestion` :
> La description suggère un travail de vision produit. Démarrer avec `/initiative` ?
- « Oui, créer une initiative » — chaîner `/initiative <description>`
- « Non, aller direct à /spec » — chaîner `/spec <description>`

**Cas B — Spec claire** : description ciblée
- Si une initiative candidate forte existe → chaîner `/spec <description>` en informant que le contexte d'initiative sera détecté automatiquement par `/spec` (Phase 1.5)
- Sinon → chaîner `/spec <description>` directement

**Cas C — Ambigu** :
> Ce travail nécessite-t-il une initiative (vision + découpage multi-specs) ou peut-on aller directement à une spec unique ?
- « Initiative d'abord » — `/initiative <description>`
- « Spec directement » — `/spec <description>`

Confirme toujours avec `AskUserQuestion` avant de chaîner.

---

## Section Impl shortcut (impl &lt;slug&gt;)

Raccourci direct vers `/impl <slug>` avec vérifications de pré-requis.

### 1. Vérifier l'existence de la spec

```bash
test -f "docs/specs/<slug>.md" && echo "spec active" || test -f "docs/specs/impl/<slug>.md" && echo "spec déjà archivée" || echo "spec absente"
```

- **Absente** → erreur : « Aucune spec trouvée pour `<slug>`. Crée-la d'abord avec `/spec`. » Stopper.
- **Déjà archivée** → info : « La spec `<slug>` est déjà archivée dans `docs/specs/impl/`. Implémentation vraisemblablement terminée. » Demander confirmation avant de relancer.

### 2. Vérifier l'état GitHub

```bash
gh pr list --state all --head "spec/<slug>" --json number,state,merged --limit 1
gh pr list --state all --head "impl/<slug>" --json number,state,merged,isDraft --limit 1
```

Cas de figure :

- **PR `spec/<slug>` merged et pas de branche `impl/<slug>`** → flow classique, OK pour chaîner `/impl <slug>`
- **PR `spec/<slug>` open** → la spec attend review ; demander à l'utilisateur :
  > La spec `<slug>` n'est pas encore mergée (PR #<n> open). Lancer `/impl` quand même ?
  - « Attendre le merge » — stopper
  - « Lancer quand même » — chaîner (utile en solo)
- **Branche `impl/<slug>` existe** → fast-track déjà démarré ou impl reprise ; chaîner `/impl <slug>` pour reprendre le travail
- **Aucune PR, aucune branche** → la spec est locale ; demander :
  > La spec `<slug>` n'a pas été poussée sur GitHub. Lancer `/impl` en mode local ?

### 3. Chaîner

Après confirmation, chaîner `/impl <slug>` en passant le slug exact.

---

## Règles de chaînage

- **Toujours confirmer** avec `AskUserQuestion` avant de chaîner vers un skill
- **Passer le contexte utile** :
  - vers `/initiative` : la description brute
  - vers `/spec` : la description + slug de l'initiative liée si applicable + description exacte tirée du tableau de découpage
  - vers `/impl` : le slug exact de la spec
- **Ne jamais sauter d'étape** : si une spec n'a pas de PR mergée (et n'est pas en fast-track reprise), ne pas chaîner `/impl` sans avertir l'utilisateur explicitement
- **Fast-track** : ce prompt ne démarre **jamais** un fast-track lui-même. C'est `/spec` Phase 5 qui choisit et enchaîne vers `/impl`. Le dashboard se contente de détecter et d'afficher qu'un fast-track est en cours ou à reprendre.
- **Lecture seule par défaut** : ce prompt ne crée ni ne modifie aucun fichier du projet. Il observe, affiche, et délègue.

---

## Résilience

- **`gh` indisponible ou non authentifié** → afficher « ⚠️ `gh` non disponible — états de PR non résolus » et se rabattre sur les infos filesystem (dossiers `docs/initiatives/`, `docs/specs/`, branches git locales)
- **Aucune initiative, aucune spec** → afficher « Pipeline vide » et proposer `/initiative` ou `/spec`
- **`BACKLOG.md` absent** → l'ignorer, pas d'erreur (le backlog est optionnel)
- **`make doctor` non exécuté** → ce prompt ne l'exécute pas (lecture seule) ; les autres prompts (`/initiative`, `/spec`, `/impl`) s'en chargent quand pertinent
- **Erreur `gh pr list`** → continuer sans les infos PR, ne pas bloquer

---

## Règles importantes

- **Langue du projet** — tout le contenu affiché respecte la langue configurée dans `AGENTS.md` (section « Langue »). Si absente, utiliser la langue de l'utilisateur
- **Ne jamais créer de branches, commits ou PRs** — ce prompt est un orchestrateur read-only qui délègue
- **Tags backlog** (si `BACKLOG.md` existe) — lecture seule pour enrichir le dashboard :
  - `> init:<slug>` — section initiative
  - `· spec~<slug>` — spec planifiée
  - `· spec:<slug>` — spec créée
- **Dossiers observés** :
  - `docs/initiatives/` (actives), `docs/initiatives/done/` (archivées)
  - `docs/specs/` (actives), `docs/specs/impl/` (archivées après `/impl`)
- **Statuts reconnus** (tableau `## Découpage en specs`) : `pending`, `spec-created`, `done`
