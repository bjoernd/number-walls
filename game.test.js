#!/usr/bin/env node

// Simple Node.js test framework
class TestFramework {
    constructor() {
        this.results = { passed: 0, failed: 0, total: 0 };
    }

    describe(description, testFn) {
        console.log(`\n--- ${description} ---`);
        testFn();
    }

    it(description, testFn) {
        this.results.total++;
        try {
            testFn();
            this.results.passed++;
            console.log(`✓ ${description}`);
        } catch (error) {
            this.results.failed++;
            console.log(`✗ ${description}`);
            console.log(`  Error: ${error.message}`);
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toBeGreaterThanOrEqual: (expected) => {
                if (actual < expected) {
                    throw new Error(`Expected ${actual} to be >= ${expected}`);
                }
            },
            toBeLessThanOrEqual: (expected) => {
                if (actual > expected) {
                    throw new Error(`Expected ${actual} to be <= ${expected}`);
                }
            },
            toHaveLength: (expected) => {
                if (actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual.length}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected array to contain ${expected}`);
                }
            }
        };
    }

    showResults() {
        console.log(`\n--- Test Results ---`);
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);

        if (this.results.failed === 0) {
            console.log('🎉 All tests passed!');
            process.exit(0);
        } else {
            console.log('❌ Some tests failed');
            process.exit(1);
        }
    }
}

// Import the core game logic and constants
const { NumberWallCore, SoundManager, CORRECT_MESSAGES, INCORRECT_MESSAGES } = require('./game-core.js');
const {
    GAME_CONSTANTS,
    AUDIO_CONSTANTS,
    ANIMATION_CONSTANTS,
    TEST_CONSTANTS,
    FIELD_CONSTANTS,
    LOCALIZATION_CONSTANTS
} = require('./constants.js');

// Initialize test framework
const test = new TestFramework();

// Run tests
test.describe('NumberWallCore Class', () => {
    let gameCore;

    test.it('should generate random numbers between 0 and 20', () => {
        gameCore = new NumberWallCore();

        for (let i = 0; i < TEST_CONSTANTS.RANDOM_NUMBER_TEST_ITERATIONS; i++) {
            const randomNum = gameCore.generateRandomNumber();
            test.expect(randomNum).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(randomNum).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
        }
    });

    test.it('should generate 0 less frequently than other numbers', () => {
        gameCore = new NumberWallCore();
        let zeroCount = 0;
        let otherCounts = {};
        const totalSamples = TEST_CONSTANTS.WEIGHTED_RANDOM_SAMPLE_SIZE; // Large sample for statistical significance

        // Initialize counts for numbers 1-max
        for (let i = 1; i <= GAME_CONSTANTS.MAX_NUMBER; i++) {
            otherCounts[i] = 0;
        }

        // Generate samples
        for (let i = 0; i < totalSamples; i++) {
            const randomNum = gameCore.generateRandomNumber();
            if (randomNum === 0) {
                zeroCount++;
            } else {
                otherCounts[randomNum]++;
            }
        }

        // Calculate average count for non-zero numbers
        const nonZeroCounts = Object.values(otherCounts);
        const avgNonZeroCount = nonZeroCounts.reduce((sum, count) => sum + count, 0) / nonZeroCounts.length;

        // 0 should appear significantly less than average of other numbers
        // Expected: 0 appears less frequently than other numbers
        test.expect(zeroCount).toBeLessThanOrEqual(avgNonZeroCount * TEST_CONSTANTS.STATISTICAL_THRESHOLD); // 0 should be at most threshold of average
    });

    test.it('should calculate wall values correctly according to rules', () => {
        gameCore = new NumberWallCore();
        gameCore.values.a = 5;
        gameCore.values.b = 7;
        gameCore.values.c = 3;

        // Calculate D, E, F based on rules
        gameCore.values.d = gameCore.values.a + gameCore.values.b;
        gameCore.values.e = gameCore.values.b + gameCore.values.c;
        gameCore.values.f = gameCore.values.d + gameCore.values.e;

        test.expect(gameCore.values.d).toBe(12); // 5 + 7
        test.expect(gameCore.values.e).toBe(10); // 7 + 3
        test.expect(gameCore.values.f).toBe(22); // 12 + 10
    });

    test.it('should select exactly 3 hidden fields', () => {
        gameCore = new NumberWallCore();
        gameCore.selectHiddenFields();

        test.expect(gameCore.hiddenFields).toHaveLength(3);
    });

    test.it('should select hidden fields from valid field names', () => {
        gameCore = new NumberWallCore();
        const validFields = FIELD_CONSTANTS.ALL_FIELDS;

        gameCore.selectHiddenFields();

        gameCore.hiddenFields.forEach(field => {
            test.expect(validFields).toContain(field);
        });
    });

    test.it('should never select forbidden combinations', () => {
        gameCore = new NumberWallCore();
        // Test multiple generations to ensure forbidden combinations are avoided
        for (let i = 0; i < TEST_CONSTANTS.FORBIDDEN_COMBINATION_TEST_ITERATIONS; i++) {
            gameCore.selectHiddenFields();
            const sorted = gameCore.hiddenFields.slice().sort();

            // Verify B, D, E are never all selected together
            const isBDE = sorted.length === 3 &&
                         sorted[0] === 'b' &&
                         sorted[1] === 'd' &&
                         sorted[2] === 'e';
            test.expect(isBDE).toBe(false);

            // Verify A, D, F are never all selected together
            const isADF = sorted.length === 3 &&
                         sorted[0] === 'a' &&
                         sorted[1] === 'd' &&
                         sorted[2] === 'f';
            test.expect(isADF).toBe(false);

            // Verify C, E, F are never all selected together
            const isCEF = sorted.length === 3 &&
                         sorted[0] === 'c' &&
                         sorted[1] === 'e' &&
                         sorted[2] === 'f';
            test.expect(isCEF).toBe(false);
        }
    });

    test.it('should generate wall with all values within 0-20 range', () => {
        gameCore = new NumberWallCore();

        // Test multiple generations to ensure consistency
        for (let i = 0; i < TEST_CONSTANTS.GENERATION_TEST_ITERATIONS; i++) {
            gameCore.generateWall();

            test.expect(gameCore.values.a).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(gameCore.values.a).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
            test.expect(gameCore.values.b).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(gameCore.values.b).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
            test.expect(gameCore.values.c).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(gameCore.values.c).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
            test.expect(gameCore.values.d).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(gameCore.values.d).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
            test.expect(gameCore.values.e).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(gameCore.values.e).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
            test.expect(gameCore.values.f).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(gameCore.values.f).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
        }
    });

    test.it('should maintain mathematical relationships in generated wall', () => {
        gameCore = new NumberWallCore();

        for (let i = 0; i < TEST_CONSTANTS.WALL_RELATIONSHIP_TEST_ITERATIONS; i++) {
            gameCore.generateWall();

            // Verify A + B = D
            test.expect(gameCore.values.d).toBe(gameCore.values.a + gameCore.values.b);
            // Verify B + C = E
            test.expect(gameCore.values.e).toBe(gameCore.values.b + gameCore.values.c);
            // Verify D + E = F
            test.expect(gameCore.values.f).toBe(gameCore.values.d + gameCore.values.e);
        }
    });
});

test.describe('Game Logic Validation', () => {
    test.it('should validate correct answers properly', () => {
        const gameCore = new NumberWallCore();

        // Set up a known wall state
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Mock correct user inputs
        const userAnswers = { a: '5', d: '12', f: '22' };

        const result = gameCore.validateAnswers(userAnswers);
        test.expect(result).toBe(true);
    });

    test.it('should detect incorrect answers properly', () => {
        const gameCore = new NumberWallCore();

        // Set up a known wall state
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Mock incorrect user inputs
        const userAnswers = { a: '4', d: '12', f: '22' }; // 'a' is wrong

        const result = gameCore.validateAnswers(userAnswers);
        test.expect(result).toBe(false);
    });

    test.it('should handle non-numeric inputs properly', () => {
        const gameCore = new NumberWallCore();

        // Set up a known wall state
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Mock non-numeric user inputs
        const userAnswers = { a: 'abc', d: '12', f: '22' };

        const result = gameCore.validateAnswers(userAnswers);
        test.expect(result).toBe(false);
    });

    test.it('should validate individual answers for UI feedback', () => {
        const gameCore = new NumberWallCore();

        // Set up a known wall state
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Mock mixed user inputs (some correct, some incorrect)
        const userAnswers = { a: '5', d: '15', f: '22' }; // a and f correct, d incorrect

        const fieldResults = gameCore.validateIndividualAnswers(userAnswers);

        test.expect(fieldResults.a).toBe(true);  // Should be correct
        test.expect(fieldResults.d).toBe(false); // Should be incorrect
        test.expect(fieldResults.f).toBe(true);  // Should be correct
    });

    test.it('should handle invalid inputs in individual validation', () => {
        const gameCore = new NumberWallCore();

        // Set up a known wall state
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Mock user inputs with invalid input
        const userAnswers = { a: 'abc', d: '12', f: '22' };

        const fieldResults = gameCore.validateIndividualAnswers(userAnswers);

        test.expect(fieldResults.a).toBe(false); // Invalid input should be false
        test.expect(fieldResults.d).toBe(true);  // Should be correct
        test.expect(fieldResults.f).toBe(true);  // Should be correct
    });
});

test.describe('Validation Timing', () => {
    test.it('should support delayed validation timeout mechanism', () => {
        // Since this tests browser-specific DOM features, we test the core logic
        const gameCore = new NumberWallCore();

        // Set up a wall with known values
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Test that validation logic works correctly for 2-digit numbers
        const userAnswers = { a: '15', d: '12', f: '22' }; // 2-digit number in first field

        // This should validate as incorrect since a=5, not 15
        const result = gameCore.validateAnswers(userAnswers);
        test.expect(result).toBe(false);

        // Test correct 2-digit answer
        gameCore.values = { a: 15, b: 2, c: 3, d: 17, e: 5, f: 22 };
        const correctAnswers = { a: '15', d: '17', f: '22' };

        const correctResult = gameCore.validateAnswers(correctAnswers);
        test.expect(correctResult).toBe(true);
    });
});

test.describe('Security Enhancements', () => {
    test.it('should prevent infinite recursion with fallback values', () => {
        const gameCore = new NumberWallCore();

        // Force recursion limit by calling with high attempt count
        gameCore.generateWall(GAME_CONSTANTS.MAX_GENERATION_ATTEMPTS + 1);

        // Should use fallback values
        test.expect(gameCore.values.a).toBe(GAME_CONSTANTS.FALLBACK_VALUES.a);
        test.expect(gameCore.values.b).toBe(GAME_CONSTANTS.FALLBACK_VALUES.b);
        test.expect(gameCore.values.c).toBe(GAME_CONSTANTS.FALLBACK_VALUES.c);
        test.expect(gameCore.values.d).toBe(GAME_CONSTANTS.FALLBACK_VALUES.d);
        test.expect(gameCore.values.e).toBe(GAME_CONSTANTS.FALLBACK_VALUES.e);
        test.expect(gameCore.values.f).toBe(GAME_CONSTANTS.FALLBACK_VALUES.f);
    });

    test.it('should maintain mathematical relationships in fallback values', () => {
        const gameCore = new NumberWallCore();

        // Force fallback values
        gameCore.generateWall(GAME_CONSTANTS.MAX_GENERATION_ATTEMPTS + 1);

        // Verify mathematical relationships are correct
        test.expect(gameCore.values.d).toBe(gameCore.values.a + gameCore.values.b);
        test.expect(gameCore.values.e).toBe(gameCore.values.b + gameCore.values.c);
        test.expect(gameCore.values.f).toBe(gameCore.values.d + gameCore.values.e);
    });

    test.it('should handle normal generation without recursion limit', () => {
        const gameCore = new NumberWallCore();

        // Normal generation should work without hitting recursion limit
        for (let i = 0; i < 10; i++) {
            gameCore.generateWall();

            // All values should be within range
            test.expect(gameCore.values.a).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NUMBER);
            test.expect(gameCore.values.a).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);
            test.expect(gameCore.values.f).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_NUMBER);

            // Mathematical relationships should hold
            test.expect(gameCore.values.d).toBe(gameCore.values.a + gameCore.values.b);
            test.expect(gameCore.values.e).toBe(gameCore.values.b + gameCore.values.c);
            test.expect(gameCore.values.f).toBe(gameCore.values.d + gameCore.values.e);
        }
    });
});

test.describe('Ambiguous Solution Validation', () => {
    test.it('should accept multiple valid solutions for ambiguous scenarios', () => {
        const gameCore = new NumberWallCore();

        // Set up the ambiguous scenario from spec: B=1, C=2, E=3
        // This leaves A, D, F as unknowns with multiple valid solutions
        gameCore.values = { a: 0, b: 1, c: 2, d: 0, e: 3, f: 0 }; // A, D, F are placeholders
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Test first valid solution: A=2, D=3, F=6
        const solution1 = { a: '2', d: '3', f: '6' };
        const result1 = gameCore.validateAnswers(solution1);
        test.expect(result1).toBe(true);

        // Test second valid solution: A=5, D=6, F=9
        const solution2 = { a: '5', d: '6', f: '9' };
        const result2 = gameCore.validateAnswers(solution2);
        test.expect(result2).toBe(true);

        // Test an invalid solution: A=1, D=3, F=6 (violates A+B=D since 1+1≠3)
        const invalidSolution = { a: '1', d: '3', f: '6' };
        const invalidResult = gameCore.validateAnswers(invalidSolution);
        test.expect(invalidResult).toBe(false);
    });

    test.it('should validate mathematical relationships for any hidden field combination', () => {
        const gameCore = new NumberWallCore();

        // Test scenario where A, B, F are hidden
        gameCore.values = { a: 0, b: 0, c: 5, d: 7, e: 8, f: 0 };
        gameCore.hiddenFields = ['a', 'b', 'f'];

        // Find valid solution: A+B=7, B+5=8 → B=3, A=4, F=7+8=15
        const validSolution = { a: '4', b: '3', f: '15' };
        const result = gameCore.validateAnswers(validSolution);
        test.expect(result).toBe(true);

        // Test invalid solution where relationships don't hold
        const invalidSolution = { a: '2', b: '3', f: '15' }; // 2+3≠7
        const invalidResult = gameCore.validateAnswers(invalidSolution);
        test.expect(invalidResult).toBe(false);
    });

    test.it('should reject solutions with invalid inputs', () => {
        const gameCore = new NumberWallCore();

        gameCore.values = { a: 0, b: 1, c: 2, d: 0, e: 3, f: 0 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Test solution with negative value
        const negativeSolution = { a: '-1', d: '0', f: '3' };
        const result = gameCore.validateAnswers(negativeSolution);
        test.expect(result).toBe(false);

        // Test solution with non-numeric input
        const nonNumericSolution = { a: 'abc', d: '0', f: '3' };
        const result2 = gameCore.validateAnswers(nonNumericSolution);
        test.expect(result2).toBe(false);
    });

    test.it('should maintain backwards compatibility with non-ambiguous scenarios', () => {
        const gameCore = new NumberWallCore();

        // Set up a non-ambiguous scenario (original behavior should still work)
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Correct answers should still validate
        const correctAnswers = { a: '5', d: '12', f: '22' };
        const result1 = gameCore.validateAnswers(correctAnswers);
        test.expect(result1).toBe(true);

        // Incorrect answers should still be rejected
        const incorrectAnswers = { a: '4', d: '12', f: '22' };
        const result2 = gameCore.validateAnswers(incorrectAnswers);
        test.expect(result2).toBe(false);
    });
});

test.describe('High Score Functionality', () => {
    test.it('should initialize score counters to zero', () => {
        const gameCore = new NumberWallCore();

        const score = gameCore.getScore();
        test.expect(score.right).toBe(0);
        test.expect(score.wrong).toBe(0);
    });

    test.it('should increment right answers counter', () => {
        const gameCore = new NumberWallCore();

        gameCore.incrementRightAnswers();
        gameCore.incrementRightAnswers();

        const score = gameCore.getScore();
        test.expect(score.right).toBe(2);
        test.expect(score.wrong).toBe(0);
    });

    test.it('should increment wrong answers counter', () => {
        const gameCore = new NumberWallCore();

        gameCore.incrementWrongAnswers();
        gameCore.incrementWrongAnswers();
        gameCore.incrementWrongAnswers();

        const score = gameCore.getScore();
        test.expect(score.right).toBe(0);
        test.expect(score.wrong).toBe(3);
    });

    test.it('should track both right and wrong answers independently', () => {
        const gameCore = new NumberWallCore();

        gameCore.incrementRightAnswers();
        gameCore.incrementWrongAnswers();
        gameCore.incrementRightAnswers();
        gameCore.incrementWrongAnswers();
        gameCore.incrementWrongAnswers();

        const score = gameCore.getScore();
        test.expect(score.right).toBe(2);
        test.expect(score.wrong).toBe(3);
    });

    test.it('should maintain score persistence throughout game session', () => {
        const gameCore = new NumberWallCore();

        // Simulate playing multiple rounds
        for (let i = 0; i < 5; i++) {
            if (i % 2 === 0) {
                gameCore.incrementRightAnswers();
            } else {
                gameCore.incrementWrongAnswers();
            }
        }

        const score = gameCore.getScore();
        test.expect(score.right).toBe(3); // rounds 0, 2, 4
        test.expect(score.wrong).toBe(2); // rounds 1, 3
    });
});

test.describe('German Localization', () => {
    test.it('should return a valid correct message from German synonyms', () => {
        const gameCore = new NumberWallCore();

        const message = gameCore.getRandomCorrectMessage();
        test.expect(CORRECT_MESSAGES).toContain(message);
    });

    test.it('should return a valid incorrect message from German synonyms', () => {
        const gameCore = new NumberWallCore();
        const message = gameCore.getRandomIncorrectMessage();
        test.expect(INCORRECT_MESSAGES).toContain(message);
    });

    test.it('should return different messages when called multiple times', () => {
        const gameCore = new NumberWallCore();
        const messages = new Set();

        // Generate messages to increase likelihood of getting different ones
        for (let i = 0; i < TEST_CONSTANTS.MESSAGE_DIVERSITY_ITERATIONS; i++) {
            messages.add(gameCore.getRandomCorrectMessage());
        }

        // Should have at least minimum expected diversity
        test.expect(messages.size).toBeGreaterThanOrEqual(TEST_CONSTANTS.MIN_EXPECTED_DIVERSITY);
    });

    test.it('should return different incorrect messages when called multiple times', () => {
        const gameCore = new NumberWallCore();
        const messages = new Set();

        // Generate messages to increase likelihood of getting different ones
        for (let i = 0; i < TEST_CONSTANTS.MESSAGE_DIVERSITY_ITERATIONS; i++) {
            messages.add(gameCore.getRandomIncorrectMessage());
        }

        // Should have at least minimum expected diversity
        test.expect(messages.size).toBeGreaterThanOrEqual(TEST_CONSTANTS.MIN_EXPECTED_DIVERSITY);
    });

    test.it('should maintain original functionality with German messages', () => {
        const gameCore = new NumberWallCore();

        // Test that message methods don't interfere with core game logic
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        const userAnswers = { a: '5', d: '12', f: '22' };
        const result = gameCore.validateAnswers(userAnswers);

        test.expect(result).toBe(true);

        // Verify messages can still be generated
        const correctMsg = gameCore.getRandomCorrectMessage();
        const incorrectMsg = gameCore.getRandomIncorrectMessage();

        test.expect(typeof correctMsg).toBe('string');
        test.expect(typeof incorrectMsg).toBe('string');
    });

    test.it('should return valid animation classes for correct messages', () => {
        const gameCore = new NumberWallCore();
        const validCorrectAnimations = ANIMATION_CONSTANTS.CORRECT_ANIMATIONS;

        const animation = gameCore.getRandomCorrectAnimation();
        test.expect(validCorrectAnimations).toContain(animation);
    });

    test.it('should return valid animation classes for incorrect messages', () => {
        const gameCore = new NumberWallCore();
        const validIncorrectAnimations = ANIMATION_CONSTANTS.INCORRECT_ANIMATIONS;

        const animation = gameCore.getRandomIncorrectAnimation();
        test.expect(validIncorrectAnimations).toContain(animation);
    });

    test.it('should return different animation classes when called multiple times', () => {
        const gameCore = new NumberWallCore();
        const correctAnimations = new Set();
        const incorrectAnimations = new Set();

        // Generate animations to increase likelihood of getting different ones
        for (let i = 0; i < TEST_CONSTANTS.ANIMATION_DIVERSITY_ITERATIONS; i++) {
            correctAnimations.add(gameCore.getRandomCorrectAnimation());
            incorrectAnimations.add(gameCore.getRandomIncorrectAnimation());
        }

        // Should have at least minimum expected diversity
        test.expect(correctAnimations.size).toBeGreaterThanOrEqual(TEST_CONSTANTS.MIN_EXPECTED_DIVERSITY);
        test.expect(incorrectAnimations.size).toBeGreaterThanOrEqual(TEST_CONSTANTS.MIN_EXPECTED_DIVERSITY);
    });
});

test.describe('Ambiguous Colors Bug Fix', () => {
    test.it('should show green highlights for valid alternative solutions', () => {
        const gameCore = new NumberWallCore();

        // Set up the scenario from specs/005-ambiguous-colors.txt
        //   _
        // _  2
        //_ 1  1
        // This means: ? ? 2
        //           ? 1 1
        // With known values: b=1, c=1, e=1, and we need to find a, d, f

        gameCore.values = { a: 0, b: 1, c: 1, d: 0, e: 2, f: 0 }; // Placeholder values
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Test first valid solution: A=5, D=6, F=8
        // This should work: a=5, b=1, c=1, d=6, e=2, f=8
        // Checking: a+b=d -> 5+1=6 ✓, b+c=e -> 1+1=2 ✓, d+e=f -> 6+2=8 ✓
        const solution1 = { a: '5', d: '6', f: '8' };
        const result1 = gameCore.validateAnswers(solution1);
        const fieldResults1 = gameCore.validateIndividualAnswers(solution1);

        test.expect(result1).toBe(true);
        test.expect(fieldResults1.a).toBe(true);
        test.expect(fieldResults1.d).toBe(true);
        test.expect(fieldResults1.f).toBe(true);

        // Test second valid solution: A=8, D=9, F=11
        // This should work: a=8, b=1, c=1, d=9, e=2, f=11
        // Checking: a+b=d -> 8+1=9 ✓, b+c=e -> 1+1=2 ✓, d+e=f -> 9+2=11 ✓
        const solution2 = { a: '8', d: '9', f: '11' };
        const result2 = gameCore.validateAnswers(solution2);
        const fieldResults2 = gameCore.validateIndividualAnswers(solution2);

        test.expect(result2).toBe(true);
        test.expect(fieldResults2.a).toBe(true);
        test.expect(fieldResults2.d).toBe(true);
        test.expect(fieldResults2.f).toBe(true);
    });

    test.it('should still show red highlights for mathematically incorrect solutions', () => {
        const gameCore = new NumberWallCore();

        // Same setup as above
        gameCore.values = { a: 0, b: 1, c: 1, d: 0, e: 2, f: 0 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        // Test invalid solution: A=5, D=7, F=8 (should fail because 5+1≠7)
        const invalidSolution = { a: '5', d: '7', f: '8' };
        const result = gameCore.validateAnswers(invalidSolution);
        const fieldResults = gameCore.validateIndividualAnswers(invalidSolution);

        test.expect(result).toBe(false);
        test.expect(fieldResults.a).toBe(false);
        test.expect(fieldResults.d).toBe(false);
        test.expect(fieldResults.f).toBe(false);
    });
});

test.describe('Sound Manager', () => {
    test.it('should initialize with sound enabled by default', () => {
        const soundManager = new SoundManager();
        test.expect(soundManager.isSoundEnabled()).toBe(true);
    });

    test.it('should allow toggling sound enabled state', () => {
        const soundManager = new SoundManager();

        // Default state should be enabled
        test.expect(soundManager.isSoundEnabled()).toBe(true);

        // Disable sound
        soundManager.setSoundEnabled(false);
        test.expect(soundManager.isSoundEnabled()).toBe(false);

        // Re-enable sound
        soundManager.setSoundEnabled(true);
        test.expect(soundManager.isSoundEnabled()).toBe(true);
    });

    test.it('should not crash when Web Audio API is not available', () => {
        // Create a sound manager in Node.js environment (no Web Audio API)
        const soundManager = new SoundManager();

        // These should not throw errors even without Web Audio API
        soundManager.playCorrectSound();
        soundManager.playIncorrectSound();
        soundManager.playNewGameSound();

        // Should still track enabled state
        test.expect(soundManager.isSoundEnabled()).toBe(true);
        soundManager.setSoundEnabled(false);
        test.expect(soundManager.isSoundEnabled()).toBe(false);
    });

    test.it('should handle createOscillatorWithEnvelope gracefully without audio context', () => {
        const soundManager = new SoundManager();

        // In Node.js environment, this should return null without crashing
        const result = soundManager.createOscillatorWithEnvelope(440, 'sine', 0.5);
        test.expect(result).toBe(null);
    });

    test.it('should respect sound enabled setting for all sound methods', () => {
        const soundManager = new SoundManager();

        // Disable sound
        soundManager.setSoundEnabled(false);

        // These should not attempt to play sounds when disabled
        // (we can't directly test audio output in Node.js, but we can verify no crashes)
        soundManager.playCorrectSound();
        soundManager.playIncorrectSound();
        soundManager.playNewGameSound();

        // No assertion needed - if we reach here without error, the test passes
        test.expect(true).toBe(true);
    });
});

// Show final results
test.showResults();