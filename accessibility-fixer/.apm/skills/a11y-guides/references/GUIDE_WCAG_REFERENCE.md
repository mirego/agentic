# WCAG 2.2 Reference Guide

---

## WCAG 2.2 Overview

### The POUR Principles

All WCAG success criteria are organized under four core principles:

1. **Perceivable** - Information and UI components must be presentable to users in ways they can perceive
2. **Operable** - UI components and navigation must be operable
3. **Understandable** - Information and operation of UI must be understandable
4. **Robust** - Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies

### Conformance Levels

- **Level A**: Basic accessibility features (minimum requirement)
- **Level AA**: Most common compliance target, addresses major barriers
- **Level AAA**: Enhanced accessibility (not required for full sites)

**Target for most audits: Level AA compliance**

### Mobile Considerations

When applying WCAG to mobile:
- "Web pages" = "screens" or "views"
- Focus on platform accessibility services (TalkBack, VoiceOver)
- Consider touch interfaces and gesture controls
- Account for device capabilities (orientation, sensors)

---


## Severity Guidelines

**Critical:**
- Blocks core functionality
- Affects many users
- Violates Level A criteria
- Examples: Cannot submit form, cannot navigate with keyboard

**High:**
- Significantly impairs experience
- Affects moderate number of users
- Violates Level AA criteria
- Examples: Low contrast, missing headings, collection items not grouped

**Medium:**
- Degrades experience
- Affects specific user groups
- Best practice violation
- Examples: Suboptimal focus order, missing skip link

**Low:**
- Minor inconvenience
- Affects few users
- Enhancement opportunity
- Examples: Decorative image not hidden, verbose label

**For detailed severity assignment rules, see:** [Severity Guidelines](wcag/SEVERITY_GUIDELINES.md)

---

## Best Practices for Auditors

1. **Be Specific:** Always provide file paths, line numbers, and exact locations
2. **Show Impact:** Explain how each issue affects real users
3. **Provide Solutions:** Include working code examples for fixes
4. **Test with Real AT:** Don't rely only on automated tools
5. **Consider Context:** Mobile apps have different patterns than web
6. **Stay Updated:** WCAG and platform guidelines evolve

---

## Quick Start: Where to Find Information

**I need to know...**
- **Which WCAG SC applies to a button/image/form?** → [Component-to-WCAG Mappings](wcag/COMPONENT_WCAG_MAPPINGS.md)
- **How severe is this issue?** → [Severity Guidelines](wcag/SEVERITY_GUIDELINES.md)
- **What does WCAG SC 4.1.2 mean for mobile?** → [Mobile WCAG Interpretation](wcag/MOBILE_WCAG_INTERPRETATION.md)
- **All details about Principle 1?** → [Principle 1: Perceivable](wcag/PRINCIPLE_1_PERCEIVABLE.md)
- **Quick implementation examples?** → [Quick Lookup Tables](wcag/QUICK_LOOKUP.md)
- **Collection/list accessibility?** → [Collection Items Pattern](patterns/COLLECTION_ITEMS_PATTERN.md)
- **Text scaling requirements?** → [Font Scaling Support](patterns/FONT_SCALING_SUPPORT.md)
- **Decorative image rules?** → [Decorative Image Decision Tree](patterns/DECORATIVE_IMAGE_DECISION_TREE.md)

---

**For platform-specific guidance, see:**
- [GUIDE_WEB.md](platforms/GUIDE_WEB.md)
- [GUIDE_ANDROID.md](platforms/GUIDE_ANDROID.md)
- [GUIDE_IOS.md](platforms/GUIDE_IOS.md)
- [GUIDE_REACT_NATIVE.md](platforms/GUIDE_REACT_NATIVE.md)
- [GUIDE_FLUTTER.md](platforms/GUIDE_FLUTTER.md)
- [GUIDE_ANDROID_TV.md](platforms/GUIDE_ANDROID_TV.md)
- [GUIDE_TVOS.md](platforms/GUIDE_TVOS.md)
- [COMMON_ISSUES.md](COMMON_ISSUES.md)
