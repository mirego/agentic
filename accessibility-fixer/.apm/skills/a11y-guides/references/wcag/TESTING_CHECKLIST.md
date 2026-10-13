# Accessibility Testing Checklist
## Systematic testing approach for mobile and web applications

---

## How to Use This Checklist

1. **Select the appropriate platform section** (Android, iOS, Web, etc.)
2. **Work through each test systematically**
3. **Document all issues found** with severity and location
4. **Cross-reference with WCAG SC** using the links provided
5. **Generate report** organized by severity (not by this checklist order)

---

## Pre-Testing Setup

### Tools to Install
- [ ] Screen reader enabled (TalkBack, VoiceOver, NVDA, JAWS)
- [ ] Color contrast analyzer (app or browser extension)
- [ ] External keyboard (if testing mobile)
- [ ] Screen recording software (for documenting screen reader behavior)
- [ ] Code editor with search capabilities

### Platform-Specific Tools
- [ ] **Android:** Accessibility Scanner app, Android Studio with Lint
- [ ] **iOS:** Accessibility Inspector in Xcode
- [ ] **Web:** Browser DevTools, axe DevTools, Lighthouse

### Test Environment
- [ ] Test on real devices, not just simulators/emulators
- [ ] Test multiple screen sizes (phone, tablet)
- [ ] Test both light and dark modes
- [ ] Test with maximum system text size
- [ ] Test in both portrait and landscape orientations

---

## 1. Screen Reader Testing

**Enable screen reader:**
- Android: Settings → Accessibility → TalkBack
- iOS: Settings → Accessibility → VoiceOver
- Web: NVDA, JAWS, or VoiceOver

### Basic Navigation
- [ ] **Start screen reader and navigate to app/site**
- [ ] **Navigate linearly through entire app** (swipe right/next element)
- [ ] **Verify reading order matches visual/logical order** (2.4.3)
- [ ] **Check that all interactive elements are reachable** (2.1.1)
- [ ] **Verify no focus traps** - can navigate away from all elements (2.1.2)

### Content Announcements
- [ ] **All text content is announced** clearly and completely
- [ ] **Images have appropriate descriptions** or are hidden if decorative (1.1.1)
  - See: [Decorative Image Decision Tree](../patterns/DECORATIVE_IMAGE_DECISION_TREE.md)
- [ ] **Buttons and links announce their purpose** (2.4.4, 4.1.2)
- [ ] **Role is announced for all controls** (button, link, heading, checkbox, etc.) (4.1.2)
- [ ] **Role is NOT in the accessible name** (not "Back button", just "Back") (4.1.2)
  - See: [Avoid Role in Label](../patterns/AVOID_ROLE_IN_LABEL.md)

### States and Properties
- [ ] **Headings are announced as headings** with level if applicable (1.3.1)
- [ ] **Checkbox/toggle states announced** (checked/unchecked, on/off) (4.1.2)
- [ ] **Selected state announced** (for tabs, list selections) (4.1.2)
- [ ] **Expanded/collapsed state announced** (for accordions, dropdowns) (4.1.2)
- [ ] **Disabled state announced** when applicable (4.1.2)
- [ ] **Required fields indicated** programmatically (3.3.2)
- [ ] **Current value announced** (for sliders, progress bars) (4.1.2)

### Collections (Lists/Grids)
- [ ] **List/grid items are single focusable units** (1.3.1, 4.1.2)
- [ ] **All item content is merged into one announcement** (4.1.2)
  - See: [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)
- [ ] **Child elements (icons, images, buttons) not separately focusable** (4.1.2)
- [ ] **Item position announced automatically** (e.g., "item 1 of 10")
- [ ] **Context provided for repeated elements** (multiple "View" buttons) (2.4.4)
  - See: [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md)

### Forms
- [ ] **All inputs have associated labels** (not just placeholders) (3.3.2, 1.3.1)
- [ ] **Input type/purpose announced** (text field, email field, etc.) (4.1.2)
- [ ] **Instructions announced** when present (3.3.2)
- [ ] **Error messages announced** when they appear (3.3.1, 4.1.3)
- [ ] **Error associated with specific field** (3.3.1)
- [ ] **Success messages announced** after form submission (4.1.3)

### Dynamic Content
- [ ] **Loading states announced** (4.1.3)
- [ ] **Content updates announced** (new items added, content refreshed) (4.1.3)
- [ ] **Toast/snackbar messages announced** (4.1.3)
- [ ] **Modal/dialog opening announced** (4.1.2, 4.1.3)
- [ ] **Focus moves to modal content** when opened (2.4.3)

### Navigation
- [ ] **Screen titles announced** when navigating between screens (2.4.2)
- [ ] **Tab selection changes announced** (4.1.2)
  - See: [Buttons Acting as Tabs](../patterns/BUTTONS_ACTING_AS_TABS.md)
- [ ] **Navigation consistent across screens** (3.2.3)
- [ ] **Back navigation works as expected**

---

## 2. Keyboard/External Input Testing

**Connect external keyboard or enable Switch Control/Access**

### Basic Keyboard Navigation
- [ ] **All functionality accessible with keyboard alone** (2.1.1)
- [ ] **Tab order is logical** and matches visual flow (2.4.3)
- [ ] **Focus indicator always visible** and has sufficient contrast (2.4.7)
- [ ] **Can navigate forward (Tab) and backward (Shift+Tab)**
- [ ] **Arrow keys work** where appropriate (dropdowns, sliders, etc.)
- [ ] **Enter/Space activates controls** appropriately
- [ ] **Escape closes modals/dialogs** (2.1.2)

### Focus Management
- [ ] **Focus moves to modal when opened** (2.4.3)
- [ ] **Focus trapped within modal** (can't Tab out to background) (2.1.2)
- [ ] **Can close modal with keyboard** (Esc or close button) (2.1.2)
- [ ] **Focus returns to trigger element** when modal closes (2.4.3)
- [ ] **No keyboard traps** - can navigate away from all elements (2.1.2)

### Gestures vs Keyboard
- [ ] **All swipe gestures have button alternatives** (2.5.1)
- [ ] **All drag-and-drop has keyboard alternative** (2.5.7)
- [ ] **All multi-touch gestures have single-pointer alternative** (2.5.1)
- [ ] **Pull-to-refresh has button alternative**

### Switch Control/Access
- [ ] **Enable Switch Control (iOS) or Switch Access (Android)**
- [ ] **All interactive elements reachable**
- [ ] **All functionality works via switch**

---

## 3. Visual/UI Testing

### Color Contrast
**Use contrast analyzer tool**
- [ ] **Normal text meets 4.5:1 ratio** (<18pt or <14pt bold) (1.4.3)
- [ ] **Large text meets 3:1 ratio** (≥18pt or ≥14pt bold) (1.4.3)
- [ ] **UI components meet 3:1 ratio** (buttons, inputs, icons) (1.4.11)
- [ ] **Focus indicators meet 3:1 ratio** (2.4.7)
- [ ] **Test in both light and dark modes**
- [ ] **Disabled controls:** If they contain information users need, check contrast

### Color Usage
- [ ] **Color not used as only means of conveying information** (1.4.1)
- [ ] **Links identifiable without color alone** (underline or icon) (1.4.1)
- [ ] **Form errors not indicated by color alone** (icon + text) (1.4.1, 3.3.1)
- [ ] **Required fields not indicated by color alone** (1.4.1)
- [ ] **Status indicators have text/icon, not just color** (1.4.1)

### Text Scaling
**Increase system text size to maximum**
- [ ] **All text increases in size** (1.4.4)
- [ ] **UI adapts without breaking** (1.4.4)
- [ ] **No text truncated** (all content visible) (1.4.4)
- [ ] **No horizontal scrolling introduced** (1.4.10)
- [ ] **Controls remain usable** and tappable (1.4.4)
- [ ] **No overlapping text** or controls (1.4.12)
  - See: [Font Scaling Support](../patterns/FONT_SCALING_SUPPORT.md)

**Test at multiple text sizes:**
- [ ] Default size
- [ ] 150%
- [ ] 200% (maximum required)

### Touch Targets
**Measure all interactive elements**
- [ ] **Minimum 24x24 dp/pt** for all touch targets (2.5.8)
- [ ] **Recommendation: 48x48 dp (Android) or 44x44 pt (iOS)**
- [ ] **Adequate spacing** between small targets
- [ ] **Include padding** in touch target calculation
- [ ] **Exception:** Inline text links can be smaller

**Common violations:**
- Close buttons too small
- Icon buttons without padding
- Small checkboxes/radio buttons
- Toolbar/tab bar icons

### Orientation
- [ ] **App works in both portrait and landscape** (1.3.4)
- [ ] **Content not locked to one orientation** without good reason (1.3.4)
- [ ] **State preserved** when rotating (1.3.4)
- [ ] **All features accessible** in both orientations (1.3.4)

### Reflow and Layout
- [ ] **No horizontal scrolling** (except maps, diagrams, tables) (1.4.10)
- [ ] **Content reflows** at different screen widths (1.4.10)
- [ ] **Test on various screen sizes** (phone, tablet, foldable)
- [ ] **Content adapts** when text spacing changes (1.4.12)

---

## 4. Forms and Input Testing

### Labels and Instructions
- [ ] **Every input has a visible, persistent label** (not just placeholder) (3.3.2)
- [ ] **Labels always visible** (don't disappear when typing) (3.3.2)
- [ ] **Labels programmatically associated** with inputs (1.3.1, 3.3.2)
- [ ] **Instructions provided** for complex inputs (date format, password requirements) (3.3.2)
- [ ] **Required fields clearly indicated** (not just color) (3.3.2)
- [ ] **Format examples shown** (phone, date, etc.) (3.3.2)

### Input Types and Autofill
- [ ] **Appropriate input types used** (email, tel, number, etc.) (1.3.5)
- [ ] **Appropriate keyboard shown** for input type (1.3.5)
- [ ] **Autofill hints set** for common fields (3.3.7, 1.3.5)
  - Android: `autofillHints`
  - iOS: `textContentType`
  - Web: `autocomplete`
- [ ] **Autofill works** when testing with real data (3.3.7)

### Focus Behavior
- [ ] **Focusing input doesn't auto-submit form** (3.2.1)
- [ ] **Focusing input doesn't navigate away** (3.2.1)
- [ ] **Showing keyboard is OK**, other changes are not (3.2.1)
- [ ] **Software keyboard doesn't obscure focused input** (2.4.11)
  - Android: Check `windowSoftInputMode`
  - iOS: Check keyboard handling
  - React Native: Use KeyboardAvoidingView

### Input Changes
- [ ] **Typing doesn't cause unexpected navigation** (3.2.2)
- [ ] **Selecting dropdown doesn't auto-submit** (unless warned) (3.2.2)
- [ ] **Toggling switch doesn't navigate** (unless expected) (3.2.2)
- [ ] **Checking checkbox doesn't auto-submit** (3.2.2)
- [ ] **Need explicit submit button** or clear indication (3.2.2)

### Error Handling
- [ ] **Errors clearly identified** (which field, what's wrong) (3.3.1)
- [ ] **Errors not shown by color alone** (include icon and text) (1.4.1, 3.3.1)
- [ ] **Error messages announce to screen readers** (3.3.1, 4.1.3)
- [ ] **Errors programmatically associated with fields** (3.3.1)
  - Android: `setError()` on EditText
  - iOS: `accessibilityValue` with error
  - Web: `aria-describedby`, `aria-invalid`
- [ ] **Error suggestions provided** (how to fix) (3.3.3)
- [ ] **Examples given** for format errors (3.3.3)

### Submission
- [ ] **Confirmation screen** for important actions (purchase, delete account) (3.3.4)
- [ ] **Can review before final submit** (3.3.4)
- [ ] **Can edit/cancel** before completing (3.3.4)
- [ ] **Success message announced** to screen readers (4.1.3)
- [ ] **Data not lost** if session expires (3.3.4)

### Redundant Entry
- [ ] **Previously entered info auto-populated** (3.3.7)
- [ ] **Autofill works for standard fields** (3.3.7)
- [ ] **Multi-step forms carry data forward** (3.3.7)
- [ ] **Don't require re-entering same data** (e.g., copy billing to shipping) (3.3.7)

---

## 5. Authentication Testing

### Login Methods
- [ ] **Biometric authentication available** (Face ID, Touch ID, Fingerprint) (3.3.8)
  - Android: BiometricPrompt
  - iOS: LocalAuthentication framework
- [ ] **Password manager supported** (3.3.8)
- [ ] **Can paste into password fields** (3.3.8)
- [ ] **Social login options** (optional but helpful) (3.3.8)
- [ ] **"Magic link" email option** (optional but helpful) (3.3.8)

### Password Requirements
- [ ] **Requirements clearly stated** before user types (3.3.2)
- [ ] **Don't require overly complex passwords** that must be memorized (3.3.8)
- [ ] **Password visibility toggle** (show/hide password)
- [ ] **Clear error messages** if requirements not met (3.3.3)

---

## 6. Media Testing

### Video Content
- [ ] **Captions available** for all videos (1.2.2 for prerecorded, 1.2.4 for live)
- [ ] **Captions accurate** (not just auto-generated without review) (1.2.2)
- [ ] **Captions easily accessible** (enabled by default or prominent control) (1.2.2)
- [ ] **Audio description available** for visual-only content (1.2.5)
- [ ] **Platform caption preferences respected** (1.2.2)
  - Android: CaptioningManager
  - iOS: MediaAccessibility framework

### Audio Content
- [ ] **Transcripts provided** for audio-only content (1.2.1)
- [ ] **Can pause/stop auto-playing audio** (1.4.2, 2.2.2)
- [ ] **Doesn't interfere** with other audio (music, podcasts) (1.4.2)
- [ ] **Volume control available** (1.4.2)

### Video Player Controls
- [ ] **All controls keyboard accessible** (2.1.1)
- [ ] **All controls labeled** for screen readers (4.1.2)
- [ ] **Play/pause state announced** (4.1.2)
- [ ] **Current time and duration announced** if displayed (4.1.2)
- [ ] **Can escape from video player** with keyboard (2.1.2)

---

## 7. Timing and Animation Testing

### Auto-Playing Content
- [ ] **Auto-advancing carousels have pause button** (2.2.2)
- [ ] **Can pause/stop auto-playing content** (2.2.2)
- [ ] **Auto-play respects reduced motion settings** (2.2.2, 2.3.3)

### Timing Limits
- [ ] **Session timeouts have warnings** (2.2.1)
- [ ] **Can extend time limits** (2.2.1)
- [ ] **Push notifications before timeout** (2.2.1)

### Reduced Motion
**Enable reduced motion:**
- Android: Settings → Accessibility → Remove animations
- iOS: Settings → Accessibility → Motion → Reduce Motion

- [ ] **Animations disabled or reduced** (2.2.2, 2.3.3)
- [ ] **Essential motion still works** (progress indicators) (2.2.2)
- [ ] **Auto-play disabled** or significantly reduced (2.2.2)

### Flashing Content
- [ ] **No content flashes more than 3 times per second** (2.3.1)
- [ ] **Loading spinners rotate, don't flash** (2.3.1)
- [ ] **Notification badges don't flash** (2.3.1)

---

## 8. Interactive Component Testing

### Buttons
- [ ] **Clear, descriptive labels** (2.4.4, 4.1.2)
- [ ] **Role NOT in label** (just "Back", not "Back button") (4.1.2)
- [ ] **Purpose clear from label alone** (2.4.4)
- [ ] **Disabled state announced** if applicable (4.1.2)
- [ ] **Adequate touch target** (min 24x24px) (2.5.8)

### Links
- [ ] **Purpose clear from link text** (or context) (2.4.4)
- [ ] **Not just "click here" or "read more"** without context (2.4.4)
- [ ] **Distinguishable without color alone** (1.4.1)
- [ ] **Repeated links have context** (2.4.4)
  - See: [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md)

### Tabs
- [ ] **Tab role announced** (4.1.2)
- [ ] **Selected state announced** (4.1.2)
- [ ] **Position in tab set announced** (e.g., "Tab 1 of 3") (4.1.2)
- [ ] **Keyboard navigation works** (arrow keys) (2.1.1)
  - See: [Buttons Acting as Tabs](../patterns/BUTTONS_ACTING_AS_TABS.md)

### Modals/Dialogs
- [ ] **Dialog role announced** (4.1.2)
- [ ] **Title announced** when opened (2.4.2, 4.1.2)
- [ ] **Focus moves to dialog** (2.4.3)
- [ ] **Focus trapped in dialog** (background not focusable) (2.1.2)
- [ ] **Can close with keyboard** (Esc or close button) (2.1.2)
- [ ] **Can close with back button** (Android) (2.1.2)
- [ ] **Focus returns** to trigger after closing (2.4.3)

### Expandable Sections (Accordions)
- [ ] **Expanded/collapsed state announced** (4.1.2)
- [ ] **Keyboard accessible** (2.1.1)
- [ ] **State change announced** when toggled (4.1.2)

### Carousels
- [ ] **Slide position announced** (e.g., "Slide 2 of 5") (1.3.1)
- [ ] **Keyboard navigation works** (not just swipe) (2.1.1)
- [ ] **Button alternatives** to swipe gestures (2.5.1)
- [ ] **Pause button** if auto-advancing (2.2.2)

### Drag and Drop
- [ ] **Keyboard alternative** available (2.1.1, 2.5.7)
- [ ] **Button alternative** for reordering (up/down buttons) (2.5.7)
- [ ] **Single-pointer alternative** (not just multi-touch) (2.5.1)
- [ ] **Works with Switch Control/Access** (2.1.1)

---

## 9. Navigation Testing

### Consistency
- [ ] **Navigation in same relative order** across screens (3.2.3)
- [ ] **Bottom nav/tab bar doesn't reorder** (3.2.3)
- [ ] **Navigation drawer items consistent** (3.2.3)
- [ ] **Toolbar buttons in consistent positions** (3.2.3)
  - See: [Navigation Bar Accessibility](../patterns/NAVIGATION_BAR_ACCESSIBILITY.md)

### Identification
- [ ] **Same functionality labeled consistently** (3.2.4)
- [ ] **Same icons used throughout** (don't change search icon) (3.2.4)
- [ ] **Consistent terminology** (don't alternate "Save" and "Submit") (3.2.4)

### Bypass Blocks
- [ ] **Can skip repeated navigation** (2.4.1)
- [ ] **Heading navigation available** (via screen reader) (2.4.1)
- [ ] **Landmarks/regions for major sections** (2.4.1)

### Help
- [ ] **Help mechanism in consistent location** if present (3.2.6)
- [ ] **Support/chat widget in same position** (3.2.6)

---

## 10. Platform-Specific Checks

### Android Specific
- [ ] **`contentDescription` on ImageView/ImageButton** (1.1.1, 4.1.2)
- [ ] **`importantForAccessibility="no"` on decorative images** (1.1.1)
- [ ] **`android:accessibilityHeading="true"` on headings** (1.3.1)
- [ ] **`android:screenReaderFocusable="true"` on collection items** (1.3.1, 4.1.2)
- [ ] **Text sizes in `sp` not `dp`** (1.4.4)
- [ ] **`autofillHints` on inputs** (3.3.7, 1.3.5)
- [ ] **`accessibilityLiveRegion` for announcements** (4.1.3)
- [ ] **`windowSoftInputMode` set appropriately** (2.4.11)
- [ ] **BiometricPrompt for authentication** (3.3.8)

### iOS Specific
- [ ] **`accessibilityLabel` on UIImageView/Image** (1.1.1, 4.1.2)
- [ ] **`isAccessibilityElement = false` on decorative elements** (1.1.1)
- [ ] **`accessibilityTraits = .header` on headings** (1.3.1)
- [ ] **`shouldGroupAccessibilityChildren` on collection cells** (1.3.1, 4.1.2)
- [ ] **Dynamic Type supported** (`UIFontMetrics` or `.font()`) (1.4.4)
- [ ] **`textContentType` on inputs** (3.3.7, 1.3.5)
- [ ] **`UIAccessibility.post(notification:)` for announcements** (4.1.3)
- [ ] **Keyboard handling** (scroll when keyboard appears) (2.4.11)
- [ ] **LocalAuthentication for Face ID/Touch ID** (3.3.8)

### Web Specific
- [ ] **`alt` attribute on all `<img>`** (1.1.1)
- [ ] **Semantic HTML** (`<button>`, `<h1>`, `<nav>`, etc.) (1.3.1)
- [ ] **`<label>` associated with form inputs** (3.3.2, 1.3.1)
- [ ] **`autocomplete` attribute** on form fields (3.3.7, 1.3.5)
- [ ] **ARIA roles/attributes** where needed (4.1.2)
- [ ] **`aria-live` for announcements** (4.1.3)
- [ ] **Skip links** for navigation (2.4.1)
- [ ] **`lang` attribute on `<html>`** (3.1.1)

---

## 11. Code Review Checklist

### Search for Anti-Patterns
- [ ] **Search: `importantForAccessibility` - Check no meaningful content hidden**
- [ ] **Search: `placeholder` - Verify not used as label replacement** (3.3.2)
- [ ] **Search: `onClick`/`onPress` on non-semantic elements - Verify proper roles**
- [ ] **Search: Color values - Check contrast** (1.4.3, 1.4.11)
- [ ] **Search: Fixed font sizes (`dp`, `px`) - Should use `sp` or scalable units** (1.4.4)
- [ ] **Search: `screenOrientation` - Verify not unnecessarily locked** (1.3.4)
- [ ] **Search: Custom components - Verify accessibility properties set** (4.1.2)

### Collection Pattern Check
- [ ] **Find RecyclerView/LazyColumn/UITableView/FlatList usage**
- [ ] **Verify items are grouped as single focusable units** (1.3.1, 4.1.2)
- [ ] **Verify child elements marked as not important** (4.1.2)
  - See: [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)

### Comprehensive Component Examination

⚠️ **CRITICAL:** Don't stop at finding one instance of an issue. Check ALL occurrences.

#### Custom Button Components
- [ ] **Find all custom button classes** (FavoriteButton, PlayButton, MoreInfoButton, etc.)
- [ ] **For EACH button class:**
  - [ ] Check accessibility label is set
  - [ ] Check proper trait/role assigned
  - [ ] Check state changes announced (selected, disabled)
  - [ ] Find ALL usages of this button in codebase
  - [ ] Document EACH occurrence

#### Image/Icon Components
- [ ] **Find all ImageView/Image components**
- [ ] **For EACH image:**
  - [ ] Determine: Decorative or informational?
  - [ ] Check proper labeling or hidden appropriately
  - [ ] Special attention to:
    - [ ] Channel/brand logos (check ALL instances - tiles, banners, headers)
    - [ ] Action icons in buttons
    - [ ] Status icons
    - [ ] Corner badges

#### Collection Items
- [ ] **Find all tile/cell types** (PortraitTile, LandscapeTile, DetailedTile, etc.)
- [ ] **For EACH tile type:**
  - [ ] Check parent is single focusable unit
  - [ ] Check all children hidden from assistive tech
  - [ ] Check merged label includes ALL information
  - [ ] Check custom actions if needed

#### Text Labels
- [ ] **Find all label components**
- [ ] **For EACH label:**
  - [ ] Check if section heading → proper trait assigned
  - [ ] Check for fixed font sizes → should be scalable
  - [ ] Check fixed line heights → should scale with text

#### Repeated Elements
- [ ] **Find repeated button patterns** (View all, Delete, Play, Share buttons)
- [ ] **For EACH repeated element:**
  - [ ] Check contextual labels provided
  - [ ] Verify labels are unique and descriptive
  - [ ] Pattern: "Action + Item identifier"

#### Progress Indicators
- [ ] **Find all progress bars/indicators**
- [ ] **For EACH progress indicator:**
  - [ ] Check accessibility value set
  - [ ] Check updates announced to assistive tech
  - [ ] Or included in parent's merged label

#### Decorative Elements
- [ ] **Find all gradient views**
- [ ] **Find all background images**
- [ ] **Find all decorative containers**
- [ ] **For EACH decorative element:**
  - [ ] Verify explicitly hidden from assistive tech

#### Navigation Components
- [ ] **Check tab bar / bottom navigation**
  - [ ] Labels present on ALL tabs
  - [ ] Selected state announced
  - [ ] Position announced (Tab 1 of 3)
- [ ] **Check top navigation bar**
  - [ ] All buttons have labels
  - [ ] Back button properly labeled
  - [ ] Title announced as heading
- [ ] **Check navigation drawer/menu**
  - [ ] All items properly labeled
  - [ ] Consistent ordering

---

## 12. Documentation

### For Each Issue Found
- [ ] **Code location** (file path and line number)
- [ ] **WCAG SC** violated (with level)
- [ ] **Severity** (Critical/High/Medium/Low)
- [ ] **Description** of the problem
- [ ] **User impact** explanation
- [ ] **Recommendation** with code example
- [ ] **Current code** snippet
- [ ] **Corrected code** snippet

### Report Organization
- [ ] **Group by severity** (Critical → High → Medium → Low)
- [ ] **NOT by location** or discovery order
- [ ] **Within severity,** optionally group by WCAG SC or component type
- [ ] **Summary section** with statistics
- [ ] **Executive summary** for non-technical stakeholders

---

## Summary Checklist

### Quick Pass/Fail Check
- [ ] **Can navigate entire app with screen reader?**
- [ ] **All buttons/links have clear labels?**
- [ ] **All images have alt text or are marked decorative?**
- [ ] **All forms have visible, persistent labels?**
- [ ] **Color contrast passes (4.5:1 for text, 3:1 for UI)?**
- [ ] **Text scales to 200% without breaking?**
- [ ] **All functionality works with keyboard?**
- [ ] **No keyboard traps?**
- [ ] **Touch targets at least 24x24px?**
- [ ] **Collection items grouped properly?**
- [ ] **Status messages announced to screen readers?**

If ANY of these fail, there are critical accessibility issues.

---

## Related Resources
- [WCAG Principle Files](.) - Detailed SC explanations
- [Component-to-WCAG Mappings](COMPONENT_WCAG_MAPPINGS.md) - What to check for each component
- [Severity Guidelines](SEVERITY_GUIDELINES.md) - How to assign severity
- [Quick Lookup](QUICK_LOOKUP.md) - Fast reference tables
- [Pattern Guides](../patterns/) - Implementation patterns
- Platform-specific guides for detailed implementation

---

**WCAG 2.2 Official Reference:** https://www.w3.org/TR/WCAG22/
**WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
