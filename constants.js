// Global constants for Number Walls game
// This file contains all magic numbers and shared constants across the application

// Game Rules and Limits
const GAME_CONSTANTS = {
    // Number generation and validation
    MIN_NUMBER: 0,
    MAX_NUMBER: 20,

    // Weighted random generation
    RANDOM_WEIGHT_TOTAL: 81,
    ZERO_WEIGHT: 1,
    NON_ZERO_WEIGHT: 4,

    // Input validation
    MAX_INPUT_LENGTH: 2,
    TWO_DIGIT_MIN: 10,
    TWO_DIGIT_MAX: 20,

    // Security and performance limits
    MAX_GENERATION_ATTEMPTS: 100,
    MAX_FIELD_SELECTION_ATTEMPTS: 100,

    // Timing (in milliseconds)
    FEEDBACK_DISPLAY_DURATION: 2000,
    TWO_DIGIT_INPUT_TIMEOUT: 2500,
    FLASH_ANIMATION_DURATION: 2000,

    // Game layout
    HIDDEN_FIELDS_COUNT: 3,
    TOTAL_FIELDS_COUNT: 6,

    // Fallback values for security (when generation fails)
    FALLBACK_VALUES: {
        a: 1,
        b: 1,
        c: 1,
        d: 2,
        e: 2,
        f: 4
    }
};

// Audio Constants (frequencies in Hz, durations in seconds)
const AUDIO_CONSTANTS = {
    // Musical notes (frequencies in Hz)
    NOTES: {
        C4: 261.63,
        G3: 196.00,
        F3: 174.61,
        A4: 440.00,
        B4: 493.88,
        C5: 523.25,
        E5: 659.25,
        G5: 783.99,
        C6: 1046.5,
        E6: 1318.5,
        G6: 1568.0,
        C7: 2093.0
    },

    // Sound timing (in seconds)
    TIMING: {
        ATTACK_TIME: 0.02,
        DECAY_TIME: 0.08,
        SHORT_ATTACK: 0.01,
        QUICK_ENVELOPE: 0.005,

        // Correct sound timing
        CORRECT_NOTE_DURATION: 0.15,
        CORRECT_FINAL_NOTE_DURATION: 0.3,
        CORRECT_SPARKLE_DURATION: 0.08,
        CORRECT_FINAL_SPARKLE_DURATION: 0.12,

        // Incorrect sound timing
        INCORRECT_MAIN_DURATION: 0.35,
        INCORRECT_BONK_DURATION: 0.08,
        INCORRECT_TRILL_DURATION: 0.07,

        // New game sound timing
        NEW_GAME_DURATION: 0.3,
        NEW_GAME_SWEEP_MID: 0.15
    },

    // Volume levels
    VOLUME: {
        MAIN_GAIN: 0.4,
        SPARKLE_GAIN: 0.2,
        BONK_GAIN: 0.15,
        TRILL_GAIN: 0.1,
        SUSTAIN_LEVEL: 0.3,
        ENVELOPE_START: 0.001,
        WOBBLE_GAIN: 0.35
    },

    // Effect parameters
    EFFECTS: {
        WOBBLE_FREQUENCY: 8,
        WOBBLE_AMOUNT: 10,
        WOBBLE_ITERATIONS: 6,
        FREQUENCY_DESCENT_STEP: 3.5
    }
};

// Animation Class Names
const ANIMATION_CONSTANTS = {
    CORRECT_ANIMATIONS: [
        'message-bounce-in',
        'message-zoom-celebration',
        'message-slide-sparkle',
        'message-pulse-glow',
        'message-flip-tada'
    ],

    INCORRECT_ANIMATIONS: [
        'message-shake-fade',
        'message-wobble-in',
        'message-slide-gentle',
        'message-pulse-soft'
    ],

    INPUT_FLASH_ANIMATIONS: {
        CORRECT: 'flash-correct',
        INCORRECT: 'flash-incorrect'
    }
};

// Test Constants
const TEST_CONSTANTS = {
    // Statistical testing
    WEIGHTED_RANDOM_SAMPLE_SIZE: 2100,
    STATISTICAL_THRESHOLD: 0.7, // 0 should appear at most 70% of average frequency

    // Performance testing
    GENERATION_TEST_ITERATIONS: 50,
    WALL_RELATIONSHIP_TEST_ITERATIONS: 20,
    FORBIDDEN_COMBINATION_TEST_ITERATIONS: 100,
    RANDOM_NUMBER_TEST_ITERATIONS: 100,

    // Message diversity testing
    MESSAGE_DIVERSITY_ITERATIONS: 50,
    ANIMATION_DIVERSITY_ITERATIONS: 30,
    MIN_EXPECTED_DIVERSITY: 2
};

// Field Names and Game Structure
const FIELD_CONSTANTS = {
    ALL_FIELDS: ['a', 'b', 'c', 'd', 'e', 'f'],

    FORBIDDEN_COMBINATIONS: [
        ['b', 'd', 'e'],  // Never hide B, D, and E together
        ['a', 'd', 'f'],  // Never hide A, D, and F together
        ['c', 'e', 'f']   // Never hide C, E, and F together
    ],

    SAFE_FALLBACK_COMBINATION: ['a', 'b', 'c']
};

// Localization Constants (moved from inline arrays)
const LOCALIZATION_CONSTANTS = {
    CORRECT_MESSAGES: [
        'Gut', 'Super', 'Toll', 'Prima', 'Klasse', 'Genau', 'Spitze',
        'Wunderbar', 'Fantastisch', 'Ausgezeichnet', 'Cool', 'Stark',
        'Mega', 'Stimmt genau', 'Bingo', 'Das ist es', 'Bravo', 'Juhu', 'Yay'
    ],

    INCORRECT_MESSAGES: [
        'Nee', 'Achwas', 'Stimmt nicht', 'Nicht ganz', 'Schau genauer hin',
        'Auweia', 'Huch', 'Oje', 'Nö', 'Schade', 'Quatsch', 'Nix da',
        'Oha', 'Ups', 'So nicht', 'Anders'
    ],

    WELCOME_MESSAGE: 'Los geht\'s!',
    SOUND_TOGGLE_TOOLTIP: 'Sound ein/aus'
};

// Browser/Platform Constants
const PLATFORM_CONSTANTS = {
    SOUND_ICONS: {
        ON: '🔊',
        OFF: '🔇'
    },

    CSS_CLASSES: {
        SOUND_ON: 'sound-on',
        SOUND_OFF: 'sound-off',
        MESSAGE_BASE: 'message'
    }
};

// Browser environment - make constants globally available
if (typeof window !== 'undefined') {
    window.GAME_CONSTANTS = GAME_CONSTANTS;
    window.AUDIO_CONSTANTS = AUDIO_CONSTANTS;
    window.ANIMATION_CONSTANTS = ANIMATION_CONSTANTS;
    window.TEST_CONSTANTS = TEST_CONSTANTS;
    window.FIELD_CONSTANTS = FIELD_CONSTANTS;
    window.LOCALIZATION_CONSTANTS = LOCALIZATION_CONSTANTS;
    window.PLATFORM_CONSTANTS = PLATFORM_CONSTANTS;
}

// Node.js environment - export for require()
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONSTANTS,
        AUDIO_CONSTANTS,
        ANIMATION_CONSTANTS,
        TEST_CONSTANTS,
        FIELD_CONSTANTS,
        LOCALIZATION_CONSTANTS,
        PLATFORM_CONSTANTS
    };
}