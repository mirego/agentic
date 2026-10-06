# WCAG 2.2 Principle 3: Understandable
## Information and the operation of user interface must be understandable

---

## Guideline 3.1 Readable

**Make text content readable and understandable.**

### 3.1.1 Language of Page (Level A)

**Criterion:**
The default human language of each page can be programmatically determined.

**Mobile/Native App Interpretation:**
- Set app language/locale appropriately
- Ensure system can determine content language
- Important for text-to-speech and translation
- Set language for screen readers to use correct pronunciation

**Common Violations:**
- Language not declared
- Wrong language set
- Mixed language content not marked

**Platform-Specific:**
- **Android:** System uses device locale, ensure proper localization files
- **iOS:** Declare supported languages in Info.plist, use proper localization
- **Web:** Use `<html lang="en">` attribute
- Ensure screen reader respects language settings

**Testing:**
- Check app language settings
- Verify screen reader uses correct pronunciation
- Test with different system languages

### 3.1.2 Language of Parts (Level AA)

**Criterion:**
The human language of each passage or phrase can be programmatically determined.

**Mobile/Native App Interpretation:**
- Mark content in different languages
- Use accessibility API to declare language changes
- Important for multilingual content
- Screen readers should switch pronunciation

**Common Violations:**
- Quote in French within English app not marked
- Product names in different languages not identified
- Mixed language reviews without language tags

**Platform-Specific:**
- **Android:** Use `accessibilityLanguage` attribute in Compose
- **iOS:** Use `accessibilityLanguage` property
- **Web:** Use `lang` attribute on elements

**Testing:**
- Identify mixed-language content
- Verify screen reader pronunciation changes
- Test with multilingual content

### 3.1.3 Unusual Words (Level AAA)

**Criterion:**
Mechanism available for identifying specific definitions of words used in an unusual way.

**Note:** Level AAA - provide glossary for technical terms.

### 3.1.4 Abbreviations (Level AAA)

**Criterion:**
Mechanism for identifying expanded form of abbreviations.

**Note:** Level AAA - expand abbreviations on first use or provide glossary.

### 3.1.5 Reading Level (Level AAA)

**Criterion:**
When text requires reading ability more advanced than lower secondary education, supplemental content is available.

**Note:** Level AAA - provide simplified versions or explanations.

### 3.1.6 Pronunciation (Level AAA)

**Criterion:**
Mechanism for identifying specific pronunciation of words.

**Note:** Level AAA - relevant for words where meaning depends on pronunciation.

---

## Guideline 3.2 Predictable

**Make pages appear and operate in predictable ways.**

### 3.2.1 On Focus (Level A)

**Criterion:**
When component receives focus, it does not initiate a change of context.

**Mobile/Native App Interpretation:**
- Focusing on input doesn't submit form
- Focusing on control doesn't change screen
- Focus doesn't trigger navigation
- Focus doesn't open dialogs/modals automatically
- User must explicitly activate (tap/click) for changes

**Common Violations:**
- Selecting dropdown item navigates to new screen
- Focus on last form field submits form
- Focusing input opens picker immediately
- Tab focus triggers navigation

**What IS allowed:**
- Showing keyboard when focusing input
- Highlighting focused element
- Showing tooltips on focus
- Updating help text

**Testing:**
- Tab through all interactive elements
- Verify no unexpected navigation
- Check that focus alone doesn't submit forms
- Ensure explicit activation required

### 3.2.2 On Input (Level A)

**Criterion:**
Changing the setting of a user interface component does not automatically cause a change of context.

**Mobile/Native App Interpretation:**
- Changing form input doesn't submit automatically
- Selecting dropdown/picker doesn't navigate without confirmation
- Toggling switch doesn't change screens
- Radio button selection doesn't auto-submit
- Provide explicit submit button or clear indication

**Common Violations:**
- Country selector automatically reloads page
- Last character in code input auto-submits
- Radio button auto-submits form
- Toggle switch navigates to new screen without warning

**What IS allowed:**
- Live validation feedback
- Updating related fields (e.g., state based on country)
- Showing/hiding conditional fields
- Enabling/disabling related controls

**Exceptions:**
- When user is warned in advance
- Standard platform behaviors users expect

**Testing:**
- Change all form inputs
- Select dropdown/picker items
- Toggle switches
- Verify explicit submit required

### 3.2.3 Consistent Navigation (Level AA)

**Criterion:**
Navigational mechanisms that are repeated on multiple pages occur in the same relative order.

**Mobile/Native App Interpretation:**
- Bottom navigation stays in same position/order
- Navigation drawer menu items stay in same order
- Tab bar order consistent across screens
- Toolbar buttons in consistent positions
- Back button behavior predictable

**Common Violations:**
- Navigation menu items reorder between screens
- Bottom nav changes order or position
- Toolbar icons in different positions per screen
- Inconsistent back button behavior

**Testing:**
- Navigate through multiple screens
- Verify navigation elements stay consistent
- Check order and position remain stable
- Test back button behavior

### 3.2.4 Consistent Identification (Level AA)

**Criterion:**
Components with same functionality are identified consistently.

**Mobile/Native App Interpretation:**
- Icons for same action look the same across screens
- Buttons with same purpose have same label
- Similar controls use same terminology
- Consistent icons and labels throughout app

**Common Violations:**
- Save icon is floppy disk on one screen, checkmark on another
- "Submit" button on one screen, "Send" on another for same action
- Search icon changes between screens
- Inconsistent naming for same functionality

**Testing:**
- Identify repeated functionality
- Verify consistent icons
- Check consistent labeling
- Review terminology across app

### 3.2.5 Change on Request (Level AAA)

**Criterion:**
Changes of context are initiated only by user request or mechanism available to turn off.

**Note:** Level AAA - stricter than 3.2.1 and 3.2.2.

### 3.2.6 Consistent Help (Level A) - NEW in WCAG 2.2

**Criterion:**
If help mechanism is available on multiple screens, it occurs in consistent relative order/position.

**Mobile/Native App Interpretation:**
- Help button/icon in consistent location
- Support chat widget in same position
- FAQ/Help menu item in same place
- Feedback mechanism consistently positioned

**Common Violations:**
- Help button in top-right on some screens, bottom-right on others
- Support chat icon moves between screens
- Help menu item in different menu positions

**Testing:**
- Locate help mechanism on each screen
- Verify consistent position
- Check predictable access pattern

---

## Guideline 3.3 Input Assistance

**Help users avoid and correct mistakes.**

### 3.3.1 Error Identification (Level A)

**Criterion:**
If input error is automatically detected, the item in error is identified and described to user in text.

**Mobile/Native App Interpretation:**
- Error messages clearly indicate which field has error
- Error description is readable by screen readers
- Errors announced when they appear
- Multiple errors listed clearly
- Visual and programmatic error indication

**Common Violations:**
- Error only shown with red border (no text)
- Generic "Form has errors" without specifics
- Error message not associated with field for screen readers
- Multiple errors not clearly listed

**Platform-Specific:**
- **Android:** Use `setError()` on EditText, announce with live regions
- **iOS:** Set `accessibilityValue` or `accessibilityHint` with error
- **Web:** Use ARIA `aria-invalid` and `aria-describedby`

**Testing:**
- Submit forms with invalid data
- Verify errors clearly identified
- Check screen reader announces errors
- Verify each error linked to specific field

### 3.3.2 Labels or Instructions (Level A)

**Criterion:**
Labels or instructions are provided when content requires user input.

**Mobile/Native App Interpretation:**
- All form fields have visible labels
- Instructions provided when format is specific
- Required fields indicated (not just by color)
- Examples shown for complex inputs
- Placeholder text is NOT sufficient as label

**Common Violations:**
- Input field with only placeholder text
- Required indicator only in color (red asterisk)
- No format example for phone/date inputs
- Unlabeled form fields
- Instructions only in tooltip that's hard to find

**Platform-Specific:**
- **Android:** Use TextInputLayout with hint and helper text
- **iOS:** Use UILabel associated with text field
- **Web:** Use `<label>` element associated with input

**Testing:**
- Review all form fields
- Verify visible, persistent labels
- Check instructions for complex inputs
- Verify labels accessible to screen readers

### 3.3.3 Error Suggestion (Level AA)

**Criterion:**
If input error is detected and suggestions for correction are known, then suggestions are provided to user.

**Mobile/Native App Interpretation:**
- Error messages suggest how to fix
- Format examples shown for format errors
- Suggestions for common typos (email, passwords)
- Helpful guidance, not just "invalid"
- Examples: "Email must include @" instead of "Invalid email"

**Common Violations:**
- "Invalid input" without explaining why
- "Error" without helpful guidance
- Format requirements not explained
- No suggestion for correcting error

**Examples of Good Error Suggestions:**
- "Password must be at least 8 characters"
- "Email must include @ symbol"
- "Date format: MM/DD/YYYY"
- "Phone number: (###) ###-####"

**Testing:**
- Trigger various validation errors
- Verify suggestions provided
- Check helpfulness of error messages
- Verify suggestions are specific

### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

**Criterion:**
For pages that cause legal commitments or financial transactions, submissions are reversible, checked, or confirmed.

**Mobile/Native App Interpretation:**
- Confirmation screen before purchase/submission
- Review order before completing
- Ability to edit before final submission
- Checkbox to confirm understanding
- Clear cancel/back option

**Common Violations:**
- Purchase completes with single tap
- No order review screen
- Can't edit after proceeding
- No confirmation for significant actions
- No way to undo/cancel

**Testing:**
- Test checkout/submission flows
- Verify confirmation required
- Check review screen exists
- Test cancel/back functionality

### 3.3.5 Help (Level AAA)

**Criterion:**
Context-sensitive help is available.

**Note:** Level AAA - but good practice for complex forms.

### 3.3.6 Error Prevention (All) (Level AAA)

**Criterion:**
For pages requiring user input, submissions are reversible, checked, or confirmed.

**Note:** Level AAA - extends 3.3.4 to all submissions.

### 3.3.7 Redundant Entry (Level A) - NEW in WCAG 2.2

**Criterion:**
Information previously entered or provided to user is auto-populated or available for selection.

**Mobile/Native App Interpretation:**
- Use autofill for common fields (name, email, address)
- Remember user preferences within session
- Pre-populate repeated information in multi-step flows
- Offer to save/reuse information
- Don't require re-entering same data

**Common Violations:**
- Multi-step form requiring same info repeatedly
- Shipping address not auto-populated from previous order
- Payment info not remembered (when secure to do so)
- No autofill support for standard fields

**Platform-Specific:**
- **Android:** Use `autofillHints` for standard fields
- **iOS:** Use `textContentType` for autofill
- **Web:** Use `autocomplete` attribute

**Exceptions:**
- Security (password re-entry for verification)
- Essential re-entry (confirm email)

**Testing:**
- Navigate multi-step forms
- Verify info carries forward
- Check autofill works
- Verify user isn't re-entering same data

### 3.3.8 Accessible Authentication (Minimum) (Level AA) - NEW in WCAG 2.2

**Criterion:**
Cognitive function test (such as remembering password) is not required for authentication step unless alternatives provided.

**Mobile/Native App Interpretation:**
- Support biometric authentication (Face ID, fingerprint)
- Support password managers
- Offer "magic link" email authentication
- Support OAuth/social sign-in
- Don't require remembering complex passwords
- Allow copy-paste in password fields

**Common Violations:**
- Blocking password managers
- No biometric option when platform supports it
- Preventing paste in password fields
- Complex CAPTCHA without alternative
- Requiring memorization of complex codes

**Platform-Specific:**
- **Android:** Support Biometric API, Autofill Framework
- **iOS:** Support Face ID, Touch ID, Passwords framework
- Allow password managers access

**Exceptions:**
- Alternative method available (e.g., biometrics)
- Object recognition with alternative
- Personal content (e.g., identify your photos)

**Testing:**
- Test authentication methods
- Verify biometric option available
- Check password manager compatibility
- Ensure copy-paste works in password fields

### 3.3.9 Accessible Authentication (Enhanced) (Level AAA) - NEW in WCAG 2.2

**Criterion:**
Cognitive function test not required for authentication.

**Note:** Level AAA - no cognitive tests at all, even with alternatives.

---

## Quick Reference: Common Understandable Issues by Platform

### Android
- **3.2.1:** Input focus triggers unexpected navigation
- **3.2.3:** Navigation drawer order changes between screens
- **3.3.1:** Errors shown only visually (red border) without text
- **3.3.2:** EditText with only hint, no label
- **3.3.7:** No autofillHints for standard fields

### iOS
- **3.2.1:** Focusing text field triggers picker immediately
- **3.2.3:** Tab bar order inconsistent
- **3.3.1:** Error not announced to VoiceOver
- **3.3.2:** Text field without associated label
- **3.3.8:** No Face ID/Touch ID support for authentication

### Web
- **3.1.1:** Missing `lang` attribute on html element
- **3.2.2:** Dropdown selection auto-submits form
- **3.3.1:** Error not associated with field (aria-describedby)
- **3.3.2:** Placeholder used as label instead of `<label>`
- **3.3.7:** No autocomplete attributes on form fields

### React Native
- **3.2.3:** Navigation structure changes between screens
- **3.3.1:** Errors not announced to screen readers
- **3.3.2:** Input without accessible label
- **3.3.7:** No textContentType for standard fields

### Flutter
- **3.2.1:** Focus listener triggers navigation
- **3.3.1:** Error shown visually only
- **3.3.2:** TextField without explicit label
- **3.3.7:** No autofill configuration

---

## Form Validation Best Practices

### Error Messages Should:
1. **Identify the field:** "Email field error:"
2. **Describe the problem:** "Email must include @ symbol"
3. **Suggest solution:** "Enter email in format: name@example.com"
4. **Be announced to screen readers:** Use live regions or field association
5. **Be visible near the field:** Not just at top of form
6. **Not rely on color alone:** Include icon and text

### Example Good Error Message:
```
"Email address error: The email must include an @ symbol.
Example: yourname@example.com"
```

### Example Bad Error Message:
```
"Invalid"
```

---

## Related Guides
- [Font Scaling Support](../patterns/FONT_SCALING_SUPPORT.md) - Readability
- [Common Issues Reference](../COMMON_ISSUES.md) - Error patterns
- Platform-specific guides for implementation details

---

**Official WCAG 2.2 Reference:** https://www.w3.org/TR/WCAG22/#understandable
**WCAG 2.2 JSON Data:** https://www.w3.org/WAI/WCAG22/wcag.json
