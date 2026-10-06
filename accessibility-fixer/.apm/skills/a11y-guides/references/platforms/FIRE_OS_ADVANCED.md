# Fire OS Advanced Accessibility Guide
## VoiceView, Audio Description, and Fire TV-Specific Patterns

---

> **Note:** This guide covers Fire OS-specific accessibility features loaded conditionally when Fire TV patterns are detected. For common Android TV/Fire TV patterns, see [GUIDE_ANDROID_TV.md](GUIDE_ANDROID_TV.md).

---

## Fire OS-Specific Considerations

While Fire TV uses the Android accessibility framework, there are **Fire OS-specific implementation requirements** for VoiceView (Amazon's screen reader).

### 1. ExploreByTouchHelper Compatibility Issue

**⚠️ CRITICAL:** The Android `ExploreByTouchHelper` support library may not function as expected on Fire OS.

```kotlin
// ⚠️ MAY NOT WORK on Fire OS
class MyCustomView : View() {
    private val touchHelper = MyExploreByTouchHelper(this)
    // ExploreByTouchHelper may fail on Fire OS
}

// ✅ RECOMMENDED: Implement AccessibilityNodeProvider directly for Fire OS
class MyCustomView : View() {
    init {
        ViewCompat.setAccessibilityDelegate(this, object : AccessibilityDelegateCompat() {
            override fun getAccessibilityNodeProvider(host: View): AccessibilityNodeProviderCompat {
                return MyAccessibilityNodeProvider(host)
            }
        })
    }
}
```

**Issue:** Custom views using `ExploreByTouchHelper` for virtual descendants
**Severity:** HIGH (if app targets Fire TV)
**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 2. Virtual Accessibility Descendants

Fire OS supports virtual descendants (components drawn on canvas without backing views, like custom keyboard keys).

```kotlin
// ✅ CORRECT: Virtual descendants for Fire OS
override fun onPopulateNodeForVirtualView(
    virtualViewId: Int,
    node: AccessibilityNodeInfoCompat
) {
    // Use -1 (HOST_VIEW_ID) for the parent view itself
    if (virtualViewId == HOST_VIEW_ID) {
        node.setSource(this)
    } else {
        // Reference virtual child using parent view + virtual ID
        node.setSource(this, virtualViewId)
    }

    // Add virtual children
    node.addChild(this, VIRTUAL_CHILD_ID_1)
    node.addChild(this, VIRTUAL_CHILD_ID_2)
}

companion object {
    private const val HOST_VIEW_ID = -1
    private const val VIRTUAL_CHILD_ID_1 = 1
    private const val VIRTUAL_CHILD_ID_2 = 2
}
```

---

### 3. Custom View State Changes Pattern

**⚠️ CRITICAL for Fire OS:** When state changes in custom widgets, follow this exact pattern:

```kotlin
// ✅ CORRECT: Fire OS custom view state change pattern
class CustomWidget : View() {
    private var isChecked = false

    fun setChecked(checked: Boolean) {
        if (isChecked != checked) {
            isChecked = checked

            // Step 1: Update state
            // Step 2: Send AccessibilityEvent via parent
            parent?.requestSendAccessibilityEvent(
                this,
                AccessibilityEvent.obtain(AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED)
            )
        }
    }

    // Step 3: Ensure createAccessibilityNodeInfo() reflects updated state
    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(info)
        info.isChecked = isChecked
        info.className = Switch::class.java.name
        // VoiceView calls this when it receives the AccessibilityEvent
    }
}
```

**❌ DO NOT on Fire OS:**
```kotlin
// ❌ WRONG: Don't send AccessibilityNodeInfo directly
val nodeInfo = AccessibilityNodeInfo.obtain(this)
// There's no way to send this directly to VoiceView - it won't work

// ❌ WRONG: Don't cache AccessibilityNodeInfo
private var cachedNodeInfo: AccessibilityNodeInfo? = null // VoiceView can't access this
```

**Why this matters:**
- VoiceView uses an **on-demand model**: it calls `createAccessibilityNodeInfo()` only when it receives an `AccessibilityEvent`
- Cached or directly-sent nodes cause **stale information** in VoiceView
- Always send `TYPE_WINDOW_CONTENT_CHANGED` events when accessibility information changes

**Issue:** Custom views not sending accessibility events on state changes
**Severity:** CRITICAL (Fire TV users won't hear state updates)
**WCAG SC:** 4.1.2 Name, Role, Value (Level A), 4.1.3 Status Messages (Level AA)

---

### 4. Accessibility Event Types for Fire OS

```kotlin
// ✅ CORRECT: Use TYPE_WINDOW_CONTENT_CHANGED for state updates
fun updateContent() {
    // Update your data
    adapter.notifyDataSetChanged()

    // Notify VoiceView to invalidate cached nodes
    parent?.requestSendAccessibilityEvent(
        this,
        AccessibilityEvent.obtain(AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED)
    )
}

// ❌ AVOID: TYPE_ANNOUNCEMENT for on-screen activity
fun showNewContent() {
    // Don't use TYPE_ANNOUNCEMENT for changes that update on-screen views
    // Use TYPE_WINDOW_CONTENT_CHANGED instead
}

// ✅ OK: TYPE_ANNOUNCEMENT for off-screen events
fun onBackgroundTaskComplete() {
    announceForAccessibility("Download complete")
    // TYPE_ANNOUNCEMENT is fine for events not reflected in UI
}
```

**Fire OS VoiceView Best Practice:**
- **Avoid `TYPE_ANNOUNCEMENT`** for on-screen activity updates
- **Use `TYPE_WINDOW_CONTENT_CHANGED`** when view content/state changes
- **Combine events** with corresponding `AccessibilityNodeInfo` updates

---

### 5. View Importance for Accessibility

```xml
<!-- ✅ CORRECT: Mark decorative views as not important -->
<ImageView
    android:id="@+id/decorativeBackground"
    android:importantForAccessibility="no"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />

<!-- ✅ CORRECT: Hide children of grouped containers -->
<LinearLayout
    android:id="@+id/customCard"
    android:importantForAccessibility="yes"
    android:contentDescription="Product name, $29.99, 4.5 stars">

    <!-- Children won't be individually announced -->
    <TextView
        android:importantForAccessibility="no"
        android:text="Product name" />
    <TextView
        android:importantForAccessibility="no"
        android:text="$29.99" />
</LinearLayout>
```

**Values for `importantForAccessibility`:**
- `yes` - Generate accessibility nodes
- `no` - Don't generate nodes
- `no_hide_descendants` - Don't generate nodes for this or children
- `auto` (default) - System decides

**Critical:** Views not marked as important generate **no accessibility nodes**, and VoiceView drops their events.

**Issue:** Interactive views marked as `importantForAccessibility="no"`
**Severity:** CRITICAL
**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 6. AccessibilityNodeInfo Content Requirements

```kotlin
// ✅ CORRECT: Node text matches on-screen text
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(info)
    // Text should contain ONLY what's visible on screen
    info.text = visibleTextView.text

    // Use contentDescription for additional context
    info.contentDescription = "Season 1, Episode 5"
}

// ❌ WRONG: Node text contains more than visible text
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(info)
    // Don't add extra information to text field
    info.text = "${visibleTextView.text} - Click to watch"
}
```

**Fire OS Requirements:**
- `AccessibilityNodeInfo.text` should contain **only on-screen text**
- Use `contentDescription` for context augmentation, not overwhelming detail
- All important items need appropriate descriptions testable via VoiceView

---

## Testing on Fire TV

### VoiceView Testing
1. **Enable VoiceView:**
   - Settings → Accessibility → VoiceView → Turn On
   - Or hold Back + Menu buttons simultaneously for 3 seconds

2. **Navigation:**
   - D-pad arrows: Move between focusable items
   - Select button: Activate focused item
   - Back button: Go back/close VoiceView
   - Menu button: VoiceView settings

3. **Verify:**
   - All interactive elements are reachable via D-pad
   - VoiceView announces content correctly
   - State changes are announced immediately
   - Custom views announce their purpose and state

### Common Fire TV Issues

**Issue:** VoiceView announces stale information after state changes
**Cause:** Missing `TYPE_WINDOW_CONTENT_CHANGED` event
**Fix:** Send event via `parent.requestSendAccessibilityEvent()` when state changes

**Issue:** Custom view children not accessible
**Cause:** Using `ExploreByTouchHelper` which may not work on Fire OS
**Fix:** Implement `AccessibilityNodeProvider` directly

**Issue:** VoiceView doesn't announce interactive elements
**Cause:** `importantForAccessibility="no"` or missing `contentDescription`
**Fix:** Set `importantForAccessibility="yes"` and add appropriate descriptions

---

## Audio Description and Closed Captioning (Fire OS)

Fire TV apps should respect user preferences for Audio Description (AD) and Closed Captioning (CC) to ensure accessible media playback.

### Reading Audio Description Settings

**Issue:** Media app doesn't respect Audio Description preference
**Severity:** HIGH (Fire TV apps with video/audio content)
**WCAG SC:** 1.2.3 Audio Description or Media Alternative (Level A), 1.2.5 Audio Description (Level AA)

```java
// ✅ CORRECT: Read Audio Description setting
ContentResolver resolver = getApplicationContext().getContentResolver();
int audioDescEnabled = Settings.Secure.getInt(
    resolver,
    "accessibility_audio_descriptions_enabled",
    0  // Default: off
);
boolean adEnabled = (audioDescEnabled == 1);

if (adEnabled) {
    // Enable audio description track in media player
    selectAudioDescriptionTrack();
}
```

**Kotlin:**
```kotlin
// ✅ CORRECT: Read AD setting in Kotlin
val resolver = applicationContext.contentResolver
val adEnabled = Settings.Secure.getInt(
    resolver,
    "accessibility_audio_descriptions_enabled",
    0
) == 1

if (adEnabled) {
    selectAudioDescriptionTrack()
}
```

---

### Subscribing to Audio Description Changes

Apps should respond when users toggle AD settings while the app is running.

```java
// ✅ CORRECT: Subscribe to AD setting changes
ContentResolver contentResolver = getApplicationContext().getContentResolver();
Uri audioDescUri = Settings.Secure.getUriFor("accessibility_audio_descriptions_enabled");

ContentObserver audioDescObserver = new ContentObserver(new Handler()) {
    @Override
    public void onChange(boolean selfChange, Uri uri) {
        if (uri != null && uri.equals(audioDescUri)) {
            int enabled = Settings.Secure.getInt(
                getApplicationContext().getContentResolver(),
                "accessibility_audio_descriptions_enabled",
                0
            );
            if (enabled == 1) {
                // Switch to audio description track
                enableAudioDescription();
            } else {
                // Switch to standard audio track
                disableAudioDescription();
            }
        }
    }
};

// Register observer
contentResolver.registerContentObserver(audioDescUri, false, audioDescObserver);

// ⚠️ Don't forget to unregister in onDestroy()
@Override
protected void onDestroy() {
    super.onDestroy();
    contentResolver.unregisterContentObserver(audioDescObserver);
}
```

**Kotlin:**
```kotlin
// ✅ CORRECT: Subscribe to AD changes in Kotlin
private lateinit var audioDescObserver: ContentObserver

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val resolver = contentResolver
    val audioDescUri = Settings.Secure.getUriFor("accessibility_audio_descriptions_enabled")

    audioDescObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
        override fun onChange(selfChange: Boolean, uri: Uri?) {
            if (uri == audioDescUri) {
                val enabled = Settings.Secure.getInt(
                    resolver,
                    "accessibility_audio_descriptions_enabled",
                    0
                ) == 1

                if (enabled) enableAudioDescription()
                else disableAudioDescription()
            }
        }
    }

    resolver.registerContentObserver(audioDescUri, false, audioDescObserver)
}

override fun onDestroy() {
    super.onDestroy()
    contentResolver.unregisterContentObserver(audioDescObserver)
}
```

**Fire OS Note:** The `accessibility_audio_descriptions_enabled` setting applies to Fire OS 8 and earlier devices. Default value is `0` (off).

---

### Reading Closed Captioning Settings

**Issue:** Media app doesn't respect Closed Captioning preference
**Severity:** CRITICAL
**WCAG SC:** 1.2.2 Captions (Level A)

```java
// ✅ CORRECT: Read Closed Captioning setting
CaptioningManager captioningManager = (CaptioningManager)
    getApplicationContext().getSystemService(Context.CAPTIONING_SERVICE);

boolean ccEnabled = captioningManager.isEnabled();

if (ccEnabled) {
    // Enable captions in media player
    enableClosedCaptions();
}
```

**Kotlin:**
```kotlin
// ✅ CORRECT: Read CC setting in Kotlin
val captioningManager = getSystemService(Context.CAPTIONING_SERVICE) as CaptioningManager
val ccEnabled = captioningManager.isEnabled

if (ccEnabled) {
    enableClosedCaptions()
}
```

---

### Subscribing to Closed Captioning Changes

```java
// ✅ CORRECT: Subscribe to CC setting changes
CaptioningManager captioningManager = (CaptioningManager)
    getApplicationContext().getSystemService(Context.CAPTIONING_SERVICE);

CaptioningManager.CaptioningChangeListener ccListener =
    new CaptioningManager.CaptioningChangeListener() {
        @Override
        public void onEnabledChanged(boolean enabled) {
            if (enabled) {
                enableClosedCaptions();
            } else {
                disableClosedCaptions();
            }
        }
    };

captioningManager.addCaptioningChangeListener(ccListener);

// ⚠️ Don't forget to remove listener in onDestroy()
@Override
protected void onDestroy() {
    super.onDestroy();
    captioningManager.removeCaptioningChangeListener(ccListener);
}
```

**Kotlin:**
```kotlin
// ✅ CORRECT: Subscribe to CC changes in Kotlin
private lateinit var ccListener: CaptioningManager.CaptioningChangeListener

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val captioningManager = getSystemService(Context.CAPTIONING_SERVICE) as CaptioningManager

    ccListener = CaptioningManager.CaptioningChangeListener { enabled ->
        if (enabled) enableClosedCaptions()
        else disableClosedCaptions()
    }

    captioningManager.addCaptioningChangeListener(ccListener)
}

override fun onDestroy() {
    super.onDestroy()
    val captioningManager = getSystemService(Context.CAPTIONING_SERVICE) as CaptioningManager
    captioningManager.removeCaptioningChangeListener(ccListener)
}
```

---

### AD/CC Settings Comparison

| Feature | Audio Description | Closed Captioning |
|---------|-------------------|-------------------|
| **Access Method** | `Settings.Secure.getInt()` | `CaptioningManager.isEnabled()` |
| **Default Value** | `0` (off) | `false` (disabled) |
| **Subscription** | `ContentObserver` | `CaptioningChangeListener` |
| **Fire OS Version** | Fire OS 8 and earlier | All versions |
| **WCAG Level** | Level A (1.2.3), Level AA (1.2.5) | Level A (1.2.2) - CRITICAL |

**Common Issues:**
- App doesn't check AD/CC settings on launch
- App doesn't respond to setting changes while running
- Forgot to unregister observers/listeners → memory leaks
- Using wrong API for AD (don't use CaptioningManager for AD)

---

## VoiceView-Specific Features (Fire OS)

VoiceView is Fire TV's screen reader with Fire OS-specific metadata keys for enhanced accessibility.

### VoiceView Accessibility Metadata Keys

Fire OS supports custom accessibility metadata that VoiceView uses for enhanced user guidance:

| Metadata Key | Purpose | When VoiceView Reads It |
|--------------|---------|------------------------|
| `com.amazon.accessibility.describedBy` | Link static content to focused item | When focus changes |
| `com.amazon.accessibility.orientationText` | High-level screen layout description | On first encounter or Menu press |
| `com.amazon.accessibility.usageHint.remote` | Fire TV remote navigation instructions | After content description |
| `com.amazon.accessibility.usageHint.touch` | Touch interaction guidance (Fire Tablets) | After content description |

---

### 1. Described By - Linking Static Content

**Use case:** Associate static content (movie titles, descriptions, metadata) with focused interactive elements.

**Issue:** VoiceView doesn't announce static content when user focuses on related button/item
**Severity:** MEDIUM (Fire TV apps with grid layouts showing details)
**WCAG SC:** 1.3.1 Info and Relationships (Level A)

```java
// ✅ CORRECT: Link static content to button using Described By
Button playButton = (Button) findViewById(R.id.play_button);
playButton.setAccessibilityDelegate(new View.AccessibilityDelegate() {
    @Override
    public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
        super.onInitializeAccessibilityNodeInfo(host, info);

        // Space-delimited list of view IDs
        info.getExtras().putString(
            "com.amazon.accessibility.describedBy",
            R.id.movie_title + " " + R.id.movie_description + " " + R.id.rating
        );
    }
});

// When user focuses on play_button, VoiceView announces:
// "Play button, The Shawshank Redemption, A banker wrongly convicted..., Rated R"
```

**Kotlin:**
```kotlin
// ✅ CORRECT: Described By in Kotlin
playButton.accessibilityDelegate = object : View.AccessibilityDelegate() {
    override fun onInitializeAccessibilityNodeInfo(host: View, info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(host, info)

        info.extras.putString(
            "com.amazon.accessibility.describedBy",
            "${R.id.movie_title} ${R.id.movie_description} ${R.id.rating}"
        )
    }
}
```

**Pattern:** Focus-based detail panel
- User navigates grid of movie posters
- Focusing on poster updates detail panel (title, description, rating)
- Use Described By to link poster button to detail panel views
- VoiceView automatically reads updated details

**⚠️ WebView Note:** Described By content is unavailable in WebViews.

---

### 2. Orientation Text - Screen Layout Guidance

**Use case:** Provide high-level description of screen layout for first-time users.

**Issue:** VoiceView users don't understand screen layout or available sections
**Severity:** MEDIUM (complex layouts with multiple sections)
**WCAG SC:** 2.4.6 Headings and Labels (Level AA)

```java
// ✅ CORRECT: Add orientation text to container views
ViewGroup mainContainer = (ViewGroup) findViewById(R.id.main_container);
mainContainer.setAccessibilityDelegate(new View.AccessibilityDelegate() {
    @Override
    public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
        super.onInitializeAccessibilityNodeInfo(host, info);

        info.getExtras().putString(
            "com.amazon.accessibility.orientationText",
            "This screen contains a movie grid on the left and details panel on the right. " +
            "Use left and right buttons to move between movies. " +
            "Press select to play the movie."
        );
    }
});
```

**Kotlin:**
```kotlin
// ✅ CORRECT: Orientation text in Kotlin
mainContainer.accessibilityDelegate = object : View.AccessibilityDelegate() {
    override fun onInitializeAccessibilityNodeInfo(host: View, info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(host, info)

        info.extras.putString(
            "com.amazon.accessibility.orientationText",
            "This screen contains a movie grid on the left and details panel on the right. " +
            "Use left and right buttons to move between movies. " +
            "Press select to play the movie."
        )
    }
}
```

**When VoiceView reads it:**
- Automatically on first encounter with the container
- When user presses Menu button

**Best practices:**
- Apply to top-level container views
- Keep it concise but informative
- Describe layout structure and primary navigation
- Explain how to accomplish main tasks

---

### 3. Usage Hints - Navigation Instructions

**Use case:** Guide users on how to navigate lists, grids, and custom controls using the Fire TV remote.

**Issue:** VoiceView users don't know how to navigate custom controls or grids
**Severity:** MEDIUM (custom navigation patterns)
**WCAG SC:** 3.3.2 Labels or Instructions (Level A)

```java
// ✅ CORRECT: Add usage hints to grids/lists
RecyclerView movieGrid = (RecyclerView) findViewById(R.id.movie_grid);
movieGrid.setAccessibilityDelegate(new View.AccessibilityDelegate() {
    @Override
    public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
        super.onInitializeAccessibilityNodeInfo(host, info);

        // For Fire TV remote
        info.getExtras().putString(
            "com.amazon.accessibility.usageHint.remote",
            "Press left and right to move between movies. Press up and down to move between rows."
        );

        // For Fire Tablet (optional)
        info.getExtras().putString(
            "com.amazon.accessibility.usageHint.touch",
            "Swipe left and right to browse movies."
        );
    }
});
```

**Kotlin:**
```kotlin
// ✅ CORRECT: Usage hints in Kotlin
movieGrid.accessibilityDelegate = object : View.AccessibilityDelegate() {
    override fun onInitializeAccessibilityNodeInfo(host: View, info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(host, info)

        info.extras.putString(
            "com.amazon.accessibility.usageHint.remote",
            "Press left and right to move between movies. Press up and down to move between rows."
        )
    }
}
```

**Best practices:**
- Add to container level (grids, lists) to avoid repetition
- Don't add to individual items within the grid
- Be specific about which buttons to use
- Focus on Fire TV remote controls (up/down/left/right/select)

**When VoiceView reads it:**
- After reading content description and other metadata
- Only read once per container, not for each item

---

## VoiceView Navigation and Controls (Fire OS)

Understanding VoiceView navigation patterns helps design more accessible Fire TV experiences.

### VoiceView Activation

**Enable/Disable VoiceView:**
- **Settings path:** Settings → Accessibility → VoiceView → Turn On
- **Keyboard shortcut:** Press and hold **Back + Menu** buttons for 2 seconds

### Standard Navigation Mode

**D-pad Navigation:**
- **Up/Down/Left/Right buttons:** Move input focus around the screen
- **Select button:** Activate focused item
- **Back button:** Go back / exit VoiceView context
- **Automatic announcements:** VoiceView speaks the currently focused item

**Menu Button Reading Order:**
When user presses **Menu button once**, VoiceView reads in this order:
1. Usage Hints (`usageHint.remote`)
2. Orientation Text (`orientationText`)
3. Described By content (`describedBy`)
4. All other static content

**Menu Button Double-Press:**
- System/app receives the menu press events (standard behavior)

---

### Review Mode (Advanced Navigation)

**Activation:** Press and hold **Menu button**

**Purpose:** Detailed exploration of grid layouts and all screen content (including non-focusable items)

**Navigation:**
- **Left/Right buttons:** Linear navigation through all items
- **Up/Down buttons:** Cycle through granularity levels:
  - Character
  - Word
  - Control (default)
  - Window
- **Select button:** Activate item (actionable items only)
- **Non-actionable items:** VoiceView announces "Item not selectable"

**Exit Review Mode:** Press and hold **Menu button** again

**Use case:** Users who want to explore every element on screen, not just focusable items

---

### Media Control Button Integration

VoiceView integrates with Fire TV media control buttons for enhanced accessibility.

**Rewind/Fast Forward Buttons:**
- **Purpose:** Navigate through spoken content
- **Function:** Jump backward/forward through VoiceView announcements
- **Use case:** Quickly navigate long lists or grids

**Play/Pause Button:**
- **First press (while VoiceView speaking):** Silences VoiceView
- **Second press:** Pauses playing media
- **Use case:** Stop VoiceView from talking without pausing video

**Implementation Note:** No code changes required - this is built into VoiceView. Ensure your app doesn't override these button behaviors when VoiceView is active.

```kotlin
// ✅ CORRECT: Don't block media buttons when VoiceView is active
override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    // Check if accessibility services are enabled
    val am = getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    if (am.isEnabled) {
        when (keyCode) {
            KeyEvent.KEYCODE_MEDIA_REWIND,
            KeyEvent.KEYCODE_MEDIA_FAST_FORWARD,
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                // Let VoiceView handle these
                return super.onKeyDown(keyCode, event)
            }
        }
    }

    // Handle media buttons normally when VoiceView is off
    return when (keyCode) {
        KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
            togglePlayPause()
            true
        }
        else -> super.onKeyDown(keyCode, event)
    }
}
```

---

### VoiceView UX Best Practices

**1. Orientation Text:**
- Apply to top-level container views
- Provides first-time user guidance
- Read automatically on first encounter or when Menu is pressed
- Keep concise but informative

**2. Usage Hints:**
- Add at container level (grids/lists) to avoid repetition
- Not needed for individual items within containers
- Focus on Fire TV remote button instructions
- Be specific: "Press left and right to move between items"

**3. Described By for Static Content:**
- Use for information that updates with focus changes
- Perfect for detail panels showing selected item info
- Links non-focusable text to focusable controls
- Example: Movie grid with updating detail panel

**4. Standard Accessibility Requirements Still Apply:**
- Content descriptions for all interactive elements
- Proper focus order
- Logical navigation paths
- Clear focus indicators

---

## Related Resources

**Fire OS Documentation:**
- [Implementing Accessibility for Fire OS](https://developer.amazon.com/docs/fire-tv/implement-accessibility-fire-os.html)
- [VoiceView for Fire TV](https://developer.amazon.com/docs/fire-tv/voiceview.html)
- [Audio Description and Closed Captioning](https://developer.amazon.com/docs/fire-tv/closed-captioning.html)
- [Reading and Subscribing to AD/CC](https://developer.amazon.com/docs/fire-tv/implement-reading-and-subscribing-to-adcc.html)
- [VoiceView Accessibility Features](https://developer.amazon.com/docs/fire-tv/implement-voiceview-accessibility-features-fire-os.html)

**Also See:**
- [GUIDE_ANDROID_TV.md](GUIDE_ANDROID_TV.md) - Common Android TV & Fire TV patterns
- [GUIDE_ANDROID.md](../GUIDE_ANDROID.md) - Core Android accessibility patterns
- [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md) - Advanced Android patterns (gestures, media, input)

---
