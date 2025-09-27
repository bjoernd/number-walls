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
                this.checkIfAllFieldsFilled();
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
            // Wait 500ms before validating to allow completion of 2-digit numbers
            this.validationTimeout = setTimeout(() => {
                this.checkAnswers();
                this.validationTimeout = null;
            }, 500);
        }
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

        this.message.textContent = allCorrect ? 'Right!' : 'Wrong!';
        this.message.style.color = allCorrect ? 'green' : 'red';

        this.gameActive = false;

        // Auto-start new game after 5 seconds
        setTimeout(() => {
            this.startGame();
        }, 5000);
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new NumberWall();
    game.startGame();
});