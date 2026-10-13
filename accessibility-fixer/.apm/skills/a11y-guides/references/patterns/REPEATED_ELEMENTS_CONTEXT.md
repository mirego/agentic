# Context for Repeated Elements Pattern
## Making Identical Actions Distinguishable

---

## The Problem

When multiple interactive elements have identical labels/descriptions, screen reader users cannot differentiate between them.

**❌ Bad Experience:**
```
Page with 3 movie categories:

Comedy section: "View all" button
Horror section: "View all" button
Drama section: "View all" button

→ User hears "View all, button" three times
→ No idea which category each opens!
```

**✅ Good Experience:**
```
Comedy section: "View all comedy"
Horror section: "View all horror"
Drama section: "View all drama"

→ User knows exactly which category each button opens
```

---

## Common Scenarios

1. **"View all" / "See more" buttons** in category rows
2. **"Delete" buttons** in email/message lists
3. **"Play" buttons** in content grids
4. **"Share" buttons** for multiple items
5. **"Edit" buttons** for multiple entries
6. **"Reply" buttons** in comment/message threads

---

## The Solution: Include Item Context

Always include enough context to uniquely identify what the action applies to.

### Format Patterns

| Action Type | Bad Label | Good Label |
|-------------|-----------|------------|
| View more | "View all" | "View all comedy" |
| Delete | "Delete" | "Delete Meeting notes" |
| Play | "Play" | "Play Breaking Bad" |
| Share | "Share" | "Share chocolate cake recipe" |
| Edit | "Edit" | "Edit Contact information" |
| Reply | "Reply" | "Reply to John's comment" |

**Pattern:** `"[Action] [item identifier]"`

---

## Real-World Examples

### Example 1: Email List

**❌ Problem:**
```
20 emails, each with Delete and Reply buttons:
- Delete (x20)
- Reply (x20)

→ User has NO IDEA which email!
```

**✅ Solution:**
```
Email 1: "Project update"
  - "Delete Project update"
  - "Reply to Project update"

Email 2: "Meeting notes"
  - "Delete Meeting notes"
  - "Reply to Meeting notes"

→ User knows exactly which email
```

### Example 2: Category Rows

**❌ Problem:**
```
Home screen with genre categories:
- Comedy: "View all" button
- Horror: "View all" button
- Drama: "View all" button
- Action: "View all" button

→ All say "View all", no differentiation
```

**✅ Solution:**
```
- Comedy: "View all comedy"
- Horror: "View all horror"
- Drama: "View all drama"
- Action: "View all action"

→ Each button clearly identifies its category
```

### Example 3: Content Grid

**❌ Problem:**
```
100 movies in grid, each with Play button:
- "Play" (x100)

→ Impossible to know which movie without visual reference
```

**✅ Solution:**
```
- "Play Breaking Bad"
- "Play The Godfather"
- "Play Inception"
- ...

→ Each button identifies the movie
```

---

## Platform Implementation

### Android

```kotlin
// ❌ BAD: All delete buttons identical
class EmailViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun bind(email: Email) {
        deleteButton.contentDescription = "Delete"  // Same for all!
    }
}

// ✅ GOOD: Include email subject
class EmailViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun bind(email: Email) {
        deleteButton.contentDescription = "Delete ${email.subject}"
        replyButton.contentDescription = "Reply to ${email.subject}"
    }
}

// Category buttons
viewAllButton.contentDescription = "View all ${category.name}"
```

### iOS

```swift
// ❌ BAD: All play buttons identical
button.accessibilityLabel = "Play"  // Same for every movie!

// ✅ GOOD: Include movie title
button.accessibilityLabel = "Play \(movie.title)"

// Email actions
deleteButton.accessibilityLabel = "Delete \(email.subject)"
replyButton.accessibilityLabel = "Reply to \(email.sender)"

// Category buttons
button.accessibilityLabel = "View all \(category.name)"
```

### Web

```javascript
// ❌ BAD: Generic labels
<button onClick={() => viewAll('comedy')}>View all</button>
<button onClick={() => deleteEmail(email)}>Delete</button>

// ✅ GOOD: Include context
<button aria-label="View all comedy">View all</button>
<button aria-label={`Delete ${email.subject}`}>Delete</button>

// Play buttons
<button aria-label={`Play ${movie.title}`}>
  <PlayIcon />
</button>
```

### React Native

```javascript
// ❌ BAD
<TouchableOpacity accessibilityLabel="Delete">

// ✅ GOOD
<TouchableOpacity accessibilityLabel={`Delete ${email.subject}`}>

<TouchableOpacity accessibilityLabel={`Play ${movie.title}`}>

<TouchableOpacity accessibilityLabel={`View all ${category.name}`}>
```

### Flutter

```dart
// ❌ BAD
Semantics(
  label: 'Delete',
  child: IconButton(...)
)

// ✅ GOOD
Semantics(
  label: 'Delete ${email.subject}',
  child: IconButton(...)
)

Semantics(label: 'Play ${movie.title}', ...)
Semantics(label: 'View all ${category.name}', ...)
```

---

## Best Practices

### 1. Choose the Right Identifier

Use the most meaningful identifier for context:

**For content items:**
- Title/name (movies, shows, articles)
- Subject line (emails, messages)
- Sender name (when title not available)

**For categories:**
- Category/genre name
- Section title
- Collection name

**For user-generated content:**
- Author name
- Post title/preview
- Timestamp (if unique enough)

### 2. Keep It Concise

Include enough context but don't be verbose:

```
❌ Too short: "Delete"
✅ Good: "Delete Meeting notes"
❌ Too long: "Delete the email with subject Meeting notes from John Smith sent yesterday at 3:42 PM"
```

### 3. Build Labels Dynamically

```kotlin
// Android
fun buildActionLabel(action: String, item: Item): String {
    return "$action ${item.title}"
}

deleteButton.contentDescription = buildActionLabel("Delete", email)
```

```swift
// iOS
func buildActionLabel(_ action: String, _ item: Item) -> String {
    return "\(action) \(item.title)"
}

button.accessibilityLabel = buildActionLabel("Play", movie)
```

### 4. Test with Screen Readers

Navigate through repeated elements and verify:
- Each label is unique
- Context is clear without visuals
- Labels aren't too verbose
- Natural reading flow

---

## Testing Checklist

### Manual Testing
- [ ] Enable screen reader
- [ ] Navigate to screen with repeated actions
- [ ] Verify each label is unique
- [ ] Verify context is meaningful
- [ ] Verify labels aren't overly verbose
- [ ] Test with actual users if possible

### Code Review
- [ ] Search for common action labels: "Delete", "Play", "Share", "Edit"
- [ ] Verify dynamic label building includes context
- [ ] Check lists/grids for repeated action patterns
- [ ] Verify category sections have unique "View all" labels

---

## WCAG Success Criteria

- **2.4.4 Link Purpose (In Context) (Level A)** - Purpose must be determinable from link text or context
- **2.4.9 Link Purpose (Link Only) (Level AAA)** - Purpose can be determined from link text alone
- **4.1.2 Name, Role, Value (Level A)** - Accessible name must be unique when purpose differs

---

## Impact

**Without context:**
- 20 emails = hearing "Delete" 20 times with no way to distinguish
- 100 movies = hearing "Play" 100 times with no way to identify
- Navigation essentially impossible for complex lists

**With context:**
- Each action clearly identifies its target
- Screen reader users can confidently select correct action
- Browsing lists/grids becomes practical and efficient
