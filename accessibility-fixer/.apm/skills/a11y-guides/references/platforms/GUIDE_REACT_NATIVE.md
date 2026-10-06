# React Native Accessibility Audit Guide

---



## Key Code Patterns to Check

### 1. Accessibility Labels - IMPORTANT: Check Collection Context First

**⚠️ CRITICAL:** Before flagging missing accessibilityLabel, determine if the element is part of a collection item (FlatList item, ScrollView card).

**Decision Tree:**
1. **Is this element part of a collection item (card in FlatList/ScrollView)?**
   - YES → Skip to Section 7a (Collection Items) - set accessible={true} on parent, mark children as accessible={false}
   - NO → Continue to step 2

2. **Is this image clearly decorative?** (gradient, background, border, divider, spacer)
   - YES → Skip reporting, don't include in audit
   - UNSURE → Create LOW priority issue, note "fix only if not decorative"
   - NO (conveys information) → Continue to step 3

3. **Is this the ONLY content in a TouchableOpacity/Pressable?**
   - YES → CRITICAL issue, MUST have accessibilityLabel
   - NO → Apply standard accessibilityLabel rules below

4. **Is this element standalone (not in a collection)?**
   - YES → Require accessibilityLabel as shown below

```javascript
// ❌ ISSUE: Standalone image without label
<Image source={require('./play.png')} />

// ✅ CORRECT: Accessible standalone image
<Image
  source={require('./play.png')}
  accessible={true}
  accessibilityLabel="Play"
/>

// ✅ CORRECT: Decorative image
<Image
  source={require('./decorative.png')}
  accessible={false}
/>
// Or
<Image
  source={require('./decorative.png')}
  accessibilityElementsHidden={true}  // iOS
  importantForAccessibility="no"      // Android
/>
```

**❌ DO NOT flag for missing accessibilityLabel:**
- Images/buttons/text inside FlatList renderItem or ScrollView cards
- Sub-components of collection items that will be merged
- Elements that are part of a larger grouped component

**✅ DO flag for missing accessibilityLabel:**
- Images that are the ONLY content in TouchableOpacity/Pressable (CRITICAL priority)
- Standalone interactive icons not part of collections
- Navigation elements
- Toolbar/header buttons
- Tab bar items
- Modal/dialog actions
- Images conveying information (status icons, informational graphics)

**🎨 Clearly Decorative - DON'T Report:**
- Background images set via style
- Gradient overlays
- Decorative borders or dividers
- Pattern backgrounds
- Spacer/separator images
- Shadow/glow effects

**❓ Unsure if Decorative - LOW Priority:**
- Images that might convey branding but information is elsewhere
- Decorative icons when text label is present
- Background images that might convey mood/context
- **Recommendation text:** "Verify if this image is decorative. If so, set `accessible={false}`. If it conveys information, add appropriate accessibilityLabel."

**WCAG SC:** 1.1.1 Non-text Content (Level A)

---

### 2. Accessibility Roles

```javascript
// ❌ ISSUE: Touchable without role
<TouchableOpacity onPress={handlePress}>
  <Text>Submit</Text>
</TouchableOpacity>

// ✅ CORRECT: Explicit button role
<TouchableOpacity
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Submit"
>
  <Text>Submit</Text>
</TouchableOpacity>

// ✅ CORRECT: Using Pressable with role
<Pressable
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
>
  <Text>Submit</Text>
</Pressable>
```

**Available Roles:**
- `button`, `link`, `search`, `image`, `text`
- `header`, `menu`, `menuitem`, `tab`
- `checkbox`, `radio`, `switch`, `adjustable`

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 3. Accessibility States

```javascript
// ❌ ISSUE: Toggle button without state
<TouchableOpacity onPress={togglePlay}>
  <Icon name={isPlaying ? 'pause' : 'play'} />
</TouchableOpacity>

// ✅ CORRECT: State communicated to screen reader
<TouchableOpacity
  onPress={togglePlay}
  accessibilityRole="button"
  accessibilityLabel={isPlaying ? "Pause" : "Play"}
  accessibilityState={{ selected: isPlaying }}
>
  <Icon name={isPlaying ? 'pause' : 'play'} />
</TouchableOpacity>

// ✅ CORRECT: Checkbox with state
<Pressable
  onPress={() => setChecked(!checked)}
  accessibilityRole="checkbox"
  accessibilityState={{ checked }}
  accessibilityLabel="Accept terms"
>
  <CheckBox checked={checked} />
  <Text>Accept terms and conditions</Text>
</Pressable>

// ✅ CORRECT: Disabled state
<TouchableOpacity
  disabled={isLoading}
  accessibilityState={{ disabled: isLoading }}
  accessibilityLabel="Submit"
>
  <Text>Submit</Text>
</TouchableOpacity>
```

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

### 4. Form Inputs

```javascript
// ❌ ISSUE: Input without label
<TextInput
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>

// ✅ CORRECT: Properly labeled input
<View>
  <Text accessibilityRole="header">Email</Text>
  <TextInput
    accessibilityLabel="Email"
    accessibilityHint="Enter your email address"
    placeholder="Email"
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
  />
</View>

// ✅ CORRECT: Form with error
<View>
  <Text>Password</Text>
  <TextInput
    accessibilityLabel="Password"
    accessibilityHint="Must be at least 8 characters"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
  />
  {error && (
    <Text 
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {error}
    </Text>
  )}
</View>
```

**WCAG SC:** 3.3.2 Labels or Instructions (Level A), 3.3.1 Error Identification (Level A)

---

### 5. Touch Target Sizes

```javascript
// ❌ ISSUE: Touch target too small
<TouchableOpacity
  style={{ width: 30, height: 30 }}
  onPress={handlePress}
>
  <Icon name="close" size={20} />
</TouchableOpacity>

// ✅ CORRECT: Minimum 44x44
<TouchableOpacity
  style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Close"
>
  <Icon name="close" size={20} />
</TouchableOpacity>

// ✅ CORRECT: hitSlop for smaller visual with proper touch area
<TouchableOpacity
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  onPress={handlePress}
  accessibilityLabel="Close"
>
  <Icon name="close" size={24} />
</TouchableOpacity>
```

**WCAG SC:** 2.5.8 Target Size (Minimum) (Level AA)

**Requirements:** Minimum 44×44 points

---

### 6. Live Regions for Dynamic Content

```javascript
// ❌ ISSUE: Status update not announced
<Text>{statusMessage}</Text>

// ✅ CORRECT: Live region (polite)
<Text 
  accessibilityLiveRegion="polite"
  accessibilityRole="status"
>
  {statusMessage}
</Text>

// ✅ CORRECT: Assertive for errors
<Text
  accessibilityLiveRegion="assertive"
  accessibilityRole="alert"
>
  {errorMessage}
</Text>

// ✅ CORRECT: Announce programmatically
import { AccessibilityInfo } from 'react-native';

useEffect(() => {
  if (uploadComplete) {
    AccessibilityInfo.announceForAccessibility('Upload complete');
  }
}, [uploadComplete]);
```

**WCAG SC:** 4.1.3 Status Messages (Level AA)

---

### 7. Grouping Elements

```javascript
// ❌ ISSUE: Related elements read separately
<View>
  <Image source={avatarImage} accessibilityLabel="Avatar" />
  <Text>John Doe</Text>
  <Text>Software Engineer</Text>
</View>

// ✅ CORRECT: Grouped accessibility
<View
  accessible={true}
  accessibilityLabel="John Doe, Software Engineer"
>
  <Image source={avatarImage} />
  <Text>John Doe</Text>
  <Text>Software Engineer</Text>
</View>
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A)

---

### 7a. Collection Items (FlatList, ScrollView)

**Issue:** Collection items with multiple sub-views require multiple swipes to navigate

**⚠️ CRITICAL:** Items in grids, rows, or lists should be treated as **a whole unit**. Users should NOT have to swipe multiple times through sub-views to understand a single item.

**Example:** TV show card, movie card, product card - all information should be announced in one comprehensive description.

**🚫 IMPORTANT - Avoid Contradictory Guidance:**
When auditing collection items, **DO NOT** flag child components (Image, Text, buttons within the card) for missing individual `accessibilityLabel`. Instead:
1. ✅ Flag the entire collection item for lacking merged accessibility
2. ✅ Recommend setting `accessible={true}` with comprehensive `accessibilityLabel` on parent
3. ✅ Recommend marking ALL child components as `accessible={false}`
4. ❌ Do NOT separately flag child components for missing labels

**Why:** If you recommend merging at the parent level (which you should), individual child accessibilityLabels become useless and create contradictory guidance.

```javascript
// ❌ ISSUE: User must swipe 5+ times through one card
// Screen reader visits: Image → Title → Season → Episode → Channel → Progress
function ShowCard({ show, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={{ uri: show.posterUrl }} />
      <Text>{show.title}</Text>
      <Text>Season {show.season}</Text>
      <Text>Episode {show.episode}</Text>
      <Image source={{ uri: show.channelLogo }} />
      <ProgressBar progress={show.watchProgress} />
    </TouchableOpacity>
  );
}

// ✅ CORRECT: Single swipe announces everything
function ShowCard({ show, onPress }) {
  const watchedPercent = Math.round(show.watchProgress * 100);

  const accessibilityLabel = [
    show.title,
    show.episodeName,
    `Season ${show.season}`,
    `Episode ${show.episode}`,
    `on ${show.channelName}`,
    `${watchedPercent} percent watched`
  ].join(', ');

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Image
        source={{ uri: show.posterUrl }}
        accessible={false}
      />
      <Text accessible={false}>{show.title}</Text>
      <Text accessible={false}>Season {show.season}</Text>
      <Text accessible={false}>Episode {show.episode}</Text>
      <Image
        source={{ uri: show.channelLogo }}
        accessible={false}
      />
      <ProgressBar
        progress={show.watchProgress}
        accessible={false}
      />
    </TouchableOpacity>
  );
}

// ✅ CORRECT: Alternative with Pressable
function ShowCard({ show, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={getShowAccessibilityLabel(show)}
    >
      <View accessible={false}>
        <Image source={{ uri: show.posterUrl }} />
        <View>
          <Text>{show.title}</Text>
          <Text>S{show.season} E{show.episode}</Text>
          <Image source={{ uri: show.channelLogo }} />
          <ProgressBar progress={show.progress} />
        </View>
      </View>
    </Pressable>
  );
}

function getShowAccessibilityLabel(show) {
  const watchedPercent = Math.round(show.watchProgress * 100);
  return `${show.title}, ${show.episodeName}, Season ${show.season}, Episode ${show.episode}, on ${show.channelName}, ${watchedPercent} percent watched`;
}

// ✅ CORRECT: In FlatList
<FlatList
  data={shows}
  renderItem={({ item }) => (
    <ShowCard
      show={item}
      onPress={() => navigateToShow(item.id)}
    />
  )}
  keyExtractor={(item) => item.id}
/>
```

**Action Buttons on Collection Items:**

If items have action buttons (delete, favorite, share), use **custom actions** via `accessibilityActions`:

```javascript
// ✅ CORRECT: Actions as accessibility actions
function ShowCard({ show, onPress, onFavorite, onRemove }) {
  const accessibilityActions = [
    { name: 'activate', label: 'Open show details' },
    { name: 'magicTap', label: 'Add to favorites' },
    { name: 'longpress', label: 'Remove from watchlist' }
  ];

  const onAccessibilityAction = (event) => {
    switch (event.nativeEvent.actionName) {
      case 'activate':
        onPress();
        break;
      case 'magicTap':
        onFavorite(show);
        break;
      case 'longpress':
        onRemove(show);
        break;
    }
  };

  return (
    <Pressable
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={getShowLabel(show)}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      onPress={onPress}
    >
      <View accessible={false}>
        {/* Card content */}
      </View>
    </Pressable>
  );
}

// Note: Users access custom actions via:
// - TalkBack (Android): Swipe up then down, or open actions menu
// - VoiceOver (iOS): Swipe up/down with one finger
```

**Exception:** If action buttons need to be separately focusable (e.g., for specific UX requirements), include their context in the label:

```javascript
<View>
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={getShowLabel(show)}
    onPress={() => openShow(show)}
  >
    {/* Show content */}
  </TouchableOpacity>

  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={`Add ${show.title} to favorites`}
    onPress={() => addToFavorites(show)}
  >
    <Icon name="heart" />
  </TouchableOpacity>
</View>
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A), 2.4.4 Link Purpose (In Context) (Level A)

**Key Points:**
- **One swipe = one complete item description**
- Include ALL relevant information: title, metadata, status, progress
- Set `accessible={true}` on parent container
- Set `accessible={false}` on all child elements
- Use `accessibilityActions` for additional actions (preferred)
- Action buttons should include item context in label if separately focusable
- Test with both TalkBack (Android) and VoiceOver (iOS)

---

### 8. Headings

```javascript
// ❌ ISSUE: Section title without heading role
<Text style={styles.sectionTitle}>Settings</Text>

// ✅ CORRECT: Marked as heading
<Text
  style={styles.sectionTitle}
  accessibilityRole="header"
>
  Settings
</Text>
```

**WCAG SC:** 1.3.1 Info and Relationships (Level A)

---

### 9. Platform-Specific Considerations

```javascript
// ✅ Handle platform differences
import { Platform } from 'react-native';

<Pressable
  accessibilityLabel="Menu"
  accessibilityRole="button"
  {...Platform.select({
    ios: {
      accessibilityHint: "Double tap to open menu"
    },
    android: {
      accessibilityHint: "Tap to open menu"
    }
  })}
>
  <Icon name="menu" />
</Pressable>
```

---




