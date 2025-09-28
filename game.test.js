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
            toBeLessThanOrEqual: (expected) => {
                if (actual > expected) {
                    throw new Error(`Expected ${actual} to be <= ${expected}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be > ${expected}`);
                }
            }
        };
    }

    showResults() {
        console.log('\n--- Test Results ---');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        if (this.results.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('❌ Some tests failed!');
            process.exit(1);
        }
    }
}

const test = new TestFramework();

// Import the core game logic
const { NumberWallCore } = require('./game-core.js');

test.describe('Core Game Logic', () => {
    test.it('should generate walls with correct mathematical relationships', () => {
        const gameCore = new NumberWallCore();
        gameCore.generateWall();

        // Verify mathematical rules
        test.expect(gameCore.values.d).toBe(gameCore.values.a + gameCore.values.b);
        test.expect(gameCore.values.e).toBe(gameCore.values.b + gameCore.values.c);
        test.expect(gameCore.values.f).toBe(gameCore.values.d + gameCore.values.e);
    });

    test.it('should validate correct answers', () => {
        const gameCore = new NumberWallCore();
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        const correctAnswers = { a: '5', d: '12', f: '22' };
        test.expect(gameCore.validateAnswers(correctAnswers)).toBe(true);
    });

    test.it('should reject incorrect answers', () => {
        const gameCore = new NumberWallCore();
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        const wrongAnswers = { a: '4', d: '12', f: '22' };
        test.expect(gameCore.validateAnswers(wrongAnswers)).toBe(false);
    });

    test.it('should handle custom maximum limits', () => {
        const gameCore = new NumberWallCore();
        gameCore.generateWall(0, 50);

        // All values should be within custom range
        test.expect(gameCore.values.a).toBeLessThanOrEqual(50);
        test.expect(gameCore.values.b).toBeLessThanOrEqual(50);
        test.expect(gameCore.values.c).toBeLessThanOrEqual(50);
        test.expect(gameCore.values.d).toBeLessThanOrEqual(50);
        test.expect(gameCore.values.e).toBeLessThanOrEqual(50);
        test.expect(gameCore.values.f).toBeLessThanOrEqual(50);
    });
});

test.describe('Bug Fixes', () => {
    test.it('should validate the F=90 bug case correctly', () => {
        const gameCore = new NumberWallCore();
        gameCore.values = { a: 18, b: 23, c: 26, d: 41, e: 49, f: 90 };
        gameCore.hiddenFields = ['b', 'd', 'f'];

        const correctAnswers = { b: '23', d: '41', f: '90' };
        test.expect(gameCore.validateAnswers(correctAnswers)).toBe(true);

        const fieldResults = gameCore.validateIndividualAnswers(correctAnswers);
        test.expect(fieldResults.b).toBe(true);
        test.expect(fieldResults.d).toBe(true);
        test.expect(fieldResults.f).toBe(true);
    });
});

test.describe('Security', () => {
    test.it('should prevent infinite recursion with fallback values', () => {
        const gameCore = new NumberWallCore();
        // Force fallback by exceeding max attempts
        gameCore.generateWall(101, 2); // Very low max with high attempt count

        // Should use fallback values, not crash
        test.expect(gameCore.values.a).toBe(1);
        test.expect(gameCore.values.f).toBe(4);
    });

    test.it('should reject invalid inputs', () => {
        const gameCore = new NumberWallCore();
        gameCore.values = { a: 5, b: 7, c: 3, d: 12, e: 10, f: 22 };
        gameCore.hiddenFields = ['a', 'd', 'f'];

        const invalidAnswers = { a: 'abc', d: '12', f: '22' };
        test.expect(gameCore.validateAnswers(invalidAnswers)).toBe(false);
    });
});

// Show final results
test.showResults();