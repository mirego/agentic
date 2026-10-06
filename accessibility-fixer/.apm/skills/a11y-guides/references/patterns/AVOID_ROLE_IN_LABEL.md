# Avoid Redundant Information in Accessible Labels
## Preventing Duplicate Screen Reader Announcements

---

## Overview

Screen readers automatically announce:
- **Roles** (button, link, checkbox, tab, etc.)
- **States** (selected, checked, on/off, expanded/collapsed)
- **Position** (1 of 4, row 2 of 10)
- **Properties** (required, disabled, invalid)

Including any of this information manually in labels creates redundant, annoying announcements that waste users' time and sound unprofessional.

**The Problem:**
- ❌ "Close Button" → Screen reader: **"Close Button, button"**
- ❌ "Home Link" → Screen reader: **"Home Link, link"**
- ❌ "Agree Checkbox" → Screen reader: **"Agree Checkbox, checkbox"**

**The Solution:**
- ✅ "Close" → Screen reader: **"Close, button"**
- ✅ "Home" → Screen reader: **"Home, link"**
- ✅ "Agree" → Screen reader: **"Agree, checkbox"**

---

## Why This Matters

**Redundant announcements:**
- Create cognitive overload
- Waste the user's time
- Sound unprofessional
- Indicate poor accessibility implementation
- Can confuse users about the actual purpose

**Example of bad experience:**
```
User navigating a form with screen reader:

"Email Text Field, text field"
"Password Text Field, text field"
"Remember Me Checkbox, checkbox"
"Login Button, button"
"Forgot Password Link, link"

→ Every label says the type twice
→ Annoying and unprofessional
→ User hears "button" or "link" twice for every element
```

**Good experience:**
```
"Email, text field"
"Password, text field"
"Remember Me, checkbox"
"Login, button"
"Forgot Password, link"

→ Clean, concise announcements
→ Role announced once
→ Professional implementation
```

---

## Types of Redundancy

### 1. Role Redundancy (Most Common)
### 2. State Redundancy (Very Common)
### 3. Position Redundancy (Common with Lists/Tabs)
### 4. Property Redundancy (Common with Forms)

Each is explained in detail below.

---

## 1. Role Redundancy

### Common Mistakes to Check

### ❌ Button Labels

**Wrong:**
- "Close Button"
- "Submit Button"
- "Cancel Button"
- "Next Button"
- "Back Button"
- "Menu Button"
- "Search Button"

**Correct:**
- "Close"
- "Submit"
- "Cancel"
- "Next"
- "Back"
- "Menu"
- "Search"

### ❌ Link Labels

**Wrong:**
- "Home Link"
- "Read More Link"
- "Privacy Policy Link"
- "Contact Us Link"

**Correct:**
- "Home"
- "Read More"
- "Privacy Policy"
- "Contact Us"

### ❌ Form Control Labels

**Wrong:**
- "Email Text Field"
- "Password Input"
- "Username Text Box"
- "Search Input Field"
- "Agree Checkbox"
- "Male Radio Button"
- "Enable Notifications Switch"

**Correct:**
- "Email"
- "Password"
- "Username"
- "Search"
- "Agree" or "I agree to the terms"
- "Male"
- "Enable Notifications"

### ❌ Tab Labels

**Wrong:**
- "Home Tab"
- "Settings Tab"
- "Profile Tab"

**Correct:**
- "Home"
- "Settings"
- "Profile"

### ❌ Menu Items

**Wrong:**
- "File Menu Item"
- "Edit Menu Item"
- "Settings Menu"

**Correct:**
- "File"
- "Edit"
- "Settings"

---

## 2. State Redundancy

**THE PROBLEM:** Components automatically announce their state. Adding state to labels/values creates redundancy.

### ❌ Selection State in Labels

**Wrong:**
```kotlin
// Android - Tab
Tab(
    selected = isSelected,
    text = { Text("Home") },
    modifier = Modifier.semantics {
        contentDescription = "Home tab"
        stateDescription = "Selected"  // ❌ Tab already announces selection!
    }
)
// TalkBack: "Home tab, tab, 1 of 4, selected, selected"
//                                            ↑        ↑
//                                         Native    Manual
```

**Correct:**
```kotlin
// Android - Tab
Tab(
    selected = isSelected,
    text = { Text("Home") }
)
// TalkBack: "Home, tab, 1 of 4, selected" ✓
```

**Wrong:**
```swift
// iOS - Button with selection
Circle()
    .accessibilityLabel("Red theme color")
    .accessibilityValue("Selected")  // ❌ Trait handles this!
    .accessibilityAddTraits(.isButton)
    .accessibilityAddTraits(.isSelected)
// VoiceOver: "Red theme color, selected, selected, button"
```

**Correct:**
```swift
// iOS - Button with selection
Circle()
    .accessibilityLabel("Red theme color")
    .accessibilityAddTraits(.isButton)
    .accessibilityAddTraits(isSelected ? .isSelected : [])
// VoiceOver: "Red theme color, selected, button" ✓
```

### ❌ Toggle/Switch State in Labels

**Wrong:**
```kotlin
// Android
Switch(
    checked = isEnabled,
    onCheckedChange = { isEnabled = it },
    modifier = Modifier.semantics {
        contentDescription = "Dark Mode"
        stateDescription = if (isEnabled) "On" else "Off"  // ❌ Switch announces this!
    }
)
// TalkBack: "Dark Mode, switch, on, on"
```

**Correct:**
```kotlin
// Android
Switch(
    checked = isEnabled,
    onCheckedChange = { isEnabled = it },
    modifier = Modifier.semantics {
        contentDescription = "Dark Mode"
    }
)
// TalkBack: "Dark Mode, switch, on" ✓
```

**Wrong:**
```swift
// iOS
Toggle("Notifications", isOn: $isEnabled)
    .accessibilityLabel("Notifications")
    .accessibilityValue(isEnabled ? "On" : "Off")  // ❌ Toggle announces this!
// VoiceOver: "Notifications, on, switch, on"
```

**Correct:**
```swift
// iOS
Toggle("Notifications", isOn: $isEnabled)
    .accessibilityLabel("Notifications")
// VoiceOver: "Notifications, switch, on" ✓
```

### ❌ Button State in ContentDescription

**Wrong:**
```kotlin
// Android - Color picker button
Box(
    modifier = Modifier
        .clickable { selectRed() }
        .semantics {
            contentDescription = if (isRedSelected) {
                "Red theme color, selected"  // ❌ Don't include state in label!
            } else {
                "Red theme color"
            }
        }
)
// TalkBack: "Red theme color, selected, button, selected"
```

**Correct:**
```kotlin
// Android - Color picker button
Box(
    modifier = Modifier
        .clickable(role = Role.Button) { selectRed() }
        .semantics {
            contentDescription = "Red theme color"
            selected = isRedSelected  // Use semantic property
        }
)
// TalkBack: "Red theme color, button, selected" ✓
```

### ✅ When State IS Needed

**Sliders and progress indicators** need custom value formatting:

```kotlin
// Android - Slider (CORRECT to add value)
Slider(
    value = brightness,
    onValueChange = { brightness = it },
    modifier = Modifier.semantics {
        contentDescription = "Brightness"
        stateDescription = "${(brightness * 100).toInt()} percent"  // ✓ Needed!
    }
)
// TalkBack: "Brightness, 50 percent, slider"
```

```swift
// iOS - Slider (CORRECT to add value)
Slider(value: $brightness, in: 0...1)
    .accessibilityLabel("Brightness")
    .accessibilityValue("\(Int(brightness * 100)) percent")  // ✓ Needed!
// VoiceOver: "Brightness, 50 percent, adjustable"
```

---

## 3. Position Redundancy

**THE PROBLEM:** Tab components and lists automatically announce position. Don't add it manually.

### ❌ Tab Position in Labels

**Wrong:**
```kotlin
// Android
tabs.forEachIndexed { index, title ->
    Tab(
        selected = selectedIndex == index,
        onClick = { selectedIndex = index },
        text = { Text(title) },
        modifier = Modifier.semantics {
            contentDescription = "$title, ${index + 1} of ${tabs.size}"  // ❌ Tab announces position!
        }
    )
}
// TalkBack: "Home, 1 of 4, tab, 1 of 4, selected"
//                ↑                ↑
//              Manual           Native
```

**Correct:**
```kotlin
// Android
tabs.forEachIndexed { index, title ->
    Tab(
        selected = selectedIndex == index,
        onClick = { selectedIndex = index },
        text = { Text(title) }
    )
}
// TalkBack: "Home, tab, 1 of 4, selected" ✓
```

### ❌ List Item Position

**Wrong:**
```kotlin
// Android - LazyColumn items
items.forEachIndexed { index, item ->
    Text(
        text = item.name,
        modifier = Modifier.semantics {
            contentDescription = "${item.name}, item ${index + 1} of ${items.size}"  // ❌ List announces!
        }
    )
}
```

**Correct:**
```kotlin
// Android - LazyColumn items
items.forEach { item ->
    Text(text = item.name)
    // TalkBack automatically announces position in scrollable list
}
```

---

## 4. Property Redundancy

**THE PROBLEM:** Form fields automatically announce properties. Don't duplicate them.

### ❌ Field Type in Labels

**Wrong:**
```kotlin
// Android
OutlinedTextField(
    value = username,
    onValueChange = { username = it },
    label = { Text("Username") },
    modifier = Modifier.semantics {
        contentDescription = "Username input field"  // ❌ TextField announces its role!
    }
)
// TalkBack: "Username input field, text field"
//                         ↑            ↑
//                       Manual       Native
```

**Correct:**
```kotlin
// Android
OutlinedTextField(
    value = username,
    onValueChange = { username = it },
    label = { Text("Username") }
)
// TalkBack: "Username, text field" ✓
```

**Wrong:**
```swift
// iOS
TextField("Username", text: $username)
    .accessibilityLabel("Username input field")  // ❌ TextField announces its role!
// VoiceOver: "Username input field, text field"
```

**Correct:**
```swift
// iOS
TextField("Username", text: $username)
// VoiceOver: "Username, text field" ✓
```

### ❌ Context Prefixes That Duplicate Role

**Wrong:**
```kotlin
// Android - Time display
Text(
    text = formatTime(elapsedTime),
    modifier = Modifier.semantics {
        contentDescription = "Elapsed time: ${formatTime(elapsedTime)}"  // ❌ Redundant context
    }
)
// TalkBack reads the visible text already
```

**Correct:**
```kotlin
// Android - Time display
Text(
    text = formatTime(elapsedTime),
    modifier = Modifier.semantics {
        liveRegion = LiveRegionMode.Polite  // Just make it live
    }
)
// TalkBack: "00:42:15" ✓ (reads the visible text)
```

**Wrong:**
```kotlin
// Android - Button
Button(
    onClick = { pauseStopwatch() },
    modifier = Modifier.semantics {
        contentDescription = "Pause stopwatch"  // ❌ Unnecessary context
    }
) {
    Text("Pause")
}
// TalkBack: "Pause stopwatch, button" (reads visible text + manual label)
```

**Correct:**
```kotlin
// Android - Button
Button(onClick = { pauseStopwatch() }) {
    Text("Pause")
}
// TalkBack: "Pause, button" ✓ (button text is sufficient)
```

---

## When Role Names ARE Acceptable

There are rare cases where including a type word is acceptable, but use sparingly:

### ✅ Distinguishing Similar Actions

When you have multiple similar actions and need to clarify:

**Acceptable:**
- "View as List" (button)
- "View as Grid" (button)
→ "View" alone would be ambiguous

- "Download as PDF" (button)
- "Download as CSV" (button)
→ Clarifies the format

### ✅ Action + Object Pattern

When the role word is part of the action description:

**Acceptable:**
- "Choose File" (button)
- "Select Date" (button)
- "Pick Color" (button)
→ These are action verbs, not role names

### ✅ Context-Specific Terms

When the word isn't literally the role:

**Acceptable:**
- "Open Menu" (button) - "Menu" is the target, not the role
- "Show Dialog" (button) - "Dialog" is what opens
- "Toggle Panel" (button) - "Panel" is what toggles

**The key:** If the word describes what the button **does** or **affects**, it's okay. If it describes what the button **is**, remove it.

---

## Platform Implementation

### Android (Jetpack Compose)

**❌ WRONG:**
```kotlin
Button(onClick = { close() }) {
    Text("Close Button")  // Will announce: "Close Button, button"
}

IconButton(
    onClick = { openMenu() },
    modifier = Modifier.semantics {
        contentDescription = "Menu Button"  // Will announce: "Menu Button, button"
    }
) {
    Icon(Icons.Default.Menu, contentDescription = null)
}
```

**✅ CORRECT:**
```kotlin
Button(onClick = { close() }) {
    Text("Close")  // Announces: "Close, button"
}

IconButton(
    onClick = { openMenu() },
    modifier = Modifier.semantics {
        contentDescription = "Menu"  // Announces: "Menu, button"
    }
) {
    Icon(Icons.Default.Menu, contentDescription = null)
}
```

### Android (XML)

**❌ WRONG:**
```xml
<Button
    android:text="Submit Button"
    android:contentDescription="Submit Button" />

<ImageButton
    android:contentDescription="Search Button" />

<CheckBox
    android:text="Agree Checkbox" />
```

**✅ CORRECT:**
```xml
<Button
    android:text="Submit"
    android:contentDescription="Submit" />

<ImageButton
    android:contentDescription="Search" />

<CheckBox
    android:text="Agree" />
```

### iOS (SwiftUI)

**❌ WRONG:**
```swift
Button("Close Button") { close() }
// VoiceOver: "Close Button, button"

Button(action: openMenu) {
    Image(systemName: "line.horizontal.3")
}
.accessibilityLabel("Menu Button")
// VoiceOver: "Menu Button, button"

Toggle("Enable Notifications Toggle", isOn: $isEnabled)
// VoiceOver: "Enable Notifications Toggle, switch"
```

**✅ CORRECT:**
```swift
Button("Close") { close() }
// VoiceOver: "Close, button"

Button(action: openMenu) {
    Image(systemName: "line.horizontal.3")
}
.accessibilityLabel("Menu")
// VoiceOver: "Menu, button"

Toggle("Enable Notifications", isOn: $isEnabled)
// VoiceOver: "Enable Notifications, switch"
```

### iOS (UIKit)

**❌ WRONG:**
```swift
let button = UIButton()
button.setTitle("Submit Button", for: .normal)
button.accessibilityLabel = "Submit Button"

let closeButton = UIButton()
closeButton.accessibilityLabel = "Close Button"
```

**✅ CORRECT:**
```swift
let button = UIButton()
button.setTitle("Submit", for: .normal)
button.accessibilityLabel = "Submit"

let closeButton = UIButton()
closeButton.accessibilityLabel = "Close"
```

### Web (HTML/React)

**❌ WRONG:**
```html
<button>Close Button</button>
<!-- Screen reader: "Close Button, button" -->

<button aria-label="Menu Button">
    <i class="icon-menu"></i>
</button>
<!-- Screen reader: "Menu Button, button" -->

<a href="/home">Home Link</a>
<!-- Screen reader: "Home Link, link" -->

<input type="checkbox" id="agree" />
<label for="agree">Agree Checkbox</label>
<!-- Screen reader: "Agree Checkbox, checkbox" -->
```

**✅ CORRECT:**
```html
<button>Close</button>
<!-- Screen reader: "Close, button" -->

<button aria-label="Menu">
    <i class="icon-menu"></i>
</button>
<!-- Screen reader: "Menu, button" -->

<a href="/home">Home</a>
<!-- Screen reader: "Home, link" -->

<input type="checkbox" id="agree" />
<label for="agree">Agree</label>
<!-- Screen reader: "Agree, checkbox" -->
```

### React Native

**❌ WRONG:**
```javascript
<TouchableOpacity accessibilityLabel="Close Button">
    <Text>×</Text>
</TouchableOpacity>

<Pressable accessibilityLabel="Menu Button" accessibilityRole="button">
    <MenuIcon />
</Pressable>
```

**✅ CORRECT:**
```javascript
<TouchableOpacity accessibilityLabel="Close">
    <Text>×</Text>
</TouchableOpacity>

<Pressable accessibilityLabel="Menu" accessibilityRole="button">
    <MenuIcon />
</Pressable>
```

### Flutter

**❌ WRONG:**
```dart
Semantics(
    label: 'Close Button',
    button: true,
    child: IconButton(...)
)

Semantics(
    label: 'Home Link',
    link: true,
    child: GestureDetector(...)
)
```

**✅ CORRECT:**
```dart
Semantics(
    label: 'Close',
    button: true,
    child: IconButton(...)
)

Semantics(
    label: 'Home',
    link: true,
    child: GestureDetector(...)
)
```

---

## How to Detect This Issue

### Code Review Patterns

Search for these patterns in your codebase:

**Android - Role Redundancy:**
```regex
contentDescription.*[Bb]utton
contentDescription.*[Ll]ink
contentDescription.*[Cc]heckbox
contentDescription.*[Tt]ab
contentDescription.*[Mm]enu
contentDescription.*[Ii]nput
contentDescription.*[Ff]ield
android:text.*[Bb]utton
```

**Android - State Redundancy:**
```regex
stateDescription.*"Selected"
stateDescription.*"Not selected"
stateDescription.*"On"
stateDescription.*"Off"
contentDescription.*"selected"
contentDescription.*"not selected"
```

**Android - Position Redundancy:**
```regex
contentDescription.*"\d+ of \d+"
contentDescription.*"item \d+"
```

**iOS - Role Redundancy:**
```regex
accessibilityLabel.*[Bb]utton
accessibilityLabel.*[Ll]ink
accessibilityLabel.*[Tt]ab
accessibilityLabel.*[Mm]enu
accessibilityLabel.*[Ff]ield
accessibilityLabel.*[Ii]nput
```

**iOS - State Redundancy:**
```regex
accessibilityValue.*"Selected"
accessibilityValue.*"Not selected"
accessibilityValue.*"On"
accessibilityValue.*"Off"
```

**Web:**
```regex
aria-label=".*[Bb]utton"
aria-label=".*[Ll]ink"
aria-label=".*[Ss]elected"
>.*Button</button>
>.*Link</a>
```

### Manual Testing

1. Enable screen reader (TalkBack, VoiceOver, NVDA)
2. Navigate through interface
3. Listen for redundant announcements:

   **Role Redundancy:**
   - "X Button, button"
   - "X Link, link"
   - "X Tab, tab"

   **State Redundancy:**
   - "Selected, selected"
   - "On, switch, on"
   - "Red color selected, button, selected"

   **Position Redundancy:**
   - "Home, 1 of 4, tab, 1 of 4"
   - "Item 5, 5 of 10"

   **Property Redundancy:**
   - "Username input field, text field"
   - "Elapsed time: 00:42, 00:42"

4. Document each occurrence

---

## Audit Report Template

**Title:** Accessible labels include redundant role names

**Severity:** Low to Medium (depends on frequency)

**Description:**
Multiple interactive elements include the role type in their accessible labels, causing redundant screen reader announcements. For example, a button labeled "Close Button" is announced as "Close Button, button" by screen readers.

**Locations:**
- File: `LoginScreen.kt`, Line 45 - Button with contentDescription "Login Button"
- File: `Navigation.swift`, Line 78 - Link with accessibilityLabel "Home Link"
- File: `Settings.tsx`, Line 120 - Checkbox with label "Agree Checkbox"

**Current Behavior:**
```
TalkBack/VoiceOver announces:
- "Login Button, button"
- "Home Link, link"
- "Agree Checkbox, checkbox"
```

**Expected Behavior:**
```
Should announce:
- "Login, button"
- "Home, link"
- "Agree, checkbox"
```

**Fix:**
Remove role names from accessible labels. The screen reader automatically announces the role.

**Before:**
```kotlin
Button(onClick = { login() }) {
    Text("Login Button")
}
```

**After:**
```kotlin
Button(onClick = { login() }) {
    Text("Login")
}
```

**WCAG SC:** 4.1.2 Name, Role, Value (Level A) - Names should be clear and concise
**Priority:** Medium (if widespread), Low (if isolated)

---

## Testing Checklist

### Code Review
- [ ] Search codebase for labels ending in "Button", "Link", "Tab", etc.
- [ ] Check button labels for "Button" suffix
- [ ] Check link labels for "Link" suffix
- [ ] Check form control labels for type suffixes
- [ ] Review icon buttons and icon-only controls

### Screen Reader Testing
- [ ] Enable TalkBack (Android) or VoiceOver (iOS)
- [ ] Navigate through all interactive elements
- [ ] Listen for double-announced roles
- [ ] Document all instances of redundant announcements
- [ ] Verify fixes eliminate redundancy

---

## Best Practices

### 1. Focus on Action or Purpose

Labels should describe **what happens** or **what it is**, not **what type** it is:

- ✅ "Close" - Clear action
- ✅ "Submit Form" - Clear action with context
- ✅ "Search" - Clear purpose
- ❌ "Close Button" - Includes type

### 2. Use Descriptive, Concise Labels

- ✅ "Add to Cart"
- ✅ "Download Report"
- ✅ "Delete Item"
- ❌ "Add to Cart Button"

### 3. Context is Better Than Role

When clarification is needed, add context, not role:

- ❌ "Download Link"
- ✅ "Download PDF" or "Download as PDF"

### 4. Check Native Components

Even native components can have this issue if you override their labels:

```kotlin
// ❌ WRONG
Tab(
    selected = isSelected,
    onClick = onClick,
    text = { Text("Home Tab") }  // Don't add "Tab"
)

// ✅ CORRECT
Tab(
    selected = isSelected,
    onClick = onClick,
    text = { Text("Home") }
)
```

---

## Common Offenders

### Most Frequent Mistakes:

1. **"Button" suffix** - "Close Button", "Submit Button", "Cancel Button"
2. **"Link" suffix** - "Read More Link", "Home Link"
3. **"Tab" suffix** - "Profile Tab", "Settings Tab"
4. **"Menu" suffix** - "File Menu", "Options Menu"
5. **"Checkbox" suffix** - "Agree Checkbox", "Remember Me Checkbox"

### Why This Happens:

- Developers thinking literally about the element
- Copying labels from design mockups that include types
- Misunderstanding accessibility requirements
- Not testing with actual screen readers
- Following bad examples from tutorials

---

## WCAG Success Criteria

**4.1.2 Name, Role, Value (Level A)**
- User interface components have names that clearly identify their purpose
- Redundant role information in names is unnecessary and reduces clarity

**2.4.6 Headings and Labels (Level AA)**
- Labels describe the purpose of the element
- Role is programmatically determinable separately from the label

---

## Impact

**Without this fix:**
- Every interactive element announced twice creates cognitive overload
- Sounds unprofessional and indicates poor accessibility
- Takes longer to navigate interface
- Creates confusion about element purpose

**With this fix:**
- Clean, concise announcements
- Professional accessibility implementation
- Faster navigation
- Clear understanding of element purpose
- Better user experience

---

## Summary

**Key Rules:**

### 1. NO Role Names
Never include the role name in the accessible label. Screen readers announce the role automatically.
- ❌ "Close Button" → ✅ "Close"
- ❌ "Home Tab" → ✅ "Home"
- ❌ "Username input field" → ✅ "Username"

### 2. NO State Information
Never add state to labels/values for components that announce state automatically.
- ❌ `stateDescription = "Selected"` on Tab → ✅ Remove (Tab announces selection)
- ❌ `stateDescription = "On"` on Switch → ✅ Remove (Switch announces state)
- ❌ `accessibilityValue = "Selected"` on Toggle → ✅ Use `.isSelected` trait instead
- ✅ **EXCEPTION:** Sliders and progress indicators need custom value formatting

### 3. NO Position Information
Never add position info for components that announce position automatically.
- ❌ `contentDescription = "Home, 1 of 4"` on Tab → ✅ Remove (Tab announces position)
- ❌ List item position → ✅ Remove (LazyColumn/ScrollView announces automatically)

### 4. NO Context That Duplicates Visible Text or Role
If the button text says "Pause", don't add "Pause stopwatch" as contentDescription.
- ❌ `contentDescription = "Elapsed time: 00:42"` when text shows "00:42"
- ✅ Just use `liveRegion` to make updates announced

---

## Quick Reference Card

| Component | ❌ WRONG | ✅ CORRECT |
|-----------|----------|------------|
| **Tab** | `contentDescription = "Home tab, 1 of 4"`<br/>`stateDescription = "Selected"` | No manual semantics<br/>(Tab handles all) |
| **Button** | `contentDescription = "Close button"` | `contentDescription = "Close"` |
| **Switch/Toggle** | `stateDescription = "On"`<br/>`accessibilityValue = "Off"` | No state info<br/>(Component announces) |
| **Color Picker** | `contentDescription = "Red, selected"` | `contentDescription = "Red"`<br/>`selected = true` (Android)<br/>`.isSelected` trait (iOS) |
| **TextField** | `contentDescription = "Username input field"` | No manual contentDescription<br/>(TextField announces role) |
| **Slider** | `contentDescription = "Brightness level"` | ✅ `stateDescription = "50 percent"`<br/>(Value needed!) |
| **Button Text** | Button text: "Pause"<br/>`contentDescription = "Pause stopwatch"` | Button text: "Pause"<br/>No contentDescription<br/>(visible text sufficient) |

---

## Testing Checklist

### During Code Review
- [ ] Search for role names in labels ("button", "link", "tab", "field", "input")
- [ ] Search for state in stateDescription/accessibilityValue ("selected", "on", "off")
- [ ] Search for position info in contentDescription ("1 of 4", "item 5")
- [ ] Check TextField/Input components for "input field" or "text field" suffixes
- [ ] Check Button components for contentDescription that duplicates visible text
- [ ] Verify Tabs have NO manual semantics (let Tab handle it)
- [ ] Verify Switches/Toggles have NO state information
- [ ] Confirm Sliders DO have custom value formatting

### With Screen Reader
- [ ] Enable TalkBack (Android) or VoiceOver (iOS)
- [ ] Navigate through all interactive elements
- [ ] Listen for:
  - Double role announcements ("Button, button")
  - Double state announcements ("Selected, selected")
  - Double position announcements ("1 of 4, 1 of 4")
  - Redundant context ("Username input field, text field")
- [ ] Document all instances
- [ ] Verify fixes eliminate redundancy

---

## Test Command

**Enable screen reader and listen. If you hear anything twice, fix the label.**

Examples of what to listen for:
- "X Button, button" → Remove "Button" from label
- "Selected, selected" → Remove stateDescription/accessibilityValue
- "1 of 4, tab, 1 of 4" → Remove position from contentDescription
- "Username input field, text field" → Remove "input field" from label
