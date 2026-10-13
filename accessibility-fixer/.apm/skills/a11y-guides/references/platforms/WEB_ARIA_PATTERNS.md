# Web ARIA Patterns - Complex Components

> **Note:** This is an advanced guide for complex ARIA patterns. For general web accessibility, see [GUIDE_WEB.md](GUIDE_WEB.md).

---

## When to Use This Guide

Use this guide when auditing web apps with these specific interactive components:
- ✅ Tabs / Tab panels
- ✅ Accordions / Disclosure widgets
- ✅ Modal dialogs
- ✅ Combobox / Autocomplete
- ✅ Menu buttons / Dropdowns
- ❌ Basic forms, navigation, content (use main guide)

**Focus:** Complex ARIA patterns requiring specific keyboard interactions and state management.

---

### 12.1 Tabs Pattern

**Issue:** Improperly implemented tabs missing required ARIA attributes

The tabs pattern presents layered sections of content (tab panels), displaying one panel at a time. Each tab panel connects to an associated tab element that activates its display.

**Required ARIA Roles & Attributes:**

```javascript
// ❌ ISSUE: Missing ARIA roles and attributes
<div className="tabs">
  <div className="tab-buttons">
    <button onClick={() => setTab(0)}>Tab 1</button>
    <button onClick={() => setTab(1)}>Tab 2</button>
  </div>
  <div>{activeTab === 0 && <div>Panel 1</div>}</div>
  <div>{activeTab === 1 && <div>Panel 2</div>}</div>
</div>

// ✅ CORRECT: Complete tabs implementation
function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  const tablistRef = useRef();

  const handleKeyDown = (e, index) => {
    const tabCount = tabs.length;
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (index + 1) % tabCount; // Wrap to first
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (index - 1 + tabCount) % tabCount; // Wrap to last
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabCount - 1;
        break;
      default:
        return;
    }

    setActiveTab(newIndex);
    // Focus the newly activated tab
    const newTab = tablistRef.current.children[newIndex];
    newTab?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Content sections"
        ref={tablistRef}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            id={`tab-${index}`}
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

**Keyboard Interactions:**
- **Tab**: Moves focus into tablist (activates current tab), then exits to next page element
- **Arrow Right/Down**: Moves focus to next tab (wraps to first)
- **Arrow Left/Up**: Moves focus to previous tab (wraps to last)
- **Home**: Moves focus to first tab
- **End**: Moves focus to last tab

**Key Requirements:**
- Only the active tab should have `tabIndex={0}`
- Inactive tabs should have `tabIndex={-1}`
- Arrow keys should navigate between tabs and wrap around
- Each tab must have unique `id` and `aria-controls` pointing to its panel
- Each panel must have `aria-labelledby` pointing to its tab

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A)

---

### 12.2 Accordion Pattern

**Issue:** Accordion missing proper ARIA structure and keyboard support

An accordion is a vertically stacked set of interactive headings that each contain content sections.

**Required ARIA Roles & Attributes:**

```javascript
// ❌ ISSUE: Missing proper ARIA structure
<div className="accordion">
  <div onClick={() => toggle(0)}>Section 1</div>
  {isOpen[0] && <div>Content 1</div>}
</div>

// ✅ CORRECT: Proper accordion implementation
function Accordion({ items }) {
  const [expandedItems, setExpandedItems] = useState([0]); // First item expanded

  const toggleItem = (index) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextButton = document.getElementById(`accordion-header-${index + 1}`);
        nextButton?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevButton = document.getElementById(`accordion-header-${index - 1}`);
        prevButton?.focus();
        break;
      case 'Home':
        e.preventDefault();
        document.getElementById('accordion-header-0')?.focus();
        break;
      case 'End':
        e.preventDefault();
        document.getElementById(`accordion-header-${items.length - 1}`)?.focus();
        break;
    }
  };

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isExpanded = expandedItems.includes(index);
        const headerId = `accordion-header-${index}`;
        const panelId = `accordion-panel-${index}`;

        return (
          <div key={index}>
            <h3>
              <button
                id={headerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleItem(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {item.title}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isExpanded}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Keyboard Interactions:**
- **Enter/Space**: Toggle panel visibility
- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous focusable element
- **Arrow Down** (optional): Move focus to next accordion header
- **Arrow Up** (optional): Move focus to previous accordion header
- **Home** (optional): Move focus to first header
- **End** (optional): Move focus to last header

**Key Requirements:**
- Button must be wrapped in a heading element (h2-h6) with appropriate level
- Use `aria-expanded` to indicate panel state (not in label text)
- Use `aria-controls` to reference the panel ID
- Panel should use `role="region"` and `aria-labelledby`
- Avoid `region` role if accordion has 6+ simultaneously expandable panels

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A)

---

### 12.3 Modal Dialog Pattern (Enhanced)

**Issue:** Modal missing focus trap, proper ARIA attributes, or return focus

The guide already includes a basic modal example (lines 284-339), but here are the critical W3C APG requirements:

**Required ARIA Roles & Attributes:**

```javascript
// ✅ CORRECT: W3C APG compliant modal
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef();
  const previousFocus = useRef();

  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousFocus.current = document.activeElement;

      // Focus the modal container or first focusable element
      setTimeout(() => {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 10);

      // Trap focus within modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab') {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      // Restore focus when modal closes
      previousFocus.current?.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
}
```

**Critical Requirements:**
- Must have `role="dialog"` and `aria-modal="true"`
- Must have accessible name via `aria-labelledby` or `aria-label`
- Must trap focus (Tab/Shift+Tab wrap within dialog)
- Must handle Escape key to close
- Must return focus to invoking element when closed
- Must include a visible close button

**WCAG SC:** 2.1.2 No Keyboard Trap (Level A), 4.1.2 Name, Role, Value (Level A), 2.4.3 Focus Order (Level A)

---

### 12.4 Combobox / Autocomplete Pattern

**Issue:** Custom select or autocomplete missing required ARIA attributes

A combobox is an input widget with an associated popup that enables users to select values from a collection.

**Required ARIA Roles & Attributes:**

```javascript
// ✅ CORRECT: Accessible combobox with autocomplete
function Combobox({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const comboboxRef = useRef();
  const listboxRef = useRef();

  useEffect(() => {
    const filtered = options.filter((opt) =>
      opt.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [inputValue, options]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      case 'Home':
        e.preventDefault();
        if (isOpen) setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        if (isOpen) setActiveIndex(filteredOptions.length - 1);
        break;
    }
  };

  const selectOption = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div className="combobox-container">
      <label id="combobox-label" htmlFor="combobox-input">
        {label}
      </label>
      <input
        id="combobox-input"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="listbox"
        aria-activedescendant={
          activeIndex >= 0 ? `option-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        aria-labelledby="combobox-label"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        ref={comboboxRef}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          id="listbox"
          role="listbox"
          aria-labelledby="combobox-label"
          ref={listboxRef}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              id={`option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onClick={() => selectOption(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Keyboard Interactions:**
- **Down Arrow**: Opens popup, moves to next option
- **Up Arrow**: Moves to previous option
- **Enter**: Accepts selected option and closes popup
- **Escape**: Closes popup, optionally clears input
- **Home/End**: Move to first/last option
- **Alt + Down Arrow**: Opens popup without moving focus (optional)

**Key Requirements:**
- Input must have `role="combobox"`
- Must include `aria-expanded`, `aria-controls`, and `aria-autocomplete`
- Use `aria-activedescendant` to maintain focus on combobox while indicating active option
- Popup must have `role="listbox"` (or grid/tree/dialog)
- Options must have `role="option"` and `aria-selected`
- DOM focus stays on input, not the popup

**WCAG SC:** 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A), 1.3.1 Info and Relationships (Level A)

---

### 12.5 Menu Button Pattern

**Issue:** Action menu or dropdown menu missing proper ARIA attributes

A menu button opens a menu of commands or actions (not navigation links).

**Required ARIA Roles & Attributes:**

```javascript
// ✅ CORRECT: Menu button with actions
function MenuButton({ label, actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRef = useRef();
  const menuRef = useRef();

  const handleButtonKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(actions.length - 1);
        break;
    }
  };

  const handleMenuKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % actions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + actions.length) % actions.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(actions.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        actions[focusedIndex].onClick();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="menuitem"]');
      items[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  return (
    <div className="menu-button-container">
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="action-menu"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
      >
        {label}
      </button>
      {isOpen && (
        <ul
          id="action-menu"
          role="menu"
          ref={menuRef}
          onKeyDown={handleMenuKeyDown}
        >
          {actions.map((action, index) => (
            <li key={index} role="none">
              <button
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Usage example
<MenuButton
  label="Actions"
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
    { label: 'Share', onClick: handleShare },
  ]}
/>
```

**Keyboard Interactions:**
- **Enter/Space** (on button): Opens menu, focuses first item
- **Arrow Down** (on button): Opens menu, focuses first item
- **Arrow Up** (on button): Opens menu, focuses last item
- **Arrow Down/Up** (in menu): Navigate between items
- **Home/End** (in menu): Move to first/last item
- **Enter** (in menu): Activate menu item
- **Escape** (in menu): Close menu, return focus to button

**Key Requirements:**
- Button must have `aria-haspopup="menu"` and `aria-expanded`
- Menu must have `role="menu"`
- Menu items must have `role="menuitem"` and `tabIndex={-1}`
- Only use for action menus (commands), not navigation links
- Focus must return to button when menu closes

**WCAG SC:** 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A), 2.4.3 Focus Order (Level A)

---

### 12.6 Disclosure (Show/Hide) Pattern

**Issue:** Expandable content missing aria-expanded state

A disclosure widget manages visibility of content through a button control.

**Required ARIA Attributes:**

```javascript
// ❌ ISSUE: Missing aria-expanded
<div>
  <button onClick={() => setIsOpen(!isOpen)}>
    Show details
  </button>
  {isOpen && <div>Details content</div>}
</div>

// ✅ CORRECT: Proper disclosure pattern
function Disclosure({ summary, children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
        {summary}
      </button>
      <div id={contentId} hidden={!isExpanded}>
        {children}
      </div>
    </div>
  );
}

// ✅ CORRECT: Alternative using HTML details/summary
function NativeDisclosure({ summary, children }) {
  return (
    <details>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
```

**Keyboard Interactions:**
- **Enter/Space**: Toggle content visibility

**Key Requirements:**
- Button must have `aria-expanded` attribute
- Optionally use `aria-controls` to reference content element
- Visual indicator (arrow/chevron) should be marked `aria-hidden="true"`
- Consider using native `<details>` and `<summary>` elements when appropriate

**When to Use:**
- FAQ sections
- Expandable descriptions
- "Show more" / "Read more" links
- Collapsible card content

**WCAG SC:** 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A)

---

## 13. ARIA Pattern Quick Reference

| Pattern | Key Roles | Key Attributes | Keyboard |
|---------|-----------|----------------|----------|
| **Tabs** | `tablist`, `tab`, `tabpanel` | `aria-selected`, `aria-controls`, `aria-labelledby` | Arrow keys, Home, End |
| **Accordion** | `button`, `heading`, `region` | `aria-expanded`, `aria-controls`, `aria-labelledby` | Enter/Space, optional arrows |
| **Modal Dialog** | `dialog` | `aria-modal`, `aria-labelledby` | Tab (trapped), Escape |
| **Combobox** | `combobox`, `listbox`, `option` | `aria-expanded`, `aria-activedescendant`, `aria-autocomplete` | Arrows, Enter, Escape |
| **Menu Button** | `button`, `menu`, `menuitem` | `aria-haspopup`, `aria-expanded` | Arrows, Enter, Escape |
| **Disclosure** | `button` | `aria-expanded`, `aria-controls` | Enter/Space |

---

## 14. Additional W3C APG Resources

For more patterns and detailed examples, refer to:
- **W3C ARIA Authoring Practices Guide:** https://www.w3.org/WAI/ARIA/apg/
- **Pattern Examples Index:** https://www.w3.org/WAI/ARIA/apg/example-index/
- **All Patterns:** https://www.w3.org/WAI/ARIA/apg/patterns/

Other common patterns not covered in detail above:
- **Alert/Alert Dialog**: For urgent messages requiring immediate attention
- **Breadcrumb**: Navigation showing current page location
- **Carousel**: Rotating content with prev/next controls
- **Grid/Data Grid**: Interactive tables with keyboard navigation
- **Radio Group**: Set of mutually exclusive options
- **Slider**: Input for selecting value from range
- **Spinbutton**: Input with increment/decrement buttons
- **Switch**: Binary on/off control
- **Toolbar**: Container for grouped controls
- **Tooltip**: Popup description on hover/focus
- **Tree View**: Hierarchical list structure

---

## Files to Analyze

When auditing a web project, review these files:


---

**Related Guides:**
- [GUIDE_WEB.md](GUIDE_WEB.md) - Core web accessibility patterns
- [GUIDE_WCAG_REFERENCE.md](../GUIDE_WCAG_REFERENCE.md) - WCAG principles
