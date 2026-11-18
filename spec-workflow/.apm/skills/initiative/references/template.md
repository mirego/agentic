# Initiative template

Write headings, labels and content in the project language (French projects use the French names in parentheses).

```markdown
# Initiative: <Title>

> **Status (Statut):** Draft
> **Created (Créée le):** YYYY-MM-DD

## Vision
2-3 sentences focused on the value for users.

## Goals (Objectifs)
- Measurable goal 1
- Measurable goal 2

## Personas
| Persona | Description | Main need (Besoin principal) |
|---------|-------------|------------------------------|
| <Name>  | <Description> | <Need> |

## User stories
- As a <persona>, I want <action> so that <benefit>

## Spec breakdown (Découpage en specs)
| # | Spec | Type | Priority (Priorité) | Dependencies (Dépendances) | Status (Statut) |
|---|------|------|---------------------|----------------------------|-----------------|
| 1 | `spec-slug-1` | PRD | P1 | - | pending |
| 2 | `spec-slug-2` | PRD | P1 | 1 | pending |
| 3 | `spec-slug-3` | RFC | P2 | - | pending |

### Implementation phases (Phases d'implémentation)
**Phase 1 - <Name>** (P1)
- Spec 1: short description
- Spec 2: short description

**Phase 2 - <Name>** (P2)
- Spec 3: short description

## Out of scope (Hors scope)
- Explicitly excluded item

## Success criteria (Critères de succès)
- [ ] Criterion 1

## Risks and assumptions (Risques et hypothèses)
| Risk / assumption | Impact | Mitigation |
|-------------------|--------|------------|
| <Description> | High/Medium/Low | <How we address it> |
```

Keep the status values `pending`, `spec-created` and `done` untranslated in the breakdown table: the other skills match them literally. The initiative status moves from Draft (in review) to Active (merged, work started) to Done (all specs implemented, archived in `docs/initiatives/done/`).
