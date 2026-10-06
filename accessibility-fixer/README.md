# accessibility-fixer

Audits et correctifs d'accessibilité WCAG 2.2 Level AA, directement dans le projet consommateur. Technologiquement agnostique — fonctionne avec n'importe quelle stack UI via une bibliothèque de guides embarquée par plateforme.

## Prompts

| Commande | Description |
|----------|-------------|
| `/a11y-audit` | Audit d'accessibilité d'une plateforme/feature : détection de plateforme, workflow 4 phases, rapport dans `accessibility-audit/reports/` |
| `/a11y-fix` | Appliquer les correctifs d'un rapport d'audit : sélection par sévérité, fixes vérifiés un par un |
| `/a11y-review` | Review accessibilité d'une PR GitHub : commentaires inline avec détection de doublons, mode CI |

### `/a11y-audit`

Audit approfondi d'une portée précise (une plateforme, une feature). Charge les guides embarqués du skill `a11y-guides`, détecte les plateformes présentes dans le projet, puis suit le workflow 4 phases :

1. **Discovery** — inventaire des composants custom et scan rapide des propriétés d'accessibilité
2. **Deep Dive** — examen de chaque composant (labels, traits, états, contraste, focus) avec critères WCAG
3. **Pattern Verification** — recherche exhaustive de toutes les occurrences de chaque issue, toutes variantes et tous états
4. **Report** — rapport dans `accessibility-audit/reports/[platform]/Accessibility_Audit_[Platform]_[Feature]_YYYY-MM-DD.md`

```
/a11y-audit
# Plateforme détectée : iOS
# Portée : écran de connexion
# → accessibility-audit/reports/ios/Accessibility_Audit_iOS_Connexion_2026-10-06.md
```

**Bonne pratique :** auditer une plateforme et une feature à la fois. Une portée restreinte (« flux d'authentification », pas « tout l'app ») produit des rapports actionnables.

### `/a11y-fix`

Applique les correctifs du rapport d'audit de ton choix : liste les rapports disponibles, propose la sélection par sévérité (Critical d'abord), vérifie que chaque issue existe encore avant de corriger, et produit un résumé `_FIXES_` avec les fichiers modifiés.

Périmètre strict : uniquement les propriétés d'accessibilité — pas de refactoring, pas de modification de logique.

### `/a11y-review`

Review des fichiers modifiés d'une PR via `gh` CLI : commentaires inline postés sur les lignes en cause, détection de doublons (saute les issues déjà signalées ou déjà corrigées), résumé concis, exit codes pour le gating CI (0 ok / 1 critical / 2 high).

## Pipeline

```
/a11y-audit  →  rapport d'audit
     │
     ▼
/a11y-fix  →  correctifs appliqués (Critical + High d'abord)
     │
     ▼
/a11y-review  →  garde-fou sur les futures PR (CI ou local)
```

## Bibliothèque de guides

Les guides WCAG 2.2 sont **embarqués dans le package** (skill `a11y-guides`) — aucun clone ni téléchargement n'est requis. `apm install` déploie la bibliothèque localement et les prompts y accèdent en lecture directe :

- **36 guides** : workflow d'audit, issues communes, référence WCAG, guides par plateforme (Web, Android, iOS, React Native, Flutter, Android TV, Fire TV, tvOS), patterns, mappings composants → WCAG
- **Résolution locale** via `GUIDES_MANIFEST.json` — chargement sélectif (core + plateforme + patterns conditionnels), jamais la bibliothèque complète
- **Versionnés avec le package** — le lockfile APM épingle le contenu exact

Cette bibliothèque était précédemment distribuée via le repo `dominiclabbe/accessibility-fixer-guides` (désormais archivé — ce package est la source de vérité).

## Plateformes supportées

| Plateforme | Guide | Signaux de détection |
|-----------|-------|---------------------|
| Web (HTML, React, Vue, Angular) | `GUIDE_WEB.md` | `*.jsx`, `*.tsx`, `*.html`, `*.css` |
| Android (XML, Jetpack Compose) | `GUIDE_ANDROID.md` | `*.kt`, `*.java`, `res/layout/*.xml` |
| iOS (UIKit, SwiftUI) | `GUIDE_IOS.md` | `*.swift`, `*.m`, `*.mm` |
| React Native | `GUIDE_REACT_NATIVE.md` | `*.jsx`/`*.tsx` + imports react-native |
| Flutter | `GUIDE_FLUTTER.md` | `*.dart` |
| Android TV / Fire TV | `GUIDE_ANDROID_TV.md` (+ `FIRE_OS_ADVANCED.md`) | Android + leanback/Fire OS |
| tvOS | `GUIDE_TVOS.md` | `*.swift` + tvOS |

## Prérequis

| Commande | Prérequis |
|----------|-----------|
| `/a11y-audit` | Aucun |
| `/a11y-fix` | Aucun |
| `/a11y-review` | `gh` CLI authentifié — dégradation gracieuse si absent |

Les rapports sont générés dans la langue du projet (section « Langue » de `AGENTS.md`), sinon dans la langue de l'utilisateur.

## Structure du projet consommateur

```
ton-projet/
└── accessibility-audit/
    └── reports/             # créé automatiquement
        ├── web/
        ├── android/
        ├── ios/
        └── pr/
```

Les rapports sont des artefacts du projet — à committer ou non selon la pratique de l'équipe.

## Migration depuis l'installation globale

Si tu utilisais la version autonome (commandes installées dans `~/.claude/commands/`) :

1. Supprimer les anciennes commandes globales : `~/.claude/commands/audit.md`, `pr-review.md`, `fix-accessibility.md`
2. Installer le package via APM (voir ci-dessous)
3. Les rapports existants dans `accessibility-audit/reports/` restent compatibles — `/a11y-fix` les consomme tels quels

## Installation

```yaml
# apm.yml
dependencies:
  apm:
    - mirego/agentic/accessibility-fixer#v1.3.0
```

Puis `apm install` — les prompts et la bibliothèque de guides sont déployés dans les dossiers des agents configurés.

## Autres harnais (Pi et autres agents)

APM déploie les slash commands et le skill selon les targets configurés. Les skills suivent le standard Agent Skills et sont lus par tous les harnais récents depuis `.agents/skills/`. Pour les slash commands, certains harnais utilisent d'autres dossiers et demandent une petite config :

**Pi** — les prompt templates se chargent depuis `.pi/prompts/`, pas depuis les dossiers de commands APM :

1. Installer avec au moins un target non-Claude (pour peupler `.agents/skills/`) :

   ```yaml
   # apm.yml
   targets: [claude, opencode]
   ```

2. Pointer les prompt templates de Pi vers les commands déployées, dans `.pi/settings.json` :

   ```json
   {
     "prompts": ["../.opencode/commands"]
   }
   ```

3. `/reload` dans Pi — les commandes `/a11y-audit`, `/a11y-fix` et `/a11y-review` apparaissent dans le complètement de `/`, et le skill est invoquable via `/skill:a11y-guides` ou automatiquement. Au premier lancement, Pi demande d'approuver le projet avant de charger `.agents/skills/` projet.

La bibliothèque de guides embarquée est identique pour tous les harnais — seule la localisation des commands varie.
