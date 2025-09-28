// Core game logic separated from DOM dependencies for testing

// Import shared constants
let GAME_CONSTANTS, AUDIO_CONSTANTS, ANIMATION_CONSTANTS, FIELD_CONSTANTS, LOCALIZATION_CONSTANTS;

if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment - require the constants
    const constants = require('./constants.js');
    GAME_CONSTANTS = constants.GAME_CONSTANTS;
    AUDIO_CONSTANTS = constants.AUDIO_CONSTANTS;
    ANIMATION_CONSTANTS = constants.ANIMATION_CONSTANTS;
    FIELD_CONSTANTS = constants.FIELD_CONSTANTS;
    LOCALIZATION_CONSTANTS = constants.LOCALIZATION_CONSTANTS;
} else {
    // Browser environment - will be imported via script tag
    // Constants will be available globally
}

// Legacy constants for backward compatibility
const CORRECT_MESSAGES = LOCALIZATION_CONSTANTS?.CORRECT_MESSAGES || ['Gut', 'Super', 'Toll', 'Prima', 'Klasse', 'Genau', 'Spitze', 'Wunderbar', 'Fantastisch', 'Ausgezeichnet', 'Cool', 'Stark', 'Mega', 'Stimmt genau', 'Bingo', 'Das ist es', 'Bravo', 'Juhu', 'Yay'];
const INCORRECT_MESSAGES = LOCALIZATION_CONSTANTS?.INCORRECT_MESSAGES || ['Nee', 'Achwas', 'Stimmt nicht', 'Nicht ganz', 'Schau genauer hin', 'Auweia', 'Huch', 'Oje', 'Nö', 'Schade', 'Quatsch', 'Nix da', 'Oha', 'Ups', 'So nicht', 'Anders'];

class NumberWallCore {
    constructor() {
        this.values = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        this.hiddenFields = [];
        this.rightAnswers = 0;
        this.wrongAnswers = 0;
    }

    generateRandomNumber() {
        const constants = GAME_CONSTANTS || { RANDOM_WEIGHT_TOTAL: 81, ZERO_WEIGHT: 1, NON_ZERO_WEIGHT: 4, MIN_NUMBER: 0, MAX_NUMBER: 20 };

        // Weighted random generation: reduce likelihood of 0
        // 0 has ~1.2% chance (1/81), numbers 1-20 each have ~4.9% chance (4/81)
        const weightedRandom = Math.floor(Math.random() * constants.RANDOM_WEIGHT_TOTAL);

        if (weightedRandom < constants.ZERO_WEIGHT) {
            return constants.MIN_NUMBER; // Only 1 out of 81 chances for 0
        } else {
            return Math.floor((weightedRandom - constants.ZERO_WEIGHT) / constants.NON_ZERO_WEIGHT) + 1; // Numbers 1-20, each with 4/81 chance
        }
    }

    generateWall(attemptCount = 0) {
        const constants = GAME_CONSTANTS || { MAX_GENERATION_ATTEMPTS: 100, MAX_NUMBER: 20, FALLBACK_VALUES: { a: 1, b: 1, c: 1, d: 2, e: 2, f: 4 } };

        // Prevent infinite recursion with fallback values
        if (attemptCount > constants.MAX_GENERATION_ATTEMPTS) {
            this.values = { ...constants.FALLBACK_VALUES };
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

        // Ensure all values are within valid range
        if (this.values.d > constants.MAX_NUMBER || this.values.e > constants.MAX_NUMBER || this.values.f > constants.MAX_NUMBER) {
            this.generateWall(attemptCount + 1); // Regenerate with attempt counter
        }
    }

    selectHiddenFields() {
        const fieldConstants = FIELD_CONSTANTS || {
            ALL_FIELDS: ['a', 'b', 'c', 'd', 'e', 'f'],
            FORBIDDEN_COMBINATIONS: [['b', 'd', 'e'], ['a', 'd', 'f'], ['c', 'e', 'f']],
            SAFE_FALLBACK_COMBINATION: ['a', 'b', 'c']
        };
        const gameConstants = GAME_CONSTANTS || { MAX_FIELD_SELECTION_ATTEMPTS: 100, HIDDEN_FIELDS_COUNT: 3 };

        const allFields = fieldConstants.ALL_FIELDS;
        const forbiddenCombinations = fieldConstants.FORBIDDEN_COMBINATIONS;

        let selectedFields;
        let attempts = 0;
        const maxAttempts = gameConstants.MAX_FIELD_SELECTION_ATTEMPTS; // Prevent infinite loop

        do {
            const shuffled = allFields.sort(() => 0.5 - Math.random());
            selectedFields = shuffled.slice(0, gameConstants.HIDDEN_FIELDS_COUNT).sort(); // Sort for consistent comparison
            attempts++;

            if (attempts >= maxAttempts) {
                // Fallback: use a safe combination if we can't find a valid one
                selectedFields = fieldConstants.SAFE_FALLBACK_COMBINATION;
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
            const constants = GAME_CONSTANTS || { MIN_NUMBER: 0 };
            // Validate input is a valid non-negative integer
            if (isNaN(userValue) || userValue < constants.MIN_NUMBER) {
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
            const constants = GAME_CONSTANTS || { MIN_NUMBER: 0 };
            // Validate input is a valid non-negative integer
            if (isNaN(userValue) || userValue < constants.MIN_NUMBER) {
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
        const animations = ANIMATION_CONSTANTS?.CORRECT_ANIMATIONS || ['message-bounce-in', 'message-zoom-celebration', 'message-slide-sparkle', 'message-pulse-glow', 'message-flip-tada'];
        const randomIndex = Math.floor(Math.random() * animations.length);
        return animations[randomIndex];
    }

    getRandomIncorrectAnimation() {
        const animations = ANIMATION_CONSTANTS?.INCORRECT_ANIMATIONS || ['message-shake-fade', 'message-wobble-in', 'message-slide-gentle', 'message-pulse-soft'];
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

    createOscillatorWithEnvelope(frequency, type, duration, attackTime, decayTime) {
        if (!this.audioContext || !this.soundEnabled) return null;

        const audioConstants = AUDIO_CONSTANTS || {
            TIMING: { ATTACK_TIME: 0.1, DECAY_TIME: 0.2 },
            VOLUME: { SUSTAIN_LEVEL: 0.3, ENVELOPE_START: 0.001 }
        };

        const actualAttackTime = attackTime || audioConstants.TIMING.ATTACK_TIME;
        const actualDecayTime = decayTime || audioConstants.TIMING.DECAY_TIME;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        const now = this.audioContext.currentTime;
        const sustainLevel = audioConstants.VOLUME.SUSTAIN_LEVEL;
        const releaseTime = duration - actualAttackTime - actualDecayTime;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.8, now + actualAttackTime);
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel, now + actualAttackTime + actualDecayTime);
        gainNode.gain.exponentialRampToValueAtTime(audioConstants.VOLUME.ENVELOPE_START, now + duration);

        return { oscillator, gainNode };
    }

    playCorrectSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        this.ensureAudioContextResumed().then(() => {
            const audioConstants = AUDIO_CONSTANTS || {
                NOTES: { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.5, G6: 1568.0, C7: 2093.0 },
                TIMING: { CORRECT_NOTE_DURATION: 0.15, CORRECT_FINAL_NOTE_DURATION: 0.3, CORRECT_SPARKLE_DURATION: 0.08, CORRECT_FINAL_SPARKLE_DURATION: 0.12 },
                VOLUME: { MAIN_GAIN: 0.4, SPARKLE_GAIN: 0.2, ENVELOPE_START: 0.001 }
            };

            // Tada! sound with ascending fanfare and sparkle
            const now = this.audioContext.currentTime;

            // Main ascending fanfare: C - E - G - C (major chord arpeggio)
            const notes = [
                { freq: audioConstants.NOTES.C5, start: 0.0, duration: audioConstants.TIMING.CORRECT_NOTE_DURATION },    // C5
                { freq: audioConstants.NOTES.E5, start: 0.08, duration: audioConstants.TIMING.CORRECT_NOTE_DURATION },   // E5
                { freq: audioConstants.NOTES.G5, start: 0.16, duration: audioConstants.TIMING.CORRECT_NOTE_DURATION },   // G5
                { freq: audioConstants.NOTES.C6, start: 0.24, duration: audioConstants.TIMING.CORRECT_FINAL_NOTE_DURATION }     // C6 (held longer)
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
                gain.gain.linearRampToValueAtTime(audioConstants.VOLUME.MAIN_GAIN, now + note.start + 0.02);
                gain.gain.exponentialRampToValueAtTime(audioConstants.VOLUME.ENVELOPE_START, now + note.start + note.duration);

                osc.start(now + note.start);
                osc.stop(now + note.start + note.duration);
            });

            // Add sparkle/shimmer effect with higher frequencies
            const sparkleNotes = [
                { freq: audioConstants.NOTES.E6, start: 0.3, duration: audioConstants.TIMING.CORRECT_SPARKLE_DURATION },    // E6
                { freq: audioConstants.NOTES.G6, start: 0.35, duration: audioConstants.TIMING.CORRECT_SPARKLE_DURATION },   // G6
                { freq: audioConstants.NOTES.C7, start: 0.4, duration: audioConstants.TIMING.CORRECT_FINAL_SPARKLE_DURATION }     // C7
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
                gain.gain.linearRampToValueAtTime(audioConstants.VOLUME.SPARKLE_GAIN, now + note.start + 0.01);
                gain.gain.exponentialRampToValueAtTime(audioConstants.VOLUME.ENVELOPE_START, now + note.start + note.duration);

                osc.start(now + note.start);
                osc.stop(now + note.start + note.duration);
            });
        });
    }

    playIncorrectSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        this.ensureAudioContextResumed().then(() => {
            const audioConstants = AUDIO_CONSTANTS || {
                NOTES: { C4: 261.63, G3: 196.00, F3: 174.61, A4: 440.00, B4: 493.88 },
                TIMING: { INCORRECT_MAIN_DURATION: 0.35, INCORRECT_BONK_DURATION: 0.08, INCORRECT_TRILL_DURATION: 0.07 },
                VOLUME: { WOBBLE_GAIN: 0.35, BONK_GAIN: 0.15, TRILL_GAIN: 0.1, ENVELOPE_START: 0.001 },
                EFFECTS: { WOBBLE_FREQUENCY: 8, WOBBLE_AMOUNT: 10, WOBBLE_ITERATIONS: 6, FREQUENCY_DESCENT_STEP: 3.5 }
            };

            // Playful "oops" sound with wobble and comedic timing
            const now = this.audioContext.currentTime;

            // Main "oops" tone - starts higher then drops with a wobble
            const mainOsc = this.audioContext.createOscillator();
            const mainGain = this.audioContext.createGain();

            mainOsc.connect(mainGain);
            mainGain.connect(this.audioContext.destination);

            mainOsc.type = 'sawtooth';

            // Frequency slide: C4 → G3 → F3 with wobble
            mainOsc.frequency.setValueAtTime(audioConstants.NOTES.C4, now);          // C4
            mainOsc.frequency.exponentialRampToValueAtTime(audioConstants.NOTES.G3, now + 0.1);  // G3
            mainOsc.frequency.exponentialRampToValueAtTime(audioConstants.NOTES.F3, now + audioConstants.TIMING.INCORRECT_MAIN_DURATION); // F3

            // Add wobble effect with LFO-like frequency modulation
            const wobbleFreq = audioConstants.EFFECTS.WOBBLE_FREQUENCY;
            const wobbleAmount = audioConstants.EFFECTS.WOBBLE_AMOUNT;
            for (let i = 0; i < audioConstants.EFFECTS.WOBBLE_ITERATIONS; i++) {
                const wobbleTime = now + 0.05 + (i * 0.04);
                const currentFreq = audioConstants.NOTES.G3 - (i * audioConstants.EFFECTS.FREQUENCY_DESCENT_STEP); // Gradually descending base frequency
                const wobbleOffset = Math.sin(i * Math.PI / 3) * wobbleAmount;
                mainOsc.frequency.setValueAtTime(currentFreq + wobbleOffset, wobbleTime);
            }

            // Envelope for main sound
            mainGain.gain.setValueAtTime(0, now);
            mainGain.gain.linearRampToValueAtTime(audioConstants.VOLUME.WOBBLE_GAIN, now + 0.02);
            mainGain.gain.exponentialRampToValueAtTime(0.2, now + 0.15);
            mainGain.gain.exponentialRampToValueAtTime(audioConstants.VOLUME.ENVELOPE_START, now + audioConstants.TIMING.INCORRECT_MAIN_DURATION);

            mainOsc.start(now);
            mainOsc.stop(now + audioConstants.TIMING.INCORRECT_MAIN_DURATION);

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
            bonkGain.gain.linearRampToValueAtTime(audioConstants.VOLUME.BONK_GAIN, now + 0.005);
            bonkGain.gain.exponentialRampToValueAtTime(audioConstants.VOLUME.ENVELOPE_START, now + audioConstants.TIMING.INCORRECT_BONK_DURATION);

            bonkOsc.start(now);
            bonkOsc.stop(now + audioConstants.TIMING.INCORRECT_BONK_DURATION);

            // Add a tiny "trill" at the end for comedic effect
            const trillOsc = this.audioContext.createOscillator();
            const trillGain = this.audioContext.createGain();

            trillOsc.connect(trillGain);
            trillGain.connect(this.audioContext.destination);

            trillOsc.type = 'sine';
            trillOsc.frequency.setValueAtTime(audioConstants.NOTES.A4, now + 0.25);
            trillOsc.frequency.setValueAtTime(audioConstants.NOTES.B4, now + 0.27); // B4
            trillOsc.frequency.setValueAtTime(audioConstants.NOTES.A4, now + 0.29);     // A4

            // Quick trill envelope
            trillGain.gain.setValueAtTime(0, now + 0.25);
            trillGain.gain.linearRampToValueAtTime(audioConstants.VOLUME.TRILL_GAIN, now + 0.26);
            trillGain.gain.exponentialRampToValueAtTime(audioConstants.VOLUME.ENVELOPE_START, now + 0.32);

            trillOsc.start(now + 0.25);
            trillOsc.stop(now + 0.32);
        });
    }

    playNewGameSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        this.ensureAudioContextResumed().then(() => {
            const audioConstants = AUDIO_CONSTANTS || {
                NOTES: { A4: 440 },
                TIMING: { NEW_GAME_DURATION: 0.3, NEW_GAME_SWEEP_MID: 0.15, ATTACK_TIME: 0.02, DECAY_TIME: 0.08 },
                VOLUME: { SPARKLE_GAIN: 0.2 }
            };

            const sound = this.createOscillatorWithEnvelope(
                audioConstants.NOTES.A4,
                'sine',
                audioConstants.TIMING.NEW_GAME_DURATION,
                audioConstants.TIMING.ATTACK_TIME,
                audioConstants.TIMING.DECAY_TIME
            );

            if (sound) {
                sound.gainNode.gain.setValueAtTime(audioConstants.VOLUME.SPARKLE_GAIN, this.audioContext.currentTime);

                const now = this.audioContext.currentTime;
                sound.oscillator.frequency.setValueAtTime(audioConstants.NOTES.A4, now);
                sound.oscillator.frequency.exponentialRampToValueAtTime(audioConstants.NOTES.A4 * 2, now + audioConstants.TIMING.NEW_GAME_SWEEP_MID); // 880
                sound.oscillator.frequency.exponentialRampToValueAtTime(660, now + audioConstants.TIMING.NEW_GAME_DURATION);

                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + audioConstants.TIMING.NEW_GAME_DURATION);
            }
        });
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NumberWallCore, SoundManager, CORRECT_MESSAGES, INCORRECT_MESSAGES };
}