---
description: Implémenter un changement à partir d'une spec
argument-hint: "<slug de la spec>"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Task, AskUserQuestion
---

Tu es un développeur senior. Ton rôle est d'implémenter un changement défini par une spécification formelle (fichier de spec créé par le skill `/spec`). Tout le contenu généré (PR, commits, messages) doit être rédigé en français.

**Input:** $ARGUMENTS

---

## Pré-condition — Contexte `/spec` dans la session

Avant de démarrer les phases, vérifie si un `/spec` a été exécuté plus tôt dans cette même conversation pour le slug demandé. Les indices sont :

- Le contenu de la spec (objectif, décisions techniques, plan d'implémentation, fichiers impactés) est déjà présent dans le contexte de conversation
- Les résultats d'exploration du codebase (fichiers clés, patterns, conventions) ont déjà été collectés par `/spec`
- Les discussions de design et les choix d'approche approuvés par l'utilisateur sont déjà dans le contexte

**Si un `/spec` a été exécuté dans cette session pour ce slug :**

1. **Phase 0** — exécuter normalement (vérification de l'environnement)
2. **Phase 1** — exécuter normalement (chargement de la spec, validation PR mergée, etc.)
3. **Phase 2 (Exploration) — SAUTER.** Réutiliser les découvertes de l'exploration faite pendant `/spec`. Présenter un résumé rapide rappelant les fichiers clés et patterns déjà identifiés, sans relancer d'agents `Explore`.
4. **Phase 3 (Plan d'exécution)** — Construire le plan directement à partir du plan d'implémentation de la spec et du contexte d'exploration déjà en mémoire de conversation. Le plan doit quand même être présenté à l'utilisateur pour approbation.
5. **Phases 4-6** — exécuter normalement

Cela évite de refaire une exploration complète du codebase quand le contexte est déjà frais dans la conversation.

---

## Phase 0 — Vérification de l'environnement

Exécuter `make doctor` et analyser la sortie.

Si `make doctor` échoue avec "No rule to make target" ou équivalent, le projet n'a pas de target `doctor`. Avertir l'utilisateur :
> Le projet n'a pas de `make doctor`. Les templates sont disponibles dans le package spec-workflow pour en configurer un.

Puis continuer sans bloquer.

Si `make doctor` fonctionne, pour chaque check en FAIL, lire le champ `context` et évaluer si ce check
est pertinent pour la tâche en cours :
- Si pertinent et bloquant : informer l'utilisateur, proposer le `fix` suggéré,
  et demander s'il veut corriger maintenant ou continuer sans.
- Si pertinent mais non bloquant : avertir l'utilisateur que ça pourrait
  affecter une étape ultérieure du workflow.
- Si non pertinent : ignorer silencieusement.

---

## Phase 1 — Chargement du contexte

### 1a. Parser l'argument

Extrais le slug de la spec depuis `$ARGUMENTS`.

Si `$ARGUMENTS` est vide, liste les specs actives disponibles dans `docs/specs/` (en excluant `docs/specs/impl/`) et propose-les via `AskUserQuestion` :
> Quelle spec veux-tu implémenter ?
- Liste chaque fichier `docs/specs/<slug>.md` comme option (afficher le slug)

Si un slug est fourni, valide que `docs/specs/<slug>.md` existe.

- Si oui, continue normalement.
- Sinon, vérifie si `docs/specs/impl/<slug>.md` existe déjà.
  - Si oui, affiche :
    > La spec `docs/specs/impl/<slug>.md` est déjà archivée. Elle a probablement déjà été implémentée.
  - Si non, affiche :
    > Le fichier `docs/specs/<slug>.md` n'existe pas. Vérifie le slug ou lance `/spec` pour créer une spec.

Et arrête.

### 1b. Détecter un item backlog lié (conditionnel)

Si un fichier `BACKLOG.md` existe, cherche une ligne au format `- [ ] <texte> · spec:<slug>` correspondant au slug de la spec courante.

- Si une seule ligne correspond, mémorise la ligne exacte comme **item backlog lié**.
- Si plusieurs lignes correspondent, demande à l'utilisateur laquelle est la bonne.
- Si aucune ligne ne correspond ou si `BACKLOG.md` n'existe pas, continue sans item backlog lié.

Si l'item backlog lié contient `· init:<init-slug>`, mémorise aussi **init_slug** pour la Phase 4.

### 1c. Valider que la spec est mergée

**Mode fast-track** : si la branche courante est deja `impl/<slug>` et que `docs/specs/<slug>.md` existe dans les commits de cette branche, on est en mode fast-track (spec + impl sur la meme branche). Sauter cette validation et continuer sans **spec_pr_number**.

**Mode normal** : chercher la PR de spec via la branche `spec/<slug>` :

```bash
gh pr list --state merged --head "spec/<slug>" --json number,title,mergedAt --limit 1
```

Mémorise le numéro de la PR de spec trouvée comme **spec_pr_number** pour la Phase 4 et 5.

**Si aucune PR mergée n'est trouvée :**

Vérifie s'il y a une PR encore ouverte :
```bash
gh pr list --state open --head "spec/<slug>" --json number,title,url --limit 1
```

- Si une PR ouverte est trouvée → **bloquer** :
  > La PR de spec (<URL>) n'est pas encore mergée. La spec doit être reviewée et approuvée par les pairs avant de lancer l'implémentation.
- Si aucune PR trouvée du tout → **avertir** et demander confirmation via `AskUserQuestion` :
  > Aucune PR de spec trouvée pour le slug `<slug>`. La spec a peut-être été créée manuellement.
  - « Continuer quand même » — procéder sans numéro de PR de spec
  - « Annuler » — arrêter

### 1d. Charger la spec

1. S'assurer d'être sur `main` à jour :
   ```bash
   git checkout main
   git pull
   ```
2. Lis le document de spec `docs/specs/<slug>.md`
3. Si aucun `init_slug` n'a été trouvé (via `BACKLOG.md` ou autrement), tente de le déduire depuis le header `> **Initiative :**` de la spec.
   - Si le lien pointe vers `docs/initiatives/<init-slug>.md`, mémorise ce slug.
   - Si le lien pointe vers `docs/initiatives/done/<init-slug>.md`, mémorise aussi ce slug et avertis que l'initiative semble déjà archivée.

### 1e. Résumé au dev

Présente un résumé clair :
- Titre de la spec
- Objectif / problème résolu
- Aperçu du plan d'implémentation (extrait de la spec)
- Nombre de phases estimées

---

## Phase 2 — Exploration du codebase

Lance **3 agents `Explore` en parallele** (via le tool `Task` avec `subagent_type: "Explore"`), tous dans le meme message pour garantir l'execution simultanee :

- **Agent A — Fichiers cibles** : les fichiers mentionnes dans le plan d'implementation de la spec, le code existant qui sera modifie ou etendu, les patterns et conventions a reutiliser
- **Agent B — Patterns de test** : explore `test/` pour identifier les patterns de test du projet (case modules, fixtures, factories, helpers). Cherche des tests similaires a ce qu'on va implementer (ex: si on ajoute un contexte, regarde comment les contextes existants sont testes)
- **Agent C — Schemas et donnees** : les schemas, migrations, enums et structures de donnees lies au changement. Verifie la coherence entre la spec et l'etat actuel du code

Consolide les resultats des 3 agents et presente un resume :
- Fichiers cles confirmes (existent toujours, coherents avec la spec)
- Divergences eventuelles entre la spec et l'etat actuel du code
- Patterns a suivre pour rester coherent
- **Patterns de test identifies** : case modules utilises, fixtures disponibles, style d'assertions, nouvelles fixtures a creer

Si des divergences significatives sont trouvees, signale-les au dev et demande comment proceder.

---

## Phase 3 — Plan d'exécution

Découpe le "Plan d'implémentation" de la spec en **phases ordonnées**. Chaque phase correspond à un commit atomique :

Pour chaque phase, définis :
- **Description** : ce qui sera fait
- **Fichiers** : créés ou modifiés
- **Validation** : comment vérifier que la phase est correcte (compilation, tests, etc.)

**Le plan doit inclure une phase dédiée aux tests** après les phases d'implémentation. Cette phase de tests doit couvrir :

- **Fixtures** : créer les fixtures nécessaires dans `test/support/fixtures/` en suivant le pattern existant du projet
- **Tests de contexte** (`DataCase`) : si des schemas ou fonctions de contexte sont créés/modifiés — tester les changesets (params valides, params invalides, validations) et les fonctions CRUD
- **Tests LiveView** (`ConnCase` + `Phoenix.LiveViewTest`) : si des LiveViews sont créés/modifiés — tester le mount, la soumission de formulaires (`render_submit`), la validation de formulaires (`render_change`), et les événements utilisateur
- **Tests contrôleur** (`ConnCase`) : si des contrôleurs sont créés/modifiés — tester les requêtes et réponses

Présente le plan au dev avec `AskUserQuestion` pour approbation. Itère si nécessaire.

---

## Phase 4 — Implémentation

**Avant de commencer, crée la branche d'implémentation :**
```bash
git checkout -b impl/<slug>
```

**Valide que tu es sur la bonne branche avant tout commit :**
```bash
git branch --show-current
```
- Si la branche courante est `main` ou `master` → **arrête immédiatement**. Ne jamais committer directement sur main.
- Si la branche ne commence pas par `impl/` → **arrête et signale le problème** à l'utilisateur.
- Si `git checkout -b` a échoué (branche existante), propose : `git checkout impl/<slug>` pour reprendre le travail ou un nom alternatif.

Pour chaque phase du plan approuvé :

1. Informe l'utilisateur de la phase en cours
2. Implémente les changements (Write, Edit)
3. Committe avec un message descriptif :
   ```bash
   git add <fichiers spécifiques>
   git commit -m "<description de la phase>"
   ```
4. Lance `make check` **en background** (via `run_in_background`) pour valider formatage, compilation et tests sans bloquer le debut de la phase suivante. Si `make check` echoue avec "No rule to make target", le projet n'a pas de target `check` — avertir l'utilisateur et lui demander quelle commande de validation utiliser a la place.
5. **Avant de commencer la phase suivante**, verifie le resultat de la validation background. Si une regression est detectee, corriger immediatement avant de continuer.

**Phase de tests (obligatoire) :**

Après les phases d'implémentation, écris les tests en suivant les patterns identifiés en Phase 2. C'est une phase à part entière avec son propre commit :

1. **Crée les fixtures** nécessaires dans `test/support/fixtures/` (si de nouveaux schemas ont été créés)
2. **Écris les tests de contexte** (`use DataCase`) pour chaque nouveau schema/contexte :
   - Changeset avec params valides → succès
   - Changeset avec params invalides → erreurs attendues
   - Validations spécifiques (required, format, associations, contraintes)
   - Fonctions CRUD du contexte (create, update, delete, list, get)
3. **Écris les tests LiveView** (`use ConnCase` + `import Phoenix.LiveViewTest`) pour chaque nouveau LiveView :
   - Mount de la page (authentifié et non-authentifié si applicable)
   - Soumission de formulaire avec params valides (`render_submit`)
   - Validation de formulaire avec params invalides (`render_change`)
   - Événements utilisateur (toggle, delete, etc.)
4. Lance la validation du projet pour confirmer que les nouveaux tests et les vérifications passent :
   ```bash
   make check
   ```
5. Committe :
   ```bash
   git add test/
   git commit -m "Ajouter tests: <description>"
   ```

### 4a. Validation complète

Roule la validation complète du projet :
```bash
make check
```

Si des erreurs sont trouvées, corrige-les et committe les corrections.

### 4b. Revue des divergences par rapport à la spec

Compare l'implémentation réalisée avec la spec originale. Identifie les divergences significatives :
- Décisions techniques changées (ex: stockage, architecture, librairie)
- Fonctionnalités ajoutées, retirées ou modifiées par rapport au plan
- Contraintes découvertes pendant l'implémentation

**Si des divergences sont identifiées**, présente-les à l'utilisateur via `AskUserQuestion` :
> Pendant l'implémentation, les éléments suivants ont divergé de la spec originale :
> - <liste des divergences avec raisons>
>
> Je recommande de documenter ces changements dans la spec archivée pour que les futurs lecteurs comprennent pourquoi le code diffère du plan original.

Options :
- « Documenter les changements » — met à jour la spec avec les divergences
- « Archiver sans changements » — archive la spec telle quelle

**Si l'utilisateur accepte**, met à jour la spec **avant** de l'archiver :

1. Dans la section "Décisions techniques", modifie les lignes concernées avec une mention **Changé à l'implémentation.**
2. Ajoute une section "Changements par rapport à la spec originale" dans le footer d'implémentation :

   ```markdown
   ### Changements par rapport à la spec originale

   | Élément | Spec originale | Implémentation | Raison |
   |---------|---------------|----------------|--------|
   | <élément> | <ce que la spec disait> | <ce qui a été fait> | <pourquoi> |
   ```

### 4c. Mise à jour de la documentation projet

Vérifie si l'implémentation nécessite des mises à jour dans la documentation du projet. Lis les 3 fichiers et identifie ce qui est obsolète ou manquant :

1. **`ARCHITECTURE.md`** — Carte architecturale pour les agents. Mettre à jour si :
   - Nouveau contexte, schema ou table créé → ajouter dans "Domaines" et "Schéma de base de données"
   - Nouvelles dépendances inter-contextes → ajouter dans le graphe
   - Nouveaux topics PubSub → ajouter dans la table
   - Nouvelles conventions établies → ajouter dans "Conventions"

2. **`AGENTS.md`** — Instructions pour les agents AI. Mettre à jour si :
   - Nouveaux modules clés à connaître (ex: contextes, plugs, controllers) → ajouter avec description
   - Nouvelles routes ou patterns d'accès → documenter
   - Nouvelles règles de fonctionnement que les agents doivent respecter (ex: règles d'auth, conventions de layout)
   - Sections marquées "une fois implémentée" ou similaire → retirer la mention provisoire

3. **`README.md`** — Documentation orientée humain. Mettre à jour si :
   - Nouvelles variables d'environnement requises → documenter dans la section appropriée
   - Nouveaux prérequis ou étapes de setup → ajouter
   - Nouvelles fonctionnalités visibles par l'utilisateur (ex: auth, flow de connexion) → décrire brièvement

**Si des mises à jour sont nécessaires**, applique-les et committe :
```bash
git add ARCHITECTURE.md AGENTS.md README.md
git commit -m "Mettre à jour la documentation projet"
```

Si aucun changement n'est nécessaire, passe cette étape silencieusement.

### 4d. Archivage de l'item backlog lié (conditionnel)

Si un **item backlog lié** a été mémorisé en Phase 1 et que `BACKLOG.md` existe :

1. Lis `BACKLOG.md`
2. Trouve la ligne exacte mémorisée; si elle a changé, retrouve une correspondance sûre avec `· spec:<slug>`
3. Déplace-la dans la section `## Done` en cochant la case :
   ```markdown
   ## Done

   - [x] <texte> · spec:<slug>
   ```

Ce changement sera inclus dans le commit d'archivage de la spec (étape suivante).

Si aucun item backlog n'est lié ou si `BACKLOG.md` n'existe pas, passe cette étape silencieusement.

### 4e. Archivage de la spec (dernier commit de la branche)

1. Crée le dossier d'archive si nécessaire :
   ```bash
   mkdir -p docs/specs/impl
   ```

2. Déplace le fichier de spec :
   ```bash
   git mv docs/specs/<slug>.md docs/specs/impl/<slug>.md
   ```

3. Si le document déplacé contient des liens relatifs existants (par ex. la ligne de traçabilité `> **Initiative :** ...`), réécris-les pour qu'ils restent valides depuis `docs/specs/impl/<slug>.md`.
   - Exemple : un lien `../initiatives/<init-slug>.md` devient `../../initiatives/<init-slug>.md`
   - Si l'initiative est déjà archivée, utiliser `../../initiatives/done/<init-slug>.md`
   - Vérifier plus généralement tous les liens relatifs du document déplacé et corriger ceux dont la cible change à cause du nouveau répertoire

4. Ajoute un footer de traçabilité au fichier déplacé :

   ```markdown

   ---

   ## Implémentation

   - **Spec PR** : #<spec_pr_number>
   - **Date** : <date du jour au format YYYY-MM-DD>
   ```

   Si aucune PR de spec n'a été trouvée (spec créée manuellement), omettre la ligne `Spec PR`.

5. Committe (inclure `BACKLOG.md` si un item a été archivé en 4d) :
   ```bash
   git add docs/specs/impl/<slug>.md
   # Si BACKLOG.md a été modifié en 4d :
   git add BACKLOG.md
   git commit -m "Archiver spec implémentée: <slug>"
   ```

### 4f. Vérification et archivage de l'initiative liée

Si la spec implémentée est liée à une initiative (`init_slug` trouvé via le backlog ou la spec) :

1. **Résoudre le fichier initiative** :
   - Si `docs/initiatives/<init-slug>.md` existe, utilise-le comme initiative active.
   - Sinon, si `docs/initiatives/done/<init-slug>.md` existe déjà, utilise ce fichier et avertis l'utilisateur qu'elle est déjà archivée.
   - Sinon, avertis l'utilisateur qu'aucun fichier initiative correspondant n'a été trouvé et n'édite rien à l'aveugle.

2. **Mettre à jour le tableau de découpage** dans le fichier initiative résolu :
    - Trouve la ligne correspondant à cette spec dans le tableau `## Découpage en specs`
    - Change le statut de `spec-created` (ou `pending`) à `done`

3. **Vérifier si c'est la dernière spec** de l'initiative :
    - Lis le tableau de découpage complet
    - Si **toutes** les specs ont le statut `done` :
      a. Change le statut de l'initiative dans le header : `Draft` ou `Active` → `Done`
      b. Si `BACKLOG.md` existe, vérifie qu'aucun item backlog ouvert avec `· init:<init-slug>` ne reste hors de `## Done`. S'il en reste, avertis l'utilisateur qu'il y a un écart de suivi et n'archive pas l'initiative automatiquement.
      c. Déplace le fichier dans l'archive seulement si l'initiative est encore active :
         ```bash
         mkdir -p docs/initiatives/done
         git mv docs/initiatives/<init-slug>.md docs/initiatives/done/<init-slug>.md
         ```
      d. Ajoute un footer de traçabilité seulement s'il n'existe pas déjà :
         ```markdown

         ---

        ## Archivage

        - **Statut** : Done
         - **Date** : <date du jour au format YYYY-MM-DD>
         - **Toutes les specs implémentées**
         ```

4. **Committe** les changements si le fichier initiative a réellement changé :
    ```bash
    git add docs/initiatives/
    git commit -m "Mettre à jour initiative: <init-slug>"
    ```

Si la spec n'est pas liée à une initiative, passe cette étape silencieusement.

---

## Phase 5 — GitHub Integration

### 5a. Créer le label impl (idempotent)

```bash
gh label create "impl" --description "Implementation" --color "0e8a16" --force
```

### 5b. Pousser la branche

```bash
git push -u origin impl/<slug>
```

### 5c. Créer la Pull Request

Demande l'approbation de l'utilisateur avant de créer la PR.

**Déterminer si l'implémentation touche l'UI :**
Vérifie si des fichiers LiveView, templates ou composants ont été modifiés/créés dans les commits de la branche (fichiers dans `lib/*_web/live/`, `lib/*_web/components/`, ou des modifications CSS significatives).

**Si l'UI a été modifiée**, inclure la section `## Results` dans le body de la PR et demander à l'utilisateur via `AskUserQuestion` de fournir des captures d'écran ou une vidéo avant de créer la PR :
> Cette implémentation inclut des changements UI. Avant de créer la PR, je recommande d'ajouter des captures d'écran ou une vidéo du résultat dans la section "Results".

Options :
- « Je les ajouterai après » — crée la PR avec un placeholder
- « Pas nécessaire » — crée la PR sans la section Results

**Si des divergences ont été documentées**, inclure aussi la section `## Divergences par rapport à la spec` dans le body.

```bash
gh pr create \
  --draft \
  --title "Impl: <titre>" \
  --body "$(cat <<'EOF'
## Implémentation
Cette PR implémente la spec : **<titre>**

Spec PR : #<spec_pr_number>

## Changements
<résumé des phases implémentées en bullets>

<si des divergences ont été documentées>
## Divergences par rapport à la spec
| Élément | Spec | Implémentation | Raison |
|---------|------|----------------|--------|
| <élément> | <spec originale> | <ce qui a été fait> | <pourquoi> |
</si>

## Validation
- [ ] `make check` passe
- [ ] Les critères d'acceptation de la spec sont couverts

Spec : `docs/specs/impl/<slug>.md`

<si l'UI a été modifiée>
## Results

<!-- Ajoutez des captures d'écran ou une vidéo du résultat ici -->
</si>
EOF
)" \
  --label "impl"
```

Si aucune PR de spec n'a été trouvée (spec créée manuellement), omettre la ligne `Spec PR`.

---

## Phase 6 — Summary

Présente un résumé clair :

```
Implémentation terminée!

  Spec       : docs/specs/impl/<slug>.md
  Spec PR    : #<spec_pr_number>
  PR impl    : <PR URL>
  Phases     : N/N complétées
  Commits    : <liste des commits avec descriptions>

Prochaine étape:
  Review de la PR, puis merge.
```

---

## Règles importantes

- **Tout en français** (PR, commits, messages, résumé)
- **Spec mergée obligatoire** — la PR de spec doit être mergée dans main avant de pouvoir implémenter. Ça garantit que la spec a été reviewée et approuvée par les pairs
- **Toujours demander approbation** avant de créer la branche/PR
- **Ne jamais force-push** ni utiliser de commandes git destructives
- **Commits atomiques** par phase logique du plan d'implémentation
- **Tests obligatoires** — toute implémentation doit inclure des tests unitaires. Pas de PR sans tests. Les tests doivent couvrir les changesets, les fonctions de contexte, et les interactions LiveView (formulaires, événements)
- **Noms de tests en anglais** — tous les noms de tests (`test "..."` et `describe "..."`) doivent être rédigés en anglais. Le français est réservé au contenu de la PR, des commits et des messages, mais les noms de tests restent en anglais pour la cohérence avec le reste de la suite de tests
- **Rouler la validation complète** (`make check`) avant de pousser
- **Spec obligatoire** — `/impl` requiert une spec active dans `docs/specs/<slug>.md`; une spec déjà dans `docs/specs/impl/` est considérée archivée et ne doit pas être réimplémentée sans décision explicite
