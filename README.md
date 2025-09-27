# Pyramiden-Puzzle-Challenge

A browser-based math game that teaches addition through number wall puzzles.

![Game Screenshot](number-wall.png)

## How to Play

1. Open `index.html` in your web browser
2. You'll see a pyramid with 6 numbered positions arranged in 3 rows
3. Three numbers are hidden - fill them in by typing in the input boxes
4. Each brick equals the sum of the two bricks below it
5. Press Enter or click away from an input to check your answer
6. Get immediate feedback in German with animated messages and sound effects
7. Use the speaker button (🔊) to toggle sound on/off
8. A new puzzle generates automatically after 2 seconds

## Game Rules

- Numbers range from 0 to 20
- Each level of the pyramid follows addition: bottom numbers add up to the level above
- Three positions are randomly hidden in each puzzle
- Only positive whole numbers are accepted

## Scoring

Your performance is tracked during your session:
- **Richtig**: Count of correct answers
- **Falsch**: Count of incorrect answers

Scores reset when you reload the page.

## Features

- **Interactive audio feedback**: Programmatically generated sound effects for correct answers, incorrect answers, and new puzzles
- **German language support**: All feedback messages in German with varied vocabulary
- **Animated visual feedback**: Dynamic animations synchronized with audio for enhanced engagement
- **Sound control**: Toggle audio on/off with the speaker button
- **Persistent scoring**: Track your performance throughout your session
- **Mobile-friendly**: Responsive design that works on phones and tablets

## Requirements

Any modern web browser with Web Audio API support - no installation needed.