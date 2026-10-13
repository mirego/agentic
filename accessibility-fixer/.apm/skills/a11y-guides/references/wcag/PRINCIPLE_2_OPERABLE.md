# WCAG 2.2 Principle 2: Operable
## User interface components and navigation must be operable

---

## Guideline 2.1 Keyboard Accessible

**Make all functionality available from a keyboard.**

### 2.1.1 Keyboard (Level A)

**Criterion:**
All functionality of the content is operable through a keyboard interface.

**Mobile/Native App Interpretation:**
- All interactive elements must be focusable
- Support external keyboard navigation (important for tablets, accessibility)
- Switch Access (Android) and Switch Control (iOS) must work
- Focus order must be logical
- No functionality requires precise touch/gesture (provide alternative)

**Common Violations:**
- Custom controls that aren't focusable
- Gesture-only interactions (swipe with no alternative)
- Drag-and-drop without keyboard alternative
- Controls that only work with touch
- Collection items where child elements can't be individually accessed (see COLLECTION_ITEMS_PATTERN.md)

**Platform-Specific:**
- **Android:** Ensure `focusable="true"` or clickable elements are automatically focusable, test with D-pad or external keyboard
- **iOS:** All interactive elements should be accessible to VoiceOver and Switch Control
- **Web:** All controls reachable via Tab key

**Testing:**
- Connect external keyboard (or use emulator)
- Navigate using Tab, Arrow keys, Enter
- Enable Switch Access/Switch Control
- Verify all functionality accessible without touch

### 2.1.2 No Keyboard Trap (Level A)

**Criterion:**
If keyboard focus can be moved to a component, focus can be moved away from that component using only the keyboard.

**Mobile/Native App Interpretation:**
- Users must be able to navigate away from all components
- Modal dialogs must be dismissable with keyboard/switch
- Custom focus management must allow escape
- Back button should work in all contexts

**Common Violations:**
- Modal that traps focus with no way to close via keyboard
- Custom component that captures all key events
- Infinite loop in focus order
- Video player trapping focus

**Platform-Specific:**
- **Android:** Ensure back button works, modal dialogs can be dismissed
- **iOS:** VoiceOver escape gesture or close button must work
- **Web:** ESC key should close modals, Tab doesn't get trapped

**Testing:**
- Navigate into all modals and dialogs
- Verify can navigate out with keyboard/switch
- Test back button behavior
- Check escape key handling

### 2.1.3 Keyboard (No Exception) (Level AAA)

**Criterion:**
All functionality available via keyboard with NO exceptions.

**Note:** This is Level AAA and rarely targeted for mobile apps.

### 2.1.4 Character Key Shortcuts (Level A)

**Criterion:**
If keyboard shortcuts use only character keys, they can be turned off, remapped, or are only active when component has focus.

**Mobile/Native App Interpretation:**
- Single-key shortcuts can cause issues with voice input
- Provide way to disable or customize shortcuts
- Modifier keys (Ctrl, Alt, etc.) are safer than single keys

**Common Violations:**
- Single letter shortcuts that can't be disabled
- Shortcuts that conflict with assistive technology
- No way to view or customize shortcuts

**Testing:**
- Test all keyboard shortcuts
- Verify they use modifier keys or can be disabled
- Test with voice control enabled

---

## Guideline 2.2 Enough Time

**Provide users enough time to read and use content.**

### 2.2.1 Timing Adjustable (Level A)

**Criterion:**
For time limits set by content, user can turn off, adjust, or extend the time limit.

**Mobile/Native App Interpretation:**
- Session timeouts should be extendable
- Timed alerts must allow extension before expiring
- Auto-advancing carousels must have pause control
- Provide warning before timeout with option to extend

**Common Violations:**
- Session expires without warning
- No way to extend time limit
- Auto-play slideshow with no pause
- Timed quizzes without adjustment options

**Exceptions:**
- Real-time events (live auctions, real-time games)
- Essential time limits (security)
- Time limits over 20 hours

**Testing:**
- Identify all time limits
- Verify users can extend or disable
- Check that warnings appear with enough time

### 2.2.2 Pause, Stop, Hide (Level A)

**Criterion:**
For moving, blinking, scrolling, or auto-updating information, provide controls to pause, stop, or hide.

**Mobile/Native App Interpretation:**
- Auto-playing videos must have pause button
- Auto-scrolling content must be stoppable
- Animated content should respect reduced motion settings
- Carousels must have pause/play controls
- Live updating content (feeds, chats) needs pause option

**Common Violations:**
- Auto-advancing carousel without pause
- Constantly updating news feed without pause
- Background animations with no control
- Auto-playing video without visible controls

**Platform-Specific:**
- **Android:** Respect `Settings.Global.ANIMATOR_DURATION_SCALE`
- **iOS:** Check `UIAccessibility.isReduceMotionEnabled`
- **Web:** Respect `prefers-reduced-motion`

**Testing:**
- Identify all auto-playing/moving content
- Verify pause controls are present
- Test reduced motion settings

### 2.2.3 No Timing (Level AAA)

**Criterion:**
Timing is not an essential part of the event or activity.

**Note:** Level AAA - rarely targeted.

### 2.2.4 Interruptions (Level AAA)

**Criterion:**
Interruptions can be postponed or suppressed by the user.

**Note:** Level AAA - but good practice for notifications.

### 2.2.5 Re-authenticating (Level AAA)

**Criterion:**
When a session expires, user can re-authenticate and continue without data loss.

**Note:** Level AAA - but important for forms and sensitive operations.

### 2.2.6 Timeouts (Level AAA)

**Criterion:**
Users are warned of the duration of any user inactivity that could cause data loss.

**Note:** Level AAA - but good practice.

---

## Guideline 2.3 Seizures and Physical Reactions

**Do not design content in a way that is known to cause seizures or physical reactions.**

### 2.3.1 Three Flashes or Below Threshold (Level A)

**Criterion:**
Content does not contain anything that flashes more than three times per second.

**Mobile/Native App Interpretation:**
- Avoid flashing animations
- Loading spinners should rotate smoothly, not flash
- Notification indicators should not flash rapidly
- Video content must not have rapid flashing

**Common Violations:**
- Strobe-like effects in animations
- Rapid blinking notifications
- Flash effects in games
- Video content with photosensitive triggers

**Testing:**
- Review all animations
- Check video content for flashing
- Use photosensitive analysis tools if available
- Verify notification animations are smooth

### 2.3.2 Three Flashes (Level AAA)

**Criterion:**
Content does not contain anything that flashes more than three times per second (no exceptions).

**Note:** Level AAA - stricter than 2.3.1.

### 2.3.3 Animation from Interactions (Level AAA)

**Criterion:**
Motion animation triggered by interaction can be disabled unless essential.

**Mobile/Native App Interpretation:**
- Respect reduced motion preferences
- Provide option to disable animations
- Use subtle transitions when reduced motion enabled

**Platform-Specific:**
- Check `UIAccessibility.isReduceMotionEnabled` (iOS)
- Check `Settings.Global.ANIMATOR_DURATION_SCALE` (Android)
- Use `prefers-reduced-motion` (Web)

**Good Practice:** Even though AAA, respecting reduced motion is essential for many users.

---

## Guideline 2.4 Navigable

**Provide ways to help users navigate, find content, and determine where they are.**

### 2.4.1 Bypass Blocks (Level A)

**Criterion:**
A mechanism is available to bypass blocks of content that are repeated on multiple screens.

**Mobile/Native App Interpretation:**
- Provide skip links for repeated navigation
- Bottom navigation should allow quick jumping
- Heading navigation should be available
- Landmarks/regions for major sections

**Common Violations:**
- Must navigate through entire header/nav on every screen
- No way to jump to main content
- Repeated promotional content with no skip option

**Platform-Specific:**
- Use accessibility actions for quick navigation
- Implement custom swipe actions for VoiceOver
- Use headings to create navigable structure

**Testing:**
- Navigate app with screen reader
- Verify can jump past repeated elements
- Test heading navigation

### 2.4.2 Page Titled (Level A)

**Criterion:**
Screens/pages have titles that describe topic or purpose.

**Mobile/Native App Interpretation:**
- Screen/activity titles should be descriptive
- Navigation bar title should indicate current location
- Modal dialogs should have appropriate titles
- Screen reader should announce screen title on navigation

**Common Violations:**
- Generic titles like "Screen 1" or empty titles
- Missing navigation bar titles
- Dialogs without descriptive titles

**Platform-Specific:**
- **Android:** Set `android:label` on Activity, `setTitle()` in Fragment
- **iOS:** Set `title` property on view controller, SwiftUI `.navigationTitle()`
- **React Native:** Use navigation library's `title` option

**Testing:**
- Navigate to each screen
- Verify screen reader announces descriptive title
- Check navigation bar shows appropriate title

### 2.4.3 Focus Order (Level A)

**Criterion:**
When navigated sequentially, components receive focus in an order that preserves meaning and operability.

**Mobile/Native App Interpretation:**
- Focus order matches visual/logical order
- Screen reader navigates in sensible sequence
- Custom layouts maintain logical traversal
- Modal focus order is contained and logical

**Common Violations:**
- Visual order doesn't match focus order
- Form fields jump around when tabbing
- Grid layouts with confusing order
- Floating action buttons breaking flow

**Platform-Specific:**
- **Android:** Use `accessibilityTraversalBefore/After`, order in ViewGroup
- **iOS:** Override `accessibilityElements` array for custom order
- **Compose:** Use `Modifier.semantics { traversalIndex }`

**Testing:**
- Navigate with keyboard or screen reader
- Verify order matches visual expectation
- Test complex layouts and grids

### 2.4.4 Link Purpose (In Context) (Level A)

**Criterion:**
The purpose of each link can be determined from the link text alone or from link text together with its context.

**Mobile/Native App Interpretation:**
- Button labels should describe their action
- Link text should be meaningful (avoid "click here")
- Context from surrounding content can help
- For repeated links (e.g., "Read more"), add context
- Icons should have descriptive labels including context

**Common Violations:**
- Generic "Learn more" or "Click here" links
- Icon-only buttons without descriptive labels
- Repeated "Read more" links without distinguishing context
- Links labeled by position ("top link") only

**See pattern guide:** [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md)

**Platform-Specific:**
- Add context to `accessibilityLabel`/`contentDescription`
- Use `accessibilityHint` for additional context if needed
- Group with surrounding text when appropriate

**Testing:**
- Listen to each button/link with screen reader in isolation
- Verify purpose is clear without visual context
- Check repeated elements have unique identifiers

### 2.4.5 Multiple Ways (Level AA)

**Criterion:**
More than one way is available to locate a screen or page within a set.

**Mobile/Native App Interpretation:**
- Provide navigation menu AND search
- Bottom tabs plus hamburger menu
- Breadcrumbs or back navigation plus direct links
- Search plus categories

**Common Violations:**
- Only one way to reach deep content
- No search functionality
- No alternative to hierarchical navigation

**Testing:**
- Identify multiple paths to each major screen
- Verify search works if present
- Check alternative navigation methods

### 2.4.6 Headings and Labels (Level AA)

**Criterion:**
Headings and labels describe topic or purpose.

**Mobile/Native App Interpretation:**
- Section headings should be descriptive
- Form labels should clearly indicate required input
- Screen titles should describe content
- Button labels should describe action

**Common Violations:**
- Vague headings like "Information"
- Form labels like "Field 1"
- Buttons labeled "Submit" without context
- Missing labels on form fields

**Platform-Specific:**
- **Android:** Use `android:accessibilityHeading="true"` on TextViews
- **iOS:** Use `accessibilityTraits = .header`
- **Compose:** Use `Modifier.semantics { heading() }`

**Testing:**
- Review all headings and labels
- Verify they're descriptive and clear
- Check that purpose is obvious

### 2.4.7 Focus Visible (Level AA)

**Criterion:**
Keyboard focus indicator is visible.

**Mobile/Native App Interpretation:**
- Focus indicators must be visible when navigating with keyboard
- Custom focus styles must have sufficient contrast
- Focus should not be hidden by z-index or styling
- Touch/tap should show appropriate feedback

**Common Violations:**
- Removed focus outlines without replacement
- Focus indicators too faint (contrast < 3:1)
- Custom components without focus indication
- Focus hidden behind other elements

**Platform-Specific:**
- **Android:** Customize drawable states for `state_focused`
- **iOS:** Don't override default VoiceOver highlighting
- **Web:** Style `:focus` state, don't use `outline: none` without alternative

**Testing:**
- Navigate with keyboard/D-pad
- Verify focus indicator always visible
- Check contrast of focus indicators
- Test custom controls

### 2.4.8 Location (Level AAA)

**Criterion:**
Information about user's location within a set of pages is available.

**Mobile/Native App Interpretation:**
- Breadcrumbs show location in hierarchy
- Active tab/nav item is indicated
- Screen titles reflect position in app

**Note:** Level AAA - but good practice for complex apps.

### 2.4.9 Link Purpose (Link Only) (Level AAA)

**Criterion:**
Mechanism is available to allow link purpose to be identified from link text alone.

**Note:** Level AAA - stricter than 2.4.4.

### 2.4.10 Section Headings (Level AAA)

**Criterion:**
Section headings are used to organize the content.

**Note:** Level AAA - but recommended for long content.

### 2.4.11 Focus Not Obscured (Minimum) (Level AA) - NEW in WCAG 2.2

**Criterion:**
When a user interface component receives keyboard focus, the component is not entirely hidden by author-created content.

**Mobile/Native App Interpretation:**
- Focused elements should not be hidden behind sticky headers/footers
- Modal overlays should not obscure focus
- Keyboard should not cover focused input fields (ensure scrolling)
- Custom bottom sheets should not hide focused content

**Common Violations:**
- Bottom navigation covers focused content
- Sticky header hides focused element
- Software keyboard covers input without scrolling
- Modal partially hides underlying focused element

**Platform-Specific:**
- **Android:** Use `windowSoftInputMode="adjustResize"` or handle manually
- **iOS:** Use keyboard notifications to adjust scroll position
- Use `ScrollView`/`KeyboardAvoidingView` appropriately

**Testing:**
- Navigate with keyboard/screen reader
- Verify focused element always visible
- Test with software keyboard showing
- Check sticky headers/footers don't obscure focus

### 2.4.12 Focus Not Obscured (Enhanced) (Level AAA) - NEW in WCAG 2.2

**Criterion:**
When component receives focus, it is not hidden by author-created content at all.

**Note:** Level AAA - no part of focused element can be hidden.

### 2.4.13 Focus Appearance (Level AAA) - NEW in WCAG 2.2

**Criterion:**
Keyboard focus indicator has sufficient size and contrast.

**Note:** Level AAA - specific requirements for focus indicator appearance.

---

## Guideline 2.5 Input Modalities

**Make it easier for users to operate functionality through various inputs beyond keyboard.**

### 2.5.1 Pointer Gestures (Level A)

**Criterion:**
All functionality that uses multipoint or path-based gestures can be operated with a single pointer without a path-based gesture.

**Mobile/Native App Interpretation:**
- Pinch-to-zoom should have alternative (zoom buttons)
- Multi-finger gestures should have alternatives
- Drag-and-drop should have pick-and-place alternative
- Swipe gestures should have button alternatives
- Complex gestures should have simple alternatives

**Common Violations:**
- Pinch-zoom only, no zoom buttons
- Two-finger scrolling without alternative
- Drag to reorder without menu option
- Swipe to delete without button option

**Testing:**
- Identify all gesture interactions
- Verify single-tap alternatives exist
- Test with Switch Access/Switch Control
- Check that all gestures have button equivalents

### 2.5.2 Pointer Cancellation (Level A)

**Criterion:**
For functionality operated using a single pointer, down event is not used to execute function.

**Mobile/Native App Interpretation:**
- Use up event (release) to trigger actions
- Allow cancellation by moving pointer away
- Down event can be used for drag or if up event reverses
- Don't trigger actions on touch down

**Common Violations:**
- Button activates on touch down, can't cancel
- Accidental activation when touching
- No way to cancel after starting touch

**Platform-Specific:**
- Use `onClick`/`onTap` not `onTouchDown`
- Implement proper gesture recognizers
- Allow cancellation of in-progress gestures

**Testing:**
- Touch controls and drag away before release
- Verify can cancel actions
- Check accidental activation doesn't occur

### 2.5.3 Label in Name (Level A)

**Criterion:**
For controls with visible text labels, the accessible name contains the visible text.

**Mobile/Native App Interpretation:**
- Accessible name should match or include visible label
- Don't override with completely different text
- OK to add context, but keep visible text
- Helps voice control users ("tap [visible text]")

**Common Violations:**
- Visible text "Menu" but accessibilityLabel "Navigation menu options"
- Icon with label "Search" but accessibilityLabel "Find"
- Mismatch between visible and accessible names

**Good Practice:**
- accessibilityLabel: "Menu" or "Menu, navigation options"
- NOT "Navigation menu" when visible text is just "Menu"

**Testing:**
- Compare visible labels to accessible labels
- Test with voice control
- Verify voice commands using visible text work

### 2.5.4 Motion Actuation (Level A)

**Criterion:**
Functionality triggered by device motion can also be operated via interface and can be disabled.

**Mobile/Native App Interpretation:**
- Shake to undo should have button alternative
- Tilt controls should have button alternative
- Motion gestures should be optional
- Provide settings to disable motion features

**Common Violations:**
- Shake to report bug with no alternative
- Tilt to pan with no touch controls
- Motion controls that can't be disabled

**Testing:**
- Identify motion-based features
- Verify button alternatives exist
- Check settings for disabling motion
- Test without moving device

### 2.5.5 Target Size (Enhanced) (Level AAA)

**Criterion:**
Touch targets are at least 44x44 CSS pixels.

**Note:** Level AAA in WCAG 2.1, but see 2.5.8 for Level AA in WCAG 2.2.

### 2.5.6 Concurrent Input Mechanisms (Level AAA)

**Criterion:**
Content does not restrict use of input modalities available on a platform.

**Note:** Level AAA - support all input types.

### 2.5.7 Dragging Movements (Level AA) - NEW in WCAG 2.2

**Criterion:**
All functionality requiring dragging has a single pointer alternative.

**Mobile/Native App Interpretation:**
- Drag to reorder: provide up/down buttons
- Drag sliders: provide +/- buttons or text input
- Drag to dismiss: provide close button
- Drag to pan: provide directional buttons or gestures

**Common Violations:**
- Slider only adjustable by dragging
- Reordering only via drag-and-drop
- Maps with no zoom/pan buttons

**Testing:**
- Identify all drag interactions
- Verify single-tap alternatives
- Test with Switch Access/Switch Control

### 2.5.8 Target Size (Minimum) (Level AA) - NEW in WCAG 2.2

**Criterion:**
Touch targets have an area of at least 24x24 CSS pixels, with exceptions.

**Mobile/Native App Interpretation:**
- Minimum touch target: 24x24dp (Android) or 24x24pt (iOS)
- Recommended: 48x48dp (Android Material), 44x44pt (iOS Human Interface)
- Spacing between targets if smaller than recommended
- Exceptions: inline links in text, system controls

**Common Violations:**
- Icon buttons smaller than 24x24
- Close buttons too small
- Toolbar icons without adequate spacing
- Tiny checkboxes or radio buttons

**Testing:**
- Measure all touch targets
- Verify minimum 24x24 size
- Check spacing between small targets
- Test with large fingers/stylus

---

## Quick Reference: Common Operable Issues by Platform

### Android
- **2.1.1:** Custom views not keyboard focusable
- **2.4.2:** Missing activity/screen titles
- **2.4.3:** Incorrect accessibility traversal order
- **2.4.7:** No focus indicator on custom controls
- **2.5.8:** Touch targets smaller than 48dp

### iOS
- **2.1.1:** Elements not accessible to VoiceOver
- **2.4.2:** Missing navigation bar titles
- **2.4.3:** Custom accessibility elements in wrong order
- **2.4.7:** Default focus indicator overridden incorrectly
- **2.5.8:** Buttons smaller than 44pt

### Web
- **2.1.1:** Interactive elements not keyboard accessible
- **2.4.1:** No skip navigation link
- **2.4.7:** Focus outline removed without replacement
- **2.5.7:** Drag-only interactions

### React Native
- **2.1.1:** Custom components not accessible
- **2.4.2:** Missing screen titles in navigation
- **2.4.4:** Generic button labels
- **2.5.8:** Small touchable areas

### Flutter
- **2.1.1:** Widgets not properly focusable
- **2.4.3:** Custom focus order not set
- **2.5.8:** Small gesture detectors

---

## Related Guides
- [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md) - Focus and navigation in lists
- [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md) - Link purpose context
- [Navigation Bar Accessibility](../patterns/NAVIGATION_BAR_ACCESSIBILITY.md)
- [Buttons Acting as Tabs](../patterns/BUTTONS_ACTING_AS_TABS.md)

---

**Official WCAG 2.2 Reference:** https://www.w3.org/TR/WCAG22/#operable
**WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
