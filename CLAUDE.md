# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pyramid Puzzle Challenge is a browser-based educational math game that teaches addition through "number walls" - pyramid structures where each brick's value equals the sum of the two bricks below it. The game generates random puzzles where players fill in missing numbers.

## Architecture

The codebase follows a clean separation of concerns:

- **Browser UI Layer**: `index.html` (structure), `style.css` (styling), `game.js` (DOM interaction)
- **Core Logic Layer**: `game-core.js` (pure game logic, DOM-independent)
- **Testing Layer**: `game.test.js` (unit tests for core logic)

### Key Classes

- `NumberWall` (in `game.js`): Handles DOM manipulation, user interaction, and game flow
- `NumberWallCore` (in `game-core.js`): Contains pure game logic for weighted number generation, validation, and mathematical rules

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

### Running the Game
Open `index.html` in a web browser - no build step required.

## File Structure

- `index.html` - Main game interface
- `style.css` - Game styling and layout
- `game.js` - Browser-specific game implementation with DOM handling
- `game-core.js` - Pure game logic for testing and potential reuse
- `game.test.js` - Comprehensive unit tests (13 test cases including security and weighted random tests)
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

## Game Requirements

- Numbers constrained to 0-20 range
- Exactly 3 fields hidden per puzzle
- 5-second feedback display before auto-generating new puzzle
- Input validation accepts only positive integers
- No server dependencies - runs entirely in browser
- Before comitting, always check if CLAUDE.md needs an update and include this update in the commit if needed.