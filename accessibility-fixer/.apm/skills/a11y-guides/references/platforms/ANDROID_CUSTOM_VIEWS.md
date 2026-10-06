# Android Custom Views - Accessibility Deep Dive

> **Note:** This is an advanced guide for implementing custom Android views with full accessibility support. For general Android accessibility auditing, see [GUIDE_ANDROID.md](GUIDE_ANDROID.md).

---



## Principle 1: Extend System Widgets, Don't Build From Scratch

**⚠️ CRITICAL:** Always extend from the most specific widget in the class hierarchy, not from `View`.

### Why This Matters

System widgets come with accessibility built-in:
- Proper role announcements (button, checkbox, etc.)
- State handling (checked, selected, expanded)
- Focus management
- Keyboard navigation
- Accessibility events

### Inheritance Best Practices

```kotlin
// ❌ WRONG: Extending from View for a button-like component
class CustomButton(context: Context) : View(context) {
    // You lose all Button accessibility features!
    // Must manually implement: role, state, actions, focus handling, etc.
}

// ✅ CORRECT: Extend from Button
class CustomButton(context: Context) : Button(context) {
    // Inherits all Button accessibility automatically:
    // - Role (button)
    // - Click actions
    // - Focus handling
    // - State announcements
}

// ❌ WRONG: Extending TextView for a switch
class TriSwitch(context: Context) : TextView(context) {
    // Loses Switch semantics!
}

// ✅ CORRECT: Extend from Switch
class TriSwitch(context: Context) : Switch(context) {
    var currentState: Int = 0
        private set

    init {
        updateAccessibilityActions()
    }

    private fun updateAccessibilityActions() {
        ViewCompat.replaceAccessibilityAction(
            this,
            AccessibilityNodeInfoCompat.AccessibilityActionCompat.ACTION_CLICK,
            "Toggle state"
        ) { view, args ->
            moveToNextState()
            true
        }
    }

    private fun moveToNextState() {
        currentState = (currentState + 1) % 3
        // Update visual state
        isChecked = (currentState > 0)
        // Announce change
        announceForAccessibility("State $currentState of 3")
    }
}
```

### Compose - Prefer System Components

```kotlin
// ❌ WRONG: Building from scratch
@Composable
fun CustomCheckbox(checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Box(
        modifier = Modifier
            .clickable { onCheckedChange(!checked) }
            .semantics {
                // Must manually implement everything!
                role = Role.Checkbox
                stateDescription = if (checked) "Checked" else "Unchecked"
                // Easy to miss accessibility features
            }
    ) {
        Icon(
            if (checked) Icons.Default.CheckBox else Icons.Default.CheckBoxOutlineBlank,
            contentDescription = null
        )
    }
}

// ✅ CORRECT: Use or wrap system Checkbox
@Composable
fun CustomCheckbox(checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Checkbox(
        checked = checked,
        onCheckedChange = onCheckedChange,
        // Customize appearance with colors, not from scratch
        colors = CheckboxDefaults.colors(/* custom colors */)
    )
    // Inherits all Checkbox accessibility automatically
}
```

### Inheritance Hierarchy Reference

```
View
↳ TextView
  ↳ Button
    ↳ CompoundButton
      ↳ CheckBox
      ↳ RadioButton
      ↳ Switch
      ↳ ToggleButton
  ↳ EditText
↳ ImageView
  ↳ ImageButton
↳ ViewGroup
  ↳ LinearLayout
  ↳ FrameLayout
  ↳ RecyclerView
```

**Rule:** Extend from the most specific class that matches your component's behavior.

---

## Core Accessibility Methods

When you must extend from `View`, override these methods to provide proper accessibility:

### 1. onPopulateAccessibilityEvent() - Text Content Only

```kotlin
class CustomView(context: Context) : View(context) {
    private var labelText: String = ""

    override fun onPopulateAccessibilityEvent(event: AccessibilityEvent?) {
        super.onPopulateAccessibilityEvent(event)
        // Only add text content here
        if (labelText.isNotEmpty()) {
            event?.text?.add(labelText)
        }
    }
}
```

**Purpose:** Add text that should be spoken when the event occurs
**Use for:** Text content only
**Don't use for:** State, properties, or metadata

### 2. onInitializeAccessibilityEvent() - Event Properties

```kotlin
override fun onInitializeAccessibilityEvent(event: AccessibilityEvent?) {
    super.onInitializeAccessibilityEvent(event)
    // Add state information
    event?.isChecked = isChecked()
    event?.isPassword = isPasswordField()
}
```

**Purpose:** Set event-specific properties
**Use for:** State flags (checked, password, etc.)
**Don't use for:** Text content

### 3. onInitializeAccessibilityNodeInfo() - State & Properties

This is the most important method - it defines how TalkBack sees your view.

```kotlin
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
    super.onInitializeAccessibilityNodeInfo(info)

    // Set role/class (critical for proper announcements)
    info?.className = Switch::class.java.name

    // Set text
    if (labelText.isNotEmpty()) {
        info?.text = labelText
    }

    // Set state
    info?.isCheckable = true
    info?.isChecked = isChecked()

    // Set range (for sliders, progress bars)
    info?.rangeInfo = AccessibilityNodeInfo.RangeInfo.obtain(
        AccessibilityNodeInfo.RangeInfo.RANGE_TYPE_INT,
        minValue.toFloat(),
        maxValue.toFloat(),
        currentValue.toFloat()
    )

    // Add actions
    info?.addAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_CLICK)
    if (currentValue < maxValue) {
        info?.addAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_FORWARD)
    }
    if (currentValue > minValue) {
        info?.addAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_BACKWARD)
    }
}
```

**Purpose:** Define how the view appears to accessibility services
**Set:** className, text, state, actions, range info
**Critical:** className determines the role announcement (button, checkbox, etc.)

### 4. performAccessibilityAction() - Handle Actions

```kotlin
override fun performAccessibilityAction(action: Int, arguments: Bundle?): Boolean {
    when (action) {
        AccessibilityNodeInfo.ACTION_CLICK -> {
            performClick()
            return true
        }
        AccessibilityNodeInfo.ACTION_SCROLL_FORWARD -> {
            incrementValue()
            sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_SELECTED)
            return true
        }
        AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD -> {
            decrementValue()
            sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_SELECTED)
            return true
        }
    }
    return super.performAccessibilityAction(action, arguments)
}
```

**Purpose:** Respond to accessibility actions
**Handle:** Click, scroll, expand/collapse, custom actions
**Always:** Return true if action was handled

### ⚠️ CRITICAL RULE

**Always call `super` implementation first in all accessibility methods!**

```kotlin
// ✅ CORRECT
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
    super.onInitializeAccessibilityNodeInfo(info) // Call super first
    info?.text = "Custom text"
}

// ❌ WRONG
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
    info?.text = "Custom text"
    // Missing super call - breaks accessibility!
}
```

---

## Keyboard & D-Pad Navigation

Custom views MUST handle keyboard navigation properly for Switch Access and Android TV.

### Requirements

- ✅ `KEYCODE_DPAD_CENTER` must work like touchscreen tap
- ✅ `KEYCODE_ENTER` must have same effect as DPAD_CENTER
- ✅ Views with `ImeAction` must handle both keycodes identically
- ✅ Arrow keys should navigate within complex views

### Implementation

```kotlin
class CustomButton(context: Context) : View(context) {

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        // Handle directional pad and Enter key
        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER,
            KeyEvent.KEYCODE_ENTER -> {
                // Treat as click
                performClick()
                true
            }
            KeyEvent.KEYCODE_DPAD_LEFT -> {
                moveFocusLeft()
                true
            }
            KeyEvent.KEYCODE_DPAD_RIGHT -> {
                moveFocusRight()
                true
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }
}
```

**Testing:** Enable Switch Access and verify all actions work with D-pad/keyboard.

---

## Sending Accessibility Events

Emit accessibility events when content changes to notify TalkBack users.

### When to Send Events

```kotlin
class CustomSlider(context: Context) : View(context) {
    private var value: Int = 0

    private fun setValue(newValue: Int) {
        if (value != newValue) {
            value = newValue

            // Notify accessibility services of change
            sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_SELECTED)

            // Or use this for text changes:
            // sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED)
        }
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_LEFT -> {
                setValue(value - 1)
                true
            }
            KeyEvent.KEYCODE_DPAD_RIGHT -> {
                setValue(value + 1)
                true
            }
            else -> super.onKeyUp(keyCode, event)
        }
    }
}
```

### Event Types Reference

**Automatically handled by View:**
- `TYPE_VIEW_CLICKED` - When view is clicked
- `TYPE_VIEW_FOCUSED` - When view gains focus
- `TYPE_VIEW_HOVER_ENTER` / `TYPE_VIEW_HOVER_EXIT` - Hover events
- `TYPE_VIEW_LONG_CLICKED` - Long press
- `TYPE_VIEW_SCROLLED` - Scroll events

**Must be sent manually in custom views:**
- `TYPE_VIEW_SELECTED` - Selection changed (lists, spinners, sliders)
- `TYPE_VIEW_TEXT_CHANGED` - Text content changed
- `TYPE_ANNOUNCEMENT` - Important status announcements
- `TYPE_WINDOW_CONTENT_CHANGED` - Significant layout changes

---

## Custom Touch Events & performClick()

**⚠️ CRITICAL:** Always override `performClick()` when handling touch events!

### Why This Matters

- `performClick()` generates `TYPE_VIEW_CLICKED` events for TalkBack
- Accessibility services can programmatically invoke `performClick()`
- Switch Access and other assistive technologies rely on this

### Correct Implementation

```kotlin
class CustomTouchView(context: Context) : View(context) {
    private var downTouch = false

    override fun onTouchEvent(event: MotionEvent): Boolean {
        super.onTouchEvent(event)

        return when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                downTouch = true
                true
            }
            MotionEvent.ACTION_UP -> {
                if (downTouch) {
                    downTouch = false
                    performClick() // ✅ Required for accessibility!
                    true
                } else {
                    false
                }
            }
            MotionEvent.ACTION_CANCEL -> {
                downTouch = false
                true
            }
            else -> false
        }
    }

    override fun performClick(): Boolean {
        // ✅ Call super to generate AccessibilityEvent
        super.performClick()

        // Handle custom click action
        handleClick()

        return true
    }

    private fun handleClick() {
        // Your custom click logic
        // ...

        // Announce result if needed
        announceForAccessibility("Action completed")
    }
}
```

---

## Virtual View Hierarchies

For complex controls with multiple clickable sub-regions (calendars, number pickers, custom grids), implement a virtual view hierarchy.

### Problem

TalkBack users can't access individual sub-components of a complex custom view.

**Example:** A calendar view with 30 days - TalkBack sees it as a single element, users can't navigate to individual days.

### Solution 1: ExploreByTouchHelper (Recommended)

> **⚠️ Fire TV/Fire OS Note:** ExploreByTouchHelper may not function as expected on Fire OS. If your app targets Fire TV, consider implementing AccessibilityNodeProvider directly. See [GUIDE_ANDROID_TV.md](GUIDE_ANDROID_TV.md#1-explorebytouchhelper-compatibility-issue) for Fire OS-specific implementation.

```kotlin
class CustomCalendarView(context: Context) : View(context) {

    init {
        // Set up virtual view helper
        val touchHelper = CustomTouchHelper(this)
        ViewCompat.setAccessibilityDelegate(
            this,
            touchHelper
        )
    }

    private inner class CustomTouchHelper(host: View) :
        ExploreByTouchHelper(host) {

        override fun getVirtualViewAt(x: Float, y: Float): Int {
            // Return virtual view ID at coordinates
            return findDayAt(x, y) ?: INVALID_ID
        }

        override fun getVisibleVirtualViews(virtualViewIds: MutableList<Int>) {
            // Populate list with all virtual view IDs
            for (day in 1..daysInMonth) {
                virtualViewIds.add(day)
            }
        }

        override fun onPopulateNodeForVirtualView(
            virtualViewId: Int,
            node: AccessibilityNodeInfoCompat
        ) {
            // Set bounds for virtual view
            val bounds = getDayBounds(virtualViewId)
            node.setBoundsInParent(bounds)

            // Set content
            node.text = "Day $virtualViewId"
            node.contentDescription = getDayDescription(virtualViewId)

            // Set actions
            node.addAction(AccessibilityNodeInfoCompat.ACTION_CLICK)

            // Set state
            if (virtualViewId == selectedDay) {
                node.isSelected = true
            }
        }

        override fun onPerformActionForVirtualView(
            virtualViewId: Int,
            action: Int,
            arguments: Bundle?
        ): Boolean {
            when (action) {
                AccessibilityNodeInfoCompat.ACTION_CLICK -> {
                    selectDay(virtualViewId)
                    return true
                }
            }
            return false
        }
    }
}
```

### Solution 2: Custom AccessibilityNodeProvider (Advanced)

```kotlin
override fun getAccessibilityNodeProvider(): AccessibilityNodeProvider {
    return object : AccessibilityNodeProvider() {
        override fun createAccessibilityNodeInfo(virtualViewId: Int): AccessibilityNodeInfo? {
            if (virtualViewId == View.NO_ID) {
                // Return info for the parent view
                return AccessibilityNodeInfo.obtain(this@CustomView)
            }

            // Return info for virtual child
            val node = AccessibilityNodeInfo.obtain()
            node.text = "Virtual child $virtualViewId"
            // ... configure node
            return node
        }

        // Implement other required methods
    }
}
```

### When to Use Virtual Hierarchies

- ✅ Calendar views (each day is a virtual view)
- ✅ Number pickers (each digit/segment)
- ✅ Custom grid controls with multiple cells
- ✅ Complex charts with interactive data points
- ✅ Custom keyboard implementations
- ❌ Simple custom buttons (just use proper contentDescription)

### Benefits

- TalkBack users can navigate to individual sub-components
- Each virtual view can have its own label, state, and actions
- Provides granular control similar to RecyclerView items

---

## Complete Example: Star Rating View

Full implementation of a custom view with all accessibility features:

```kotlin
/**
 * Custom star rating view with full accessibility support
 */
class StarRatingView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    var rating: Int = 0
        set(value) {
            if (field != value) {
                field = value.coerceIn(0, 5)
                invalidate()
                sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_SELECTED)
            }
        }

    private val maxRating = 5

    init {
        // Make view focusable
        isFocusable = true
        isClickable = true

        // Set content description
        contentDescription = "Star rating"
    }

    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
        super.onInitializeAccessibilityNodeInfo(info)

        // Set role as seekbar
        info?.className = SeekBar::class.java.name

        // Set range info
        info?.rangeInfo = AccessibilityNodeInfo.RangeInfo.obtain(
            AccessibilityNodeInfo.RangeInfo.RANGE_TYPE_INT,
            0f, // min
            maxRating.toFloat(), // max
            rating.toFloat() // current
        )

        // Add actions
        if (rating < maxRating) {
            info?.addAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_FORWARD)
        }
        if (rating > 0) {
            info?.addAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_BACKWARD)
        }
    }

    override fun onPopulateAccessibilityEvent(event: AccessibilityEvent?) {
        super.onPopulateAccessibilityEvent(event)
        event?.text?.add("$rating out of $maxRating stars")
    }

    override fun performAccessibilityAction(action: Int, arguments: Bundle?): Boolean {
        when (action) {
            AccessibilityNodeInfo.ACTION_SCROLL_FORWARD -> {
                if (rating < maxRating) {
                    rating++
                    announceForAccessibility("$rating stars")
                    return true
                }
            }
            AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD -> {
                if (rating > 0) {
                    rating--
                    announceForAccessibility("$rating stars")
                    return true
                }
            }
        }
        return super.performAccessibilityAction(action, arguments)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER,
            KeyEvent.KEYCODE_ENTER -> {
                performClick()
                true
            }
            KeyEvent.KEYCODE_DPAD_LEFT,
            KeyEvent.KEYCODE_MINUS -> {
                if (rating > 0) {
                    rating--
                    true
                } else false
            }
            KeyEvent.KEYCODE_DPAD_RIGHT,
            KeyEvent.KEYCODE_PLUS -> {
                if (rating < maxRating) {
                    rating++
                    true
                } else false
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN,
            MotionEvent.ACTION_MOVE -> {
                // Calculate rating from touch position
                val newRating = ((event.x / width) * maxRating).toInt()
                    .coerceIn(0, maxRating)
                rating = newRating
                return true
            }
            MotionEvent.ACTION_UP -> {
                performClick()
                return true
            }
        }
        return super.onTouchEvent(event)
    }

    override fun performClick(): Boolean {
        super.performClick()
        // Additional click handling if needed
        return true
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        // Draw stars based on rating
        // ... drawing code
    }
}
```

### Testing This Custom View

```kotlin
// In instrumentation test
@Test
fun testStarRatingAccessibility() {
    val view = StarRatingView(context)

    // Verify accessibility node info
    val info = AccessibilityNodeInfo.obtain()
    view.onInitializeAccessibilityNodeInfo(info)

    assertEquals(SeekBar::class.java.name, info.className)
    assertNotNull(info.rangeInfo)
    assertEquals(0f, info.rangeInfo.min)
    assertEquals(5f, info.rangeInfo.max)

    // Test action
    view.performAccessibilityAction(
        AccessibilityNodeInfo.ACTION_SCROLL_FORWARD,
        null
    )
    assertEquals(1, view.rating)
}
```

---

## Common Mistakes to Avoid

### ❌ MISTAKE 1: Not calling super in accessibility methods

```kotlin
// ❌ WRONG
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
    // Missing super call!
    info?.text = "Custom text"
}

// ✅ CORRECT
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
    super.onInitializeAccessibilityNodeInfo(info) // ✅ Always call super first
    info?.text = "Custom text"
}
```

### ❌ MISTAKE 2: Handling touch without performClick()

```kotlin
// ❌ WRONG - No performClick() override
class BadCustomView(context: Context) : View(context) {
    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_UP) {
            handleClick() // TalkBack won't know about this!
            return true
        }
        return super.onTouchEvent(event)
    }
}

// ✅ CORRECT - Call performClick()
class GoodCustomView(context: Context) : View(context) {
    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_UP) {
            performClick() // ✅ Generates accessibility events
            return true
        }
        return super.onTouchEvent(event)
    }

    override fun performClick(): Boolean {
        super.performClick() // ✅ Required
        handleClick()
        return true
    }
}
```

### ❌ MISTAKE 3: Not handling ENTER key same as DPAD_CENTER

```kotlin
// ❌ WRONG - Only handles DPAD_CENTER
override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    return when (keyCode) {
        KeyEvent.KEYCODE_DPAD_CENTER -> {
            performClick()
            true
        }
        else -> super.onKeyDown(keyCode, event)
    }
}

// ✅ CORRECT - Both keys handled
override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    return when (keyCode) {
        KeyEvent.KEYCODE_DPAD_CENTER,
        KeyEvent.KEYCODE_ENTER -> { // ✅ Both keys
            performClick()
            true
        }
        else -> super.onKeyDown(keyCode, event)
    }
}
```

### ❌ MISTAKE 4: Not sending events on state changes

```kotlin
// ❌ WRONG - State changes silently
private fun updateValue(newValue: Int) {
    value = newValue
    invalidate() // Only redraws, no accessibility notification
}

// ✅ CORRECT - Notify accessibility services
private fun updateValue(newValue: Int) {
    if (value != newValue) {
        value = newValue
        invalidate()
        sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_SELECTED) // ✅ Notify
        announceForAccessibility("Value: $value") // ✅ Announce change
    }
}
```

### ❌ MISTAKE 5: Wrong className

```kotlin
// ❌ WRONG - Generic View class
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
    super.onInitializeAccessibilityNodeInfo(info)
    info?.className = View::class.java.name // TalkBack says "View" (not helpful!)
}

// ✅ CORRECT - Specific semantic role
override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo?) {
    super.onInitializeAccessibilityNodeInfo(info)
    info?.className = Button::class.java.name // TalkBack says "Button" (clear!)
}
```

### ❌ MISTAKE 6: Complex view without virtual hierarchy

```kotlin
// ❌ WRONG - Calendar with 30+ days, but TalkBack sees one item
class CalendarView(context: Context) : View(context) {
    // Users can't navigate to individual days with TalkBack!
}

// ✅ CORRECT - Virtual hierarchy for sub-components
class CalendarView(context: Context) : View(context) {
    init {
        val touchHelper = CalendarTouchHelper(this)
        ViewCompat.setAccessibilityDelegate(this, touchHelper)
    }

    private inner class CalendarTouchHelper(host: View) :
        ExploreByTouchHelper(host) {
        // Each day is a virtual view
        // TalkBack users can navigate day by day
    }
}
```

### ❌ MISTAKE 7: Putting non-text content in onPopulateAccessibilityEvent()

```kotlin
// ❌ WRONG - Setting properties in wrong method
override fun onPopulateAccessibilityEvent(event: AccessibilityEvent?) {
    super.onPopulateAccessibilityEvent(event)
    event?.text?.add("My text") // ✅ OK
    event?.isChecked = true // ❌ WRONG method for this!
}

// ✅ CORRECT - Use appropriate methods
override fun onPopulateAccessibilityEvent(event: AccessibilityEvent?) {
    super.onPopulateAccessibilityEvent(event)
    event?.text?.add("My text") // ✅ Text content here
}

override fun onInitializeAccessibilityEvent(event: AccessibilityEvent?) {
    super.onInitializeAccessibilityEvent(event)
    event?.isChecked = true // ✅ Properties here
}
```

### ❌ MISTAKE 8: Not making view focusable/clickable

```kotlin
// ❌ WRONG - Custom view with click listener but not focusable
class CustomView(context: Context) : View(context) {
    init {
        setOnClickListener { handleClick() }
        // Missing: isFocusable = true, isClickable = true
    }
}

// ✅ CORRECT - Properly configured
class CustomView(context: Context) : View(context) {
    init {
        isFocusable = true // ✅ Can receive focus
        isClickable = true // ✅ Announces as clickable
        setOnClickListener { handleClick() }
    }
}
```

---

## Custom View Accessibility Checklist

When implementing custom views:

- [ ] **Extend from most specific widget**, not from View
- [ ] **Override `onInitializeAccessibilityNodeInfo()`** - set className, text, state, actions
- [ ] **Override `onPopulateAccessibilityEvent()`** - add text content only
- [ ] **Override `onInitializeAccessibilityEvent()`** - add event properties
- [ ] **Override `performAccessibilityAction()`** - handle actions
- [ ] **Override `performClick()`** if handling touch events
- [ ] **Always call `super`** in accessibility methods
- [ ] **Handle DPAD_CENTER and KEYCODE_ENTER** identically
- [ ] **Send accessibility events** when content changes
- [ ] **Use ExploreByTouchHelper** for complex multi-region controls
- [ ] **Set proper `className`** to indicate role
- [ ] **Add appropriate actions** (click, scroll, expand, etc.)
- [ ] **Test with TalkBack** - navigate and activate all features
- [ ] **Test with keyboard/DPAD** - all actions work
- [ ] **Test with Switch Access** - all regions accessible

---

## Quick Don'ts Summary

- ❌ Don't forget to call `super` in accessibility methods
- ❌ Don't handle touch without `performClick()`
- ❌ Don't treat ENTER key differently from DPAD_CENTER
- ❌ Don't change state without sending accessibility events
- ❌ Don't use generic `View` className - use semantic role
- ❌ Don't create complex multi-region views without virtual hierarchy
- ❌ Don't mix text and properties in `onPopulateAccessibilityEvent()`
- ❌ Don't make clickable views that aren't focusable
- ❌ Don't build from scratch when you can extend a system widget

---


