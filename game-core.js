// Core game logic separated from DOM dependencies for testing

class NumberWallCore {
    constructor() {
        this.values = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        this.hiddenFields = [];
    }

    generateRandomNumber() {
        return Math.floor(Math.random() * 21); // 0 to 20
    }

    generateWall() {
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
            this.generateWall(); // Regenerate if any value exceeds 20
        }
    }

    selectHiddenFields() {
        const allFields = ['a', 'b', 'c', 'd', 'e', 'f'];
        const shuffled = allFields.sort(() => 0.5 - Math.random());
        this.hiddenFields = shuffled.slice(0, 3);
    }

    validateAnswers(userAnswers) {
        for (const field of this.hiddenFields) {
            const userValue = parseInt(userAnswers[field]);
            if (isNaN(userValue) || userValue !== this.values[field]) {
                return false;
            }
        }
        return true;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumberWallCore;
}