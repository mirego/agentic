# Comprehensive Accessibility Audit Workflow
## How to conduct thorough, systematic accessibility audits

---

## Purpose

This guide ensures audits are **comprehensive and systematic**, catching all accessibility issues rather than just sampling. Based on lessons learned from comparing audit coverage.

---

## Core Principles

### 1. **Exhaustive Component Coverage**
Don't stop at the first instance of an issue. Check ALL occurrences:
- ✅ Found FavoriteButton without label? Check if it appears in multiple places
- ✅ Found one channel logo without label? Search for ALL channel logo instances
- ✅ Found one play button issue? Check ALL play buttons in the app

### 2. **Component-Level Examination**
Don't just check screens. Examine individual component files:
- ✅ Search for all custom button components (FavoriteButton, PlayButton, MoreInfoButton)
- ✅ Check all custom view components (PosterView, BannerView, TileView)
- ✅ Review all cell/item components (collection view cells, list items)

### 3. **Pattern Recognition**
Once you find one issue, look for the pattern everywhere:
- Found missing label on one ImageView? Check ALL ImageViews
- Found one collection not grouped? Check ALL collections
- Found one button without proper trait? Check ALL custom buttons

---

## Pre-Audit Preparation

### 1. Load ALL Relevant Guides
Don't skip this step. Load these guides before starting:

**Core References:**
- [ ] GUIDE_WCAG_REFERENCE.md
- [ ] QUICK_LOOKUP.md
- [ ] COMPONENT_WCAG_MAPPINGS.md
- [ ] SEVERITY_GUIDELINES.md
- [ ] TESTING_CHECKLIST.md

**Platform-Specific:**
- [ ] GUIDE_[PLATFORM].md (iOS, Android, Web, etc.)

**Pattern Guides (load as needed):**
- [ ] COLLECTION_ITEMS_PATTERN.md
- [ ] FONT_SCALING_SUPPORT.md
- [ ] DECORATIVE_IMAGE_DECISION_TREE.md
- [ ] AVOID_ROLE_IN_LABEL.md
- [ ] BUTTONS_ACTING_AS_TABS.md
- [ ] REPEATED_ELEMENTS_CONTEXT.md
- [ ] NAVIGATION_BAR_ACCESSIBILITY.md

### 2. Understand the Codebase Structure
Before diving in:
- [ ] Identify main UI framework (UIKit, SwiftUI, Jetpack Compose, React Native, etc.)
- [ ] Locate custom component directories
- [ ] Find base classes (BaseViewController, BaseView, BaseButton, etc.)
- [ ] Identify third-party UI libraries in use
- [ ] Map out the screen/feature structure

---

## Systematic Audit Process

### Phase 1: Initial Discovery (Quick Pass)

**Goal:** Get overview of accessibility state and identify major patterns

1. **Navigate the target screen/feature with screen reader**
   - Note obvious issues (missing labels, poor grouping, navigation problems)
   - Identify repeated patterns (similar tiles, buttons, lists)
   - Take notes on component types you encounter

2. **Quick code scan for accessibility properties**
   - Search codebase for `accessibilityLabel`, `contentDescription`, `aria-label`
   - Note which files have accessibility code vs which don't
   - Identify if there's systematic lack of accessibility

3. **Identify key components**
   - List all custom components visible on screen
   - Note collections/lists/grids
   - Identify interactive elements (buttons, links, inputs)

**Output:** List of components and issue patterns to investigate

---

### Phase 2: Component-by-Component Deep Dive

**Goal:** Thoroughly examine EVERY component type

#### 2.1 Custom Buttons

**Search Strategy:**
```bash
# Find all custom button classes
grep -r "class.*Button" --include="*.swift" --include="*.kt" --include="*.tsx"
```

**For EACH button class found:**
- [ ] Read the entire file
- [ ] Check if `accessibilityLabel` / `contentDescription` is set
- [ ] Check if proper trait/role is assigned
- [ ] Check if state changes are announced (selected, disabled, etc.)
- [ ] Search for ALL usages of this button in the codebase
- [ ] Document EACH issue with file path and line number

**Example Components to Check:**
- FavoriteButton / LikeButton
- PlayButton / VideoButton
- MoreInfoButton / DetailsButton
- ShareButton / SendButton
- DeleteButton / RemoveButton
- CloseButton / DismissButton
- Custom tab bar buttons
- Custom navigation buttons

#### 2.2 Images and Icons

**Search Strategy:**
```bash
# iOS
grep -r "UIImageView\|Image(" --include="*.swift"

# Android
grep -r "ImageView\|Icon" --include="*.kt" --include="*.xml"

# React Native
grep -r "<Image " --include="*.tsx" --include="*.jsx"
```

**For EACH image/icon found:**
- [ ] Determine: Decorative or informational?
- [ ] If decorative: Check it's hidden from assistive tech
- [ ] If informational: Check it has proper label
- [ ] Special attention to:
  - Channel logos (ALL instances)
  - Brand logos
  - Status icons
  - Action icons in buttons
  - Corner badges
  - Poster/thumbnail images

**Common Locations for Images:**
- Navigation bars
- Tab bars
- Collection cells/list items
- Headers/banners
- Buttons (icon-only buttons CRITICAL)
- Profile views
- Settings screens

#### 2.3 Collection Items (Lists/Grids)

**Search Strategy:**
```bash
# iOS
grep -r "UICollectionView\|UITableView\|List\|ForEach" --include="*.swift"

# Android
grep -r "RecyclerView\|LazyColumn\|LazyRow" --include="*.kt"

# React Native
grep -r "FlatList\|SectionList\|VirtualizedList" --include="*.tsx"
```

**For EACH collection found:**
- [ ] Check if items are grouped as single focusable units
- [ ] Check ALL sub-elements are hidden from assistive tech
- [ ] Check merged label includes ALL information
- [ ] Check custom actions provided if needed
- [ ] Document with specific cell/item component file

**Check ALL tile/cell types:**
- Portrait tiles/cards
- Landscape tiles/cards
- List items
- Grid items
- "View more" / "See all" tiles
- Different size variants (small, medium, large)

#### 2.4 Text Labels and Headings

**Search Strategy:**
```bash
# iOS
grep -r "UILabel\|Text(" --include="*.swift"

# Android
grep -r "TextView\|Text\(" --include="*.kt" --include="*.xml"
```

**For EACH label found:**
- [ ] Check if it's a section heading
- [ ] If heading: Check proper trait/role assigned
- [ ] Check for fixed font sizes (should use scalable fonts)
- [ ] Check line heights (should scale with text)

#### 2.5 Interactive Elements

**Check ALL of these systematically:**

**Buttons:**
- [ ] All custom button classes
- [ ] Navigation bar buttons
- [ ] Tab bar buttons
- [ ] Toolbar buttons
- [ ] Floating action buttons
- [ ] Icon-only buttons
- [ ] Play/pause/control buttons

**Links:**
- [ ] All text links
- [ ] Image links
- [ ] "Read more" / "View all" links
- [ ] External links

**Form Elements:**
- [ ] Text inputs
- [ ] Dropdowns/pickers
- [ ] Checkboxes
- [ ] Radio buttons
- [ ] Switches/toggles
- [ ] Sliders

**Custom Controls:**
- [ ] Video players
- [ ] Audio players
- [ ] Carousels
- [ ] Tabs
- [ ] Accordions
- [ ] Modals/dialogs

---

### Phase 3: Pattern Verification

**Goal:** Ensure no instances were missed

For each issue type found, search systematically:

#### 3.1 Find All Instances

**Example: Found missing label on channel logo**

**Don't stop at first instance. Search comprehensively:**
```bash
# Find all channel logo references
grep -ri "channellogo\|channel_logo" --include="*.swift" --include="*.kt"

# Find in specific component types
grep -ri "channellogo" ios/iosApp/tv5/Homepage/StripTiles/*.swift
grep -ri "channellogo" ios/iosApp/tv5/Homepage/*.swift
grep -ri "channellogo" ios/common/**/*.swift
```

**Check these specific locations:**
1. Collection/list item tiles (PortraitTile, LandscapeTile, etc.)
2. Promotional banners
3. Detail pages
4. Profile screens
5. Search results
6. Player screens

**Document ALL instances:**
- Issue in PortraitStripTile.swift:35 - channel logo in tile
- Issue in LandscapeStripTile.swift:9 - channel logo in tile
- Issue in PromotionalBannerView.swift:21 - channel logo in banner
- Issue in PosterView.swift:31 - corner channel logo badge

#### 3.2 Check All Variants

**Example: Found play button issue**

Check ALL play button variants:
- [ ] PosterView play button
- [ ] Promotional banner play button
- [ ] Video player play button
- [ ] Inline preview play button
- [ ] Thumbnail overlay play button
- [ ] List item play button

#### 3.3 Check Different States

Don't just check default state:
- [ ] Disabled state
- [ ] Selected state
- [ ] Focused state
- [ ] Error state
- [ ] Loading state
- [ ] Empty state

---

### Phase 4: Structural Patterns

**Goal:** Check app-wide patterns

#### 4.1 Navigation Consistency
- [ ] Top navigation bar (ALL screens)
- [ ] Bottom tab bar
- [ ] Drawer/menu
- [ ] Breadcrumbs (web)
- [ ] Back button behavior

#### 4.2 Repeated Sections
- [ ] Headers (on ALL screens)
- [ ] Footers (on ALL screens)
- [ ] Search bars
- [ ] Filters
- [ ] Sort controls

#### 4.3 Text Scaling
- [ ] Check dynamic type support (iOS)
- [ ] Check font scaling (Android)
- [ ] Test at 200% zoom
- [ ] Check for truncation
- [ ] Check for overlaps

---

## Common Audit Mistakes to Avoid

### ❌ Mistake 1: Stopping at First Instance
**Problem:** Found one play button without label, reported it, moved on
**Solution:** Search for ALL play buttons in codebase and check each one

### ❌ Mistake 2: Skipping Custom Components
**Problem:** Checked screens but didn't examine FavoriteButton.swift
**Solution:** List ALL custom components and check each file

### ❌ Mistake 3: Missing Component Variants
**Problem:** Checked PortraitTile but missed LandscapeStile, LargePortraitTile, DetailedTile
**Solution:** Use glob patterns to find ALL tile types

### ❌ Mistake 4: Not Checking Related Files
**Problem:** Checked main screen but didn't check base classes or shared components
**Solution:** Follow inheritance chain and check parent classes

### ❌ Mistake 5: Incomplete Context
**Problem:** Noted "channel logo needs label" but didn't specify which of 3 locations
**Solution:** Document EVERY instance with file path and line number

---

## Documentation Best Practices

### Issue Documentation Template

For EACH issue, document:

```markdown
#### Issue #XXX: [Component] - [Specific Problem]

**Severity:** [Critical/High/Medium/Low]
**WCAG SC:** [X.X.X - Name] (Level X)

**Location:**
- **File:** `path/to/Component.swift`
- **Line:** `123`
- **Screen:** [Screen name]
- **Component:** [Component name]

**All Instances Found:**
1. PortraitStripTile.swift:35 - channel logo in portrait tile
2. LandscapeStripTile.swift:9 - channel logo in landscape tile
3. PromotionalBannerView.swift:21 - channel logo in banner

**Impact:** [Describe user impact]

**Current Code:** [Show actual code]
**Recommended Fix:** [Show corrected code]

**Screen Reader Behavior:**
- **Current:** [What is announced]
- **Expected:** [What should be announced]
```

### Organize Issues Properly

**❌ Don't organize by:**
- Discovery order
- File location
- Screen location

**✅ Do organize by:**
1. Severity (Critical → High → Medium → Low)
2. Within severity: WCAG SC or logical grouping
3. Group related issues (all channel logo issues together)

---

## Audit Checklist

### Pre-Audit
- [ ] Loaded all relevant guide documents
- [ ] Understood codebase structure
- [ ] Identified custom components
- [ ] Set up search patterns

### Discovery Phase
- [ ] Screen reader walkthrough complete
- [ ] Quick code scan done
- [ ] Key components identified
- [ ] Issue patterns noted

### Component Deep Dive
- [ ] All custom buttons checked
- [ ] All images/icons checked (decorative or informational)
- [ ] All collection items checked (grouping)
- [ ] All headings checked (proper traits)
- [ ] All form elements checked (labels)
- [ ] All interactive elements checked (labels + traits)
- [ ] All repeated elements checked (contextual labels)

### Pattern Verification
- [ ] Found all instances of each issue type
- [ ] Checked all variants of each component
- [ ] Checked all states (disabled, selected, error, etc.)
- [ ] Verified no components were skipped

### Structural Review
- [ ] Navigation patterns checked
- [ ] Text scaling checked
- [ ] Focus management checked
- [ ] Status announcements checked

### Report Quality
- [ ] Issues ordered by severity
- [ ] All instances documented with file paths
- [ ] Current and corrected code provided
- [ ] Implementation strategy included
- [ ] Localized strings list included
- [ ] Test examples included
- [ ] Files audited list complete

---

## Success Metrics

A comprehensive audit should:

✅ **Coverage**
- Check 100% of interactive elements on audited screens
- Check all custom component files
- Find all instances of each issue type

✅ **Depth**
- Not just screen-level issues
- Component-level examination
- Base class and inheritance checks

✅ **Documentation**
- Every issue has file path + line number
- All instances of each issue documented
- Clear current/corrected code examples

✅ **Actionability**
- Implementation strategy provided
- Localized strings list included
- Test examples included
- Phased rollout plan included

---

## Related Resources

- [Audit Report Template](../AUDIT_REPORT_TEMPLATE.md)
- [Testing Checklist](../guides/wcag/TESTING_CHECKLIST.md)
- [Platform-Specific Guides](../guides/)
- [Pattern Guides](../guides/patterns/)

---

**Remember:** A comprehensive audit is thorough, systematic, and leaves no stone unturned. Quality over speed.
