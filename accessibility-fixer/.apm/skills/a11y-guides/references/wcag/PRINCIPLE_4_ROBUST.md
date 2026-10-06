# WCAG 2.2 Principle 4: Robust
## Content must be robust enough that it can be interpreted by a wide variety of user agents, including assistive technologies

---

## Guideline 4.1 Compatible

**Maximize compatibility with current and future user agents, including assistive technologies.**

### 4.1.1 Parsing (Level A) - OBSOLETE in WCAG 2.2

**Status:** This criterion was removed/obsoleted in WCAG 2.2 as modern HTML parsers handle issues automatically.

**Note:** No longer applicable for WCAG 2.2 audits.

---

### 4.1.2 Name, Role, Value (Level A)

**Criterion:**
For all user interface components, the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.

**This is one of the MOST IMPORTANT criteria for mobile/native apps.**

**Mobile/Native App Interpretation:**
- All interactive elements have accessible names (labels)
- Roles are properly communicated (button, checkbox, heading, etc.)
- States are exposed (checked, selected, expanded, disabled)
- Changes announced to screen readers
- Custom controls behave like standard controls

**Common Violations:**
- Button without label or contentDescription
- Custom control without role information
- Checkbox state not announced
- Toggle state not communicated
- Tab selection not announced
- Expandable sections without state indication
- Custom switches without checked state
- Collection items without proper grouping (see COLLECTION_ITEMS_PATTERN.md)
- Role included in accessible name (see AVOID_ROLE_IN_LABEL.md)

**Component Requirements by Type:**

#### Buttons
- **Name:** Clear, descriptive label
- **Role:** Identified as button (automatic for native buttons)
- **State:** Disabled state if applicable
- **Example (Android XML):**
  ```xml
  <Button
      android:text="Save"
      android:enabled="false" />
  ```
- **Example (Android Compose):**
  ```kotlin
  Button(
      onClick = { },
      enabled = false
  ) {
      Text("Save")
  }
  ```

#### Checkboxes
- **Name:** Label describing what's being checked
- **Role:** Checkbox
- **State:** Checked/unchecked, disabled if applicable
- **Example (iOS):**
  ```swift
  button.accessibilityLabel = "Remember me"
  button.accessibilityTraits = .button
  button.accessibilityValue = isChecked ? "checked" : "unchecked"
  ```

#### Toggle Switches
- **Name:** Label describing option
- **Role:** Switch/toggle
- **State:** On/off, enabled/disabled
- **Example (Android):**
  ```xml
  <Switch
      android:text="Enable notifications"
      android:checked="true" />
  ```

#### Tabs
- **Name:** Tab label
- **Role:** Tab
- **State:** Selected/not selected
- **Context:** Which tab of how many (e.g., "Tab 1 of 3")
- **Example (Android Compose):**
  ```kotlin
  Tab(
      selected = index == selectedIndex,
      modifier = Modifier.semantics {
          role = Role.Tab
          stateDescription = if (index == selectedIndex) "Selected" else "Not selected"
      }
  )
  ```

**See pattern guide:** [Buttons Acting as Tabs](../patterns/BUTTONS_ACTING_AS_TABS.md)

#### Expandable Sections (Accordions)
- **Name:** Section heading
- **Role:** Button or header
- **State:** Expanded/collapsed
- **Example (iOS):**
  ```swift
  header.accessibilityLabel = "Shipping Information"
  header.accessibilityTraits = [.button, .header]
  header.accessibilityValue = isExpanded ? "expanded" : "collapsed"
  header.accessibilityHint = "Double tap to \(isExpanded ? "collapse" : "expand")"
  ```

#### Collection Items (Lists, Grids)
- **Name:** Combined description of all item content
- **Role:** Button (if tappable), or container
- **State:** Selected if applicable
- **Context:** Position in collection (automatic)
- **Requirements:**
  - Parent should be focusable with `screenReaderFocusable="true"` (Android) or `accessible={true}` (React Native)
  - Child elements marked as `importantForAccessibility="no"` (Android) or `accessibilityElementsHidden` (iOS)
  - All child text/info merged into single announcement

**See detailed guide:** [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)

#### Custom Controls
- **Requirement:** Must provide same information as equivalent native control
- **Implementation:**
  - Set explicit role (button, checkbox, slider, etc.)
  - Provide clear name/label
  - Expose all states
  - Announce state changes
  - Support standard gestures for that role

**Platform-Specific:**
- **Android XML:** Use `contentDescription`, `accessibilityLiveRegion`, `android:stateDescription`
- **Android Compose:** Use `Modifier.semantics { role, stateDescription, liveRegion }`
- **iOS:** Use `accessibilityLabel`, `accessibilityTraits`, `accessibilityValue`, `accessibilityHint`
- **React Native:** Use `accessibilityLabel`, `accessibilityRole`, `accessibilityState`
- **Flutter:** Use `Semantics` widget with appropriate properties
- **Web:** Use ARIA attributes (`role`, `aria-label`, `aria-checked`, etc.)

**Common Anti-Patterns:**
1. **Role in accessible name:** ❌ "Back button" → ✅ "Back" (see AVOID_ROLE_IN_LABEL.md)
2. **Missing state:** ❌ Checkbox with no checked state
3. **Generic labels:** ❌ "Button" → ✅ "Save order"
4. **No change announcement:** ❌ Tab changes but screen reader not notified
5. **Collection chaos:** ❌ Each sub-element in list item focusable separately (see COLLECTION_ITEMS_PATTERN.md)

**Testing:**
1. Enable screen reader (TalkBack, VoiceOver)
2. Navigate to each interactive element
3. Verify name is announced clearly
4. Verify role is communicated
5. Interact with controls and verify states announced
6. Test custom controls behave like native equivalents
7. For collections, verify items are single focusable units

**Priority:** CRITICAL - This SC is violated more than any other in mobile apps.

---

### 4.1.3 Status Messages (Level AA)

**Criterion:**
Status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.

**Mobile/Native App Interpretation:**
- Toast notifications accessible to screen readers
- Loading states announced
- Success/error messages announced without stealing focus
- Progress updates communicated
- Dynamic content changes announced
- Use live regions for announcements

**Common Violations:**
- Toast messages not read by screen readers
- Loading spinner appears but not announced
- Form submission success not communicated
- Content updated but change not announced
- Error messages appear visually but screen reader misses them
- Progress bar updates not announced

**Types of Status Messages:**

#### Success Messages
```kotlin
// Android Compose
val coroutineScope = rememberCoroutineScope()
Button(onClick = {
    coroutineScope.launch {
        // Announce success
        view.announceForAccessibility("Order placed successfully")
    }
}) {
    Text("Place Order")
}
```

#### Error Messages
```swift
// iOS
UIAccessibility.post(
    notification: .announcement,
    argument: "Unable to save. Please check your connection."
)
```

#### Progress Updates
```xml
<!-- Android XML -->
<ProgressBar
    android:accessibilityLiveRegion="polite"
    android:contentDescription="@string/loading" />
```

#### Loading States
```javascript
// React Native
import { AccessibilityInfo } from 'react-native';

const announceLoading = () => {
  AccessibilityInfo.announceForAccessibility('Loading content, please wait');
};
```

#### Dynamic Content
```dart
// Flutter
Semantics(
  liveRegion: true,
  child: Text('$itemCount items in cart'),
)
```

**Live Region Types:**
- **Polite:** Announce when convenient (most common)
- **Assertive:** Announce immediately (use sparingly, for urgent messages)
- **Off:** Don't announce changes

**Platform-Specific:**
- **Android:** Use `announceForAccessibility()` or `android:accessibilityLiveRegion`
- **iOS:** Use `UIAccessibility.post(notification: .announcement)`
- **Web:** Use ARIA `role="status"`, `role="alert"`, or `aria-live`
- **React Native:** Use `AccessibilityInfo.announceForAccessibility()`
- **Flutter:** Use `Semantics(liveRegion: true)`

**Best Practices:**
1. **Don't overuse:** Too many announcements are overwhelming
2. **Be concise:** "Saved" not "Your changes have been successfully saved to the database"
3. **Use polite for most cases:** Only use assertive for critical alerts
4. **Don't announce everything:** Focus on meaningful status changes
5. **Test with screen reader:** Verify timing and content of announcements

**When to Announce:**
- ✅ Form submission result (success/error)
- ✅ Loading state begins/ends
- ✅ Items added to cart
- ✅ Search results updated
- ✅ Connection lost/restored
- ✅ Background operation completed
- ❌ Every character typed in search box
- ❌ Every minor UI state change
- ❌ Redundant information already on screen

**Testing:**
1. Enable screen reader
2. Trigger status changes (submit form, load data, etc.)
3. Verify announcements without focus moving
4. Check timing is appropriate
5. Verify messages are concise and clear
6. Test loading states
7. Check error/success messaging

---

## Quick Reference: Common Robust Issues by Platform

### Android
- **4.1.2:** Missing `contentDescription` on ImageButton
- **4.1.2:** Custom views without semantic properties
- **4.1.2:** Toggle states not communicated
- **4.1.2:** Collection items not properly grouped
- **4.1.2:** "Button" in button labels (see AVOID_ROLE_IN_LABEL.md)
- **4.1.3:** Toast messages not announced
- **4.1.3:** No `accessibilityLiveRegion` on dynamic content

### iOS
- **4.1.2:** Missing `accessibilityLabel` on UIButton with only image
- **4.1.2:** Custom controls without traits
- **4.1.2:** Switch state not in `accessibilityValue`
- **4.1.2:** Collection cells not grouped properly
- **4.1.3:** Alerts not using `UIAccessibility.post`
- **4.1.3:** Dynamic updates not announced

### Web
- **4.1.2:** Custom widgets without ARIA roles
- **4.1.2:** Dynamic state changes not reflected in ARIA
- **4.1.2:** Checkbox without `aria-checked`
- **4.1.3:** Status messages without `role="status"` or `aria-live`
- **4.1.3:** Client-side updates not announced

### React Native
- **4.1.2:** Missing `accessibilityLabel` on touchables
- **4.1.2:** No `accessibilityRole` on custom components
- **4.1.2:** State not reflected in `accessibilityState`
- **4.1.3:** Updates not using `announceForAccessibility`

### Flutter
- **4.1.2:** Widgets without `Semantics`
- **4.1.2:** Custom controls without semantic properties
- **4.1.2:** State changes not reflected in semantics
- **4.1.3:** Dynamic content without `liveRegion: true`

---

## 4.1.2 Detailed Checklist by Control Type

### Interactive Images
- [ ] Has descriptive accessible name
- [ ] Role communicated as button (if clickable)
- [ ] Disabled state communicated if applicable
- [ ] Not just "image" or "icon"

### Buttons
- [ ] Clear, action-oriented label
- [ ] Role communicated (automatic for native buttons)
- [ ] Disabled state if applicable
- [ ] Does NOT include word "button" in label (see AVOID_ROLE_IN_LABEL.md)

### Links
- [ ] Link text describes destination
- [ ] Role communicated (automatic for native links)
- [ ] Purpose clear from text alone or with context

### Form Inputs
- [ ] Associated label announced
- [ ] Input type/role communicated
- [ ] Required state if applicable
- [ ] Error state and message announced
- [ ] Value changes announced appropriately

### Checkboxes/Radio Buttons
- [ ] Label describes option
- [ ] Role communicated
- [ ] Checked/unchecked state announced
- [ ] Group label for radio groups

### Dropdowns/Select
- [ ] Label describes purpose
- [ ] Role communicated (combo box, dropdown)
- [ ] Current selection announced
- [ ] Expanded/collapsed state
- [ ] Number of options if helpful

### Sliders
- [ ] Label describes what's being adjusted
- [ ] Role communicated (slider, adjustable)
- [ ] Current value announced
- [ ] Min/max values communicated
- [ ] Adjustment increment clear

### Tabs
- [ ] Tab label clear
- [ ] Role communicated as tab
- [ ] Selected state announced
- [ ] Position in tab set (Tab 1 of 3)
- [ ] See: BUTTONS_ACTING_AS_TABS.md

### Toggles/Switches
- [ ] Label describes option
- [ ] Role communicated (switch)
- [ ] On/off or checked/unchecked state
- [ ] Disabled state if applicable

### Expandable Sections
- [ ] Section heading clear
- [ ] Role (button or header)
- [ ] Expanded/collapsed state
- [ ] Hint about action (double tap to expand)

### Custom Controls
- [ ] Appropriate role assigned
- [ ] Name clearly describes purpose
- [ ] All states exposed programmatically
- [ ] State changes announced
- [ ] Behaves like equivalent native control
- [ ] Supports standard gestures for role

### Collection Items (List/Grid Items)
- [ ] Item is single focusable unit
- [ ] All child content merged into one announcement
- [ ] Child elements not separately focusable
- [ ] Position announced automatically
- [ ] Selected state if applicable
- [ ] See: COLLECTION_ITEMS_PATTERN.md

---

## Related Guides
- [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md) - Critical for 4.1.2
- [Avoid Role in Label](../patterns/AVOID_ROLE_IN_LABEL.md) - Critical for 4.1.2
- [Buttons Acting as Tabs](../patterns/BUTTONS_ACTING_AS_TABS.md) - Tab implementation
- [Common Issues Reference](../COMMON_ISSUES.md)

---

## Why 4.1.2 is Critical

**4.1.2 Name, Role, Value** is the most frequently violated criterion in mobile accessibility audits. Why?

1. **Affects every interactive element:** Unlike color contrast (visual only), this affects every button, link, control
2. **Makes apps unusable:** Without names/roles, screen reader users can't understand or use controls
3. **Easy to miss:** Visual appearance looks fine, but accessibility layer is broken
4. **Custom controls:** Developers often forget accessibility when building custom UIs
5. **Collections:** Very common pattern but often implemented incorrectly

**Impact:** Users cannot identify controls, understand their purpose, or know their state. This makes core functionality inaccessible.

---

**Official WCAG 2.2 Reference:** https://www.w3.org/TR/WCAG22/#robust
**WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
