# APM (Agent Package Manager)

Ce projet utilise [APM](https://github.com/microsoft/apm) pour gérer et distribuer les agent skills (slash commands) vers les différents outils AI (Claude Code, GitHub Copilot, etc.).

## Comment ça fonctionne

- `.apm-local/` contient les packages locaux (skills propres au projet)
- `apm.yml` à la racine du projet déclare toutes les dépendances
- `apm install` génère les fichiers de commandes dans les répertoires cibles (`.claude/commands/`, `.github/prompts/`, etc.)
- Les fichiers générés dans les répertoires cibles sont gitignorés — `.apm-local/` est la source de vérité

## Créer un nouveau skill

Chaque nouveau skill, commande ou prompt d'agent DOIT être créé comme package APM local. Ne jamais placer de fichiers directement dans `.claude/commands/` ou `.github/prompts/` — ce sont des outputs générés.

### 1. Créer la structure du package

```
.apm-local/<nom-du-skill>/
├── apm.yml
└── .apm/
    └── prompts/
        └── <nom-du-skill>.prompt.md
```

Utiliser le kebab-case pour le nom du skill (ex : `sentry-triage`, `epic-analysis`).

### 2. Écrire le `apm.yml`

```yaml
name: <nom-du-skill>
version: 1.0.0
```

### 3. Écrire le fichier prompt

Créer `.apm-local/<nom-du-skill>/.apm/prompts/<nom-du-skill>.prompt.md` :

```markdown
---
description: Description en une ligne de ce que le skill fait
argument-hint: [description des arguments attendus, ou tableau vide]
---

Instructions du skill ici...
```

- `description` est obligatoire — affiché dans les listes de commandes
- `argument-hint` est obligatoire — utiliser `[]` si le skill ne prend pas d'arguments
- `$ARGUMENTS` (ou `$ARGUMENTS[0]`, `$ARGUMENTS[1]`, etc.) référence les arguments fournis par l'utilisateur

### 4. Enregistrer dans `apm.yml`

Ajouter le path dans le `apm.yml` racine sous `dependencies.apm` :

```yaml
dependencies:
  apm:
    - ./.apm-local/<nom-du-skill>
```

### 5. Installer

```bash
apm install
```

Ceci distribue le skill vers tous les targets configurés. Si un ancien fichier du même nom existe dans un répertoire cible, le supprimer d'abord — APM skip les fichiers existants qu'il ne gère pas.

## Modifier un skill existant

Éditer le fichier source dans `.apm-local/<nom-du-skill>/.apm/prompts/<nom-du-skill>.prompt.md`, puis exécuter `apm install` pour propager les changements.

## Skills actuels

| Skill | Description |
|-------|-------------|
<!-- Ajouter les skills du projet ici -->
