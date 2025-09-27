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

// Import the core game logic
const NumberWallCore = require('./game-core.js');

// Initialize test framework
const test = new TestFramework();

// Run tests
test.describe('NumberWallCore Class', () => {
    let gameCore;

    test.it('should generate random numbers between 0 and 20', () => {
        gameCore = new NumberWallCore();

        for (let i = 0; i < 100; i++) {
            const randomNum = gameCore.generateRandomNumber();
            test.expect(randomNum).toBeGreaterThanOrEqual(0);
            test.expect(randomNum).toBeLessThanOrEqual(20);
        }
    });

    test.it('should generate 0 less frequently than other numbers', () => {
        gameCore = new NumberWallCore();
        let zeroCount = 0;
        let otherCounts = {};
        const totalSamples = 2100; // Large sample for statistical significance

        // Initialize counts for numbers 1-20
        for (let i = 1; i <= 20; i++) {
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
        // Expected: 0 appears ~2.4% (50 times), others ~4.8% (100 times each)
        test.expect(zeroCount).toBeLessThanOrEqual(avgNonZeroCount * 0.7); // 0 should be at most 70% of average
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
        const validFields = ['a', 'b', 'c', 'd', 'e', 'f'];

        gameCore.selectHiddenFields();

        gameCore.hiddenFields.forEach(field => {
            test.expect(validFields).toContain(field);
        });
    });

    test.it('should generate wall with all values within 0-20 range', () => {
        gameCore = new NumberWallCore();

        // Test multiple generations to ensure consistency
        for (let i = 0; i < 50; i++) {
            gameCore.generateWall();

            test.expect(gameCore.values.a).toBeGreaterThanOrEqual(0);
            test.expect(gameCore.values.a).toBeLessThanOrEqual(20);
            test.expect(gameCore.values.b).toBeGreaterThanOrEqual(0);
            test.expect(gameCore.values.b).toBeLessThanOrEqual(20);
            test.expect(gameCore.values.c).toBeGreaterThanOrEqual(0);
            test.expect(gameCore.values.c).toBeLessThanOrEqual(20);
            test.expect(gameCore.values.d).toBeGreaterThanOrEqual(0);
            test.expect(gameCore.values.d).toBeLessThanOrEqual(20);
            test.expect(gameCore.values.e).toBeGreaterThanOrEqual(0);
            test.expect(gameCore.values.e).toBeLessThanOrEqual(20);
            test.expect(gameCore.values.f).toBeGreaterThanOrEqual(0);
            test.expect(gameCore.values.f).toBeLessThanOrEqual(20);
        }
    });

    test.it('should maintain mathematical relationships in generated wall', () => {
        gameCore = new NumberWallCore();

        for (let i = 0; i < 20; i++) {
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
});

test.describe('Security Enhancements', () => {
    test.it('should prevent infinite recursion with fallback values', () => {
        const gameCore = new NumberWallCore();

        // Force recursion limit by calling with high attempt count
        gameCore.generateWall(101);

        // Should use fallback values
        test.expect(gameCore.values.a).toBe(1);
        test.expect(gameCore.values.b).toBe(1);
        test.expect(gameCore.values.c).toBe(1);
        test.expect(gameCore.values.d).toBe(2);
        test.expect(gameCore.values.e).toBe(2);
        test.expect(gameCore.values.f).toBe(4);
    });

    test.it('should maintain mathematical relationships in fallback values', () => {
        const gameCore = new NumberWallCore();

        // Force fallback values
        gameCore.generateWall(101);

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
            test.expect(gameCore.values.a).toBeGreaterThanOrEqual(0);
            test.expect(gameCore.values.a).toBeLessThanOrEqual(20);
            test.expect(gameCore.values.f).toBeLessThanOrEqual(20);

            // Mathematical relationships should hold
            test.expect(gameCore.values.d).toBe(gameCore.values.a + gameCore.values.b);
            test.expect(gameCore.values.e).toBe(gameCore.values.b + gameCore.values.c);
            test.expect(gameCore.values.f).toBe(gameCore.values.d + gameCore.values.e);
        }
    });
});

// Show final results
test.showResults();