# sidekick

Équipe multi-modèles pour [OpenCode](https://opencode.ai) : un **agent principal** qui planifie et révise mais **ne peut pas éditer de fichiers**, déléguant chaque changement à un **sidekick** moins cher et plus rapide.

Inspiré du patron « sidekick » de [Devin Fusion](https://cognition.com/blog/devin-fusion) (Cognition) et de [opencode-fusion](https://github.com/mihneaptu/opencode-fusion) (MIT). Ce package est une adaptation APM : mêmes garanties mécaniques, distribution par `apm install`, choix des modèles laissé à chaque personne.

L'édition de fichiers de l'agent principal est refusée au niveau de la couche de permissions. Son seul moyen de changer un fichier est de remettre une spec au sidekick. L'intelligence coûteuse reste sur les décisions (le plan, l'interprétation de l'ambiguïté, la revue) pendant qu'un modèle bon marché fait le travail mécanique.

## Prérequis

- **OpenCode 1.18 ou plus récent.** La clé `subagent_depth` n'existe pas avant 1.18 : sur 1.17 et antérieur, OpenCode **rejette le fichier de config au complet** et ne démarre pas. Vérifier avec `opencode --version`.
- Un accès à au moins deux modèles (idéalement chez deux fournisseurs différents).

## Installation

Le package s'installe au **scope utilisateur** — c'est une configuration personnelle de poste de travail, pas une dépendance de projet :

```bash
apm install -g mirego/agentic/sidekick#v1.3.0 --target opencode
```

Les agents arrivent dans `~/.config/opencode/agents/` et la commande `/sidekick-status` dans `~/.config/opencode/commands/`.

### Configurer ses modèles

Aucun agent ne fixe de modèle : c'est à chacun de router les rôles dans `~/.config/opencode/opencode.json` (ou `.jsonc`).

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "subagent_depth": 2,
  "model": "<fournisseur>/<modele-principal>",
  "agent": {
    "build": { "model": "<fournisseur>/<modele-principal>" },
    "sidekick": { "model": "<fournisseur>/<modele-rapide>" },
    "explore": { "model": "<fournisseur>/<modele-rapide>" },

    // Optionnels
    "research": { "model": "<fournisseur>/<modele-moyen>" },
    "reviewer": { "model": "<autre-fournisseur>/<modele-fort>" },
    "design": { "model": "<fournisseur>/<modele-moyen>" },
    "vision": { "model": "<fournisseur>/<modele-vision>" }
  }
}
```

- **`subagent_depth: 2` est requis.** Sans ça, le sidekick ne peut pas déléguer une recherche en lecture seule à `explore` ou `research`. OpenCode défaut à `1`, ce qui bloque silencieusement cet appel imbriqué.
- **`plan` réutilise le modèle par défaut** — pas besoin de l'assigner.
- **`reviewer` chez un autre fournisseur** donne une revue croisée gratuite : les modèles d'une même famille partagent leurs angles morts.
- **Ne jamais mettre `model:` dans le frontmatter d'un agent** : le frontmatter écrase `opencode.json` en silence.

Redémarrer complètement OpenCode après avoir modifié la config — elle est lue au démarrage seulement.

### Vérifier

```
/sidekick-status
```

Vérifie trois couches : l'application réelle dans la session courante (les outils refusés sont-ils vraiment absents), la config sur disque, et les agents résolus via `opencode agent list`.

## L'équipe

| Agent | Rôle | Requis | Mode |
|-------|------|--------|------|
| `build` | Principal : planifie, délègue, révise, vérifie | oui | primary |
| `plan` | Même cerveau que `build`, mais ne touche jamais au disque | oui | primary |
| `sidekick` | Exécute les éditions et les commandes | oui | subagent |
| `normal` | Trappe de sortie : OpenCode standard, sans garde-fous | oui | primary |
| `explore` | Exploration rapide en lecture seule (intégré à OpenCode) | oui | subagent |
| `research` | Recherche externe (web, docs) | optionnel | subagent |
| `reviewer` | Critique un plan, audite un diff | optionnel | subagent |
| `design` | Implémentation frontend/UI | optionnel | subagent |
| `vision` | Transcrit les images que le modèle principal ne voit pas | optionnel | subagent |

`explore` est intégré à OpenCode : il prend juste une entrée `model` dans la config, sans fichier d'agent.

### Les trois agents primaires

`Tab` permet de basculer entre eux en cours de session.

| Agent | Atteint le disque ? | Usage |
|-------|---------------------|-------|
| `build` | via le sidekick | travail normal |
| `plan` | non | exploration, revue avant approbation |
| `normal` | directement, sans garde-fous | trappe de sortie |

**À propos de `normal`.** C'est une trappe volontaire, avec deux mises en garde : elle ne porte **aucun** garde-fou (pas seulement pas de délégation — les commandes destructives que le sidekick demanderait de confirmer passent sans prompt), et **le transcript est partagé** entre agents primaires, donc `build` relira ensuite ces éditions comme les siennes. Repasser sur `build` dès que l'obstacle est levé.

## Ce qui est appliqué vs. conseillé

**Appliqué — la couche de permissions.** OpenCode vérifie à chaque appel d'outil, peu importe ce que le modèle lit ou a l'intention de faire :

- `edit`, `grep`, `glob` et `list` sont refusés pour `build` et `plan`. Les outils refusés sont retirés du schéma d'outils : il n'y a pas d'outil d'édition à décliner.
- Le bash est deny-by-default avec une courte liste de vérification et de git en lecture. `git commit` et `git push` demandent une approbation ; les formes force/mirror/delete sont refusées.
- `git commit` et `git push` sont refusés au sidekick et au design : la revue-puis-commit est le chemin normal.
- La délégation est bornée par une allowlist `task` explicite.

Si l'agent principal « ne délègue pas », le résultat est une inaction visible : rien ne change sur le disque. Le mode d'échec n'est jamais un contournement silencieux.

**Conseillé — la couche de prompt.** La précision des specs, la rigueur de la revue, la discipline de coût et la parallélisation sont des instructions. Si le modèle relâche à ce niveau, le coût est de la qualité ou des tokens gaspillés, jamais une édition non autorisée.

**Non garanti.** La couche de permissions borne quels outils chaque agent peut appeler. Ce n'est pas un sandbox : les règles sur les commandes git et les lectures de `.env` sont de la défense en profondeur contre les accidents, pas de l'isolation de processus.

## Auditer les coûts

Pas de plugin : OpenCode le fait déjà nativement.

```bash
opencode stats --models      # coût et tokens par modèle
opencode stats --tools       # ratio edit vs. task
opencode stats --days 7      # sur une fenêtre
```

Comme chaque rôle tourne sur son propre modèle, `--models` **est** l'attribution par agent.

## Personnaliser l'allowlist bash

L'allowlist de `build` couvre `pnpm`, `npm`, `make` et `mix`. C'est le seul endroit où une adaptation par projet a du sens : les patrons de permissions doivent nommer des commandes concrètes, ils ne peuvent pas être abstraits derrière `make check`.

Pour ajuster, éditer `~/.config/opencode/agents/build.md`. Deux règles :

- Garder `"*": "deny"` en premier — les patrons se résolvent en dernier-match-gagne.
- Garder les refus spécifiques de `git push` **après** `"git push*"`.

Attention : l'allowlist matche **chaque commande individuellement**. Ne pas chaîner avec `&&`, `||`, `;` ou `|` — la chaîne ne matche aucun patron et est bloquée.

Note : un `apm install` ultérieur écrase les fichiers déployés. Un fichier modifié à la main sera signalé par APM plutôt qu'écrasé en silence, mais garder une trace de ses ajustements.

## Limites

- **Pas de routage dynamique en cours de session.** La seconde technique de Devin Fusion (changer de modèle pendant la compaction) n'est pas possible dans OpenCode. Les modèles sont fixés par rôle au démarrage.
- **La config est lue au démarrage.** Tout changement demande un redémarrage complet.
- **Cible OpenCode 1.x.** Le schéma v2 (`agents` au pluriel, `permissions` en tableau) n'est pas supporté.
- **Pas de pont Claude Pro/Max.** L'upstream propose un plugin qui appelle la CLI Claude Code ; il est volontairement exclu ici (dépendance externe par poste, statut incertain côté Anthropic, et APM ne distribue pas les plugins OpenCode). Un `reviewer` chez un autre fournisseur remplit le même rôle.

## Désinstaller

```bash
apm uninstall -g sidekick
```

## Crédits

Patron « sidekick », cadrage et chiffres de [Devin Fusion](https://cognition.com/blog/devin-fusion) par [Cognition](https://cognition.com). Implémentation OpenCode et prompts dérivés de [opencode-fusion](https://github.com/mihneaptu/opencode-fusion) par [mihneaptu](https://github.com/mihneaptu) (licence MIT). Le découpage sous-jacent remonte au [mode architect/editor d'Aider](https://aider.chat/2024/09/26/architect.html) (2024).
