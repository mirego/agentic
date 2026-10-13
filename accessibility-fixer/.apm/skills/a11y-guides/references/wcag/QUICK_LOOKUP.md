# WCAG 2.2 Quick Lookup Tables
## Fast reference for common audit scenarios

---

## By User Need

### Blind / Screen Reader Users

| Need | WCAG SC | Check For |
|------|---------|-----------|
| Know what images show | 1.1.1 (A) | All images have alt text or are marked decorative |
| Understand structure | 1.3.1 (A) | Headings, lists, landmarks properly marked up |
| Navigate efficiently | 2.4.1 (A), 2.4.6 (AA) | Skip links, clear headings |
| Know button purpose | 4.1.2 (A), 2.4.4 (A) | All buttons/links labeled descriptively |
| Use keyboard/switch | 2.1.1 (A), 2.1.2 (A) | All functionality keyboard accessible, no traps |
| Know control states | 4.1.2 (A) | Checked, expanded, selected states announced |
| Hear status changes | 4.1.3 (AA) | Toasts, loading, errors announced |
| Understand forms | 3.3.2 (A) | Labels always visible (not just placeholder) |
| Fix form errors | 3.3.1 (A), 3.3.3 (AA) | Errors identified and explained |
| Navigate lists easily | 1.3.1 (A), 4.1.2 (A) | List items grouped (see COLLECTION_ITEMS_PATTERN.md) |

### Low Vision Users

| Need | WCAG SC | Check For |
|------|---------|-----------|
| Read text clearly | 1.4.3 (AA) | Sufficient color contrast (4.5:1 or 3:1) |
| Enlarge text | 1.4.4 (AA), 1.4.12 (AA) | Text scales up to 200% without breaking |
| See UI controls | 1.4.11 (AA) | Buttons, inputs visible (3:1 contrast) |
| Track focus | 2.4.7 (AA), 2.4.11 (AA) | Focus indicator visible and not obscured |
| No horizontal scroll | 1.4.10 (AA) | Content reflows, no horizontal scrolling |
| Adjust spacing | 1.4.12 (AA) | UI adapts to text spacing changes |

### Motor / Mobility Impairments

| Need | WCAG SC | Check For |
|------|---------|-----------|
| Use keyboard | 2.1.1 (A) | All functionality via keyboard |
| Large tap targets | 2.5.8 (AA) | Minimum 24x24px, recommend 48x48 |
| Cancel accidental taps | 2.5.2 (A) | Actions on release, not touch down |
| Avoid complex gestures | 2.5.1 (A) | Single-pointer alternatives |
| No drag-only | 2.5.7 (AA) | Button alternatives for dragging |
| No shake-only | 2.5.4 (A) | Alternative to motion actuation |
| Enough time | 2.2.1 (A) | Can extend time limits |

### Cognitive / Learning Disabilities

| Need | WCAG SC | Check For |
|------|---------|-----------|
| Clear labels | 2.4.6 (AA), 3.3.2 (A) | Descriptive headings and labels |
| Consistent navigation | 3.2.3 (AA), 3.2.4 (AA) | Navigation consistent across screens |
| Predictable behavior | 3.2.1 (A), 3.2.2 (A) | No unexpected changes on focus/input |
| Error help | 3.3.3 (AA) | Suggestions to fix errors |
| Clear instructions | 3.3.2 (A) | Instructions provided when needed |
| Review before submit | 3.3.4 (AA) | Confirmation for important actions |
| No redundant entry | 3.3.7 (A) | Autofill and remember previous entries |
| Simple authentication | 3.3.8 (AA) | Biometric, password manager support |

### Deaf / Hard of Hearing Users

| Need | WCAG SC | Check For |
|------|---------|-----------|
| Captions | 1.2.2 (A), 1.2.4 (AA) | Captions for all video content |
| Audio alternatives | 1.2.1 (A) | Transcripts for audio-only content |
| Visual indicators | 1.4.1 (A) | Don't rely on sound alone for info |
| Control audio | 1.4.2 (A) | Can pause/stop auto-playing audio |

---

## By Component Type - Quick Reference

### Buttons
- [ ] 2.4.4 (A) - Purpose clear from label
- [ ] 2.5.8 (AA) - At least 24x24px
- [ ] 4.1.2 (A) - Has label, role, disabled state
- [ ] Don't include "button" in label (see AVOID_ROLE_IN_LABEL.md)

### Images
- [ ] 1.1.1 (A) - Alt text or marked decorative
- [ ] See DECORATIVE_IMAGE_DECISION_TREE.md

### Form Inputs
- [ ] 1.3.1 (A), 3.3.2 (A) - Has associated label (not just placeholder)
- [ ] 1.3.5 (AA) - Proper input type/autofill
- [ ] 3.3.1 (A) - Errors identified
- [ ] 3.3.3 (AA) - Error suggestions provided

### Links
- [ ] 1.4.1 (A) - Not distinguished by color alone
- [ ] 2.4.4 (A) - Purpose clear from text
- [ ] See REPEATED_ELEMENTS_CONTEXT.md for repeated links

### Collections (Lists/Grids)
- [ ] 1.3.1 (A) - Items grouped as single units
- [ ] 4.1.2 (A) - All content merged into item label
- [ ] See COLLECTION_ITEMS_PATTERN.md

### Tabs
- [ ] 1.3.1 (A), 4.1.2 (A) - Tab role, selected state, position
- [ ] See BUTTONS_ACTING_AS_TABS.md

### Modals
- [ ] 2.1.2 (A) - Can be closed with keyboard
- [ ] 2.4.3 (A) - Focus managed correctly

### Text
- [ ] 1.4.3 (AA) - Sufficient contrast
- [ ] 1.4.4 (AA) - Scales with system settings
- [ ] See FONT_SCALING_SUPPORT.md

---

## By Platform - Quick Implementation Reference

### Android XML
```xml
<!-- Button with label -->
<Button android:text="Save" />

<!-- Image with description -->
<ImageView android:contentDescription="@string/profile_picture" />

<!-- Decorative image -->
<ImageView android:importantForAccessibility="no" />

<!-- Heading -->
<TextView android:accessibilityHeading="true" />

<!-- Collection item grouping -->
<LinearLayout android:screenReaderFocusable="true">
    <ImageView android:importantForAccessibility="no" />
    <TextView android:importantForAccessibility="no" />
</LinearLayout>

<!-- Live region -->
<TextView android:accessibilityLiveRegion="polite" />

<!-- Touch target -->
<Button android:minWidth="48dp" android:minHeight="48dp" />

<!-- Text scaling -->
<TextView android:textSize="16sp" />

<!-- Input with label -->
<com.google.android.material.textfield.TextInputLayout>
    <com.google.android.material.textfield.TextInputEditText
        android:hint="Email"
        android:autofillHints="emailAddress" />
</com.google.android.material.textfield.TextInputLayout>
```

### Android Compose
```kotlin
// Button
Button(onClick = { }) {
    Text("Save")
}

// Image with description
Image(
    painter = painterResource(R.drawable.profile),
    contentDescription = "Profile picture"
)

// Decorative image
Image(
    painter = painterResource(R.drawable.decoration),
    contentDescription = null
)

// Heading
Text(
    "Section Title",
    modifier = Modifier.semantics { heading() }
)

// Collection item grouping
Card(
    modifier = Modifier.semantics(mergeDescendants = true) {
        contentDescription = "Recipe: Chocolate Cake. Rating: 4 stars"
    }
) {
    // Child content
}

// Announcement
LaunchedEffect(success) {
    if (success) {
        context.findActivity()?.window?.decorView
            ?.announceForAccessibility("Order placed successfully")
    }
}

// Touch target
IconButton(modifier = Modifier.size(48.dp)) { }

// Text scaling - use MaterialTheme typography
Text("Body text", style = MaterialTheme.typography.bodyLarge)
```

### iOS (Swift)
```swift
// Button
let button = UIButton()
button.setTitle("Save", for: .normal)

// Image with label
imageView.isAccessibilityElement = true
imageView.accessibilityLabel = "Profile picture"

// Decorative image
imageView.isAccessibilityElement = false

// Heading
label.accessibilityTraits = .header

// Collection cell grouping
cell.isAccessibilityElement = true
cell.accessibilityLabel = "Recipe: Chocolate Cake. Rating: 4 stars"
cell.shouldGroupAccessibilityChildren = true

// Announcement
UIAccessibility.post(
    notification: .announcement,
    argument: "Order placed successfully"
)

// Touch target - minimum 44x44pt
button.frame = CGRect(x: 0, y: 0, width: 44, height: 44)

// Text scaling - support Dynamic Type
label.font = UIFont.preferredFont(forTextStyle: .body)
label.adjustsFontForContentSizeCategory = true

// Input with label
let emailLabel = UILabel()
emailLabel.text = "Email"
emailField.accessibilityLabel = "Email"
emailField.textContentType = .emailAddress
```

### iOS (SwiftUI)
```swift
// Button
Button("Save") { }

// Image with label
Image("profile")
    .accessibilityLabel("Profile picture")

// Decorative image
Image("decoration")
    .accessibilityHidden(true)

// Heading
Text("Section Title")
    .accessibilityAddTraits(.isHeader)

// Collection item grouping
VStack {
    // Content
}
.accessibilityElement(children: .combine)
.accessibilityLabel("Recipe: Chocolate Cake. Rating: 4 stars")

// Announcement
.onAppear {
    let announcement = NSAttributedString(string: "Order placed")
    UIAccessibility.post(notification: .announcement, argument: announcement)
}

// Touch target
Button(action: {}) {
    Image(systemName: "plus")
}.frame(minWidth: 44, minHeight: 44)

// Text scaling - automatic with .font()
Text("Body text")
    .font(.body)

// Input with label
TextField("Email", text: $email)
    .textContentType(.emailAddress)
```

### React Native
```javascript
// Button
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Save">
  <Text>Save</Text>
</TouchableOpacity>

// Image with label
<Image
  source={profilePic}
  accessible={true}
  accessibilityLabel="Profile picture"
/>

// Decorative image
<Image source={decoration} accessible={false} />

// Heading
<Text
  accessible={true}
  accessibilityRole="header">
  Section Title
</Text>

// Collection item grouping
<View
  accessible={true}
  accessibilityLabel="Recipe: Chocolate Cake. Rating: 4 stars">
  <Image accessible={false} />
  <Text accessible={false}>Chocolate Cake</Text>
</View>

// Announcement
import { AccessibilityInfo } from 'react-native';
AccessibilityInfo.announceForAccessibility('Order placed successfully');

// Touch target
<TouchableOpacity style={{minWidth: 48, minHeight: 48}} />

// Text scaling
import { PixelRatio } from 'react-native';
const fontScale = PixelRatio.getFontScale();
<Text style={{fontSize: 16 * fontScale}}>Body text</Text>

// Input with label
<View>
  <Text>Email</Text>
  <TextInput
    accessibilityLabel="Email"
    textContentType="emailAddress"
    autoCompleteType="email"
  />
</View>
```

### Flutter
```dart
// Button
ElevatedButton(
  onPressed: () {},
  child: Text('Save'),
)

// Image with label
Semantics(
  label: 'Profile picture',
  child: Image.asset('profile.png'),
)

// Decorative image
ExcludeSemantics(
  child: Image.asset('decoration.png'),
)

// Heading
Semantics(
  header: true,
  child: Text('Section Title'),
)

// Collection item grouping
MergeSemantics(
  child: Card(
    child: Column(
      children: [
        Image.asset('cake.png'),
        Text('Chocolate Cake'),
      ],
    ),
  ),
)
// Or explicit:
Semantics(
  label: 'Recipe: Chocolate Cake. Rating: 4 stars',
  button: true,
  child: Card(/* ... */),
)

// Announcement
import 'package:flutter/services.dart';
SemanticsService.announce('Order placed', TextDirection.ltr);

// Touch target
SizedBox(
  width: 48,
  height: 48,
  child: IconButton(/* ... */),
)

// Text scaling
Text(
  'Body text',
  style: Theme.of(context).textTheme.bodyLarge,
)
// Or:
MediaQuery.of(context).textScaleFactor

// Input with label
TextFormField(
  decoration: InputDecoration(
    labelText: 'Email',
  ),
  keyboardType: TextInputType.emailAddress,
  autofillHints: [AutofillHints.email],
)
```

---

## By WCAG Level - What to Test

### Level A (Essential - Must Pass)
These are critical, blocking issues:
- [ ] 1.1.1 - All images have alt text
- [ ] 1.2.1, 1.2.2, 1.2.3 - Media alternatives/captions
- [ ] 1.3.1 - Structure (headings, lists, groupings)
- [ ] 1.3.2 - Meaningful sequence
- [ ] 1.3.3 - Sensory characteristics not sole method
- [ ] 1.4.1 - Color not sole indicator
- [ ] 1.4.2 - Audio control
- [ ] 2.1.1 - Keyboard accessible
- [ ] 2.1.2 - No keyboard trap
- [ ] 2.1.4 - Character key shortcuts
- [ ] 2.2.1 - Timing adjustable
- [ ] 2.2.2 - Pause, stop, hide
- [ ] 2.3.1 - No flashing
- [ ] 2.4.1 - Bypass blocks
- [ ] 2.4.2 - Screen titles
- [ ] 2.4.3 - Focus order
- [ ] 2.4.4 - Link purpose in context
- [ ] 2.5.1 - Pointer gesture alternatives
- [ ] 2.5.2 - Pointer cancellation
- [ ] 2.5.3 - Label in name
- [ ] 2.5.4 - Motion actuation alternative
- [ ] 3.1.1 - Language of page
- [ ] 3.2.1 - On focus no context change
- [ ] 3.2.2 - On input no context change
- [ ] 3.2.6 - Consistent help (NEW 2.2)
- [ ] 3.3.1 - Error identification
- [ ] 3.3.2 - Labels or instructions
- [ ] 3.3.7 - Redundant entry (NEW 2.2)
- [ ] 4.1.2 - Name, role, value (MOST VIOLATED)

### Level AA (Standard Target - Should Pass)
These are important, typical compliance target:
- [ ] 1.2.4 - Captions (live)
- [ ] 1.2.5 - Audio description
- [ ] 1.3.4 - Orientation
- [ ] 1.3.5 - Identify input purpose
- [ ] 1.4.3 - Contrast minimum (4.5:1 / 3:1)
- [ ] 1.4.4 - Resize text (up to 200%)
- [ ] 1.4.5 - Images of text
- [ ] 1.4.10 - Reflow
- [ ] 1.4.11 - Non-text contrast (3:1)
- [ ] 1.4.12 - Text spacing
- [ ] 1.4.13 - Content on hover/focus
- [ ] 2.4.5 - Multiple ways
- [ ] 2.4.6 - Headings and labels
- [ ] 2.4.7 - Focus visible
- [ ] 2.4.11 - Focus not obscured minimum (NEW 2.2)
- [ ] 2.5.7 - Dragging movements alternative (NEW 2.2)
- [ ] 2.5.8 - Target size minimum 24px (NEW 2.2)
- [ ] 3.1.2 - Language of parts
- [ ] 3.2.3 - Consistent navigation
- [ ] 3.2.4 - Consistent identification
- [ ] 3.3.3 - Error suggestion
- [ ] 3.3.4 - Error prevention (legal/financial)
- [ ] 3.3.8 - Accessible authentication (NEW 2.2)
- [ ] 4.1.3 - Status messages

### Level AAA (Enhanced - Optional)
Only test if specifically required:
- 1.4.6, 1.4.7 - Enhanced contrast
- 2.4.8, 2.4.9, 2.4.10 - Enhanced navigation
- 2.5.5 - Target size 44px
- 3.3.5, 3.3.6 - Enhanced error prevention
- Others...

---

## By Test Method

### Screen Reader Testing
**What to check:**
- All content announced
- Announcements clear and concise
- Navigation order logical
- States announced (checked, selected, expanded)
- Status messages announced
- Grouping correct (collections)

**How:**
- Android: Enable TalkBack
- iOS: Enable VoiceOver
- Navigate through entire app
- Test all interactions

### Visual Inspection
**What to check:**
- Color contrast (use tools)
- Focus indicators visible
- Text size scaling (increase system setting)
- Touch target sizes
- Layout at different screen sizes
- Both light and dark mode

### Keyboard/Switch Testing
**What to check:**
- All functionality accessible
- No focus traps
- Focus order logical
- Focus visible
- No keyboard-only difficulties

**How:**
- Connect external keyboard
- Enable Switch Control/Access
- Navigate using only keyboard/switch

### Manual Code Review
**What to check:**
- Accessibility properties set
- Proper component usage
- Collections properly grouped
- Live regions for announcements
- Autofill hints present
- Contrast calculations

---

## Common Audit Report Sections

### Section Order (by severity):
1. **Critical Issues** - Block core functionality
2. **High Priority Issues** - Significantly impair experience
3. **Medium Priority Issues** - Degrade experience
4. **Low Priority Issues** - Minor enhancements

### Within Each Section:
Group by WCAG SC or component type:
- 4.1.2 Name, Role, Value Issues
- 1.4.3 Color Contrast Issues
- 2.5.8 Touch Target Issues
- Etc.

### Each Issue Should Include:
1. **Issue Title** - Brief, descriptive
2. **WCAG SC** - Which criterion(s) violated
3. **Severity** - Critical/High/Medium/Low
4. **Location** - File path and line numbers
5. **Description** - What's wrong
6. **User Impact** - How it affects users
7. **Recommendation** - How to fix
8. **Code Example** - Current and corrected code

---

## Quick Decision Trees

### Is this image decorative?
1. Does it convey information needed to understand content? → NO = Decorative
2. Is it only for visual appeal/decoration? → YES = Decorative
3. Is information also available in text? → YES = Decorative
4. Not sure? → Report as LOW, note "verify if decorative"

See: [Decorative Image Decision Tree](../patterns/DECORATIVE_IMAGE_DECISION_TREE.md)

### Should collection items be grouped?
1. Is this in a RecyclerView/LazyColumn/UITableView/FlatList? → YES
2. Should users interact with item as whole? → YES
3. Then: Group as single focusable unit

See: [Collection Items Pattern](../patterns/COLLECTION_ITEMS_PATTERN.md)

### Do repeated elements need context?
1. Are there multiple buttons with same label ("View", "Edit")? → YES
2. Would screen reader user know which item each refers to? → NO
3. Then: Add context from parent item

See: [Repeated Elements Context](../patterns/REPEATED_ELEMENTS_CONTEXT.md)

### What severity is this issue?
1. Does it block core functionality? → Critical
2. Level A violation? → Usually Critical or High
3. Makes feature difficult but not impossible? → High
4. Level AA violation? → Usually High or Medium
5. Causes inconvenience? → Medium
6. Minor enhancement? → Low

See: [Severity Guidelines](SEVERITY_GUIDELINES.md)

---

## Official Resources Quick Links

- **WCAG 2.2:** https://www.w3.org/TR/WCAG22/
- **Understanding WCAG 2.2:** https://www.w3.org/WAI/WCAG22/Understanding/
- **How to Meet WCAG (Quick Reference):** https://www.w3.org/WAI/WCAG22/quickref/
- **WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
- **Mobile Accessibility:** https://www.w3.org/TR/mobile-accessibility-mapping/

---

## Related Guides
- [WCAG Principles](.) - Detailed SC descriptions
- [Component Mappings](COMPONENT_WCAG_MAPPINGS.md) - Component-specific guidance
- [Severity Guidelines](SEVERITY_GUIDELINES.md) - Detailed severity rules
- [Mobile Interpretation](MOBILE_WCAG_INTERPRETATION.md) - WCAG for native apps
- [Pattern Guides](../patterns/) - Implementation patterns
- Platform guides for detailed implementation
