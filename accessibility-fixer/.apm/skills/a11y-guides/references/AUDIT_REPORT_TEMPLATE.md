# Audit Report Template

Structure standard des rapports d'audit d'accessibilité générés par `/a11y-audit`. Utiliser ce squelette tel quel — `/a11y-fix` parse ce format pour appliquer les correctifs.

---

```markdown
# Audit d'accessibilité — [Plateforme] — [Feature/Écran]

**Date :** YYYY-MM-DD
**WCAG cible :** 2.2 Level AA
**Portée :** [feature/écran audité, dossiers exclus le cas échéant]

## Résumé

| Sévérité | Nombre |
|----------|--------|
| Critical | X |
| High     | X |
| Medium   | X |
| Low      | X |
| **Total** | **X** |

## Issues

### Issue #001: [Composant] — [Problème précis]

**Sévérité :** Critical
**WCAG SC :** X.X.X — Nom (Level X)

**Localisation :**
- **Fichier :** `path/to/Component.ext`
- **Ligne :** `123`
- **Écran :** [nom de l'écran]
- **Composant :** [nom du composant]

**Toutes les occurrences :**
1. `FileA.ext:35` — description
2. `FileB.ext:9` — description

**Impact :** [Impact concret pour l'utilisateur avec un handicap]

**Code actuel :**
```[langage]
[code problématique]
```

**Correctif recommandé :**
```[langage]
[code corrigé]
```

**Comportement lecteur d'écran :**
- **Actuel :** [ce qui est annoncé]
- **Attendu :** [ce qui devrait être annoncé]

[... répéter par issue, triées Critical → High → Medium → Low]

## Implementation Strategy

[Ordre de traitement recommandé : fixes groupés par composant/pattern, estimation d'effort, dépendances]

## Localized Strings Required

[Table des chaînes à localiser introduites par les correctifs : clé, valeur proposée, contexte]

## Automated Testing Examples

[Exemples de tests d'accessibilité adaptés à la plateforme (espresso, XCUITest, axe, etc.)]

## Files Audited

- `path/to/file1.ext`
- `path/to/file2.ext`

## Components Examined

- [Composant custom 1]
- [Composant custom 2]
```

---

## Règles de format

- **Tri :** par sévérité (Critical → High → Medium → Low), jamais par ordre de découverte ni par fichier. Au sein d'une même sévérité, grouper les issues liées (même composant/pattern).
- **Occurrences :** chaque issue liste TOUTES ses occurrences avec `fichier:ligne` — jamais seulement la première trouvée.
- **Aucun résultat positif :** ne pas inclure ce qui est conforme — uniquement les issues.
- **Nommage du fichier :** `Accessibility_Audit_[Platform]_[Feature]_YYYY-MM-DD.md` dans `accessibility-audit/reports/[platform]/`.
- **Stabilité pour parsing :** `/a11y-fix` s'appuie sur les champs `Fichier :`, `Ligne :` et le bloc **Correctif recommandé** — ne pas renommer ces sections.
