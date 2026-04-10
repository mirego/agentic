# APM (Agent Package Manager)

Ce projet utilise [APM](https://github.com/microsoft/apm) pour gérer et distribuer les prompts (skills, commandes, instructions) vers les différents outils AI (Claude Code, GitHub Copilot, etc.).

## Comment ça fonctionne

- `.apm-local/` contient les packages locaux (prompts propres au projet)
- `apm.yml` à la racine du projet déclare toutes les dépendances
- `apm install` génère les fichiers de commandes dans les répertoires cibles (`.claude/commands/`, `.github/prompts/`, etc.)
- Les fichiers générés dans les répertoires cibles sont gitignorés — `.apm-local/` est la source de vérité

## Créer un nouveau prompt

Chaque nouveau prompt DOIT être créé comme package APM local. Ne jamais placer de fichiers directement dans `.claude/commands/` ou `.github/prompts/` — ce sont des outputs générés.

### 1. Créer la structure du package

```
.apm-local/<nom-du-prompt>/
├── apm.yml
└── .apm/
    └── prompts/
        └── <nom-du-prompt>.prompt.md
```

Utiliser le kebab-case pour le nom du prompt (ex : `sentry-triage`, `epic-analysis`).

### 2. Écrire le `apm.yml`

```yaml
name: <nom-du-prompt>
version: 1.0.0
```

### 3. Écrire le fichier prompt

Créer `.apm-local/<nom-du-prompt>/.apm/prompts/<nom-du-prompt>.prompt.md` :

```markdown
---
description: Description en une ligne de ce que le prompt fait
argument-hint: [description des arguments attendus, ou tableau vide]
---

Instructions du prompt ici...
```

- `description` est obligatoire — affiché dans les listes de commandes
- `argument-hint` est obligatoire — utiliser `[]` si le prompt ne prend pas d'arguments
- `$ARGUMENTS` (ou `$ARGUMENTS[0]`, `$ARGUMENTS[1]`, etc.) référence les arguments fournis par l'utilisateur

### 4. Enregistrer dans `apm.yml`

Ajouter le path dans le `apm.yml` racine sous `dependencies.apm` :

```yaml
dependencies:
  apm:
    - ./.apm-local/<nom-du-prompt>
```

### 5. Installer

```bash
apm install
```

Ceci distribue le prompt vers tous les targets configurés. Si un ancien fichier du même nom existe dans un répertoire cible, le supprimer d'abord — APM skip les fichiers existants qu'il ne gère pas.

## Modifier un prompt existant

Éditer le fichier source dans `.apm-local/<nom-du-prompt>/.apm/prompts/<nom-du-prompt>.prompt.md`, puis exécuter `apm install` pour propager les changements.

## Prompts actuels

| Prompt | Description |
|--------|-------------|
<!-- Ajouter les prompts du projet ici -->
