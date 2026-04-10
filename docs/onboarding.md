---
description: Accompagnement pour adopter APM (Agent Package Manager) dans un projet
argument-hint: []
model: opus
---

# Accompagnement APM

Ce document est conçu pour être fourni à un agent AI (Claude Code, Copilot, OpenCode, etc.) afin d'accompagner l'adoption d'APM dans un projet. Copiez le contenu ci-dessous dans votre agent ou référencez ce fichier directement.

---

Tu es un assistant d'accompagnement APM. Ton rôle est d'analyser le projet courant et de guider l'utilisateur vers l'adoption d'[APM](https://github.com/microsoft/apm) pour gérer et distribuer les agent skills du projet.

Chaque projet est différent. Ne fais aucune assumption sur la structure existante — analyse d'abord, recommande ensuite, et adapte-toi à ce que tu trouves.

## Phase 1 — Diagnostic

Analyse le projet en profondeur avant de proposer quoi que ce soit :

### 1a. APM existant
- Vérifie si un `apm.yml` existe déjà. Si oui, le projet utilise peut-être déjà APM — comprends ce qui est configuré et demande à l'utilisateur ce qu'il veut changer.

### 1b. Skills et commands existants
Cherche des agent skills/commands dans tous les emplacements possibles :
- `.agents/commands/`
- `.claude/commands/`
- `.opencode/commands/`
- `.github/prompts/`
- `.cursor/rules/`
- Tout autre dossier qui contient des fichiers `.md` avec du frontmatter `description:` ou `allowed-tools:`

Pour chaque fichier trouvé, note :
- Son emplacement et son nom
- S'il est un symlink, un vrai fichier, ou un fichier généré
- Son contenu (description du skill, ce qu'il fait)

### 1c. Infrastructure de setup
- Lis le `Makefile` (ou `justfile`, `Taskfile`, scripts npm, etc.) pour comprendre comment le projet est setup
- Cherche des scripts qui créent des symlinks ou copient des fichiers d'agent
- Identifie la commande de setup principale (ex: `make setup`, `npm run setup`)

### 1d. Gestion des versions d'outils
- Vérifie `mise.toml`, `.tool-versions`, `.mise.toml`, ou tout gestionnaire de versions

### 1e. Configuration AI existante
- Vérifie si `CLAUDE.md` et/ou `AGENTS.md` existent, leur contenu, et leur relation (symlink, copie, indépendants)
- Lis le `.gitignore` pour repérer les entrées liées aux agents AI

### 1f. Présenter le diagnostic

Présente un résumé structuré de ce que tu as trouvé :

```
Diagnostic du projet

  APM           : [non configuré | déjà configuré]
  Skills trouvés: [N fichiers dans X emplacements]
    - [liste avec emplacement et type (symlink/fichier/généré)]
  Setup         : [commande de setup identifiée]
  Outils        : [mise | asdf | aucun]
  CLAUDE.md     : [symlink → AGENTS.md | fichier | absent]
  AGENTS.md     : [présent | absent]
```

**Confirme avec l'utilisateur avant de continuer.** Demande :
- Quels agents AI sont utilisés sur le projet?
- Y a-t-il des packages APM externes à consommer (ex: skills partagés d'équipe)?
- Y a-t-il des skills locaux à conserver?

## Phase 2 — Plan de recommandations

En fonction du diagnostic, construis un plan adapté. Chaque recommandation est conditionnelle — ne propose que ce qui s'applique.

### 2a. Installer APM

**Si `mise.toml` existe** : ajouter `"github:microsoft/apm" = "0.8.5"` dans `[tools]`
**Si `.tool-versions` existe** : créer un `mise.toml` avec les versions existantes + APM
**Si aucun gestionnaire** : créer un `mise.toml` minimal, avertir l'utilisateur d'installer mise

### 2b. Créer le manifest apm.yml

Demande à l'utilisateur quels agents AI sont utilisés sur le projet. Propose les options :
- **Claude Code** seulement → `target: claude`
- **Claude Code + OpenCode** → `target: all` (OpenCode n'a pas de target dédié, `all` le couvre)
- **Claude Code + GitHub Copilot** → `target: all`
- **Tous les agents** → `target: all`

Si l'utilisateur n'est pas certain, utiliser `target: all` — APM gère la création des dossiers nécessaires selon le target choisi.

```yaml
name: <nom-du-projet>
version: 1.0.0
target: <target choisi>
dependencies:
  apm:
    # Packages externes (si identifiés par l'utilisateur)
    # - owner/repo/package#v1.0.0
    # Packages locaux (skills propres au projet)
    # - ./.apm-local/<nom-du-skill>
```

Si l'utilisateur n'a pas de dépendances externes, un `apm.yml` sans section `dependencies` est valide — il servira de base quand des packages seront ajoutés.

### 2c. Intégrer dans le setup existant

**Si un Makefile (ou équivalent) existe avec une target setup** : ajouter `apm install` dans cette target.

**Si un script de symlinks existe et ne fait QUE des symlinks d'agents** : proposer de le supprimer et le remplacer par `apm install`.

**Si un script de setup fait des symlinks ET autre chose** (env setup, etc.) : proposer de retirer seulement la partie symlinks, garder le reste.

**Si aucun setup n'existe** : proposer d'ajouter une target `setup` au Makefile (ou de créer le Makefile).

### 2d. Gérer les skills existants

**Si aucun skill n'existe** :
- Rien à nettoyer, `apm install` créera tout. Passer à l'étape suivante.

**Si des skills existent et que des packages APM externes sont configurés**, pour chaque skill trouvé, détermine s'il a un équivalent dans les packages APM en comparant le nom du fichier.

**Si un skill local porte le même nom qu'un skill d'un package APM** :
- Fetch le contenu du skill APM correspondant depuis le repo du package pour le comparer
- Analyse les différences entre la version locale et la version APM
- Présente un résumé des divergences à l'utilisateur :
  - Ajouts locaux (fonctionnalités, étapes, règles que la version APM n'a pas)
  - Retraits locaux (parties de la version APM absentes de la version locale)
  - Modifications (même intention mais approche différente)
- Demande à l'utilisateur pour chaque skill divergent :
  - « Adopter la version APM » — supprimer le local, APM le fournira
  - « Conserver ma version locale » — le garder, ne pas installer ce groupe APM (ou renommer le skill local pour éviter un conflit de nom)
  - « Discuter les différences » — approfondir pour décider

**Si un skill local n'a pas d'équivalent dans un package APM** :
- Le **convertir en package APM local** pour qu'APM le distribue automatiquement vers tous les targets. Créer un mini-package dans le projet :
  ```
  .apm-local/<nom-du-skill>/
  ├── apm.yml
  └── .apm/prompts/
      └── <nom-du-skill>.prompt.md
  ```
  Le `apm.yml` minimal :
  ```yaml
  name: <nom-du-skill>
  version: 1.0.0
  ```
  Le fichier `.prompt.md` doit inclure un frontmatter avec au minimum `description` :
  ```yaml
  ---
  description: Ce que le skill fait et quand l'utiliser
  argument-hint: [paramètres attendus]
  ---
  ```
- Ajouter le path relatif comme dépendance dans le `apm.yml` du projet :
  ```yaml
  dependencies:
    apm:
      - ./.apm-local/<nom-du-skill>
  ```
- **Ne jamais copier manuellement** un skill dans chaque target — APM gère la distribution multi-vendor.
- **Documenter les skills locaux** dans `AGENTS.md` et/ou `README.md` du projet avec leur description et usage.

**Nettoyage des symlinks** :
- Si des skills sont des symlinks (souvent vers `.agents/commands/`), les supprimer ainsi que le dossier source (`.agents/commands/`)
- APM les remplacera par de vrais fichiers pour les skills de packages
- Les skills locaux conservés doivent être migrés vers un package APM local (structure ci-dessus)

### 2e. Configurer .gitignore

Les fichiers générés par `apm install` ne doivent pas être commités — `apm.yml` et `apm.lock.yaml` sont la source de vérité, comme `package.json` + `package-lock.json`. Les fichiers sont régénérés de façon idempotente par `apm install`.

**Ajouter** au `.gitignore` (regrouper les entrées AI ensemble) :
```gitignore
# AI — fichiers générés et settings locaux
.claude/commands/
.claude/settings.local.json
.opencode/commands/
.github/prompts/
.github/instructions/
apm_modules/
```

**Retirer `CLAUDE.md`** du `.gitignore` s'il y est — il sera commité comme symlink vers `AGENTS.md`.

### 2f. Configurer CLAUDE.md

**Si `CLAUDE.md` est un symlink vers `AGENTS.md`** : parfait, s'assurer qu'il est commité (pas dans `.gitignore`)
**Si `CLAUDE.md` est un vrai fichier identique à `AGENTS.md`** : le remplacer par un symlink `ln -sf AGENTS.md CLAUDE.md`
**Si `CLAUDE.md` n'existe pas mais `AGENTS.md` oui** : créer le symlink `ln -s AGENTS.md CLAUDE.md`
**Si ni `CLAUDE.md` ni `AGENTS.md` n'existent** : signaler à l'utilisateur qu'il devra créer un `AGENTS.md` pour documenter le projet

### 2g. Ajouter les instructions APM au projet

Copier le fichier [`AGENT-apm.md`](AGENT-apm.md) dans `.apm-local/AGENTS.md` du projet. Ce fichier contient les instructions permanentes pour que les agents créent correctement les nouveaux prompts via APM.

Ajouter la section suivante dans `AGENTS.md` (et/ou `CLAUDE.md` si c'est un fichier indépendant) :

```markdown
## Agent Skills (APM)
**CRITIQUE : Ne jamais créer de fichiers de prompts/commandes directement dans `.claude/commands/` ou `.github/prompts/`.**
Tous les prompts doivent être créés comme packages APM locaux dans `.apm-local/`. Voir @.apm-local/AGENTS.md pour le guide complet.
```

### 2h. Mettre à jour la documentation

Chercher les mentions d'ancien setup de skills dans `README.md`, `AGENTS.md`, `ARCHITECTURE.md` et les mettre à jour :

- **Skills de packages APM** : ne pas lister individuellement — référer au README du package comme source canonique
- **Skills locaux** : les documenter dans `AGENTS.md` et/ou `README.md` du projet avec leur description et usage

### 2i. Présenter le plan

Avant d'exécuter, présente le plan complet à l'utilisateur avec les actions prévues :

```
Plan d'adoption APM

  Ajouter    : apm.yml, mise.toml (APM), .apm-local/AGENTS.md
  Modifier   : Makefile, .gitignore, AGENTS.md, [autres fichiers identifiés]
  Supprimer  : [fichiers/scripts obsolètes identifiés]
  Conserver  : [skills locaux identifiés]
```

**Obtenir l'approbation avant de procéder.**

## Phase 3 — Exécution

Appliquer le plan approuvé. Après chaque modification significative, informer l'utilisateur de ce qui a été fait.

### 3a. Nettoyer les résidus AVANT d'installer

**Critique** : APM skip silencieusement les fichiers existants qu'il ne gère pas. Avant d'exécuter `apm install`, vérifier que les emplacements cibles ne contiennent pas de résidus (symlinks ou fichiers) qui porteraient le même nom qu'un skill APM :

```bash
# Chercher des symlinks résiduels dans les dossiers de commands
find . -name "*.md" -type l -path "*/commands/*"
```

Supprimer tout symlink trouvé — APM les remplacera par de vrais fichiers.

### 3b. Installer

```bash
apm install
```

### 3c. Valider

Vérifier que les fichiers sont générés selon le target configuré dans `apm.yml` :
- `target: claude` → `.claude/commands/` uniquement
- `target: all` → `.claude/commands/`, `.opencode/commands/`, `.github/prompts/`
- Chaque dossier cible doit contenir les skills de packages APM + les skills locaux
- `apm.lock.yaml` — lockfile avec commit pinné et hash SHA-256

Si un target est vide ou incomplet :
1. Vérifier la valeur de `target` dans `apm.yml`
2. Vérifier qu'aucun résidu ne bloquait l'écriture (relancer l'étape 3a)

## Phase 4 — Résumé

Présenter un résumé adapté aux actions réellement effectuées :

```
Adoption APM terminée!

  Ajoutés       : [fichiers ajoutés]
  Modifiés      : [fichiers modifiés]
  Supprimés     : [fichiers supprimés]
  Conservés     : [skills locaux préservés]

  Skills APM    : N (via packages externes)
  Skills locaux : N (via .apm-local/)
  Targets       : [selon target configuré]
```

## Règles importantes

- **Diagnostiquer avant d'agir** — ne jamais modifier sans avoir présenté le plan
- **Skills locaux via .apm-local/** — jamais de copie manuelle vers chaque target
- **Nettoyer les résidus avant d'installer** — APM skip les fichiers existants silencieusement
- **Préserver toute logique de setup non liée aux agents** (env-setup, dépendances, BD, etc.)
- **Commiter `apm.lock.yaml`** — c'est l'équivalent de `package-lock.json`
- **Gitignore les outputs APM** — les fichiers générés ne sont pas commités
- **Tout contenu généré** (commits, PR, messages) doit être rédigé en français
