# Android Advanced Accessibility Topics

> **Note:** This guide covers advanced accessibility topics. For general Android accessibility auditing, see [GUIDE_ANDROID.md](GUIDE_ANDROID.md).

---


## Accessibility Actions for Gestures

**Issue:** Gestures (swipe, drag-and-drop, pinch) without equivalent accessibility actions

**⚠️ CRITICAL:** All gestures MUST have equivalent accessibility actions for users who cannot perform the gesture.

### When to Add Accessibility Actions

- ✅ Swipe to delete/archive
- ✅ Drag-and-drop to reorder
- ✅ Long-press for context menu
- ✅ Pinch to zoom
- ✅ Custom gestures

### Jetpack Compose Implementation

```kotlin
// ❌ ISSUE: Swipe-to-delete without accessibility action
LazyColumn {
    items(emails) { email ->
        SwipeToDismiss(
            state = rememberSwipeToDismissState(),
            background = { /* red background */ },
            dismissContent = { EmailCard(email) }
        )
    }
}

// ✅ CORRECT: Add accessibility action for delete
LazyColumn {
    items(emails) { email ->
        val dismissState = rememberSwipeToDismissState()
        SwipeToDismiss(
            state = dismissState,
            background = { /* red background */ },
            dismissContent = {
                EmailCard(
                    email = email,
                    modifier = Modifier.semantics {
                        customActions = listOf(
                            CustomAccessibilityAction("Delete") {
                                deleteEmail(email)
                                true
                            },
                            CustomAccessibilityAction("Archive") {
                                archiveEmail(email)
                                true
                            }
                        )
                    }
                )
            }
        )
    }
}
// TalkBack: "Actions available" → User can activate to see Delete/Archive options
```

### Views/ViewCompat Implementation

```kotlin
// ✅ CORRECT: Add accessibility actions for swipe gestures
ViewCompat.addAccessibilityAction(
    itemView,
    getString(R.string.archive)
) { _, _ ->
    archiveItem()
    true
}

ViewCompat.addAccessibilityAction(
    itemView,
    getString(R.string.delete)
) { _, _ ->
    deleteItem()
    true
}

// ✅ CORRECT: Replace generic action with descriptive label
ViewCompat.replaceAccessibilityAction(
    itemView,
    AccessibilityNodeInfoCompat.AccessibilityActionCompat.ACTION_LONG_CLICK,
    getString(R.string.add_to_favorites),
    null
) { _, _ ->
    addToFavorites()
    true
}
// TalkBack announces: "Double tap and hold to add to favorites"
// Instead of generic: "Double tap and hold for long press"
```

### Drag-and-Drop Example (Compose)

```kotlin
// ✅ CORRECT: Reorderable list with accessibility actions
@Composable
fun ReorderableList(items: List<Item>) {
    LazyColumn {
        itemsIndexed(items) { index, item ->
            Box(
                modifier = Modifier
                    .dragAndDrop(/* drag logic */)
                    .semantics {
                        customActions = buildList {
                            if (index > 0) {
                                add(CustomAccessibilityAction("Move up") {
                                    moveItem(index, index - 1)
                                    true
                                })
                            }
                            if (index < items.lastIndex) {
                                add(CustomAccessibilityAction("Move down") {
                                    moveItem(index, index + 1)
                                    true
                                })
                            }
                        }
                    }
            ) {
                ItemContent(item)
            }
        }
    }
}
```

### Best Practices

- Make action labels descriptive and specific
- Provide actions for all custom gestures
- Test that actions work with TalkBack's "Actions" menu
- Consider providing multiple ways to accomplish the same task

**WCAG SC:** 2.5.1 Pointer Gestures (Level A), 2.1.1 Keyboard (Level A)

---

## Media Accessibility

**Issue:** Audio/video content without captions, transcripts, or accessible controls

**⚠️ CRITICAL:** All media content must be accessible to users who are deaf, hard of hearing, blind, or have motor disabilities.

### 1. Captions/Subtitles

```kotlin
// ✅ CORRECT: ExoPlayer with subtitle support
val trackSelector = DefaultTrackSelector(context).apply {
    parameters = buildUponParameters()
        .setPreferredTextLanguage("en")
        .build()
}

val player = ExoPlayer.Builder(context)
    .setTrackSelector(trackSelector)
    .build()

// Subtitle view
SubtitleView(context).apply {
    setPlayer(player)
    setStyle(CaptionStyleCompat.DEFAULT)
}
```

### 2. Audio Descriptions

For important visual content that isn't conveyed in audio:

```kotlin
// Provide alternate audio track with descriptions
val mediaItem = MediaItem.Builder()
    .setUri(videoUri)
    .setSubtitleConfigurations(
        listOf(
            MediaItem.SubtitleConfiguration.Builder(subtitleUri)
                .setMimeType(MimeTypes.TEXT_VTT)
                .setLanguage("en")
                .setSelectionFlags(C.SELECTION_FLAG_DEFAULT)
                .build()
        )
    )
    .build()
```

### 3. Accessible Media Controls

```kotlin
// ❌ ISSUE: Custom controls without accessibility
@Composable
fun VideoControls() {
    Row {
        Icon(Icons.Default.PlayArrow, contentDescription = null)  // ❌ Missing
        Icon(Icons.Default.VolumeUp, contentDescription = null)   // ❌ Missing
    }
}

// ✅ CORRECT: Accessible media controls
@Composable
fun VideoControls(
    isPlaying: Boolean,
    onPlayPause: () -> Unit,
    volume: Float,
    onVolumeChange: (Float) -> Unit,
    currentTime: Long,
    duration: Long
) {
    Column {
        // Play/Pause button
        IconButton(
            onClick = onPlayPause,
            modifier = Modifier.semantics {
                contentDescription = if (isPlaying) "Pause" else "Play"
            }
        ) {
            Icon(
                if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                contentDescription = null
            )
        }

        // Volume control
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.VolumeUp, contentDescription = null)
            Slider(
                value = volume,
                onValueChange = onVolumeChange,
                valueRange = 0f..1f,
                modifier = Modifier.semantics {
                    contentDescription = "Volume"
                    stateDescription = "${(volume * 100).toInt()} percent"
                }
            )
        }

        // Progress bar with accessible time info
        Column {
            Slider(
                value = currentTime.toFloat(),
                onValueChange = { /* seek */ },
                valueRange = 0f..duration.toFloat(),
                modifier = Modifier.semantics {
                    contentDescription = "Video progress"
                    stateDescription = "${formatTime(currentTime)} of ${formatTime(duration)}"
                }
            )
            Text(
                text = "${formatTime(currentTime)} / ${formatTime(duration)}",
                style = MaterialTheme.typography.bodySmall
            )
        }

        // Captions toggle
        var captionsEnabled by remember { mutableStateOf(false) }
        IconButton(
            onClick = { captionsEnabled = !captionsEnabled },
            modifier = Modifier.semantics {
                contentDescription = "Toggle captions"
                stateDescription = if (captionsEnabled) "On" else "Off"
            }
        ) {
            Icon(Icons.Default.ClosedCaption, contentDescription = null)
        }
    }
}
```

### 4. Transcripts

```kotlin
// ✅ CORRECT: Provide text transcript for video content
@Composable
fun VideoWithTranscript(videoUrl: String, transcriptText: String) {
    Column {
        VideoPlayer(url = videoUrl)

        Spacer(Modifier.height(16.dp))

        Text(
            text = "Transcript",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.semantics { heading() }
        )

        Text(
            text = transcriptText,
            modifier = Modifier
                .verticalScroll(rememberScrollState())
                .semantics { contentDescription = "Video transcript" }
        )
    }
}
```

### XML - Media Controls

```xml
<!-- ✅ CORRECT: PlayerView with controls enabled -->
<com.google.android.exoplayer2.ui.PlayerView
    android:id="@+id/player_view"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:show_subtitle_button="true"
    app:controller_layout_id="@layout/custom_player_control"
    app:use_controller="true" />
```

### Media Accessibility Checklist

- [ ] Captions/subtitles available for all video content
- [ ] Captions can be toggled on/off
- [ ] Audio descriptions for important visual-only information
- [ ] Play/Pause controls with clear labels
- [ ] Volume controls with percentage indicators
- [ ] Progress/seek bar with time information
- [ ] All controls meet minimum 48dp touch target size
- [ ] Controls remain accessible when video is fullscreen
- [ ] Transcripts available for longer videos
- [ ] Auto-playing media can be paused
- [ ] Media doesn't play automatically with sound

**WCAG SC:**
- **1.2.1** Audio-only and Video-only (Prerecorded) - Level A
- **1.2.2** Captions (Prerecorded) - Level A
- **1.2.3** Audio Description or Media Alternative (Prerecorded) - Level A
- **1.2.4** Captions (Live) - Level AA
- **1.2.5** Audio Description (Prerecorded) - Level AA
- **2.2.2** Pause, Stop, Hide - Level A

**Severity:** Critical for video content without captions

---

## Android System Accessibility Services

Understanding Android's built-in accessibility services helps you design and test better accessible experiences.

### TalkBack (Screen Reader)

**What it does:**
- Announces UI elements via synthesized speech
- Provides auditory feedback for touch interactions
- Enables explore-by-touch navigation
- Primary assistive technology for users with blindness or low vision

**How it works:**
- User swipes right/left to navigate between elements
- Double-tap activates focused element
- Announces: content description, role (button, checkbox), state (selected, checked), position (1 of 4)
- Provides actions menu for custom accessibility actions

**Design implications:**
- Every interactive element needs a meaningful label
- Visual hierarchy becomes navigation order
- State changes must be announced
- Custom gestures need accessibility action equivalents

**Testing with TalkBack:**
- Can you navigate to every interactive element?
- Are announcements clear and concise?
- Is state communicated without relying on visuals?
- Can all actions be performed without seeing the screen?

### Switch Access

**What it does:**
- Highlights interactive elements sequentially
- Responds to switch/button presses (physical or on-screen)
- Supports single-button or multi-button control
- Assists users with severe motor disabilities

**How it works:**
- User triggers scanning with switches
- System highlights elements one at a time (auto-scan) or in groups
- User activates switch to select highlighted item
- Can use 1 switch (auto-scan) or 2+ switches (manual control)

**Design implications:**
- All actions must be accessible without complex gestures
- Clear visual focus indicators required
- Logical focus order is critical
- Touch target sizes must be adequate
- Avoid time-based interactions (or provide pause option)

**Testing with Switch Access:**
- Can all actions be performed with switch scanning?
- Is focus order logical and efficient?
- Are focus indicators clearly visible?
- Can timed content be paused or extended?

### Voice Access

**What it does:**
- Allows complete app control via voice commands
- Shows numbers next to actionable items
- Supports navigation, typing, and gestures via voice
- Helps users with motor impairments or repetitive strain injuries

**Design implications:**
- Elements need clear, unique labels for voice targeting
- All interactive elements should be properly labeled
- Avoid relying solely on complex gestures

### Select to Speak

**What it does:**
- Reads text aloud when tapped
- Allows selective reading of screen content
- Useful for users with reading difficulties or learning disabilities

**Design implications:**
- All text should be selectable and readable
- Images conveying information need contentDescription
- Text should scale properly

### Font Size & Display Size

**What it does:**
- Allows users to increase text and UI element sizes
- 15-30% of users adjust these settings
- Critical for users with low vision

**Design implications:**
- Use `sp` for all text sizes (not `dp`)
- Ensure layouts adapt to larger text
- Test with largest font size setting

### Color Correction

**What it does:**
- Simulates different types of color blindness
- Helps users with color vision deficiency

**Design implications:**
- Never rely on color alone to convey information
- Use shape, text, patterns as additional cues

### Magnification

**What it does:**
- Full-screen magnification or magnification window
- Triple-tap to zoom or use shortcut
- Users with low vision need this with properly labeled content

**Design implications:**
- Content must have proper labels for magnified reading
- Touch targets should be large enough when magnified

---

## Testing Strategies for Advanced Features

### Testing Gesture Alternatives

1. Enable TalkBack
2. Navigate to item with swipe gesture
3. Use TalkBack Actions menu (swipe up then right)
4. Verify custom actions appear
5. Activate action and verify it works

### Testing Media Accessibility

**Captions:**
1. Play video with TalkBack enabled
2. Verify caption toggle button is accessible
3. Enable captions
4. Verify captions display correctly
5. Test with different caption sizes

**Controls:**
1. Navigate to each control with TalkBack
2. Verify labels are clear
3. Verify state is announced (playing, paused, volume level)
4. Test volume and seek controls with TalkBack

### Testing with Assistive Technologies

**TalkBack Testing:**
- Settings > Accessibility > TalkBack
- Navigate entire flow with eyes closed
- Verify all actions can be completed

**Switch Access Testing:**
- Settings > Accessibility > Switch Access
- Configure volume buttons as switches
- Complete key tasks using only switches

**Voice Access Testing:**
- Enable Voice Access
- Try "Show numbers" to see voice targets
- Attempt key tasks via voice only

---

## Common Issues

### Gesture without Equivalent Action

**Problem:** Swipe to delete works, but no TalkBack action
**Fix:** Add `ViewCompat.addAccessibilityAction()` or `customActions`

### Media Controls Not Labeled

**Problem:** Play button announces "Button" (not helpful)
**Fix:** Add `contentDescription = if (isPlaying) "Pause" else "Play"`

### Volume/Progress State Not Announced

**Problem:** Slider at 50% but TalkBack doesn't say "50 percent"
**Fix:** Add `stateDescription = "${value} percent"` to slider semantics

### Auto-playing Video

**Problem:** Video plays automatically with sound
**Fix:** Require user action to play, or provide prominent pause button

---

## Advanced Input Patterns

### Arrow Key Navigation (D-pad Support)

**Issue:** App not navigable with arrow keys (D-pad, keyboard, TV remote)

```xml
<!-- ❌ ISSUE: Focusable views without proper focus order -->
<LinearLayout>
    <Button android:id="@+id/button1" />
    <Button android:id="@+id/button2" />
</LinearLayout>

<!-- ✅ CORRECT: Explicit focus navigation -->
<LinearLayout>
    <Button
        android:id="@+id/button1"
        android:nextFocusRight="@id/button2"
        android:nextFocusDown="@id/button3" />

    <Button
        android:id="@+id/button2"
        android:nextFocusLeft="@id/button1"
        android:nextFocusDown="@id/button4" />
</LinearLayout>

<!-- Compose - Automatic focus order with focusable() -->
@Composable
fun NavigableGrid() {
    LazyVerticalGrid(columns = GridCells.Fixed(2)) {
        items(items) { item ->
            Button(
                onClick = { },
                modifier = Modifier.focusable()
            ) {
                Text(item.name)
            }
        }
    }
}

// Custom focus order in Compose
@Composable
fun CustomFocusOrder() {
    val focusRequesters = remember { List(4) { FocusRequester() } }

    Column {
        items.forEachIndexed { index, item ->
            Button(
                onClick = { },
                modifier = Modifier
                    .focusRequester(focusRequesters[index])
                    .onKeyEvent { event ->
                        when {
                            event.key == Key.DirectionRight && index < 3 -> {
                                focusRequesters[index + 1].requestFocus()
                                true
                            }
                            event.key == Key.DirectionLeft && index > 0 -> {
                                focusRequesters[index - 1].requestFocus()
                                true
                            }
                            else -> false
                        }
                    }
            ) {
                Text(item.name)
            }
        }
    }
}
```

**Testing:**
- Connect external keyboard or use Android TV
- Navigate using arrow keys
- Ensure logical focus order

**WCAG SC:** 2.1.1 Keyboard (Level A), 2.4.3 Focus Order (Level A)

---

### Keyboard Input Types

**Issue:** Incorrect keyboard type for input fields

```xml
<!-- ❌ ISSUE: Generic keyboard for email -->
<EditText
    android:id="@+id/emailInput"
    android:hint="Email" />

<!-- ✅ CORRECT: Email keyboard -->
<EditText
    android:id="@+id/emailInput"
    android:hint="Email"
    android:inputType="textEmailAddress" />

<!-- Phone number -->
<EditText
    android:hint="Phone"
    android:inputType="phone" />

<!-- URL -->
<EditText
    android:hint="Website"
    android:inputType="textUri" />

<!-- Number -->
<EditText
    android:hint="Age"
    android:inputType="number" />

<!-- Password -->
<EditText
    android:hint="Password"
    android:inputType="textPassword" />
```

**Compose:**
```kotlin
// ✅ CORRECT: Email keyboard
TextField(
    value = email,
    onValueChange = { email = it },
    label = { Text("Email") },
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Email
    )
)

// Phone
TextField(
    value = phone,
    onValueChange = { phone = it },
    label = { Text("Phone") },
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Phone
    )
)

// Number
TextField(
    value = age,
    onValueChange = { age = it },
    label = { Text("Age") },
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Number
    )
)

// Password
TextField(
    value = password,
    onValueChange = { password = it },
    label = { Text("Password") },
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Password
    ),
    visualTransformation = PasswordVisualTransformation()
)

// URI
TextField(
    value = website,
    onValueChange = { website = it },
    label = { Text("Website") },
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Uri
    )
)
```

**Common Input Types:**
- `Email` - Email addresses
- `Phone` - Phone numbers
- `Number` - Numeric input
- `Password` - Password fields
- `Uri` - URLs
- `Text` - Default text

**WCAG SC:** 1.3.5 Identify Input Purpose (Level AA)

---

### Autofill Support

**Issue:** Forms don't support autofill

```xml
<!-- ❌ ISSUE: No autofill hints -->
<EditText
    android:id="@+id/username"
    android:hint="Username" />

<!-- ✅ CORRECT: Autofill hints provided -->
<EditText
    android:id="@+id/username"
    android:hint="Username"
    android:autofillHints="username"
    android:importantForAutofill="yes" />

<!-- Email -->
<EditText
    android:hint="Email"
    android:autofillHints="emailAddress"
    android:inputType="textEmailAddress" />

<!-- Password -->
<EditText
    android:hint="Password"
    android:autofillHints="password"
    android:inputType="textPassword" />

<!-- Credit card -->
<EditText
    android:hint="Card Number"
    android:autofillHints="creditCardNumber"
    android:inputType="number" />

<!-- Name -->
<EditText
    android:hint="Full Name"
    android:autofillHints="personName" />

<!-- Address -->
<EditText
    android:hint="Street Address"
    android:autofillHints="postalAddress" />

<!-- Phone -->
<EditText
    android:hint="Phone"
    android:autofillHints="phoneNumber"
    android:inputType="phone" />
```

**Compose:**
```kotlin
// ✅ CORRECT: Autofill with Compose
TextField(
    value = username,
    onValueChange = { username = it },
    label = { Text("Username") },
    modifier = Modifier.semantics {
        contentType = ContentType.Username
    }
)

// Email
TextField(
    value = email,
    onValueChange = { email = it },
    label = { Text("Email") },
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Email,
        autoCorrect = false
    ),
    modifier = Modifier.semantics {
        contentType = ContentType.EmailAddress
    }
)

// Password
TextField(
    value = password,
    onValueChange = { password = it },
    label = { Text("Password") },
    visualTransformation = PasswordVisualTransformation(),
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Password
    ),
    modifier = Modifier.semantics {
        contentType = ContentType.Password
    }
)

// Credit card
TextField(
    value = cardNumber,
    onValueChange = { cardNumber = it },
    label = { Text("Card Number") },
    keyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Number
    ),
    modifier = Modifier.semantics {
        contentType = ContentType.CreditCardNumber
    }
)
```

**Common Autofill Hints:**
- `username` - Username
- `password` - Password
- `emailAddress` - Email
- `personName` - Full name
- `postalAddress` - Address
- `phoneNumber` - Phone
- `creditCardNumber` - Card number

**WCAG SC:** 1.3.5 Identify Input Purpose (Level AA)

---

### Language Identification

**Issue:** Multi-language content not identified

```xml
<!-- ❌ ISSUE: Mixed language content without identification -->
<TextView
    android:text="Welcome! Bienvenue!" />

<!-- ✅ CORRECT: Use android:textLocale for specific languages -->
<TextView
    android:id="@+id/frenchText"
    android:text="Bienvenue"
    android:textLocale="fr" />

<TextView
    android:id="@+id/spanishText"
    android:text="Bienvenido"
    android:textLocale="es" />

<!-- For mixed content, use LocaleSpan -->
```

**Using LocaleSpan for mixed content:**
```kotlin
val text = SpannableString("Welcome! Bienvenue!")
text.setSpan(
    LocaleSpan(Locale.FRENCH),
    9,  // Start index
    19, // End index
    Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
)
textView.text = text
```

**Compose:**
```kotlin
// ✅ CORRECT: Language identification in Compose
Text(
    text = "Bienvenue",
    modifier = Modifier.semantics {
        localeList = LocaleListCompat.forLanguageTags("fr")
    }
)

// Mixed language with AnnotatedString
val annotatedText = buildAnnotatedString {
    withStyle(SpanStyle()) {
        append("Welcome! ")
    }
    withAnnotation("language", "fr") {
        append("Bienvenue!")
    }
}

Text(
    text = annotatedText,
    modifier = Modifier.semantics {
        // TalkBack will detect language changes
    }
)

// For entire screen language
CompositionLocalProvider(LocalLocale provides Locale.FRENCH) {
    Column {
        Text("Titre")
        Text("Description")
    }
}
```

**When to use:**
- ✅ Multi-language content in same view
- ✅ Foreign language quotes or phrases
- ✅ Mixed language UI elements
- ✅ User-generated content in different languages

**WCAG SC:** 3.1.2 Language of Parts (Level AA)

---


