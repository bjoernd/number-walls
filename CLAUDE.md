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
- `NumberWallCore` (in `game-core.js`): Contains pure game logic for number generation, validation, and mathematical rules

### Mathematical Rules

The number wall follows these equations:
- A + B = D
- B + C = E
- D + E = F

All numbers are constrained to 0-20 range. The game randomly selects 3 positions to hide and validates user answers.

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
- `game.test.js` - Comprehensive unit tests (9 test cases)
- `specs/000-idea.txt` - Original requirements and design decisions

## Testing Strategy

Tests are written for the core logic layer (`game-core.js`) to ensure mathematical correctness, input validation, and edge case handling. The browser layer (`game.js`) relies on manual testing since it's primarily DOM manipulation.

### Testing Requirements

- **MUST write tests for all new functionality** - Every new feature, method, or significant logic change requires corresponding unit tests
- **MUST verify all tests pass before considering any task complete** - Run `npm test` and ensure all tests pass before marking work as done
- **Tests should cover edge cases and error conditions** - Not just happy path scenarios
- **Core logic changes require test updates** - Any modifications to `game-core.js` must include test verification

## Game Requirements

- Numbers constrained to 0-20 range
- Exactly 3 fields hidden per puzzle
- 5-second feedback display before auto-generating new puzzle
- Input validation accepts only positive integers
- No server dependencies - runs entirely in browser