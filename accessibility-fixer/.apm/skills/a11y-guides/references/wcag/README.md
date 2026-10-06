# WCAG Validation Guides

This directory contains detailed guides for specific WCAG success criteria and validation patterns. These guides are the **single source of truth** used by both Claude Code commands and the GitHub app.

## Critical Validation Guides

These guides were created to ensure consistency between manual audits and automated PR reviews:

### [CONTRAST_CHECKING.md](./CONTRAST_CHECKING.md)
**Visual contrast analysis** - Comprehensive guide for checking color contrast compliance.

**Covers:**
- Text contrast (WCAG 1.4.3): 4.5:1 for normal, 3:1 for large text
- Non-text contrast (WCAG 1.4.11): 3:1 for UI components and states
- Focus indicator contrast
- Component state indicators (selected, hover, disabled, error)
- Color-only indicators (WCAG 1.4.1)
- Platform-specific patterns (Web, iOS, Android)
- Contrast calculation methods
- Documentation templates

**Example issues:**
- Light gray placeholder text on white background
- Selection indicators with insufficient contrast on colored backgrounds
- Focus outlines too similar to background
- Disabled states that look identical to enabled states

### [ID_VALIDATION.md](./ID_VALIDATION.md)
**ID generation and validation** - Ensures HTML/XML IDs are valid and accessible.

**Covers:**
- HTML ID validity rules (no spaces, special characters)
- Unsanitized user data in ID generation
- ID collision detection
- `aria-labelledby` / `aria-describedby` reference validation
- Proper slugify functions
- React `useId()` patterns
- Platform-specific ID patterns
- Testing strategies

**Example issues:**
- `id="city-new york"` (contains space - invalid)
- `id="city-st. john's"` (special characters break CSS selectors)
- Different city names generating same ID (collisions)
- Using array indices as IDs (unstable)

### [LIVE_REGION_FREQUENCY.md](./LIVE_REGION_FREQUENCY.md)
**aria-live frequency patterns** - Prevents excessive screen reader announcements.

**Covers:**
- When to use vs. not use aria-live
- Frequency thresholds (every second vs. every minute)
- Timer/countdown patterns
- Real-time data updates
- Search result announcements
- Progress bar patterns
- Debouncing/throttling strategies
- User-controlled announcements
- Platform-specific live region patterns

**Example issues:**
- Timer updating every 10ms with `aria-live="polite"`
- Stock prices announcing every second
- Search results announcing on every keystroke
- Progress bar announcing every percentage change

### [EDGE_CASE_VALIDATION.md](./EDGE_CASE_VALIDATION.md)
**Edge cases and defensive patterns** - Catches issues that only appear with certain data or conditions.

**Covers:**
- Redundant ARIA attributes (aria-checked + checked)
- Semantic role conflicts (link with role="button")
- Data-dependent failures (special characters, Unicode)
- Internationalization issues (RTL text, date formats)
- State-dependent accessibility (loading, error, empty states)
- Conditional rendering issues
- Browser/device specific issues
- Performance-related accessibility
- When to flag vs. when not to flag

**Example issues:**
- `role="switch"` with redundant `aria-checked`
- ID generation that breaks with accented characters
- Required state not announced when conditionally applied
- Missing context in dynamic labels

## WCAG Principle Guides

### [PRINCIPLE_1_PERCEIVABLE.md](./PRINCIPLE_1_PERCEIVABLE.md)
Information and user interface components must be presentable to users in ways they can perceive.

### [PRINCIPLE_2_OPERABLE.md](./PRINCIPLE_2_OPERABLE.md)
User interface components and navigation must be operable.

### [PRINCIPLE_3_UNDERSTANDABLE.md](./PRINCIPLE_3_UNDERSTANDABLE.md)
Information and the operation of user interface must be understandable.

### [PRINCIPLE_4_ROBUST.md](./PRINCIPLE_4_ROBUST.md)
Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.

## Reference Guides

### [QUICK_LOOKUP.md](./QUICK_LOOKUP.md)
Quick reference tables for common WCAG checks.

### [COMPONENT_WCAG_MAPPINGS.md](./COMPONENT_WCAG_MAPPINGS.md)
Maps UI components to their WCAG requirements.

### [SEVERITY_GUIDELINES.md](./SEVERITY_GUIDELINES.md)
Rules for assigning issue severity (Critical, High, Medium, Low).

### [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
Comprehensive testing checklist for audits.

### [MOBILE_WCAG_INTERPRETATION.md](./MOBILE_WCAG_INTERPRETATION.md)
How WCAG applies to mobile platforms (iOS, Android).

## Usage

### In Claude Code Commands

These guides are automatically loaded by the `/audit` and `/fix-accessibility` commands:

```markdown
## Before Starting - Essential Reading

3. **Load ALL WCAG principle guides (CRITICAL for comprehensive audits):**
   - `guides/wcag/CONTRAST_CHECKING.md`
   - `guides/wcag/ID_VALIDATION.md`
   - `guides/wcag/LIVE_REGION_FREQUENCY.md`
   - `guides/wcag/EDGE_CASE_VALIDATION.md`
   - ... (other guides)
```

### In GitHub App

Load these guides in your audit runner:

```typescript
const REQUIRED_GUIDES = [
  'wcag/CONTRAST_CHECKING.md',
  'wcag/ID_VALIDATION.md',
  'wcag/LIVE_REGION_FREQUENCY.md',
  'wcag/EDGE_CASE_VALIDATION.md',
  // ... other guides
];
```

See [GITHUB_APP_INTEGRATION.md](../../GITHUB_APP_INTEGRATION.md) for full integration instructions.

## Updating Guides

When updating these guides:

1. **Edit the guide file** directly
2. **Test with Claude Code** using `/audit`
3. **Update GitHub app** to load latest version
4. **Run consistency tests** to verify both systems use same logic
5. **Document changes** in guide's "Last Updated" section

## Consistency Guarantee

These guides are version-controlled and both Claude Code and the GitHub app load them directly. This ensures:

✅ Same checking logic across all tools
✅ Consistent issue detection
✅ Same severity assignments
✅ Single place to update rules

---

**Last Updated:** 2026-02-10
**Maintained by:** accessibility-fixer project
**Used by:** Claude Code commands, GitHub app, other accessibility tools
