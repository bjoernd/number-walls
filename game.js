class NumberWall {
    constructor() {
        this.values = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        this.hiddenFields = [];
        this.gameActive = false;

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.startBtn = document.getElementById('start-btn');
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
        this.startBtn.addEventListener('click', () => this.startGame());
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
        this.startBtn.disabled = true;
        this.checkBtn.disabled = false;
        this.message.textContent = '';

        // Focus on first empty field
        const firstHidden = this.hiddenFields[0];
        this.inputs[firstHidden].focus();
    }

    checkAnswers() {
        if (!this.gameActive) return;

        let allCorrect = true;

        for (const field of this.hiddenFields) {
            const userValue = parseInt(this.inputs[field].value);
            if (isNaN(userValue) || userValue !== this.values[field]) {
                allCorrect = false;
                break;
            }
        }

        this.message.textContent = allCorrect ? 'Right!' : 'Wrong!';
        this.message.style.color = allCorrect ? 'green' : 'red';

        this.gameActive = false;
        this.checkBtn.disabled = true;

        // Auto-start new game after 5 seconds
        setTimeout(() => {
            this.startBtn.disabled = false;
            this.startGame();
        }, 5000);
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NumberWall();
});