# tvOS Accessibility Audit Guide
## Apple TV and Focus Engine

---


## tvOS Specific Patterns

### 1. Focus Engine Configuration

```swift
// ✅ CORRECT: Focus engine configuration
override var canBecomeFocused: Bool {
    return true
}

override func didUpdateFocus(
    in context: UIFocusUpdateContext,
    with coordinator: UIFocusAnimationCoordinator
) {
    super.didUpdateFocus(in: context, with: coordinator)
    
    if context.nextFocusedView == self {
        // Handle focus gained - scale up
        coordinator.addCoordinatedAnimations({
            self.transform = CGAffineTransform(scaleX: 1.1, y: 1.1)
        }, completion: nil)
    } else {
        // Handle focus lost - scale down
        coordinator.addCoordinatedAnimations({
            self.transform = .identity
        }, completion: nil)
    }
}
```

### 2. SwiftUI Focus

```swift
// ✅ CORRECT: SwiftUI tvOS button
Button("Watch Now") {
    playVideo()
}
.buttonStyle(.card)
.focusable()
```

---

### 3. Accessibility Labels

All guidance from GUIDE_IOS.md applies - labels, traits, etc. are the same.

---

