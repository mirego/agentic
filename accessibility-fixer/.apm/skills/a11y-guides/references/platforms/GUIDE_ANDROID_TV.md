# Android TV & Fire TV Accessibility Audit Guide
## 10-Foot UI and D-pad Navigation

---

## Platform Coverage

This guide covers accessibility for **all Android-based TV platforms:**
- **Android TV** (Google TV, Sony, TCL, etc.)
- **Amazon Fire TV** (Fire TV Stick, Fire TV Cube, Fire TV devices)

Both platforms use the same Android accessibility framework:
- **TalkBack** screen reader (Android TV) / **VoiceView** screen reader (Fire TV)
- Same D-pad navigation patterns
- Same content description requirements
- Same focus management APIs
- Same WCAG 2.2 Level AA standards

**Fire TV Notes:**
- Fire TV runs on Android (Fire OS) with Amazon customizations
- VoiceView is Amazon's implementation of TalkBack with identical accessibility APIs
- All code patterns in this guide apply to Fire TV apps
- Use `contentDescription`, `isFocusable`, and navigation patterns exactly as shown

---

## Android TV Specific Patterns

### 1. D-pad Navigation

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

---

### 2. Focus Indicators

```xml
<!-- ✅ CORRECT: Clear focus drawable -->
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_focused="true">
        <shape>
            <stroke android:width="4dp" android:color="#FFFFFF" />
            <corners android:radius="8dp" />
        </shape>
    </item>
</selector>
```

---

### 3. Content Descriptions

All guidance from GUIDE_ANDROID.md applies, plus:
- Even more critical for TV as touch feedback is absent
- TalkBack (Android TV) / VoiceView (Fire TV) works similarly to mobile

---

## Fire OS-Specific Features

> **For Fire OS-specific features, see:** [FIRE_OS_ADVANCED.md](FIRE_OS_ADVANCED.md)

While Fire TV uses the same Android accessibility framework as Android TV, there are **Fire OS-specific implementation requirements** for apps targeting Amazon Fire TV devices.

**Fire OS Advanced Guide covers:**

**1. Fire OS-Specific Implementation Patterns:**
- **ExploreByTouchHelper compatibility** - Critical: may not work on Fire OS
- **Virtual accessibility descendants** - Canvas-drawn components without backing views
- **Custom view state changes** - VoiceView's on-demand model for accessibility nodes
- **Accessibility event types** - When to use TYPE_WINDOW_CONTENT_CHANGED vs TYPE_ANNOUNCEMENT
- **View importance** - How VoiceView handles importantForAccessibility
- **AccessibilityNodeInfo requirements** - Text content vs contentDescription

**2. Audio Description and Closed Captioning:**
- Reading AD settings via `Settings.Secure.getInt()`
- Subscribing to AD changes with ContentObserver
- Reading CC settings via `CaptioningManager.isEnabled()`
- Subscribing to CC changes with CaptioningChangeListener
- Complete Java and Kotlin examples
- AD/CC comparison table and best practices

**3. VoiceView-Specific Metadata Keys:**
- `com.amazon.accessibility.describedBy` - Link static content to focused items
- `com.amazon.accessibility.orientationText` - Screen layout descriptions
- `com.amazon.accessibility.usageHint.remote` - Fire TV remote navigation instructions
- `com.amazon.accessibility.usageHint.touch` - Touch guidance for Fire Tablets

**4. VoiceView Navigation and Controls:**
- VoiceView activation (Back + Menu for 2 seconds)
- Standard navigation mode
- Review Mode (press and hold Menu button)
- Menu button reading order
- Media control button integration (Rewind/FF, Play/Pause)
- Complete implementation examples

**5. Testing and Common Issues:**
- VoiceView testing procedures
- Common Fire TV accessibility issues and fixes
- UX best practices for Fire TV apps

**When to load this guide:**
- App targets Amazon Fire TV devices
- App includes media content requiring AD/CC
- App uses custom views or complex grid layouts
- App requires VoiceView-specific metadata (describedBy, orientationText, usageHint)

---

## Related Resources

**Android TV Documentation:**
- [Android TV Accessibility](https://developer.android.com/training/tv/start)
- [TV Input Framework](https://developer.android.com/training/tv/tif)
- [Leanback Library](https://developer.android.com/jetpack/androidx/releases/leanback)

**Fire OS Documentation:**
- [Implementing Accessibility for Fire OS](https://developer.amazon.com/docs/fire-tv/implement-accessibility-fire-os.html)
- [VoiceView for Fire TV](https://developer.amazon.com/docs/fire-tv/voiceview.html)
- [Audio Description and Closed Captioning](https://developer.amazon.com/docs/fire-tv/closed-captioning.html)

**Also See:**
- [FIRE_OS_ADVANCED.md](FIRE_OS_ADVANCED.md) - Fire OS-specific patterns and VoiceView features
- [GUIDE_ANDROID.md](GUIDE_ANDROID.md) - Core Android accessibility patterns
- [ANDROID_ADVANCED.md](ANDROID_ADVANCED.md) - Advanced Android patterns (gestures, media, input)

---
