# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pyramiden-Puzzle-Challenge is a browser-based educational math game in German that teaches addition through "number walls" - pyramid structures where each brick's value equals the sum of the two bricks below it. The game generates random puzzles where players fill in missing numbers and tracks their performance with persistent scoring.

## Architecture

The codebase follows a clean separation of concerns:

- **Browser UI Layer**: `index.html` (structure), `style.css` (styling), `game.js` (DOM interaction)
- **Core Logic Layer**: `game-core.js` (pure game logic, DOM-independent)
- **Testing Layer**: `game.test.js` (unit tests for core logic)

### Key Classes

- `NumberWall` (in `game.js`): Handles DOM manipulation, user interaction, game flow, and score display updates
- `NumberWallCore` (in `game-core.js`): Contains pure game logic for weighted number generation, validation, mathematical rules, score tracking, and German message generation

### Mathematical Rules

The number wall follows these equations:
- A + B = D
- B + C = E
- D + E = F

All numbers are constrained to 0-20 range with weighted generation (0 appears less frequently than 1-20). The game randomly selects 3 positions to hide and validates user answers.

## Development Commands

### Testing
```bash
npm test                    # Run all unit tests
node game.test.js          # Run tests directly
```

### Code Quality
```bash
node -c game-core.js && node -c game.js    # Validate JavaScript syntax
```

**IMPORTANT**: Always run syntax validation before committing code changes.

### Running the Game
Open `index.html` in a web browser - no build step required.

## File Structure

- `index.html` - Main game interface
- `style.css` - Game styling and layout
- `game.js` - Browser-specific game implementation with DOM handling
- `game-core.js` - Pure game logic for testing and potential reuse
- `game.test.js` - Comprehensive unit tests (30 test cases including security, weighted random, high score, and German localization tests)
- `specs/000-idea.txt` - Original requirements and design decisions

## Testing Strategy

Tests are written for the core logic layer (`game-core.js`) to ensure mathematical correctness, input validation, and edge case handling. The browser layer (`game.js`) relies on manual testing since it's primarily DOM manipulation.

### Testing Requirements

- **MUST write tests for all new functionality** - Every new feature, method, or significant logic change requires corresponding unit tests
- **MUST verify all tests pass before considering any task complete** - Run `npm test` and ensure all tests pass before marking work as done
- **Tests should cover edge cases and error conditions** - Not just happy path scenarios
- **Core logic changes require test updates** - Any modifications to `game-core.js` must include test verification

## Security Features

The application implements multiple layers of security protection:

### Content Security Policy (CSP)
- **Location**: `index.html` meta tag
- **Policy**: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';`
- **Purpose**: Prevents XSS attacks, data exfiltration, and unauthorized resource loading
- **Browser-level enforcement** that complements JavaScript validation

### Input Validation
- **Regex filtering**: `/[^0-9]/g` prevents non-numeric input
- **Length protection**: Explicit 2-character limit in JavaScript (defense-in-depth beyond HTML maxlength)
- **Location**: `game.js` setupEventListeners method

### Recursion Protection
- **Attempt limit**: 100 iterations maximum in `generateWall()` method
- **Fallback values**: Safe default numbers `{a:1, b:1, c:1, d:2, e:2, f:4}` if limit exceeded
- **Purpose**: Prevents potential stack overflow in edge cases
- **Location**: `game-core.js` generateWall method

### Security Testing
- **Comprehensive test coverage** for all security features
- **Edge case validation** including recursion limits and fallback scenarios
- **Mathematical integrity verification** even in security fallback modes

## Random Number Generation

The game uses weighted random number generation to improve gameplay experience:

### Weighted Distribution
- **Number 0**: ~2.4% probability (1 out of 41 chances)
- **Numbers 1-20**: ~4.9% probability each (2 out of 41 chances each)
- **Purpose**: Reduces frequency of 0 to create more engaging mathematical challenges
- **Implementation**: `generateRandomNumber()` method in `game-core.js`

### Statistical Testing
- **Large sample validation** (2,100 samples) verifies weighted distribution
- **Statistical significance testing** ensures 0 appears significantly less than other numbers
- **Range validation** confirms all numbers remain within 0-20 bounds

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
- **Correct answer synonyms**: Random selection from "Gut", "Super", "Toll", "Prima", "Klasse", "Genau", "Spitze", "Wunderbar", "Fantastisch", "Ausgezeichnet", "Cool", "Stark", "Mega", "Stimmt genau", "Bingo", "Das ist es", "Bravo", "Juhu", "Yay"
- **Incorrect answer synonyms**: Random selection from "Nee", "Achwas", "Stimmt nicht", "Nicht ganz", "Schau genauer hin", "Auweia", "Huch", "Oje", "Nö", "Schade", "Quatsch", "Nix da", "Oha", "Ups", "So nicht", "Anders"
- **Random selection**: Different message displayed each time for variety
- **Integration**: Seamlessly integrated with existing validation flow

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
- **Correct message animations**: `message-bounce-in`, `message-zoom-celebration`, `message-slide-sparkle`, `message-pulse-glow`, `message-flip-tada`
- **Incorrect message animations**: `message-shake-fade`, `message-wobble-in`, `message-slide-gentle`, `message-pulse-soft`
- **Advanced effects**: Includes transforms, scaling, rotation, color transitions, and text-shadow effects
- **Performance optimized**: Uses CSS transforms and animations for smooth 60fps performance

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

## Game Requirements

- Numbers constrained to 0-20 range
- Exactly 3 fields hidden per puzzle
- 2-second feedback display before auto-generating new puzzle
- Input validation accepts only positive integers
- No server dependencies - runs entirely in browser
- Before comitting, always check if CLAUDE.md needs an update and include this update in the commit if needed.
