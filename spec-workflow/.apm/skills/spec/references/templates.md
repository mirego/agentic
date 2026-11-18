# Spec templates

Write headings in the project language (French projects use the French names in parentheses). Drop sections that add nothing for this change, and keep the initiative link only when the spec belongs to an initiative.

## PRD

```markdown
# <Title>

> **Initiative:** [<initiative title>](../initiatives/<init-slug>.md)

## Context (Contexte)
Why this change is needed.

## Goal (Objectif)
What we want to achieve, for whom.

## Specification (Spécifications)
### Features (Fonctionnalités)
### User interface (Interface utilisateur)
### Data (Données)

## Technical decisions (Décisions techniques)
Choices and their rationale.

## Affected areas (Zones impactées)
Modules, screens or services touched.

## Acceptance criteria (Critères d'acceptation)
- [ ] Criterion 1
- [ ] Criterion 2
```

## RFC

```markdown
# RFC: <Title>

> **Initiative:** [<initiative title>](../initiatives/<init-slug>.md)

## Problem (Problème)
What does not work or is missing.

## Proposed solution (Solution proposée)
The recommended approach, with technical details.

## Alternatives considered (Alternatives considérées)
Other approaches and why they were set aside.

## Affected areas (Zones impactées)

## Risks and mitigations (Risques et mitigations)

## Open questions (Questions ouvertes)
Points to settle during review.

## Acceptance criteria (Critères d'acceptation)
- [ ] Criterion 1
```

## Lightweight (Libre)

```markdown
# <Title>

> **Initiative:** [<initiative title>](../initiatives/<init-slug>.md)

## Context (Contexte)
## Proposed changes (Changements proposés)
## Affected areas (Zones impactées)
## Validation
How to verify it, `make check` being the project's reference check.
```
