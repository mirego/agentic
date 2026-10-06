# Edge Case Validation Guide

**Purpose:** Identify subtle accessibility issues that only manifest under specific conditions or with certain data.

**WCAG Success Criteria Covered:**
- Various (context-dependent)

---

## Overview

Edge cases are accessibility issues that:
- Work fine with current/test data
- Break with different inputs or conditions
- Only affect specific user groups or scenarios
- Are easy to miss in typical testing

**This guide helps identify fragile implementations that may fail in production.**

---

## 1. Semantic Role Overuse and Conflicts

### Issue: Adding Redundant ARIA Roles

**The Pattern:**
Adding role attributes to native elements that already have implicit roles.

#### Case 1: role="switch" on Checkbox Input

**The Debate:**

```jsx
// Pattern A: Native checkbox with role="switch"
<input
  type="checkbox"
  role="switch"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>

// Pattern B: Native checkbox without role override
<input
  type="checkbox"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

**Arguments FOR role="switch":**
- ✓ W3C ARIA APG explicitly shows this pattern
- ✓ Semantically more accurate for on/off toggles
- ✓ Announces as "switch" instead of "checkbox"
- ✓ Modern screen readers handle it well

**Arguments AGAINST role="switch":**
- ⚠️ May cause duplicate/inconsistent announcements on older AT
- ⚠️ Native checkbox already works fine
- ⚠️ Adds complexity without clear benefit
- ⚠️ Some screen readers may be confused

**Recommendation:**
This is a **judgment call**, not a clear violation. Consider:
- If using `role="switch"`, **do NOT add redundant** `aria-checked` (the `checked` prop handles it)
- If semantic accuracy matters (Settings toggles), use `role="switch"`
- If simplicity matters, use plain checkbox
- Be consistent across the application

**Severity if flagged:** Low (it works either way)

#### Case 2: role="button" on <button>

```jsx
// ❌ REDUNDANT: Button already has implicit role
<button role="button" onClick={handleClick}>
  Click me
</button>

// ✓ CORRECT: No explicit role needed
<button onClick={handleClick}>
  Click me
</button>
```

**Why it matters:**
- Redundant, but harmless
- May confuse developers about when roles are needed
- Indicates misunderstanding of ARIA

**Severity:** Very Low (informational)

#### Case 3: Conflicting Roles

```jsx
// ❌ WRONG: Conflicting semantics
<a href="/page" role="button">
  Link styled as button
</a>

// ✓ CORRECT: Use the right element
<button onClick={() => navigate('/page')}>
  Button that navigates
</button>

// OR if truly a link:
<a href="/page" className="button-styled">
  Link styled as button
</a>
```

**Why it matters:**
- Links and buttons have different keyboard behavior
- Screen readers announce different instructions
- Creates confusion about expected interaction

**Severity:** Medium

---

## 2. Redundant ARIA Attributes

### Issue: Duplicating Native Element Behavior

**Common patterns:**

#### Case 1: aria-checked on Checkbox with checked

```jsx
// ❌ REDUNDANT: checked already provides state
<input
  type="checkbox"
  checked={isChecked}
  aria-checked={isChecked}  // Unnecessary!
  onChange={handleChange}
/>

// ✓ CORRECT: Native attribute is sufficient
<input
  type="checkbox"
  checked={isChecked}
  onChange={handleChange}
/>
```

#### Case 2: aria-required with required

```html
<!-- ❌ REDUNDANT -->
<input type="text" required aria-required="true" />

<!-- ✓ CORRECT -->
<input type="text" required />
```

#### Case 3: aria-disabled with disabled

```html
<!-- ❌ REDUNDANT -->
<button disabled aria-disabled="true">Submit</button>

<!-- ✓ CORRECT -->
<button disabled>Submit</button>
```

**Why it matters:**
- Adds unnecessary code
- May create sync issues if one updates but not the other
- Indicates ARIA misunderstanding

**Severity:** Low (works but redundant)

**When ARIA IS needed:**
When you **can't use native HTML**:
```jsx
// ✓ CORRECT: Custom switch needs ARIA
<div
  role="switch"
  aria-checked={isOn}
  tabIndex={0}
  onClick={toggle}
  onKeyDown={handleKey}
>
  {isOn ? 'On' : 'Off'}
</div>
```

---

## 3. Data-Dependent ID Collisions

### Issue: Generated IDs that Collide with Certain Data

See [ID_VALIDATION.md](./ID_VALIDATION.md) for comprehensive coverage.

**Quick check:**
```javascript
// ❌ COLLISION RISK: Different inputs, same output
slugify("St. Louis")  → "st-louis"
slugify("St Louis")   → "st-louis"  // Collision!

// ❌ EDGE CASE: Special characters
slugify("AT&T")       → "att"
slugify("3M")         → "3m"
```

**Testing strategy:**
Test ID generation with:
- Names with spaces
- Names with punctuation (apostrophes, periods)
- Names with accents/Unicode
- Names that might naturally collide

**Severity:** Medium to High (depending on likelihood)

---

## 4. Internationalization Edge Cases

### Issue: Hardcoded Assumptions About Text

#### Case 1: Text Directionality

```jsx
// ❌ ASSUMES LTR: Arrow always points right
<button>
  Next →
</button>

// ✓ CORRECT: Use CSS for directional content
<button>
  Next <span className="arrow-right" aria-hidden="true"></span>
</button>

/* CSS handles RTL */
[dir="rtl"] .arrow-right::before {
  content: "←";
}
```

#### Case 2: Date/Time Formats

```jsx
// ❌ HARDCODED: US format only
aria-label={`Created on ${month}/${day}/${year}`}

// ✓ CORRECT: Use locale-aware formatting
aria-label={`Created on ${date.toLocaleDateString()}`}
```

#### Case 3: Number Formatting

```jsx
// ❌ ASSUMES: Dot as decimal separator
aria-valuetext={`${value.toFixed(2)} dollars`}

// ✓ CORRECT: Locale-aware
aria-valuetext={`${value.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD'
})}`}
```

**Severity:** Medium (affects international users)

---

## 5. State-Dependent Accessibility

### Issue: Accessibility Breaks in Certain States

#### Case 1: Loading States

```jsx
// ❌ LOADING: Button becomes inaccessible
<button disabled={isLoading} aria-label="Submit">
  {isLoading ? <Spinner /> : 'Submit'}
</button>

// ✓ CORRECT: Announce loading state
<button disabled={isLoading} aria-label={isLoading ? "Submitting..." : "Submit"}>
  {isLoading ? <><Spinner aria-hidden="true" /> Submitting...</> : 'Submit'}
</button>
```

#### Case 2: Empty States

```jsx
// ❌ EMPTY: No indication why list is empty
<ul>
  {items.length === 0 && <li>No items</li>}
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// ✓ CORRECT: Semantic empty state
{items.length === 0 ? (
  <p role="status">No items found. Try adjusting your search.</p>
) : (
  <ul aria-label="Search results">
    {items.map(item => <li key={item.id}>{item.name}</li>)}
  </ul>
)}
```

#### Case 3: Error States

```jsx
// ❌ ERROR: Only visual indication
<input className={hasError ? 'error' : ''} />
{hasError && <span style={{color: 'red'}}>Invalid</span>}

// ✓ CORRECT: Programmatic error state
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-msg" : undefined}
/>
{hasError && (
  <span id="error-msg" role="alert">
    Invalid email format
  </span>
)}
```

**Severity:** Medium to High (depending on state frequency)

---

## 6. Conditional Rendering Issues

### Issue: Accessibility Attributes Applied Conditionally

#### Case 1: Missing Labels in Some Conditions

```jsx
// ❌ CONDITIONAL: Label missing when no error
<input
  type="email"
  aria-label={hasError ? "Email (invalid format)" : undefined}
/>

// ✓ CORRECT: Always provide label
<input
  type="email"
  aria-label="Email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
```

#### Case 2: Dynamic Required State

```jsx
// ❌ CONFUSING: Required state not announced
const isRequired = billingCountry === 'US';

<input
  type="text"
  aria-label="State"
  // Missing: aria-required={isRequired}
/>

// ✓ CORRECT: Announce dynamic required state
<label htmlFor="state">
  State {isRequired && <span aria-label="required">*</span>}
</label>
<input
  id="state"
  type="text"
  aria-required={isRequired}
/>
```

**Severity:** Medium

---

## 7. Dynamic Content Accessibility

### Issue: Accessible Names Change Based on Data

#### Case 1: Verbose vs. Concise Labels

```jsx
// ❌ TOO VERBOSE: Repeats context
<button aria-label="Select red theme color">
  <Circle color="red" />
</button>

// ✓ CONCISE: Context is clear from heading
<h3>Theme Color</h3>
<button aria-label="Red">
  <Circle color="red" />
</button>
```

**Why it matters:**
- Screen reader users navigate by elements
- Hearing "Theme Color, Red, button, not selected" is clearer than "Select red theme color, button, not selected"
- Group context (heading) provides context

**Severity:** Low (verbose but works)

#### Case 2: Missing Context in Labels

```jsx
// ❌ VAGUE: "More Info" about what?
{products.map(product => (
  <div>
    <h3>{product.name}</h3>
    <button aria-label="More Info">Learn More</button>
  </div>
))}

// ✓ SPECIFIC: Clear what button relates to
{products.map(product => (
  <div>
    <h3 id={`product-${product.id}-name`}>{product.name}</h3>
    <button aria-labelledby={`product-${product.id}-name more-info-${product.id}`}>
      <span id={`more-info-${product.id}`}>Learn More</span>
    </button>
  </div>
))}

// OR simpler:
<button aria-label={`Learn more about ${product.name}`}>
  Learn More
</button>
```

**Severity:** Medium to High (affects navigation)

---

## 8. Browser/Device Specific Issues

### Issue: Works in Some Browsers, Fails in Others

#### Case 1: Focus Management in Safari

```jsx
// ⚠️ SAFARI ISSUE: May not focus custom elements
<div
  role="button"
  tabIndex={0}  // Safari needs explicit tabIndex
  onClick={handleClick}
>
  Custom Button
</div>
```

#### Case 2: VoiceOver Announcements

```jsx
// ⚠️ VOICEOVER: May announce labels twice
<button>
  <span className="visually-hidden">Red</span>
  <Circle color="red" aria-label="Red theme color" />
</button>

// ✓ BETTER: One label method
<button aria-label="Red">
  <Circle color="red" aria-hidden="true" />
</button>
```

**Testing strategy:**
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile (iOS VoiceOver, Android TalkBack)
- Test with multiple screen readers (NVDA, JAWS, VoiceOver)

**Severity:** Medium (if common browser/device)

---

## 9. Performance-Related Accessibility

### Issue: Accessibility Breaks Under Load

#### Case 1: Large Lists Without Virtualization

```jsx
// ⚠️ PERFORMANCE: 10,000 items = slow screen reader
<ul>
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>

// ✓ BETTER: Virtualized list
<VirtualList
  items={items}
  renderItem={(item) => <li>{item.name}</li>}
  aria-label="Search results"
/>
```

**Why it matters:**
- Screen readers must build accessibility tree for all items
- Can cause significant lag
- May crash screen reader software

**Severity:** Medium to High (if lists commonly large)

#### Case 2: Excessive DOM Updates

```jsx
// ⚠️ PERFORMANCE: Re-renders entire tree
{items.map((item, index) => (
  <div key={index}> {/* Bad: index as key */}
    <ItemComponent item={item} />
  </div>
))}

// ✓ BETTER: Stable keys
{items.map(item => (
  <div key={item.id}>
    <ItemComponent item={item} />
  </div>
))}
```

**Severity:** Low to Medium

---

## 10. Testing Strategy for Edge Cases

### What to Test

1. **Data variations:**
   - Empty strings
   - Very long strings (1000+ characters)
   - Special characters (!@#$%^&*()_+)
   - Unicode/emoji
   - Numbers only
   - Mixed languages
   - Right-to-left text

2. **State combinations:**
   - Empty state
   - Loading state
   - Error state
   - Disabled state
   - Success state
   - Combination states (loading + error)

3. **User interactions:**
   - Rapid clicking/keyboard input
   - Form abandonment
   - Navigation during loading
   - Browser back/forward
   - Page refresh during operation

4. **Environmental conditions:**
   - Different browsers (Chrome, Firefox, Safari, Edge)
   - Different screen readers (NVDA, JAWS, VoiceOver, TalkBack)
   - Different zoom levels (100%, 200%, 400%)
   - Different color schemes (light, dark, high contrast)
   - Different languages/locales

### Automated Edge Case Tests

```javascript
// Test with various inputs
const edgeCaseInputs = [
  "Normal Name",
  "Name with   spaces",
  "O'Brien",
  "St. John's School",
  "São Paulo",
  "AT&T",
  "",
  "A".repeat(1000),  // Very long
  "Name\nWith\nNewlines",
  "👍 Emoji Name",
  "مرحبا",  // Arabic (RTL)
];

test.each(edgeCaseInputs)('handles edge case input: %s', (input) => {
  const { container } = render(<Component name={input} />);

  // Verify no invalid IDs
  const invalidIds = container.querySelectorAll('[id*=" "]');
  expect(invalidIds).toHaveLength(0);

  // Verify all elements have accessible names
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAccessibleName();
  });
});
```

---

## 11. Severity Guidelines for Edge Cases

### Low
- Redundant ARIA attributes (works but unnecessary)
- Verbose labels (works but could be simpler)
- Missing role on element with implicit role

### Medium
- Internationalization issues (affects non-English users)
- State-dependent accessibility gaps
- Browser-specific issues in common browsers
- Performance issues with large datasets

### High
- Conflicting semantics (link with role="button")
- Missing required context in dynamic content
- Accessibility completely breaks in certain states
- ID collisions causing ARIA relationship failures

---

## 12. Documentation Template

```markdown
## 🟡 Accessibility Issue: [Brief Description] - Edge Case

**WCAG SC:** [Relevant SC if applicable]
**Severity:** Low/Medium
**Type:** Edge Case / Defensive Issue

**Issue:**
[Description of the pattern that works currently but may fail under specific conditions]

**Current implementation:**
[Code showing current pattern]

**Why this is an edge case:**
- Works fine with current data: [example]
- Would break with: [example problematic data]
- Occurs when: [specific condition]

**Likelihood:** [Low/Medium/High based on real-world usage]

**Impact if issue occurs:**
[What happens when the edge case is hit]

**Suggested fix:**
[More robust implementation]

**Alternative approach:**
[If applicable, show a different architectural solution]

**Testing strategy:**
[How to test for this edge case]
```

---

## 13. Philosophy: When to Flag Edge Cases

### Always Flag:
- ✓ ID generation that could collide
- ✓ Conflicting semantic roles
- ✓ State-dependent accessibility gaps
- ✓ Missing error handling

### Consider Flagging (Context-Dependent):
- ⚠️ Redundant ARIA (if it indicates misunderstanding)
- ⚠️ Verbose labels (if it's a pattern across the app)
- ⚠️ Performance concerns (if lists are often large)

### Usually Don't Flag:
- ❌ Works correctly with current data and likely inputs
- ❌ Extremely unlikely scenarios
- ❌ Theoretical issues without practical impact

### The Rule:
**Flag it if:**
1. It's likely to occur in production
2. It would significantly impact users when it occurs
3. The fix is straightforward

**Don't flag if:**
1. It's purely theoretical
2. Current implementation is a documented best practice
3. The "issue" is actually a valid alternative approach

---

**Last Updated:** 2026-02-10
**Applies to:** WCAG 2.2 Level AA + Best Practices
**Status:** Single Source of Truth for All Accessibility Tools
