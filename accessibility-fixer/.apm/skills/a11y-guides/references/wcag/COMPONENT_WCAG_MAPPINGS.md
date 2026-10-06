# Component-to-WCAG Success Criteria Mappings
## Quick lookup: Which WCAG SC applies to each component type

This guide helps auditors quickly identify which WCAG 2.2 success criteria to check for each type of UI component.

---

## How to Use This Guide

1. **Identify the component type** in the code you're auditing
2. **Find the component** in this guide
3. **Check all listed WCAG SC** for that component
4. **Reference platform-specific implementation** in the linked guides

---

## Images and Icons

### Static Images (Informational)
**Common violations:** Missing alt text, incorrect descriptions

**WCAG SC to check:**
- **1.1.1 (A) - Non-text Content:** Must have text alternative
- **1.4.5 (AA) - Images of Text:** Avoid text in images unless essential
- **4.1.2 (A) - Name, Role, Value:** Accessible name provided

**Platform-specific:**
- Android: `contentDescription` on ImageView
- iOS: `accessibilityLabel` on UIImageView
- Web: `alt` attribute on `<img>`
- React Native: `accessibilityLabel` on `<Image>`
- Flutter: `Semantics(label: ...)` wrapping Image

**Decision tree:** See [Decorative Image Decision Tree](../patterns/DECORATIVE_IMAGE_DECISION_TREE.md)

---

### Decorative Images
**Should be hidden from assistive technology**

**WCAG SC to check:**
- **1.1.1 (A) - Non-text Content:** Decorative images should be marked as such

**Platform-specific:**
- Android: `importantForAccessibility="no"`
- iOS: `isAccessibilityElement = false`
- Web: `alt=""` (empty alt) or `role="presentation"`
- React Native: `accessible={false}`
- Flutter: `ExcludeSemantics` or `Semantics(container: true, label: "")`

---

### Icon Buttons
**Images that serve as interactive controls**

**WCAG SC to check:**
- **1.1.1 (A) - Non-text Content:** Icon needs text alternative
- **2.4.4 (A) - Link Purpose:** Purpose must be clear
- **2.5.8 (AA) - Target Size:** Minimum 24x24 pixels
- **4.1.2 (A) - Name, Role, Value:** Must have accessible name, button role, state

**Platform-specific:**
- Android: `contentDescription` on ImageButton
- iOS: `accessibilityLabel` on UIButton with image
- Web: `aria-label` or visible text on button
- React Native: `accessibilityLabel` on TouchableOpacity with Image
- Flutter: `Tooltip` or `Semantics(label: ...)` on IconButton

**Do NOT include "button" in label:** See [Avoid Role in Label](../patterns/AVOID_ROLE_IN_LABEL.md)

---

### Icons in Collection Items
**Icons that appear in list or grid items**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Should be grouped with item content
- **4.1.2 (A) - Name, Role, Value:** Icon info should be part of merged item label

**Special handling:** See [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)
- Icons should be marked as not important for accessibility
- Icon meaning merged into parent item's accessible label

---

## Buttons and Links

### Standard Buttons
**Primary interactive elements**

**WCAG SC to check:**
- **2.1.1 (A) - Keyboard:** Must be keyboard accessible
- **2.4.4 (A) - Link Purpose:** Purpose clear from label
- **2.4.7 (AA) - Focus Visible:** Focus indicator visible
- **2.5.8 (AA) - Target Size:** Minimum 24x24 pixels
- **3.2.1 (A) - On Focus:** Focusing doesn't cause unexpected change
- **4.1.2 (A) - Name, Role, Value:** Label, role=button, disabled state if applicable

**Common violations:**
- Generic labels like "Submit" without context
- Disabled state not communicated
- Too small touch target
- Including "button" in label (see AVOID_ROLE_IN_LABEL.md)

---

### Text Links
**Clickable text within content**

**WCAG SC to check:**
- **1.4.1 (A) - Use of Color:** Don't rely on color alone to indicate links
- **2.1.1 (A) - Keyboard:** Must be keyboard accessible
- **2.4.4 (A) - Link Purpose:** Purpose clear from link text (or context)
- **2.4.9 (AAA) - Link Purpose (Link Only):** Purpose from text alone (if targeting AAA)
- **2.5.8 (AA) - Target Size:** Adequate tap target
- **4.1.2 (A) - Name, Role, Value:** Descriptive text, role=link

**Common violations:**
- "Click here" or "Read more" without context
- Links only distinguished by color
- Small inline links in long text

**Context pattern:** See [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md)

---

### Icon-Only Buttons (FABs, Toolbar Icons)
**Buttons with no visible text**

**WCAG SC to check:**
- **1.1.1 (A) - Non-text Content:** Icon needs text alternative
- **2.4.4 (A) - Link Purpose:** Action must be clear from accessible name
- **2.5.8 (AA) - Target Size:** Minimum 24x24 pixels (48x48 recommended)
- **4.1.2 (A) - Name, Role, Value:** Descriptive label required

**Examples:** Add, Share, Search, Menu, More options
**Do NOT include "button" in label**

---

### Buttons in Collection Items
**Buttons within list or grid items**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** May need special grouping
- **2.1.1 (A) - Keyboard:** Must be accessible
- **4.1.2 (A) - Name, Role, Value:** Context needed

**Pattern:** See [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)
- If button is secondary action, may need separate focus
- Primary action should merge with item
- Context from item content may be needed

---

## Form Controls

### Text Inputs
**Single-line and multi-line text fields**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Label associated with input
- **1.3.5 (AA) - Identify Input Purpose:** Appropriate input type/autofill
- **1.4.3 (AA) - Contrast:** Text has sufficient contrast
- **2.1.1 (A) - Keyboard:** Keyboard accessible
- **2.4.11 (AA) - Focus Not Obscured:** Software keyboard doesn't hide input
- **3.2.1 (A) - On Focus:** Focus doesn't auto-submit
- **3.2.2 (A) - On Input:** Entering text doesn't cause unexpected change
- **3.3.1 (A) - Error Identification:** Errors clearly identified
- **3.3.2 (A) - Labels or Instructions:** Label always visible (not just placeholder)
- **3.3.3 (AA) - Error Suggestion:** Helpful error messages
- **3.3.7 (A) - Redundant Entry:** Autofill for repeated info
- **4.1.2 (A) - Name, Role, Value:** Label, role, required state, error state

**Common violations:**
- Using placeholder as label
- No label at all
- Error only shown as red border
- Required not indicated programmatically

**Platform-specific:**
- Android: Use TextInputLayout, `android:hint`, `android:autofillHints`
- iOS: Associated UILabel, `textContentType`
- Web: `<label>` associated with `<input>`, `autocomplete` attribute

---

### Checkboxes
**Binary selection controls**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Label associated
- **1.4.11 (AA) - Non-text Contrast:** Checkbox visible (3:1 contrast)
- **2.1.1 (A) - Keyboard:** Keyboard accessible
- **2.5.8 (AA) - Target Size:** Adequate tap target
- **3.2.2 (A) - On Input:** Checking doesn't auto-submit
- **4.1.2 (A) - Name, Role, Value:** Label, role=checkbox, checked state, disabled state

**Common violations:**
- Checked state not announced
- Label not accessible
- Too small tap target
- Visual-only checked indication

---

### Radio Buttons
**Single selection from group**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Group label, individual labels
- **1.4.11 (AA) - Non-text Contrast:** Buttons visible
- **2.1.1 (A) - Keyboard:** Keyboard accessible
- **2.5.8 (AA) - Target Size:** Adequate tap target
- **3.2.2 (A) - On Input:** Selection doesn't auto-submit
- **4.1.2 (A) - Name, Role, Value:** Labels, role=radio, checked state

**Common violations:**
- Missing group label (fieldset/legend equivalent)
- Selection state not announced
- No keyboard navigation between options

---

### Dropdowns/Select/Pickers
**Selection from list of options**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Label associated
- **2.1.1 (A) - Keyboard:** Keyboard accessible
- **3.2.1 (A) - On Focus:** Focus doesn't open picker automatically
- **3.2.2 (A) - On Input:** Selection doesn't auto-submit (unless warned)
- **4.1.2 (A) - Name, Role, Value:** Label, role, current value, expanded state

**Common violations:**
- Selection navigates without confirmation
- Current value not announced
- Expanded/collapsed state not communicated
- No label

---

### Toggle Switches
**On/off controls**

**WCAG SC to check:**
- **1.4.11 (AA) - Non-text Contrast:** Switch visible
- **2.1.1 (A) - Keyboard:** Keyboard accessible
- **2.5.8 (AA) - Target Size:** Adequate tap target
- **3.2.2 (A) - On Input:** Toggling doesn't cause unexpected navigation
- **4.1.2 (A) - Name, Role, Value:** Label, role=switch, on/off state

**Common violations:**
- State not announced (on vs off)
- Toggle triggers navigation without warning
- Disabled state not communicated

---

### Sliders
**Continuous value selection**

**WCAG SC to check:**
- **1.4.11 (AA) - Non-text Contrast:** Slider track/thumb visible
- **2.1.1 (A) - Keyboard:** Keyboard adjustable
- **2.5.7 (AA) - Dragging Movements:** Alternative to dragging (e.g., tap track, +/- buttons)
- **4.1.2 (A) - Name, Role, Value:** Label, role=slider, current value, min/max

**Common violations:**
- Only draggable (no keyboard or button alternative)
- Current value not announced
- Min/max not communicated
- No label

---

## Navigation Components

### Tab Bars / Bottom Navigation
**Primary navigation tabs**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Tab structure, selected state
- **2.1.1 (A) - Keyboard:** Keyboard navigable
- **2.4.3 (A) - Focus Order:** Logical tab order
- **2.4.4 (A) - Link Purpose:** Tab labels clear
- **2.5.8 (AA) - Target Size:** Adequate tap targets
- **3.2.3 (AA) - Consistent Navigation:** Tabs in same order across screens
- **3.2.4 (AA) - Consistent Identification:** Same tabs labeled consistently
- **4.1.2 (A) - Name, Role, Value:** Label, role=tab, selected state, position (tab X of Y)

**Common violations:**
- Selected state not announced
- Using buttons without tab role
- Tab order changes between screens
- Selected tab not clearly indicated

**Pattern guide:** [Buttons Acting as Tabs](../patterns/BUTTONS_ACTING_AS_TABS.md)

---

### Navigation Drawer / Sidebar Menu
**Slide-out navigation menu**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Menu structure
- **2.1.1 (A) - Keyboard:** Keyboard accessible, escapable
- **2.1.2 (A) - No Keyboard Trap:** Can close with keyboard
- **2.4.1 (A) - Bypass Blocks:** Can skip if needed
- **2.4.3 (A) - Focus Order:** Logical order
- **3.2.3 (AA) - Consistent Navigation:** Items in consistent order
- **4.1.2 (A) - Name, Role, Value:** Items labeled, menu role

**Pattern guide:** [Navigation Bar Accessibility](../patterns/NAVIGATION_BAR_ACCESSIBILITY.md)

---

### Breadcrumbs
**Hierarchical navigation**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** List structure, current location
- **2.4.4 (A) - Link Purpose:** Links clearly describe destinations
- **2.4.8 (AAA) - Location:** Shows user position (if targeting AAA)
- **4.1.2 (A) - Name, Role, Value:** Links labeled, current page indicated

---

## Collections (Lists and Grids)

### List Items / Grid Items
**Items in RecyclerView, LazyColumn, UITableView, etc.**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Items should be grouped as single units
- **2.1.1 (A) - Keyboard:** Item focusable and activatable
- **2.4.3 (A) - Focus Order:** Logical focus order
- **2.4.4 (A) - Link Purpose:** Item purpose clear from merged content
- **2.5.8 (AA) - Target Size:** Adequate tap target
- **4.1.2 (A) - Name, Role, Value:** All content merged, role appropriate, state if applicable

**Critical pattern:** [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)

**Common violations:**
- Each child element separately focusable (should be single unit)
- Missing context for repeated elements (multiple "View" buttons)
- Icon/image meaning not merged into item label
- Position in list not announced (should be automatic)

**Implementation:**
- **Android XML:** `android:screenReaderFocusable="true"` on parent, `importantForAccessibility="no"` on children
- **Android Compose:** `Modifier.semantics { contentDescription = "merged text" }` on parent, or use `mergeDescendants = true`
- **iOS:** `shouldGroupAccessibilityChildren = true` on cell, `isAccessibilityElement = false` on children
- **React Native:** `accessible={true}` on parent, `accessibilityElementsHidden={true}` on children (iOS)
- **Flutter:** `MergeSemantics` wrapping all children

---

### Repeated Elements in Collections
**"View", "Edit", "Read more" buttons that repeat**

**WCAG SC to check:**
- **2.4.4 (A) - Link Purpose:** Purpose clear from context
- **4.1.2 (A) - Name, Role, Value:** Context needed in accessible name

**Pattern:** [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md)

**Solution:** Add context from parent item to button label
- ❌ "View" (repeated 20 times in list)
- ✅ "View Chocolate Cake Recipe"

---

## Complex Components

### Modals / Dialogs
**Overlays that block main content**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Dialog role, title
- **2.1.1 (A) - Keyboard:** Focus moves to dialog, all controls accessible
- **2.1.2 (A) - No Keyboard Trap:** Can close with keyboard/back button
- **2.4.2 (A) - Page Titled:** Dialog has descriptive title
- **2.4.3 (A) - Focus Order:** Focus contained, logical order
- **3.2.1 (A) - On Focus:** Opening doesn't cause unexpected changes
- **4.1.2 (A) - Name, Role, Value:** Role=dialog/alertdialog, title announced
- **4.1.3 (AA) - Status Messages:** Opening announced if not focused

**Common violations:**
- Focus not moved to dialog
- Can't close with keyboard/back
- Focus escapes dialog
- No title
- Background content still focusable

---

### Carousels / Slideshows
**Auto-advancing or swipeable content**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Slide structure, position
- **2.1.1 (A) - Keyboard:** Navigation controls keyboard accessible
- **2.2.1 (A) - Timing Adjustable:** Can extend time if auto-advancing
- **2.2.2 (A) - Pause, Stop, Hide:** Pause control for auto-play
- **2.4.3 (A) - Focus Order:** Logical navigation
- **2.5.1 (A) - Pointer Gestures:** Alternative to swipe gesture
- **4.1.2 (A) - Name, Role, Value:** Controls labeled, slide position announced

**Common violations:**
- No pause button for auto-play
- Only swipe navigation (no buttons)
- Slide position not announced
- Rapid auto-advance can't be slowed

---

### Expandable Sections / Accordions
**Collapsible content sections**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Heading/button for section
- **2.1.1 (A) - Keyboard:** Keyboard expandable/collapsible
- **4.1.2 (A) - Name, Role, Value:** Label, role=button, expanded/collapsed state

**Common violations:**
- Expanded/collapsed state not announced
- No button role on trigger
- Not keyboard accessible
- State change not announced

---

### Video Players
**Media playback controls**

**WCAG SC to check:**
- **1.2.1 (A) - Audio-only/Video-only:** Transcript for audio-only
- **1.2.2 (A) - Captions (Prerecorded):** Captions for video
- **1.2.4 (AA) - Captions (Live):** Captions for live video
- **1.2.5 (AA) - Audio Description:** Audio description available
- **1.4.2 (A) - Audio Control:** Can pause/stop auto-play
- **2.1.1 (A) - Keyboard:** All controls keyboard accessible
- **2.2.2 (A) - Pause, Stop, Hide:** Can pause video
- **4.1.2 (A) - Name, Role, Value:** All controls labeled

**Common violations:**
- No captions
- Controls not keyboard accessible
- Auto-play without controls
- Play/pause state not announced

---

## Text and Typography

### Headings
**Section headings**

**WCAG SC to check:**
- **1.3.1 (A) - Info and Relationships:** Programmatically identified as headings
- **2.4.6 (AA) - Headings and Labels:** Descriptive text
- **2.4.10 (AAA) - Section Headings:** Used to organize content (if targeting AAA)

**Platform-specific:**
- Android: `android:accessibilityHeading="true"`
- iOS: `accessibilityTraits = .header`
- Compose: `Modifier.semantics { heading() }`
- Web: `<h1>`, `<h2>`, etc.

**Common violations:**
- Using styled text instead of semantic headings
- Skipping heading levels (h1 to h3)
- Generic headings like "Section 1"

---

### Body Text
**Paragraph content**

**WCAG SC to check:**
- **1.4.3 (AA) - Contrast:** 4.5:1 for normal text, 3:1 for large
- **1.4.4 (AA) - Resize Text:** Scales with system text size
- **1.4.8 (AAA) - Visual Presentation:** Line spacing, width (if targeting AAA)
- **1.4.12 (AA) - Text Spacing:** No loss when spacing adjusted

**Common violations:**
- Fixed font sizes (px, dp instead of sp/scalable units)
- Poor contrast
- Text doesn't scale with system settings

**Pattern guide:** [Font Scaling Support](../patterns/FONT_SCALING_SUPPORT.md)

---

### Labels and Captions
**Descriptive text for controls**

**WCAG SC to check:**
- **2.4.6 (AA) - Headings and Labels:** Descriptive and clear
- **3.3.2 (A) - Labels or Instructions:** Present for all inputs
- **4.1.2 (A) - Name, Role, Value:** Associated with control

**Common violations:**
- Vague labels ("Field 1")
- Placeholder used as label
- Label not programmatically associated

---

## Status and Feedback

### Error Messages
**Validation and error feedback**

**WCAG SC to check:**
- **1.4.1 (A) - Use of Color:** Don't rely on red color alone
- **3.3.1 (A) - Error Identification:** Error clearly identified and described
- **3.3.3 (AA) - Error Suggestion:** Helpful fix suggestions
- **4.1.3 (AA) - Status Messages:** Error announced to screen readers

**Common violations:**
- Error shown only as red border
- Generic "Error" message
- Error not announced
- Not associated with field

---

### Loading Indicators
**Progress and activity indicators**

**WCAG SC to check:**
- **2.2.2 (A) - Pause, Stop, Hide:** Can pause if long operation
- **4.1.3 (AA) - Status Messages:** Loading state announced

**Common violations:**
- Loading spinner appears but not announced
- No indication of progress for long operations
- Screen reader doesn't know content is loading

---

### Toast Notifications / Snackbars
**Temporary feedback messages**

**WCAG SC to check:**
- **2.2.1 (A) - Timing Adjustable:** Enough time to read (or persistent)
- **4.1.3 (AA) - Status Messages:** Announced without receiving focus

**Common violations:**
- Toast not announced to screen readers
- Disappears too quickly
- Important info in temporary toast

---

### Success Confirmations
**Operation completed messages**

**WCAG SC to check:**
- **4.1.3 (AA) - Status Messages:** Announced to screen readers

**Common violations:**
- Visual confirmation only
- Not announced to screen readers

---

## Interactive Patterns

### Drag and Drop
**Draggable and droppable elements**

**WCAG SC to check:**
- **2.1.1 (A) - Keyboard:** Keyboard alternative required
- **2.5.1 (A) - Pointer Gestures:** Single pointer alternative
- **2.5.7 (AA) - Dragging Movements:** Alternative to dragging
- **4.1.2 (A) - Name, Role, Value:** Drag state, drop zones indicated

**Common violations:**
- Only draggable (no keyboard alternative)
- Drag-only reordering (no up/down buttons)
- Drop zones not indicated to screen readers

---

### Swipe Gestures
**Swipe to delete, swipe to refresh, etc.**

**WCAG SC to check:**
- **2.1.1 (A) - Keyboard:** Alternative to swipe
- **2.5.1 (A) - Pointer Gestures:** Single pointer alternative
- **4.1.2 (A) - Name, Role, Value:** Action available through accessible means

**Common violations:**
- Swipe-only actions (no menu option or button)
- Gesture not discoverable to screen reader users
- No alternative for switch control users

---

### Multi-Touch Gestures
**Pinch-to-zoom, two-finger scroll, etc.**

**WCAG SC to check:**
- **2.5.1 (A) - Pointer Gestures:** Single pointer alternative required
- **4.1.2 (A) - Name, Role, Value:** Alternative controls labeled

**Common violations:**
- Pinch-zoom without zoom buttons
- Two-finger gestures without alternatives
- No way to perform action with one finger/switch

---

## Quick Lookup by Common Issues

**"Missing label on button"**
→ Check: 2.4.4, 4.1.2

**"Text too small / doesn't scale"**
→ Check: 1.4.4, 1.4.12

**"Poor color contrast"**
→ Check: 1.4.3 (text), 1.4.11 (UI components)

**"Can't use with keyboard"**
→ Check: 2.1.1, possibly 2.1.2

**"Focus not visible"**
→ Check: 2.4.7

**"Tap target too small"**
→ Check: 2.5.8

**"Error only shown in color"**
→ Check: 1.4.1, 3.3.1

**"No error message"**
→ Check: 3.3.1, possibly 3.3.3

**"Form field without label"**
→ Check: 3.3.2, 1.3.1, 4.1.2

**"Image without alt text"**
→ Check: 1.1.1, 4.1.2

**"List items not grouped"**
→ Check: 1.3.1, 4.1.2

**"Checkbox state not announced"**
→ Check: 4.1.2

**"Auto-playing content"**
→ Check: 1.4.2, 2.2.2

**"Toast not announced"**
→ Check: 4.1.3

**"Can't close modal with keyboard"**
→ Check: 2.1.2

---

## Related Resources
- [WCAG Principle Files](.) - Detailed SC descriptions
- [Common Issues](../COMMON_ISSUES.md) - Issue patterns with SC mappings
- [Pattern Guides](../patterns/) - Implementation patterns
- Platform-specific guides for implementation details

---

**WCAG 2.2 Official Reference:** https://www.w3.org/TR/WCAG22/
**WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
