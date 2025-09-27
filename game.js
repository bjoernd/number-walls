class NumberWall extends NumberWallCore {
    constructor() {
        super();
        this.gameActive = false;

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.checkBtn = document.getElementById('check-btn');
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
        this.checkBtn.addEventListener('click', () => this.checkAnswers());

        // Add input validation to only allow numeric characters
        Object.values(this.inputs).forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.gameActive) {
                    this.checkAnswers();
                }
            });
        });
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
        this.checkBtn.disabled = false;
        this.message.textContent = '';

        // Focus on first empty field
        const firstHidden = this.hiddenFields[0];
        this.inputs[firstHidden].focus();
    }

    checkAnswers() {
        if (!this.gameActive) return;

        const userAnswers = {};
        for (const field of this.hiddenFields) {
            userAnswers[field] = this.inputs[field].value;
        }

        const allCorrect = this.validateAnswers(userAnswers);

        this.message.textContent = allCorrect ? 'Right!' : 'Wrong!';
        this.message.style.color = allCorrect ? 'green' : 'red';

        this.gameActive = false;
        this.checkBtn.disabled = true;

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