# Decorative Image Decision Tree
## Triage Process for Images Without Descriptions

---

## Overview

Not all images without descriptions need to be reported. This guide helps you determine whether to report an image accessibility issue, and at what severity level.

**Goal:** Reduce report noise by filtering out truly decorative images while ensuring meaningful images are flagged appropriately.

---

## 3-Tier Classification

### 🎨 Clearly Decorative → DON'T REPORT

Skip these from the report entirely:

- **Background images** (patterns, textures, gradients)
- **Decorative borders and frames**
- **Visual spacers or dividers**
- **Drop shadows and glows**
- **Gradient overlays**
- **Purely aesthetic shapes/icons with no interactive meaning**
- **Repeated pattern decorations**

**Rationale:** These images convey no meaningful information and would clutter the report.

### ❓ Unsure if Decorative → LOW Priority

Create a LOW priority issue with verification note:

```markdown
**Description:** Image may be decorative, but verification recommended.
**Fix:** If this image conveys meaningful information, add appropriate description. If purely decorative, mark as decorative using platform-appropriate method.
**Severity:** LOW
```

**Examples:**
- Logos that might be informative or purely branding
- Icons that might convey status vs pure decoration
- Images that might be part of content vs styling
- Ambiguous graphics where context unclear

### ✅ Must Report → CRITICAL or Standard Priority

**CRITICAL Priority:**
- **Icon-only buttons** - If image is the ONLY visual content in an interactive element
- **Single image in button/link** - Must have description for button to be usable

**Standard Priority:**
- Content images (photos, illustrations, charts, diagrams)
- Informative icons (status indicators, action icons)
- Product images, profile pictures
- Any image conveying information or context

---

## Decision Tree

```
┌─────────────────────────────────┐
│ Image has no description/alt    │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Is image in a button/link?      │
└───────────┬─────────────────────┘
            │
     ┌──────┴──────┐
     │ YES         │ NO
     ▼             ▼
┌─────────────┐ ┌──────────────────┐
│ Is it the   │ │ Is image clearly │
│ ONLY image? │ │ decorative?      │
└──────┬──────┘ └────────┬─────────┘
       │                 │
    ┌──┴──┐          ┌───┴────┐
    │ YES │ NO       │ YES    │ NO/UNSURE
    ▼     ▼          ▼        ▼
┌────────┐ ┌───────┐ ┌──────┐ ┌─────────┐
│CRITICAL│ │Standard│ │ SKIP │ │  LOW    │
│Report  │ │ Report │ │      │ │ Report  │
└────────┘ └───────┘ └──────┘ └─────────┘
```

---

## Platform Implementation

### How to Mark Images as Decorative

#### Android (XML)
```xml
<!-- Decorative image - hide from TalkBack -->
<ImageView
    android:importantForAccessibility="no"
    android:contentDescription="@null" />
```

#### Android (Compose)
```kotlin
// Decorative image
Image(
    painter = painterResource(R.drawable.decorative_pattern),
    contentDescription = null  // Explicitly null = decorative
)
```

#### iOS (UIKit)
```swift
// Decorative image
imageView.isAccessibilityElement = false
```

#### iOS (SwiftUI)
```swift
// Decorative image
Image("decorative-pattern")
    .accessibilityHidden(true)
```

#### Web (HTML)
```html
<!-- Decorative image -->
<img src="gradient.png" alt="" role="presentation">
<!-- OR -->
<img src="gradient.png" alt="" aria-hidden="true">
<!-- OR use CSS background-image for decorative images -->
```

#### React Native
```javascript
// Decorative image
<Image source={require('./gradient.png')} accessible={false} />
```

#### Flutter
```dart
// Decorative image
ExcludeSemantics(
  child: Image.asset('assets/decorative_pattern.png'),
)
```

---

## Examples with Classifications

### Example 1: Gradient Background
```
Visual: Blue-to-purple gradient behind text
Classification: 🎨 Clearly Decorative
Action: DON'T REPORT
```

### Example 2: Icon-Only Delete Button
```
Visual: Trash can icon, no text label, in clickable button
Classification: ✅ CRITICAL
Action: REPORT - "Button has no accessible label"
Severity: CRITICAL
```

### Example 3: Company Logo in Footer
```
Visual: Small company logo at bottom of screen
Classification: ❓ Unsure if Decorative
Action: REPORT LOW - "Verify if logo is informative or decorative"
Severity: LOW
```

### Example 4: Product Image in Shopping List
```
Visual: Photo of running shoes in product card
Classification: ✅ Must Report
Action: REPORT - "Product image missing description"
Severity: Standard (High/Medium depending on context)
```

### Example 5: Play Button with Icon + "Play" Text
```
Visual: Play icon next to "Play" text in button
Classification: 🎨 Clearly Decorative (text is sufficient)
Action: DON'T REPORT (if button itself has proper label)
Note: Icon is supplementary to text label
```

### Example 6: Status Indicator Icon
```
Visual: Green checkmark next to "Completed" text
Classification: ❓ Unsure if Decorative
Action: REPORT LOW - "If icon adds meaning beyond text, needs description"
Severity: LOW
```

---

## Best Practices

### 1. Context Matters

Consider the element's role in the interface:
- **In buttons/links:** Image likely needs description
- **As background:** Likely decorative
- **In content area:** Likely needs description
- **Repeated patterns:** Likely decorative

### 2. When in Doubt, Report as LOW

If you're unsure whether an image is decorative:
- Create a LOW priority issue
- Include verification recommendation
- Let the development team make final decision

### 3. Check for Redundancy

If an image has adjacent text saying the same thing:
- Icon may be decorative
- Example: 🏠 "Home" - icon is decorative when text present

### 4. Icon-Only Interactive Elements are ALWAYS Critical

No exceptions:
- Icon-only buttons MUST have accessible labels
- Icon-only links MUST have accessible labels
- Even if icon seems "universal" (trash, search, etc.)

---

## Testing Checklist

### Code Review
- [ ] Identify all images in the codebase
- [ ] Check each image for accessibility properties
- [ ] Classify each image: Decorative / Unsure / Must Report
- [ ] For decorative images, verify they're properly marked

### Manual Testing
- [ ] Enable screen reader (TalkBack/VoiceOver)
- [ ] Navigate through interface
- [ ] Verify decorative images are skipped
- [ ] Verify meaningful images are announced
- [ ] Verify icon-only buttons have labels

---

## WCAG Success Criteria

- **1.1.1 Non-text Content (Level A)** - All non-text content has text alternative, except for decorative images which can be marked as such
- **4.1.2 Name, Role, Value (Level A)** - Interactive elements must have accessible names

---

## Summary

**Report Policy:**
1. **DON'T REPORT**: Clearly decorative images (backgrounds, gradients, patterns)
2. **REPORT LOW**: Unsure if decorative (include verification note)
3. **REPORT CRITICAL**: Icon-only buttons/links
4. **REPORT STANDARD**: Content images, informative icons

This triage process reduces report noise while ensuring critical accessibility issues are caught.
