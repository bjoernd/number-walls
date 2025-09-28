// Core game logic separated from DOM dependencies for testing

// Shared constants for localization
const CORRECT_MESSAGES = ['Gut', 'Super', 'Toll', 'Prima', 'Klasse', 'Genau', 'Spitze', 'Wunderbar', 'Fantastisch', 'Ausgezeichnet', 'Cool', 'Stark', 'Mega', 'Stimmt genau', 'Bingo', 'Das ist es', 'Bravo', 'Juhu', 'Yay'];
const INCORRECT_MESSAGES = ['Nee', 'Achwas', 'Stimmt nicht', 'Nicht ganz', 'Schau genauer hin', 'Auweia', 'Huch', 'Oje', 'Nö', 'Schade', 'Quatsch', 'Nix da', 'Oha', 'Ups', 'So nicht', 'Anders'];

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

        // Define forbidden combinations (sets of 3 fields that should never be hidden together)
        const forbiddenCombinations = [
            ['b', 'd', 'e'],  // Never hide B, D, and E together
            ['a', 'd', 'f'],  // Never hide A, D, and F together
            ['c', 'e', 'f']   // Never hide C, E, and F together
        ];

        let selectedFields;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop

        do {
            const shuffled = allFields.sort(() => 0.5 - Math.random());
            selectedFields = shuffled.slice(0, 3).sort(); // Sort for consistent comparison
            attempts++;

            if (attempts >= maxAttempts) {
                // Fallback: use a safe combination if we can't find a valid one
                selectedFields = ['a', 'b', 'c'];
                break;
            }
        } while (this.isForbiddenCombination(selectedFields, forbiddenCombinations));

        this.hiddenFields = selectedFields;
    }

    isForbiddenCombination(selectedFields, forbiddenCombinations) {
        const sortedSelected = selectedFields.slice().sort();

        return forbiddenCombinations.some(forbidden => {
            const sortedForbidden = forbidden.slice().sort();
            return sortedSelected.length === sortedForbidden.length &&
                   sortedSelected.every((field, index) => field === sortedForbidden[index]);
        });
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
        const randomIndex = Math.floor(Math.random() * CORRECT_MESSAGES.length);
        return CORRECT_MESSAGES[randomIndex];
    }

    getRandomIncorrectMessage() {
        const randomIndex = Math.floor(Math.random() * INCORRECT_MESSAGES.length);
        return INCORRECT_MESSAGES[randomIndex];
    }

    getRandomCorrectAnimation() {
        const animations = ['message-bounce-in', 'message-zoom-celebration', 'message-slide-sparkle', 'message-pulse-glow', 'message-flip-tada'];
        const randomIndex = Math.floor(Math.random() * animations.length);
        return animations[randomIndex];
    }

    getRandomIncorrectAnimation() {
        const animations = ['message-shake-fade', 'message-wobble-in', 'message-slide-gentle', 'message-pulse-soft'];
        const randomIndex = Math.floor(Math.random() * animations.length);
        return animations[randomIndex];
    }
}

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.soundEnabled = true;
        this.initializeAudioContext();
    }

    initializeAudioContext() {
        try {
            if (typeof window !== 'undefined' && window.AudioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.audioContext = null;
        }
    }

    ensureAudioContextResumed() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume();
        }
        return Promise.resolve();
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    isSoundEnabled() {
        return this.soundEnabled;
    }

    createOscillatorWithEnvelope(frequency, type, duration, attackTime = 0.1, decayTime = 0.2) {
        if (!this.audioContext || !this.soundEnabled) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        const now = this.audioContext.currentTime;
        const sustainLevel = 0.3;
        const releaseTime = duration - attackTime - decayTime;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.8, now + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        return { oscillator, gainNode };
    }

    playCorrectSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        this.ensureAudioContextResumed().then(() => {
            // Tada! sound with ascending fanfare and sparkle
            const now = this.audioContext.currentTime;

            // Main ascending fanfare: C - E - G - C (major chord arpeggio)
            const notes = [
                { freq: 523.25, start: 0.0, duration: 0.15 },    // C5
                { freq: 659.25, start: 0.08, duration: 0.15 },   // E5
                { freq: 783.99, start: 0.16, duration: 0.15 },   // G5
                { freq: 1046.5, start: 0.24, duration: 0.3 }     // C6 (held longer)
            ];

            // Create main fanfare notes
            notes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.freq, now + note.start);

                // Envelope for each note
                gain.gain.setValueAtTime(0, now + note.start);
                gain.gain.linearRampToValueAtTime(0.4, now + note.start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

                osc.start(now + note.start);
                osc.stop(now + note.start + note.duration);
            });

            // Add sparkle/shimmer effect with higher frequencies
            const sparkleNotes = [
                { freq: 1318.5, start: 0.3, duration: 0.08 },    // E6
                { freq: 1568.0, start: 0.35, duration: 0.08 },   // G6
                { freq: 2093.0, start: 0.4, duration: 0.12 }     // C7
            ];

            sparkleNotes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note.freq, now + note.start);

                // Quick bright envelope for sparkle
                gain.gain.setValueAtTime(0, now + note.start);
                gain.gain.linearRampToValueAtTime(0.2, now + note.start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

                osc.start(now + note.start);
                osc.stop(now + note.start + note.duration);
            });
        });
    }

    playIncorrectSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        this.ensureAudioContextResumed().then(() => {
            // Playful "oops" sound with wobble and comedic timing
            const now = this.audioContext.currentTime;

            // Main "oops" tone - starts higher then drops with a wobble
            const mainOsc = this.audioContext.createOscillator();
            const mainGain = this.audioContext.createGain();

            mainOsc.connect(mainGain);
            mainGain.connect(this.audioContext.destination);

            mainOsc.type = 'sawtooth';

            // Frequency slide: C4 → G3 → F3 with wobble
            mainOsc.frequency.setValueAtTime(261.63, now);          // C4
            mainOsc.frequency.exponentialRampToValueAtTime(196, now + 0.1);  // G3
            mainOsc.frequency.exponentialRampToValueAtTime(174.61, now + 0.3); // F3

            // Add wobble effect with LFO-like frequency modulation
            const wobbleFreq = 8; // 8Hz wobble
            const wobbleAmount = 10; // 10Hz deviation
            for (let i = 0; i < 6; i++) {
                const wobbleTime = now + 0.05 + (i * 0.04);
                const currentFreq = 196 - (i * 3.5); // Gradually descending base frequency
                const wobbleOffset = Math.sin(i * Math.PI / 3) * wobbleAmount;
                mainOsc.frequency.setValueAtTime(currentFreq + wobbleOffset, wobbleTime);
            }

            // Envelope for main sound
            mainGain.gain.setValueAtTime(0, now);
            mainGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
            mainGain.gain.exponentialRampToValueAtTime(0.2, now + 0.15);
            mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            mainOsc.start(now);
            mainOsc.stop(now + 0.35);

            // Add a subtle "bonk" percussion effect at the beginning
            const bonkOsc = this.audioContext.createOscillator();
            const bonkGain = this.audioContext.createGain();

            bonkOsc.connect(bonkGain);
            bonkGain.connect(this.audioContext.destination);

            bonkOsc.type = 'square';
            bonkOsc.frequency.setValueAtTime(80, now);
            bonkOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

            // Quick percussive envelope
            bonkGain.gain.setValueAtTime(0, now);
            bonkGain.gain.linearRampToValueAtTime(0.15, now + 0.005);
            bonkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            bonkOsc.start(now);
            bonkOsc.stop(now + 0.08);

            // Add a tiny "trill" at the end for comedic effect
            const trillOsc = this.audioContext.createOscillator();
            const trillGain = this.audioContext.createGain();

            trillOsc.connect(trillGain);
            trillGain.connect(this.audioContext.destination);

            trillOsc.type = 'sine';
            trillOsc.frequency.setValueAtTime(440, now + 0.25);
            trillOsc.frequency.setValueAtTime(493.88, now + 0.27); // B4
            trillOsc.frequency.setValueAtTime(440, now + 0.29);     // A4

            // Quick trill envelope
            trillGain.gain.setValueAtTime(0, now + 0.25);
            trillGain.gain.linearRampToValueAtTime(0.1, now + 0.26);
            trillGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

            trillOsc.start(now + 0.25);
            trillOsc.stop(now + 0.32);
        });
    }

    playNewGameSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        this.ensureAudioContextResumed().then(() => {
            const sound = this.createOscillatorWithEnvelope(440, 'sine', 0.3, 0.02, 0.08);

            if (sound) {
                sound.gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);

                const now = this.audioContext.currentTime;
                sound.oscillator.frequency.setValueAtTime(440, now);
                sound.oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                sound.oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.3);

                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + 0.3);
            }
        });
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NumberWallCore, SoundManager, CORRECT_MESSAGES, INCORRECT_MESSAGES };
}