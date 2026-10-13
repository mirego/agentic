# Applying WCAG 2.2 to Mobile Native Apps
## How to interpret web-focused guidelines for iOS, Android, and native platforms

---

## Introduction

WCAG 2.2 was written primarily for web content, using web-specific terminology. However, the principles apply to all digital interfaces, including native mobile apps. This guide explains how to interpret and apply WCAG criteria to mobile platforms.

**Key Document:** W3C's "Mobile Accessibility: How WCAG 2.0 and Other W3C/WAI Guidelines Apply to Mobile"
- https://www.w3.org/TR/mobile-accessibility-mapping/

---

## Terminology Translation

### Web → Mobile Equivalents

| Web Term | Mobile Equivalent | Notes |
|----------|------------------|-------|
| Web page | Screen, View, Activity, ViewController | Any single interface in the app |
| Website | App, Application | The entire mobile application |
| Browser | Operating System | iOS, Android provide accessibility services |
| DOM | View Hierarchy | Native view/widget tree |
| HTML element | View, Widget, Component | Native UI components |
| `alt` attribute | `contentDescription` (Android), `accessibilityLabel` (iOS) | Alternative text |
| ARIA roles | Accessibility traits/roles | Button, header, etc. |
| Mouse hover | Touch, Long press | Mobile touch equivalents |
| Keyboard | External keyboard, Switch Control, Voice Control | Alternative input methods |
| Screen reader | TalkBack (Android), VoiceOver (iOS) | Assistive technology |
| Focus | Accessibility focus | What screen reader is currently on |

---

## Platform Considerations

### Native Apps vs Web Apps

**Native apps have:**
- ✅ Better integration with OS accessibility services
- ✅ More control over gestures and input
- ✅ Platform-specific UI patterns users expect
- ⚠️ Different testing tools and approaches
- ⚠️ Less automated testing available
- ⚠️ Platform-specific implementation for each OS

**Mobile-specific challenges:**
- Smaller screens
- Touch-based interaction
- Virtual keyboards
- Various screen sizes and orientations
- Platform-specific conventions
- Gesture-based navigation
- Limited space for labels and instructions

---

## Principle 1: Perceivable - Mobile Interpretation

### 1.1.1 Non-text Content
**Web:** `<img alt="...">`
**Mobile:**
- Android: `android:contentDescription` or `Modifier.semantics { contentDescription }`
- iOS: `accessibilityLabel` property
- React Native: `accessibilityLabel` prop
- Flutter: `Semantics(label: ...)` widget

**Mobile-specific:**
- Splash screens and app icons (describe in app metadata)
- App icons in notifications (ensure notification text is clear)
- Custom drawn graphics (provide accessibility label)

### 1.2.x Time-based Media
**Mobile-specific:**
- Video players must support platform caption preferences
- Android: CaptioningManager for caption styling
- iOS: MediaAccessibility framework
- Picture-in-picture mode must maintain caption support
- Background audio handling (respect other audio sources)

### 1.3.1 Info and Relationships
**Web:** Semantic HTML (`<h1>`, `<button>`, `<label>`)
**Mobile:**
- Headings: `accessibilityHeading` (Android), `accessibilityTraits = .header` (iOS)
- Labels: Associated labels with form fields
- Groups: `shouldGroupAccessibilityChildren` (iOS), `screenReaderFocusable` (Android)
- Lists: Use native list components when possible

**Mobile-specific:**
- **Collection views/RecyclerView items MUST be grouped** (see COLLECTION_ITEMS_PATTERN.md)
- Tab bars need proper tab roles (see BUTTONS_ACTING_AS_TABS.md)
- Navigation drawers should use menu semantics

### 1.3.2 Meaningful Sequence
**Mobile-specific:**
- Reading order may differ from visual layout in grid/card layouts
- Complex layouts need explicit traversal order
- Android: `accessibilityTraversalBefore/After`
- iOS: Override `accessibilityElements` array
- Compose: `Modifier.semantics { traversalIndex }`

### 1.3.4 Orientation
**Mobile-specific:**
- Support portrait and landscape unless truly essential
- Don't lock orientation unnecessarily
- Maintain state when rotating
- Android: Avoid `android:screenOrientation` restrictions
- iOS: Support all orientations in Info.plist

### 1.4.3 Contrast (Minimum)
**Mobile-specific:**
- Test in both light and dark modes
- Consider outdoor viewing conditions (higher contrast better)
- Dynamic color systems (Material You, iOS Dynamic Colors)
- OLED screens may show colors differently
- Test on actual devices, not just simulators

### 1.4.4 Resize Text
**Mobile-specific:**
- **Critical for mobile:** Users regularly adjust system text size
- Android: Use `sp` units for text, test with "Font size" settings
- iOS: Support Dynamic Type with `UIFontMetrics` or `.font(.body)` in SwiftUI
- React Native: `PixelRatio.getFontScale()`
- Flutter: `MediaQuery.of(context).textScaleFactor`
- UI must adapt at maximum system text size
- See: [Font Scaling Support](../patterns/FONT_SCALING_SUPPORT.md)

### 1.4.10 Reflow
**Mobile-specific:**
- Avoid horizontal scrolling (except maps, charts, etc.)
- Content must reflow on device rotation
- Support various screen sizes (phone, tablet, fold)
- Dynamic layouts that adapt to content
- Avoid fixed widths that don't scale

### 1.4.11 Non-text Contrast
**Mobile-specific:**
- Bottom navigation icons and indicators
- Tab bar selection indicators
- Form input borders
- Button outlines
- Switch controls (on/off states)
- Floating action buttons
- System navigation (gesture bars, if customized)

### 1.4.13 Content on Hover or Focus
**Mobile-specific:**
- "Hover" → Long press or focus
- Tooltips on long press must be accessible
- Ensure dismissable without changing focus
- Consider screen reader tooltip alternatives
- iOS: `accessibilityHint` property
- Android: `tooltipText` or long-press behavior

---

## Principle 2: Operable - Mobile Interpretation

### 2.1.1 Keyboard
**Mobile interpretation:**
- "Keyboard" includes:
  - External bluetooth keyboard (important for tablets)
  - Switch Control (iOS)
  - Switch Access (Android)
  - Voice Control
  - Any non-touch input method
- All functionality must work with external keyboard
- D-pad navigation (Android TV, some tablets)
- Test with Tab, arrow keys, Enter, Escape

**Mobile-specific:**
- Custom gestures MUST have alternatives (buttons, keyboard)
- Swipe actions need menu/button alternatives
- Pull-to-refresh should have refresh button
- Drag-and-drop needs alternative (see 2.5.7)

### 2.1.2 No Keyboard Trap
**Mobile-specific:**
- Modals/dialogs must be dismissable
- Back button should work (Android)
- ESC key or close button required (iOS)
- Bottom sheets must be closeable
- Full-screen overlays need exit mechanism
- Video players allow exit

### 2.2.1 Timing Adjustable
**Mobile-specific:**
- Session timeouts must be extendable
- Consider background app state (timer pauses?)
- Push notifications before timeout
- Auto-logout warnings with extension option
- Respect "power saving" modes that might extend timeouts

### 2.2.2 Pause, Stop, Hide
**Mobile-specific:**
- Auto-playing videos must have pause button
- Animated backgrounds (live wallpapers, etc.)
- Loading animations respect reduced motion
- Android: Check `Settings.Global.ANIMATOR_DURATION_SCALE == 0`
- iOS: Check `UIAccessibility.isReduceMotionEnabled`
- Web: `prefers-reduced-motion` media query

### 2.3.1 Three Flashes
**Mobile-specific:**
- Splash screens (avoid flashing animations)
- Notification badges (don't flash rapidly)
- Live activity indicators (smooth, not flashing)
- Camera flash in-app (provide warning and control)

### 2.4.1 Bypass Blocks
**Mobile-specific:**
- Navigation drawers (consider skip pattern)
- Bottom navigation (jump to content)
- Heading navigation via screen reader (use heading traits)
- Custom actions for quick navigation
- VoiceOver rotor for heading/landmark navigation

### 2.4.2 Page Titled
**Mobile-specific:**
- Android: Activity/Fragment title, Toolbar title
- iOS: Navigation bar title, `title` property
- SwiftUI: `.navigationTitle()`
- React Native: Navigation options `title`
- Screen reader announces title on navigation
- Modal titles required

### 2.4.3 Focus Order
**Mobile-specific:**
- More complex due to varied layouts
- Grid/card layouts need explicit order
- Floating action buttons (where in order?)
- Bottom sheets (focus order when opened)
- Navigation drawers (focus management)
- Custom tab navigation
- Test thoroughly on actual devices

### 2.4.4 Link Purpose (In Context)
**Mobile-specific:**
- Icon buttons need descriptive labels
- Navigation buttons include destination
- Repeated "View" buttons need context (see REPEATED_ELEMENTS_CONTEXT.md)
- Bottom nav items clearly labeled
- Tab labels describe content
- Share buttons specify what's being shared
- Context from surrounding content in collections (see COLLECTION_ITEMS_PATTERN.md)

### 2.4.7 Focus Visible
**Mobile-specific:**
- Keyboard navigation focus (external keyboard)
- Don't hide default VoiceOver highlighting (iOS)
- Customize focus indicator styles (Android drawable states)
- Switch Control visibility
- Test with keyboard connected
- Custom components need focus indicators

### 2.4.11 Focus Not Obscured (NEW in WCAG 2.2)
**Mobile-specific:**
- **Software keyboard:** Critical issue on mobile
- Android: `windowSoftInputMode="adjustResize"` or `adjustPan`
- iOS: Handle keyboard notifications, scroll focused field into view
- React Native: `KeyboardAvoidingView`
- Sticky headers/bottom navigation shouldn't hide focus
- Bottom sheets positioning
- Floating action buttons

### 2.5.1 Pointer Gestures
**Mobile-specific:**
- Pinch-to-zoom → provide zoom buttons
- Two-finger scroll → standard single-finger scroll
- Multi-touch rotation → rotation buttons or slider
- Complex gestures → simple alternatives
- All functionality via Switch Control

### 2.5.2 Pointer Cancellation
**Mobile-specific:**
- Use touch up event (release), not touch down
- Android: `onClick` not `onTouchDown`
- iOS: `touchUpInside` not `touchDown`
- Allow cancellation by dragging away before release
- Important for accidental activation prevention

### 2.5.3 Label in Name
**Mobile-specific:**
- Important for Voice Control
- "Hey Siri, tap [visible text]" must work
- accessible name should start with visible text
- Don't completely override visible labels
- Example: Visible "Menu", accessible "Menu, Navigation options" ✅
- Not: Visible "Menu", accessible "Navigation" ❌

### 2.5.4 Motion Actuation
**Mobile-specific:**
- Shake to undo → provide undo button
- Tilt controls → provide button/joystick controls
- Step counter functionality → manual entry option
- Gesture shortcuts → settings to disable
- Provide alternatives for all motion features

### 2.5.7 Dragging Movements (NEW in WCAG 2.2)
**Mobile-specific:**
- Drag to reorder → long press menu with up/down options
- Slider drag → tap on track, +/- buttons
- Swipe to dismiss → close button
- Drag to dismiss → close button
- Map panning → directional buttons
- Important for Switch Access users

### 2.5.8 Target Size (Minimum) (NEW in WCAG 2.2)
**Mobile-specific:**
- Minimum: 24x24 dp (Android) or 24x24 pt (iOS)
- **Platform recommendations (higher than WCAG):**
  - Android Material: 48x48 dp
  - iOS Human Interface: 44x44 pt
- Include padding in touch target size
- Spacing between small targets if under recommended size
- Inline text links can be smaller (exception)

---

## Principle 3: Understandable - Mobile Interpretation

### 3.1.1 Language of Page
**Mobile-specific:**
- Set supported localizations in app config
- Android: res/values-[lang] folders
- iOS: Localizable.strings, Info.plist CFBundleDevelopmentRegion
- System determines language from device settings
- Screen readers use correct pronunciation

### 3.1.2 Language of Parts
**Mobile-specific:**
- Mixed language content (quotes, product names, etc.)
- Android Compose: `Modifier.semantics { accessibilityLanguage }`
- iOS: `accessibilityLanguage` property
- Important for correct pronunciation
- Less common but important for multilingual apps

### 3.2.1 On Focus
**Mobile-specific:**
- Focusing text input → keyboard appears (allowed)
- Focusing input → picker opens immediately (violation)
- Focus doesn't navigate to different screen
- Focus doesn't submit form
- Focus doesn't change app state unexpectedly

### 3.2.2 On Input
**Mobile-specific:**
- Typing in search → live results OK
- Selecting dropdown → auto-submit without confirmation (violation)
- Toggle switch → navigates to settings screen (violation, unless expected)
- Radio button selection → auto-submit (violation)
- Slider adjustment → live preview (allowed)
- Need explicit submit button or clear expectation

### 3.2.3 Consistent Navigation
**Mobile-specific:**
- Bottom navigation order stays same
- Tab bar items don't reorder
- Navigation drawer items in consistent order
- Toolbar button positions consistent
- Back button behavior predictable
- Applies across all screens in app

### 3.2.4 Consistent Identification
**Mobile-specific:**
- Same icons throughout app (don't change search icon)
- Consistent button labels ("Save" vs "Submit" for same action)
- Consistent terminology
- Platform conventions (use standard share icon, etc.)

### 3.2.6 Consistent Help (NEW in WCAG 2.2)
**Mobile-specific:**
- Help button in consistent location (e.g., always top-right)
- Support/chat widget in same position
- FAQ or help menu in same navigation location
- Feedback mechanism consistently accessible

### 3.3.1 Error Identification
**Mobile-specific:**
- Error announcements via live regions
- Android: `announceForAccessibility()`, `accessibilityLiveRegion`
- iOS: `UIAccessibility.post(notification: .announcement)`
- React Native: `AccessibilityInfo.announceForAccessibility()`
- Error associated with field for screen readers
- Don't rely on red color alone (icon + text)

### 3.3.2 Labels or Instructions
**Mobile-specific:**
- **Placeholder is NOT a label** (critical mobile anti-pattern)
- Use TextInputLayout (Android), floating labels
- Persistent label above or inside input field
- Instructions visible before interaction
- Format examples for phone, date, etc.
- Required indicators (not just red asterisk)

### 3.3.3 Error Suggestion
**Mobile-specific:**
- Format errors → show format example
- Validation errors → explain requirement
- "Password must be at least 8 characters with one number"
- Not just "Invalid"
- Helpful, actionable guidance

### 3.3.4 Error Prevention (Legal, Financial, Data)
**Mobile-specific:**
- Checkout: Review order screen before purchase
- Settings: Confirmation before deleting account
- Payments: Confirm payment details
- Forms: Review before submit
- Provide edit/cancel option
- Back button works appropriately

### 3.3.7 Redundant Entry (NEW in WCAG 2.2)
**Mobile-specific:**
- **Autofill is critical on mobile**
- Android: `android:autofillHints` (name, email, address, phone, etc.)
- iOS: `textContentType` (UITextContentType)
- Remember user selections within session/flow
- Multi-step forms carry data forward
- Don't require re-entering shipping as billing address
- Platform autofill frameworks

### 3.3.8 Accessible Authentication (Minimum) (NEW in WCAG 2.2)
**Mobile-specific:**
- **Biometric authentication:** Face ID, Touch ID, fingerprint
- Android: BiometricPrompt API
- iOS: LocalAuthentication framework (LAContext)
- Password managers: Don't block autofill
- "Magic link" email authentication
- OAuth/social sign-in options
- Allow paste in password fields
- Don't require memorizing complex passwords

---

## Principle 4: Robust - Mobile Interpretation

### 4.1.1 Parsing
**Mobile-specific:**
- Obsolete in WCAG 2.2
- Native frameworks handle view hierarchy parsing
- Not applicable to native apps

### 4.1.2 Name, Role, Value
**Mobile-specific: MOST IMPORTANT for mobile accessibility**

**Name:**
- Android: `contentDescription`, text content, `hint`
- iOS: `accessibilityLabel`
- React Native: `accessibilityLabel`
- Flutter: `Semantics(label: ...)`

**Role:**
- Android: Component type, `semantics { role = Role.Button }`
- iOS: `accessibilityTraits` (.button, .header, .link, etc.)
- React Native: `accessibilityRole`
- Flutter: `Semantics(button: true)`
- Use native components when possible (automatically have correct roles)

**Value:**
- Checkboxes: checked/unchecked state
- Sliders: current value
- Toggle switches: on/off
- Dropdowns: current selection
- Android: `stateDescription`, `accessibilityValue`
- iOS: `accessibilityValue`

**State:**
- Disabled state
- Selected state (tabs, list items)
- Expanded/collapsed state
- Android: `enabled`, `selected`, `isEnabled` in semantics
- iOS: `.notEnabled`, `.selected` traits

**Critical patterns:**
- Collection items: See [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)
- Avoid role in label: See [Avoid Role in Label](../patterns/AVOID_ROLE_IN_LABEL.md)
- Tabs: See [Buttons Acting as Tabs](../patterns/BUTTONS_ACTING_AS_TABS.md)

### 4.1.3 Status Messages
**Mobile-specific:**
- Toast/Snackbar announcements (must work with screen readers)
- Android: `announceForAccessibility()`, `accessibilityLiveRegion="polite"`
- iOS: `UIAccessibility.post(notification: .announcement, argument: "message")`
- React Native: `AccessibilityInfo.announceForAccessibility()`
- Flutter: `Semantics(liveRegion: true)`
- Loading states announced
- Form submission results announced
- Don't overuse (announcement fatigue)

---

## Mobile-Specific Best Practices

### Test on Real Devices
- Simulators/emulators don't fully replicate screen reader behavior
- Test on actual phones and tablets
- Test various screen sizes
- Test with real accessibility services enabled

### Platform Guidelines
In addition to WCAG, follow:
- **Android:** Material Design Accessibility guidelines
- **iOS:** Human Interface Guidelines - Accessibility
- **React Native:** Accessibility documentation
- **Flutter:** Accessibility guidelines

### Gestures
- Don't rely on complex or custom gestures alone
- Provide button alternatives
- Ensure Switch Control can access all features
- Voice Control compatibility

### Touch Targets
- Use platform recommended sizes (48dp Android, 44pt iOS)
- Not just WCAG minimum (24px)
- Better user experience for everyone

### Font Scaling
- Critical for mobile users
- Test at maximum system text size
- UI must adapt without breaking

### Collections
- RecyclerView, LazyColumn, UITableView, FlatList
- Items MUST be grouped as single focusable units
- See [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)

### Context in Lists
- Repeated buttons need context from item
- See [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md)

---

## Testing Approaches

### Screen Readers
- **Android:** TalkBack (Settings → Accessibility → TalkBack)
- **iOS:** VoiceOver (Settings → Accessibility → VoiceOver)
- Learn gestures and shortcuts
- Navigate entire app linearly
- Test all interactions

### Automated Tools
- **Android:** Accessibility Scanner app, Lint checks
- **iOS:** Accessibility Inspector in Xcode
- **Web/Hybrid:** Lighthouse, axe DevTools
- Limited coverage, manual testing essential

### Manual Checks
- Text scaling (increase to maximum)
- Color contrast analysis
- Keyboard navigation (external keyboard)
- Switch Access/Switch Control
- Dark mode
- Orientation changes
- Real-world scenarios

---

## Common Mobile-Specific Issues

### Most Common Violations
1. **Collection items not grouped** (4.1.2, 1.3.1) - See COLLECTION_ITEMS_PATTERN.md
2. **Missing accessible labels** (4.1.2, 1.1.1)
3. **Text doesn't scale** (1.4.4) - See FONT_SCALING_SUPPORT.md
4. **Repeated elements without context** (2.4.4) - See REPEATED_ELEMENTS_CONTEXT.md
5. **States not announced** (4.1.2)
6. **Gesture-only actions** (2.1.1, 2.5.1)
7. **Small touch targets** (2.5.8)
8. **Placeholder used as label** (3.3.2)
9. **Poor contrast in dark mode** (1.4.3)
10. **Status messages not announced** (4.1.3)

---

## Official Resources

**W3C:**
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Mobile Accessibility Mapping: https://www.w3.org/TR/mobile-accessibility-mapping/
- WCAG 2.2 JSON Data: https://www.w3.org/WAI/WCAG22/wcag.json

**Platform Guidelines:**
- Android: https://developer.android.com/guide/topics/ui/accessibility
- iOS: https://developer.apple.com/accessibility/
- React Native: https://reactnative.dev/docs/accessibility
- Flutter: https://docs.flutter.dev/development/accessibility-and-localization/accessibility

**Testing:**
- Android Accessibility Help: https://support.google.com/accessibility/android
- iOS VoiceOver: https://support.apple.com/guide/iphone/voiceover

---

## Related Guides
- [WCAG Principle Files](.) - Detailed SC with mobile interpretations
- [Component WCAG Mappings](COMPONENT_WCAG_MAPPINGS.md) - Component-specific guidance
- [Pattern Guides](../patterns/) - Mobile-specific patterns
- Platform guides (GUIDE_ANDROID.md, GUIDE_IOS.md, etc.)

---

**Remember:** WCAG provides the "what" (requirements), this guide provides the "how" (mobile implementation).
