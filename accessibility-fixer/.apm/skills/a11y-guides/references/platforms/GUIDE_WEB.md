# Web Accessibility Audit Guide
## HTML, React, Vue, Angular, and Web Technologies

---



## ⚠️ CRITICAL: Avoid Redundant Information in Accessible Labels

> 📖 **See comprehensive pattern guide:** [Avoid Redundant Information](patterns/AVOID_ROLE_IN_LABEL.md)

**THE MOST COMMON ACCESSIBILITY MISTAKE:** Adding information to aria-label/alt text that elements already announce automatically.

### Four Types of Redundancy to NEVER Include:

1. **❌ Role Redundancy** - "Submit button", "Home tab", "Search link"
   - Elements announce their role automatically
   - ❌ WRONG: `<button aria-label="Close button">` → Screen reader: "Close button, button"
   - ✅ CORRECT: `<button>Close</button>` → Screen reader: "Close, button"

2. **❌ State Redundancy** - Adding state to aria-label when element announces it
   - Tabs, checkboxes, radio buttons announce state automatically
   - ❌ WRONG: `<button role="tab" aria-selected="true" aria-label="Home selected">` → "Home selected, tab, selected"
   - ✅ CORRECT: `<button role="tab" aria-selected="true">Home</button>` → "Home, tab, selected"
   - ⚠️ EXCEPTION: Custom widgets may need aria-valuetext for value formatting

3. **❌ Position Redundancy** - Adding "tab 1 of 4" or similar to aria-label
   - ARIA tabs announce position automatically with aria-posinset and aria-setsize
   - ❌ WRONG: `<button role="tab" aria-label="Home tab 1 of 4">` → "Home tab 1 of 4, tab, 1 of 4"
   - ✅ CORRECT: Use aria-posinset and aria-setsize attributes, let screen reader announce position

4. **❌ Property/Context Redundancy** - Duplicating visible text or obvious context
   - ❌ WRONG: `<input type="text" aria-label="Email address text field">`
   - ✅ CORRECT: `<label for="email">Email address</label><input type="text" id="email">`
   - ❌ WRONG: `<button aria-label="Close modal">×</button>` when modal context is clear
   - ✅ CORRECT: `<button aria-label="Close">×</button>`

### Quick Rules:
- **Use aria-selected, aria-checked** for state, NOT text in aria-label
- **NEVER add state to aria-label** when element announces it automatically
- **Use aria-posinset/aria-setsize** for position, NOT text in aria-label
- **Don't duplicate visible text** in aria-label
- **Let semantic HTML handle** role announcements (button, link, heading, etc.)
- **Only override with ARIA** when semantic HTML is insufficient

---

## Key Code Patterns to Check

### 1. Semantic HTML

**Issue:** Non-semantic markup for interactive elements

```javascript
// ❌ ISSUE: Non-semantic markup
<div onclick="handleClick()">Click me</div>
<span class="link" onclick="navigate()">Go to page</span>

// ✅ CORRECT: Semantic button
<button onClick={handleClick}>Click me</button>

// ✅ CORRECT: Semantic link
<a href="/page">Go to page</a>
```

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

**Why:** Screen readers need semantic HTML to communicate the role and purpose of elements.

---

### 2. Alternative Text for Images - IMPORTANT: Check Collection Context First

**⚠️ CRITICAL:** Before flagging missing alt text, determine if the element is part of a collection item (card in a grid, list item, carousel slide).

**Decision Tree:**
1. **Is this image part of a collection item (card/tile in a list/grid)?**
   - YES → Skip to Section 11 (Collection Items) - use aria-label on parent link/button, mark children as aria-hidden
   - NO → Continue to step 2

2. **Is this image clearly decorative?** (gradient, background, border, divider, spacer)
   - YES → Skip reporting, don't include in audit (or ensure it has alt="")
   - UNSURE → Create LOW priority issue, note "fix only if not decorative"
   - NO (conveys information) → Continue to step 3

3. **Is this the ONLY content in a button/link?**
   - YES → CRITICAL issue, MUST have alt text or aria-label
   - NO → Apply standard alt text rules below

4. **Is this image standalone (not in a collection)?**
   - YES → Require alt text as shown below

**Issue:** Missing or inappropriate alt text on **standalone** images

```javascript
// ❌ ISSUE: Standalone image missing alt text
<img src="logo.png" />

// ❌ ISSUE: Redundant alt text
<img src="submit.png" alt="Submit button image" />

// ✅ CORRECT: Descriptive alt text (standalone)
<img src="logo.png" alt="Company name logo" />

// ✅ CORRECT: Decorative image
<img src="decorative.png" alt="" role="presentation" />
<img src="decorative.png" alt="" aria-hidden="true" />

// ✅ CORRECT: Complex image with longer description
<img
  src="chart.png"
  alt="Sales chart"
  aria-describedby="chart-description"
/>
<div id="chart-description">
  Sales increased by 25% in Q2, with the highest growth in June.
</div>
```

**❌ DO NOT flag for missing alt text:**
- Images inside collection items (cards, list items, grid cells)
- Sub-elements of components that will use comprehensive aria-label
- Elements that are part of a larger interactive unit

**✅ DO flag for missing alt text:**
- Images that are the ONLY content in buttons/links (CRITICAL priority)
- Standalone interactive icons not part of collections
- Hero images conveying information
- Logo images with brand identity importance
- Content images in articles
- Icons in navigation bars
- Informational graphics, charts, diagrams

**🎨 Clearly Decorative - DON'T Report:**
- CSS background images
- Gradient overlays
- Decorative borders or dividers
- Pattern backgrounds
- Spacer/separator images
- Shadow/glow effects
- **Note:** These should have `alt=""` or `role="presentation"`, but don't report if already present

**❓ Unsure if Decorative - LOW Priority:**
- Images that might convey branding but information is elsewhere
- Decorative icons when text label is present
- Background images that might convey mood/context
- **Recommendation text:** "Verify if this image is decorative. If so, use `alt=\"\"` and `aria-hidden=\"true\"`. If it conveys information, add descriptive alt text."

**WCAG SC:** 1.1.1 Non-text Content (Level A), 4.1.2 Name, Role, Value (Level A)

**React Example:**
```jsx
// ❌ ISSUE
<Image src="/logo.png" />

// ✅ CORRECT
<Image src="/logo.png" alt="Company name logo" />

// ✅ CORRECT: Decorative in React
<Image src="/decorative.png" alt="" aria-hidden="true" />
```

---

### 3. Form Labels and Instructions

**Issue:** Inputs without proper labels

```html
<!-- ❌ ISSUE: Placeholder used as only label -->
<input type="text" placeholder="Enter name" />

<!-- ❌ ISSUE: Label not associated -->
<label>Email</label>
<input type="email" />

<!-- ✅ CORRECT: Properly labeled with htmlFor/id -->
<label htmlFor="name">Name</label>
<input type="text" id="name" />

<!-- ✅ CORRECT: Implicit label association -->
<label>
  Email
  <input type="email" />
</label>

<!-- ✅ CORRECT: Using aria-label when visual label isn't possible -->
<input
  type="search"
  aria-label="Search products"
  placeholder="Search..."
/>

<!-- ✅ CORRECT: Required field with clear indication -->
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>
<input
  type="email"
  id="email"
  required
  aria-required="true"
/>
```

**WCAG SC:** 3.3.2 Labels or Instructions (Level A), 1.3.1 Info and Relationships (Level A)

**React Example:**
```jsx
// ❌ ISSUE
<input placeholder="Enter email" value={email} onChange={handleChange} />

// ✅ CORRECT
<>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    value={email}
    onChange={handleChange}
  />
</>
```

---

### 4. Keyboard Navigation and Focus Management

**Issue:** Interactive elements not keyboard accessible

```javascript
// ❌ ISSUE: Clickable div without keyboard support
<div onClick={handleClick}>Custom button</div>

// ✅ CORRECT: Keyboard accessible custom button
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Custom button
</div>

// ✅ BETTER: Use semantic button
<button onClick={handleClick}>Custom button</button>
```

**WCAG SC:** 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)

**Modal Focus Management:**
```javascript
// ✅ CORRECT: Trap focus in modal and restore on close
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  const previousFocus = useRef();

  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousFocus.current = document.activeElement;

      // Focus first focusable element in modal
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();

      // Trap focus within modal
      const handleTab = (e) => {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    } else {
      // Restore focus when modal closes
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  return isOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      {children}
    </div>
  ) : null;
}
```

**WCAG SC:** 2.4.3 Focus Order (Level A), 2.1.2 No Keyboard Trap (Level A)

---

### 5. Focus Visible Indicators

**Issue:** Missing or insufficient focus indicators

```css
/* ❌ ISSUE: Focus outline removed without replacement */
button:focus {
  outline: none;
}

/* ✅ CORRECT: Custom focus indicator */
button:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* ✅ CORRECT: Maintaining default with enhancement */
button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Modern approach using :focus-visible */
a:focus-visible {
  outline: 2px solid #005fcc;
  border-radius: 3px;
}
```

**WCAG SC:** 2.4.7 Focus Visible (Level AA)

---

### 6. Color Contrast

**Issue:** Insufficient color contrast

```css
/* ❌ ISSUE: Insufficient contrast (2.5:1) */
.text {
  color: #999999;
  background: #ffffff;
}

/* ✅ CORRECT: Minimum 4.5:1 for normal text */
.text {
  color: #767676; /* 4.54:1 ratio */
  background: #ffffff;
}

/* ✅ CORRECT: 3:1 minimum for large text (18pt+) */
.heading {
  color: #949494; /* 3.03:1 ratio */
  background: #ffffff;
  font-size: 24px;
  font-weight: bold;
}

/* ✅ CORRECT: Using CSS variables for consistent contrast */
:root {
  --text-primary: #212121;   /* 16:1 on white */
  --text-secondary: #666666; /* 5.74:1 on white */
  --bg-primary: #ffffff;
}
```

**WCAG SC:** 1.4.3 Contrast (Minimum) (Level AA), 1.4.11 Non-text Contrast (Level AA)

**Requirements:**
- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- UI components and icons: 3:1 minimum

---

### 7. Dynamic Content and ARIA Live Regions

**Issue:** Screen readers not notified of updates

```javascript
// ❌ ISSUE: Content update without announcement
function StatusMessage({ message }) {
  return <div>{message}</div>;
}

// ✅ CORRECT: ARIA live region for polite announcements
function StatusMessage({ message }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}

// ✅ CORRECT: Assertive for urgent messages
function ErrorMessage({ error }) {
  return (
    <div role="alert" aria-live="assertive" aria-atomic="true">
      {error}
    </div>
  );
}

// ✅ CORRECT: Loading state
function LoadingSpinner({ isLoading }) {
  return isLoading ? (
    <div role="status" aria-live="polite">
      <span className="visually-hidden">Loading, please wait...</span>
      <Spinner aria-hidden="true" />
    </div>
  ) : null;
}
```

**WCAG SC:** 4.1.3 Status Messages (Level AA)

**CSS for visually-hidden content:**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

### 8. ARIA Roles and Landmarks

**Issue:** Poor semantic structure or missing landmarks

```html
<!-- ❌ ISSUE: No semantic structure -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">...</div>
<div class="footer">...</div>

<!-- ✅ CORRECT: Semantic HTML5 -->
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <h1>Page Title</h1>
  ...
</main>
<footer>...</footer>

<!-- ✅ CORRECT: Multiple navigation with labels -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb" aria-label="Breadcrumb">...</nav>
<nav aria-label="Footer navigation">...</nav>

<!-- ✅ CORRECT: Regions with labels -->
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Related Articles</h2>
  ...
</section>
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.1 Bypass Blocks (Level A)

---

### 9. Headings Hierarchy

**Issue:** Improper heading structure

```html
<!-- ❌ ISSUE: Skipped heading levels -->
<h1>Main Title</h1>
<h3>Section Title</h3> <!-- Skipped h2 -->

<!-- ❌ ISSUE: Visual styling used instead of headings -->
<div class="big-text">Section Title</div>

<!-- ✅ CORRECT: Proper hierarchy -->
<h1>Page Title</h1>
<h2>Section 1</h2>
<h3>Subsection 1.1</h3>
<h3>Subsection 1.2</h3>
<h2>Section 2</h2>

<!-- ✅ CORRECT: Style headings with CSS, not by changing level -->
<h2 class="h3-style">Section Title</h2> <!-- Semantically h2, visually h3 -->
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.6 Headings and Labels (Level AA)

---

### 10. Skip Links

**Issue:** Missing skip navigation links

```html
<!-- ✅ CORRECT: Skip link at top of page -->
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  <header>
    <nav>...</nav>
  </header>
  <main id="main-content" tabindex="-1">
    ...
  </main>
</body>
```

```css
/* Skip link visible only when focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**WCAG SC:** 2.4.1 Bypass Blocks (Level A)

---

### 11. Collection/Grid Items

**Issue:** Collection items with multiple sub-elements require multiple tab stops to navigate

**⚠️ CRITICAL:** Items in grids, carousels, or lists should be treated as **a whole unit**. Users should NOT have to tab through multiple sub-elements to understand a single item.

**Example:** TV show card, movie card, product card - all information should be accessible in one interaction.

**🚫 IMPORTANT - Avoid Contradictory Guidance:**
When auditing collection items, **DO NOT** flag child elements (images, text, links within the card) for missing individual `alt` text or `aria-label`. Instead:
1. ✅ Flag the entire collection item for lacking comprehensive accessible name
2. ✅ Recommend setting `aria-label` on the parent `<a>` or `<button>`
3. ✅ Recommend marking ALL child elements with `alt=""` and `aria-hidden="true"`
4. ❌ Do NOT separately flag child elements for missing alt/aria-label

**Why:** If you recommend using aria-label on the parent (which you should), individual child alt texts become useless and create contradictory guidance.

```javascript
// ❌ ISSUE: User must tab through 5+ elements per card
// Tab stops: Image → Title link → Season text → Episode text → Channel → Progress
function ShowCard({ show }) {
  return (
    <div className="show-card">
      <img src={show.posterUrl} alt={show.title} />
      <a href={`/shows/${show.id}`}>{show.title}</a>
      <p>Season {show.season}</p>
      <p>Episode {show.episode}</p>
      <img src={show.channelLogo} alt={show.channelName} />
      <progress value={show.watchProgress} max="1" />
    </div>
  );
}

// ✅ CORRECT: Single tab stop with complete information
function ShowCard({ show }) {
  const watchedPercent = Math.round(show.watchProgress * 100);

  return (
    <a
      href={`/shows/${show.id}`}
      className="show-card"
      aria-label={`${show.title}, ${show.episodeName}, Season ${show.season}, Episode ${show.episode}, on ${show.channelName}, ${watchedPercent} percent watched`}
    >
      <img src={show.posterUrl} alt="" aria-hidden="true" />
      <div aria-hidden="true">
        <h3>{show.title}</h3>
        <p>S{show.season} E{show.episode}</p>
        <img src={show.channelLogo} alt="" />
        <progress value={show.watchProgress} max="1">
          {watchedPercent}% watched
        </progress>
      </div>
    </a>
  );
}

// ✅ CORRECT: Alternative with button and comprehensive visible text
function ShowCard({ show, onClick }) {
  const watchedPercent = Math.round(show.watchProgress * 100);

  return (
    <article className="show-card">
      <button
        onClick={onClick}
        aria-label={`${show.title}, ${show.episodeName}, Season ${show.season}, Episode ${show.episode}, on ${show.channelName}, ${watchedPercent} percent watched. Press to open.`}
      >
        <img src={show.posterUrl} alt="" />
        <div className="show-info">
          <h3>{show.title}</h3>
          <span className="visually-hidden">{show.episodeName}, </span>
          <p>Season {show.season}, Episode {show.episode}</p>
          <span className="visually-hidden">on </span>
          <img src={show.channelLogo} alt={show.channelName} />
          <div className="progress-container">
            <span className="visually-hidden">{watchedPercent} percent watched</span>
            <progress value={show.watchProgress} max="1" aria-hidden="true">
              {watchedPercent}%
            </progress>
          </div>
        </div>
      </button>
    </article>
  );
}

// ✅ CORRECT: Using proper ARIA with list structure
function ShowGrid({ shows }) {
  return (
    <ul role="list" className="show-grid">
      {shows.map((show) => (
        <li key={show.id}>
          <a
            href={`/shows/${show.id}`}
            aria-label={getShowAccessibilityLabel(show)}
          >
            <img src={show.posterUrl} alt="" aria-hidden="true" />
            <div aria-hidden="true">
              <h3>{show.title}</h3>
              <p>S{show.season} E{show.episode}</p>
              <p>{show.channelName}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

function getShowAccessibilityLabel(show) {
  const watchedPercent = Math.round(show.watchProgress * 100);
  return `${show.title}, ${show.episodeName}, Season ${show.season}, Episode ${show.episode}, on ${show.channelName}, ${watchedPercent} percent watched`;
}
```

**Action Buttons on Collection Items:**

If items have action buttons (delete, favorite, share), keep them focusable but ensure they provide context:

```javascript
// ✅ CORRECT: Actions with context
function ShowCard({ show, onDelete, onFavorite }) {
  return (
    <article className="show-card">
      <a href={`/shows/${show.id}`} aria-label={getShowLabel(show)}>
        <img src={show.posterUrl} alt="" />
        <h3>{show.title}</h3>
        <p>S{show.season} E{show.episode}</p>
      </a>
      <div className="card-actions">
        <button
          onClick={onFavorite}
          aria-label={`Add ${show.title} to favorites`}
        >
          <HeartIcon aria-hidden="true" />
        </button>
        <button
          onClick={onDelete}
          aria-label={`Remove ${show.title} from watchlist`}
        >
          <TrashIcon aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

// ✅ CORRECT: Alternative with action menu
function ShowCard({ show }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="show-card">
      <a href={`/shows/${show.id}`} aria-label={getShowLabel(show)}>
        {/* Card content */}
      </a>
      <button
        aria-label={`Actions for ${show.title}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <MoreIcon aria-hidden="true" />
      </button>
      {menuOpen && (
        <ul role="menu">
          <li role="none">
            <button role="menuitem" onClick={onFavorite}>
              Add to favorites
            </button>
          </li>
          <li role="none">
            <button role="menuitem" onClick={onRemove}>
              Remove from watchlist
            </button>
          </li>
        </ul>
      )}
    </article>
  );
}
```

**Key Considerations for Web Collections:**
- Use semantic HTML: `<a>` for navigation, `<button>` for actions
- Provide comprehensive `aria-label` on the interactive container
- Mark decorative child images with `alt=""` and `aria-hidden="true"`
- Use `visually-hidden` class to include information for screen readers only
- Ensure keyboard navigation flows logically through the collection
- Consider using `<article>` for semantic structure
- Action buttons should include item context in their label

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.4 Link Purpose (In Context) (Level A), 2.1.1 Keyboard (Level A)

**Key Points:**
- **One tab stop = one complete item** (or item + actions)
- Include ALL relevant information in aria-label or visible text
- Mark decorative elements with `aria-hidden="true"`
- Action buttons must include item context ("Add [Title] to favorites")
- Test with keyboard navigation and screen readers

---

## 12. Common ARIA Patterns (W3C APG)

This section covers the most common interactive ARIA patterns based on the W3C ARIA Authoring Practices Guide (APG). Each pattern includes required roles, attributes, keyboard interactions, and implementation examples.

### 12. Complex ARIA Patterns

> 📖 **See specialized guide:** [WEB_ARIA_PATTERNS.md](WEB_ARIA_PATTERNS.md)

**Issue:** Complex interactive components (tabs, accordions, modals, combobox, menus) missing proper ARIA implementation

**⚠️ When needed:** Only for web apps using these specific patterns. Most basic sites don't need this.

**Patterns covered in specialized guide:**
- 12.1 Tabs Pattern - Tab panels with keyboard navigation
- 12.2 Accordion Pattern - Collapsible sections
- 12.3 Modal Dialog Pattern - Focus trap and ESC handling
- 12.4 Combobox / Autocomplete - Custom select dropdowns
- 12.5 Menu Button Pattern - Action menus (not navigation)
- 12.6 Disclosure Pattern - Show/hide content

**Quick Check:** Does the app have any of these?
- ✅ Tabs with tab panels
- ✅ Accordion/collapsible sections
- ✅ Modal dialogs/popups
- ✅ Custom dropdowns/autocomplete
- ✅ Action menus (kebab menu, etc.)

**If YES:** See [WEB_ARIA_PATTERNS.md](WEB_ARIA_PATTERNS.md) for full implementation requirements.

**If NO:** Skip this section, continue with common issues below.

**WCAG SC:** 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A)

---

### Component Files
- `**/*.jsx`, `**/*.tsx` (React)
- `**/*.vue` (Vue)
- `**/*.component.ts`, `**/*.component.html` (Angular)
- `**/*.svelte` (Svelte)
- `**/*.html` (HTML templates)

### Style Files
- `**/*.css`, `**/*.scss`, `**/*.less`
- `**/*.styled.js`, `**/*.styles.ts` (CSS-in-JS)
- `**/*.module.css` (CSS Modules)

### Configuration & Routing
- Router configuration files
- Page/layout components
- Navigation components

### Interactive Components
- Modal/Dialog components
- Dropdown/Select components
- Tab components
- Carousel/Slider components
- Form components
- Tooltip/Popover components

---

## Testing Tools

### Automated Testing
- **axe DevTools** - Browser extension for automated scanning
- **WAVE** - Browser extension with visual feedback
- **Lighthouse** - Built into Chrome DevTools
- **Pa11y** - Command-line tool for CI/CD
- **axe-core** - JavaScript library for automated testing
- **jest-axe** - Jest matcher for accessibility testing

### Screen Readers
- **NVDA** - Free, Windows
- **JAWS** - Commercial, Windows
- **VoiceOver** - Built-in, macOS/iOS
- **ChromeVox** - Chrome extension
- **Orca** - Linux

### Contrast Checkers
- **WebAIM Contrast Checker** - Online tool
- **TPGI Colour Contrast Analyser** - Desktop app
- **Chrome DevTools** - Built-in contrast checker

### Manual Testing
- **Keyboard-only navigation** - Unplug mouse, use Tab, Enter, Space, Arrow keys
- **Zoom to 200%** - Test text scaling
- **Browser extensions** - Landmark navigation, heading structure

---

## Common Web-Specific Issues

### 1. Single Page Applications (SPAs)

**Issues:**
- Focus not managed on route changes
- Page title not updated on route changes
- Screen reader not notified of content changes

**Solutions:**
```javascript
// ✅ Announce route changes
useEffect(() => {
  // Update document title
  document.title = `${pageTitle} - Site Name`;

  // Announce page change to screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = `Navigated to ${pageTitle}`;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);

  // Focus management
  const mainHeading = document.querySelector('h1');
  if (mainHeading) {
    mainHeading.setAttribute('tabindex', '-1');
    mainHeading.focus();
  }
}, [location]);
```

### 2. Custom Dropdown/Select

```javascript
// ✅ CORRECT: Accessible custom select
function CustomSelect({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  return (
    <div className="custom-select">
      <label id="select-label">{label}</label>
      <button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="select-label"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || 'Select an option'}
      </button>
      {isOpen && (
        <ul role="listbox" aria-labelledby="select-label">
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 3. Infinite Scroll / Lazy Loading

```javascript
// ✅ CORRECT: Announce new content loading
function InfiniteScroll({ items }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <div role="feed" aria-busy={isLoading}>
        {items.map((item, index) => (
          <article key={item.id} aria-posinset={index + 1} aria-setsize={items.length}>
            {item.content}
          </article>
        ))}
      </div>
      {isLoading && (
        <div role="status" aria-live="polite">
          Loading more items...
        </div>
      )}
    </>
  );
}
```

---



