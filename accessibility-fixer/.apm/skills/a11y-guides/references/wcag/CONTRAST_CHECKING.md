# Visual Contrast Checking Guide

**Purpose:** Comprehensive guide for checking visual contrast compliance with WCAG 2.2 Level AA.

**WCAG Success Criteria Covered:**
- 1.4.1 Use of Color (Level A)
- 1.4.3 Contrast (Minimum) (Level AA)
- 1.4.11 Non-text Contrast (Level AA)

---

## Overview

Visual contrast issues are among the most common accessibility barriers. They affect users with:
- Low vision
- Color blindness (8% of men, 0.5% of women)
- Age-related vision changes
- Situational limitations (glare, poor lighting)

**This guide MUST be applied during every accessibility audit.**

---

## 1. Text Contrast (WCAG 1.4.3)

### Requirements

**Normal Text (< 24px or < 18.66px bold):**
- Minimum contrast ratio: **4.5:1**

**Large Text (≥ 24px or ≥ 18.66px bold):**
- Minimum contrast ratio: **3:1**

### What to Check

#### Body Text
```
Check all paragraph text, list items, table content:
- Light backgrounds: Ensure text is dark enough
- Dark backgrounds: Ensure text is light enough
- Colored backgrounds: Calculate contrast ratio
```

#### UI Text Labels
```
Check labels on:
- Form fields
- Buttons
- Navigation items
- Settings labels
- Error messages
```

#### Text States
```
Check ALL text states:
✓ Normal/default state
✓ Placeholder text (often too light!)
✓ Disabled text (commonly fails)
✓ Helper text / captions
✓ Link text
✓ Error messages
✓ Success messages
```

#### Text on Images/Gradients
```
Check text overlays:
- Hero banners with background images
- Call-to-action overlays
- Video thumbnails with titles
- Ensure contrast across entire gradient
```

### Common Failures

```css
/* ❌ FAILS: Light gray on white */
.placeholder {
  color: #999;           /* 2.85:1 - needs 4.5:1 */
  background: #fff;
}

/* ❌ FAILS: Medium gray on light background */
.disabled-text {
  color: #767676;        /* 4.54:1 on #fff, but 3.8:1 on #f5f5f5 */
  background: #f5f5f5;
}

/* ✓ PASSES: Dark gray on white */
.body-text {
  color: #595959;        /* 7:1 - passes */
  background: #fff;
}
```

### How to Document

```markdown
## 🔴 Accessibility Issue: Placeholder text fails contrast requirements

**WCAG SC:** 1.4.3 Contrast (Minimum) (Level AA)
**Severity:** Critical

**Issue:**
Placeholder text uses #999 (light gray) on white background, providing only 2.85:1 contrast ratio. WCAG Level AA requires 4.5:1 for normal text.

**Impact:**
Users with low vision or color vision deficiencies cannot read placeholder text, making form fields difficult to understand.

**Current code:**
```css
.input-field::placeholder {
  color: #999;
}
```

**Contrast calculation:**
- Current: #999 on #fff = 2.85:1 ❌
- Required: 4.5:1 minimum

**Suggested fix:**
```css
.input-field::placeholder {
  color: #767676;  /* 4.54:1 - passes */
}
```
```

---

## 2. Non-text Contrast (WCAG 1.4.11)

### Requirements

**UI Components and their states:**
- Minimum contrast ratio: **3:1** against adjacent colors

**What counts as "adjacent":**
- Component boundary vs background
- State indicator vs component
- Focus indicator vs background

### What to Check

#### Form Controls
```
Check contrast for:
✓ Input borders (normal, focus, error)
✓ Checkbox/radio outlines
✓ Select dropdowns
✓ Toggle switches
✓ Slider tracks and thumbs
✓ Button borders (if used for definition)
```

#### Interactive Component States
```
CRITICAL: Check ALL states for EACH component:

✓ Normal/default state
✓ Hover state
✓ Focus state (focus indicator)
✓ Active/pressed state
✓ Selected state (tabs, radio, checkbox)
✓ Disabled state
✓ Error state
✓ Success state
```

**This is where most audits miss issues!**

#### Focus Indicators
```
Check every focusable element:
✓ Buttons
✓ Links
✓ Form inputs
✓ Custom interactive elements
✓ Navigation items
✓ Menu items

Focus indicator must have:
- 3:1 contrast against background
- 3:1 contrast against component (if different)
- Visible on all background variations
```

#### Selection Indicators
```
Check how selection is shown:
✓ Selected tab underline/border
✓ Active navigation item
✓ Checked checkbox
✓ Selected radio button
✓ Toggle on/off indicator
✓ Pressed button state
✓ Selected list item
✓ Color picker selection
```

#### Graphical Objects
```
Check meaningful graphics:
✓ Icons (if conveying information)
✓ Charts/graph elements
✓ Data visualizations
✓ Diagrams
✓ Infographics
```

### Common Failures

#### Example 1: Color Picker Selection
```css
/* ❌ FAILS: Border doesn't contrast with all colors */
.color-circle {
  border: 2px solid transparent;
}

.color-circle[aria-pressed="true"] {
  border-color: #333;  /* Only 2.1:1 against green #00ff00 */
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);  /* Too subtle */
}

/* Contrast calculations needed:
   - #333 vs red #ff0000 = 5.5:1 ✓
   - #333 vs blue #0000ff = 4.2:1 ✓
   - #333 vs green #00ff00 = 2.1:1 ❌ (needs 3:1)
*/

/* ✓ PASSES: Stronger indicator */
.color-circle[aria-pressed="true"] {
  border-color: #000;  /* Better contrast */
  box-shadow: 0 0 0 4px #fff, 0 0 0 7px #000;  /* Double ring */
}

/* ✓ BETTER: Non-color indicator */
.color-circle[aria-pressed="true"]::after {
  content: "✓";  /* Checkmark icon */
  color: #000;
}
```

#### Example 2: Focus Indicator
```css
/* ❌ FAILS: Too subtle on light backgrounds */
button:focus-visible {
  outline: 2px solid #ccc;  /* Only 1.6:1 on white */
}

/* ✓ PASSES */
button:focus-visible {
  outline: 2px solid #005fcc;  /* 5.9:1 on white */
  outline-offset: 2px;
}
```

#### Example 3: Disabled State
```css
/* ❌ FAILS: Disabled button too similar to enabled */
button {
  background: #007bff;
  color: #fff;
}

button:disabled {
  background: #6cb2ff;  /* Only 1.8:1 against enabled state */
  opacity: 0.5;
}

/* ✓ PASSES: Clear visual difference */
button:disabled {
  background: #e0e0e0;  /* Clear difference from enabled */
  color: #999;
  border: 1px solid #ccc;
}
```

### How to Check Multiple States

For each interactive component, create a checklist:

```
Component: Submit Button

States to check:
□ Normal: #007bff background, #fff text → 4.5:1 ✓
□ Hover: #0056b3 background, #fff text → 4.5:1 ✓
□ Focus: 2px #005fcc outline on white → 5.9:1 ✓
□ Active: #004085 background, #fff text → 4.5:1 ✓
□ Disabled: #6cb2ff background, #fff text → 1.8:1 ❌ FAILS

Issue found: Disabled state needs stronger contrast.
```

---

## 3. Don't Rely on Color Alone (WCAG 1.4.1)

### The Rule

**Color cannot be the ONLY way to convey information, indicate an action, prompt a response, or distinguish a visual element.**

### What to Check

#### Links in Text
```
❌ Links only differentiated by color:
<p>
  Read our <a href="/terms">terms of service</a> for details.
</p>
/* a { color: blue; text-decoration: none; } */

✓ Links have non-color indicator:
/* a { color: blue; text-decoration: underline; } */
OR
/* a { color: blue; border-bottom: 1px solid; } */
```

#### Required Form Fields
```
❌ Only red asterisk:
<label>
  Name <span style="color: red;">*</span>
</label>

✓ Multiple indicators:
<label>
  Name <span style="color: red;">*</span>
  <span class="sr-only">(required)</span>
</label>
/* Plus aria-required="true" on input */
```

#### Form Validation Errors
```
❌ Only red border:
<input class="error" aria-invalid="true" />
/* .error { border-color: red; } */

✓ Multiple indicators:
<input class="error" aria-invalid="true" aria-describedby="error-msg" />
<span id="error-msg" role="alert">
  ⚠️ Email is required
</span>
/* Red border + icon + text message */
```

#### Status Messages
```
❌ Color-only status:
<div class="status-success">Saved</div>
/* .status-success { color: green; } */

✓ Icon + color + text:
<div class="status-success">
  ✓ Saved successfully
</div>
```

#### Charts and Data Visualization
```
❌ Color-only legend:
[Red bar] Category A
[Blue bar] Category B
[Green bar] Category C

✓ Patterns + labels + color:
[Red striped bar] Category A
[Blue dotted bar] Category B
[Green solid bar] Category C
```

#### Tab Selection
```
❌ Only color change:
.tab { color: #666; }
.tab[aria-selected="true"] { color: #007bff; }

✓ Multiple indicators:
.tab[aria-selected="true"] {
  color: #007bff;
  border-bottom: 3px solid #007bff;
  font-weight: 600;
}
/* Plus aria-selected="true" for screen readers */
```

#### Toggle/Switch States
```
❌ Only background color:
.toggle { background: #ccc; }
.toggle[aria-checked="true"] { background: #007bff; }

✓ Position + shape + color:
.toggle::after {
  /* Thumb moves position when toggled */
  left: 2px; /* off */
}
.toggle[aria-checked="true"]::after {
  left: 22px; /* on */
}
```

---

## 4. Platform-Specific Considerations

### Web (CSS)

**Check these files:**
- `*.css` - Stylesheets
- `*.scss` / `*.sass` - Preprocessed styles
- `styled-components` / CSS-in-JS
- Inline styles in components

**Look for:**
- `color:` properties
- `background:` / `background-color:` properties
- `border:` / `border-color:` properties
- `outline:` properties
- `:hover`, `:focus`, `:active`, `:disabled` states
- `::placeholder` pseudo-element

**Tools to suggest:**
- Browser DevTools color picker (shows contrast ratio)
- WebAIM Contrast Checker
- Lighthouse accessibility audit

### iOS (SwiftUI/UIKit)

**Check these patterns:**
```swift
// ❌ Custom colors without contrast verification
Circle()
    .fill(Color.green)
    .overlay(
        Text("50")
            .foregroundColor(.white)  // Verify contrast!
    )

// ❌ Selection indicated by color only
.foregroundColor(isSelected ? .blue : .gray)

// ✓ Multiple indicators
.foregroundColor(isSelected ? .blue : .gray)
.fontWeight(isSelected ? .bold : .regular)
.accessibilityAddTraits(isSelected ? .isSelected : [])
```

**Check:**
- Custom `Color` definitions
- `.foregroundColor()` modifiers
- `.background()` modifiers
- State-dependent colors
- Dynamic Type scaling (text may reflow onto different backgrounds)

### Android (Jetpack Compose / XML)

**Check these patterns:**
```kotlin
// ❌ Custom colors without verification
Box(
    modifier = Modifier.background(Color.Green)
) {
    Text("Label", color = Color.White)  // Verify contrast!
}

// ❌ Selection by color only
Text(
    text = "Item",
    color = if (selected) Color.Blue else Color.Gray
)

// ✓ Multiple indicators
Text(
    text = "Item",
    color = if (selected) Color.Blue else Color.Gray,
    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
    modifier = Modifier.semantics {
        selected = isSelected
    }
)
```

**Check:**
- `colors.xml` color definitions
- `Color()` in Compose
- `android:textColor` / `android:background`
- Material Theme colors
- State list colors

---

## 5. Quick Reference: Contrast Ratios

### Common Color Combinations

**Normal text (4.5:1 required):**
```
✓ #000000 on #FFFFFF = 21:1
✓ #595959 on #FFFFFF = 7:1
✓ #767676 on #FFFFFF = 4.54:1
❌ #999999 on #FFFFFF = 2.85:1
❌ #CCCCCC on #FFFFFF = 1.61:1

✓ #FFFFFF on #000000 = 21:1
✓ #FFFFFF on #595959 = 7:1
✓ #FFFFFF on #007bff = 4.53:1
❌ #FFFFFF on #6cb2ff = 2.37:1
```

**Large text (3:1 required):**
```
✓ #767676 on #FFFFFF = 4.54:1
✓ #949494 on #FFFFFF = 3.09:1
❌ #999999 on #FFFFFF = 2.85:1

✓ #FFFFFF on #6cb2ff = 2.37:1 (passes for large text)
```

**UI components (3:1 required):**
```
✓ #000000 border on #FFFFFF = 21:1
✓ #595959 border on #FFFFFF = 7:1
✓ #949494 border on #FFFFFF = 3.09:1
❌ #CCCCCC border on #FFFFFF = 1.61:1
```

### Approximate Contrast by Hex Value

Quick estimation for gray on white:
- `#000` - `#595` = Pass 4.5:1 (normal text)
- `#767` - `#949` = Pass 3:1 (large text / UI)
- `#999` - `#FFF` = Fail all

**Note:** These are approximations. Always verify actual colors.

---

## 6. How to Calculate Contrast

### Manual Calculation Formula

```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)

Where:
- L1 = relative luminance of lighter color
- L2 = relative luminance of darker color

Relative Luminance:
L = 0.2126 * R + 0.7152 * G + 0.0722 * B

Where R, G, B are:
If channel ≤ 0.03928:
    channel / 12.92
Else:
    ((channel + 0.055) / 1.055) ^ 2.4
```

### Practical Tools

**During audits, use:**
1. Browser DevTools (Chrome/Firefox show contrast in color picker)
2. WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
3. Describe colors and ask AI to calculate (you can estimate)

**For documentation:**
```markdown
**Contrast calculation:**
- Foreground: #999 (light gray)
- Background: #fff (white)
- Ratio: 2.85:1 ❌
- Required: 4.5:1 (normal text)
- Shortfall: 1.58x below requirement
```

---

## 7. Severity Guidelines for Contrast Issues

### Critical
- Body text or important UI labels fail contrast (4.5:1)
- Form inputs invisible or barely visible
- Critical buttons fail contrast
- Error messages not readable

### High
- Focus indicators fail contrast (3:1)
- Selection states not distinguishable
- Large text fails contrast (3:1)
- Secondary buttons fail contrast

### Medium
- Hover states have insufficient contrast
- Disabled states rely only on color
- Decorative elements fail (if they shouldn't be decorative)
- Minor UI components fail 3:1

### Low
- Edge cases with very rare color combinations
- Placeholder text marginally fails (if labels are present)
- Decorative elements that could be improved

---

## 8. Common Audit Mistakes to Avoid

### ❌ Don't Do This:
1. **Only checking default state** - Check ALL states (hover, focus, active, disabled)
2. **Assuming dark mode will be checked separately** - Check both themes in same audit
3. **Trusting designer's "gray" choices** - Always verify, especially for placeholders and disabled states
4. **Ignoring custom components** - Color pickers, sliders, toggles often fail
5. **Not checking focus indicators** - Critical for keyboard users
6. **Skipping icon contrast** - If icons convey meaning, they need contrast too

### ✓ Do This:
1. **Create a state matrix** for each interactive component
2. **Check every color combination** in the design system
3. **Test selection indicators** on all possible backgrounds
4. **Verify focus indicators** on light AND dark backgrounds
5. **Check color-only indicators** and suggest non-color alternatives
6. **Document actual contrast ratios** in findings

---

## 9. Report Template for Contrast Issues

```markdown
## [Severity Icon] Accessibility Issue: [Brief Description]

**WCAG SC:** 1.4.3 Contrast (Minimum) OR 1.4.11 Non-text Contrast (Level AA)
**Severity:** [Critical/High/Medium/Low]

**Issue:**
[Detailed description of the contrast failure, including what element is affected and in what state]

**Impact:**
[Specific impact on users with low vision, color blindness, or in poor lighting conditions]

**Current code:**
```[language]
[Code showing the color values]
```

**Contrast calculation:**
- Foreground: [color value] ([description])
- Background: [color value] ([description])
- Current ratio: [X.XX:1] ❌
- Required ratio: [4.5:1 or 3:1]
- Shortfall: [X.XX]x below requirement

OR for multi-state:
- State 1 (normal): [ratio] ✓
- State 2 (hover): [ratio] ✓
- State 3 (selected): [ratio] ❌ [fails]

**Suggested fix:**
```[language]
[Fixed code with compliant color values]
```

**New contrast ratio:** [X.XX:1] ✓

**Alternative fix (non-color indicator):**
[If applicable, show how to add icons, borders, text, etc.]

**Resources:**
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://webaim.org/resources/contrastchecker/
```

---

## 10. Integration Checklist

Before completing an audit, verify you've checked:

**Text Contrast:**
- [ ] Body text in all states
- [ ] Placeholder text
- [ ] Disabled text
- [ ] Error/success messages
- [ ] Link text (and 3:1 from surrounding text OR underline)
- [ ] Text on images/gradients

**UI Component Contrast:**
- [ ] Form input borders (all states)
- [ ] Button borders (if used for definition)
- [ ] Focus indicators on all focusable elements
- [ ] Selection indicators (checkboxes, radios, toggles, tabs)
- [ ] Hover states on interactive elements
- [ ] Disabled states clearly distinguishable
- [ ] Icons (if meaningful)

**Color-Only Indicators:**
- [ ] Links have underline or other non-color indicator
- [ ] Required fields marked with more than color
- [ ] Errors shown with icons/text, not just color
- [ ] Selection uses shape/position/text, not just color
- [ ] Charts/graphs use patterns + labels
- [ ] Status messages use icons + text

**Calculated and Documented:**
- [ ] All ratios calculated and documented
- [ ] Required threshold specified
- [ ] Fixed color values provided
- [ ] Non-color alternatives suggested where applicable

---

**Last Updated:** 2026-02-10
**Applies to:** WCAG 2.2 Level AA
**Status:** Single Source of Truth for All Accessibility Tools
