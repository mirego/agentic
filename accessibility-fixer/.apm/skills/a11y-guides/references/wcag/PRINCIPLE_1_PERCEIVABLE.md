# WCAG 2.2 Principle 1: Perceivable
## Information and user interface components must be presentable to users in ways they can perceive

---

## Guideline 1.1 Text Alternatives

**Provide text alternatives for any non-text content so that it can be changed into other forms people need, such as large print, braille, speech, symbols or simpler language.**

### 1.1.1 Non-text Content (Level A)

**Criterion:**
All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.

**Mobile/Native App Interpretation:**
- Images: Use `contentDescription` (Android), `accessibilityLabel` (iOS), `accessibilityLabel` (React Native), `Semantics` (Flutter)
- Icons in buttons: Must have descriptive labels
- Graphs/charts: Provide text summary of data
- Decorative images: Mark as `importantForAccessibility="no"` or `isAccessibilityElement = false`

**Common Violations:**
- ImageView/ImageButton without contentDescription
- Icon-only buttons without labels
- Charts without text alternatives
- Background images that convey information

**Testing:**
- Enable screen reader (TalkBack/VoiceOver)
- Navigate to all images and icons
- Verify meaningful content is announced
- Verify decorative images are skipped

---

## Guideline 1.2 Time-based Media

**Provide alternatives for time-based media.**

### 1.2.1 Audio-only and Video-only (Prerecorded) (Level A)

**Criterion:**
For prerecorded audio-only and prerecorded video-only media, provide alternatives (transcripts or audio descriptions).

**Mobile/Native App Interpretation:**
- Audio-only content: Provide text transcript
- Video-only (no audio): Provide audio description or text transcript
- Ensure alternatives are easily discoverable

**Common Violations:**
- Podcast/audio without transcript
- Silent video tutorials without description
- Audio instructions without text alternative

### 1.2.2 Captions (Prerecorded) (Level A)

**Criterion:**
Captions are provided for all prerecorded audio content in synchronized media.

**Mobile/Native App Interpretation:**
- Video players must support captions/subtitles
- Captions should be enabled by default or easily accessible
- Use platform caption styling preferences (Android, iOS)

**Common Violations:**
- Videos without captions
- Auto-generated captions not reviewed for accuracy
- Caption controls not accessible

### 1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A)

**Criterion:**
An alternative for time-based media or audio description is provided for prerecorded video content.

**Mobile/Native App Interpretation:**
- Provide audio description track for videos
- Or provide detailed text transcript including visual information
- Make alternatives easy to find and access

### 1.2.4 Captions (Live) (Level AA)

**Criterion:**
Captions are provided for all live audio content in synchronized media.

**Mobile/Native App Interpretation:**
- Live streams must have real-time captions
- Use platform caption support (Android CaptioningManager, iOS)
- Provide clear way to enable/disable captions

### 1.2.5 Audio Description (Prerecorded) (Level AA)

**Criterion:**
Audio description is provided for all prerecorded video content.

**Mobile/Native App Interpretation:**
- Video players should support audio description tracks
- Provide clear toggle for audio descriptions
- Follow platform audio description APIs

---

## Guideline 1.3 Adaptable

**Create content that can be presented in different ways (for example simpler layout) without losing information or structure.**

### 1.3.1 Info and Relationships (Level A)

**Criterion:**
Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.

**Mobile/Native App Interpretation:**
- Use semantic components (heading vs plain text)
- Group related form fields with proper labels
- Use accessibility grouping for related content
- Maintain logical heading hierarchy
- Use proper role annotations (button, heading, list, etc.)
- Collection items should be properly grouped

**Common Violations:**
- Using plain text styled to look like headings instead of actual heading semantics
- Form inputs without associated labels
- Related content not grouped for screen readers
- Lists not marked up as lists
- Tables without proper structure
- Collection items not grouped (see COLLECTION_ITEMS_PATTERN.md)
- Buttons styled as tabs without proper role

**Platform-Specific:**
- **Android XML:** Use `TextView` with `android:accessibilityHeading="true"`, `ViewGroup` with `android:screenReaderFocusable="true"`
- **Android Compose:** Use `Modifier.semantics { heading() }`, `mergeDescendants = true`
- **iOS:** Use `accessibilityTraits = .header`, `shouldGroupAccessibilityChildren`
- **React Native:** Use `accessibilityRole="header"`, group with `accessible={true}`
- **Flutter:** Use `Semantics(header: true)`, `MergeSemantics`

**Testing:**
- Navigate with screen reader
- Verify structure is announced correctly
- Check that groupings make logical sense
- Verify collection items are treated as single units

### 1.3.2 Meaningful Sequence (Level A)

**Criterion:**
When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.

**Mobile/Native App Interpretation:**
- Ensure focus order matches visual order
- Use proper layout ordering for screen readers
- For complex layouts, explicitly set accessibility traversal order
- Ensure dynamic content maintains logical order

**Common Violations:**
- Visual layout doesn't match focus order
- Floating elements confuse reading order
- Grid/flex layouts with incorrect accessibility order
- Modals/dialogs not focusing correctly

**Platform-Specific:**
- **Android:** Use `android:accessibilityTraversalBefore/After`, `importantForAccessibility`
- **iOS:** Override `accessibilityElements` array for custom order
- **Compose:** Arrange composables in logical order, use `Modifier.semantics { traversalIndex }`

**Testing:**
- Enable screen reader
- Navigate through UI linearly
- Verify order matches visual/logical flow

### 1.3.3 Sensory Characteristics (Level A)

**Criterion:**
Instructions provided for understanding and operating content do not rely solely on sensory characteristics.

**Mobile/Native App Interpretation:**
- Don't use only "the red button" - use "the Save button (red)"
- Don't use only "the item on the right" - use "the Settings option"
- Don't rely solely on shape, size, position, or sound
- Provide text alternatives for icon-only navigation

**Common Violations:**
- "Click the round button to continue"
- "See the information in the right column"
- "Listen for the beep to know it's ready"
- Color-coded status without text labels

**Testing:**
- Review all instructional text
- Ensure instructions work for blind users
- Check that audio cues have visual equivalents

### 1.3.4 Orientation (Level AA)

**Criterion:**
Content does not restrict its view and operation to a single display orientation unless a specific orientation is essential.

**Mobile/Native App Interpretation:**
- Support both portrait and landscape orientations
- Don't force orientation unless essential (e.g., camera scanning)
- Maintain functionality in both orientations
- Preserve state when rotating

**Common Violations:**
- App locked to portrait without reason
- Features broken in landscape mode
- Content cut off when rotated

**Platform-Specific:**
- **Android:** Don't use `android:screenOrientation="portrait"` unless essential
- **iOS:** Support all orientations in Info.plist unless essential

**Testing:**
- Rotate device in all screens
- Verify all content accessible in both orientations
- Check that state persists

### 1.3.5 Identify Input Purpose (Level AA)

**Criterion:**
The purpose of each input field collecting information about the user can be programmatically determined.

**Mobile/Native App Interpretation:**
- Use appropriate input types (email, phone, name, address)
- Set `autocomplete` equivalents (autofillHints Android, textContentType iOS)
- Help autofill systems understand field purpose

**Common Violations:**
- Email field with generic text input type
- Phone number without tel input type
- Name/address fields without autofill hints

**Platform-Specific:**
- **Android:** Use `android:autofillHints`, `android:inputType`
- **iOS:** Use `textContentType` (UITextContentType)
- **Web:** Use `autocomplete` attribute

**Testing:**
- Attempt to use system autofill
- Verify appropriate keyboards appear
- Check autofill suggestions are correct

---

## Guideline 1.4 Distinguishable

**Make it easier for users to see and hear content including separating foreground from background.**

### 1.4.1 Use of Color (Level A)

**Criterion:**
Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

**Mobile/Native App Interpretation:**
- Don't rely on color alone for status (add icons/text)
- Error states need more than just red color (add error icon and text)
- Links need more than color to be identifiable (underline or icon)
- Chart data needs patterns or labels, not just colors

**Common Violations:**
- Required fields marked only with red asterisk
- Error states shown only with red background
- Success/failure shown only with green/red color
- Form validation relying on color change only

**Testing:**
- View app in grayscale mode
- Verify all information is still understandable
- Check with color blindness simulators

### 1.4.2 Audio Control (Level A)

**Criterion:**
If any audio plays automatically for more than 3 seconds, provide mechanism to pause, stop, or control volume.

**Mobile/Native App Interpretation:**
- Auto-playing audio should have prominent pause/stop button
- Respect system audio controls
- Don't interfere with system audio (music, podcasts)
- Provide in-app volume control for long audio

**Common Violations:**
- Background music with no way to stop
- Video auto-plays without pause control
- Audio ads that can't be muted

**Testing:**
- Play background audio (music app)
- Open app and verify background audio isn't interrupted
- Check all auto-play audio has controls

### 1.4.3 Contrast (Minimum) (Level AA)

**Criterion:**
Visual presentation of text and images of text has contrast ratio of at least 4.5:1 (3:1 for large text).

**Mobile/Native App Interpretation:**
- Normal text (<18pt or <14pt bold): 4.5:1 minimum
- Large text (≥18pt or ≥14pt bold): 3:1 minimum
- Test in both light and dark modes
- Consider dynamic text scaling

**Common Violations:**
- Light gray text on white background
- White text on light blue
- Disabled controls with insufficient contrast (if they contain info)
- Placeholder text too light

**Tools:**
- WebAIM Contrast Checker
- Color Contrast Analyzer app
- Android Accessibility Scanner
- iOS Accessibility Inspector

**Testing:**
- Check all text colors against backgrounds
- Test in both light/dark modes
- Verify at different text sizes

### 1.4.4 Resize Text (Level AA)

**Criterion:**
Text can be resized up to 200% without loss of content or functionality.

**Mobile/Native App Interpretation:**
- Support system text size settings (Android, iOS)
- Use scalable units (sp on Android, Dynamic Type on iOS)
- Ensure UI adjusts when text size increases
- Don't truncate text at large sizes
- Test at maximum system text size

**Common Violations:**
- Text size hardcoded in pixels/points
- UI breaks at large text sizes
- Text truncated instead of wrapping
- Horizontal scrolling required at large sizes
- Overlapping text and controls

**Platform-Specific:**
- **Android:** Use `sp` units, test with "Font size" settings (see FONT_SCALING_SUPPORT.md)
- **iOS:** Support Dynamic Type with `UIFontMetrics` or `.font(.body)` in SwiftUI
- **React Native:** Use `PixelRatio.getFontScale()`
- **Flutter:** Use `MediaQuery.of(context).textScaleFactor`

**Testing:**
- Set system text size to maximum
- Navigate entire app
- Verify all text is readable and not truncated
- Check that controls remain usable

**See detailed guide:** [Font Scaling Support Pattern](../patterns/FONT_SCALING_SUPPORT.md)

### 1.4.5 Images of Text (Level AA)

**Criterion:**
Images of text are only used for decoration or where essential.

**Mobile/Native App Interpretation:**
- Use actual text instead of text in images
- Logos are exempt (essential use)
- Use system fonts with styling instead of image text
- If image text is necessary, provide text alternative

**Common Violations:**
- Buttons with text baked into images
- Styled headings as images
- Quotes or testimonials as images

**Testing:**
- Identify all images
- Check if any contain text that could be real text
- Verify text alternatives exist if unavoidable

### 1.4.10 Reflow (Level AA)

**Criterion:**
Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions.

**Mobile/Native App Interpretation:**
- Avoid horizontal scrolling (except where essential like maps, diagrams)
- Support both portrait and landscape
- Content should reflow when screen size changes
- No horizontal scrolling required for reading

**Common Violations:**
- Fixed-width content requiring horizontal scroll
- Tables that don't adapt to screen size
- Content not wrapping on smaller screens

**Testing:**
- Test on various screen sizes
- Rotate device
- Increase text size and verify no horizontal scrolling

### 1.4.11 Non-text Contrast (Level AA)

**Criterion:**
Visual presentation of UI components and graphical objects has contrast ratio of at least 3:1.

**Mobile/Native App Interpretation:**
- Buttons, form controls, focus indicators: 3:1 minimum
- Icons that convey information: 3:1 minimum
- Visual boundaries between components: 3:1 minimum
- Active/inactive states must be distinguishable

**Common Violations:**
- Light gray button borders on white
- Input field borders too light
- Focus indicators too faint
- Inactive tabs not distinguishable from background

**Testing:**
- Check all interactive elements
- Verify focus indicators visible
- Test form controls and their boundaries

### 1.4.12 Text Spacing (Level AA)

**Criterion:**
No loss of content or functionality when text spacing is adjusted.

**Mobile/Native App Interpretation:**
- Use flexible layouts that accommodate text expansion
- Don't set fixed heights on text containers
- Allow line height, letter spacing, word spacing to adjust
- Test with system text spacing settings if available

**Common Violations:**
- Text cut off when spacing increases
- Fixed-height containers causing overflow
- Overlapping text when spacing changes

**Testing:**
- Adjust system text spacing if available
- Increase text size and verify spacing adapts
- Check for text overflow or clipping

### 1.4.13 Content on Hover or Focus (Level AA)

**Criterion:**
Additional content that appears on hover or focus is dismissable, hoverable, and persistent.

**Mobile/Native App Interpretation:**
- Tooltips must be dismissable (without moving pointer/focus)
- Content must remain visible while user interacts with it
- Don't auto-dismiss tooltips too quickly
- Touch devices: ensure long-press tooltips are accessible

**Common Violations:**
- Tooltips that disappear immediately
- Hover content that can't be dismissed
- Tooltips that block other content

**Testing:**
- Trigger all tooltips and popovers
- Verify they can be dismissed
- Check timing is reasonable
- Test with keyboard and touch

---

## Quick Reference: Common Perceivable Issues by Platform

### Android
- **1.1.1:** Missing `contentDescription` on ImageView/ImageButton
- **1.3.1:** Collection items not grouped with `screenReaderFocusable`
- **1.4.3:** Color resources with insufficient contrast
- **1.4.4:** Text sizes in `dp` instead of `sp`

### iOS
- **1.1.1:** Missing `accessibilityLabel` on UIImageView/Image
- **1.3.1:** Missing `shouldGroupAccessibilityChildren` on collection cells
- **1.4.3:** Text colors with poor contrast
- **1.4.4:** Not supporting Dynamic Type

### Web
- **1.1.1:** `<img>` without `alt` attribute
- **1.3.1:** Divs used for headings without `role="heading"`
- **1.4.3:** CSS color combinations with poor contrast
- **1.4.4:** Fixed pixel sizes instead of relative units

### React Native
- **1.1.1:** `<Image>` without `accessibilityLabel`
- **1.3.1:** Missing `accessibilityRole` on components
- **1.4.4:** Text not respecting font scale

### Flutter
- **1.1.1:** Images without `Semantics` widget
- **1.3.1:** Missing `MergeSemantics` for grouped content
- **1.4.4:** Text not using scaled font sizes

---

## Related Guides
- [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)
- [Decorative Image Decision Tree](../patterns/DECORATIVE_IMAGE_DECISION_TREE.md)
- [Font Scaling Support](../patterns/FONT_SCALING_SUPPORT.md)
- [Common Issues Reference](../COMMON_ISSUES.md)

---

**Official WCAG 2.2 Reference:** https://www.w3.org/TR/WCAG22/#perceivable
**WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
