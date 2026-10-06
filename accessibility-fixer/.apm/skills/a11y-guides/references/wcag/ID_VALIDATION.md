# ID Validation and Generation Guide

**Purpose:** Ensure HTML/XML IDs are valid, unique, and accessible for ARIA relationships.

**WCAG Success Criteria Covered:**
- 4.1.1 Parsing (Level A) - Valid ID references
- 4.1.2 Name, Role, Value (Level A) - Proper ARIA relationships
- 1.3.1 Info and Relationships (Level A) - Programmatic associations

---

## Overview

Invalid or duplicate IDs break accessibility features that depend on them:
- `aria-labelledby` and `aria-describedby` references
- `<label for="id">` associations
- `aria-controls` relationships
- `aria-owns` relationships
- Fragment identifiers (`#id` in URLs)

**This validation MUST be performed during every code audit.**

---

## 1. ID Validity Rules (HTML Spec)

### What Makes a Valid ID

Per HTML specification, IDs must:
1. **Contain at least one character**
2. **Not contain any spaces**
3. **Be unique within the document**

### What's Technically Allowed (But Often Problematic)

IDs *can* contain:
- Letters: `a-z`, `A-Z`
- Digits: `0-9` (but not as first character in older browsers)
- Hyphens: `-`
- Underscores: `_`
- Colons: `:` (but conflicts with CSS selectors)
- Periods: `.` (but conflicts with CSS selectors)

### What to Avoid in IDs

```
❌ Spaces: "user name" → Invalid
❌ Special chars: "user@email" → Breaks CSS selectors
❌ Starting with digit: "123user" → Breaks CSS selectors in old browsers
❌ Unicode/emoji: "user-👍" → Unpredictable screen reader behavior
❌ Punctuation: "user's-name" → Apostrophes cause issues
```

### Recommended Pattern

**Use only: lowercase letters, digits, hyphens, underscores**

```javascript
// Good ID patterns:
"user-name"
"user_name"
"username"
"user-name-123"
"section-1-content"
```

---

## 2. Common ID Generation Mistakes

### Mistake 1: Unsanitized User Data

**The Problem:**
Directly using user input or data strings as IDs without sanitization.

```jsx
// ❌ BAD: Raw city names as IDs
{worldCities.map((clock) => (
  <article aria-labelledby={`city-${clock.city.toLowerCase()}`}>
    <h3 id={`city-${clock.city.toLowerCase()}`}>
      {clock.city}
    </h3>
  </article>
))}

// Problems with this approach:
// - "New York" → "city-new york" (space!)
// - "São Paulo" → "city-são paulo" (space + accents)
// - "St. John's" → "city-st. john's" (periods + apostrophe + space)
// - "O'Fallon" → "city-o'fallon" (apostrophe)
```

**Why It Breaks:**
- Spaces create invalid IDs
- `aria-labelledby="city-new york"` looks for TWO IDs: "city-new" and "york"
- Screen readers can't resolve the relationship
- CSS selectors `#city-st. john's` won't work

**Impact on Users:**
- Screen readers can't announce proper labels
- Keyboard navigation may break
- ARIA relationships fail silently

### Mistake 2: Simple String Replacement

**The Problem:**
Only replacing spaces but ignoring other problematic characters.

```javascript
// ❌ INCOMPLETE: Only handles spaces
const cityId = `city-${clock.city.replace(/\s+/g, '-').toLowerCase()}`;

// Still breaks on:
// - "St. John's" → "city-st.-john's" (period and apostrophe remain)
// - "São Paulo" → "city-são-paulo" (accented character remains)
// - "Zürich" → "city-zürich" (umlaut remains)
```

### Mistake 3: ID Collisions

**The Problem:**
Different inputs generating the same ID.

```javascript
// ❌ COLLISIONS: These produce identical IDs
"St. Louis"  → strip special chars → "st-louis"
"St Louis"   → strip special chars → "st-louis"  // Same!
"St-Louis"   → strip special chars → "st-louis"  // Same!

// Result: Multiple elements with id="city-st-louis"
// Only first one is reachable via aria-labelledby
```

### Mistake 4: Using Index as ID

**The Problem:**
Using array indices which change when items reorder.

```jsx
// ❌ BAD: Index-based IDs
{items.map((item, index) => (
  <article aria-labelledby={`item-${index}`}>
    <h3 id={`item-${index}`}>{item.name}</h3>
  </article>
))}

// Problems:
// - Sorting changes all IDs
// - Filtering changes all IDs
// - Adding/removing items shifts IDs
// - Bookmarks with #item-5 break
```

---

## 3. Proper ID Generation Strategies

### Strategy 1: Use React's useId() Hook (Web)

**Best for:** React 18+ applications

```jsx
// ✓ BEST: React's built-in useId
import { useId } from 'react';

export const WorldClocks = () => {
  return (
    <div>
      {worldCities.map((clock) => {
        const cityId = useId();  // Unique, stable ID

        return (
          <article key={clock.city} aria-labelledby={cityId}>
            <h3 id={cityId}>{clock.city}</h3>
            <p>{clock.timezone}</p>
          </article>
        );
      })}
    </div>
  );
};
```

**Benefits:**
- ✓ Guaranteed unique
- ✓ Stable across renders
- ✓ Works with React Server Components
- ✓ No external dependencies

**Limitations:**
- Only available in React 18+
- IDs are auto-generated (not human-readable)

### Strategy 2: Comprehensive Slugify Function

**Best for:** When you need human-readable IDs

```javascript
// ✓ ROBUST: Comprehensive slugify
function slugify(text) {
  return text
    .toString()                      // Convert to string
    .normalize('NFD')                // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()                   // Convert to lowercase
    .trim()                          // Remove whitespace from both ends
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/[^\w\-]+/g, '')        // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start
    .replace(/-+$/, '');             // Trim - from end
}

// Usage:
const cityId = `city-${slugify(clock.city)}`;

// Examples:
slugify("New York")     → "new-york"
slugify("São Paulo")    → "sao-paulo"
slugify("St. John's")   → "st-johns"
slugify("O'Fallon")     → "ofallon"
slugify("Zürich")       → "zurich"
```

### Strategy 3: Stable Unique Identifier

**Best for:** When items have unique IDs from backend

```jsx
// ✓ GOOD: Use existing unique identifier
{worldCities.map((clock) => {
  const cityId = `city-${clock.id}`;  // clock.id from database

  return (
    <article key={clock.id} aria-labelledby={cityId}>
      <h3 id={cityId}>{clock.city}</h3>
    </article>
  );
})}
```

**Benefits:**
- ✓ Unique and stable
- ✓ Doesn't change when data updates
- ✓ Can be bookmarked

### Strategy 4: Collision-Safe Slugify

**Best for:** When human-readable IDs are important but collisions possible

```javascript
// ✓ GOOD: Slugify + unique counter
function createUniqueId(text, usedIds = new Set()) {
  let slug = slugify(text);
  let counter = 1;
  let uniqueId = slug;

  // If collision, append counter
  while (usedIds.has(uniqueId)) {
    uniqueId = `${slug}-${counter}`;
    counter++;
  }

  usedIds.add(uniqueId);
  return uniqueId;
}

// Usage in component:
const usedIds = useRef(new Set());

{worldCities.map((clock) => {
  const cityId = createUniqueId(clock.city, usedIds.current);

  return (
    <article key={clock.city} aria-labelledby={cityId}>
      <h3 id={cityId}>{clock.city}</h3>
    </article>
  );
})}
```

---

## 4. Platform-Specific Guidance

### Web (React/Vue/Angular)

#### React
```jsx
// ✓ BEST: Use useId() in React 18+
import { useId } from 'react';

const MyComponent = () => {
  const id = useId();

  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
};
```

#### Vue 3
```vue
<script setup>
import { useId } from 'vue'

const id = useId()
</script>

<template>
  <label :for="id">Name</label>
  <input :id="id" />
</template>
```

#### Angular
```typescript
// Use service to generate unique IDs
@Injectable()
export class IdService {
  private counter = 0;

  generateId(prefix: string = 'id'): string {
    return `${prefix}-${this.counter++}`;
  }
}
```

### iOS (SwiftUI)

SwiftUI doesn't use HTML-style IDs, but similar principles apply:

```swift
// ✓ GOOD: Use stable identifiers
List(cities, id: \.id) { city in
    CityRow(city: city)
}

// ❌ BAD: Using unstable identifiers
// Don't use array indices or derived values that change
```

### Android (Jetpack Compose)

Compose doesn't use HTML-style IDs, but for accessibility:

```kotlin
// ✓ GOOD: Use stable keys
LazyColumn {
    items(cities, key = { it.id }) { city ->
        CityRow(city)
    }
}

// For testing IDs:
modifier = Modifier.testTag("city-${city.id}")
```

---

## 5. Validation Checklist

During audits, check for these patterns:

### ✓ Valid Patterns
```jsx
// React useId
const id = useId();

// Stable unique ID
id={`user-${user.id}`}

// Properly slugified
id={`section-${slugify(section.title)}`}

// Static IDs
id="login-form"
id="main-navigation"
```

### ❌ Invalid Patterns to Flag

```jsx
// Unsanitized user data
id={user.name}                                    // ❌ May contain spaces/special chars
id={`section-${title.toLowerCase()}`}            // ❌ May contain spaces
id={`city-${city.replace(/\s+/g, '-')}`}         // ❌ Only handles spaces

// Array indices
id={`item-${index}`}                              // ❌ Changes when list reorders

// Unstable values
id={`temp-${Math.random()}`}                      // ❌ Changes on every render
id={`item-${Date.now()}`}                         // ❌ Not stable

// Special characters
id={`user-${email}`}                              // ❌ email contains @, .
id={`section-${title}`}                           // ❌ May contain punctuation
```

---

## 6. Testing for ID Issues

### Manual Testing

**Test 1: Spaces in IDs**
```bash
# Search for potential space-containing IDs
grep -r "id={.*\\..*}" src/
grep -r "aria-labelledby={.*\\..*}" src/
```

**Test 2: Special Characters**
```bash
# Look for unsanitized string interpolation
grep -r "id={\`.*\${.*}\`}" src/
grep -r 'id={`.*${.*}`}' src/
```

**Test 3: Duplicate IDs**
```javascript
// Browser console:
const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log('Duplicate IDs:', [...new Set(duplicates)]);
```

### Automated Testing

```javascript
// Jest/Testing Library test
test('generates valid unique IDs', () => {
  const { container } = render(<CityList cities={testCities} />);

  // Get all IDs
  const elements = container.querySelectorAll('[id]');
  const ids = Array.from(elements).map(el => el.id);

  // Check uniqueness
  const uniqueIds = new Set(ids);
  expect(uniqueIds.size).toBe(ids.length);

  // Check validity (no spaces, valid chars)
  ids.forEach(id => {
    expect(id).toMatch(/^[a-z0-9_-]+$/);
    expect(id).not.toMatch(/\s/);
  });
});
```

---

## 7. How to Document ID Issues

```markdown
## 🟠 Accessibility Issue: aria-labelledby references may be invalid due to unsanitized IDs

**WCAG SC:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (Level A)
**Severity:** Major

**Issue:**
The `<article>` elements use `aria-labelledby` pointing to dynamically generated IDs based on city names. The current ID generation only replaces spaces and lowercases the string, but does not handle special characters (periods, apostrophes, accents, etc.). This creates invalid IDs that break ARIA relationships.

**Impact:**
When city names contain special characters, the generated IDs are invalid:
- "St. John's" → `id="city-st. john's"` (contains period, apostrophe, space)
- "São Paulo" → `id="city-são paulo"` (contains accented char, space)

Screen readers cannot resolve these `aria-labelledby` references, resulting in:
- No accessible name announced for articles
- Navigation confusion for screen reader users
- Potential duplicate IDs if "St. Louis" and "St Louis" both exist

**Current code:**
```jsx
<article
  key={clock.city}
  aria-labelledby={`city-${clock.city.replace(/\s+/g, '-').toLowerCase()}`}
>
  <h3 id={`city-${clock.city.replace(/\s+/g, '-').toLowerCase()}`}>
    {clock.city}
  </h3>
</article>
```

**Problem examples:**
- Input: "New York" → ID: "city-new-york" ✓ (works)
- Input: "St. John's" → ID: "city-st.-john's" ❌ (period and apostrophe invalid)
- Input: "São Paulo" → ID: "city-são-paulo" ❌ (accented character)

**Suggested fix (Option 1 - React 18+ useId):**
```jsx
import { useId } from 'react';

{worldCities.map((clock) => {
  const cityId = useId();

  return (
    <article key={clock.city} aria-labelledby={cityId}>
      <h3 id={cityId}>{clock.city}</h3>
      <p>{clock.timezone}</p>
    </article>
  );
})}
```

**Suggested fix (Option 2 - Proper slugify):**
```jsx
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

<article
  key={clock.city}
  aria-labelledby={`city-${slugify(clock.city)}`}
>
  <h3 id={`city-${slugify(clock.city)}`}>
    {clock.city}
  </h3>
</article>
```

**Results after fix:**
- "New York" → "new-york" ✓
- "St. John's" → "st-johns" ✓
- "São Paulo" → "sao-paulo" ✓
- All IDs are valid and unique

**Resources:**
- https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id
- https://react.dev/reference/react/useId
```

---

## 8. Quick Reference

### ID Generation Decision Tree

```
Need to generate ID for element?
│
├─ Using React 18+?
│  └─ YES → Use useId() ✓
│
├─ Have stable unique identifier (DB ID)?
│  └─ YES → Use it with prefix ✓
│
├─ Need human-readable IDs?
│  ├─ From user data?
│  │  └─ YES → Use slugify() + collision detection ✓
│  └─ Static?
│     └─ YES → Use descriptive static ID ✓
│
└─ Using array index?
   └─ STOP → This is usually wrong ❌
```

### Slugify Function (Copy-Paste Ready)

```javascript
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
```

### Common ID Patterns

```javascript
// Static IDs (best for known elements)
id="main-navigation"
id="user-profile-form"
id="search-results"

// Dynamic IDs with stable identifiers
id={`user-${user.id}`}
id={`product-${product.sku}`}
id={`section-${section.slug}`}

// Dynamic IDs from strings (use slugify!)
id={`category-${slugify(category.name)}`}
id={`city-${slugify(city.name)}`}

// React useId (React 18+)
const id = useId();
```

---

## 9. Integration with Audit Process

During Phase 2 (Deep Dive), specifically check:

1. **Search for ARIA ID references:**
   ```bash
   grep -r "aria-labelledby" src/
   grep -r "aria-describedby" src/
   grep -r "aria-controls" src/
   grep -r "htmlFor" src/  # React
   grep -r "for=" src/     # HTML
   ```

2. **Look for dynamic ID generation:**
   ```bash
   grep -r 'id={\`' src/
   grep -r 'id={`' src/
   grep -r "id={\${" src/
   ```

3. **Check for string manipulation in IDs:**
   - `.replace(/\s+/g, '-')` - Incomplete sanitization
   - `.toLowerCase()` alone - No sanitization
   - `.trim()` alone - Insufficient

4. **Verify ID generation functions:**
   - Look for `generateId`, `createId`, `makeId` functions
   - Ensure they properly sanitize input

5. **Test with problematic names:**
   - Names with spaces
   - Names with apostrophes (O'Brien, St. John's)
   - Names with accents (São Paulo, Zürich)
   - Names with special chars (AT&T, 3M)

---

**Last Updated:** 2026-02-10
**Applies to:** WCAG 2.2 Level AA, HTML Spec
**Status:** Single Source of Truth for All Accessibility Tools
