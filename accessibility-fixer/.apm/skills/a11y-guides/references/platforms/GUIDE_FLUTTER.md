# Flutter Accessibility Audit Guide

---


## Key Code Patterns to Check

### 1. Image Semantics - IMPORTANT: Check Collection Context First

**⚠️ CRITICAL:** Before flagging missing Semantics, determine if the element is part of a collection item (ListView item, GridView cell).

**Decision Tree:**
1. **Is this element part of a collection item (card in ListView/GridView)?**
   - YES → Skip to Section 3a (Collection Items) - wrap parent in Semantics, wrap children in ExcludeSemantics
   - NO → Continue to step 2

2. **Is this image clearly decorative?** (gradient, background, border, divider, spacer)
   - YES → Skip reporting, don't include in audit
   - UNSURE → Create LOW priority issue, note "fix only if not decorative"
   - NO (conveys information) → Continue to step 3

3. **Is this the ONLY content in a GestureDetector/InkWell?**
   - YES → CRITICAL issue, MUST have Semantics with label
   - NO → Apply standard Semantics rules below

4. **Is this element standalone (not in a collection)?**
   - YES → Require Semantics as shown below

```dart
// ❌ ISSUE: Standalone image without semantics
Image.asset('assets/play.png')

// ✅ CORRECT: Semantic standalone image with button role
Semantics(
  label: 'Play',
  button: true,
  child: GestureDetector(
    onTap: handlePlay,
    child: Image.asset('assets/play.png'),
  ),
)

// ✅ CORRECT: Decorative image
ExcludeSemantics(
  child: Image.asset('assets/decorative.png'),
)
```

**❌ DO NOT flag for missing Semantics:**
- Images/widgets inside ListView.builder or GridView items
- Sub-widgets of collection items that will be merged
- Elements that are part of a larger grouped component

**✅ DO flag for missing Semantics:**
- Images that are the ONLY content in GestureDetector/InkWell (CRITICAL priority)
- Standalone interactive icons not part of collections
- AppBar actions
- FloatingActionButton
- Navigation elements
- Dialog buttons
- Images conveying information (status icons, informational graphics)

**🎨 Clearly Decorative - DON'T Report:**
- Background images set via BoxDecoration
- Gradient containers (LinearGradient, RadialGradient)
- Decorative borders or dividers
- Pattern backgrounds
- Spacer/separator images
- Shadow/blur effects

**❓ Unsure if Decorative - LOW Priority:**
- Images that might convey branding but information is elsewhere
- Decorative icons when text label is present
- Background images that might convey mood/context
- **Recommendation text:** "Verify if this image is decorative. If so, wrap in `ExcludeSemantics`. If it conveys information, wrap in `Semantics` with appropriate label."

**WCAG SC:** 1.1.1 Non-text Content (Level A)

---

### 2. Custom Interactive Widgets

```dart
// ❌ ISSUE: Clickable without semantics
GestureDetector(
  onTap: handleSubmit,
  child: Container(
    child: Text('Submit'),
  ),
)

// ✅ CORRECT: Proper semantic button
Semantics(
  button: true,
  label: 'Submit',
  onTap: handleSubmit,
  child: GestureDetector(
    onTap: handleSubmit,
    child: Container(
      child: Text('Submit'),
    ),
  ),
)

// ✅ BETTER: Use standard widgets
ElevatedButton(
  onPressed: handleSubmit,
  child: Text('Submit'),
)
```

---

### 3. Grouping Related Elements

```dart
// ❌ ISSUE: Elements announced separately
Row(
  children: [
    Icon(Icons.star),
    Text('4.5 Rating'),
  ],
)

// ✅ CORRECT: Merged semantics
MergeSemantics(
  child: Row(
    children: [
      Icon(Icons.star),
      Text('4.5 Rating'),
    ],
  ),
)

// ✅ CORRECT: Custom combined label
Semantics(
  label: '4.5 star rating',
  child: Row(
    children: [
      ExcludeSemantics(child: Icon(Icons.star)),
      ExcludeSemantics(child: Text('4.5 Rating')),
    ],
  ),
)
```

---

### 3a. Collection Items (ListView, GridView)

**Issue:** Collection items with multiple sub-widgets require multiple swipes to navigate

**⚠️ CRITICAL:** Items in grids, rows, or lists should be treated as **a whole unit**. Users should NOT have to swipe multiple times through sub-widgets to understand a single item.

**Example:** TV show card, movie card, product card - all information should be announced in one comprehensive description.

**🚫 IMPORTANT - Avoid Contradictory Guidance:**
When auditing collection items, **DO NOT** flag child widgets (Image, Text, buttons within the item) for missing individual `Semantics`. Instead:
1. ✅ Flag the entire collection item for lacking merged semantics
2. ✅ Recommend wrapping parent in `Semantics` with comprehensive `label`
3. ✅ Recommend wrapping ALL child widgets in `ExcludeSemantics`
4. ❌ Do NOT separately flag child widgets for missing Semantics

**Why:** If you recommend merging at the parent level (which you should), individual child Semantics become useless and create contradictory guidance.

```dart
// ❌ ISSUE: User must swipe 5+ times through one card
// Screen reader visits: Image → Title → Season → Episode → Channel → Progress
Widget buildShowCard(Show show) {
  return GestureDetector(
    onTap: () => openShow(show),
    child: Row(
      children: [
        Image.network(show.posterUrl),
        Column(
          children: [
            Text(show.title),
            Text('Season ${show.season}'),
            Text('Episode ${show.episode}'),
            Image.network(show.channelLogo),
            LinearProgressIndicator(value: show.watchProgress),
          ],
        ),
      ],
    ),
  );
}

// ✅ CORRECT: Single swipe announces everything
Widget buildShowCard(Show show) {
  final watchedPercent = (show.watchProgress * 100).round();

  return Semantics(
    button: true,
    label: '${show.title}, ${show.episodeName}, '
           'Season ${show.season}, Episode ${show.episode}, '
           'on ${show.channelName}, '
           '$watchedPercent percent watched',
    onTap: () => openShow(show),
    child: GestureDetector(
      onTap: () => openShow(show),
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

// ✅ CORRECT: Alternative with helper function
class ShowCard extends StatelessWidget {
  final Show show;
  final VoidCallback onTap;

  const ShowCard({required this.show, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: _getShowAccessibilityLabel(show),
      onTap: onTap,
      child: GestureDetector(
        onTap: onTap,
        child: ExcludeSemantics(
          child: _buildCardContent(show),
        ),
      ),
    );
  }

  String _getShowAccessibilityLabel(Show show) {
    final watchedPercent = (show.watchProgress * 100).round();
    return '${show.title}, ${show.episodeName}, '
           'Season ${show.season}, Episode ${show.episode}, '
           'on ${show.channelName}, '
           '$watchedPercent percent watched';
  }

  Widget _buildCardContent(Show show) {
    return Row(
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
    );
  }
}

// ✅ CORRECT: In ListView
ListView.builder(
  itemCount: shows.length,
  itemBuilder: (context, index) {
    return ShowCard(
      show: shows[index],
      onTap: () => navigateToShow(shows[index].id),
    );
  },
)
```

**Action Buttons on Collection Items:**

If items have action buttons (delete, favorite, share), use **custom semantic actions**:

```dart
// ✅ CORRECT: Actions as custom semantic actions
Widget buildShowCard(Show show) {
  return Semantics(
    button: true,
    label: _getShowLabel(show),
    onTap: () => openShow(show),
    customSemanticsActions: {
      CustomSemanticsAction(label: 'Add to favorites'):
        () => addToFavorites(show),
      CustomSemanticsAction(label: 'Remove from watchlist'):
        () => removeFromWatchlist(show),
    },
    child: GestureDetector(
      onTap: () => openShow(show),
      child: ExcludeSemantics(
        child: /* Card content */
      ),
    ),
  );
}

// Note: Users access custom actions via:
// - TalkBack (Android): Swipe up then down, or open actions menu
// - VoiceOver (iOS): Swipe up/down with one finger
```

**Exception:** If action buttons need to be separately focusable (e.g., for specific UX requirements), include their context in the label:

```dart
Row(
  children: [
    Expanded(
      child: Semantics(
        button: true,
        label: _getShowLabel(show),
        onTap: () => openShow(show),
        child: GestureDetector(
          onTap: () => openShow(show),
          child: /* Show content */
        ),
      ),
    ),
    Semantics(
      button: true,
      label: 'Add ${show.title} to favorites',
      onTap: () => addToFavorites(show),
      child: IconButton(
        icon: Icon(Icons.favorite),
        onPressed: () => addToFavorites(show),
      ),
    ),
  ],
)
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.4 Link Purpose (In Context) (Level A)

**Key Points:**
- **One swipe = one complete item description**
- Include ALL relevant information: title, metadata, status, progress
- Use `Semantics` with comprehensive `label` on parent
- Wrap visual content in `ExcludeSemantics`
- Use `customSemanticsActions` for additional actions (preferred)
- Action buttons should include item context in label if separately focusable
- Test with both TalkBack (Android) and VoiceOver (iOS)

---

### 4. Form Fields

```dart
// ❌ ISSUE: No label
TextField()

// ✅ CORRECT: With label
TextField(
  decoration: InputDecoration(
    labelText: 'Email address',
    hintText: 'example@email.com',
  ),
)

// ✅ CORRECT: Explicit semantics
Semantics(
  label: 'Email address',
  hint: 'Enter your email',
  child: TextField(
    decoration: InputDecoration(
      hintText: 'example@email.com',
    ),
  ),
)
```

---

### 5. Live Regions

```dart
// ✅ CORRECT: Announce updates
Semantics(
  liveRegion: true,
  child: Text(statusMessage),
)
```

---



