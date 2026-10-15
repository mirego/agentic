---
name: testmo-setup
description: Intégrer un projet à Testmo — détecter la stack, activer les reporters JUnit, publier les résultats CI, écrire .testmo.json et le journal, préparer la demande de token CI. Web ou mobile, toute stack. Option --dry-run pour tout proposer sans rien écrire.
argument-hint: "[--dry-run]"
allowed-tools: Read, Bash, Grep, Glob, Edit, Write, AskUserQuestion
---

Tu intègres le projet courant à [Testmo](https://www.testmo.com) : résultats des tests automatisés publiés à chaque exécution CI, et plan de test manuel tenu par `/testmo-plan`. Le projet peut être web ou mobile, de n'importe quelle stack.

**Arguments :** $ARGUMENTS

**Mode `--dry-run`** : dérouler toutes les étapes et **montrer** chaque fichier ou modification proposé, sans rien écrire.

**Règle :** chaque écriture de fichier passe par une approbation (`AskUserQuestion`). Ne jamais écrire de secret dans un fichier.

## Étape 1 — Détecter la stack

Lire `references/stacks.md` (relatif au dossier de ce skill). Pour chaque stack détectée dans le repo : le reporter JUnit à activer, où il écrit son rapport, et le nom de source Testmo proposé (une source par suite : `backend-unit`, `ios-unit`, `android-unit`, `e2e-web`…).

Présenter le tableau des suites détectées. Si une stack n'est pas couverte par le catalogue, le dire et proposer à l'humain de compléter le catalogue (contribution au paquet `testmo`).

## Étape 2 — `.testmo.json`

Demander (`AskUserQuestion`) :

- l'**instance Testmo** (ex. `https://<nom>.testmo.net`) ;
- l'**ID du projet Testmo** (dans l'URL `…/projects/view/<id>`) ;
- les **plateformes** (`web`, `ios`, `android`…) ;
- la **langue** des cas manuels (`fr` ou `en`).

Écrire à la racine :

```json
{
  "instance": "https://<nom>.testmo.net",
  "project_id": 123,
  "journal": "docs/qa/testmo-journal.md",
  "case_template": "Case (steps)",
  "history_field": "Change log (auto)",
  "language": "fr",
  "platforms": ["ios", "android"],
  "sources": ["ios-unit", "android-unit"]
}
```

Aucun secret dans ce fichier : il est versionné.

## Étape 3 — Reporters JUnit et publication CI

Pour chaque suite : activer le reporter **sans changer le comportement local** quand c'est possible (variable d'environnement comme `JUNIT_REPORT`, cible `make` dédiée, profil CI).

Puis ajouter la publication au workflow CI existant, **une étape par suite**, qui tourne même quand les tests échouent (un run en échec est justement celui que la QA doit voir), mais **seulement si le code a été récupéré** : si le job échoue avant le checkout (ex. conteneur de service introuvable), l'action n'existe pas et l'étape ajouterait une erreur trompeuse « action.yml introuvable ». Donner un `id: checkout` à l'étape `actions/checkout` du job :

- **GitHub Actions** :
  ```yaml
  - id: checkout
    uses: actions/checkout@<version>
  # …
  - name: Publish <suite> results to Testmo
    if: always() && steps.checkout.outcome == 'success'
    uses: <action>
    with:
      token: ${{ secrets.TESTMO_TOKEN }}
      results: <chemin ou glob du rapport JUnit>
      source: <source>
  ```
  `<action>` = `mirego/agentic/testmo/ci@<tag>`, avec le même tag que la dépendance `mirego/agentic/testmo#<tag>` de `apm.yml` (ou `./.apm-local/testmo/ci` si le paquet est développé localement dans ce dossier). Si le paquet n'est ni déclaré dans `apm.yml` ni présent localement, le signaler comme **bloquant** et proposer de l'ajouter à `apm.yml` d'abord. Si le workflow est réutilisé par un autre (`workflow_call`), ajouter `secrets: inherit` chez l'appelant.
- **Autre CI ou Fastlane** : appel direct de `publish.sh` avec les variables documentées dans le `README.md` de la brique CI. APM ne déploie pas la brique CI : récupérer le script au même tag, par exemple `curl -fsSL https://raw.githubusercontent.com/mirego/agentic/<tag>/testmo/ci/publish.sh -o publish.sh`.

## Étape 4 — Journal

Créer le fichier `journal` (défaut `docs/qa/testmo-journal.md`) avec seulement cet en-tête, dans la langue du projet :

```markdown
# Journal Testmo

Trace versionnée des cas de test manuels ajoutés, modifiés ou retirés par `/testmo-plan`.
Écrit **uniquement** par l'adaptateur, une section par application de plan — ne pas modifier à la main.
```

## Étape 5 — spec-workflow (optionnel)

Si `AGENTS.md` (ou `CLAUDE.md`) contient une section `spec-workflow:`, proposer d'y ajouter la section suivante (adapter la langue).

**Ne jamais dupliquer un titre de hook** : les extensions spec-workflow se déclenchent par match exact sur le heading, et un agent peut s'arrêter à la première section trouvée. Si une section `spec-workflow:impl:completed` existe déjà, y ajouter le paragraphe « Suggérer `/testmo-plan` … » comme action supplémentaire et indépendante, et remplacer le sous-titre `#### spec-workflow:impl:completed` du gabarit par une phrase qui renvoie vers ce hook existant.

```markdown
## Testmo

Configuration : [`.testmo.json`](.testmo.json). Plans de test manuels : `/testmo-plan`. Intégration : `/testmo-setup`.

**Règles qui bloquent**

- Jamais de suppression dans Testmo : un cas obsolète est retiré (état Retired).
- Approbation explicite de l'humain avant toute écriture dans Testmo.
- Aucune écriture sans trace : champ « Change log (auto) » et tags `ai-added` / `ai-updated` / `ai-retired`, posés par l'adaptateur.
- Le journal du repo est écrit uniquement par l'adaptateur, et commité avec le changement qui le justifie.
- Le token Testmo n'est jamais affiché, ni écrit dans un fichier.

#### spec-workflow:impl:completed

**Suggérer** à l'humain `/testmo-plan doc:docs/specs/<slug>.md` pour réconcilier les cas manuels avec la spec implémentée. Non bloquant, rien d'automatique.
```

## Étape 6 — Token de la CI

Demander si le secret `TESTMO_TOKEN` est déjà disponible pour ce repo, par exemple au niveau de l'organisation GitHub (`gh secret list --org <org>` si l'humain y a accès).

Sinon, rédiger la **demande à l'équipe qui gère les secrets GitHub de l'organisation et les accès Testmo** (TI, DevOps, admin Testmo…), prête à copier :

> Bonjour,
> Pour publier les résultats des tests automatisés du repo `<repo>` dans Testmo (projet `<project_id>`), pourriez-vous :
> 1. créer un utilisateur API Testmo pour la CI (ex. « GitHub Actions CI »), ou réutiliser celui qui existe déjà ;
> 2. lui donner le droit de soumettre des runs automatisés dans le projet Testmo `<project_id>` ;
> 3. fournir sa clé d'API comme secret `TESTMO_TOKEN`, au niveau de l'organisation GitHub de préférence, sinon dans le repo `<repo>`.
> Merci !

Si l'utilisateur API existe déjà, la demande se limite à **lui donner accès au nouveau projet** (point 2).

Sans secret, la CI passe quand même : la publication est sautée avec un avertissement.

## Étape 7 — Vérifier et lister le reste

Lancer le préflight de l'adaptateur (dossier voisin `../testmo-plan/scripts/`) :

```bash
node <dossier-des-skills>/testmo-plan/scripts/testmo.mjs doctor
```

Puis lister les actions manuelles restantes :

- le secret `TESTMO_TOKEN` dans la CI, si la demande est en cours ;
- la clé d'API personnelle de chaque personne qui utilisera `/testmo-plan` (profil Testmo → API keys, exportée en `TESTMO_TOKEN`) ;
- si `doctor` signale que le champ d'historique manque au template : demander à un admin Testmo d'ajouter le champ texte « Change log (auto) » (aide : *« Written by /testmo-plan on each approved change — do not edit manually. »*) au template de cas du projet.

## Étape 8 — Premier passage

Proposer `/testmo-plan product` pour bâtir le jeu de cas initial, un domaine fonctionnel à la fois.
