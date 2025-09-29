# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pyramiden-Puzzle-Challenge is a browser-based educational math game in German that teaches addition through "number walls" - pyramid structures where each brick's value equals the sum of the two bricks below it. The game generates random puzzles where players fill in missing numbers and tracks their performance with persistent scoring.

## Architecture

The codebase follows a clean separation of concerns:

- **Browser UI Layer**: `index.html` (structure), `style.css` (styling), `game.js` (DOM interaction)
- **Core Logic Layer**: `game-core.js` (pure game logic, DOM-independent)
- **Configuration Layer**: `constants.js` (centralized configuration and magic numbers)
- **Testing Layer**: `game.test.js` (unit tests for core logic)

### Key Classes

- `NumberWall` (in `game.js`): Handles DOM manipulation, user interaction, game flow, score display updates, and sound management
- `NumberWallCore` (in `game-core.js`): Contains pure game logic for weighted number generation, validation, mathematical rules, score tracking, and German message generation
- `SoundManager` (in `game-core.js`): Handles programmatic sound generation using Web Audio API for immersive feedback

### Mathematical Rules

The number wall follows these equations:
- A + B = D
- B + C = E
- D + E = F

All numbers are constrained to configurable range (default 0-20, customizable up to 1000) with weighted generation (0 appears less frequently than 1-max). The game randomly selects 3 positions to hide and validates user answers.

## Development Commands

### Testing
```bash
npm test                    # Run all unit tests
node game.test.js          # Run tests directly
```

### Code Quality
```bash
node -c constants.js && node -c game-core.js && node -c game.js    # Validate JavaScript syntax
```

**IMPORTANT**: Always run syntax validation before committing code changes.

### Running the Game
Open `index.html` in a web browser - no build step required.

## File Structure

- `index.html` - Main game interface
- `style.css` - Game styling and layout
- `constants.js` - Centralized configuration constants (dual Node.js/browser compatibility)
- `game.js` - Browser-specific game implementation with DOM handling
- `game-core.js` - Pure game logic for testing and potential reuse
- `game.test.js` - Streamlined unit tests (8 essential test cases covering core logic, validation, custom ranges, multi-digit timing, security, and bug regression protection)
- `specs/000-idea.txt` - Original requirements and design decisions

## Testing Strategy

Tests focus on essential functionality to ensure mathematical correctness, input validation, and critical edge cases. The streamlined test suite prioritizes maintainability while providing comprehensive coverage of core features.

### Testing Requirements

- **MUST write tests for all new functionality** - Every new feature, method, or significant logic change requires corresponding unit tests
- **MUST verify all tests pass before considering any task complete** - Run `npm test` and ensure all 8 tests pass before marking work as done
- **Tests should cover critical paths and regression protection** - Focus on essential functionality rather than exhaustive edge cases
- **Core logic changes require test updates** - Any modifications to `game-core.js` must include test verification

### Test Coverage

The 8 essential tests cover:
1. **Mathematical relationship validation** - Core A+B=D, B+C=E, D+E=F logic
2. **Correct answer acceptance** - Valid solutions are properly accepted
3. **Incorrect answer rejection** - Invalid solutions are properly rejected
4. **Custom maximum range support** - Custom ranges work correctly up to 1000
5. **Multi-digit validation timing** - 3-digit numbers (e.g., F=280) validate correctly with high custom maximums
6. **Validation timing bug regression** - F=90 bug fix with custom maximum 90
7. **Security protection** - Infinite recursion prevention with fallback values
8. **Input validation** - Non-numeric and invalid inputs are handled safely

## Security Features

The application implements multiple layers of security protection:

### Content Security Policy (CSP)
- **Location**: `index.html` meta tag
- **Policy**: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';`
- **Purpose**: Prevents XSS attacks, data exfiltration, and unauthorized resource loading
- **Browser-level enforcement** that complements JavaScript validation

### Input Validation
- **Regex filtering**: `/[^0-9]/g` prevents non-numeric input
- **Length protection**: MAX_INPUT_LENGTH (2) character limit in JavaScript (defense-in-depth beyond HTML maxlength)
- **Location**: `game.js` setupEventListeners method using GAME_CONSTANTS

### Recursion Protection
- **Attempt limit**: MAX_GENERATION_ATTEMPTS (100) iterations maximum in `generateWall()` method
- **Fallback values**: FALLBACK_VALUES constant `{a:1, b:1, c:1, d:2, e:2, f:4}` if limit exceeded
- **Purpose**: Prevents potential stack overflow in edge cases
- **Location**: `game-core.js` generateWall method using GAME_CONSTANTS

### Security Testing
- **Comprehensive test coverage** for all security features
- **Edge case validation** including recursion limits and fallback scenarios
- **Mathematical integrity verification** even in security fallback modes

## Random Number Generation

The game uses weighted random number generation to improve gameplay experience:

### Weighted Distribution
- **Number 0**: ZERO_WEIGHT (1) out of RANDOM_WEIGHT_TOTAL (81) probability (~1.2%)
- **Numbers 1-20**: NON_ZERO_WEIGHT (4) out of RANDOM_WEIGHT_TOTAL (81) each (~4.9%)
- **Purpose**: Reduces frequency of 0 to create more engaging mathematical challenges
- **Implementation**: `generateRandomNumber()` method in `game-core.js` using GAME_CONSTANTS

### Statistical Testing
- **Large sample validation**: WEIGHTED_RANDOM_SAMPLE_SIZE (2,100) samples verifies weighted distribution
- **Statistical significance testing**: STATISTICAL_THRESHOLD (0.7) ensures 0 appears significantly less than other numbers
- **Range validation**: Confirms all numbers remain within MIN_NUMBER to DEFAULT_MAXIMUM bounds

## High Score Tracking

The game implements persistent score tracking throughout the session:

### Score Management
- **Right answers counter**: Tracks correct puzzle solutions from page load
- **Wrong answers counter**: Tracks incorrect attempts from page load
- **Persistent storage**: Counters persist for entire browser session
- **Real-time updates**: Score display updates immediately after validation
- **Location**: Score tracking logic in `NumberWallCore`, UI updates in `NumberWall`

### Score Display
- **Position**: Right side of game interface in styled container
- **Labels**: German labels "Richtig:" and "Falsch:"
- **Styling**: Consistent with game's visual theme using bordered containers
- **Auto-update**: Automatically refreshes after each answer submission

### Score Testing
- **Initialization testing**: Verifies counters start at zero
- **Increment testing**: Confirms correct counter updates for right/wrong answers
- **Independence testing**: Ensures counters track separately without interference
- **Persistence testing**: Validates score maintenance across multiple game rounds

## German Localization

The application provides a complete German language experience:

### Static Text Translation
- **Page title**: "Pyramiden-Puzzle-Herausforderung"
- **Language attribute**: `lang="de"` for proper browser handling
- **Score labels**: "Richtig:" (Right) and "Falsch:" (Wrong)
- **Accessibility**: Proper German language metadata for screen readers

### Dynamic Validation Messages
- **Correct answer synonyms**: Random selection from CORRECT_MESSAGES constant (19 German positive phrases)
- **Incorrect answer synonyms**: Random selection from INCORRECT_MESSAGES constant (16 German negative phrases)
- **Random selection**: Different message displayed each time for variety
- **Integration**: Seamlessly integrated with existing validation flow using LOCALIZATION_CONSTANTS

### Localization Methods
- **`getRandomCorrectMessage()`**: Returns random German positive feedback
- **`getRandomIncorrectMessage()`**: Returns random German negative feedback
- **Message variety**: 19 correct and 16 incorrect synonyms for engaging feedback
- **Testing**: Comprehensive validation of message selection and variety

### Localization Testing
- **Message validity**: Verifies all returned messages are from defined synonym lists
- **Randomness testing**: Confirms variety in message selection over multiple calls
- **Integration testing**: Ensures localization doesn't break core game functionality
- **Backwards compatibility**: Maintains all existing game logic while adding German features

## Animation System

The game features an exciting animated feedback system that displays messages with dynamic visual effects.

### Animation Features
- **Animated feedback messages**: Feedback messages appear with randomly selected animations instead of static text
- **Correct answer animations**: 5 different celebration animations including bounce, zoom, sparkle, glow, and flip effects
- **Incorrect answer animations**: 4 different gentle correction animations including shake, wobble, slide, and pulse effects
- **Random selection**: Different animation chosen each time for variety and engagement
- **CSS-powered**: Pure CSS animations with no JavaScript animation frameworks required

### Animation Classes
- **Correct message animations**: CORRECT_ANIMATIONS constant (5 celebration animation classes)
- **Incorrect message animations**: INCORRECT_ANIMATIONS constant (4 gentle correction animation classes)
- **Advanced effects**: Includes transforms, scaling, rotation, color transitions, and text-shadow effects
- **Performance optimized**: Uses CSS transforms and animations for smooth 60fps performance using ANIMATION_CONSTANTS

### Animation Methods
- **`getRandomCorrectAnimation()`**: Returns random CSS class for positive feedback animations
- **`getRandomIncorrectAnimation()`**: Returns random CSS class for gentle correction animations
- **Animation duration**: 1-1.5 seconds with smooth easing for professional feel
- **Auto-cleanup**: Animation classes automatically cleared when starting new games

### Animation Testing
- **Class validity**: Verifies all returned animation classes are from defined lists
- **Randomness testing**: Confirms variety in animation selection over multiple calls
- **Integration testing**: Ensures animations don't break core game functionality
- **Performance testing**: Validates smooth animation performance in browser environment

## Sound Effects System

The game features programmatically generated sound effects using the Web Audio API for immersive audio feedback.

### Sound Features
- **Correct answer sound**: Harmonized chime using NOTES constants (C5, E5, G5, C6) with configurable timing
- **Incorrect answer sound**: Gentle descending wobble using NOTES constants (C4 → G3 → F3) with EFFECTS parameters
- **New game sound**: Rising sweep tone using A4 frequency with NEW_GAME_DURATION timing
- **User control**: Sound toggle using SOUND_ICONS constants (🔊/🔇) in score area
- **Zero file size impact**: All sounds generated algorithmically using AUDIO_CONSTANTS

### Audio Architecture
- **SoundManager class**: Encapsulates all audio functionality with clean API
- **Web Audio API integration**: Uses AudioContext, OscillatorNode, and GainNode for precise control
- **ADSR envelope**: Attack-Decay-Sustain-Release envelope shaping for natural sound quality
- **Error handling**: Graceful fallback when Web Audio API is unavailable
- **Mobile compatibility**: Handles audio context suspension with automatic resumption
- **Browser autoplay policy compliance**: Respects browser security restrictions requiring user interaction before audio playback

### Sound Methods
- **`playCorrectSound()`**: Plays harmonized celebration chime
- **`playIncorrectSound()`**: Plays gentle correction buzz
- **`playNewGameSound()`**: Plays transition sweep tone
- **`setSoundEnabled(enabled)`**: Toggles sound on/off
- **`isSoundEnabled()`**: Returns current sound state

### Integration Points
- **Validation feedback**: Sounds play immediately after answer validation in `checkAnswers()` method
- **Game transitions**: New game sound plays before puzzle generation (after initial user interaction)
- **User control**: Sound toggle integrated into score container UI
- **State persistence**: Sound preference maintained throughout browser session
- **Autoplay behavior**: No sound on initial page load due to browser autoplay policies; audio activates after first user interaction

### Sound Testing
- **Initialization testing**: Verifies sound manager starts with sound enabled
- **State management testing**: Confirms proper toggling of sound enabled/disabled states
- **Error resilience testing**: Validates graceful handling when Web Audio API unavailable
- **Method safety testing**: Ensures all sound methods handle disabled state correctly
- **Cross-platform testing**: Verifies functionality in Node.js environment for unit tests

## Layout System

The game implements a modern three-column layout according to `specs/008-layout.txt` specification:

### Layout Structure
```
+---------------+---------+
|               | Outcome |
|               +---------+
| Brick         | Score   |
| Container     | list    |
|               +---------+
|               | Config  |
|               | opts    |
+---------------+---------+
```

### Layout Components
- **Brick Container** (left): Contains the number wall puzzle, takes majority of horizontal space (50%+ with flex: 1)
- **Right Column** (280px fixed width): Three vertically stacked containers with 20px gaps
  - **Outcome Container** (top): Displays feedback messages with animations
  - **Score Container** (middle): Shows "Richtig:" and "Falsch:" counters
  - **Config Container** (bottom): Contains sound toggle control

### Layout Features
- **Flexbox-based**: Uses CSS flexbox for responsive and aligned layout
- **Perfect alignment**: Brick container spans from top of outcome box to bottom of config box
- **Centered content**: Number wall puzzle is centered both horizontally and vertically within brick container
- **Consistent styling**: All containers use matching rounded rectangle design with borders, shadows, and padding
- **Responsive gaps**: 30px gap between main columns, 20px gaps between right column items

### CSS Implementation
- **`.game-layout`**: Main flex container with horizontal layout
- **`.brick-container`**: Left container with `align-self: stretch` for height matching and `align-items: center` for content centering
- **`.right-column`**: Fixed-width column with vertical flex layout
- **Container styling**: Consistent background, borders, border-radius, padding, and box-shadow across all boxes

## Message Persistence System

The game features persistent feedback messaging that improves user experience:

### Message Behavior
- **Initial state**: Displays "Los geht's!" welcome message when game first loads
- **Feedback persistence**: Success/failure messages remain visible until next evaluation
- **Clean transitions**: Previous message is cleared only when new feedback is generated
- **Continuous context**: Users can see their most recent performance while working on new puzzles

### Implementation Details
- **Welcome message**: WELCOME_MESSAGE constant ("Los geht's!") appears in outcome container on page load
- **Persistence logic**: `startGame()` method preserves existing messages instead of clearing them
- **Message clearing**: Only occurs in `checkAnswers()` before displaying new feedback
- **Animation integration**: Message persistence works seamlessly with existing animation system using LOCALIZATION_CONSTANTS

### User Experience Benefits
- **Performance context**: Players maintain awareness of recent success/failure
- **Reduced cognitive load**: No need to remember previous performance between puzzles
- **Encouraging feedback**: Welcome message provides friendly start to game session
- **Smooth transitions**: Natural flow from feedback to new puzzle without empty states

## Validation Timing System

The game implements intelligent validation timing to prevent premature validation while users are typing:

### Timing Logic
- **Complete input detection**: Validates only when all hidden fields have values
- **Multi-digit number support**: Waits for complete multi-digit input when mathematically possible (up to 4 digits)
- **Custom range awareness**: `canFieldHaveMoreDigits` adapts to `currentMaximum` (20-1000)
- **Dynamic timeout**: Calculated based on remaining possible digits (1 second per additional digit, capped at 2.5 seconds)

### Multi-Digit Validation Enhancement
- **Previous limitation**: Only supported 2-digit validation timing (hardcoded 10-99 range)
- **New capability**: Supports 1-4 digit validation timing based on custom maximum (1-1000)
- **Optimization**: Calculates mathematically required values instead of brute-force testing
- **Dynamic timing**: Timeout adapts to number of remaining possible digits

### Implementation Details
- **Primary method**: `canFieldHaveMoreDigits(fieldName, currentLength)` in `game.js:305`
- **Helper methods**: `getMaxDigitsForField(fieldName)`, `getValidationTimeout(currentLength, maxDigits)`
- **Mathematical optimization**: Calculates exact required values using wall equations (A+B=D, B+C=E, D+E=F)
- **Performance**: O(1) calculation instead of O(n) brute force testing
- **Fallback**: Sampling method for cases where exact calculation isn't possible

## Constants Management System

The codebase uses a centralized constants system to eliminate magic numbers and improve maintainability:

### Architecture
- **File**: `constants.js` with dual Node.js/browser compatibility
- **Categories**: Game rules, audio parameters, animations, test configuration, localization, platform UI
- **Loading**: Browser loads via script tag, Node.js uses require()
- **Fallbacks**: All code includes fallback values for robustness

### Constant Categories

#### Game Constants (`GAME_CONSTANTS`)
- **Number ranges**: MIN_NUMBER (0), DEFAULT_MAXIMUM (20)
- **Random generation**: RANDOM_WEIGHT_TOTAL (81), ZERO_WEIGHT (1), NON_ZERO_WEIGHT (4)
- **Input limits**: MAX_INPUT_LENGTH (2), TWO_DIGIT_MIN (10), TWO_DIGIT_MAX (20, used as fallback when currentMaximum unavailable)
- **Security limits**: MAX_GENERATION_ATTEMPTS (100), MAX_FIELD_SELECTION_ATTEMPTS (100)
- **Timing**: FEEDBACK_DISPLAY_DURATION (2000ms), TWO_DIGIT_INPUT_TIMEOUT (2500ms)
- **Fallback values**: Safe defaults when generation fails `{a:1, b:1, c:1, d:2, e:2, f:4}`

#### Audio Constants (`AUDIO_CONSTANTS`)
- **Musical notes**: Frequency mappings (C4: 261.63Hz, A4: 440Hz, etc.)
- **Timing**: Sound durations and attack/decay envelopes
- **Volume levels**: Gain settings for different sound types
- **Effects**: Wobble parameters, frequency modulation settings

#### Animation Constants (`ANIMATION_CONSTANTS`)
- **Correct animations**: 5 celebration animation class names
- **Incorrect animations**: 4 gentle correction animation class names
- **Input feedback**: Flash animation class names

#### Test Constants (`TEST_CONSTANTS`)
- **Sample sizes**: Statistical testing parameters (2100 samples)
- **Iterations**: Performance test loop counts
- **Thresholds**: Statistical significance levels

#### Field Constants (`FIELD_CONSTANTS`)
- **Game structure**: Field names array ['a', 'b', 'c', 'd', 'e', 'f']
- **Forbidden combinations**: Sets of fields never hidden together
- **Fallback selection**: Safe default field combination

#### Localization Constants (`LOCALIZATION_CONSTANTS`)
- **Message arrays**: German feedback messages (19 correct, 16 incorrect)
- **UI text**: Welcome message, tooltips, labels

#### Platform Constants (`PLATFORM_CONSTANTS`)
- **Icons**: Sound on/off emoji characters
- **CSS classes**: Styling class names for consistent UI

### Implementation Benefits
- **Maintainability**: Single location for all configuration values
- **Consistency**: Eliminates duplicate magic numbers across files
- **Testability**: Centralized test configuration parameters
- **Flexibility**: Easy to adjust game balance and behavior
- **Documentation**: Self-documenting constant names and organization

### Usage Pattern
```javascript
// Robust pattern with fallbacks
const constants = GAME_CONSTANTS || { MIN_NUMBER: 0, DEFAULT_MAXIMUM: 20 };
if (value < constants.MIN_NUMBER || value > constants.DEFAULT_MAXIMUM) {
    // Handle invalid range
}
```

### Compatibility
- **Browser**: Constants loaded globally via `<script src="constants.js">`
- **Node.js**: Constants imported via `require('./constants.js')`
- **Testing**: All tests use constants instead of magic numbers
- **Backward compatibility**: Fallback values ensure code works if constants fail to load

## Game Requirements

- Numbers constrained to configurable range: MIN_NUMBER (0) to currentMaximum (default 20, customizable up to 1000)
- Exactly HIDDEN_FIELDS_COUNT (3) fields hidden per puzzle
- FEEDBACK_DISPLAY_DURATION (2000ms) feedback display before auto-generating new puzzle
- Input validation accepts only positive integers with MAX_INPUT_LENGTH (4) character limit to support up to 4-digit numbers
- Intelligent validation timing: waits for complete input when multi-digit numbers are mathematically possible (up to 4 digits)
- Custom maximum support: validation timing adapts to user-set maximum values
- No server dependencies - runs entirely in browser
- All configuration managed through constants.js for maintainability
- Streamlined test suite: 8 essential tests covering core functionality, multi-digit timing, and regression protection
- Before committing, always check if CLAUDE.md needs an update and include this update in the commit if needed.
