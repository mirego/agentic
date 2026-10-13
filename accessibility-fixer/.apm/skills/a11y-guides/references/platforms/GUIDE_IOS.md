# iOS & tvOS Accessibility Audit Guide

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


## Key Code Patterns to Check

### 1. Accessibility Labels - IMPORTANT: Check Collection Context First

> 📖 **See pattern guide for decorative images:** [Decorative Image Decision Tree](patterns/DECORATIVE_IMAGE_DECISION_TREE.md)

**⚠️ CRITICAL:** Before flagging missing accessibilityLabel, determine if the element is part of a collection item (UICollectionViewCell, UITableViewCell, LazyVGrid card).

**Decision Tree:**
1. **Is this element part of a collection item (cell in a list/grid)?**
   - YES → Skip to Section 5a (Collection Items) - merge at parent level, mark children as not accessible
   - NO → Continue to step 2

2. **Is this image clearly decorative?** (gradient, background, border, divider, shadow)
   - YES → Skip reporting, don't include in audit
   - UNSURE → Create LOW priority issue, note "fix only if not decorative"
   - NO (conveys information) → Continue to step 3
   - **See pattern guide above for complete triage process and platform-specific examples**

3. **Is this the ONLY content in a button/interactive element?**
   - YES → CRITICAL issue, MUST have accessibilityLabel
   - NO → Apply standard accessibilityLabel rules below

4. **Is this element standalone (not in a collection)?**
   - YES → Require accessibilityLabel as shown below

**Issue:** Missing accessibilityLabel on **standalone** interactive elements

```swift
// ❌ ISSUE: Standalone button with icon but no label
let playButton = UIButton()
playButton.setImage(UIImage(named: "play"), for: .normal)

// ✅ CORRECT: Descriptive label (standalone button)
let playButton = UIButton()
playButton.setImage(UIImage(named: "play"), for: .normal)
playButton.accessibilityLabel = "Play"

// ✅ CORRECT: Decorative image
decorativeImageView.isAccessibilityElement = false
```

**❌ DO NOT flag for missing accessibilityLabel:**
- Images/buttons/labels inside UICollectionViewCell or UITableViewCell
- Sub-views of collection items that will be merged (see Section 5a)
- Elements that are part of a larger grouped component

**✅ DO flag for missing accessibilityLabel:**
- Images that are the ONLY content in buttons (CRITICAL priority)
- Standalone interactive icons not part of collections
- Navigation bar items
- Toolbar buttons
- Tab bar items
- Alert/modal buttons
- Images conveying information (status icons, informational graphics)

**🎨 Clearly Decorative - DON'T Report:**
- Gradient overlays
- Background images that are purely aesthetic
- Decorative borders or dividers
- Shadow/blur effects
- Pattern backgrounds
- Decorative spacer images

**❓ Unsure if Decorative - LOW Priority:**
- Images that might convey branding but information is elsewhere
- Corner badges when content info is in text
- Decorative indicators when status is conveyed through text
- **Recommendation text:** "Verify if this image is decorative. If so, set `isAccessibilityElement = false`. If it conveys information, add appropriate accessibilityLabel."

**WCAG SC:** 1.1.1 Non-text Content (Level A), 4.1.2 Name, Role, Value (Level A)

---

### 2. Accessibility Hints

**Issue:** Interactive elements without usage hints

```swift
// ✅ CORRECT: Using hint to clarify interaction
let playButton = UIButton()
playButton.accessibilityLabel = "Play video"
playButton.accessibilityHint = "Double-tap to start playing the video"
playButton.accessibilityTraits = .button

// SwiftUI
Button("Play") {
    playVideo()
}
.accessibilityLabel("Play video")
.accessibilityHint("Double-tap to start playing")

// ⚠️ Use hints sparingly - only when interaction isn't obvious
// DON'T use for standard buttons where behavior is clear
```

**When to use hints:**
- ✅ Custom gestures or non-standard interactions
- ✅ Actions with non-obvious results
- ❌ Standard buttons (Submit, Cancel, Close)
- ❌ When the label makes the action clear

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 3. Accessibility Labels (SwiftUI)

```swift
// ❌ ISSUE: Image without label
Image("play")
    .onTapGesture { play() }

// ✅ CORRECT: Descriptive label
Image("play")
    .accessibilityLabel("Play")
    .onTapGesture { play() }

// ✅ CORRECT: Button with automatic label
Button("Play") {
    play()
}

// ✅ CORRECT: Decorative image
Image("decorative")
    .accessibilityHidden(true)
```

**WCAG SC:** 1.1.1 Non-text Content (Level A)

---

### 4. Accessibility Traits

**Issue:** Custom interactive views without proper traits

```swift
// ❌ ISSUE: Custom interactive view without proper trait
let customButton = UIView()
customButton.isAccessibilityElement = true
customButton.accessibilityLabel = "Submit"
// Missing: button trait

// ✅ CORRECT: Proper trait for interactive element
let customButton = UIView()
customButton.isAccessibilityElement = true
customButton.accessibilityLabel = "Submit"
customButton.accessibilityTraits = .button

// SwiftUI
Text("Submit")
    .accessibilityAddTraits(.isButton)
    .onTapGesture { submit() }
```

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

**Common Traits:**
- `.button` - Interactive button
- `.header` - Section heading
- `.link` - Navigation link
- `.searchField` - Search input
- `.image` - Image content
- `.adjustable` - Adjustable value (slider, picker)
- `.selected` - Selected state
- `.playsSound` - Plays audio
- `.updatesFrequently` - Frequently changing content

---

### 5. Headings

```swift
// ❌ ISSUE: Section title without heading trait
let titleLabel = UILabel()
titleLabel.text = "Settings"
titleLabel.font = .preferredFont(forTextStyle: .headline)

// ✅ CORRECT: Marked as heading
let titleLabel = UILabel()
titleLabel.text = "Settings"
titleLabel.font = .preferredFont(forTextStyle: .headline)
titleLabel.accessibilityTraits = .header

// SwiftUI
Text("Settings")
    .font(.headline)
    .accessibilityAddTraits(.isHeader)
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A)

---

### 6. Grouping Elements

**Issue:** Related elements announced separately

```swift
// ❌ ISSUE: Multiple elements read separately
VStack {
    Image(systemName: "star.fill")
    Text("Rating: 4.5")
}

// ✅ CORRECT: Grouped for VoiceOver
VStack {
    Image(systemName: "star.fill")
    Text("Rating: 4.5")
}
.accessibilityElement(children: .combine)
.accessibilityLabel("Rating: 4.5 stars")

// UIKit
let containerView = UIView()
containerView.isAccessibilityElement = true
containerView.accessibilityLabel = "Rating: 4.5 stars"
// Add icon and label as subviews
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A)

---

### 6a. Collection Items (UICollectionView, LazyVGrid, List)

> 📖 **See detailed pattern guide:** [Collection Items Pattern](patterns/COLLECTION_ITEMS_PATTERN.md)
>
> This section provides iOS-specific implementation. See the pattern guide for:
> - Complete explanation and examples
> - Cross-platform implementations
> - Testing strategies
> - Impact analysis

**Issue:** Collection items with multiple sub-views require multiple swipes to navigate

**⚠️ CRITICAL Requirements:**
1. Items in grids, rows, or lists should be treated as **a whole unit**
2. Users should NOT have to swipe multiple times through sub-views
3. **Parent container MUST be interactive** - Use `Button(action: ...)` or `.onTapGesture` (SwiftUI), or ensure tap handler is set (UIKit)

**🚫 Avoid Contradictory Guidance:** DO NOT flag child views for missing labels if recommending parent-level merging.

#### iOS Implementation

**SwiftUI:**
```swift
// ✅ CORRECT: Merged accessibility for TV show card
HStack {
    AsyncImage(url: show.posterURL)
    VStack(alignment: .leading) {
        Text(show.title)
        Text("Season \(show.season)")
        Text("Episode \(show.episode)")
        Image(show.channelLogo)
        ProgressView(value: show.watchProgress)
    }
}
.accessibilityElement(children: .combine)
.accessibilityLabel("""
    \(show.title), \(show.episodeName), \
    Season \(show.season), Episode \(show.episode), \
    on \(show.channelName), \
    \(Int(show.watchProgress * 100)) percent watched
""")
.onTapGesture { openShow() }
```

**UIKit (UICollectionViewCell):**
```swift
class ShowCell: UICollectionViewCell {
    func configure(with show: Show) {
        self.isAccessibilityElement = true
        self.accessibilityTraits = .button
        self.accessibilityLabel = """
            \(show.title), \(show.episodeName), \
            Season \(show.season), Episode \(show.episode), \
            on \(show.channelName), \
            \(Int(show.watchProgress * 100)) percent watched
        """

        // Hide all child elements from VoiceOver
        posterImageView.isAccessibilityElement = false
        titleLabel.isAccessibilityElement = false
        seasonLabel.isAccessibilityElement = false
        episodeLabel.isAccessibilityElement = false
        channelImageView.isAccessibilityElement = false
        progressView.isAccessibilityElement = false
    }
}
```

**Custom Accessibility Actions:**
```swift
// SwiftUI
.accessibilityAction(named: "Add to favorites") {
    addToFavorites(show)
}

// UIKit
cell.accessibilityCustomActions = [
    UIAccessibilityCustomAction(
        name: "Add to favorites",
        target: self,
        selector: #selector(addToFavorites)
    )
]
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.4 Link Purpose (In Context) (Level A)

---

### 7. Text Input Labels

> ⚠️ **IMPORTANT:** TextField/SecureField with a placeholder/label parameter does NOT need additional accessibilityLabel. See [Avoid Redundant Information](patterns/AVOID_ROLE_IN_LABEL.md).

**Issue:** Placeholder used as only label

```swift
// ❌ ISSUE: Placeholder used as only label in UIKit
let textField = UITextField()
textField.placeholder = "Email address"
// UIKit placeholders are accessible, but visible labels are better UX

// ✅ BETTER: Use a visible UILabel (best practice)
let emailLabel = UILabel()
emailLabel.text = "Email address"
let textField = UITextField()
textField.placeholder = "example@email.com"
// Label remains visible when typing

// SwiftUI - ✅ CORRECT: TextField with label parameter
TextField("Email address", text: $email)
// VoiceOver announces: "Email address, text field" ✓
// NO additional accessibilityLabel needed!

// ❌ WRONG: Adding redundant accessibilityLabel
TextField("Email address", text: $email)
    .accessibilityLabel("Email address text field")  // ❌ Redundant!
// VoiceOver announces: "Email address text field, text field" - says "text field" TWICE!

// ✅ CORRECT: TextField without additional semantics
TextField("Username", text: $username)
    .autocapitalization(.none)
// VoiceOver announces: "Username, text field" ✓

// ✅ CORRECT: SecureField without additional semantics
SecureField("Password", text: $password)
// VoiceOver announces: "Password, secure text field" ✓

// ✅ BEST: Use Form with explicit label
Form {
    Section(header: Text("Contact")) {
        TextField("example@email.com", text: $email)
        // NO accessibilityLabel needed - section header provides context
    }
}
```

**WCAG SC:** 3.3.2 Labels or Instructions (Level A)

---

### 8. Dynamic Content Announcements

**Issue:** Status changes not announced

> ⚠️ **IMPORTANT:** Announcements and live regions are for content that updates WITHOUT direct user interaction. Do NOT use for user-initiated changes like tab switching, button clicks, or form submissions.

**When to use announcements/live regions:**
- ✅ Status messages that appear automatically
- ✅ Loading indicators
- ✅ Server notifications/alerts
- ✅ Timer milestones (not every tick)
- ✅ Background operation completions

**When NOT to use announcements/live regions:**
- ❌ Tab content switching (TabView handles this automatically)
- ❌ Button click results visible on screen (user expects the change)
- ❌ Form submission results if focus moves to result
- ❌ Content that user directly interacted with
- ❌ Every update in rapidly changing content

**When to use .screenChanged vs .announcement:**
- `.screenChanged` - Major layout changes (modal appearing, navigation)
- `.announcement` - Status updates without layout change
- Neither - Tab switching (TabView handles automatically)

```swift
// ❌ ISSUE: Status change not announced
statusLabel.text = "Upload complete"

// ✅ CORRECT: Post announcement (UIKit)
statusLabel.text = "Upload complete"
UIAccessibility.post(
    notification: .announcement,
    argument: "Upload complete"
)

// ✅ CORRECT: Layout changed notification
UIAccessibility.post(
    notification: .layoutChanged,
    argument: newElement
)

// SwiftUI - ✅ CORRECT: Live region for auto-updating content
@State private var message = ""

var body: some View {
    Text(message)
        .accessibilityLiveRegion(.polite)
}

// ❌ WRONG: Tab switching with manual announcement
TabView(selection: $selectedTab) {
    HomeView().tabItem { Label("Home", systemImage: "house") }
    SearchView().tabItem { Label("Search", systemImage: "magnifyingglass") }
}
.onChange(of: selectedTab) { newValue in
    UIAccessibility.post(  // ❌ Unnecessary! TabView handles this
        notification: .screenChanged,
        argument: "\(tabNames[newValue]) selected"
    )
}

// ✅ CORRECT: Tab switching without manual announcement
TabView(selection: $selectedTab) {
    HomeView().tabItem { Label("Home", systemImage: "house") }
    SearchView().tabItem { Label("Search", systemImage: "magnifyingglass") }
}
// VoiceOver automatically announces: "Home, tab, 1 of 2, selected"
```

**WCAG SC:** 4.1.3 Status Messages (Level AA)

---

### 9. Custom Actions

**Issue:** Swipe actions not accessible

```swift
// ❌ ISSUE: Swipe-to-delete only accessible via gesture
// Physical swipe required

// ✅ CORRECT: Provide custom accessibility actions
cell.accessibilityCustomActions = [
    UIAccessibilityCustomAction(
        name: "Delete",
        target: self,
        selector: #selector(deleteItem)
    ),
    UIAccessibilityCustomAction(
        name: "Archive",
        target: self,
        selector: #selector(archiveItem)
    )
]

// SwiftUI
Button("Item") {
    // Default action
}
.accessibilityAction(named: "Delete") {
    deleteItem()
}
.accessibilityAction(named: "Archive") {
    archiveItem()
}
```

**WCAG SC:** 2.1.1 Keyboard (Level A) - adapted for mobile gestures

---

### 10. Accessibility Value

> ⚠️ **CRITICAL:** Most components announce their value/state AUTOMATICALLY. Only use `accessibilityValue` for custom value formatting (sliders, pickers). See [Avoid Redundant Information](patterns/AVOID_ROLE_IN_LABEL.md).

**Issue:** Adjustable controls without proper value

```swift
// ✅ CORRECT: Slider with custom value formatting (ONLY case for accessibilityValue)
let slider = UISlider()
slider.accessibilityLabel = "Volume"
slider.accessibilityValue = "\(Int(slider.value * 100)) percent"
slider.accessibilityTraits = .adjustable

// SwiftUI
Slider(value: $volume, in: 0...1)
    .accessibilityLabel("Volume")
    .accessibilityValue("\(Int(volume * 100)) percent")  // ✅ Needed for custom formatting
// VoiceOver announces: "Volume, 50 percent, adjustable"

// ❌ WRONG: Adding accessibilityValue to Toggle (announces state automatically)
Toggle("Dark mode", isOn: $isDarkMode)
    .accessibilityValue(isDarkMode ? "On" : "Off")  // ❌ REDUNDANT!
// VoiceOver announces: "Dark mode, on, switch, on" - says "on" TWICE!

// ✅ CORRECT: Toggle without accessibilityValue
Toggle("Dark mode", isOn: $isDarkMode)
// VoiceOver announces: "Dark mode, on, switch" ✓

// ❌ WRONG: Adding accessibilityValue for selection state
Circle()
    .accessibilityLabel("Red theme")
    .accessibilityAddTraits(.isButton)
    .accessibilityValue(isSelected ? "Selected" : "Not selected")  // ❌ WRONG!
// Use .isSelected trait instead!

// ✅ CORRECT: Use .isSelected trait for selection state
Circle()
    .accessibilityLabel("Red theme")
    .accessibilityAddTraits(.isButton)
    .accessibilityAddTraits(isSelected ? .isSelected : [])  // ✅ CORRECT!
// VoiceOver announces: "Red theme, selected, button"
```

**When to use accessibilityValue:**
- ✅ **Sliders** - for custom value formatting ("50 percent", "3 out of 5")
- ✅ **Custom adjustable controls** - when value isn't announced automatically
- ✅ **Pickers** - to announce current selection
- ❌ **Toggles/Switches** - announces on/off automatically
- ❌ **Selection state** - use `.isSelected` trait instead
- ❌ **Buttons** - don't add redundant values

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 11. Touch Target Sizes

**Issue:** Touch targets too small

```swift
// ❌ ISSUE: Button too small (24x24)
Button(action: {}) {
    Image(systemName: "xmark")
        .frame(width: 24, height: 24)
}

// ✅ CORRECT: Default 44x44 points (recommended)
Button(action: {}) {
    Image(systemName: "xmark")
        .frame(width: 44, height: 44)
}

// ✅ ACCEPTABLE: Minimum 28x28 points (when space constrained)
Button(action: {}) {
    Image(systemName: "xmark")
        .frame(width: 28, height: 28)
}

// ✅ CORRECT: Smaller visual with proper touch area
Button(action: {}) {
    Image(systemName: "xmark")
        .font(.system(size: 16))
}
.frame(width: 44, height: 44)

// UIKit
let button = UIButton()
button.frame = CGRect(x: 0, y: 0, width: 44, height: 44)
```

**WCAG SC:** 2.5.8 Target Size (Minimum) (Level AA)

**Requirements:**
- **Default:** 44×44 points (recommended)
- **Minimum:** 28×28 points (only when space is limited)

**Element Spacing:**
- **With bezel** (buttons, controls): 12pt padding around elements
- **Without bezel** (custom touch areas): 24pt padding around visible edges

```swift
// ✅ CORRECT: Proper spacing between controls
HStack(spacing: 12) {
    Button("Back") { }
        .frame(width: 44, height: 44)
    Button("Forward") { }
        .frame(width: 44, height: 44)
}

// Custom touch areas without visible bezel
HStack(spacing: 24) {
    Image(systemName: "star")
        .onTapGesture { }
        .frame(width: 44, height: 44)
    Image(systemName: "heart")
        .onTapGesture { }
        .frame(width: 44, height: 44)
}
```

---

### 12. Tab Bar / Bottom Navigation Accessibility

> 📖 **See detailed pattern guide:** [Navigation Bar Accessibility](patterns/NAVIGATION_BAR_ACCESSIBILITY.md)
>
> This section provides iOS-specific implementation. See the pattern guide for:
> - Complete requirements checklist
> - Common issues and solutions
> - Cross-platform implementations
> - Testing strategies

**Issue:** Tab bars with incomplete or missing accessibility features

**⚠️ CRITICAL:** Tab bars must meet ALL 4 requirements: labels, selected state, position/count, visual contrast.

#### iOS Implementation

**UIKit - UITabBar:**
```swift
// UITabBar automatically handles accessibility
let homeItem = UITabBarItem(
    title: "Home",  // REQUIRED
    image: UIImage(systemName: "house"),
    selectedImage: UIImage(systemName: "house.fill")
)

tabBarController.viewControllers = [homeVC, searchVC, favoritesVC]
```

**SwiftUI - TabView:**
```swift
TabView(selection: $selectedTab) {
    HomeView()
        .tabItem {
            Label("Home", systemImage: "house")  // REQUIRED
        }
        .tag(0)
        // ✅ NO manual accessibility modifiers needed - TabView handles everything

    SearchView()
        .tabItem {
            Label("Search", systemImage: "magnifyingglass")
        }
        .tag(1)
}
// VoiceOver announces: "Home, tab, 1 of 2, selected" automatically ✓
```

**❌ WRONG: Adding manual accessibility to TabView items (creates redundancy):**
```swift
// ❌ DON'T DO THIS - TabView already handles everything!
HomeView()
    .tabItem {
        Label("Home", systemImage: "house")
    }
    .accessibilityLabel("Home tab")  // ❌ REDUNDANT! Says "tab" twice
    .accessibilityValue("Selected")  // ❌ REDUNDANT! Announces "selected" twice
// VoiceOver announces: "Home tab, selected, tab, 1 of 2, selected"
// Says "tab" TWICE, says "selected" TWICE!

// ✅ CORRECT: Let TabView handle everything
HomeView()
    .tabItem {
        Label("Home", systemImage: "house")
    }
// VoiceOver announces: "Home, tab, 1 of 2, selected" ✓
```

**Custom Implementation (SwiftUI):**
```swift
struct CustomTabButton: View {
    let label: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack {
                Image(systemName: icon).accessibilityHidden(true)
                Text(label).accessibilityHidden(true)
            }
            .foregroundColor(isSelected ? .accentColor : .gray)
        }
        .accessibilityLabel(label)
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }
}
```

**WCAG SC:** 1.3.1, 2.4.6, 4.1.2, 1.4.11 (see pattern guide for details)

---

### 13. Context for Repeated Elements

> 📖 **See detailed pattern guide:** [Repeated Elements Context](patterns/REPEATED_ELEMENTS_CONTEXT.md)
>
> This section provides iOS-specific implementation. See the pattern guide for:
> - Complete explanation with examples
> - Common scenarios (View all, Delete, Play, Share, Edit buttons)
> - Cross-platform implementations
> - Best practices and format patterns

**Issue:** Multiple elements with identical accessible labels, making them indistinguishable

**⚠️ CRITICAL:** Always include context to make repeated actions unique. Pattern: `"[Action] [item identifier]"`

#### iOS Implementation

**UIKit:**
```swift
// ✅ CORRECT: Category "View all" buttons with context
viewAllComedyButton.accessibilityLabel = "View all comedy"
viewAllHorrorButton.accessibilityLabel = "View all horror"

// Email list with contextual labels
class EmailCell: UITableViewCell {
    func configure(with email: Email) {
        deleteButton.accessibilityLabel = "Delete \(email.subject)"
        replyButton.accessibilityLabel = "Reply to \(email.subject)"
    }
}
```

**SwiftUI:**
```swift
// ✅ CORRECT: Movie grid with contextual play buttons
struct MovieCard: View {
    let movie: Movie

    var body: some View {
        Button(action: { playMovie(movie) }) {
            Image(systemName: "play.circle.fill")
        }
        .accessibilityLabel("Play \(movie.title)")
    }
}

// Category "View all" with context
Button("View all") {
    viewAllCategory(category)
}
.accessibilityLabel("View all \(category.name)")

// Email actions with context
Button { deleteEmail(email) } {
    Image(systemName: "trash")
}
.accessibilityLabel("Delete \(email.subject)")
```

**WCAG SC:** 2.4.4, 2.4.9, 4.1.2 (see pattern guide for details)

---

### 14. Escape Gesture for Dismissal

**Issue:** Modal views or navigation not dismissible with VoiceOver escape gesture

VoiceOver users can perform a two-finger Z-gesture (scrub) to go back or dismiss modals. Implement `accessibilityPerformEscape` to support this.

```swift
// ✅ CORRECT: Support escape gesture in custom modal (UIKit)
class CustomModalViewController: UIViewController {
    override func accessibilityPerformEscape() -> Bool {
        dismiss(animated: true, completion: nil)
        return true  // Return true if action was handled
    }
}

// Custom navigation
class CustomViewController: UIViewController {
    override func accessibilityPerformEscape() -> Bool {
        navigationController?.popViewController(animated: true)
        return true
    }
}

// SwiftUI - Automatic with sheet/fullScreenCover
struct ContentView: View {
    @State private var showModal = false

    var body: some View {
        Button("Show Modal") {
            showModal = true
        }
        .sheet(isPresented: $showModal) {
            ModalView()
        }
        // Two-finger Z-gesture automatically dismisses
    }
}

// SwiftUI - Custom dismissal with @Environment
struct ModalView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack {
            Text("Modal Content")
            Button("Close") {
                dismiss()
            }
        }
        // Escape gesture automatically calls dismiss()
    }
}

// Custom view with escape support
class CustomOverlayView: UIView {
    override func accessibilityPerformEscape() -> Bool {
        removeFromSuperview()
        return true
    }
}
```

**When to implement:**
- ✅ Custom modal views
- ✅ Custom popovers
- ✅ Custom navigation hierarchies
- ✅ Dismissible overlays
- ✅ Custom back navigation
- ❌ Standard UINavigationController (handles automatically)
- ❌ Standard sheet presentation (handles automatically)

**Testing:** Enable VoiceOver and perform two-finger Z-gesture (scrub) to dismiss

**WCAG SC:** 2.1.1 Keyboard (Level A)

---

### 15. Motor Accessibility - Gesture Alternatives

**Issue:** Critical functions only accessible through complex gestures

```swift
// ❌ ISSUE: Swipe gesture without alternative
let swipeGesture = UISwipeGestureRecognizer(target: self, action: #selector(nextItem))
view.addGestureRecognizer(swipeGesture)

// ✅ CORRECT: Provide button alternative
let swipeGesture = UISwipeGestureRecognizer(target: self, action: #selector(nextItem))
view.addGestureRecognizer(swipeGesture)

// Add visible button alternative
let nextButton = UIButton(type: .system)
nextButton.setTitle("Next Item", for: .normal)
nextButton.addAction(UIAction { _ in
    self.nextItem()
}, for: .touchUpInside)
nextButton.accessibilityLabel = "Go to next item"

// SwiftUI - Provide alternative to multi-touch gestures
struct ContentView: View {
    var body: some View {
        VStack {
            // Gesture-based interaction
            imageView
                .gesture(
                    DragGesture()
                        .onEnded { _ in moveToNextItem() }
                )

            // Button alternative
            Button("Next Item") {
                moveToNextItem()
            }
            .accessibilityLabel("Go to next item")
        }
    }
}
```

**Common Gesture Alternatives:**
- Swipe → Button or segmented control
- Pinch to zoom → Zoom in/out buttons
- Long press → Dedicated action button
- Multi-finger gestures → Single-tap alternatives

**WCAG SC:** 2.1.1 Keyboard (Level A) - adapted for mobile, 2.5.1 Pointer Gestures (Level A)

---

### 16. Motion Sensitivity - Reduce Motion

**Issue:** Animations not respecting motion preferences

```swift
// ❌ ISSUE: Animation always plays
UIView.animate(withDuration: 0.5) {
    imageView.alpha = 1.0
}

// ✅ CORRECT: Check Reduce Motion preference
if UIAccessibility.isReduceMotionEnabled {
    // Instant change without animation
    imageView.alpha = 1.0
} else {
    // Animate for users who can handle motion
    UIView.animate(withDuration: 0.5) {
        imageView.alpha = 1.0
    }
}

// SwiftUI - Automatic with @Environment
struct ContentView: View {
    @Environment(\.accessibilityReduceMotion) var reduceMotion

    var body: some View {
        image
            .opacity(isVisible ? 1 : 0)
            .animation(reduceMotion ? .none : .easeInOut, value: isVisible)
    }
}

// Or conditionally apply animation
.animation(reduceMotion ? nil : .spring(), value: scale)
```

**When to apply Reduce Motion:**
- ✅ Fade transitions
- ✅ Slide/move animations
- ✅ Rotation animations
- ✅ Scale/zoom effects
- ✅ Parallax scrolling
- ❌ Don't remove functional animations (progress indicators)
- ❌ Don't remove state change feedback (just reduce intensity)

**WCAG SC:** 2.3.3 Animation from Interactions (Level AAA)

---

### 17. Video and Media Accessibility

**Issue:** Video content without captions or audio descriptions

```swift
// ❌ ISSUE: Video without caption support
let player = AVPlayer(url: videoURL)
let playerViewController = AVPlayerViewController()
playerViewController.player = player

// ✅ CORRECT: Enable caption tracks
import AVFoundation

let asset = AVAsset(url: videoURL)
let playerItem = AVPlayerItem(asset: asset)

// Ensure captions are loaded
playerItem.automaticallyPreservesTimeOffsetFromLive = true

let player = AVPlayer(playerItem: playerItem)
let playerViewController = AVPlayerViewController()
playerViewController.player = player

// Enable caption display
if let group = asset.mediaSelectionGroup(forMediaCharacteristic: .legible) {
    let locale = Locale(identifier: "en")
    let options = AVMediaSelectionGroup.mediaSelectionOptions(from: group.options, with: locale)
    if let option = options.first {
        playerItem.select(option, in: group)
    }
}

// SwiftUI with VideoPlayer (iOS 14+)
import AVKit

struct VideoView: View {
    let player = AVPlayer(url: videoURL)

    var body: some View {
        VideoPlayer(player: player)
            .onAppear {
                // Configure caption support
                player.currentItem?.select(captionOption, in: captionGroup)
            }
    }
}
```

**Media Accessibility Requirements:**
- ✅ Captions for audio content
- ✅ Audio descriptions for visual-only content
- ✅ Transcript availability
- ✅ Accessible media controls
- ✅ Keyboard/VoiceOver control support

**WCAG SC:** 1.2.2 Captions (Prerecorded) (Level A), 1.2.3 Audio Description (Level A)

---

### 18. Advanced Accessibility Features

> **For advanced features, see:** [IOS_ADVANCED.md](IOS_ADVANCED.md)

This guide covers specialized features including:
- Magic Tap, Large Content Viewer, Smart Invert
- VoiceOver Pronunciation, Haptics
- Full Keyboard Access, Switch Control, Voice Control
- Assistive Access, Auto-play Controls
- UIAccessibilityCustomRotor, Vision framework, AVSpeechSynthesizer

Load the advanced guide when you detect these specialized patterns in the codebase.

---

## tvOS Specific

### Focus Engine

```swift
// ❌ ISSUE: Focus not properly configured for tvOS
UIButton()

// ✅ CORRECT: Focus engine configuration
override var canBecomeFocused: Bool {
    return true
}

override func didUpdateFocus(
    in context: UIFocusUpdateContext,
    with coordinator: UIFocusAnimationCoordinator
) {
    super.didUpdateFocus(in: context, with: coordinator)

    if context.nextFocusedView == self {
        // Handle focus gained
        coordinator.addCoordinatedAnimations({
            self.transform = CGAffineTransform(scaleX: 1.1, y: 1.1)
        }, completion: nil)
    } else {
        // Handle focus lost
        coordinator.addCoordinatedAnimations({
            self.transform = .identity
        }, completion: nil)
    }
}

// SwiftUI tvOS
Button("Watch Now") {
    playVideo()
}
.buttonStyle(.card)
.focusable()
```

**WCAG SC:** 2.4.7 Focus Visible (Level AA)

---

## Systematic Audit Workflow for iOS

### Step 1: Component Discovery

**Identify ALL custom components before deep diving**

```bash
# Find all custom button classes
find . -name "*.swift" -exec grep -l "class.*Button.*:" {} \;

# Find all custom view classes
find . -name "*.swift" -exec grep -l "class.*View.*:" {} \;

# Find all cell classes
find . -name "*.swift" -exec grep -l "class.*Cell.*:" {} \;

# Find all custom controls
find . -name "*.swift" -exec grep -l "class.*Control.*:" {} \;
```

**Create a checklist of components to examine:**
- [ ] FavoriteButton / LikeButton
- [ ] PlayButton / MediaButton
- [ ] MoreInfoButton / DetailsButton
- [ ] ShareButton
- [ ] All custom tile/card components
- [ ] All custom cell components
- [ ] PosterView / ImageView components
- [ ] Progress indicators
- [ ] Custom navigation buttons
- [ ] Tab bar items

### Step 2: Exhaustive Component Examination

**For EACH component identified:**

1. **Read the entire component file**
2. **Check accessibility properties:**
   - [ ] `accessibilityLabel` set?
   - [ ] `accessibilityTraits` appropriate?
   - [ ] `accessibilityValue` for adjustable controls?
   - [ ] State changes announced?
   - [ ] Decorative elements hidden?
3. **Find ALL usages of this component:**
   ```bash
   # Example: Find all usages of FavoriteButton
   grep -r "FavoriteButton" --include="*.swift"
   ```
4. **Check EACH usage location**
5. **Document EVERY issue found with file path and line number**

### Step 3: Pattern Verification

**Once you find one issue, search for the pattern everywhere:**

**Example: Found channel logo without label in PortraitStripTile**

```bash
# Search for all channel logo references
grep -ri "channellogo\|channelicon" --include="*.swift"

# Check in all tile types
grep -r "channelLogo" ios/iosApp/tv5/Homepage/StripTiles/*.swift

# Check in all view types
grep -r "channelLogo" ios/**/*View.swift
```

**Document ALL instances:**
- PortraitStripTile.swift:35
- LandscapeStripTile.swift:9
- PromotionalBannerView.swift:21
- PosterView.swift:31

### Step 4: Verify Nothing Was Skipped

**Cross-check against common locations:**

- [ ] All custom buttons checked
- [ ] All images/icons checked
- [ ] All collection cells checked
- [ ] All navigation components checked
- [ ] All form elements checked
- [ ] All view variants checked (Portrait, Landscape, Large, Small)
- [ ] All base classes checked

---

## Files to Analyze

### UIKit Projects
- `**/*ViewController.swift` - View controllers
- `**/*View.swift` - Custom views
- `**/*.storyboard`, `**/*.xib` - Interface Builder files
- `**/*Cell.swift` - Table/Collection view cells
- `**/*Button.swift` - Custom button classes ⚠️ CHECK ALL
- `**/*Control.swift` - Custom controls ⚠️ CHECK ALL
- Navigation and tab bar controllers
- Base classes (BaseViewController, BaseView, etc.)

### SwiftUI Projects
- `**/*View.swift` - SwiftUI views
- `**/*Screen.swift` - Screen-level views
- `**/*Button.swift` - Custom button views ⚠️ CHECK ALL
- `ContentView.swift` - Main content views
- Custom view components
- View modifiers

### Common
- `AppDelegate.swift` / `SceneDelegate.swift`
- Navigation setup files
- Custom component libraries
- Third-party UI library wrappers

---


## Color Contrast

**Issue:** Insufficient contrast between text/icons and background

**WCAG Level AA Minimum Contrast Requirements:**

| Text size | Text weight | Minimum contrast ratio |
|-----------|-------------|------------------------|
| Up to 17pt | All | 4.5:1 |
| 18pt+ | All | 3:1 |
| Any size | Bold | 3:1 |

```swift
// ❌ ISSUE: Insufficient contrast (2.1:1)
Text("Hello")
    .foregroundColor(Color(red: 0.7, green: 0.7, blue: 0.7))
    .background(Color.white)

// ✅ CORRECT: Sufficient contrast for small text (4.5:1+)
Text("Hello")
    .foregroundColor(Color(red: 0.33, green: 0.33, blue: 0.33))
    .background(Color.white)

// ✅ CORRECT: Sufficient contrast for large/bold text (3:1+)
Text("Heading")
    .font(.title.bold())
    .foregroundColor(Color(red: 0.6, green: 0.6, blue: 0.6))
    .background(Color.white)
```

**Support Increase Contrast Setting:**

```swift
// SwiftUI - Automatic with @Environment
struct ContentView: View {
    @Environment(\.accessibilityIncreaseContrast) var increaseContrast

    var body: some View {
        Text("Hello")
            .foregroundColor(increaseContrast ? .black : .gray)
            .background(Color.white)
    }
}

// UIKit - Check setting
if UIAccessibility.isDarkerSystemColorsEnabled {
    label.textColor = .black  // High contrast
} else {
    label.textColor = .darkGray  // Standard contrast
}
```

**Prefer System-Defined Colors:**

```swift
// ✅ CORRECT: System colors adapt automatically
Text("Hello")
    .foregroundColor(.primary)  // Adapts to light/dark mode and contrast settings

// UIKit
label.textColor = .label  // System-defined color with accessible variants
```

**System colors with automatic accessible variants:**
- `.label` / `.secondaryLabel` / `.tertiaryLabel`
- `.systemRed`, `.systemBlue`, `.systemGreen`, etc.
- These automatically adjust for Increase Contrast and Dark Mode

**Don't Rely on Color Alone:**

```swift
// ❌ ISSUE: Status only shown by color
Circle()
    .fill(isActive ? Color.green : Color.red)

// ✅ CORRECT: Color + icon
HStack {
    Image(systemName: isActive ? "checkmark.circle" : "xmark.circle")
    Circle()
        .fill(isActive ? Color.green : Color.red)
}
.accessibilityLabel(isActive ? "Active" : "Inactive")

// ✅ CORRECT: Color + shape
if isActive {
    Circle().fill(Color.green)
} else {
    Rectangle().fill(Color.red)
}
```

**WCAG SC:** 1.4.3 Contrast (Minimum) (Level AA), 1.4.11 Non-text Contrast (Level AA)

**Testing:** Use Accessibility Inspector in Xcode to check contrast ratios

---


## Dynamic Type Support

**Issue:** Text doesn't scale with user's preferred size

```swift
// ❌ ISSUE: Fixed font size
let label = UILabel()
label.font = UIFont.systemFont(ofSize: 16)
// Won't scale with Dynamic Type

// ✅ CORRECT: Use preferredFont (UIKit)
let label = UILabel()
label.font = .preferredFont(forTextStyle: .body)
label.adjustsFontForContentSizeCategory = true
label.numberOfLines = 0 // Allow wrapping

// ✅ CORRECT: Scale custom fonts with UIFontMetrics
let label = UILabel()
label.numberOfLines = 0
label.adjustsFontForContentSizeCategory = true
label.font = UIFontMetrics(forTextStyle: .body)
    .scaledFont(for: UIFont.systemFont(ofSize: 16))

// Or with custom font
let customFont = UIFont(name: "MyCustomFont", size: 16) ?? UIFont.systemFont(ofSize: 16)
label.font = UIFontMetrics(forTextStyle: .body).scaledFont(for: customFont)

// SwiftUI - automatic with system fonts
Text("Hello")
    .font(.body)

// SwiftUI - custom font that scales
Text("Hello")
    .font(.custom("MyFont", size: 17, relativeTo: .body))
```

**Requirements:**
- Support text sizes from xSmall to AX5 (extra large accessibility sizes)
- Layouts must not clip or overflow at any size
- Use `numberOfLines = 0` for labels to allow wrapping
- Test with largest accessibility sizes enabled

**WCAG SC:** 1.4.4 Resize Text (Level AA)

---


## Reference Resources

### CVS Health iOS SwiftUI Accessibility Techniques

For component-specific accessibility patterns and detailed SwiftUI examples, see:

**Repository:** https://github.com/cvs-health/ios-swiftui-accessibility-techniques

**What it covers (75+ techniques):**
- Component-specific patterns: Accordions, Data Tables, Charts, Horizontal Scroll Views
- Form components: Checkboxes, Radio Buttons, Segmented Controls, Date/Time Pickers
- Advanced patterns: Rotor customization, Attributed Strings, TipKit accessibility
- Detailed SwiftUI examples with live good/bad demonstrations

**License:** Apache License 2.0
**Attribution:** © CVS Health. Licensed under Apache 2.0.
This guide references patterns from the CVS Health iOS SwiftUI Accessibility Techniques project.

**When to use this resource:**
- Implementing specific components (accordions, data tables, charts)
- Need detailed SwiftUI-specific examples
- Building complex custom controls
- Component-level accessibility deep dives

**Our guide vs CVS Health repo:**
- **Our guide:** Broad coverage of common audit patterns across iOS/tvOS
- **CVS Health repo:** Deep component-specific SwiftUI implementations with live examples

---



