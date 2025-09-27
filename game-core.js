// Core game logic separated from DOM dependencies for testing

class NumberWallCore {
    constructor() {
        this.values = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        this.hiddenFields = [];
        this.rightAnswers = 0;
        this.wrongAnswers = 0;
    }

    generateRandomNumber() {
        // Weighted random generation: reduce likelihood of 0 even more
        // 0 has ~1.2% chance (1/81), numbers 1-20 each have ~4.9% chance (4/81)
        const weightedRandom = Math.floor(Math.random() * 81);

        if (weightedRandom === 0) {
            return 0; // Only 1 out of 81 chances for 0
        } else {
            return Math.floor((weightedRandom - 1) / 4) + 1; // Numbers 1-20, each with 4/81 chance
        }
    }

    generateWall(attemptCount = 0) {
        // Prevent infinite recursion with fallback values
        if (attemptCount > 100) {
            this.values = { a: 1, b: 1, c: 1, d: 2, e: 2, f: 4 };
            return;
        }

        // Generate A, B, C randomly
        this.values.a = this.generateRandomNumber();
        this.values.b = this.generateRandomNumber();
        this.values.c = this.generateRandomNumber();

        // Calculate D, E, F based on rules
        this.values.d = this.values.a + this.values.b;
        this.values.e = this.values.b + this.values.c;
        this.values.f = this.values.d + this.values.e;

        // Ensure all values are within 0-20 range
        if (this.values.d > 20 || this.values.e > 20 || this.values.f > 20) {
            this.generateWall(attemptCount + 1); // Regenerate with attempt counter
        }
    }

    selectHiddenFields() {
        const allFields = ['a', 'b', 'c', 'd', 'e', 'f'];
        const shuffled = allFields.sort(() => 0.5 - Math.random());
        this.hiddenFields = shuffled.slice(0, 3);
    }

    validateAnswers(userAnswers) {
        // Create a copy of current values with user answers filled in
        const testValues = { ...this.values };

        // Apply user answers to the test values
        for (const field of this.hiddenFields) {
            const userValue = parseInt(userAnswers[field]);
            // Validate input is a valid non-negative integer
            if (isNaN(userValue) || userValue < 0) {
                return false; // Invalid input
            }
            testValues[field] = userValue;
        }

        // Validate mathematical relationships
        // A + B = D
        if (testValues.a + testValues.b !== testValues.d) {
            return false;
        }

        // B + C = E
        if (testValues.b + testValues.c !== testValues.e) {
            return false;
        }

        // D + E = F
        if (testValues.d + testValues.e !== testValues.f) {
            return false;
        }

        return true;
    }

    validateIndividualAnswers(userAnswers) {
        // Create a copy of current values with user answers filled in
        const testValues = { ...this.values };
        const fieldResults = {};

        // Apply user answers to the test values
        for (const field of this.hiddenFields) {
            const userValue = parseInt(userAnswers[field]);
            // Validate input is a valid non-negative integer
            if (isNaN(userValue) || userValue < 0) {
                fieldResults[field] = false;
            } else {
                testValues[field] = userValue;
                fieldResults[field] = true; // Will be updated below if wrong
            }
        }

        // If all inputs are valid, check if the complete solution is mathematically correct
        const allInputsValid = Object.values(fieldResults).every(result => result);
        if (allInputsValid) {
            // Validate the complete solution
            const solutionValid = (
                testValues.a + testValues.b === testValues.d &&
                testValues.b + testValues.c === testValues.e &&
                testValues.d + testValues.e === testValues.f
            );

            // If the complete solution is valid, all fields are correct (fixes ambiguous colors)
            if (solutionValid) {
                for (const field of this.hiddenFields) {
                    fieldResults[field] = true;
                }
            } else {
                // For invalid solutions, check each field individually against original values
                // This provides individual feedback while still handling ambiguous cases when valid
                for (const field of this.hiddenFields) {
                    const userValue = testValues[field];
                    fieldResults[field] = (userValue === this.values[field]);
                }
            }
        }

        return fieldResults;
    }

    incrementRightAnswers() {
        this.rightAnswers++;
    }

    incrementWrongAnswers() {
        this.wrongAnswers++;
    }

    getScore() {
        return {
            right: this.rightAnswers,
            wrong: this.wrongAnswers
        };
    }

    getRandomCorrectMessage() {
        const messages = ['Gut', 'Super', 'Toll', 'Prima', 'Klasse', 'Genau'];
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }

    getRandomIncorrectMessage() {
        const messages = ['Nee', 'Achwas', 'Stimmt nicht', 'Nicht ganz', 'Schau genauer hin'];
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumberWallCore;
}