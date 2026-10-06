# Font Scaling Support Pattern
## Text Must Resize According to Platform Settings

---

## Overview

All text in your application must scale according to the user's platform font size preferences. Many users with visual impairments increase system font sizes to read content more comfortably. Apps that don't respect these settings create significant barriers.

**Critical Requirements by Platform:**
- **Android:** Use `sp` (scalable pixels) for text sizes, NEVER `dp`
- **iOS:** Support Dynamic Type with text styles
- **Web:** Support browser zoom and text scaling (up to 200%)
- **React Native:** Use scalable font units

---

## Why This Matters

**User Impact:**
- **Visual impairments:** Users with low vision need larger text
- **Age-related vision changes:** Older users commonly increase font sizes
- **Reading disabilities:** Some users need larger text for comprehension
- **Temporary impairments:** Eye strain, reading in bright light, etc.

**WCAG Success Criteria:**
- **1.4.4 Resize Text (Level AA):** Text can be resized up to 200% without loss of content or functionality
- **1.4.12 Text Spacing (Level AA):** No loss of content when text spacing is adjusted

**Statistics:**
- ~15-30% of mobile users adjust their system font size
- Default font size users are NOT the majority
- Failing this affects millions of users

---

## The Problem

### ❌ Bad Experience (Not Scalable)

**Android - Using `dp` instead of `sp`:**
```kotlin
Text(
    text = "Hello",
    fontSize = 16.dp  // ❌ WRONG: Will NOT scale with user settings
)
```

**Result:** User increases system font size to "Largest" → Text stays at 16dp → User cannot read the app

### ✅ Good Experience (Scalable)

**Android - Using `sp`:**
```kotlin
Text(
    text = "Hello",
    fontSize = 16.sp  // ✅ CORRECT: Scales with user settings
)
```

**Result:** User increases system font size to "Largest" → Text scales proportionally → User can read comfortably

---

## Platform Implementation

### Android (Jetpack Compose)

**❌ WRONG:**
```kotlin
// Using dp for text - DOES NOT SCALE
Text(
    text = "Welcome",
    fontSize = 20.dp,  // ❌ WRONG
    modifier = Modifier.padding(16.dp)
)

Text(
    text = "Description",
    fontSize = 14.dp   // ❌ WRONG
)
```

**✅ CORRECT:**
```kotlin
// Using sp for text - SCALES PROPERLY
Text(
    text = "Welcome",
    fontSize = 20.sp,  // ✅ CORRECT: Use sp for text
    modifier = Modifier.padding(16.dp)  // ✅ OK: dp for spacing is fine
)

Text(
    text = "Description",
    fontSize = 14.sp   // ✅ CORRECT
)

// Better: Use Material Theme typography
Text(
    text = "Welcome",
    style = MaterialTheme.typography.headlineMedium  // ✅ BEST
)

Text(
    text = "Description",
    style = MaterialTheme.typography.bodyMedium  // ✅ BEST
)
```

**Key Points:**
- ✅ Use `sp` for **ALL** `fontSize` values
- ✅ Use `dp` for spacing, padding, margins (non-text)
- ✅ Best practice: Use Material Theme typography styles
- ✅ Material Typography automatically uses `sp`

### Android (XML)

**❌ WRONG:**
```xml
<TextView
    android:text="Welcome"
    android:textSize="20dp" />  <!-- ❌ WRONG: dp instead of sp -->

<Button
    android:text="Submit"
    android:textSize="16dp" />  <!-- ❌ WRONG -->
```

**✅ CORRECT:**
```xml
<TextView
    android:text="Welcome"
    android:textSize="20sp" />  <!-- ✅ CORRECT: Use sp -->

<Button
    android:text="Submit"
    android:textSize="16sp" />  <!-- ✅ CORRECT -->

<!-- Better: Use text appearances -->
<TextView
    android:text="Welcome"
    android:textAppearance="?attr/textAppearanceHeadlineMedium" />  <!-- ✅ BEST -->

<TextView
    android:text="Description"
    android:textAppearance="?attr/textAppearanceBodyMedium" />  <!-- ✅ BEST -->
```

### iOS (SwiftUI)

**❌ WRONG:**
```swift
// Fixed font size - DOES NOT SCALE
Text("Welcome")
    .font(.system(size: 20))  // ❌ WRONG: Fixed size

Text("Description")
    .font(.system(size: 14))  // ❌ WRONG
```

**✅ CORRECT:**
```swift
// Using Dynamic Type - SCALES PROPERLY
Text("Welcome")
    .font(.title)  // ✅ CORRECT: Uses Dynamic Type

Text("Description")
    .font(.body)   // ✅ CORRECT

// Or with custom font that supports Dynamic Type
Text("Welcome")
    .font(.system(size: 20, design: .default))
    .dynamicTypeSize(.medium...(.accessibility5))  // ✅ CORRECT: Specify range

// Custom font with scaling
Text("Welcome")
    .font(.custom("CustomFont", size: 20, relativeTo: .title))  // ✅ CORRECT
```

**Dynamic Type Styles:**
```swift
.font(.largeTitle)     // Largest heading
.font(.title)          // Page titles
.font(.title2)         // Section titles
.font(.title3)         // Subsection titles
.font(.headline)       // Emphasized body text
.font(.body)           // Default body text
.font(.callout)        // Secondary content
.font(.subheadline)    // Tertiary content
.font(.footnote)       // Footnotes
.font(.caption)        // Small text
.font(.caption2)       // Smallest text
```

### iOS (UIKit)

**❌ WRONG:**
```swift
// Fixed font size - DOES NOT SCALE
let label = UILabel()
label.font = UIFont.systemFont(ofSize: 20)  // ❌ WRONG

let button = UIButton()
button.titleLabel?.font = UIFont.systemFont(ofSize: 16)  // ❌ WRONG
```

**✅ CORRECT:**
```swift
// Using Dynamic Type - SCALES PROPERLY
let label = UILabel()
label.font = UIFont.preferredFont(forTextStyle: .title1)  // ✅ CORRECT
label.adjustsFontForContentSizeCategory = true  // ✅ CRITICAL: Enable scaling

let bodyLabel = UILabel()
bodyLabel.font = UIFont.preferredFont(forTextStyle: .body)  // ✅ CORRECT
bodyLabel.adjustsFontForContentSizeCategory = true

// For multiline text that needs to grow
label.numberOfLines = 0  // ✅ IMPORTANT: Allow text to wrap
label.adjustsFontSizeToFitWidth = false  // ✅ Don't shrink, let it wrap

// Custom font with scaling
let customFont = UIFont(name: "CustomFont", size: 20)
let scaledFont = UIFontMetrics(forTextStyle: .title1).scaledFont(for: customFont!)  // ✅ CORRECT
label.font = scaledFont
label.adjustsFontForContentSizeCategory = true
```

**Text Styles (UIKit):**
```swift
.largeTitle
.title1
.title2
.title3
.headline
.body
.callout
.subheadline
.footnote
.caption1
.caption2
```

### Web (HTML/CSS)

**❌ WRONG:**
```css
/* Fixed pixel sizes - DOES NOT SCALE WELL */
.heading {
    font-size: 24px;  /* ❌ Poor: Doesn't scale with zoom */
}

.body {
    font-size: 16px;  /* ❌ Poor */
}
```

**✅ CORRECT:**
```css
/* Relative units - SCALES PROPERLY */
:root {
    font-size: 16px;  /* Base size, OK to be fixed */
}

.heading {
    font-size: 1.5rem;  /* ✅ CORRECT: 24px at base, scales with user settings */
}

.body {
    font-size: 1rem;    /* ✅ CORRECT: 16px at base */
}

.small {
    font-size: 0.875rem;  /* ✅ CORRECT: 14px at base */
}

/* Also good: em units (relative to parent) */
.nested {
    font-size: 1.2em;  /* ✅ CORRECT: 120% of parent */
}
```

**Best Practices (Web):**
```css
/* Use rem for consistent scaling */
html {
    font-size: 100%;  /* Respects user's browser settings */
}

body {
    font-size: 1rem;  /* ✅ Base body text */
}

h1 { font-size: 2.5rem; }    /* ✅ 40px at default */
h2 { font-size: 2rem; }      /* ✅ 32px at default */
h3 { font-size: 1.75rem; }   /* ✅ 28px at default */
h4 { font-size: 1.5rem; }    /* ✅ 24px at default */
h5 { font-size: 1.25rem; }   /* ✅ 20px at default */
h6 { font-size: 1rem; }      /* ✅ 16px at default */

/* Support up to 200% zoom without horizontal scrolling */
@media (max-width: 768px) {
    /* Adjust as needed for mobile */
}
```

### React Native

**❌ WRONG:**
```javascript
// Fixed sizes - MAY NOT SCALE PROPERLY
<Text style={{ fontSize: 20 }}>  {/* ❌ May not scale */}
    Welcome
</Text>
```

**✅ CORRECT:**
```javascript
import { Text, StyleSheet, PixelRatio } from 'react-native';

// Use PixelRatio for scalable fonts
const styles = StyleSheet.create({
    title: {
        fontSize: PixelRatio.getFontScale() * 20,  // ✅ Scales with system
    },
    body: {
        fontSize: PixelRatio.getFontScale() * 16,  // ✅ Scales with system
    }
});

// Or use a scaling function
const scaleFontSize = (size) => size * PixelRatio.getFontScale();

<Text style={{ fontSize: scaleFontSize(20) }}>  {/* ✅ CORRECT */}
    Welcome
</Text>

// Better: Use libraries like react-native-responsive-fontsize
import { RFValue } from "react-native-responsive-fontsize";

<Text style={{ fontSize: RFValue(20) }}>  {/* ✅ BEST */}
    Welcome
</Text>
```

### Flutter

**❌ WRONG:**
```dart
// Fixed text size without scaling
Text(
  'Welcome',
  style: TextStyle(fontSize: 20),  // ❌ May not scale properly
)
```

**✅ CORRECT:**
```dart
// Respects platform text scaling
Text(
  'Welcome',
  style: TextStyle(fontSize: 20),  // ✅ Flutter automatically scales by default
  textScaleFactor: MediaQuery.of(context).textScaleFactor,  // ✅ Explicit scaling
)

// Or use Theme typography (best practice)
Text(
  'Welcome',
  style: Theme.of(context).textTheme.headlineMedium,  // ✅ BEST
)

// Set maximum scale factor if needed for layout constraints
MediaQuery(
  data: MediaQuery.of(context).copyWith(
    textScaleFactor: MediaQuery.of(context).textScaleFactor.clamp(1.0, 2.0),
  ),
  child: Text('Welcome'),
)
```

---

## Detection Patterns

### Android Code Review

**Search for:**
```
fontSize.*\.dp
textSize="[0-9]+dp"
```

**Examples to flag:**
```kotlin
fontSize = 16.dp          // ❌ Flag this
fontSize = 20.dp          // ❌ Flag this
android:textSize="18dp"   // ❌ Flag this
```

**Valid patterns:**
```kotlin
fontSize = 16.sp          // ✅ Good
fontSize = 20.sp          // ✅ Good
android:textSize="18sp"   // ✅ Good
style = MaterialTheme.typography.bodyLarge  // ✅ Good
```

### iOS Code Review

**Search for:**
```swift
UIFont.systemFont(ofSize:
UIFont(name:.*size:
.font(.system(size:
```

**Check if:**
- UIKit: `adjustsFontForContentSizeCategory = true` is set
- SwiftUI: Using `.font(.title)`, `.font(.body)`, etc. instead of fixed sizes

### Web Code Review

**Search for:**
```css
font-size:.*px;
font-size:.*pt;
```

**Prefer:**
```css
font-size:.*rem;
font-size:.*em;
font-size:.*%;
```

---

## Testing Checklist

### Android Testing

1. **Increase System Font Size:**
   - Settings → Display → Font size → Largest
   - Settings → Accessibility → Font size → Largest

2. **Test All Screens:**
   - [ ] All text increases proportionally
   - [ ] No text is cut off
   - [ ] Layouts adapt to larger text
   - [ ] Buttons and touch targets remain usable
   - [ ] No horizontal scrolling required
   - [ ] Multi-line text wraps properly

3. **Common Issues to Check:**
   - [ ] Text doesn't overlap other elements
   - [ ] Container heights adjust for larger text
   - [ ] Scrollable content remains scrollable
   - [ ] Fixed-height containers don't clip text

### iOS Testing

1. **Increase Dynamic Type:**
   - Settings → Accessibility → Display & Text Size → Larger Text
   - Drag slider to maximum (XXXL or Accessibility sizes)

2. **Test All Screens:**
   - [ ] All text scales appropriately
   - [ ] Layouts adapt without breaking
   - [ ] Navigation remains functional
   - [ ] Buttons remain tappable
   - [ ] No content is cut off or hidden

3. **Test Accessibility Sizes:**
   - [ ] Test with Accessibility Extra Large (AX1-AX5)
   - [ ] Ensure text doesn't truncate
   - [ ] Verify multiline labels wrap

### Web Testing

1. **Browser Zoom:**
   - Zoom to 200% (Cmd/Ctrl + +)
   - Ensure all content is readable
   - No horizontal scrolling on mobile viewports

2. **Browser Text Size:**
   - Browser Settings → Font size → Largest/Very Large
   - Test all pages

3. **Test Requirements:**
   - [ ] Text zooms to 200% without loss of content
   - [ ] No horizontal scrolling at 200% zoom
   - [ ] All functionality remains available
   - [ ] Touch/click targets remain usable

---

## Common Mistakes

### Mistake 1: Using dp instead of sp (Android)

**Wrong:**
```kotlin
Text(text = "Hello", fontSize = 16.dp)
```

**Correct:**
```kotlin
Text(text = "Hello", fontSize = 16.sp)
```

### Mistake 2: Fixed Sizes Without Dynamic Type (iOS)

**Wrong:**
```swift
Text("Hello").font(.system(size: 16))
```

**Correct:**
```swift
Text("Hello").font(.body)
```

### Mistake 3: Using Pixels Instead of Relative Units (Web)

**Wrong:**
```css
font-size: 16px;
```

**Correct:**
```css
font-size: 1rem;
```

### Mistake 4: Fixed Container Heights

**Wrong:**
```kotlin
Box(modifier = Modifier.height(50.dp)) {
    Text("Long text that might wrap", fontSize = 16.sp)
}
```

**Correct:**
```kotlin
Box(modifier = Modifier.heightIn(min = 50.dp)) {  // Minimum height, can grow
    Text("Long text that might wrap", fontSize = 16.sp)
}

// Or better: Use wrapContentHeight
Box(modifier = Modifier.wrapContentHeight()) {
    Text("Long text that might wrap", fontSize = 16.sp)
}
```

### Mistake 5: Not Allowing Multiline Text

**Wrong:**
```kotlin
Text(
    text = "Long text",
    fontSize = 16.sp,
    maxLines = 1  // ❌ Will truncate when text is scaled
)
```

**Correct:**
```kotlin
Text(
    text = "Long text",
    fontSize = 16.sp,
    maxLines = Int.MAX_VALUE  // ✅ Or appropriate number for context
)

// Or if truncation is necessary, ensure it's at a reasonable line count
Text(
    text = "Long text",
    fontSize = 16.sp,
    maxLines = 3  // ✅ Allow multiple lines before truncating
)
```

---

## Audit Report Template

**Title:** Text sizes do not scale with system font settings

**Severity:** High

**WCAG SC Violated:**
- **Primary:** 1.4.4 Resize Text (Level AA)
- **Secondary:** 1.4.12 Text Spacing (Level AA)

**Description:**
Text in the application uses fixed units that do not scale with the user's system font size preferences, preventing users with visual impairments from reading content comfortably.

**Impact:**
- Users with low vision cannot increase text size
- Older users who need larger text cannot read the app
- Affects 15-30% of users who adjust system font sizes
- Creates significant barrier to accessibility

**Location:**
- File: `HomeScreen.kt`
- Line: 45
- Component: Welcome message text

**Current Code:**
```kotlin
Text(
    text = "Welcome to the app",
    fontSize = 20.dp,  // ❌ Using dp instead of sp
    modifier = Modifier.padding(16.dp)
)
```

**Recommended Fix:**
```kotlin
Text(
    text = "Welcome to the app",
    fontSize = 20.sp,  // ✅ Use sp for scalable text
    modifier = Modifier.padding(16.dp)  // dp is fine for spacing
)

// Better: Use Material Theme typography
Text(
    text = "Welcome to the app",
    style = MaterialTheme.typography.titleLarge,  // ✅ BEST
    modifier = Modifier.padding(16.dp)
)
```

**Testing:**
1. Go to Settings → Display → Font size → Set to Largest
2. Open the app and navigate to the screen
3. Verify text scales proportionally with system settings

**Expected Behavior:**
- Text should scale smoothly from small to largest system settings
- Layouts should adapt to accommodate larger text
- No content should be cut off or hidden
- All functionality remains available at all text sizes

---

## Best Practices Summary

### Android
✅ **Always use `sp` for text sizes, never `dp`**
✅ Use Material Theme typography styles when possible
✅ Allow multiline text for labels that might wrap
✅ Use `heightIn(min = ...)` instead of fixed `height()` for containers
✅ Test with largest system font size setting

### iOS
✅ **Use Dynamic Type text styles** (`.font(.body)`, `.font(.title)`, etc.)
✅ Set `adjustsFontForContentSizeCategory = true` in UIKit
✅ Allow labels to have `numberOfLines = 0` for wrapping
✅ Test with Accessibility Extra Large sizes (AX1-AX5)

### Web
✅ **Use `rem` or `em` units, not `px`**
✅ Set base font size to respect user preferences (`font-size: 100%`)
✅ Support 200% zoom without horizontal scrolling
✅ Test with browser zoom and browser font size settings

### All Platforms
✅ **Never use fixed pixel sizes for text**
✅ Always respect platform text scaling settings
✅ Allow text to wrap instead of truncating
✅ Use flexible layouts that adapt to content size
✅ Test with maximum system font sizes

---

## WCAG Success Criteria

**1.4.4 Resize Text (Level AA)**
- Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality

**1.4.12 Text Spacing (Level AA)**
- No loss of content or functionality occurs when text spacing is adjusted

**Supporting Criteria:**
- **1.4.10 Reflow (Level AA):** Content reflows without horizontal scrolling at 320px width
- **1.3.4 Orientation (Level AA):** Content adapts to portrait and landscape

---

## Resources

**Android:**
- [Material Design - Scalable Pixels (sp)](https://developer.android.com/training/multiscreen/screendensities#TaskUseDP)
- [Compose Typography](https://developer.android.com/jetpack/compose/text/typography)

**iOS:**
- [Dynamic Type](https://developer.apple.com/documentation/uikit/uifont/scaling_fonts_automatically)
- [Text Styles](https://developer.apple.com/design/human-interface-guidelines/typography)

**Web:**
- [WCAG 1.4.4 Understanding Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [CSS rem unit](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
