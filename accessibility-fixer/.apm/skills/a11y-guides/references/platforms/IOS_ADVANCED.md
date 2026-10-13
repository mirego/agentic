# iOS Advanced Accessibility Features

> **Note:** This guide covers specialized accessibility features loaded conditionally when advanced patterns are detected. For common patterns, see [GUIDE_IOS.md](GUIDE_IOS.md).

---

## When This Guide Is Needed

Load this guide when you detect:
- Advanced VoiceOver features (Magic Tap, Custom Rotor, Large Content Viewer)
- System setting customizations (Smart Invert, Assistive Access, Reduce Motion advanced usage)
- Haptic feedback implementations
- Keyboard/Switch/Voice Control support
- Auto-generated image descriptions
- Speech synthesis
- Complex attributed strings

For 90% of audits, the main iOS guide is sufficient.

---

## Advanced Features

### UIAccessibilityCustomRotor (Navigation in Complex Content)

**Issue:** Dense content difficult to navigate with VoiceOver

```swift
// ✅ CORRECT: Custom rotor for navigating between headings
class DocumentViewController: UIViewController {
    var headingElements: [UILabel] = []

    override func viewDidLoad() {
        super.viewDidLoad()

        // Create custom rotor for headings
        let headingRotor = UIAccessibilityCustomRotor(name: "Headings") { predicate in
            // Navigate to next/previous heading
            let forward = predicate.searchDirection == .next
            let currentIndex = self.currentHeadingIndex

            let nextIndex = forward ? currentIndex + 1 : currentIndex - 1
            guard nextIndex >= 0 && nextIndex < self.headingElements.count else {
                return nil
            }

            let nextHeading = self.headingElements[nextIndex]
            return UIAccessibilityCustomRotorItemResult(
                targetElement: nextHeading,
                targetRange: nil
            )
        }

        accessibilityCustomRotors = [headingRotor]
    }
}

// Use cases: Navigate between headings, data rows, status items, sections
```

### Vision Framework for Image Descriptions

**Issue:** User-generated images without descriptions

```swift
import Vision

// ✅ CORRECT: Auto-generate image descriptions
func generateImageDescription(for image: UIImage, completion: @escaping (String?) -> Void) {
    guard let cgImage = image.cgImage else {
        completion(nil)
        return
    }

    let request = VNRecognizeTextRequest { request, error in
        guard let observations = request.results as? [VNRecognizedTextObservation] else {
            completion(nil)
            return
        }

        let text = observations.compactMap { observation in
            observation.topCandidates(1).first?.string
        }.joined(separator: " ")

        completion(text.isEmpty ? nil : text)
    }

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try? handler.perform([request])
}

// Usage
generateImageDescription(for: userImage) { description in
    imageView.accessibilityLabel = description ?? "User uploaded image"
}
```

### AVSpeechSynthesizer for Voice Feedback

**Issue:** AI assistant without natural voice output

```swift
import AVFoundation

// ✅ CORRECT: Natural voice synthesis
class VoiceAssistant {
    let synthesizer = AVSpeechSynthesizer()

    func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate
        utterance.pitchMultiplier = 1.0
        utterance.volume = 1.0

        synthesizer.speak(utterance)
    }

    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
    }
}

// Use for: Voice assistants, navigation guidance, alerts
```

### NSAttributedString for Rich Text Accessibility

**Issue:** Rich text content loses semantic structure

```swift
// ✅ CORRECT: Accessible attributed strings
let attributedText = NSMutableAttributedString(string: "Question 1: What is accessibility?")

// Set accessibility attributes
attributedText.addAttribute(
    .accessibilitySpeechLanguage,
    value: "en-US",
    range: NSRange(location: 0, length: attributedText.length)
)

// Mark specific portions
attributedText.addAttribute(
    .accessibilitySpeechPitch,
    value: 1.2, // Higher pitch for question number
    range: NSRange(location: 0, length: 11)
)

label.attributedText = attributedText

// SwiftUI - Use accessibility modifiers for structured content
Text("Question 1: ") + Text("What is accessibility?")
    .accessibilityLabel("Question 1: What is accessibility?")
```

**WCAG SC:** Various based on use case

---

## Magic Tap (Primary Action)

**Issue:** Primary action not accessible via Magic Tap gesture

Magic Tap is a VoiceOver gesture (two-finger double-tap) that performs the most common action in the current context. Implement for primary actions like play/pause, answer/hang up, take photo.

```swift
// ✅ CORRECT: Implement Magic Tap for primary action (UIKit)
class MusicPlayerViewController: UIViewController {
    override func accessibilityPerformMagicTap() -> Bool {
        if isPlaying {
            pause()
        } else {
            play()
        }
        return true  // Return true if action was handled
    }
}

// Phone call screen
class CallViewController: UIViewController {
    override func accessibilityPerformMagicTap() -> Bool {
        if isInCall {
            hangUp()
        } else {
            answer()
        }
        return true
    }
}

// SwiftUI - Use accessibilityAction with .magicTap
struct MusicPlayerView: View {
    @State private var isPlaying = false

    var body: some View {
        VStack {
            Text(isPlaying ? "Playing" : "Paused")
            Button(isPlaying ? "Pause" : "Play") {
                isPlaying.toggle()
            }
        }
        .accessibilityAction(.magicTap) {
            isPlaying.toggle()
        }
    }
}

// Camera app
struct CameraView: View {
    var body: some View {
        ZStack {
            CameraPreview()
            Button("Take Photo") {
                takePhoto()
            }
        }
        .accessibilityAction(.magicTap) {
            takePhoto()
        }
    }
}
```

**Common Magic Tap Actions:**
- ✅ Play/Pause media
- ✅ Start/Stop recording
- ✅ Answer/Hang up call
- ✅ Take photo
- ✅ Start/Stop timer
- ❌ Don't use for navigation
- ❌ Don't use for secondary actions

**WCAG SC:** 2.1.1 Keyboard (Level A)

---

## Large Content Viewer

**Issue:** Small UI elements not zoomable for low vision users

Large Content Viewer lets users view a larger version of small UI elements (like tab bar icons) by long-pressing.

```swift
// ✅ CORRECT: Enable Large Content Viewer (UIKit)
class CustomTabBarController: UITabBarController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // Tab bar items automatically support Large Content Viewer
        // Just ensure they have proper titles
        let homeItem = UITabBarItem(
            title: "Home",
            image: UIImage(systemName: "house"),
            tag: 0
        )
        homeItem.showsLargeContentViewer = true  // Enable large content viewer
    }
}

// Custom button with Large Content Viewer
let button = UIButton()
button.setImage(UIImage(systemName: "star"), for: .normal)
button.showsLargeContentViewer = true
button.largeContentTitle = "Favorite"
button.largeContentImage = UIImage(systemName: "star.fill")

// SwiftUI - Automatic with .accessibilityShowsLargeContentViewer()
struct ToolbarView: View {
    var body: some View {
        HStack {
            Button(action: { share() }) {
                Image(systemName: "square.and.arrow.up")
            }
            .accessibilityLabel("Share")
            .accessibilityShowsLargeContentViewer {
                Label("Share", systemImage: "square.and.arrow.up")
            }

            Button(action: { favorite() }) {
                Image(systemName: "star")
            }
            .accessibilityLabel("Favorite")
            .accessibilityShowsLargeContentViewer()
        }
    }
}
```

**When to use:**
- ✅ Tab bar icons
- ✅ Toolbar buttons with small icons
- ✅ Custom controls with small touch targets
- ✅ Icon-only buttons

**WCAG SC:** 1.4.4 Resize Text (Level AA)

---

## Smart Invert Support

**Issue:** App appearance breaks with Smart Invert colors

Smart Invert inverts colors except for images, media, and some UI elements. Ensure your app supports this feature correctly.

```swift
// ✅ CORRECT: Exclude images from Smart Invert (UIKit)
imageView.accessibilityIgnoresInvertColors = true

// Photos, videos, and app icons should not be inverted
photoImageView.accessibilityIgnoresInvertColors = true
videoPlayerView.accessibilityIgnoresInvertColors = true

// SwiftUI - Use .accessibilityIgnoresInvertColors()
struct PhotoView: View {
    var body: some View {
        Image("userPhoto")
            .resizable()
            .accessibilityIgnoresInvertColors()  // Don't invert photos
    }
}

// App icon or branding
Image("appLogo")
    .accessibilityIgnoresInvertColors()

// Video player
VideoPlayer(player: player)
    .accessibilityIgnoresInvertColors()
```

**What to exclude from inversion:**
- ✅ Photos and user images
- ✅ Videos and media
- ✅ App logos and branding
- ✅ QR codes and barcodes
- ✅ Map imagery
- ❌ Don't exclude UI elements
- ❌ Don't exclude text

**WCAG SC:** 1.4.11 Non-text Contrast (Level AA)

---

## VoiceOver Pronunciation

**Issue:** Brand names, acronyms, or technical terms mispronounced

Provide pronunciation hints for words that VoiceOver might mispronounce.

```swift
// ✅ CORRECT: Custom pronunciation (UIKit)
label.text = "SQL"
label.accessibilityLabel = "S Q L"  // Spell out

// Or use phonetic spelling
label.text = "GIF"
label.accessibilityAttributedLabel = NSAttributedString(
    string: "jif",
    attributes: [.accessibilitySpeechIPANotation: "dʒɪf"]
)

// SwiftUI - Use accessibilityLabel with spelled out text
Text("SQL")
    .accessibilityLabel("S Q L")

Text("iOS")
    .accessibilityLabel("i O S")

// For complex pronunciation, use attributed strings
Text("Kubernetes")
    .accessibilityLabel("koo-ber-net-eez")

// Currency
Text("$99")
    .accessibilityLabel("99 dollars")

// Abbreviations
Text("Dr. Smith")
    .accessibilityLabel("Doctor Smith")

Text("Inc.")
    .accessibilityLabel("Incorporated")
```

**Common cases:**
- ✅ Acronyms (SQL, API, iOS)
- ✅ Brand names (AWS, Azure)
- ✅ Technical terms
- ✅ Currency symbols
- ✅ Abbreviations
- ✅ Non-standard words

**WCAG SC:** 3.1.6 Pronunciation (Level AAA)

---

## Haptics for Audio Feedback

**Issue:** Audio cues without haptic alternatives

```swift
// ❌ ISSUE: Audio-only feedback
func playSuccessSound() {
    AudioServicesPlaySystemSound(1054)
}

// ✅ CORRECT: Audio + haptic feedback
import CoreHaptics

func playSuccessFeedback() {
    // Play audio
    AudioServicesPlaySystemSound(1054)

    // Add haptic feedback
    let generator = UINotificationFeedbackGenerator()
    generator.notificationOccurred(.success)
}

// Different haptic types
let impactGenerator = UIImpactFeedbackGenerator(style: .medium)
impactGenerator.impactOccurred()

let selectionGenerator = UISelectionFeedbackGenerator()
selectionGenerator.selectionChanged()

// SwiftUI - Using sensoryFeedback (iOS 17+)
Button("Submit") {
    submit()
}
.sensoryFeedback(.success, trigger: isSubmitted)

// Custom haptic patterns (iOS 13+)
func playCustomHaptic() throws {
    let engine = try CHHapticEngine()
    try engine.start()

    let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)
    let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0)

    let event = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [sharpness, intensity],
        relativeTime: 0
    )

    let pattern = try CHHapticPattern(events: [event], parameters: [])
    let player = try engine.makePlayer(with: pattern)
    try player.start(atTime: 0)
}
```

**When to use haptics:**
- ✅ Success/error feedback
- ✅ Important notifications
- ✅ Selection confirmation
- ✅ Game events
- ❌ Don't overuse (can be annoying or distracting)

**WCAG SC:** 1.3.3 Sensory Characteristics (Level A)

---

## Full Keyboard Access

**Issue:** App not navigable with keyboard alone

```swift
// ✅ CORRECT: Ensure focusable elements work with keyboard
// SwiftUI - Automatic keyboard support
Form {
    TextField("Name", text: $name)
    TextField("Email", text: $email)
    Button("Submit") { submit() }
}
// All elements automatically keyboard accessible

// Custom focus management (iOS 15+)
struct LoginView: View {
    @FocusState private var focusedField: Field?

    enum Field {
        case username, password
    }

    var body: some View {
        VStack {
            TextField("Username", text: $username)
                .focused($focusedField, equals: .username)

            SecureField("Password", text: $password)
                .focused($focusedField, equals: .password)

            Button("Login") { login() }
        }
        .onAppear {
            focusedField = .username
        }
    }
}

// UIKit - Override keyboard commands
override var keyCommands: [UIKeyCommand]? {
    return [
        UIKeyCommand(
            input: "N",
            modifierFlags: .command,
            action: #selector(createNew),
            discoverabilityTitle: "New Item"
        )
    ]
}

// DON'T override system keyboard shortcuts
// These are reserved: Cmd+C, Cmd+V, Cmd+X, Cmd+Z, Cmd+Tab, etc.
```

**Testing:** Enable Full Keyboard Access in Settings > Accessibility > Keyboards

**WCAG SC:** 2.1.1 Keyboard (Level A)

---

## Switch Control Support

**Issue:** Interface not accessible via Switch Control

```swift
// ✅ CORRECT: Ensure proper labeling for Switch Control
// All accessibility labels, traits, and actions work with Switch Control

// Custom views must be properly configured
class CustomControl: UIControl {
    override init(frame: CGRect) {
        super.init(frame: frame)
        isAccessibilityElement = true
        accessibilityLabel = "Volume"
        accessibilityTraits = .adjustable
        accessibilityValue = "\(volume)%"
    }

    // Implement accessibility actions
    override func accessibilityIncrement() {
        volume = min(volume + 10, 100)
        accessibilityValue = "\(volume)%"
    }

    override func accessibilityDecrement() {
        volume = max(volume - 10, 0)
        accessibilityValue = "\(volume)%"
    }
}

// SwiftUI - Automatic support with proper modifiers
Slider(value: $volume, in: 0...100)
    .accessibilityLabel("Volume")
    .accessibilityValue("\(Int(volume))%")
```

**Testing:** Enable Switch Control in Settings > Accessibility > Switch Control

**WCAG SC:** 2.1.1 Keyboard (Level A)

---

## Voice Control

**Issue:** Interface elements not properly labeled for voice commands

```swift
// ✅ CORRECT: Descriptive labels enable voice commands
Button("Submit") { }
    .accessibilityLabel("Submit form")
// Voice Control: "Tap Submit form"

// Avoid generic labels
// ❌ WRONG: Generic label
Button { deleteItem() } label: {
    Image(systemName: "trash")
}
.accessibilityLabel("Delete")
// Voice Control sees multiple "Delete" buttons - ambiguous!

// ✅ CORRECT: Specific label
Button { deleteItem(item) } label: {
    Image(systemName: "trash")
}
.accessibilityLabel("Delete \(item.name)")
// Voice Control: "Tap Delete Photo Album"

// UIKit - Custom accessibility identifier for Voice Control
button.accessibilityLabel = "Share photo"
button.accessibilityIdentifier = "sharePhotoButton"
```

**Best practices:**
- Use unique, descriptive labels
- Avoid generic terms when multiple similar elements exist
- Test with Voice Control enabled

**WCAG SC:** 4.1.2 Name, Role, Value (Level A)

---

## Assistive Access (Cognitive Accessibility)

**Issue:** Complex UI overwhelming for cognitive disabilities

```swift
// ✅ CORRECT: Simplify UI when Assistive Access is enabled
// Check for Assistive Access setting (iOS 17+)
#if compiler(>=5.9)
if ProcessInfo.processInfo.isAssistiveAccessEnabled {
    // Show simplified UI
    SimplifiedHomeView()
} else {
    // Show standard UI
    StandardHomeView()
}
#endif

// Best practices for Assistive Access:
// 1. Show only core functionality
// 2. One action per screen
// 3. Large, clear buttons
// 4. Minimal distractions
// 5. Double confirmation for destructive actions

struct SimplifiedView: View {
    var body: some View {
        VStack(spacing: 40) {
            // Large, clear action
            Button(action: takePhoto) {
                VStack {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 60))
                    Text("Take Photo")
                        .font(.title)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 200)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(20)
            }

            // Confirm destructive actions
            Button(action: showDeleteConfirmation) {
                Text("Delete")
                    .frame(maxWidth: .infinity)
                    .frame(height: 100)
            }
        }
        .padding(40)
    }
}
```

**WCAG SC:** 3.2.4 Consistent Identification (Level AA)

---

## Auto-play Controls

**Issue:** Auto-playing media without controls

```swift
// ❌ ISSUE: Auto-playing video without controls
let player = AVPlayer(url: videoURL)
player.play()

// ✅ CORRECT: Provide controls and respect settings
import AVKit

struct VideoView: View {
    @State private var player = AVPlayer(url: videoURL)
    @Environment(\.accessibilityReduceMotion) var reduceMotion

    var body: some View {
        VideoPlayer(player: player)
            .onAppear {
                // Check user preference for autoplay
                if !UserDefaults.standard.bool(forKey: "disableAutoplay") &&
                   !reduceMotion {
                    player.play()
                }
            }
            .onDisappear {
                player.pause()
            }
    }
}

// Provide setting to disable autoplay
Toggle("Auto-play videos", isOn: $autoplayEnabled)
    .onChange(of: autoplayEnabled) { newValue in
        UserDefaults.standard.set(!newValue, forKey: "disableAutoplay")
    }

// Support Dim Flashing Lights setting (iOS 17+)
#if compiler(>=5.9)
@Environment(\.accessibilityDimFlashingLights) var dimFlashing

if dimFlashing {
    // Reduce flashing effects in video
    player.currentItem?.videoComposition = createDimmedComposition()
}
#endif
```

**WCAG SC:** 1.4.2 Audio Control (Level A), 2.2.2 Pause, Stop, Hide (Level A), 2.3.1 Three Flashes or Below Threshold (Level A)

---
