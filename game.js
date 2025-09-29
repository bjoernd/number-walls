// Helper function to get constants (same as in game-core.js)
function getConstants() {
    const globalScope = (typeof window !== 'undefined') ? window : global;
    return {
        GAME_CONSTANTS: globalScope.GAME_CONSTANTS,
        AUDIO_CONSTANTS: globalScope.AUDIO_CONSTANTS,
        ANIMATION_CONSTANTS: globalScope.ANIMATION_CONSTANTS,
        FIELD_CONSTANTS: globalScope.FIELD_CONSTANTS,
        LOCALIZATION_CONSTANTS: globalScope.LOCALIZATION_CONSTANTS,
        PLATFORM_CONSTANTS: globalScope.PLATFORM_CONSTANTS
    };
}

class NumberWall extends NumberWallCore {
    constructor() {
        super();
        this.gameActive = false;
        this.validationTimeout = null;
        this.soundManager = new SoundManager();

        // Initialize current maximum limit
        const { GAME_CONSTANTS } = getConstants();
        this.currentMaximum = GAME_CONSTANTS?.DEFAULT_MAXIMUM || 20;

        this.initializeElements();
        this.setupEventListeners();
        this.updateInputMaxLengths(); // Set initial maxlength based on default maximum
    }

    initializeElements() {
        this.message = document.getElementById('message');
        this.rightScoreElement = document.getElementById('right-score');
        this.wrongScoreElement = document.getElementById('wrong-score');
        this.soundToggle = document.getElementById('sound-toggle');
        this.maxLimitInput = document.getElementById('max-limit');
        this.maxLimitLabel = document.getElementById('max-limit-label');
        this.inputs = {
            a: document.getElementById('a'),
            b: document.getElementById('b'),
            c: document.getElementById('c'),
            d: document.getElementById('d'),
            e: document.getElementById('e'),
            f: document.getElementById('f')
        };

        // Set UI text from constants
        this.setupUIText();

        // Validate we have the expected number of fields
        this.validateFieldCount();
    }

    setupUIText() {
        const { LOCALIZATION_CONSTANTS } = getConstants();
        const rangeUIText = LOCALIZATION_CONSTANTS?.RANGE_UI_TEXT || {
            LABEL: 'Zahlen bis:',
            PLACEHOLDER: '20'
        };

        // Set label text
        if (this.maxLimitLabel) {
            this.maxLimitLabel.textContent = rangeUIText.LABEL;
        }

        // Set placeholder text
        if (this.maxLimitInput) {
            this.maxLimitInput.placeholder = rangeUIText.PLACEHOLDER;
        }
    }

    validateFieldCount() {
        const { GAME_CONSTANTS } = getConstants();
        const expectedCount = GAME_CONSTANTS?.TOTAL_FIELDS_COUNT || 6;
        const actualCount = Object.keys(this.inputs).length;

        if (actualCount !== expectedCount) {
            console.warn(`Expected ${expectedCount} input fields, but found ${actualCount}. Game may not function correctly.`);
        }
    }

    setupEventListeners() {
        // Add input validation to only allow numeric characters
        Object.keys(this.inputs).forEach(fieldName => {
            const input = this.inputs[fieldName];

            input.addEventListener('input', (e) => {
                const { GAME_CONSTANTS } = getConstants();
                const maxLength = GAME_CONSTANTS?.MAX_INPUT_LENGTH || 2;
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > maxLength) value = value.slice(0, maxLength);
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

        // Add max limit input event listener
        if (this.maxLimitInput) {
            this.maxLimitInput.addEventListener('input', (e) => {
                this.handleMaxLimitChange(e.target.value);
            });

            this.maxLimitInput.addEventListener('blur', (e) => {
                this.validateMaxLimitInput(e.target.value);
            });
        }
    }

    toggleSound() {
        const currentState = this.soundManager.isSoundEnabled();
        const newState = !currentState;

        this.soundManager.setSoundEnabled(newState);

        // Update button appearance and content
        const { PLATFORM_CONSTANTS, LOCALIZATION_CONSTANTS } = getConstants();
        const soundIcons = PLATFORM_CONSTANTS?.SOUND_ICONS || { ON: '🔊', OFF: '🔇' };
        const cssClasses = PLATFORM_CONSTANTS?.CSS_CLASSES || { SOUND_ON: 'sound-on', SOUND_OFF: 'sound-off' };
        const tooltip = LOCALIZATION_CONSTANTS?.SOUND_TOGGLE_TOOLTIP || 'Sound ein/aus';

        if (newState) {
            this.soundToggle.textContent = soundIcons.ON;
            this.soundToggle.classList.remove(cssClasses.SOUND_OFF);
            this.soundToggle.classList.add(cssClasses.SOUND_ON);
            this.soundToggle.title = tooltip;
        } else {
            this.soundToggle.textContent = soundIcons.OFF;
            this.soundToggle.classList.remove(cssClasses.SOUND_ON);
            this.soundToggle.classList.add(cssClasses.SOUND_OFF);
            this.soundToggle.title = tooltip;
        }
    }

    handleMaxLimitChange(value) {
        // Filter out non-numeric characters during typing
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue !== value) {
            this.maxLimitInput.value = numericValue;
        }
    }

    validateMaxLimitInput(value) {
        const { GAME_CONSTANTS, LOCALIZATION_CONSTANTS } = getConstants();
        const constants = GAME_CONSTANTS || {
            MIN_CUSTOM_MAXIMUM: 20,
            MAX_CUSTOM_MAXIMUM: 1000,
            DEFAULT_MAXIMUM: 20
        };
        const messages = LOCALIZATION_CONSTANTS?.RANGE_ERROR_MESSAGES || {
            INVALID_NUMBER: 'Bitte gib eine gültige Zahl ein',
            TOO_LOW: 'Minimum ist 20',
            TOO_HIGH: 'Maximum ist 1000',
            EMPTY_INPUT: 'Bitte gib eine Zahl ein'
        };

        // Handle empty input
        if (!value || value.trim() === '') {
            this.showRangeError(messages.EMPTY_INPUT);
            this.maxLimitInput.value = this.currentMaximum.toString();
            return;
        }

        const numericValue = parseInt(value);

        // Validate numeric input
        if (isNaN(numericValue)) {
            this.showRangeError(messages.INVALID_NUMBER);
            this.maxLimitInput.value = this.currentMaximum.toString();
            return;
        }

        // Validate range
        if (numericValue < constants.MIN_CUSTOM_MAXIMUM) {
            this.showRangeError(messages.TOO_LOW);
            this.maxLimitInput.value = this.currentMaximum.toString();
            return;
        }

        if (numericValue > constants.MAX_CUSTOM_MAXIMUM) {
            this.showRangeError(messages.TOO_HIGH);
            this.maxLimitInput.value = this.currentMaximum.toString();
            return;
        }

        // Valid input - update current maximum
        this.currentMaximum = numericValue;
        this.maxLimitInput.value = numericValue.toString();
        this.updateInputMaxLengths(); // Update maxlength for new maximum
    }

    showRangeError(message) {
        // Temporarily show error message in the outcome container
        const originalMessage = this.message.textContent;
        const originalClass = this.message.className;

        this.message.textContent = message;
        this.message.className = 'message message-shake-fade';

        // Restore original message after a short delay
        setTimeout(() => {
            this.message.textContent = originalMessage;
            this.message.className = originalClass;
        }, 2000);
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
            const currentLength = value.length;
            const maxDigits = this.getMaxDigitsForField(fieldName);

            // If this field is at maximum possible digits, validate immediately
            if (currentLength >= maxDigits) {
                this.checkAnswers();
                return;
            }

            // Check if field could have more digits than currently entered
            const canHaveMoreDigits = this.canFieldHaveMoreDigits(fieldName, currentLength);

            if (!canHaveMoreDigits) {
                // No valid values with more digits, validate immediately
                this.checkAnswers();
            } else {
                // More digits possible, wait with dynamic timeout
                const timeout = this.getValidationTimeout(currentLength, maxDigits);
                this.validationTimeout = setTimeout(() => {
                    this.checkAnswers();
                    this.validationTimeout = null;
                }, timeout);
            }
        }
    }

    // Multi-digit validation timing methods

    getMaxDigitsForField(fieldName) {
        // Determine maximum possible digits for this field based on current maximum
        const maxPossibleValue = this.currentMaximum || 20;
        return maxPossibleValue.toString().length;
    }

    canFieldHaveMoreDigits(fieldName, currentLength) {
        // Check if field could have more digits than currently entered
        const maxDigits = this.getMaxDigitsForField(fieldName);

        if (currentLength >= maxDigits) {
            return false; // Already at maximum possible digits
        }

        // Get current state for testing, excluding the field being checked
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

        // Test if any values with more digits work
        // For efficiency, calculate the mathematically required value instead of brute force
        const { a, b, c, d, e, f } = currentValues;
        let requiredValue = null;

        // Calculate what this field should be based on mathematical relationships
        if (fieldName === 'd' && a !== null && b !== null) {
            requiredValue = a + b; // A + B = D
        } else if (fieldName === 'e' && b !== null && c !== null) {
            requiredValue = b + c; // B + C = E
        } else if (fieldName === 'f' && d !== null && e !== null) {
            requiredValue = d + e; // D + E = F
        } else if (fieldName === 'a' && b !== null && d !== null) {
            requiredValue = d - b; // A = D - B
        } else if (fieldName === 'b' && a !== null && d !== null) {
            requiredValue = d - a; // B = D - A
        } else if (fieldName === 'b' && c !== null && e !== null) {
            requiredValue = e - c; // B = E - C
        } else if (fieldName === 'c' && b !== null && e !== null) {
            requiredValue = e - b; // C = E - B
        }

        // If we can calculate the exact required value, check if it has more digits
        if (requiredValue !== null && requiredValue >= Math.pow(10, currentLength) && requiredValue <= (this.currentMaximum || 20)) {
            return true; // Required value has more digits and is in range
        }

        // Fallback: test digit levels if exact calculation isn't possible
        const minValue = Math.pow(10, currentLength); // 10, 100, 1000, etc.
        const maxValue = this.currentMaximum || 20;

        // Test a sampling of values rather than all values for performance
        const testSample = Math.min(50, maxValue - minValue + 1); // Test up to 50 values
        const step = Math.max(1, Math.floor((maxValue - minValue) / testSample));

        for (let testValue = minValue; testValue <= maxValue; testValue += step) {
            currentValues[fieldName] = testValue;
            if (this.isValidPartialWall(currentValues)) {
                return true; // Found a valid value with more digits
            }
        }

        return false; // No valid values with more digits
    }

    getValidationTimeout(currentLength, maxDigits) {
        // Calculate dynamic timeout based on remaining possible digits
        const remainingDigits = maxDigits - currentLength;

        if (remainingDigits <= 0) {
            return 0; // Validate immediately
        }

        const { GAME_CONSTANTS } = getConstants();
        const timeoutPerDigit = GAME_CONSTANTS?.DIGIT_INPUT_TIMEOUT || 1000;

        // Cap maximum timeout at reasonable limit
        const maxTimeout = GAME_CONSTANTS?.TWO_DIGIT_INPUT_TIMEOUT || 2500;
        const calculatedTimeout = remainingDigits * timeoutPerDigit;

        return Math.min(calculatedTimeout, maxTimeout);
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
        const { GAME_CONSTANTS } = getConstants();
        const minNumber = GAME_CONSTANTS?.MIN_NUMBER || 0;
        const maxNumber = this.currentMaximum || GAME_CONSTANTS?.DEFAULT_MAXIMUM || 20;
        for (const value of Object.values(values)) {
            if (value !== null && (value < minNumber || value > maxNumber)) {
                return false;
            }
        }

        return true;
    }

    updateInputMaxLengths() {
        // Update maxlength attribute based on current maximum value
        const maxDigits = this.getMaxDigitsForField('a'); // All fields have same max digits
        Object.keys(this.inputs).forEach(field => {
            this.inputs[field].setAttribute('maxlength', maxDigits.toString());
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
        this.generateWall(0, this.currentMaximum);
        this.selectHiddenFields();
        this.updateInputMaxLengths(); // Update maxlength based on current maximum
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

            // Get flash animation constants
            const { GAME_CONSTANTS, ANIMATION_CONSTANTS } = getConstants();
            const flashAnimations = ANIMATION_CONSTANTS?.INPUT_FLASH_ANIMATIONS || {
                CORRECT: 'flash-correct',
                INCORRECT: 'flash-incorrect'
            };

            // Remove any existing animation classes
            input.classList.remove(flashAnimations.CORRECT, flashAnimations.INCORRECT);

            // Add appropriate animation class
            if (isCorrect) {
                input.classList.add(flashAnimations.CORRECT);
            } else {
                input.classList.add(flashAnimations.INCORRECT);
            }

            // Remove the animation class after animation completes
            const animationDuration = GAME_CONSTANTS?.FLASH_ANIMATION_DURATION || 2000;
            setTimeout(() => {
                input.classList.remove(flashAnimations.CORRECT, flashAnimations.INCORRECT);
            }, animationDuration);
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
        const { PLATFORM_CONSTANTS } = getConstants();
        const baseMessageClass = PLATFORM_CONSTANTS?.CSS_CLASSES?.MESSAGE_BASE || 'message';
        this.message.className = baseMessageClass;
        this.message.textContent = '';

        // Set new message text
        this.message.textContent = allCorrect ? this.getRandomCorrectMessage() : this.getRandomIncorrectMessage();

        // Apply random animation
        const animationClass = allCorrect ? this.getRandomCorrectAnimation() : this.getRandomIncorrectAnimation();
        this.message.classList.add(animationClass);

        // Update score display
        this.updateScoreDisplay();

        this.gameActive = false;

        // Auto-start new game after feedback display duration
        const { GAME_CONSTANTS } = getConstants();
        const feedbackDuration = GAME_CONSTANTS?.FEEDBACK_DISPLAY_DURATION || 2000;
        setTimeout(() => {
            this.soundManager.playNewGameSound();
            this.startGame();
        }, feedbackDuration);
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
    const { LOCALIZATION_CONSTANTS, PLATFORM_CONSTANTS } = getConstants();
    const welcomeMessage = LOCALIZATION_CONSTANTS?.WELCOME_MESSAGE || 'Los geht\'s!';
    const baseMessageClass = PLATFORM_CONSTANTS?.CSS_CLASSES?.MESSAGE_BASE || 'message';
    game.message.textContent = welcomeMessage;
    game.message.className = baseMessageClass;
    game.startGame();
});