/**
 * Decimal Answer Evaluator
 * 
 * Provides tolerance-based numerical comparison for Section B questions
 * while maintaining backward compatibility with existing MCQ and text-based questions.
 */

/**
 * Checks if a string represents a purely numerical value
 * @param {string} answer - The answer to check
 * @returns {boolean} - True if the answer is purely numerical
 */
function isPurelyNumerical(answer) {
  if (!answer || typeof answer !== 'string') {
    return false;
  }
  
  const trimmed = answer.trim();
  
  // Empty string is not numerical
  if (!trimmed) {
    return false;
  }
  
  // Check for scientific notation (e.g., 1.23e-2, 5E+3)
  const scientificNotationRegex = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
  
  // Check for regular decimal numbers (including leading decimal point)
  const decimalRegex = /^[-+]?(\d+\.?\d*|\.\d+)$/;
  
  return scientificNotationRegex.test(trimmed) || decimalRegex.test(trimmed);
}

/**
 * Normalizes a numerical value to a standard format
 * @param {string} value - The numerical string to normalize
 * @returns {number|null} - The normalized number or null if invalid
 */
function normalizeNumericalValue(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  try {
    const trimmed = value.trim();
    
    // Handle empty string
    if (!trimmed) {
      return null;
    }
    
    // Parse the number (handles scientific notation automatically)
    const parsed = parseFloat(trimmed);
    
    // Check if parsing was successful and result is finite
    if (isNaN(parsed) || !isFinite(parsed)) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.warn('Error normalizing numerical value:', value, error);
    return null;
  }
}

/**
 * Compares two numerical answers using tolerance-based evaluation
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The correct answer
 * @param {Object} config - Evaluation configuration
 * @returns {boolean} - True if answers match within tolerance
 */
function compareNumericalAnswers(userAnswer, correctAnswer, config) {
  try {
    const userValue = normalizeNumericalValue(userAnswer);
    const correctValue = normalizeNumericalValue(correctAnswer);
    
    // If either value couldn't be parsed, fall back to string comparison
    if (userValue === null || correctValue === null) {
      return false;
    }
    
    // Handle exact matches (including zero values)
    if (userValue === correctValue) {
      return true;
    }
    
    // Handle zero tolerance case
    if (config.tolerance === 0) {
      return userValue === correctValue;
    }
    
    // Calculate tolerance based on configuration
    let tolerance;
    
    if (config.toleranceType === 'absolute') {
      tolerance = config.tolerance;
    } else if (config.toleranceType === 'percentage') {
      // Percentage tolerance relative to correct answer
      tolerance = Math.abs(correctValue) * (config.tolerance / 100);
    } else {
      // Default to absolute tolerance
      tolerance = config.tolerance;
    }
    
    // Handle the case where correct answer is zero
    if (correctValue === 0) {
      return Math.abs(userValue) <= tolerance;
    }
    
    // Check if difference is within tolerance
    const difference = Math.abs(userValue - correctValue);
    return difference <= tolerance;
    
  } catch (error) {
    console.error('Error comparing numerical answers:', error);
    return false;
  }
}

/**
 * Main evaluation function for answers
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The correct answer
 * @param {Object} question - Question object containing type and other metadata
 * @param {Object} config - Evaluation configuration
 * @returns {Object} - Evaluation result with match status and details
 */
function evaluateAnswer(userAnswer, correctAnswer, question, config) {
  try {
    // Initialize result object
    const result = {
      isMatch: false,
      evaluationType: 'string',
      details: {
        userValue: userAnswer,
        correctValue: correctAnswer,
        tolerance: null,
        difference: null
      }
    };
    
    // Handle null or undefined answers
    if (!userAnswer || !correctAnswer) {
      return result;
    }
    
    // Convert to strings for consistency
    const userStr = String(userAnswer).trim();
    const correctStr = String(correctAnswer).trim();
    
    // Handle empty answers
    if (!userStr || !correctStr) {
      return result;
    }
    
    // For MCQ questions or non-numerical questions, use exact string comparison
    if (question.type === 'mcq' || question.questionType === 'mcq') {
      result.isMatch = userStr.toLowerCase() === correctStr.toLowerCase();
      result.evaluationType = 'mcq';
      return result;
    }
    
    // Check if both answers are numerical
    const isUserNumerical = isPurelyNumerical(userStr);
    const isCorrectNumerical = isPurelyNumerical(correctStr);
    
    // If both are numerical, use tolerance-based comparison
    if (isUserNumerical && isCorrectNumerical) {
      const userValue = normalizeNumericalValue(userStr);
      const correctValue = normalizeNumericalValue(correctStr);
      
      if (userValue !== null && correctValue !== null) {
        result.evaluationType = 'numerical';
        result.details.userValue = userValue;
        result.details.correctValue = correctValue;
        result.details.tolerance = config.tolerance;
        result.details.difference = Math.abs(userValue - correctValue);
        
        result.isMatch = compareNumericalAnswers(userStr, correctStr, config);
        return result;
      }
    }
    
    // Fall back to normalized string comparison
    result.evaluationType = 'string';
    result.isMatch = userStr.toLowerCase() === correctStr.toLowerCase();
    
    return result;
    
  } catch (error) {
    console.error('Error in evaluateAnswer:', error);
    
    // Return safe fallback result
    return {
      isMatch: false,
      evaluationType: 'error',
      details: {
        error: error.message,
        userValue: userAnswer,
        correctValue: correctAnswer
      }
    };
  }
}

/**
 * Utility function to format numerical value for display
 * @param {number} value - The numerical value
 * @param {number} precision - Number of decimal places
 * @returns {string} - Formatted value
 */
function formatNumericalValue(value, precision = 6) {
  if (typeof value !== 'number' || !isFinite(value)) {
    return String(value);
  }
  
  // Remove trailing zeros and unnecessary decimal points
  return parseFloat(value.toFixed(precision)).toString();
}

/**
 * Validates evaluation configuration
 * @param {Object} config - Configuration to validate
 * @returns {boolean} - True if configuration is valid
 */
function validateEvaluationConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  // Check required properties
  if (typeof config.tolerance !== 'number' || config.tolerance < 0) {
    return false;
  }
  
  // Check tolerance type
  const validToleranceTypes = ['absolute', 'percentage'];
  if (config.toleranceType && !validToleranceTypes.includes(config.toleranceType)) {
    return false;
  }
  
  return true;
}

module.exports = {
  isPurelyNumerical,
  normalizeNumericalValue,
  compareNumericalAnswers,
  evaluateAnswer,
  formatNumericalValue,
  validateEvaluationConfig
};