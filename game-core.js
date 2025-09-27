// Core game logic separated from DOM dependencies for testing

class NumberWallCore {
    constructor() {
        this.values = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        this.hiddenFields = [];
    }

    generateRandomNumber() {
        // Weighted random generation: reduce likelihood of 0
        // 0 has ~2.4% chance (1/41), numbers 1-20 each have ~4.9% chance (2/41)
        const weightedRandom = Math.floor(Math.random() * 41);

        if (weightedRandom === 0) {
            return 0; // Only 1 out of 41 chances for 0
        } else {
            return Math.floor((weightedRandom - 1) / 2) + 1; // Numbers 1-20, each with 2/41 chance
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

        // Check if each field contributes to correct mathematical relationships
        for (const field of this.hiddenFields) {
            if (!fieldResults[field]) continue; // Skip if already invalid

            // Check if this field's value is correct by seeing if it matches the expected value
            fieldResults[field] = (testValues[field] === this.values[field]);
        }

        return fieldResults;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumberWallCore;
}