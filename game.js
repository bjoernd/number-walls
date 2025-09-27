class NumberWall extends NumberWallCore {
    constructor() {
        super();
        this.gameActive = false;
        this.validationTimeout = null;

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.message = document.getElementById('message');
        this.rightScoreElement = document.getElementById('right-score');
        this.wrongScoreElement = document.getElementById('wrong-score');
        this.inputs = {
            a: document.getElementById('a'),
            b: document.getElementById('b'),
            c: document.getElementById('c'),
            d: document.getElementById('d'),
            e: document.getElementById('e'),
            f: document.getElementById('f')
        };
    }

    setupEventListeners() {
        // Add input validation to only allow numeric characters
        Object.values(this.inputs).forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > 2) value = value.slice(0, 2);
                e.target.value = value;

                // Check if this was the 2nd digit entered and all fields are filled
                if (value.length === 2) {
                    this.checkIfAllFieldsFilledWithImmediate();
                } else {
                    this.checkIfAllFieldsFilled();
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.gameActive) {
                    this.checkAnswers();
                }
            });
        });
    }

    checkIfAllFieldsFilled() {
        if (!this.gameActive) return;

        // Clear any existing timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
            this.validationTimeout = null;
        }

        // Check if all hidden fields have values
        const allFilled = this.hiddenFields.every(field => {
            const value = this.inputs[field].value.trim();
            return value !== '';
        });

        if (allFilled) {
            // Get the last filled field to determine validation delay
            const lastFilledField = this.getLastFilledField();
            const lastValue = this.inputs[lastFilledField].value;

            // Determine if we expect a 2-digit number for this field
            const expects2Digits = this.expectsTwoDigits(lastFilledField);

            if (!expects2Digits || lastValue.length === 2) {
                // Validate immediately if we don't expect 2 digits or already have 2 digits
                this.checkAnswers();
            } else {
                // Allow up to 1 second for 2-digit input, but validate immediately on 2nd digit
                this.validationTimeout = setTimeout(() => {
                    this.checkAnswers();
                    this.validationTimeout = null;
                }, 1000);
            }
        }
    }

    checkIfAllFieldsFilledWithImmediate() {
        if (!this.gameActive) return;

        // Clear any existing timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
            this.validationTimeout = null;
        }

        // Check if all hidden fields have values
        const allFilled = this.hiddenFields.every(field => {
            const value = this.inputs[field].value.trim();
            return value !== '';
        });

        if (allFilled) {
            // Validate immediately since a 2nd digit was just entered
            this.checkAnswers();
        }
    }

    getLastFilledField() {
        // Find the field that was filled last (highest input order)
        let lastField = null;
        for (const field of this.hiddenFields) {
            const value = this.inputs[field].value.trim();
            if (value !== '') {
                lastField = field;
            }
        }
        return lastField;
    }

    expectsTwoDigits(field) {
        // Calculate the possible range for this field based on current known values
        const possibleValues = this.getPossibleValuesForField(field);
        return possibleValues.some(value => value >= 10);
    }

    getPossibleValuesForField(field) {
        // Get current values (both known and user-entered)
        const currentValues = {};
        Object.keys(this.inputs).forEach(key => {
            if (this.hiddenFields.includes(key)) {
                const userValue = this.inputs[key].value.trim();
                currentValues[key] = userValue !== '' ? parseInt(userValue) : null;
            } else {
                currentValues[key] = this.values[key];
            }
        });

        const possibleValues = [];

        // Try all possible values 0-20 for this field and see which ones create valid walls
        for (let testValue = 0; testValue <= 20; testValue++) {
            currentValues[field] = testValue;

            // Check if this creates a valid number wall
            if (this.isValidWallConfiguration(currentValues)) {
                possibleValues.push(testValue);
            }
        }

        return possibleValues;
    }

    isValidWallConfiguration(values) {
        // Check if the current configuration satisfies the number wall equations
        // A + B = D, B + C = E, D + E = F
        const { a, b, c, d, e, f } = values;

        // Only validate if we have enough values to check
        if (a !== null && b !== null && d !== null) {
            if (a + b !== d) return false;
        }
        if (b !== null && c !== null && e !== null) {
            if (b + c !== e) return false;
        }
        if (d !== null && e !== null && f !== null) {
            if (d + e !== f) return false;
        }

        return true;
    }


    displayWall() {
        Object.keys(this.inputs).forEach(field => {
            const input = this.inputs[field];
            if (this.hiddenFields.includes(field)) {
                input.value = '';
                input.disabled = false;
                input.style.backgroundColor = 'white';
            } else {
                input.value = this.values[field];
                input.disabled = true;
                input.style.backgroundColor = '#f0f0f0';
            }
        });
    }

    startGame() {
        this.generateWall();
        this.selectHiddenFields();
        this.displayWall();

        this.gameActive = true;
        this.message.textContent = '';

        // Focus on first empty field
        const firstHidden = this.hiddenFields[0];
        this.inputs[firstHidden].focus();
    }

    checkAnswers() {
        if (!this.gameActive) return;

        // Clear any pending validation timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
            this.validationTimeout = null;
        }

        const userAnswers = {};
        for (const field of this.hiddenFields) {
            userAnswers[field] = this.inputs[field].value;
        }

        const allCorrect = this.validateAnswers(userAnswers);
        const fieldResults = this.validateIndividualAnswers(userAnswers);

        // Apply visual feedback to each user-filled field
        for (const field of this.hiddenFields) {
            const input = this.inputs[field];
            const isCorrect = fieldResults[field];

            // Remove any existing animation classes
            input.classList.remove('flash-correct', 'flash-incorrect');

            // Add appropriate animation class
            if (isCorrect) {
                input.classList.add('flash-correct');
            } else {
                input.classList.add('flash-incorrect');
            }

            // Remove the animation class after animation completes
            setTimeout(() => {
                input.classList.remove('flash-correct', 'flash-incorrect');
            }, 2000);
        }

        // Update score counters
        if (allCorrect) {
            this.incrementRightAnswers();
        } else {
            this.incrementWrongAnswers();
        }

        this.message.textContent = allCorrect ? this.getRandomCorrectMessage() : this.getRandomIncorrectMessage();
        this.message.style.color = allCorrect ? 'green' : 'red';

        // Update score display
        this.updateScoreDisplay();

        this.gameActive = false;

        // Auto-start new game after 2 seconds
        setTimeout(() => {
            this.startGame();
        }, 2000);
    }

    updateScoreDisplay() {
        const score = this.getScore();
        if (this.rightScoreElement) {
            this.rightScoreElement.textContent = score.right;
        }
        if (this.wrongScoreElement) {
            this.wrongScoreElement.textContent = score.wrong;
        }
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new NumberWall();
    game.startGame();
});