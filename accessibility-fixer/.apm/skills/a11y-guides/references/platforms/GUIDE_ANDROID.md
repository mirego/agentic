# Android Accessibility Audit Guide
## XML Layouts, Jetpack Compose, Mobile & TV

---

## Overview

This guide covers accessibility auditing for Android applications using:
- XML layouts
- Jetpack Compose
- Android Views and ViewGroups
- Material Design components
- Android TV & Fire TV interfaces

**Platform Coverage:** Android mobile, tablets, Android TV, and Amazon Fire TV (Fire OS)

**Target:** WCAG 2.2 Level AA compliance adapted for mobile

---

## ⚠️ CRITICAL AUDIT REPORT REQUIREMENTS

**Issue Ordering in Reports:**
1. **ALWAYS order by severity**: Critical → High → Medium → Low
2. **NEVER order by location** or discovery order
3. Within each severity, order by WCAG SC or logical grouping

**Report Content Policy:**
- **ONLY report issues and problems**
- **DO NOT include positive findings** or mention things that work correctly
- **DO NOT say "good practice observed"** or similar
- If something is implemented correctly, omit it from the report entirely
- Focus exclusively on what needs to be fixed

---

## Guide Navigation

This is the **core Android accessibility audit guide** covering common issues you'll encounter in most audits.

**Specialized guides for advanced topics:**
- **[ANDROID_CUSTOM_VIEWS.md](ANDROID_CUSTOM_VIEWS.md)** - Custom views accessibility deep dive
  - Use when: App has custom views extending from `View`, complex multi-region controls
- **[ANDROID_ADVANCED.md](ANDROID_ADVANCED.md)** - Advanced topics (gestures, media)
  - Use when: App has swipe gestures, drag-and-drop, video/audio content
- **[GUIDE_ANDROID_TV.md](GUIDE_ANDROID_TV.md)** - Android TV & Fire TV specific patterns
  - Use when: Auditing 10-foot UI, D-pad navigation, or TV applications

**Focus of this guide:** Common accessibility patterns for standard Android apps.

---

## Technology Focus

### Core Android Technologies
- **XML Layouts:** Traditional View-based UI
- **Jetpack Compose:** Modern declarative UI
- **Material Components:** Material Design library
- **TalkBack:** Android screen reader
- **Accessibility APIs:** ContentDescription, semantics, focus management

---

## ⚠️ CRITICAL: Avoid Redundant Information in Accessible Labels

> 📖 **See comprehensive pattern guide:** [Avoid Redundant Information](patterns/AVOID_ROLE_IN_LABEL.md)

**THE MOST COMMON ACCESSIBILITY MISTAKE:** Adding information to contentDescription/semantics that components already announce automatically.

### Four Types of Redundancy to NEVER Include:

1. **❌ Role Redundancy** - "Submit button", "Home tab", "Email input field"
   - Components announce their role automatically
   - ❌ WRONG: `contentDescription = "Close button"` → TalkBack: "Close button, button"
   - ✅ CORRECT: Button text "Close" → TalkBack: "Close, button"

2. **❌ State Redundancy** - Adding state to stateDescription when component announces it
   - Tabs, Switches, Toggles, Checkboxes announce state automatically
   - ❌ WRONG: Tab with `stateDescription = "Selected"` → TalkBack: "Home, tab, selected, selected"
   - ✅ CORRECT: `Tab(selected = true)` → TalkBack: "Home, tab, 1 of 4, selected"
   - ❌ WRONG: Switch with `stateDescription = "On"` → TalkBack: "Dark mode, switch, on, on"
   - ✅ CORRECT: `Switch(checked = true)` → TalkBack: "Dark mode, switch, on"
   - ⚠️ EXCEPTION: Sliders NEED stateDescription for custom value formatting

3. **❌ Position Redundancy** - Adding "1 of 4" or similar to contentDescription
   - Tab components announce position automatically
   - ❌ WRONG: `contentDescription = "Home, 1 of 4"` → TalkBack: "Home, 1 of 4, tab, 1 of 4"
   - ✅ CORRECT: Let Tab component handle position announcement

4. **❌ Property/Context Redundancy** - Duplicating visible text or obvious context
   - ❌ WRONG: TextField with `contentDescription = "Username input field"` (redundant "input field")
   - ✅ CORRECT: TextField with label "Username" → TalkBack: "Username, text field"
   - ❌ WRONG: Button with `contentDescription = "Pause stopwatch"` when text says "Pause"
   - ✅ CORRECT: Button text "Pause" → TalkBack: "Pause, button"

### Quick Rules:
- **Use `selected` semantic property** for selection state, NOT text in contentDescription
- **NEVER add stateDescription** to Switches, Tabs, standard components (they announce automatically)
- **ONLY use stateDescription** for custom value formatting (sliders: "50 percent")
- **Don't duplicate visible text** in contentDescription
- **Let native components handle** role, state, and position announcements

---

## Key Code Patterns to Check

### 1. Content Descriptions - IMPORTANT: Check Collection Context First

> 📖 **See pattern guide for decorative images:** [Decorative Image Decision Tree](patterns/DECORATIVE_IMAGE_DECISION_TREE.md)

**⚠️ CRITICAL:** Before flagging missing contentDescription, determine if the element is part of a collection item (RecyclerView item, LazyColumn card, grid cell).

**Decision Tree:**
1. **Is this element part of a collection item (card/tile in a list/grid)?**
   - YES → Skip to Section 10 (Collection Items) - merge at parent level, mark children as not important
   - NO → Continue to step 2

2. **Is this image clearly decorative?** (gradient, background, border, divider, shadow)
   - YES → Skip reporting, don't include in audit
   - UNSURE → Create LOW priority issue, note "fix only if not decorative"
   - NO (conveys information) → Continue to step 3
   - **See pattern guide above for complete triage process and platform-specific examples**

3. **Is this the ONLY content in a button/clickable element?**
   - YES → CRITICAL issue, MUST have contentDescription
   - NO → Apply standard contentDescription rules below

4. **Is this element standalone (not in a collection)?**
   - YES → Require contentDescription as shown below

**Issue:** Missing contentDescription on **standalone** interactive elements

```xml
<!-- ❌ ISSUE: Missing contentDescription on standalone ImageButton -->
<ImageButton
    android:id="@+id/playButton"
    android:src="@drawable/ic_play"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<!-- ✅ CORRECT: Descriptive contentDescription (standalone button) -->
<ImageButton
    android:id="@+id/playButton"
    android:src="@drawable/ic_play"
    android:contentDescription="@string/play_button"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<!-- ✅ CORRECT: Decorative image -->
<ImageView
    android:src="@drawable/decorative_border"
    android:importantForAccessibility="no"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
```

**❌ DO NOT flag for missing contentDescription:**
- Images/icons/buttons inside RecyclerView items, LazyColumn cards, or grid cells
- Sub-views of collection items that will be merged (see Section 10)
- Elements that are part of a larger grouped component

**✅ DO flag for missing contentDescription:**
- Images that are the ONLY content in buttons (CRITICAL priority)
- Standalone interactive icons not part of collections
- Top-level navigation elements
- Floating action buttons
- Toolbar icons
- Dialog buttons
- Images conveying information (logos with brand identity, status icons, etc.)

**🎨 Clearly Decorative - DON'T Report:**
- Gradient overlays (e.g., `@drawable/gradient_landscape_down_blue`)
- Background images that are purely aesthetic
- Decorative borders or dividers
- Shadow/elevation images
- Pattern backgrounds
- Decorative spacer images

**❓ Unsure if Decorative - LOW Priority:**
- Images that might convey branding but information is elsewhere
- Corner badges/logos when channel info is in text
- Decorative indicators when status is conveyed through text
- **Recommendation text:** "Verify if this image is decorative. If so, mark as `importantForAccessibility='no'`. If it conveys information, add appropriate contentDescription."

**WCAG SC:** 1.1.1 Non-text Content (Level A), 4.1.2 Name, Role, Value (Level A)

**String Resources:**
```xml
<!-- res/values/strings.xml -->
<string name="play_button">Play</string>
<string name="pause_button">Pause</string>
<string name="close_button">Close</string>
```

---

### 2. Content Descriptions (Jetpack Compose)

**Issue:** Missing semantics in Compose

```kotlin
// ❌ ISSUE: Missing content description
Icon(
    painter = painterResource(R.drawable.ic_play),
    contentDescription = null
)

// ✅ CORRECT: Descriptive content description
Icon(
    painter = painterResource(R.drawable.ic_play),
    contentDescription = stringResource(R.string.play_button)
)

// ✅ CORRECT: Decorative icon
Icon(
    painter = painterResource(R.drawable.decorative),
    contentDescription = null,
    modifier = Modifier.semantics {
        contentDescription = "" // Explicitly marks as decorative
    }
)

// Or use clearAndSetSemantics to completely hide from TalkBack
Icon(
    painter = painterResource(R.drawable.decorative),
    contentDescription = null,
    modifier = Modifier.clearAndSetSemantics {}
)
```

**WCAG SC:** 1.1.1 Non-text Content (Level A), 4.1.2 Name, Role, Value (Level A)

---

### 3. Touch Target Sizes

**Issue:** Touch targets smaller than minimum size

```xml
<!-- ❌ ISSUE: Touch target too small (32dp) -->
<Button
    android:layout_width="32dp"
    android:layout_height="32dp"
    android:text="X" />

<!-- ✅ CORRECT: Minimum 48dp touch target -->
<Button
    android:layout_width="48dp"
    android:layout_height="48dp"
    android:text="X" />

<!-- ✅ CORRECT: Use minWidth/minHeight for smaller visual with proper touch area -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:minWidth="48dp"
    android:minHeight="48dp"
    android:text="X" />
```

**Compose:**
```kotlin
// ❌ ISSUE: Small touch target
IconButton(
    onClick = { /*...*/  },
    modifier = Modifier.size(32.dp)
) {
    Icon(Icons.Default.Close, "Close")
}

// ✅ CORRECT: Minimum 48dp
IconButton(
    onClick = { /*...*/ },
    modifier = Modifier.size(48.dp)
) {
    Icon(Icons.Default.Close, "Close")
}

// ✅ CORRECT: Visual size different from touch target
Box(
    modifier = Modifier
        .size(48.dp) // Touch target
        .clickable { /*...*/ }
        .semantics { contentDescription = "Close" },
    contentAlignment = Alignment.Center
) {
    Icon(
        Icons.Default.Close,
        contentDescription = null,
        modifier = Modifier.size(24.dp) // Visual size
    )
}
```

**WCAG SC:** 2.5.8 Target Size (Minimum) (Level AA)

**Requirements:** Minimum 48dp × 48dp

---

### 4. Text Sizes Must Use sp (Scalable Pixels)

**⚠️ CRITICAL:** All text sizes MUST use `sp` (scalable pixels), NEVER `dp` (density-independent pixels).

**Issue:** Text using `dp` instead of `sp` does not scale with user's system font size settings.

**Impact:**
- 15-30% of users adjust system font sizes
- Users with low vision cannot read the app
- Violates WCAG 1.4.4 Resize Text (Level AA)
- Creates significant accessibility barrier

**XML:**
```xml
<!-- ❌ CRITICAL ISSUE: Using dp for text size -->
<TextView
    android:text="Welcome"
    android:textSize="20dp" />  <!-- WRONG: dp does not scale -->

<Button
    android:text="Submit"
    android:textSize="16dp" />  <!-- WRONG: dp does not scale -->

<!-- ✅ CORRECT: Using sp for text size -->
<TextView
    android:text="Welcome"
    android:textSize="20sp" />  <!-- CORRECT: sp scales with system settings -->

<Button
    android:text="Submit"
    android:textSize="16sp" />  <!-- CORRECT: sp scales -->

<!-- ✅ BEST: Use text appearances (automatically use sp) -->
<TextView
    android:text="Welcome"
    android:textAppearance="?attr/textAppearanceHeadlineMedium" />

<TextView
    android:text="Description"
    android:textAppearance="?attr/textAppearanceBodyMedium" />
```

**Jetpack Compose:**
```kotlin
// ❌ CRITICAL ISSUE: Using dp for text
Text(
    text = "Welcome",
    fontSize = 20.dp  // WRONG: Will NOT scale with user settings
)

Text(
    text = "Description",
    fontSize = 14.dp  // WRONG
)

// ✅ CORRECT: Using sp for text
Text(
    text = "Welcome",
    fontSize = 20.sp  // CORRECT: Scales with system settings
)

Text(
    text = "Description",
    fontSize = 14.sp  // CORRECT
)

// ✅ BEST: Use Material Theme typography (automatically uses sp)
Text(
    text = "Welcome",
    style = MaterialTheme.typography.headlineMedium  // BEST practice
)

Text(
    text = "Description",
    style = MaterialTheme.typography.bodyMedium  // BEST practice
)
```

**Detection Pattern:**

Search codebase for:
```
fontSize.*\.dp
textSize="[0-9]+dp"
```

**Fix:**
1. Change all `fontSize = X.dp` to `fontSize = X.sp`
2. Change all `android:textSize="Xdp"` to `android:textSize="Xsp"`
3. Better: Use Material Theme typography styles
4. Ensure text can wrap (use `maxLines` appropriately or no limit)
5. Use flexible container heights (`heightIn(min = ...)` instead of fixed `height()`)

**Testing:**
1. Go to Settings → Display → Font size → Set to "Largest"
2. Open the app
3. Verify:
   - [ ] All text increases proportionally
   - [ ] No text is cut off or overlaps
   - [ ] Layouts adapt to larger text
   - [ ] Buttons remain tappable
   - [ ] Scrollable content still scrolls

**WCAG SC:**
- **Primary:** 1.4.4 Resize Text (Level AA)
- **Secondary:** 1.4.12 Text Spacing (Level AA)

**Severity:** High (affects 15-30% of users)

**See full guide:** `guides/patterns/FONT_SCALING_SUPPORT.md`

---

### 5. Form Input Labels (XML)

**Issue:** EditText with only hint, no persistent label

```xml
<!-- ❌ ISSUE: Placeholder used as label -->
<EditText
    android:id="@+id/emailInput"
    android:hint="Email address"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

<!-- ✅ CORRECT: TextInputLayout provides persistent label -->
<com.google.android.material.textfield.TextInputLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Email address">

    <com.google.android.material.textfield.TextInputEditText
        android:id="@+id/emailInput"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inputType="textEmailAddress" />

</com.google.android.material.textfield.TextInputLayout>

<!-- ✅ CORRECT: Manual label with labelFor -->
<TextView
    android:id="@+id/emailLabel"
    android:text="Email address"
    android:labelFor="@id/emailInput"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<EditText
    android:id="@+id/emailInput"
    android:hint="example@email.com"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
```

**Compose:**
```kotlin
// ❌ ISSUE: No label
OutlinedTextField(
    value = email,
    onValueChange = { email = it }
)

// ✅ CORRECT: With label
OutlinedTextField(
    value = email,
    onValueChange = { email = it },
    label = { Text("Email address") }
)

// ✅ CORRECT: Alternative with explicit semantics
OutlinedTextField(
    value = email,
    onValueChange = { email = it },
    modifier = Modifier.semantics {
        contentDescription = "Email address"
    }
)
```

**WCAG SC:** 3.3.2 Labels or Instructions (Level A), 1.3.1 Info and Relationships (Level A)

---

### 6. Clickable Custom Views

**Issue:** Custom view with click listener but no accessibility setup

```kotlin
// ❌ ISSUE: Custom view not marked as clickable/focusable
customView.setOnClickListener { handleClick() }

// ✅ CORRECT: Proper accessibility setup
customView.apply {
    isClickable = true
    isFocusable = true
    contentDescription = "Custom action button"
    setOnClickListener { handleClick() }
}

// ✅ CORRECT: With ViewCompat for better compatibility
ViewCompat.setAccessibilityDelegate(customView, object : AccessibilityDelegateCompat() {
    override fun onInitializeAccessibilityNodeInfo(
        host: View,
        info: AccessibilityNodeInfoCompat
    ) {
        super.onInitializeAccessibilityNodeInfo(host, info)
        info.addAction(AccessibilityNodeInfoCompat.AccessibilityActionCompat.ACTION_CLICK)
        info.isClickable = true
    }
})
```

**Compose:**
```kotlin
// ❌ ISSUE: Clickable without semantics
Box(modifier = Modifier.clickable { handleClick() }) {
    Text("Custom button")
}

// ✅ CORRECT: With proper role
Box(
    modifier = Modifier
        .clickable { handleClick() }
        .semantics {
            role = Role.Button
            contentDescription = "Custom action button"
        }
) {
    Text("Custom button")
}
```

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 7. Headings and Structure (Compose)

**Issue:** Section titles not marked as headings

```kotlin
// ❌ ISSUE: No heading structure
Text("Section Title")

// ✅ CORRECT: Marked as heading
Text(
    "Section Title",
    style = MaterialTheme.typography.headlineMedium,
    modifier = Modifier.semantics {
        heading()
    }
)

// ✅ CORRECT: Compose Material 3
Text(
    "Section Title",
    style = MaterialTheme.typography.titleLarge,
    modifier = Modifier.semantics { heading() }
)
```

**XML:**
```xml
<!-- ✅ CORRECT: Mark TextView as heading -->
<TextView
    android:id="@+id/sectionTitle"
    android:text="Section Title"
    android:textAppearance="@style/TextAppearance.MaterialComponents.Headline5"
    android:accessibilityHeading="true"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

**Kotlin (ViewBinding):**
```kotlin
// For API 28+
binding.sectionTitle.isAccessibilityHeading = true

// For backward compatibility
ViewCompat.setAccessibilityHeading(binding.sectionTitle, true)
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.6 Headings and Labels (Level AA)

---

### 8. Accessibility Actions for Gestures

> 📖 **See advanced guide:** [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md#accessibility-actions-for-gestures)

**Issue:** Gestures (swipe, drag-and-drop, pinch) without equivalent accessibility actions

**⚠️ CRITICAL:** All gestures MUST have equivalent accessibility actions for users who cannot perform the gesture.

**Quick Check:**
- Does the app use swipe-to-delete or swipe-to-archive?
- Does it have drag-and-drop reordering?
- Are there custom gestures (pinch, multi-finger)?

**If YES:** See [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md) for full implementation details.

**Quick Fix:**
```kotlin
// Add custom accessibility actions
ViewCompat.addAccessibilityAction(view, "Delete") { _, _ ->
    deleteItem()
    true
}
```

**WCAG SC:** 2.5.1 Pointer Gestures (Level A), 2.1.1 Keyboard (Level A)

---

### 9. Custom Views Accessibility

> 📖 **See complete guide:** [ANDROID_CUSTOM_VIEWS.md](ANDROID_CUSTOM_VIEWS.md)

**Issue:** Custom views without proper accessibility implementation

**⚠️ CRITICAL:** Custom views require special attention to accessibility. Most apps use standard components and won't need this section.

**When to use the custom views guide:**
- ✅ App has views extending directly from `View`
- ✅ Complex controls with multiple sub-regions (calendars, charts, grids)
- ✅ Custom touch handling or gesture recognition
- ❌ Standard Material components (Button, TextField, etc.) - use sections above

**Quick Principles:**

1. **Extend from most specific widget**, not from `View`
   ```kotlin
   // ✅ CORRECT
   class CustomButton(context: Context) : Button(context) {
       // Inherits all Button accessibility
   }
   ```

2. **Override accessibility methods** when extending `View`
   - `onInitializeAccessibilityNodeInfo()` - Set role, state, actions
   - `performAccessibilityAction()` - Handle actions
   - `performClick()` - Required for touch handling

3. **Handle keyboard navigation**
   ```kotlin
   KeyEvent.KEYCODE_DPAD_CENTER,
   KeyEvent.KEYCODE_ENTER -> { performClick(); true }
   ```

4. **Use ExploreByTouchHelper** for complex multi-region views
   - ⚠️ **Fire TV Note:** ExploreByTouchHelper may not work on Fire OS - see [GUIDE_ANDROID_TV.md](GUIDE_ANDROID_TV.md) for alternatives

**For detailed implementation:** See [ANDROID_CUSTOM_VIEWS.md](ANDROID_CUSTOM_VIEWS.md)

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 10. Use Cues Other Than Color

**Issue:** UI elements distinguished only by color, excluding color-blind users

**⚠️ CRITICAL:** Never rely on color alone to convey information, state, or actions.

**Impact:**
- 8% of men and 0.5% of women have color vision deficiency
- Users in bright sunlight may not distinguish colors
- Violates WCAG 1.4.1 Use of Color (Level A)

**Common Issues:**

**1. Error States (Forms):**
```kotlin
// ❌ ISSUE: Error shown only with red border
OutlinedTextField(
    value = email,
    onValueChange = { email = it },
    isError = hasError,
    colors = OutlinedTextFieldDefaults.colors(
        errorBorderColor = Color.Red  // Only visual cue!
    )
)

// ✅ CORRECT: Error with icon + text message
OutlinedTextField(
    value = email,
    onValueChange = { email = it },
    isError = hasError,
    leadingIcon = if (hasError) {
        { Icon(Icons.Default.Error, "Error", tint = Color.Red) }
    } else null,
    supportingText = if (hasError) {
        { Text("Invalid email address") }  // Text explanation
    } else null
)
```

**2. Status Indicators:**
```kotlin
// ❌ ISSUE: Status shown only with color
@Composable
fun ServerStatus(isOnline: Boolean) {
    Box(
        modifier = Modifier
            .size(12.dp)
            .background(if (isOnline) Color.Green else Color.Red)
    )
}

// ✅ CORRECT: Status with shape + text
@Composable
fun ServerStatus(isOnline: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = if (isOnline) Icons.Default.CheckCircle else Icons.Default.Cancel,
            contentDescription = null,
            tint = if (isOnline) Color.Green else Color.Red,
            modifier = Modifier.size(16.dp)
        )
        Spacer(Modifier.width(4.dp))
        Text(
            text = if (isOnline) "Online" else "Offline",
            style = MaterialTheme.typography.bodySmall
        )
    }
}
```

**3. Required Fields:**
```xml
<!-- ❌ ISSUE: Required field shown only with red asterisk -->
<TextView
    android:text="Email *"
    android:textColor="@color/red"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<!-- ✅ CORRECT: Required indicated with text -->
<TextView
    android:text="Email (required)"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

**4. Charts and Graphs:**
```kotlin
// ❌ ISSUE: Lines distinguished only by color
LineChart(
    lines = listOf(
        Line(data1, color = Color.Red),
        Line(data2, color = Color.Blue),
        Line(data3, color = Color.Green)
    )
)

// ✅ CORRECT: Lines with different patterns/markers
LineChart(
    lines = listOf(
        Line(data1, color = Color.Red, pattern = LinePattern.Solid, marker = Marker.Circle),
        Line(data2, color = Color.Blue, pattern = LinePattern.Dashed, marker = Marker.Square),
        Line(data3, color = Color.Green, pattern = LinePattern.Dotted, marker = Marker.Triangle)
    )
)
```

**5. Buttons and Links:**
```kotlin
// ❌ ISSUE: Link shown only with color
Text(
    text = "Terms of Service",
    color = Color.Blue  // Only cue that it's clickable
)

// ✅ CORRECT: Link with underline + color
Text(
    text = "Terms of Service",
    color = Color.Blue,
    textDecoration = TextDecoration.Underline,  // Additional cue
    modifier = Modifier.clickable { openTerms() }
)
```

**6. Progress/Completion:**
```kotlin
// ❌ ISSUE: Progress bar color changes only
LinearProgressIndicator(
    progress = 0.75f,
    color = if (progress >= 0.8f) Color.Green else Color.Blue
)

// ✅ CORRECT: Progress with text percentage
Column {
    LinearProgressIndicator(progress = 0.75f)
    Text("75% complete")  // Text indicator
}

// ✅ ALTERNATIVE: Use icons for completion states
Row {
    repeat(5) { index ->
        Icon(
            imageVector = if (index < completedSteps) {
                Icons.Default.CheckCircle  // Filled icon
            } else {
                Icons.Default.RadioButtonUnchecked  // Outline icon
            },
            contentDescription = if (index < completedSteps) "Completed" else "Incomplete",
            tint = if (index < completedSteps) Color.Green else Color.Gray
        )
    }
}
```

**Visual Cues Checklist:**
- ✅ **Shape** - Different icons, borders, patterns
- ✅ **Text** - Labels, descriptions, status messages
- ✅ **Position** - Spatial arrangement, alignment
- ✅ **Size** - Different dimensions for hierarchy
- ✅ **Pattern** - Stripes, dots, dashes
- ✅ **Animation** - Movement, pulsing (with pause controls)
- ✅ **Haptic feedback** - Vibration patterns
- ✅ **Audio cues** - Sounds (with volume control)

**Testing for Color Accessibility:**
1. Use Android Accessibility Scanner
2. Test with color blindness simulators:
   - Chrome DevTools: Rendering → Emulate vision deficiencies
   - Apps: Color Oracle, Sim Daltonism
3. Convert UI to grayscale - can you still distinguish all elements?
4. Check WCAG color contrast ratios (see Contrast Checking section)

**WCAG SC:**
- **Primary:** 1.4.1 Use of Color (Level A)
- **Related:** 1.4.11 Non-text Contrast (Level AA)

**Severity:** High (affects 8% of male users)

---

### 11. Media Accessibility

> 📖 **See advanced guide:** [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md#media-accessibility)

**Issue:** Audio/video content without captions, transcripts, or accessible controls

**⚠️ CRITICAL:** All media content must be accessible. This is required only if your app has video/audio.

**Quick Check:**
- Does the app have video content?
- Does it have audio-only content (podcasts, music)?
- Are there media player controls?

**If NO media:** Skip this section.
**If YES:** See [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md#media-accessibility) for full requirements.

**Quick Requirements:**
- [ ] Captions/subtitles for all video
- [ ] Accessible play/pause, volume, progress controls
- [ ] Transcripts for important content
- [ ] No auto-play with sound

**WCAG SC:** 1.2.1, 1.2.2, 1.2.3 (Level A), 1.2.4, 1.2.5 (Level AA)

---
### 12. Live Regions (Compose)

**Issue:** Dynamic content without announcement

> ⚠️ **IMPORTANT:** Live regions are for content that updates WITHOUT direct user interaction. Do NOT use for user-initiated changes like tab switching, button clicks, or form submissions.

**When to use live regions:**
- ✅ Status messages that appear automatically
- ✅ Loading indicators
- ✅ Server notifications/alerts
- ✅ Timer countdowns (for milestone announcements, not every second)
- ✅ Progress updates from background operations

**When NOT to use live regions:**
- ❌ Tab content switching (Tab component handles this)
- ❌ Button click results (use announcements or focus management instead)
- ❌ Form submission results (use announcements)
- ❌ Content that user directly interacted with (they expect the change)
- ❌ Every update in a rapidly changing display (too verbose)

```kotlin
// ❌ ISSUE: Dynamic content without announcement
Text(text = statusMessage)

// ✅ CORRECT: Announces changes (polite)
Text(
    text = statusMessage,
    modifier = Modifier.semantics {
        liveRegion = LiveRegionMode.Polite
    }
)

// ✅ CORRECT: Urgent announcements (assertive)
Text(
    text = errorMessage,
    modifier = Modifier.semantics {
        liveRegion = LiveRegionMode.Assertive
    }
)

// ❌ WRONG: Tab content container with live region
Box(
    modifier = Modifier.semantics {
        liveRegion = LiveRegionMode.Polite  // ❌ Unnecessary!
        contentDescription = "Home content"  // ❌ Redundant!
    }
) {
    when (selectedTab) {
        0 -> HomeContent()
        1 -> SearchContent()
    }
}
// Tab component already announced "Home, tab, selected" - no need for this!

// ✅ CORRECT: Tab content without live region
Box(modifier = Modifier.fillMaxSize()) {
    when (selectedTab) {
        0 -> HomeContent()  // Content has its own accessibility
        1 -> SearchContent()
    }
}
// Tab component handles announcements, content speaks for itself
```

**XML:**
```xml
<!-- ✅ CORRECT: Live region in XML -->
<TextView
    android:id="@+id/statusText"
    android:accessibilityLiveRegion="polite"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

**Programmatic Announcements:**
```kotlin
// ✅ One-time announcement
view.announceForAccessibility("Upload complete")

// Or with ViewCompat
ViewCompat.announceForAccessibility(view, "Upload complete")

// Compose
val context = LocalContext.current
LaunchedEffect(uploadComplete) {
    if (uploadComplete) {
        val accessibilityManager = context.getSystemService(Context.ACCESSIBILITY_SERVICE)
            as AccessibilityManager
        if (accessibilityManager.isEnabled) {
            val event = AccessibilityEvent.obtain().apply {
                eventType = AccessibilityEvent.TYPE_ANNOUNCEMENT
                className = javaClass.name
                packageName = context.packageName
                text.add("Upload complete")
            }
            accessibilityManager.sendAccessibilityEvent(event)
        }
    }
}
```

**WCAG SC:** 4.1.3 Status Messages (Level AA)

---

### 13. State Descriptions (Compose)

> ⚠️ **CRITICAL:** Most components announce their state AUTOMATICALLY. Only use `stateDescription` for custom value formatting (sliders). See [Avoid Redundant Information](patterns/AVOID_ROLE_IN_LABEL.md).

**Issue:** Toggle or checkbox state not announced

```kotlin
// ❌ ISSUE: State not communicated
Switch(
    checked = isEnabled,
    onCheckedChange = { isEnabled = it }
)

// ✅ CORRECT: State automatically handled by Switch
Switch(
    checked = isEnabled,
    onCheckedChange = { isEnabled = it },
    modifier = Modifier.semantics {
        contentDescription = "Enable notifications"
        // NO stateDescription needed - Switch announces "on"/"off" automatically
    }
)

// ❌ WRONG: Adding redundant stateDescription to Switch
Switch(
    checked = isEnabled,
    onCheckedChange = { isEnabled = it },
    modifier = Modifier.semantics {
        contentDescription = "Dark mode"
        stateDescription = if (isEnabled) "On" else "Off"  // ❌ REDUNDANT!
    }
)
// TalkBack announces: "Dark mode, switch, on, on" - says "on" TWICE!

// ✅ CORRECT: Custom toggleable with selection state
var isSelected by remember { mutableStateOf(false) }
Box(
    modifier = Modifier
        .toggleable(
            value = isSelected,
            onValueChange = { isSelected = it }
        )
        .semantics {
            contentDescription = "Favorite"
            selected = isSelected  // ✅ Use selected property, not stateDescription
        }
) {
    Text(if (isSelected) "✓ Favorite" else "☆ Favorite")
}
// TalkBack announces: "Favorite, checkbox, selected" (when true)

// ✅ CORRECT: Slider with custom value formatting (ONLY case for stateDescription)
Slider(
    value = brightness,
    onValueChange = { brightness = it },
    modifier = Modifier.semantics {
        contentDescription = "Brightness"
        stateDescription = "${(brightness * 100).toInt()} percent"  // ✅ Needed for sliders
    }
)
// TalkBack announces: "Brightness, 50 percent, slider"
```

**When to use stateDescription:**
- ✅ **Sliders** - for custom value formatting ("50 percent", "3 out of 5 stars")
- ✅ **Custom components** - when state isn't announced automatically
- ❌ **Switches** - announces on/off automatically
- ❌ **Tabs** - announces selection automatically
- ❌ **Checkboxes** - announces checked/unchecked automatically
- ❌ **Selection state** - use `selected` property instead

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 14. Grouping Related Content (Compose)

**Issue:** Related elements announced separately

```kotlin
// ❌ ISSUE: Icon and text announced separately
Row {
    Icon(Icons.Default.Star, contentDescription = "Rating")
    Text("4.5 stars")
}

// ✅ CORRECT: Merged semantics
Row(
    modifier = Modifier.semantics(mergeDescendants = true) {}
) {
    Icon(Icons.Default.Star, contentDescription = null)
    Text("4.5 stars")
}

// ✅ CORRECT: Custom merged description
Row(
    modifier = Modifier.semantics {
        contentDescription = "Rating: 4.5 stars"
    }
) {
    Icon(Icons.Default.Star, contentDescription = null)
    Text("4.5 stars")
}
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A)

---

### 15. Collection Items (RecyclerView, LazyColumn, LazyRow)

> 📖 **See detailed pattern guide:** [Collection Items Pattern](patterns/COLLECTION_ITEMS_PATTERN.md)
>
> This section provides Android-specific implementation. See the pattern guide for:
> - Complete explanation and examples
> - Cross-platform implementations
> - Testing strategies
> - Impact analysis

**Issue:** Collection items with multiple sub-views require multiple swipes to navigate

**⚠️ CRITICAL Requirements:**
1. Items in grids, rows, or lists should be treated as **a whole unit**
2. Users should NOT have to swipe multiple times through sub-views
3. **Parent container MUST be clickable/tappable** - Use `Card(onClick = ...)` or set `isClickable = true` + `isFocusable = true`

**🚫 Avoid Contradictory Guidance:** DO NOT flag child views for missing descriptions if recommending parent-level merging.

#### Android Implementation

**Jetpack Compose:**
```kotlin
// ✅ CORRECT: Merged semantics for TV show card
Card(
    onClick = { openShow() },
    modifier = Modifier.semantics(mergeDescendants = true) {
        contentDescription = buildString {
            append(show.title)
            append(", ${show.episodeName}")
            append(", Season ${show.season}, Episode ${show.episode}")
            append(", on ${channel.name}")
            val percentWatched = (show.watchProgress * 100).toInt()
            append(", $percentWatched percent watched")
        }
    }
) {
    Row {
        Image(painter = rememberAsyncImagePainter(show.posterUrl), contentDescription = null)
        Column {
            Text(show.title)
            Text("Season ${show.season}")
            Text("Episode ${show.episode}")
            Image(painter = painterResource(channel.logo), contentDescription = null)
            LinearProgressIndicator(progress = show.watchProgress)
        }
    }
}
```

**XML (RecyclerView ViewHolder):**
```kotlin
class ShowViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun bind(show: Show) {
        itemView.apply {
            isClickable = true
            isFocusable = true
            contentDescription = "${show.title}, ${show.episodeName}, " +
                "Season ${show.season}, Episode ${show.episode}, " +
                "on ${show.channelName}, ${show.watchedPercent} percent watched"

            // Mark all child views as not important for accessibility
            posterImageView.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            titleTextView.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            seasonTextView.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            episodeTextView.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            channelLogoView.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            progressBar.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
        }
    }
}
```

**Custom Accessibility Actions (Compose):**
```kotlin
Card(
    modifier = Modifier.semantics(mergeDescendants = true) {
        contentDescription = getShowDescription(show)
        customActions = listOf(
            CustomAccessibilityAction("Add to favorites") {
                addToFavorites(show)
                true
            }
        )
    }
) { /* content */ }
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.4 Link Purpose (In Context) (Level A)

---

### 16. Bottom Navigation Bar Accessibility

> 📖 **See detailed pattern guide:** [Navigation Bar Accessibility](patterns/NAVIGATION_BAR_ACCESSIBILITY.md)
>
> This section provides Android-specific implementation. See the pattern guide for:
> - Complete requirements checklist
> - Common issues and solutions
> - Cross-platform implementations
> - Testing strategies

**Issue:** Navigation bars with incomplete or missing accessibility features

**⚠️ CRITICAL:** Bottom navigation bars must meet ALL 4 requirements: labels, selected state, position/count, visual contrast.

#### Android Implementation

**XML - BottomNavigationView:**
```xml
<!-- Menu with proper titles (used as accessible labels) -->
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/nav_home"
        android:icon="@drawable/ic_home"
        android:title="@string/nav_home" />
    <item
        android:id="@+id/nav_search"
        android:icon="@drawable/ic_search"
        android:title="@string/nav_search" />
</menu>

<!-- Layout -->
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottom_navigation"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:itemIconTint="@color/bottom_nav_color_selector"
    app:itemTextColor="@color/bottom_nav_color_selector"
    app:menu="@menu/bottom_nav_menu" />
```

**Jetpack Compose - NavigationBar:**
```kotlin
@Composable
fun AppBottomNavigation(selectedIndex: Int, onItemSelected: (Int) -> Unit) {
    NavigationBar {
        navItems.forEachIndexed { index, item ->
            NavigationBarItem(
                selected = selectedIndex == index,
                onClick = { onItemSelected(index) },
                icon = { Icon(item.icon, contentDescription = null) },
                label = { Text(item.label) } // REQUIRED
                // ✅ NO manual semantics needed - NavigationBarItem handles everything
            )
        }
    }
}
// TalkBack announces: "Home, tab, 1 of 4, selected" automatically ✓
```

**Jetpack Compose - TabRow:**
```kotlin
@Composable
fun ContentTabs(selectedIndex: Int, onTabSelected: (Int) -> Unit) {
    val tabs = listOf("Home", "Search", "Favorites", "Profile")

    TabRow(selectedTabIndex = selectedIndex) {
        tabs.forEachIndexed { index, title ->
            Tab(
                selected = selectedIndex == index,
                onClick = { onTabSelected(index) },
                text = { Text(title) }
                // ✅ NO manual semantics needed - Tab component handles:
                //    - Role (tab)
                //    - Position (1 of 4)
                //    - Selection state (selected)
            )
        }
    }
}
// TalkBack announces: "Home, tab, 1 of 4, selected" ✓
```

**❌ WRONG: Adding manual semantics to Tabs (creates redundancy):**
```kotlin
// ❌ DON'T DO THIS - Tab component already handles everything!
Tab(
    selected = isSelected,
    onClick = onClick,
    text = { Text("Home") },
    modifier = Modifier.semantics {
        contentDescription = "Home tab, 1 of 4"  // ❌ REDUNDANT!
        stateDescription = "Selected"  // ❌ REDUNDANT!
    }
)
// TalkBack announces: "Home tab, 1 of 4, tab, 1 of 4, selected, selected"
// Says "tab" TWICE, says "1 of 4" TWICE, says "selected" TWICE!
```

**Custom Implementation (Compose):**
```kotlin
@Composable
fun CustomNavItem(label: String, icon: ImageVector, selected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clickable(onClick = onClick, role = Role.Tab)
            .semantics(mergeDescendants = true) {
                contentDescription = label
                stateDescription = if (selected) "Selected" else "Not selected"
            }
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = null, tint = if (selected) SelectedColor else UnselectedColor)
            Text(label, color = if (selected) SelectedColor else UnselectedColor)
        }
    }
}
```

**WCAG SC:** 1.3.1, 2.4.6, 4.1.2, 1.4.11 (see pattern guide for details)

---

### 17. Context for Repeated Elements

> 📖 **See detailed pattern guide:** [Repeated Elements Context](patterns/REPEATED_ELEMENTS_CONTEXT.md)
>
> This section provides Android-specific implementation. See the pattern guide for:
> - Complete explanation with examples
> - Common scenarios (View all, Delete, Play, Share, Edit buttons)
> - Cross-platform implementations
> - Best practices and format patterns

**Issue:** Multiple elements with identical accessible descriptions, making them indistinguishable

**⚠️ CRITICAL:** Always include context to make repeated actions unique. Pattern: `"[Action] [item identifier]"`

#### Android Implementation

**XML:**
```xml
<!-- ✅ CORRECT: Category "View all" buttons with context -->
<Button
    android:text="View all"
    android:contentDescription="View all comedy" />
<Button
    android:text="View all"
    android:contentDescription="View all horror" />
```

**RecyclerView ViewHolder:**
```kotlin
// ✅ CORRECT: Email list with contextual labels
class EmailViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun bind(email: Email) {
        deleteButton.contentDescription = "Delete ${email.subject}"
        replyButton.contentDescription = "Reply to ${email.subject}"
    }
}

// Category "View all" buttons
fun bindCategoryHeader(category: Category, viewAllButton: Button) {
    viewAllButton.contentDescription = "View all ${category.name}"
}
```

**Jetpack Compose:**
```kotlin
// ✅ CORRECT: Movie grid with contextual play buttons
@Composable
fun MovieCard(movie: Movie, onPlayClick: () -> Unit) {
    Card {
        IconButton(
            onClick = onPlayClick,
            modifier = Modifier.semantics {
                contentDescription = "Play ${movie.title}"
            }
        ) {
            Icon(Icons.Default.PlayArrow, contentDescription = null)
        }
    }
}

// Category "View all" with context
@Composable
fun CategoryRow(category: Category) {
    TextButton(
        onClick = { viewAllCategory(category) },
        modifier = Modifier.semantics {
            contentDescription = "View all ${category.name}"
        }
    ) {
        Text("View all")
    }
}
```

**WCAG SC:** 2.4.4, 2.4.9, 4.1.2 (see pattern guide for details)

---

## Android Accessibility Services

> 📖 **See advanced guide:** [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md#android-system-accessibility-services)

Android provides several built-in accessibility services. Understanding them helps you design better accessible experiences.

**Key Services:**
- **TalkBack** - Screen reader for blind/low vision users
- **Switch Access** - For users with motor impairments
- **Voice Access** - Voice control for the entire app
- **Font/Display Size** - 15-30% of users adjust these

**For detailed information on how each service works and design implications:** See [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md#android-system-accessibility-services)

---
## Android TV & Fire TV Specific

### D-pad Navigation

```kotlin
// ❌ ISSUE: D-pad navigation not configured
RecyclerView(...)

// ✅ CORRECT: Enable D-pad focus
recyclerView.apply {
    isFocusable = true
    descendantFocusability = ViewGroup.FOCUS_AFTER_DESCENDANTS
}

// Compose (Leanback library)
TvLazyColumn(
    modifier = Modifier.focusable()
) {
    items(items) { item ->
        TvCard(
            onClick = { /*...*/ },
            modifier = Modifier.focusable()
        ) {
            // Card content
        }
    }
}
```

**Additional TV Considerations:**
- All interactive elements must be focusable
- Focus order should be logical (usually left-to-right, top-to-bottom)
- Focus indicators must be clearly visible
- Content descriptions still required for TalkBack (Android TV) and VoiceView (Fire TV)

---

## Files to Analyze

### XML-Based Projects
- `res/layout/*.xml` - All layout files
- `res/layout-land/*.xml` - Landscape layouts
- `res/menu/*.xml` - Menu definitions
- `res/values/strings.xml` - Check for contentDescription strings
- Custom View classes (`.kt`, `.java`)

### Compose Projects
- `*Screen.kt` - Screen composables
- `*Composable.kt` - Reusable composables
- `ui/**/*.kt` - UI components
- `theme/*.kt` - Theme and styling

### Other Files
- `Activity.kt` / `Fragment.kt` - Lifecycle and view setup
- Adapters (`*Adapter.kt`, `*ViewHolder.kt`)
- `navigation/*.xml` or navigation Compose files

---

## Testing Tools

### Automated Testing

**1. Accessibility Scanner (Google Play)**
- Install: https://play.google.com/store/apps/details?id=com.google.android.apps.accessibility.auditor
- Scans running apps for common issues
- Provides suggestions and severity ratings
- Tests: content descriptions, touch targets, contrast ratios, text size

**2. Espresso with Accessibility Checks:**
```kotlin
// build.gradle
androidTestImplementation 'androidx.test.espresso:espresso-accessibility:3.5.1'

// In your test class
import androidx.test.espresso.accessibility.AccessibilityChecks

class MyAccessibilityTest {
    @Before
    fun setup() {
        // Enable accessibility checks for all tests
        AccessibilityChecks.enable()
    }

    @Test
    fun testButtonAccessibility() {
        onView(withId(R.id.submit_button))
            .check(matches(isDisplayed()))
            .perform(click())
        // Accessibility checks run automatically on every interaction
    }
}
```

**3. Compose Testing with Accessibility:**
```kotlin
@Test
fun testAccessibleButton() {
    composeTestRule.setContent {
        Button(onClick = {}) {
            Text("Submit")
        }
    }

    // Verify accessible by content description
    composeTestRule
        .onNodeWithContentDescription("Submit")
        .assertIsDisplayed()
        .assertHasClickAction()

    // Verify touch target size
    composeTestRule
        .onNodeWithText("Submit")
        .assertTouchHeightIsEqualTo(48.dp)
        .assertTouchWidthIsEqualTo(48.dp)
}
```

**4. Validate Accessibility Actions:**
```kotlin
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat

// Test custom accessibility actions
@Test
fun testCustomActions() {
    val view = findViewById<View>(R.id.custom_view)

    val info = AccessibilityNodeInfoCompat.obtain()
    ViewCompat.onInitializeAccessibilityNodeInfo(view, info)

    // Verify actions are present
    val actions = info.actionList
    assertTrue(actions.any { it.label == "Archive" })
    assertTrue(actions.any { it.label == "Delete" })

    // Perform action
    val result = ViewCompat.performAccessibilityAction(
        view,
        AccessibilityNodeInfoCompat.ACTION_CLICK,
        null
    )
    assertTrue(result)
}
```

**5. Layout Inspector (Android Studio)**
- View > Tool Windows > Layout Inspector
- Inspect accessibility properties: contentDescription, importantForAccessibility
- Verify semantic hierarchy

### Manual Testing with Assistive Technologies

**TalkBack (Screen Reader)**
- Enable: Settings > Accessibility > TalkBack
- Or use Quick Settings tile for faster toggling
- Tests: content descriptions, navigation order, announcements
- **Key Gestures:**
  - Swipe right/left: Next/previous item
  - Double-tap: Activate focused item
  - Two-finger swipe down: Read from top
  - Two-finger swipe up: Read from current position
  - Three-finger swipe left/right: Navigate by headings
  - Swipe down then right: Open TalkBack menu
  - Swipe up then right: Actions menu (custom actions)
  - Two-finger double-tap: Pause/resume reading
  - Explore by touch: Drag finger to hear items

**Switch Access (Motor Impairment Support)**
- Enable: Settings > Accessibility > Switch Access
- Use physical switches or screen buttons
- Tests: keyboard navigation, focus order, all actions accessible
- Highlights interactive elements sequentially
- **Modes:**
  - Auto scan: Automatically highlights items
  - Manual scan: User triggers scanning
  - Point scan: Cross-hair scanning
- Configure switches: volume buttons, external bluetooth buttons, camera button

**Select to Speak**
- Enable: Settings > Accessibility > Select to Speak
- Tap items to hear them read aloud
- Tests: text readability, content descriptions

**Voice Access**
- Enable: Settings > Accessibility > Voice Access
- Control app entirely by voice commands
- Tests: all actions can be performed without touch

**Font Size & Display Size**
- Settings > Display > Font size → Set to "Largest"
- Settings > Display > Display size → Set to "Largest"
- Tests: text scales properly, layouts don't break, no text cutoff

**Color Correction (Simulate Color Blindness)**
- Settings > Accessibility > Color correction
- Test different types: Deuteranomaly (red-green), Protanomaly (red-green), Tritanomaly (blue-yellow)
- Verify UI doesn't rely solely on color

### Testing Checklist

**Before Release:**
- [ ] Test entire app with TalkBack enabled
- [ ] Navigate using only Switch Access (if applicable)
- [ ] Run Accessibility Scanner on all major screens
- [ ] Test with Font size set to "Largest"
- [ ] Test with Display size set to "Largest"
- [ ] Verify color contrast ratios (use Accessibility Scanner)
- [ ] Test with color blindness simulation
- [ ] Run automated Espresso accessibility tests
- [ ] Verify all gestures have accessibility action equivalents
- [ ] Test media controls with TalkBack
- [ ] Verify all form inputs are properly labeled
- [ ] Check that all images have appropriate contentDescription or are marked decorative
- [ ] Test D-pad navigation (for TV apps)
- [ ] Verify custom views have proper accessibility implementation

**Specific Feature Testing:**
- [ ] Swipe actions: Verify accessibility actions work
- [ ] Dialogs: Focus moves to dialog, can be dismissed
- [ ] Bottom sheets: Properly announced, can be closed
- [ ] Tabs: Selection state announced, position indicated
- [ ] Forms: Labels persist, errors announced
- [ ] Lists: Items merge properly, context provided
- [ ] Media: Controls accessible, captions available
- [ ] Modals: Focus trapped, ESC/back button works

---

## Common Android-Specific Issues

### 1. Custom Views Without Proper Accessibility

**Issue:** Custom views built from scratch without implementing accessibility methods

> 📖 **See comprehensive guide:** Section 9 - Extending System Widgets Properly (above)

```kotlin
// ❌ ISSUE: Custom view with no accessibility
class BadCustomButton(context: Context) : View(context) {
    init {
        setOnClickListener { /* action */ }
    }
    // Missing: accessibility methods, keyboard support, events
}

// ✅ CORRECT: Extend Button, get accessibility for free
class GoodCustomButton(context: Context) : Button(context) {
    // Inherits all Button accessibility automatically
}

// ✅ CORRECT: If must extend View, implement all accessibility
class CompleteCustomButton(context: Context) : View(context) {
    init {
        isFocusable = true
        isClickable = true
    }

    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
        super.onInitializeAccessibilityNodeInfo(info)
        info?.className = Button::class.java.name
        info?.addAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_CLICK)
    }

    override fun performClick(): Boolean {
        super.performClick()
        handleClick()
        return true
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> {
                performClick()
                true
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }
}
```

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

### 2. RecyclerView Items

```kotlin
// ✅ CORRECT: Accessible RecyclerView item
class ItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun bind(item: Item) {
        itemView.apply {
            contentDescription = "${item.title}, ${item.description}"
            isClickable = true
            isFocusable = true
        }
    }
}
```

### 3. Bottom Navigation

```xml
<!-- ✅ CORRECT: Label always shown for accessibility -->
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottomNav"
    app:labelVisibilityMode="labeled"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
```

### 4. FAB (Floating Action Button)

```xml
<!-- ✅ CORRECT: FAB with content description -->
<com.google.android.material.floatingactionbutton.FloatingActionButton
    android:id="@+id/fab"
    android:src="@drawable/ic_add"
    android:contentDescription="@string/add_item"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

### 5. Complex Views Without Virtual Hierarchy

**Issue:** Calendar, grid, or multi-region view where TalkBack sees only one element

```kotlin
// ❌ ISSUE: Complex calendar, but TalkBack can't access individual days
class CalendarView(context: Context) : View(context) {
    // 30+ clickable day cells, but announced as single item
}

// ✅ CORRECT: Use ExploreByTouchHelper for virtual views
// ⚠️ Fire TV Note: ExploreByTouchHelper may not work on Fire OS
class CalendarView(context: Context) : View(context) {
    init {
        val touchHelper = object : ExploreByTouchHelper(this) {
            override fun getVirtualViewAt(x: Float, y: Float): Int {
                return findDayAt(x, y) ?: INVALID_ID
            }

            override fun getVisibleVirtualViews(virtualViewIds: MutableList<Int>) {
                for (day in 1..daysInMonth) {
                    virtualViewIds.add(day)
                }
            }

            override fun onPopulateNodeForVirtualView(
                virtualViewId: Int,
                node: AccessibilityNodeInfoCompat
            ) {
                node.text = "Day $virtualViewId"
                node.setBoundsInParent(getDayBounds(virtualViewId))
                node.addAction(AccessibilityNodeInfoCompat.ACTION_CLICK)
            }

            override fun onPerformActionForVirtualView(
                virtualViewId: Int,
                action: Int,
                arguments: Bundle?
            ): Boolean {
                if (action == AccessibilityNodeInfoCompat.ACTION_CLICK) {
                    selectDay(virtualViewId)
                    return true
                }
                return false
            }
        }
        ViewCompat.setAccessibilityDelegate(this, touchHelper)
    }
}
```

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 18. Advanced Input Patterns

> **For advanced input patterns, see:** [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md)

This advanced guide covers specialized input patterns including:
- **Arrow Key Navigation (D-pad Support)** - Keyboard/TV remote navigation, focus order
- **Keyboard Input Types** - Email, phone, number, password keyboards
- **Autofill Support** - Username, password, credit card autofill
- **Language Identification** - Multi-language content, LocaleSpan

Load the advanced guide when you detect forms, keyboard navigation, or multi-language content.

---

## Resources

### CVS Health Android Accessibility Techniques

For component-specific accessibility patterns and detailed implementations:

#### Android View Accessibility Techniques
**Repository:** https://github.com/cvs-health/android-view-accessibility-techniques

**What it covers (30 techniques):**
- **Accessibility Basics (7):** Text alternatives, input labels, focusable controls, responsive text sizing, touch targets, orientation support, dark theme
- **Grouping and Ordering (8):** Combining tap targets, semantic organization, group replacement, headings, lists, reading order, focus order, arrow key navigation
- **Dynamic Behaviors (8):** Live announcements, error messages, animation controls, keyboard types, custom actions, state descriptions, custom accessibility actions, focus indicators
- **Specific Components (7):** Accordion, autocomplete, autofill, dropdown menus, inline links, rating controls, language identification

#### Android Compose Accessibility Techniques
**Repository:** https://github.com/cvs-health/android-compose-accessibility-techniques

**What it covers:**
- **Informative Content:** Text alternatives, traversal order, content grouping, heading/list semantics, adaptive layouts, theming, screen titles
- **Interactive Behaviors:** Control labeling, touch targets, announcements, keyboard navigation, custom focus indicators, state descriptions
- **Specific Components:** Accordion, autofill, checkbox, dropdown, links, list items, modals, navigation bars, pop-ups, radio buttons, sliders, switches, tabs, text fields

**License:** Apache License 2.0
**Attribution:** © CVS Health. Licensed under Apache 2.0.
This guide references patterns from the CVS Health Android Accessibility Techniques projects.

**When to use these resources:**
- Implementing specific components (accordions, rating controls, autocomplete)
- Need detailed View or Compose-specific examples
- Building complex custom controls
- Component-level accessibility deep dives

**Our guide vs CVS Health repos:**
- **Our guide:** Broad coverage of common audit patterns for standard Android apps
- **CVS Health repos:** Deep component-specific implementations with working examples and Espresso tests

---

### Official Documentation
- **Android Accessibility Overview:** https://developer.android.com/guide/topics/ui/accessibility
- **Accessibility Principles:** https://developer.android.com/guide/topics/ui/accessibility/principles
- **Custom Views Accessibility:** https://developer.android.com/guide/topics/ui/accessibility/custom-views
- **Testing:** https://developer.android.com/guide/topics/ui/accessibility/testing
- **Compose Accessibility:** https://developer.android.com/jetpack/compose/accessibility
- **TalkBack:** https://support.google.com/accessibility/android/answer/6283677
- **ExploreByTouchHelper:** https://developer.android.com/reference/androidx/customview/widget/ExploreByTouchHelper

### Code Labs
- **Basic Accessibility:** https://developer.android.com/codelabs/basic-android-accessibility
- **Jetpack Compose Accessibility:** https://developer.android.com/codelabs/jetpack-compose-accessibility

---


**Related Guides:**
- GUIDE_WCAG_REFERENCE.md - WCAG principles
- GUIDE_ANDROID_TV.md - Android TV & Fire TV specific guidance
- COMMON_ISSUES.md - Cross-platform patterns
- AUDIT_REPORT_TEMPLATE.md - Report format
