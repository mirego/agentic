# Navigation Bar / Tab Bar Accessibility
## Bottom Navigation for Mobile Apps

---

## Requirements Checklist

ALL navigation bars (bottom tabs, tab bars) must meet these 4 requirements:

1. ✅ **Each tab has accessible label** - Not icon-only
2. ✅ **Screen reader announces selected state** - "selected" or "not selected"
3. ✅ **Screen reader announces position** - "tab 2 of 4"
4. ✅ **Visual selected state is clear** - Contrast >= 3:1

---

## Common Issues

- ❌ Tabs with only icons, no labels
- ❌ Selected state not announced to screen readers
- ❌ Position/count not conveyed ("tab X of Y")
- ❌ Selected state not visually distinguishable (poor contrast)

---

## Platform Implementation

### Android - BottomNavigationView (XML)

```xml
<!-- menu/bottom_nav_menu.xml -->
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/nav_home"
        android:icon="@drawable/ic_home"
        android:title="@string/nav_home" />  <!-- Required for accessibility -->
    <item
        android:id="@+id/nav_search"
        android:icon="@drawable/ic_search"
        android:title="@string/nav_search" />
    <item
        android:id="@+id/nav_favorites"
        android:icon="@drawable/ic_favorite"
        android:title="@string/nav_favorites" />
</menu>

<!-- layout.xml -->
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottom_navigation"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:itemIconTint="@color/bottom_nav_selector"
    app:itemTextColor="@color/bottom_nav_selector"
    app:menu="@menu/bottom_nav_menu" />
```

**Material components automatically provide:**
- Accessible labels from `android:title`
- Selected state announcement
- Position/count ("tab X of Y")
- Visual selected state

### Android - NavigationBar (Compose)

```kotlin
@Composable
fun AppBottomNavigation(
    selectedIndex: Int,
    onItemSelected: (Int) -> Unit
) {
    NavigationBar {
        navItems.forEachIndexed { index, item ->
            NavigationBarItem(
                selected = selectedIndex == index,
                onClick = { onItemSelected(index) },
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = null  // Icon is decorative when label present
                    )
                },
                label = {
                    Text(item.label)  // REQUIRED for accessibility
                }
                // Material automatically handles:
                // - Selected state announcement
                // - Position/count
                // - Visual styling
            )
        }
    }
}
```

### iOS - UITabBar (UIKit)

```swift
// UITabBar automatically handles accessibility
let homeItem = UITabBarItem(
    title: "Home",  // REQUIRED for accessibility
    image: UIImage(systemName: "house"),
    selectedImage: UIImage(systemName: "house.fill")
)

let searchItem = UITabBarItem(
    title: "Search",
    image: UIImage(systemName: "magnifyingglass"),
    selectedImage: UIImage(systemName: "magnifyingglass")
)

let favoritesItem = UITabBarItem(
    title: "Favorites",
    image: UIImage(systemName: "heart"),
    selectedImage: UIImage(systemName: "heart.fill")
)

tabBarController.viewControllers = [homeVC, searchVC, favoritesVC]

// UITabBar automatically provides:
// - Accessible labels from title
// - Selected state announcement
// - Position/count ("tab X of Y")
// - Visual selected state
```

### iOS - TabView (SwiftUI)

```swift
struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house")  // REQUIRED
                }
                .tag(0)

            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(1)

            FavoritesView()
                .tabItem {
                    Label("Favorites", systemImage: "heart")
                }
                .tag(2)
        }
    }
}

// TabView automatically provides:
// - Accessible labels from Label text
// - Selected state announcement
// - Position/count
// - Visual selected state
```

---

## Custom Implementation (When Not Using Native Components)

If you must create a custom navigation bar, ensure ALL 4 requirements are met:

### Custom Android (Compose)

```kotlin
@Composable
fun CustomTabItem(
    label: String,
    icon: ImageVector,
    selected: Boolean,
    index: Int,
    totalItems: Int,
    onClick: () -> Void
) {
    Box(
        modifier = Modifier
            .clickable(onClick = onClick, role = Role.Tab)
            .semantics(mergeDescendants = true) {
                contentDescription = label
                stateDescription = if (selected) "Selected" else "Not selected"
                // TalkBack automatically announces: "label, tab X of Y, selected/not selected"
            }
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (selected) SelectedColor else UnselectedColor
            )
            Text(
                text = label,
                color = if (selected) SelectedColor else UnselectedColor
            )
        }
    }
}
```

### Custom iOS (SwiftUI)

```swift
struct CustomTabButton: View {
    let label: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .accessibilityHidden(true)
                Text(label)
                    .accessibilityHidden(true)
            }
            .foregroundColor(isSelected ? .accentColor : .gray)
        }
        .accessibilityLabel(label)
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
        // VoiceOver announces: "label, tab X of Y, selected/not selected, button"
    }
}
```

---

## Visual Requirements

### Color Contrast

Selected and unselected states must have contrast >= 3:1

```xml
<!-- Android -->
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color="@color/nav_selected" android:state_checked="true" />
    <item android:color="@color/nav_unselected" />
</selector>
<!-- Verify contrast ratio >= 3:1 between selected and unselected -->
```

```swift
// iOS
tabBar.tintColor = UIColor.systemBlue  // Selected
tabBar.unselectedItemTintColor = UIColor.systemGray  // Unselected
// Verify contrast ratio >= 3:1
```

---

## Testing Checklist

### With Screen Reader
- [ ] Enable TalkBack (Android) or VoiceOver (iOS)
- [ ] Navigate to each tab item
- [ ] **Verify announcement includes:**
  - [ ] Label (e.g., "Home")
  - [ ] Position (e.g., "tab 2 of 4")
  - [ ] State (e.g., "selected" or "not selected")
- [ ] **Verify activation:**
  - [ ] Can activate with double-tap
  - [ ] Selected state changes
  - [ ] New selection announced

### Visual Testing
- [ ] Selected tab has clear visual indication
- [ ] Selected state uses different color
- [ ] Contrast between selected/unselected >= 3:1
- [ ] Visual indicator consistent across tabs
- [ ] Labels are always visible (not icon-only mode)

### Code Review
- [ ] Each tab item has `title` or `label` property set
- [ ] No icon-only tabs
- [ ] Using native components when possible
- [ ] Custom implementations include all 4 requirements

---

## Common Material Component Behavior

### Android
- `BottomNavigationView` and `NavigationBar` automatically handle position/count
- Use `android:title` in menu items for accessible labels
- Selected state is automatically announced
- Labels are always visible by default

### iOS
- `UITabBar` and `TabView` automatically handle position/count
- Use `title` parameter for accessible labels
- Selected state is automatically announced
- Labels shown below icons by default

---

## WCAG Success Criteria

- **1.3.1 Info and Relationships (Level A)** - Selected state must be programmatically determinable
- **2.4.6 Headings and Labels (Level AA)** - Clear, descriptive labels
- **4.1.2 Name, Role, Value (Level A)** - Tab role, name, and selected state
- **1.4.11 Non-text Contrast (Level AA)** - Visual distinction of selected state

---

## Why This Matters

**Without proper tab bar accessibility:**
- Users don't know which tab they're on
- Users don't know how many tabs exist
- Users can't distinguish tabs (icon-only)
- Users can't see which tab is selected (visual issues)

**With proper implementation:**
- Users always know their current location
- Users can quickly jump to specific tabs
- Navigation is intuitive and efficient
- Works for all users (screen readers, low vision, etc.)
