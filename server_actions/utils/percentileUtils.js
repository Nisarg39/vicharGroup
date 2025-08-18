/**
 * Utility functions for safe percentile handling across the application
 * Prevents "toFixed is not a function" errors by ensuring type safety
 */

/**
 * Safely converts a value to a number with bounds checking
 * @param {any} value - The value to convert
 * @param {number} defaultValue - Default value if conversion fails
 * @param {number|null} min - Minimum allowed value
 * @param {number|null} max - Maximum allowed value
 * @returns {number} Safe numeric value
 */
export const safeNumber = (value, defaultValue = 0, min = null, max = null) => {
    // Handle already formatted strings like "85.5th"
    if (typeof value === 'string' && value.includes('th')) {
        const numericPart = parseFloat(value.replace('th', ''))
        if (!isNaN(numericPart) && isFinite(numericPart)) {
            value = numericPart
        }
    }
    
    let num = parseFloat(value)
    if (isNaN(num) || !isFinite(num)) {
        num = defaultValue
    }
    if (min !== null && num < min) num = min
    if (max !== null && num > max) num = max
    return num
}

/**
 * Safely formats a percentile value with proper error handling
 * @param {any} percentile - The percentile value to format
 * @param {number} decimalPlaces - Number of decimal places (default: 1)
 * @returns {string} Formatted percentile string or '-' for invalid values
 */
export const formatPercentile = (percentile, decimalPlaces = 1) => {
    if (percentile === null || percentile === undefined) {
        return '-'
    }
    
    // If already a formatted string, return as is
    if (typeof percentile === 'string' && percentile.includes('th')) {
        return percentile
    }
    
    // Convert to safe number and format
    const safePercentileValue = safeNumber(percentile, 0, 0, 100)
    return safePercentileValue.toFixed(decimalPlaces) + 'th'
}

/**
 * Validates if a percentile value is valid for calculations
 * @param {any} percentile - The percentile value to validate
 * @returns {boolean} True if valid for calculations
 */
export const isValidPercentile = (percentile) => {
    if (percentile === null || percentile === undefined) {
        return false
    }
    
    const num = safeNumber(percentile, NaN)
    return !isNaN(num) && isFinite(num) && num >= 0 && num <= 100
}

/**
 * Gets the numeric value from a percentile (strips 'th' suffix if present)
 * @param {any} percentile - The percentile value
 * @returns {number} Numeric percentile value
 */
export const getPercentileNumber = (percentile) => {
    return safeNumber(percentile, 0, 0, 100)
}

/**
 * Bulk format multiple percentile values
 * @param {Array} percentiles - Array of percentile values
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {Array} Array of formatted percentile strings
 */
export const formatPercentiles = (percentiles, decimalPlaces = 1) => {
    if (!Array.isArray(percentiles)) {
        return []
    }
    
    return percentiles.map(p => formatPercentile(p, decimalPlaces))
}

// Test cases for validation
export const testPercentileUtils = () => {
    const testCases = [
        { input: null, expected: '-' },
        { input: undefined, expected: '-' },
        { input: 85.5, expected: '85.5th' },
        { input: '85.5', expected: '85.5th' },
        { input: '85.5th', expected: '85.5th' },
        { input: NaN, expected: '-' },
        { input: -10, expected: '0.0th' },
        { input: 150, expected: '100.0th' },
        { input: 'invalid', expected: '0.0th' },
        { input: 0, expected: '0.0th' },
        { input: 100, expected: '100.0th' }
    ]
    
    console.log('Testing percentile formatting utilities:')
    testCases.forEach(({ input, expected }, index) => {
        const result = formatPercentile(input)
        const passed = result === expected
        console.log(`Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'} - Input: ${input}, Expected: ${expected}, Got: ${result}`)
    })
}