# Buttons Acting as Tabs Pattern
## When Content Switchers Should Use Tab Semantics

---

## Overview

Buttons that switch between different content views (fragments, panels, sections) without navigation should be semantically marked as **tabs**, not buttons. This helps screen reader users understand the page structure and the purpose of these controls.

**Applies to:**
- Buttons that change a fragment or portion of screen
- Content filters that swap displayed content
- View switchers (List/Grid toggles)
- Category selectors that change content below
- Segmented controls acting as tabs

---

## The Problem

**❌ Bad Experience:**
```
Screen with 4 buttons at top, each showing different content:
Button: "Home"
Button: "Search"
Button: "Favorites"  (currently showing favorites content)
Button: "Profile"

→ User hears "Home, button", "Search, button", "Favorites, button", "Profile, button"
→ No indication which is currently active
→ No indication these are tabs in a tab group
→ User doesn't understand the page structure
```

**✅ Good Experience:**
```
Screen with proper tab semantics:
Tab: "Home, tab 1 of 4"
Tab: "Search, tab 2 of 4"
Tab: "Favorites, tab 3 of 4, selected"  (currently showing favorites)
Tab: "Profile, tab 4 of 4"

→ User understands these are tabs
→ User knows which tab is active ("selected")
→ User knows position ("3 of 4")
→ Clear page structure
```

---

## When to Apply This Pattern

Use tab semantics when buttons/controls:

✅ **Should use tabs:**
- Switch between different content fragments
- Change a portion of the screen (not full navigation)
- Show different data sets or views
- Act as filters that swap content
- Segment controls that change displayed content
- Only one can be active at a time

❌ **Should NOT use tabs (stay as buttons):**
- Navigate to completely different screens
- Perform actions (submit, delete, save)
- Open dialogs or modals
- Multiple can be active simultaneously (filters)
- Don't change visible content

---

## Key Requirements

### 1. Use Tab Role

Mark the control as a tab, not a button:
- Android: `Role.Tab`
- iOS: Accessibility trait
- Web: `role="tab"`

### 2. Announce Selected State

The active/selected tab must be clearly announced:
- Android: `stateDescription = "Selected"` or `selected { value = true }`
- iOS: `.isSelected` trait
- Web: `aria-selected="true"`

### 3. Announce Position in Group

Users should know the tab's position:
- Format: "Home, tab 1 of 4, selected"
- Android: Use collection info or role
- iOS: Automatic with proper grouping
- Web: `aria-posinset` and `aria-setsize`

### 4. Recommend Native Tab Components

When possible, suggest refactoring to use native tab components:
- Android: `TabRow`, `ScrollableTabRow`, or BottomNavigationView
- iOS: `TabView`, `UITabBarController`
- Web: Proper ARIA tab pattern with tablist/tab/tabpanel

---

## Platform Implementation

### Android (Jetpack Compose)

**❌ WRONG: Buttons acting as tabs**
```kotlin
@Composable
fun ContentSwitcher(selectedTab: Int, onTabSelected: (Int) -> Unit) {
    Row {
        Button(onClick = { onTabSelected(0) }) {
            Text("Home")
        }
        Button(onClick = { onTabSelected(1) }) {
            Text("Search")
        }
        Button(onClick = { onTabSelected(2) }) {
            Text("Favorites")
        }
    }
    // Below: content changes based on selectedTab
}
// Screen reader: "Home, button", "Search, button", "Favorites, button"
// No indication which is active or that they're tabs
```

**✅ CORRECT: Using tab role with proper semantics**
```kotlin
@Composable
fun ContentSwitcher(selectedTab: Int, onTabSelected: (Int) -> Unit) {
    val tabs = listOf("Home", "Search", "Favorites", "Profile")

    Row {
        tabs.forEachIndexed { index, title ->
            Box(
                modifier = Modifier
                    .clickable(
                        role = Role.Tab,  // ✅ Use Tab role
                        onClick = { onTabSelected(index) }
                    )
                    .semantics {
                        stateDescription = if (selectedTab == index) {
                            "Selected"  // ✅ Announce selected state
                        } else {
                            "Not selected"
                        }
                    }
            ) {
                Text(
                    text = title,
                    fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                    color = if (selectedTab == index) MaterialTheme.colorScheme.primary else Color.Gray
                )
            }
        }
    }
    // TalkBack announces: "Home, tab, selected/not selected"
    // Position announced automatically by TalkBack for tab role
}
```

**✅ BEST: Using native TabRow component**
```kotlin
@Composable
fun ContentSwitcher(selectedTab: Int, onTabSelected: (Int) -> Unit) {
    val tabs = listOf("Home", "Search", "Favorites", "Profile")

    TabRow(selectedTabIndex = selectedTab) {
        tabs.forEachIndexed { index, title ->
            Tab(
                selected = selectedTab == index,
                onClick = { onTabSelected(index) },
                text = { Text(title) }
            )
        }
    }
    // Material TabRow automatically provides:
    // - Tab role
    // - Selected state
    // - Position ("tab X of Y")
}
```

### Android (XML / Views)

**❌ WRONG: Buttons acting as tabs**
```xml
<LinearLayout android:orientation="horizontal">
    <Button
        android:id="@+id/btn_home"
        android:text="Home"
        android:onClick="switchToHome" />
    <Button
        android:id="@+id/btn_search"
        android:text="Search"
        android:onClick="switchToSearch" />
</LinearLayout>
```

**✅ CORRECT: Using View with tab semantics**
```kotlin
class TabButton(context: Context) : AppCompatTextView(context) {
    var isSelected: Boolean = false
        set(value) {
            field = value
            updateAccessibility()
        }

    init {
        isClickable = true
        isFocusable = true
        updateAccessibility()
    }

    private fun updateAccessibility() {
        accessibilityDelegate = object : View.AccessibilityDelegate() {
            override fun onInitializeAccessibilityNodeInfo(
                host: View,
                info: AccessibilityNodeInfo
            ) {
                super.onInitializeAccessibilityNodeInfo(host, info)

                // Set role as Tab
                info.roleDescription = "Tab"

                // Set selected state
                info.isSelected = isSelected

                // TalkBack will announce: "Home, tab, selected/not selected"
            }
        }
    }
}
```

**✅ BEST: Recommend native TabLayout**
```xml
<com.google.android.material.tabs.TabLayout
    android:id="@+id/tab_layout"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <com.google.android.material.tabs.TabItem
        android:text="Home" />
    <com.google.android.material.tabs.TabItem
        android:text="Search" />
    <com.google.android.material.tabs.TabItem
        android:text="Favorites" />
</com.google.android.material.tabs.TabLayout>
```

### iOS (SwiftUI)

**❌ WRONG: Buttons acting as tabs**
```swift
struct ContentSwitcher: View {
    @State private var selectedTab = 0

    var body: some View {
        VStack {
            HStack {
                Button("Home") { selectedTab = 0 }
                Button("Search") { selectedTab = 1 }
                Button("Favorites") { selectedTab = 2 }
            }
            // Content based on selectedTab
        }
    }
}
// VoiceOver: "Home, button", "Search, button"
// No indication of selected state or tab structure
```

**✅ CORRECT: Using tab traits**
```swift
struct CustomTab: View {
    let title: String
    let isSelected: Bool
    let index: Int
    let total: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .fontWeight(isSelected ? .bold : .regular)
                .foregroundColor(isSelected ? .blue : .gray)
        }
        .accessibilityLabel("\(title), tab \(index + 1) of \(total)")
        .accessibilityAddTraits(.isButton)  // Keep button trait for activation
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        // VoiceOver announces: "Home, tab 1 of 4, selected, button"
    }
}

struct ContentSwitcher: View {
    @State private var selectedTab = 0
    let tabs = ["Home", "Search", "Favorites", "Profile"]

    var body: some View {
        VStack {
            HStack {
                ForEach(0..<tabs.count, id: \.self) { index in
                    CustomTab(
                        title: tabs[index],
                        isSelected: selectedTab == index,
                        index: index,
                        total: tabs.count
                    ) {
                        selectedTab = index
                    }
                }
            }
            // Content based on selectedTab
        }
    }
}
```

**✅ BEST: Using native TabView**
```swift
struct ContentSwitcher: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView().tabItem { Label("Home", systemImage: "house") }.tag(0)
            SearchView().tabItem { Label("Search", systemImage: "magnifyingglass") }.tag(1)
            FavoritesView().tabItem { Label("Favorites", systemImage: "heart") }.tag(2)
            ProfileView().tabItem { Label("Profile", systemImage: "person") }.tag(3)
        }
    }
}
```

### iOS (UIKit)

**✅ CORRECT: Using UISegmentedControl**
```swift
let segmentedControl = UISegmentedControl(items: ["Home", "Search", "Favorites"])
segmentedControl.selectedSegmentIndex = 0
// UISegmentedControl automatically provides proper tab semantics
```

### Web (React)

**❌ WRONG: Buttons acting as tabs**
```javascript
function ContentSwitcher() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <div>
        <button onClick={() => setSelectedTab(0)}>Home</button>
        <button onClick={() => setSelectedTab(1)}>Search</button>
        <button onClick={() => setSelectedTab(2)}>Favorites</button>
      </div>
      {/* Content based on selectedTab */}
    </>
  );
}
```

**✅ CORRECT: Using proper ARIA tab pattern**
```javascript
function ContentSwitcher() {
  const [selectedTab, setSelectedTab] = useState(0);
  const tabs = ['Home', 'Search', 'Favorites', 'Profile'];

  return (
    <>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            role="tab"
            aria-selected={selectedTab === index}
            aria-posinset={index + 1}
            aria-setsize={tabs.length}
            onClick={() => setSelectedTab(index)}
            className={selectedTab === index ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-labelledby={`tab-${selectedTab}`}>
        {/* Content for selected tab */}
      </div>
    </>
  );
}
// Screen reader announces: "Home, tab 1 of 4, selected"
```

---

## Common Patterns That Need This Fix

### 1. Fragment Switchers
Buttons at top of screen that change which fragment/view is displayed below.

### 2. Content Filters
Buttons like "All", "Active", "Completed" that filter visible items.

### 3. View Mode Toggles
"List" / "Grid" buttons that change how content is displayed.

### 4. Category Selectors
"News", "Sports", "Entertainment" buttons that show different content categories.

### 5. Time Period Selectors
"Day", "Week", "Month", "Year" buttons that change date range.

---

## Audit Recommendations

When you find this pattern, provide **three recommendations** in priority order:

### Priority 1: Refactor to Native Tab Components (Preferred)
```
**Recommendation:** Refactor to use native tab components:
- Android: Use TabRow or ScrollableTabRow from Compose Material
- iOS: Use TabView (SwiftUI) or UITabBarController (UIKit)
- Web: Use proper semantic HTML with role="tablist"

Native components provide all accessibility features automatically.
```

### Priority 2: Add Tab Semantics to Existing Buttons
```
**Recommendation:** Add tab semantics to existing button implementation:
- Use tab role (Role.Tab, role="tab")
- Add selected state (stateDescription, aria-selected)
- Include position info ("tab X of Y")
- See code example above for platform-specific implementation
```

### Priority 3: At Minimum, Add Selected State
```
**Recommendation:** If no refactoring is possible immediately, at minimum:
- Add clear selected state announcement
- Ensure visual distinction is sufficient (contrast >= 3:1)
- Add hint that these controls switch content
```

---

## Testing Checklist

### With Screen Reader
- [ ] Enable TalkBack (Android) or VoiceOver (iOS)
- [ ] Navigate to the tab controls
- [ ] **Verify each announces as "tab" not "button"**
- [ ] **Verify selected tab announces "selected"**
- [ ] **Verify position is announced** (e.g., "tab 2 of 4")
- [ ] Activate different tabs
- [ ] **Verify content changes** when tab is activated
- [ ] **Verify selected state updates** after switching

### Visual Testing
- [ ] Selected tab has clear visual distinction
- [ ] Color contrast between selected/unselected >= 3:1
- [ ] Visual indicator persists (not just on hover)
- [ ] Clear boundary/grouping of tab controls

### Code Review
- [ ] Search for button patterns that change fragments/content
- [ ] Verify tab role is used instead of button role
- [ ] Check selected state is properly set
- [ ] Verify position/count info is available

---

## WCAG Success Criteria

- **1.3.1 Info and Relationships (Level A)** - Tab structure must be programmatically determinable
- **4.1.2 Name, Role, Value (Level A)** - Role, selected state, and position must be available
- **2.4.6 Headings and Labels (Level AA)** - Purpose of tabs must be clear
- **1.4.11 Non-text Contrast (Level AA)** - Visual distinction of selected tab

---

## Impact

**Without proper tab semantics:**
- User doesn't understand page structure
- No indication which view is currently active
- Must guess relationship between buttons and content
- Confusing navigation experience

**With proper tab semantics:**
- Clear understanding of page structure
- Knows which tab is active
- Understands position in tab group
- Efficient navigation between views
- Matches sighted user's mental model

---

## Example Audit Issue

**Title:** Content switcher buttons should use tab role and announce selected state

**Severity:** High

**Description:**
The screen contains 4 buttons at the top ("Home", "Search", "Favorites", "Profile") that switch between different content fragments. These are announced as buttons without any indication of which is currently selected or that they form a tab group.

**Location:**
- File: `HomeScreen.kt`
- Lines: 45-62
- Component: `ContentSwitcherButtons`

**Current Behavior:**
- TalkBack announces: "Home, button", "Search, button", "Favorites, button", "Profile, button"
- No indication of selected state
- No indication these are tabs

**Expected Behavior:**
- Should announce: "Home, tab 1 of 4, selected" (or "not selected")
- Users should understand page structure
- Selected state should be clear

**Recommended Fix (Priority Order):**

1. **Best Solution:** Refactor to native TabRow
```kotlin
TabRow(selectedTabIndex = selectedIndex) {
    tabs.forEachIndexed { index, title ->
        Tab(
            selected = selectedIndex == index,
            onClick = { onTabSelected(index) },
            text = { Text(title) }
        )
    }
}
```

2. **Alternative:** Add tab semantics to existing buttons
```kotlin
Box(
    modifier = Modifier
        .clickable(role = Role.Tab, onClick = onClick)
        .semantics {
            stateDescription = if (isSelected) "Selected" else "Not selected"
        }
) { Text(title) }
```

**WCAG SC:** 1.3.1 (Level A), 4.1.2 (Level A)
