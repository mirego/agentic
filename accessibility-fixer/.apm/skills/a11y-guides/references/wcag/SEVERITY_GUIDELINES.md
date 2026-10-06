# Accessibility Issue Severity Guidelines
## How to assign severity levels to accessibility issues

---

## Severity Level Definitions

### Critical
**Complete blocker to functionality for users with disabilities**

**Characteristics:**
- Makes core functionality completely inaccessible
- Blocks essential user journeys
- Affects many users
- **Always** violates Level A WCAG criteria
- User cannot proceed or complete primary tasks

**Examples:**
- Submit button with no accessible label (can't complete checkout)
- Form fields without labels (can't fill out form)
- Entire screen not navigable with keyboard/screen reader
- Modal that traps focus with no escape
- Critical interactive elements not keyboard accessible
- Video player with no accessible controls

**WCAG Criteria often involved:**
- 2.1.1 Keyboard (A) - Core functionality not keyboard accessible
- 2.1.2 No Keyboard Trap (A) - Can't escape from component
- 3.3.2 Labels or Instructions (A) - Form can't be filled out
- 4.1.2 Name, Role, Value (A) - Critical buttons/controls without labels

**Action:** Must fix immediately before release

---

### High
**Significantly impairs user experience but doesn't completely block**

**Characteristics:**
- Severely degrades usability
- Makes important features difficult to use
- **Typically** violates Level AA WCAG criteria
- Affects substantial number of users
- Workarounds exist but are very difficult

**Examples:**
- Poor color contrast on body text (hard to read)
- Text doesn't scale with system settings
- Collection items not properly grouped (tedious navigation)
- Important status messages not announced
- Focus indicators too faint to see
- Touch targets smaller than 24px minimum
- Missing focus management in complex interactions
- Heading hierarchy incorrect or missing
- Repeated elements without distinguishing context

**WCAG Criteria often involved:**
- 1.3.1 Info and Relationships (A) - Structure missing but usable
- 1.4.3 Contrast (Minimum) (AA) - Text difficult to read
- 1.4.4 Resize Text (AA) - Text doesn't scale
- 2.4.6 Headings and Labels (AA) - Navigation difficult
- 2.4.7 Focus Visible (AA) - Focus hard to track
- 2.5.8 Target Size (Minimum) (AA) - Hard to tap accurately
- 3.3.1 Error Identification (A) - Errors unclear
- 3.3.3 Error Suggestion (AA) - No guidance on fixing errors
- 4.1.3 Status Messages (AA) - Important updates missed

**Action:** Fix before release if possible, prioritize in next sprint if not

---

### Medium
**Degrades experience, causes inconvenience**

**Characteristics:**
- Makes tasks less efficient
- Affects specific user groups or scenarios
- Violates best practices or Level AA/AAA criteria
- Workarounds are reasonably accessible
- Confusion or extra steps required

**Examples:**
- Navigation menu items in inconsistent order (but usable)
- Skip link missing (must navigate through all header items)
- Decorative images not explicitly hidden (creates noise)
- Link purpose unclear without reading context
- Small touch targets (above 24px but below 48px recommendation)
- Minor heading issues (slightly vague but understandable)
- Inconsistent icon usage across screens
- Minor form label issues (label exists but could be clearer)

**WCAG Criteria often involved:**
- 1.1.1 Non-text Content (A) - Decorative images not hidden
- 2.4.1 Bypass Blocks (A) - No skip link but content navigable
- 2.4.4 Link Purpose (A) - Context required but available
- 3.2.3 Consistent Navigation (AA) - Navigation somewhat inconsistent
- 3.2.4 Consistent Identification (AA) - Similar features inconsistently identified

**Action:** Include in current development cycle, fix within sprint or two

---

### Low
**Minor inconvenience, doesn't significantly impact usability**

**Characteristics:**
- Causes minor extra effort
- Affects few users or rare scenarios
- Enhancement opportunity rather than blocker
- Best practice violation but meets minimum requirements
- Cosmetic or optimization issue

**Examples:**
- Verbose screen reader labels (redundant but functional)
- Role name unnecessarily included in label (e.g., "Save button")
- Help link in slightly inconsistent position (but still findable)
- Suboptimal focus order (logical but not ideal visual match)
- Missing optional ARIA properties that would enhance experience
- Images that might be decorative (unclear case, reported for review)

**WCAG Criteria often involved:**
- Often relates to enhancing already-compliant implementations
- AAA criteria that improve experience
- Best practices beyond WCAG requirements
- Optimization of existing accessible implementations

**Action:** Fix when convenient, include in backlog for future sprints

---

## Decision Matrix

### Step 1: Identify WCAG Conformance Level

**Level A violations → Start at Critical or High**
- Level A is essential basic accessibility
- Violations usually indicate serious barriers

**Level AA violations → Usually High or Medium**
- Level AA is standard target for compliance
- Violations typically cause significant difficulties

**Level AAA violations → Usually Medium or Low**
- Level AAA is enhanced accessibility
- Violations are nice-to-have improvements

---

### Step 2: Assess Impact on User

Ask these questions:

**Can user complete the primary task?**
- NO → Critical or High
- YES, but with significant difficulty → High
- YES, but with moderate difficulty → Medium
- YES, with minor inconvenience → Low

**How many users are affected?**
- All/most screen reader users → Critical or High
- Significant subset of users → High
- Specific user groups in certain scenarios → Medium
- Small number of users in edge cases → Low

**Is there a reasonable workaround?**
- No workaround → Critical
- Workaround exists but very difficult → High
- Workaround exists and is moderately difficult → Medium
- Workaround is easy → Low

**What type of functionality is affected?**
- Core user journeys (sign up, checkout, core features) → Critical or High
- Important but not critical features → High or Medium
- Secondary features → Medium or Low
- Optional enhancements → Low

---

### Step 3: Consider Context

**Increase severity if:**
- Issue appears on multiple screens
- Issue affects authentication or payment flows
- Issue prevents access to legal/policy information
- Issue compounds with other accessibility issues
- App is for accessibility or assistive technology
- Target users include people with disabilities

**Decrease severity if:**
- Issue is isolated to one rarely-used screen
- Multiple alternatives exist
- Issue only affects specific edge case
- Cosmetic enhancement with no functional impact

---

## Severity by Common Issue Type

### Missing Labels/Descriptions
| Scenario | Severity | Reason |
|----------|----------|--------|
| Submit button without label | Critical | Blocks form completion |
| Icon button without label | Critical/High | Depends on functionality importance |
| Decorative image not hidden | Low | Creates noise but not blocking |
| Collection item image without context | High | See COLLECTION_ITEMS_PATTERN.md |

### Color Contrast
| Scenario | Severity | Reason |
|----------|----------|--------|
| Body text fails 4.5:1 | High | Main content hard to read |
| Large heading fails 3:1 | High | Navigation and structure unclear |
| Disabled button fails contrast | Medium | Contains info user needs |
| Decorative element fails | Low | Doesn't convey information |

### Keyboard Accessibility
| Scenario | Severity | Reason |
|----------|----------|--------|
| Can't access checkout with keyboard | Critical | Blocks core journey |
| Modal traps focus | Critical | Can't escape |
| Custom control not keyboard accessible | High | Feature not usable |
| Suboptimal focus order | Medium | Usable but confusing |
| Skip link missing | Medium | Navigation tedious but possible |

### Text Scaling
| Scenario | Severity | Reason |
|----------|----------|--------|
| Critical content doesn't scale | High | Content unreadable at user's settings |
| UI breaks at large text sizes | High | App becomes unusable |
| Minor layout issue at max size | Medium | Mostly usable with small issues |
| Recommended text sizes not used | Low | Scales but could be better |

### Form Issues
| Scenario | Severity | Reason |
|----------|----------|--------|
| Input with no label | Critical | Can't fill out form |
| Input with only placeholder | Critical/High | Label disappears when typing |
| Error shown only as color | High | User can't identify what's wrong |
| Generic error message | High | User can't fix the problem |
| Vague but present label | Medium | Usable but unclear |

### Collection/List Issues
| Scenario | Severity | Reason |
|----------|----------|--------|
| List items not grouped | High | Very tedious navigation, see COLLECTION_ITEMS_PATTERN.md |
| Repeated buttons without context | High | Can't distinguish options, see REPEATED_ELEMENTS_CONTEXT.md |
| Position info missing (usually auto) | Low | Platform usually provides automatically |

### Navigation Issues
| Scenario | Severity | Reason |
|----------|----------|--------|
| Tabs without roles/states | High | Can't understand or navigate tabs, see BUTTONS_ACTING_AS_TABS.md |
| Navigation order inconsistent | Medium | Navigation less predictable |
| Back button missing | Medium | Can navigate but less efficient |
| Breadcrumbs not marked up | Medium | Position less clear |

### Status Messages
| Scenario | Severity | Reason |
|----------|----------|--------|
| Form submission result not announced | High | User doesn't know if action succeeded |
| Loading state not announced | High | User doesn't know app is working |
| Toast not announced | High/Medium | Depends on message importance |
| Progress not announced | Medium | User can see visual indicator |

### Timing Issues
| Scenario | Severity | Reason |
|----------|----------|--------|
| Session timeout with no warning | High | Loses work unexpectedly |
| Auto-play carousel without pause | High | Can't read content |
| Toast disappears too fast | Medium | Can't read message |
| Rapid flashing content | Critical | Safety risk (seizures) |

### Touch Targets
| Scenario | Severity | Reason |
|----------|----------|--------|
| Critical button < 24px | High | Violates minimum AA requirement |
| Button 24-44px (below platform recommendation) | Medium | Meets minimum but not ideal |
| Button > 44px in constrained space | Low | Enhancement opportunity |

---

## Special Cases

### Decorative vs Informational - Unclear Cases
**Severity: Low** with note "verify if decorative"
- When auditor isn't certain if image is decorative
- Report for review but don't assume it's an error
- Developer/designer can confirm intent

### Role Name in Accessible Label
**Severity: Low to Medium** depending on frequency
- Example: "Back button" instead of "Back"
- Not a blocker but adds unnecessary verbosity
- See: [Avoid Role in Label](../patterns/AVOID_ROLE_IN_LABEL.md)
- Low if occasional, Medium if pervasive pattern

### Platform Recommendation vs Minimum
**Severity: Medium typically**
- Example: Touch target is 24px (minimum) but platform recommends 48px
- Meets WCAG but not platform best practice
- Medium because better UX is achievable

### Multiple Issues on Same Element
**Severity: Use highest severity**
- Button missing label (Critical) + small target (High) = Critical overall
- Fix the critical issue first, then address others

### Issues in Error States
**Consider realistic use:**
- Error state itself inaccessible: High (errors happen commonly)
- Error state for unusual edge case: Medium
- Error state for rare condition: Low

---

## Severity Adjustment Factors

### Increase Severity For:
- **Frequency:** Issue appears on many screens
- **Core functionality:** Affects critical user journeys
- **User base:** Target audience includes people with disabilities
- **Compounding:** Multiple issues in same area compound difficulty
- **Platform patterns:** Violates well-established platform conventions
- **Legal requirements:** Could create compliance liability

### Decrease Severity For:
- **Isolation:** Issue only on one rarely-accessed screen
- **Redundancy:** Multiple ways to accomplish same task
- **Partial compliance:** Issue is minor variation of compliant pattern
- **Context:** Specific scenario where issue has less impact
- **Temporary:** Issue in beta feature or A/B test variant

---

## Quick Reference: WCAG Level → Typical Severity

| WCAG Level | Typical Severity Range | Notes |
|------------|----------------------|-------|
| Level A | Critical to High | Essential requirements, serious when violated |
| Level AA | High to Medium | Standard target, significant when violated |
| Level AAA | Medium to Low | Enhanced features, nice-to-have |

**However:** Always consider actual user impact, not just conformance level.

Example exceptions:
- 2.4.1 Bypass Blocks (A) might be Medium if navigation is short
- 1.4.3 Contrast (AA) might be Critical if entire UI fails contrast
- Some AAA criteria might be High if they significantly improve experience

---

## Severity in Report Headers

When writing audit reports, issues should be grouped by severity with headers:

```markdown
## Critical Issues
[List all critical issues here]

## High Priority Issues
[List all high issues here]

## Medium Priority Issues
[List all medium issues here]

## Low Priority Issues
[List all low issues here]
```

**Never group by location or discovery order.**

Within each severity level, optionally sub-group by:
- WCAG Success Criterion (e.g., "4.1.2 Name, Role, Value Issues")
- Component type (e.g., "Button Issues", "Form Issues")
- Platform (if multi-platform audit)

---

## Related Resources
- [WCAG Principle Guides](.) - Detailed SC descriptions
- [Component WCAG Mappings](COMPONENT_WCAG_MAPPINGS.md) - Which SC applies to which components
- [Common Issues](../COMMON_ISSUES.md) - Issue patterns with typical severity
- Platform-specific guides for context

---

**WCAG 2.2 Official Reference:** https://www.w3.org/TR/WCAG22/
**WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
