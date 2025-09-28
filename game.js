class NumberWall extends NumberWallCore {
    constructor() {
        super();
        this.gameActive = false;
        this.validationTimeout = null;
        this.soundManager = new SoundManager();

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.message = document.getElementById('message');
        this.rightScoreElement = document.getElementById('right-score');
        this.wrongScoreElement = document.getElementById('wrong-score');
        this.soundToggle = document.getElementById('sound-toggle');
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
        Object.keys(this.inputs).forEach(fieldName => {
            const input = this.inputs[fieldName];

            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > 2) value = value.slice(0, 2);
                e.target.value = value;

                // Check if all fields are filled and determine validation timing
                this.handleInputChange(fieldName, value);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.gameActive) {
                    this.checkAnswers();
                }
            });
        });

        // Add sound toggle event listener
        if (this.soundToggle) {
            this.soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }
    }

    toggleSound() {
        const currentState = this.soundManager.isSoundEnabled();
        const newState = !currentState;

        this.soundManager.setSoundEnabled(newState);

        // Update button appearance and content
        if (newState) {
            this.soundToggle.textContent = '🔊';
            this.soundToggle.classList.remove('sound-off');
            this.soundToggle.classList.add('sound-on');
            this.soundToggle.title = 'Sound ein/aus';
        } else {
            this.soundToggle.textContent = '🔇';
            this.soundToggle.classList.remove('sound-on');
            this.soundToggle.classList.add('sound-off');
            this.soundToggle.title = 'Sound ein/aus';
        }
    }

    handleInputChange(fieldName, value) {
        if (!this.gameActive) return;

        // Clear any existing timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
            this.validationTimeout = null;
        }

        // Check if all hidden fields have values
        const allFilled = this.hiddenFields.every(field => {
            const fieldValue = this.inputs[field].value.trim();
            return fieldValue !== '';
        });

        if (allFilled) {
            // If this field has 2 digits, validate immediately
            if (value.length === 2) {
                this.checkAnswers();
                return;
            }

            // If this field has 1 digit, check if 2-digit numbers are possible
            const canBeTwoDigits = this.canFieldBeTwoDigits(fieldName);

            if (!canBeTwoDigits) {
                // Only 1-digit numbers possible, validate immediately
                this.checkAnswers();
            } else {
                // 2-digit numbers possible, wait up to 2.5 seconds for second digit
                this.validationTimeout = setTimeout(() => {
                    this.checkAnswers();
                    this.validationTimeout = null;
                }, 2500);
            }
        }
    }

    canFieldBeTwoDigits(fieldName) {
        // Check if any 2-digit values (10-20) could work for this field
        // IMPORTANT: Ignore the current partial input for the field being checked

        // Get current state, but exclude the field we're checking
        const currentValues = {};
        Object.keys(this.inputs).forEach(key => {
            if (this.hiddenFields.includes(key) && key !== fieldName) {
                // For other hidden fields, use their current values
                const userValue = this.inputs[key].value.trim();
                if (userValue !== '') {
                    currentValues[key] = parseInt(userValue);
                } else {
                    currentValues[key] = null;
                }
            } else if (!this.hiddenFields.includes(key)) {
                // For visible fields, use the known values
                currentValues[key] = this.values[key];
            } else {
                // For the field being checked, set to null (we'll test values)
                currentValues[key] = null;
            }
        });

        // Test all 2-digit values (10-20) to see if any work
        for (let testValue = 10; testValue <= 20; testValue++) {
            currentValues[fieldName] = testValue;
            if (this.isValidPartialWall(currentValues)) {
                return true;
            }
        }

        return false;
    }

    isValidPartialWall(values) {
        // Check mathematical relationships where we have enough values
        const { a, b, c, d, e, f } = values;

        // Check A + B = D if we have all three
        if (a !== null && b !== null && d !== null) {
            if (a + b !== d) return false;
        }

        // Check B + C = E if we have all three
        if (b !== null && c !== null && e !== null) {
            if (b + c !== e) return false;
        }

        // Check D + E = F if we have all three
        if (d !== null && e !== null && f !== null) {
            if (d + e !== f) return false;
        }

        // Check if values are in valid range
        for (const value of Object.values(values)) {
            if (value !== null && (value < 0 || value > 20)) {
                return false;
            }
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
        // Don't clear the message here - keep it until next evaluation

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

        // Update score counters and play sounds
        if (allCorrect) {
            this.incrementRightAnswers();
            this.soundManager.playCorrectSound();
        } else {
            this.incrementWrongAnswers();
            this.soundManager.playIncorrectSound();
        }

        // Clear any existing animation classes and previous message
        this.message.className = 'message';
        this.message.textContent = '';

        // Set new message text
        this.message.textContent = allCorrect ? this.getRandomCorrectMessage() : this.getRandomIncorrectMessage();

        // Apply random animation
        const animationClass = allCorrect ? this.getRandomCorrectAnimation() : this.getRandomIncorrectAnimation();
        this.message.classList.add(animationClass);

        // Update score display
        this.updateScoreDisplay();

        this.gameActive = false;

        // Auto-start new game after 2 seconds
        setTimeout(() => {
            this.soundManager.playNewGameSound();
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
    // Set initial welcome message
    game.message.textContent = 'Los geht\'s!';
    game.message.className = 'message';
    game.startGame();
});