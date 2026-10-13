# Collection Items Accessibility Pattern
## Cross-Platform Guide for Lists, Grids, and Collections

---

## Overview

Items in collections (grids, lists, carousels, rows) should be treated as **a whole unit**. Users should NOT have to swipe/tab multiple times through sub-elements to understand a single item.

**Applies to:**
- RecyclerView/LazyColumn items (Android)
- UICollectionView/UITableView cells (iOS)
- List items and grid cells (Web)
- FlatList renderItem (React Native)
- ListView.builder items (Flutter)

---

## The Problem

**❌ Bad Experience:**
```
TV Show Card with multiple elements:
Swipe 1: "Show poster image"
Swipe 2: "Breaking Bad"
Swipe 3: "Season 5"
Swipe 4: "Episode 14"
Swipe 5: "AMC logo"
Swipe 6: "Progress bar, 45 percent"

→ User must swipe 6 times for ONE item!
```

**✅ Good Experience:**
```
TV Show Card merged:
Swipe 1: "Breaking Bad, Ozymandias, Season 5, Episode 14, on AMC, 45 percent watched"

→ User gets ALL information in ONE swipe!
```

---

## 🚫 CRITICAL: Avoid Contradictory Guidance

When auditing collection items, **DO NOT** flag child elements for missing individual labels. Instead:

1. ✅ Flag the entire collection item for lacking merged accessibility
2. ✅ Recommend setting merged label on the parent container
3. ✅ Recommend marking ALL child elements as not accessible
4. ❌ Do NOT separately flag child elements for missing labels

**Why:** If you recommend merging at the parent level (which you should), individual child labels become useless and create contradictory guidance.

**Example of Contradictory Audit:**
```
❌ Issue 001-012: Child images missing contentDescription
❌ Issue 015: Collection item should merge all children
→ Fixing Issue 015 makes Issues 001-012 irrelevant!
```

---

## Key Requirements

### 1. One Interaction = One Complete Description

**Include ALL relevant information:**
- Item title/name
- Subtitle or episode name
- Metadata (season, episode, date, etc.)
- Status information
- Progress indicators
- Channel/source/category

**Format Pattern:**
```
"[Title], [Subtitle], [Metadata], [Status], [Progress]"

Examples:
- "Breaking Bad, Ozymandias, Season 5, Episode 14, on AMC, 45 percent watched"
- "Meeting Notes, From John Smith, Today at 2:00 PM, Unread"
- "The Godfather, Drama, 1972, 4.5 stars, Added to watchlist"
```

### 2. Mark Child Elements as Not Accessible

All child elements within the collection item should be hidden from accessibility tree:
- Images → Not accessible
- Text labels → Not accessible
- Progress bars → Not accessible
- Decorative icons → Not accessible

### 3. Parent Container MUST Be Interactive

**⚠️ CRITICAL:** When grouping child views into a single accessibility element, the parent container **MUST be clickable/tappable** with the screen reader.

**Why this matters:**
- If the parent has merged accessibility but is NOT interactive, screen reader users cannot activate it
- Users will hear the description but be unable to tap/click the item
- This completely blocks access to that content

**Requirements:**
- ✅ Parent container must have click/tap handler
- ✅ Parent must be focusable (Android) or an accessibility element (iOS)
- ✅ Parent should have button/link traits if it performs navigation
- ✅ Test that double-tap activates the item when focused with screen reader

**Common mistakes:**
- ❌ Merging accessibility on a non-interactive container (just a layout wrapper)
- ❌ Having click handler on child element but merging at parent level
- ❌ Forgetting to set `isClickable = true` or `isFocusable = true` (Android)
- ❌ Not using `.onTapGesture` or making it a `Button` (iOS/SwiftUI)

### 4. Action Buttons

**Preferred:** Use custom accessibility actions
- No additional swipes needed
- Clean, merged experience

**Alternative:** If buttons must be separately focusable, include item context:
- ❌ Bad: "Delete" (x20 times)
- ✅ Good: "Delete Breaking Bad episode"

---

## Platform Implementation

### Android (Jetpack Compose)

```kotlin
// ❌ WRONG: Merged accessibility but NOT clickable
@Composable
fun ShowCard(show: Show, onClick: () -> Unit) {
    Card(
        // Missing onClick! User hears description but cannot activate
        modifier = Modifier.semantics(mergeDescendants = true) {
            contentDescription = buildShowDescription(show)
        }
    ) {
        // Content
    }
}

// ✅ CORRECT: Merged accessibility AND clickable
@Composable
fun ShowCard(show: Show, onClick: () -> Unit) {
    Card(
        onClick = onClick,  // ✅ CRITICAL: Parent must be clickable
        modifier = Modifier.semantics(mergeDescendants = true) {
            contentDescription = buildShowDescription(show)
        }
    ) {
        // Visual content with contentDescription = null
        Row {
            AsyncImage(
                model = show.posterUrl,
                contentDescription = null
            )
            Column {
                Text(show.title) // Automatically excluded
                Text("S${show.season} E${show.episode}")
                Image(painter = painterResource(show.channelLogo))
                LinearProgressIndicator(progress = show.progress)
            }
        }
    }
}

fun buildShowDescription(show: Show): String {
    val watchedPercent = (show.progress * 100).toInt()
    return "${show.title}, ${show.episodeName}, " +
           "Season ${show.season}, Episode ${show.episode}, " +
           "on ${show.channelName}, " +
           "$watchedPercent percent watched"
}
```

**Custom Actions (Compose):**
```kotlin
Card(
    modifier = Modifier.semantics(mergeDescendants = true) {
        contentDescription = buildShowDescription(show)
        customActions = listOf(
            CustomAccessibilityAction("Add to favorites") {
                addToFavorites(show)
                true
            }
        )
    }
) { /* content */ }
```

### Android (XML / ViewHolder)

```kotlin
// ❌ WRONG: Merged accessibility but missing clickable/focusable
class ShowViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun bind(show: Show) {
        itemView.apply {
            // Missing isClickable and isFocusable!
            contentDescription = buildShowDescription(show)
            // User hears description but cannot activate
        }
    }
}

// ✅ CORRECT: Merged accessibility AND interactive
class ShowViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun bind(show: Show) {
        itemView.apply {
            isClickable = true   // ✅ CRITICAL: Make parent clickable
            isFocusable = true   // ✅ CRITICAL: Make parent focusable

            // Merge all content
            contentDescription = buildShowDescription(show)

            // Set click listener
            setOnClickListener { openShow(show) }

            // Hide children from TalkBack
            posterImage.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            titleText.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            seasonText.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            episodeText.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            channelLogo.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            progressBar.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
        }
    }
}
```

### iOS (SwiftUI)

```swift
// ❌ WRONG: Merged accessibility but NOT interactive
struct ShowCard: View {
    let show: Show

    var body: some View {
        HStack {
            // Content
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(buildShowLabel(show))
        // Missing tap gesture! User hears description but cannot activate
    }
}

// ✅ CORRECT: Merged accessibility AND interactive (using Button)
struct ShowCard: View {
    let show: Show
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {  // ✅ CRITICAL: Use Button or .onTapGesture
            HStack {
                AsyncImage(url: show.posterURL)
                VStack(alignment: .leading) {
                    Text(show.title)
                    Text("S\(show.season) E\(show.episode)")
                    Image(show.channelLogo)
                    ProgressView(value: show.progress)
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(buildShowLabel(show))
    }

    func buildShowLabel(_ show: Show) -> String {
        let watchedPercent = Int(show.progress * 100)
        return "\(show.title), \(show.episodeName), Season \(show.season), Episode \(show.episode), on \(show.channelName), \(watchedPercent) percent watched"
    }
}

// ✅ ALSO CORRECT: Using .onTapGesture instead of Button
struct ShowCard: View {
    let show: Show
    let onTap: () -> Void

    var body: some View {
        HStack {
            // Content
        }
        .onTapGesture(perform: onTap)  // ✅ Make it tappable
        .accessibilityElement(children: .combine)
        .accessibilityLabel(buildShowLabel(show))
        .accessibilityAddTraits(.isButton)  // ✅ Add button trait
    }
}
```

**Custom Actions (SwiftUI):**
```swift
HStack { /* content */ }
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(buildShowLabel(show))
    .accessibilityAction(named: "Add to favorites") {
        addToFavorites(show)
    }
```

### iOS (UIKit)

```swift
class ShowCell: UICollectionViewCell {
    func configure(with show: Show) {
        self.isAccessibilityElement = true
        self.accessibilityTraits = .button
        self.accessibilityLabel = buildShowLabel(show)

        // Hide children
        posterImageView.isAccessibilityElement = false
        titleLabel.isAccessibilityElement = false
        seasonLabel.isAccessibilityElement = false
        episodeLabel.isAccessibilityElement = false
        channelImageView.isAccessibilityElement = false
        progressView.isAccessibilityElement = false
    }
}
```

### Web (React)

```javascript
function ShowCard({ show, onClick }) {
  const watchedPercent = Math.round(show.watchProgress * 100);
  const ariaLabel = `${show.title}, ${show.episodeName}, Season ${show.season}, Episode ${show.episode}, on ${show.channelName}, ${watchedPercent} percent watched`;

  return (
    <button onClick={onClick} aria-label={ariaLabel} className="show-card">
      <img src={show.posterUrl} alt="" aria-hidden="true" />
      <div aria-hidden="true">
        <h3>{show.title}</h3>
        <p>S{show.season} E{show.episode}</p>
        <img src={show.channelLogo} alt="" />
        <progress value={show.watchProgress} max="1" />
      </div>
    </button>
  );
}
```

### React Native

```javascript
function ShowCard({ show, onPress }) {
  const watchedPercent = Math.round(show.watchProgress * 100);
  const accessibilityLabel = `${show.title}, ${show.episodeName}, Season ${show.season}, Episode ${show.episode}, on ${show.channelName}, ${watchedPercent} percent watched`;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Image source={{ uri: show.posterUrl }} accessible={false} />
      <Text accessible={false}>{show.title}</Text>
      <Text accessible={false}>S{show.season} E{show.episode}</Text>
      <Image source={{ uri: show.channelLogo }} accessible={false} />
      <ProgressBar progress={show.watchProgress} accessible={false} />
    </TouchableOpacity>
  );
}
```

### Flutter

```dart
Widget buildShowCard(Show show, VoidCallback onTap) {
  final watchedPercent = (show.watchProgress * 100).round();
  final label = '${show.title}, ${show.episodeName}, '
      'Season ${show.season}, Episode ${show.episode}, '
      'on ${show.channelName}, '
      '$watchedPercent percent watched';

  return Semantics(
    button: true,
    label: label,
    onTap: onTap,
    child: GestureDetector(
      onTap: onTap,
      child: ExcludeSemantics(
        child: Row(
          children: [
            Image.network(show.posterUrl),
            Column(
              children: [
                Text(show.title),
                Text('S${show.season} E${show.episode}'),
                Image.network(show.channelLogo),
                LinearProgressIndicator(value: show.watchProgress),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}
```

---

## Testing

### With TalkBack (Android)
1. Enable TalkBack
2. Navigate to collection
3. Swipe through items
4. **Verify:** Each card requires only ONE swipe
5. **Verify:** Announcement includes all information
6. **Verify:** ⚠️ CRITICAL: Double-tap activates the item (opens detail page, plays content, etc.)
7. **Verify:** Can access custom actions (swipe up then down)

### With VoiceOver (iOS)
1. Enable VoiceOver
2. Navigate to collection
3. Swipe through items
4. **Verify:** Each card requires only ONE swipe
5. **Verify:** Announcement includes all information
6. **Verify:** ⚠️ CRITICAL: Double-tap activates the item (opens detail page, plays content, etc.)
7. **Verify:** Can access custom actions (swipe up/down)

### With Screen Readers (Web)
1. Enable NVDA/JAWS
2. Navigate to collection with Tab
3. **Verify:** Each card is single tab stop
4. **Verify:** Announcement includes all information
5. **Verify:** ⚠️ CRITICAL: Enter/Space activates the item

### Checklist
- [ ] One swipe/tab per item (not 5-10+)
- [ ] Complete information in single announcement
- [ ] Child elements not separately focusable
- [ ] ⚠️ **Parent container is clickable/tappable** (CRITICAL)
- [ ] **Double-tap/Enter activates the item** (CRITICAL)
- [ ] Custom actions accessible (if present)
- [ ] Action buttons include item context (if separate)

---

## WCAG Success Criteria

- **1.3.1 Info and Relationships (Level A)** - Information must be programmatically determinable
- **2.4.4 Link Purpose (In Context) (Level A)** - Purpose of link/button must be clear
- **2.1.1 Keyboard (Level A)** - All functionality available via keyboard (Web)
- **4.1.2 Name, Role, Value (Level A)** - Name must accurately describe purpose

---

## Impact

**Without this pattern:**
- 20-item list = 100-200 swipes (5-10 per item)
- Tedious, exhausting navigation
- Easy to lose context
- Hard to find specific items

**With this pattern:**
- 20-item list = 20 swipes (1 per item)
- Efficient navigation
- Clear context for each item
- Easy to scan and select
