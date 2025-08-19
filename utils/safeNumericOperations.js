/**
 * Safe Numeric Operations Utility
 * Provides safe mathematical operations with proper error handling and validation
 * to prevent division by zero, NaN values, and other numerical errors
 */

/**
 * Safely divides two numbers with fallback value
 * @param {number} numerator - The dividend
 * @param {number} denominator - The divisor
 * @param {number} fallback - Fallback value when division is invalid (default: 0)
 * @returns {number} - The result of division or fallback value
 */
export function safeDivide(numerator, denominator, fallback = 0) {
    // Convert to numbers and validate
    const num = parseFloat(numerator);
    const den = parseFloat(denominator);
    
    // Check for invalid inputs
    if (isNaN(num) || isNaN(den) || den === 0) {
        return fallback;
    }
    
    const result = num / den;
    return isFinite(result) ? result : fallback;
}

/**
 * Safely calculates percentage with rounding
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Percentage value
 */
export function safePercentage(part, total, decimals = 2, fallback = 0) {
    const percentage = safeDivide(part, total, fallback / 100) * 100;
    return safeRound(percentage, decimals);
}

/**
 * Safely rounds a number to specified decimal places
 * @param {number} value - Number to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} - Rounded number
 */
export function safeRound(value, decimals = 2) {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) {
        return 0;
    }
    
    const multiplier = Math.pow(10, decimals);
    return Math.round(num * multiplier) / multiplier;
}

/**
 * Safely parses a value to number with fallback
 * @param {any} value - Value to parse
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Parsed number or fallback
 */
export function safeParseNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    
    const num = parseFloat(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
}

/**
 * Safely calculates average of an array
 * @param {number[]} values - Array of numbers
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Average value
 */
export function safeAverage(values, fallback = 0) {
    if (!Array.isArray(values) || values.length === 0) {
        return fallback;
    }
    
    const validValues = values.filter(v => {
        const num = parseFloat(v);
        return !isNaN(num) && isFinite(num);
    }).map(v => parseFloat(v));
    
    if (validValues.length === 0) {
        return fallback;
    }
    
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return safeDivide(sum, validValues.length, fallback);
}

/**
 * Safely calculates sum of an array
 * @param {number[]} values - Array of numbers
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Sum value
 */
export function safeSum(values, fallback = 0) {
    if (!Array.isArray(values) || values.length === 0) {
        return fallback;
    }
    
    const validValues = values.filter(v => {
        const num = parseFloat(v);
        return !isNaN(num) && isFinite(num);
    }).map(v => parseFloat(v));
    
    if (validValues.length === 0) {
        return fallback;
    }
    
    return validValues.reduce((acc, val) => acc + val, 0);
}

/**
 * Safely finds maximum value in array
 * @param {number[]} values - Array of numbers
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Maximum value
 */
export function safeMax(values, fallback = 0) {
    if (!Array.isArray(values) || values.length === 0) {
        return fallback;
    }
    
    const validValues = values.filter(v => {
        const num = parseFloat(v);
        return !isNaN(num) && isFinite(num);
    }).map(v => parseFloat(v));
    
    if (validValues.length === 0) {
        return fallback;
    }
    
    return Math.max(...validValues);
}

/**
 * Safely finds minimum value in array
 * @param {number[]} values - Array of numbers
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Minimum value
 */
export function safeMin(values, fallback = 0) {
    if (!Array.isArray(values) || values.length === 0) {
        return fallback;
    }
    
    const validValues = values.filter(v => {
        const num = parseFloat(v);
        return !isNaN(num) && isFinite(num);
    }).map(v => parseFloat(v));
    
    if (validValues.length === 0) {
        return fallback;
    }
    
    return Math.min(...validValues);
}

/**
 * Safely calculates variance
 * @param {number[]} values - Array of numbers
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Variance value
 */
export function safeVariance(values, fallback = 0) {
    if (!Array.isArray(values) || values.length === 0) {
        return fallback;
    }
    
    const validValues = values.filter(v => {
        const num = parseFloat(v);
        return !isNaN(num) && isFinite(num);
    }).map(v => parseFloat(v));
    
    if (validValues.length === 0) {
        return fallback;
    }
    
    const mean = safeAverage(validValues);
    const squaredDiffs = validValues.map(value => Math.pow(value - mean, 2));
    return safeAverage(squaredDiffs, fallback);
}

/**
 * Safely calculates standard deviation
 * @param {number[]} values - Array of numbers
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} - Standard deviation value
 */
export function safeStandardDeviation(values, fallback = 0) {
    const variance = safeVariance(values, 0);
    if (variance === 0) {
        return fallback;
    }
    return Math.sqrt(variance);
}

/**
 * Safely reduces an array with accumulator validation
 * @param {any[]} array - Array to reduce
 * @param {Function} reducer - Reducer function
 * @param {any} initialValue - Initial value
 * @param {any} fallback - Fallback value if array is empty
 * @returns {any} - Reduced value or fallback
 */
export function safeReduce(array, reducer, initialValue, fallback = null) {
    if (!Array.isArray(array) || array.length === 0) {
        return fallback;
    }
    
    try {
        return array.reduce(reducer, initialValue);
    } catch (error) {
        console.error('Error in safe reduce operation:', error);
        return fallback;
    }
}

/**
 * Validates if a value is a safe number for calculations
 * @param {any} value - Value to validate
 * @returns {boolean} - True if value is a safe number
 */
export function isSafeNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * Clamps a number between min and max values
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export function clamp(value, min, max) {
    const num = safeParseNumber(value, min);
    return Math.max(min, Math.min(max, num));
}

/**
 * Standardized percentage calculation for the entire application
 * @param {number} score - Score achieved
 * @param {number} total - Total possible score
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {number} - Standardized percentage
 */
export function standardPercentage(score, total, decimals = 1) {
    if (!isSafeNumber(score) || !isSafeNumber(total) || total <= 0) {
        return 0;
    }
    
    const percentage = (parseFloat(score) / parseFloat(total)) * 100;
    return clamp(safeRound(percentage, decimals), 0, 100);
}

/**
 * Time formatting utility for consistent display
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export function safeFormatTime(seconds) {
    const safeSeconds = safeParseNumber(seconds, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = Math.floor(safeSeconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Default export with all functions
 */
export default {
    safeDivide,
    safePercentage,
    safeRound,
    safeParseNumber,
    safeAverage,
    safeSum,
    safeMax,
    safeMin,
    safeVariance,
    safeStandardDeviation,
    safeReduce,
    isSafeNumber,
    clamp,
    standardPercentage,
    safeFormatTime
};