# ARIA Patterns Reference Guide
## Based on W3C ARIA Authoring Practices Guide (APG)

---

## Overview

This guide provides detailed reference information for implementing accessible interactive components using ARIA (Accessible Rich Internet Applications). All patterns are based on the [W3C ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).

**Target Audience:** Developers auditing or implementing accessible web components

**When to Use This Guide:**
- Implementing custom interactive widgets
- Auditing existing components for ARIA compliance
- Understanding proper keyboard interactions
- Troubleshooting accessibility issues with complex components

---

## General ARIA Principles

### The First Rule of ARIA
**Use native HTML elements whenever possible.** ARIA should only be used when semantic HTML is insufficient.

```javascript
// ❌ AVOID: Custom element with ARIA when semantic HTML works
<div role="button" tabIndex={0} onClick={handleClick}>Click me</div>

// ✅ PREFER: Native semantic HTML
<button onClick={handleClick}>Click me</button>
```

### ARIA Role, State, and Property Categories

**Roles** define what an element is or does:
- `role="button"`, `role="dialog"`, `role="tablist"`, etc.

**States** describe dynamic properties that change:
- `aria-expanded`, `aria-checked`, `aria-selected`, `aria-pressed`

**Properties** describe static characteristics:
- `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`

### Common ARIA Attributes

| Attribute | Purpose | Example Values |
|-----------|---------|----------------|
| `aria-label` | Provides accessible name | "Close dialog" |
| `aria-labelledby` | References element(s) providing name | "heading-id" |
| `aria-describedby` | References element(s) providing description | "description-id" |
| `aria-expanded` | Indicates if element is expanded/collapsed | true / false |
| `aria-controls` | References controlled element(s) | "panel-id" |
| `aria-live` | Announces dynamic content changes | polite / assertive / off |
| `aria-hidden` | Hides element from assistive tech | true / false |
| `aria-modal` | Indicates modal behavior | true / false |
| `aria-current` | Indicates current item in set | page / step / location / true |
| `aria-disabled` | Indicates disabled state | true / false |
| `aria-invalid` | Indicates validation error | true / false / grammar / spelling |

---

## Pattern 1: Tabs

**Use Case:** Present multiple content sections where only one is visible at a time

### Required Structure

```html
<div role="tablist" aria-label="Section tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Tab 2</button>
  <button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3">Tab 3</button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">
  Content 1
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  Content 2
</div>
<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
  Content 3
</div>
```

### Required ARIA Attributes

- **tablist**: `role="tablist"`, `aria-label` or `aria-labelledby`
- **tab**: `role="tab"`, `aria-selected`, `aria-controls`, `id`
- **tabpanel**: `role="tabpanel"`, `id`, `aria-labelledby`, `tabindex="0"` (if no focusable content)

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Tab | Move focus into/out of tablist |
| Arrow Left/Up | Move to previous tab (wraps) |
| Arrow Right/Down | Move to next tab (wraps) |
| Home | Move to first tab |
| End | Move to last tab |

### Focus Management

- Only the active tab should have `tabindex="0"`
- Inactive tabs should have `tabindex="-1"`
- Arrow keys move focus AND activate tabs (automatic activation recommended)

### Common Mistakes

❌ Not managing `tabindex` properly (all tabs focusable via Tab key)
❌ Missing `aria-controls` and `aria-labelledby` connections
❌ Arrow keys don't wrap from last to first tab
❌ Not hiding inactive panels with `hidden` attribute

---

## Pattern 2: Accordion

**Use Case:** Vertically stacked expandable/collapsible content sections

### Required Structure

```html
<div class="accordion">
  <h3>
    <button
      id="accordion-header-1"
      aria-expanded="true"
      aria-controls="accordion-panel-1">
      Section 1
    </button>
  </h3>
  <div
    id="accordion-panel-1"
    role="region"
    aria-labelledby="accordion-header-1">
    Content 1
  </div>

  <h3>
    <button
      id="accordion-header-2"
      aria-expanded="false"
      aria-controls="accordion-panel-2">
      Section 2
    </button>
  </h3>
  <div
    id="accordion-panel-2"
    role="region"
    aria-labelledby="accordion-header-2"
    hidden>
    Content 2
  </div>
</div>
```

### Required ARIA Attributes

- **button**: `aria-expanded`, `aria-controls`, `id`
- **panel**: `role="region"` (optional if < 6 panels), `aria-labelledby`, `id`
- **heading**: Proper heading level (h2-h6) wrapping button

### Keyboard Interactions

| Key | Action | Required |
|-----|--------|----------|
| Enter / Space | Toggle panel visibility | Yes |
| Tab | Move to next focusable element | Yes |
| Arrow Down | Move to next accordion header | Optional |
| Arrow Up | Move to previous accordion header | Optional |
| Home | Move to first accordion header | Optional |
| End | Move to last accordion header | Optional |

### Variations

**Single-Expand vs Multi-Expand:**
- Single-expand: Only one panel open at a time (common)
- Multi-expand: Multiple panels can be open simultaneously

### Common Mistakes

❌ Button not wrapped in heading element
❌ Missing `aria-expanded` attribute
❌ Using text in label instead of `aria-expanded` ("Section 1 (expanded)")
❌ Not using `hidden` attribute to hide collapsed panels
❌ Using `aria-disabled="true"` when panel should be collapsible

---

## Pattern 3: Modal Dialog

**Use Case:** Content requiring user interaction before returning to main content

### Required Structure

```html
<div class="modal-backdrop">
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description">

    <h2 id="dialog-title">Confirm Action</h2>
    <p id="dialog-description">Are you sure you want to proceed?</p>

    <button>Confirm</button>
    <button>Cancel</button>
    <button aria-label="Close">×</button>
  </div>
</div>
```

### Required ARIA Attributes

- **dialog**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` or `aria-label`
- **Optional**: `aria-describedby` (avoid if dialog has complex semantic structures)

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element (trapped within dialog) |
| Shift + Tab | Move to previous focusable element (trapped within dialog) |
| Escape | Close dialog |

### Focus Management - CRITICAL

**When Opening:**
1. Save reference to element that triggered modal
2. Move focus to appropriate element within modal:
   - First focusable element (simple dialogs)
   - Dialog container with `tabindex="-1"` (complex content)
   - Least destructive action (destructive operations)

**While Open:**
3. Trap focus within dialog (Tab/Shift+Tab wrap)
4. Prevent interaction with background content

**When Closing:**
5. Return focus to triggering element (or logical next element)

### Common Mistakes

❌ Missing `aria-modal="true"` attribute
❌ Focus not trapped within dialog
❌ Escape key doesn't close dialog
❌ Focus not returned to triggering element
❌ No visible close button
❌ Background content still keyboard-accessible

---

## Pattern 4: Combobox / Autocomplete

**Use Case:** Text input with associated popup for selecting predefined values

### Required Structure

```html
<label id="combobox-label" for="combobox-input">Choose a fruit</label>
<input
  id="combobox-input"
  type="text"
  role="combobox"
  aria-expanded="false"
  aria-controls="listbox-popup"
  aria-activedescendant=""
  aria-autocomplete="list"
  aria-labelledby="combobox-label"
/>

<ul id="listbox-popup" role="listbox" aria-labelledby="combobox-label" hidden>
  <li id="option-1" role="option" aria-selected="false">Apple</li>
  <li id="option-2" role="option" aria-selected="true">Banana</li>
  <li id="option-3" role="option" aria-selected="false">Cherry</li>
</ul>
```

### Required ARIA Attributes

**Combobox (input):**
- `role="combobox"`
- `aria-expanded` (true/false)
- `aria-controls` (references popup ID)
- `aria-activedescendant` (references focused option ID)
- `aria-autocomplete` (none/list/both)

**Popup:**
- `role="listbox"` (or grid/tree/dialog)

**Options:**
- `role="option"` (or gridcell/treeitem)
- `aria-selected` (true/false)

### aria-autocomplete Values

- **none**: Popup shows same suggestions regardless of input
- **list**: Suggests/completes based on input; user must select
- **both**: Suggests based on input AND auto-fills inline completion string

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Down Arrow | Open popup, move to next option |
| Up Arrow | Move to previous option |
| Enter | Accept selected option, close popup |
| Escape | Close popup, clear input (optional) |
| Home / End | Move to first/last option |
| Alt + Down | Open popup without moving focus |
| Printable chars | Type and filter options |

### Focus Management

**Critical:** DOM focus MUST remain on the combobox input at all times. Use `aria-activedescendant` to indicate which option is active, but don't move actual DOM focus to the option.

### Common Mistakes

❌ Moving DOM focus to popup options (breaks typing)
❌ Missing `aria-activedescendant` attribute
❌ Not updating `aria-expanded` when popup opens/closes
❌ Missing `aria-autocomplete` attribute
❌ Options missing `role="option"` and `aria-selected`

---

## Pattern 5: Menu Button

**Use Case:** Button that opens a menu of actions (not navigation links)

### Required Structure

```html
<button
  aria-haspopup="menu"
  aria-expanded="false"
  aria-controls="action-menu"
  id="menu-button">
  Actions
</button>

<ul id="action-menu" role="menu" hidden>
  <li role="none">
    <button role="menuitem">Edit</button>
  </li>
  <li role="none">
    <button role="menuitem">Delete</button>
  </li>
  <li role="none">
    <button role="menuitem">Share</button>
  </li>
</ul>
```

### Required ARIA Attributes

**Button:**
- `aria-haspopup="menu"` (or "true")
- `aria-expanded` (true/false)
- `aria-controls` (optional, references menu ID)

**Menu:**
- `role="menu"`

**Menu Items:**
- `role="menuitem"` (or menuitemcheckbox/menuitemradio)
- `tabindex="-1"` (not in Tab sequence)

### Keyboard Interactions

**On Button:**
| Key | Action |
|-----|--------|
| Enter / Space | Open menu, focus first item |
| Arrow Down | Open menu, focus first item |
| Arrow Up | Open menu, focus last item |

**In Menu:**
| Key | Action |
|-----|--------|
| Arrow Down / Up | Navigate items (wraps) |
| Home / End | Move to first/last item |
| Enter / Space | Activate item, close menu |
| Escape | Close menu, return focus to button |

### When NOT to Use

❌ **Don't use for navigation links** - use regular `<a>` elements or navigation patterns instead
❌ Menu button is for actions/commands, not navigation

### Common Mistakes

❌ Using menu role for navigation (use nav with links instead)
❌ Menu items are in Tab sequence (should be `tabindex="-1"`)
❌ Focus doesn't return to button when menu closes
❌ Missing `aria-haspopup` attribute

---

## Pattern 6: Disclosure (Show/Hide)

**Use Case:** Button that controls visibility of a content section

### Required Structure

```html
<button aria-expanded="false" aria-controls="content-1">
  Show details
</button>

<div id="content-1" hidden>
  Details content here...
</div>
```

### Alternative: Native HTML

```html
<details>
  <summary>Show details</summary>
  Details content here...
</details>
```

### Required ARIA Attributes

- **button**: `aria-expanded` (true/false), optional `aria-controls`

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Enter / Space | Toggle visibility |

### Common Mistakes

❌ Missing `aria-expanded` attribute
❌ Using text in button instead of `aria-expanded` ("Hide details" vs "Show details")
❌ Icon not marked `aria-hidden="true"`

### When to Use vs Other Patterns

- **Disclosure**: Simple show/hide of single content section
- **Accordion**: Multiple related disclosure sections
- **Tabs**: Switching between mutually exclusive content panels

---

## Pattern 7: Alert & Live Regions

**Use Case:** Announcing dynamic content changes to screen readers

### Alert (Urgent)

```html
<div role="alert" aria-live="assertive">
  Error: Your session has expired
</div>
```

### Status (Polite)

```html
<div role="status" aria-live="polite" aria-atomic="true">
  Item added to cart
</div>
```

### Live Region Attributes

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `aria-live` | off / polite / assertive | Announcement priority |
| `aria-atomic` | true / false | Announce entire region or just changes |
| `aria-relevant` | additions / removals / text / all | What changes to announce |

### aria-live Values

- **off**: No announcements (default)
- **polite**: Announce when user is idle
- **assertive**: Interrupt immediately (use sparingly)

### Common Roles with Implicit Live

- `role="alert"` = `aria-live="assertive"` + `aria-atomic="true"`
- `role="status"` = `aria-live="polite"` + `aria-atomic="true"`
- `role="log"` = `aria-live="polite"`
- `role="timer"` = `aria-live="off"`

### Best Practices

✅ Create live region in initial page load (must exist in DOM)
✅ Use `role="status"` for success messages, loading states
✅ Use `role="alert"` for errors, warnings, urgent messages
✅ Include visually-hidden text for context
❌ Don't overuse assertive announcements
❌ Don't nest live regions

---

## Pattern 8: Custom Select/Listbox

**Use Case:** Custom styled select with options (alternative to native `<select>`)

### Required Structure

```html
<label id="listbox-label">Choose an option</label>
<button
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-labelledby="listbox-label selected-value"
  aria-controls="listbox-options">
  <span id="selected-value">Select...</span>
</button>

<ul id="listbox-options" role="listbox" aria-labelledby="listbox-label" hidden>
  <li role="option" aria-selected="false">Option 1</li>
  <li role="option" aria-selected="true">Option 2</li>
  <li role="option" aria-selected="false">Option 3</li>
</ul>
```

### Required ARIA Attributes

**Button:**
- `aria-haspopup="listbox"`
- `aria-expanded` (true/false)
- `aria-labelledby` or `aria-label`

**Listbox:**
- `role="listbox"`
- `aria-labelledby`

**Options:**
- `role="option"`
- `aria-selected` (true/false)

### Keyboard Interactions

Similar to combobox but without text input. Use arrows to navigate, Enter/Space to select.

### When to Use Native vs Custom

**Use native `<select>`:**
- Simple dropdown with options
- No complex styling required
- Best performance and accessibility by default

**Use custom listbox:**
- Complex styling requirements
- Need additional features (icons, descriptions)
- Willing to implement full keyboard support and ARIA

---

## Quick Pattern Selection Guide

| Need | Pattern | Key Roles |
|------|---------|-----------|
| Switch between content panels | **Tabs** | tablist, tab, tabpanel |
| Expand/collapse sections | **Accordion** | button, heading, region |
| Show/hide single content | **Disclosure** | button + aria-expanded |
| Require user interaction | **Modal** | dialog + aria-modal |
| Text input with suggestions | **Combobox** | combobox, listbox, option |
| Actions menu | **Menu Button** | button, menu, menuitem |
| Custom dropdown | **Listbox** | listbox, option |
| Announce updates | **Live Region** | alert, status, log |

---

## Testing Checklist

### Keyboard Testing
- [ ] All interactive elements reachable via Tab
- [ ] All functionality available via keyboard
- [ ] Focus order logical and predictable
- [ ] Focus indicators visible
- [ ] Arrow keys work as expected for patterns
- [ ] Escape closes dialogs/menus
- [ ] No keyboard traps

### Screen Reader Testing
- [ ] All elements have accessible names
- [ ] Roles announced correctly
- [ ] States (expanded/collapsed) announced
- [ ] Dynamic changes announced appropriately
- [ ] Instructions clear and available
- [ ] No redundant announcements

### ARIA Validation
- [ ] Required ARIA attributes present
- [ ] ARIA attribute values valid
- [ ] Relationships (controls, labelledby) correct
- [ ] Hidden elements properly excluded
- [ ] No conflicting ARIA

---

## Common ARIA Mistakes to Avoid

### 1. Overusing ARIA
❌ Adding ARIA to native HTML that already works
```html
<!-- Bad -->
<button role="button" aria-label="Close button">Close</button>

<!-- Good -->
<button>Close</button>
```

### 2. Breaking Native Semantics
❌ Changing semantic meaning with ARIA
```html
<!-- Bad -->
<h2 role="button">Click me</h2>

<!-- Good -->
<button>Click me</button>
```

### 3. Duplicating Information
❌ Including role/state in accessible name
```html
<!-- Bad -->
<button role="tab" aria-label="Home tab selected" aria-selected="true">

<!-- Good -->
<button role="tab" aria-selected="true">Home</button>
```

### 4. Missing Keyboard Support
❌ Adding ARIA without implementing keyboard interactions
```html
<!-- Bad -->
<div role="button" aria-pressed="false">Toggle</div>

<!-- Good -->
<button aria-pressed="false">Toggle</button>
<!-- Or implement full keyboard support on div -->
```

### 5. Incorrect ARIA Relationships
❌ References that don't exist or are hidden
```html
<!-- Bad -->
<button aria-controls="panel-1">Tab 1</button>
<!-- No element with id="panel-1" exists -->

<!-- Good -->
<button aria-controls="panel-1">Tab 1</button>
<div id="panel-1">Panel content</div>
```

---

## Resources

### Official Specifications
- [W3C ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA 1.2 Specification](https://www.w3.org/TR/wai-aria-1.2/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)

### Pattern Examples
- [APG Pattern Examples](https://www.w3.org/WAI/ARIA/apg/example-index/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Style Guide](https://a11y-style-guide.com/)

### Testing Tools
- [NVDA Screen Reader](https://www.nvaccess.org/) (Windows, Free)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS/iOS, Built-in)
- [axe DevTools](https://www.deque.com/axe/devtools/) (Browser Extension)
- [WAVE](https://wave.webaim.org/) (Browser Extension)

### Learning Resources
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Deque University](https://dequeuniversity.com/)

---

**Last Updated:** February 2026 | Based on W3C ARIA Authoring Practices Guide
