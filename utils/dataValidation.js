/**
 * Data Validation Utility
 * Provides comprehensive validation functions for analytics data
 * to ensure data integrity and prevent runtime errors
 */

import { isSafeNumber, safeParseNumber } from './safeNumericOperations.js';

/**
 * Validates analytics data structure
 * @param {Object} analyticsData - Analytics data to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export function validateAnalyticsData(analyticsData) {
    const errors = [];
    
    if (!analyticsData) {
        return { isValid: false, errors: ['Analytics data is null or undefined'] };
    }
    
    // Validate overallStats
    if (!analyticsData.overallStats) {
        errors.push('Missing overallStats');
    } else {
        const overallStats = analyticsData.overallStats;
        
        if (!isSafeNumber(overallStats.totalExamsAttempted)) {
            errors.push('Invalid totalExamsAttempted in overallStats');
        }
        
        if (!isSafeNumber(overallStats.averagePercentage)) {
            errors.push('Invalid averagePercentage in overallStats');
        }
        
        if (!isSafeNumber(overallStats.totalTimeSpent)) {
            errors.push('Invalid totalTimeSpent in overallStats');
        }
        
        if (!isSafeNumber(overallStats.bestPerformance)) {
            errors.push('Invalid bestPerformance in overallStats');
        }
        
        if (!isSafeNumber(overallStats.completionRate)) {
            errors.push('Invalid completionRate in overallStats');
        }
    }
    
    // Validate subjectWiseStats
    if (!Array.isArray(analyticsData.subjectWiseStats)) {
        errors.push('subjectWiseStats must be an array');
    } else {
        analyticsData.subjectWiseStats.forEach((subject, index) => {
            if (!subject.subject || typeof subject.subject !== 'string') {
                errors.push(`Invalid subject name at index ${index}`);
            }
            
            if (!isSafeNumber(subject.averagePercentage)) {
                errors.push(`Invalid averagePercentage for subject at index ${index}`);
            }
            
            if (!isSafeNumber(subject.averageAccuracy)) {
                errors.push(`Invalid averageAccuracy for subject at index ${index}`);
            }
            
            if (!isSafeNumber(subject.totalAttempts)) {
                errors.push(`Invalid totalAttempts for subject at index ${index}`);
            }
        });
    }
    
    // Validate performanceOverTime
    if (!Array.isArray(analyticsData.performanceOverTime)) {
        errors.push('performanceOverTime must be an array');
    } else {
        analyticsData.performanceOverTime.forEach((exam, index) => {
            if (!exam.examName || typeof exam.examName !== 'string') {
                errors.push(`Invalid examName for performance data at index ${index}`);
            }
            
            if (!isSafeNumber(exam.percentage)) {
                errors.push(`Invalid percentage for performance data at index ${index}`);
            }
            
            if (!isSafeNumber(exam.timeTaken)) {
                errors.push(`Invalid timeTaken for performance data at index ${index}`);
            }
            
            if (!exam.examDate) {
                errors.push(`Missing examDate for performance data at index ${index}`);
            }
        });
    }
    
    // Validate examResults
    if (!Array.isArray(analyticsData.examResults)) {
        errors.push('examResults must be an array');
    }
    
    // Validate enrollments
    if (!Array.isArray(analyticsData.enrollments)) {
        errors.push('enrollments must be an array');
    }
    
    // Validate insights
    if (!analyticsData.insights) {
        errors.push('Missing insights object');
    } else {
        const insights = analyticsData.insights;
        
        if (!Array.isArray(insights.strengths)) {
            errors.push('insights.strengths must be an array');
        }
        
        if (!Array.isArray(insights.improvements)) {
            errors.push('insights.improvements must be an array');
        }
        
        if (!Array.isArray(insights.recommendations)) {
            errors.push('insights.recommendations must be an array');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates and sanitizes subject chart data
 * @param {Array} subjectWiseStats - Subject statistics array
 * @returns {Array} - Validated and sanitized chart data
 */
export function validateSubjectChartData(subjectWiseStats) {
    if (!Array.isArray(subjectWiseStats)) {
        return [];
    }
    
    return subjectWiseStats
        .filter(subject => subject && typeof subject.subject === 'string')
        .map(subject => ({
            subject: subject.subject,
            percentage: safeParseNumber(subject.averagePercentage, 0),
            accuracy: safeParseNumber(subject.averageAccuracy, 0),
            attempts: safeParseNumber(subject.totalAttempts, 0),
            totalQuestions: safeParseNumber(subject.totalQuestions, 0),
            correct: safeParseNumber(subject.totalCorrect, 0),
            incorrect: safeParseNumber(subject.totalIncorrect, 0)
        }));
}

/**
 * Validates and sanitizes performance chart data
 * @param {Array} performanceOverTime - Performance over time array
 * @returns {Array} - Validated and sanitized chart data
 */
export function validatePerformanceChartData(performanceOverTime) {
    if (!Array.isArray(performanceOverTime)) {
        return [];
    }
    
    return performanceOverTime
        .filter(exam => exam && exam.examName && exam.examDate)
        .map((exam, index) => ({
            name: exam.examName.length > 15 ? `${exam.examName.substring(0, 15)}...` : exam.examName,
            fullName: exam.examName,
            percentage: safeParseNumber(exam.percentage, 0),
            timeTaken: Math.round(safeParseNumber(exam.timeTaken, 0) / 60), // Convert to minutes
            date: formatDate(exam.examDate),
            stream: exam.stream || 'Unknown',
            standard: exam.standard || 'Unknown',
            index: index + 1
        }));
}

/**
 * Validates exam result data for calculations
 * @param {Object} result - Exam result object
 * @returns {Object} - Validated result with safe numeric values
 */
export function validateExamResult(result) {
    if (!result) {
        return {
            score: 0,
            totalMarks: 1, // Prevent division by zero
            timeTaken: 0,
            percentage: 0,
            isValid: false
        };
    }
    
    const score = safeParseNumber(result.score, 0);
    const totalMarks = safeParseNumber(result.totalMarks, 1);
    const timeTaken = safeParseNumber(result.timeTaken, 0);
    const percentage = result.percentage !== null && result.percentage !== undefined 
        ? safeParseNumber(result.percentage, 0)
        : (score / totalMarks) * 100;
    
    return {
        score,
        totalMarks,
        timeTaken,
        percentage: Math.max(0, Math.min(100, percentage)), // Clamp between 0-100
        isValid: true,
        completedAt: result.completedAt,
        exam: result.exam
    };
}

/**
 * Validates and sanitizes subject statistics
 * @param {Array} subjectStats - Array of subject statistics
 * @returns {Array} - Validated subject statistics
 */
export function validateSubjectStats(subjectStats) {
    if (!Array.isArray(subjectStats)) {
        return [];
    }
    
    return subjectStats
        .filter(subject => subject && typeof subject.subject === 'string')
        .map(subject => ({
            subject: subject.subject,
            averagePercentage: Math.max(0, Math.min(100, safeParseNumber(subject.averagePercentage, 0))),
            averageAccuracy: Math.max(0, Math.min(100, safeParseNumber(subject.averageAccuracy, 0))),
            bestPerformance: Math.max(0, Math.min(100, safeParseNumber(subject.bestPerformance, 0))),
            totalAttempts: Math.max(0, safeParseNumber(subject.totalAttempts, 0)),
            totalQuestions: Math.max(0, safeParseNumber(subject.totalQuestions, 0)),
            totalCorrect: Math.max(0, safeParseNumber(subject.totalCorrect, 0)),
            totalIncorrect: Math.max(0, safeParseNumber(subject.totalIncorrect, 0))
        }));
}

/**
 * Format date for display with error handling
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

/**
 * Validates array before reduce operations
 * @param {Array} array - Array to validate
 * @param {any} fallback - Fallback value
 * @returns {Object} - Validation result with array and isValid flag
 */
export function validateArrayForReduce(array, fallback = null) {
    if (!Array.isArray(array) || array.length === 0) {
        return {
            isValid: false,
            array: [],
            fallback
        };
    }
    
    return {
        isValid: true,
        array,
        fallback
    };
}

/**
 * Validates numerical data for chart rendering
 * @param {Array} data - Chart data array
 * @param {Array} numericFields - Fields that should be numeric
 * @returns {Array} - Validated chart data
 */
export function validateChartData(data, numericFields = []) {
    if (!Array.isArray(data)) {
        return [];
    }
    
    return data.map(item => {
        const validatedItem = { ...item };
        
        numericFields.forEach(field => {
            if (validatedItem[field] !== undefined) {
                validatedItem[field] = safeParseNumber(validatedItem[field], 0);
            }
        });
        
        return validatedItem;
    });
}

/**
 * Validates student performance data for analytics
 * @param {Object} studentData - Student performance data
 * @returns {Object} - Validated student data
 */
export function validateStudentPerformanceData(studentData) {
    if (!studentData) {
        return {
            totalExams: 0,
            totalScore: 0,
            totalPossibleScore: 1,
            totalTimeTaken: 0,
            subjects: [],
            examResults: []
        };
    }
    
    return {
        totalExams: Math.max(0, safeParseNumber(studentData.totalExams, 0)),
        totalScore: Math.max(0, safeParseNumber(studentData.totalScore, 0)),
        totalPossibleScore: Math.max(1, safeParseNumber(studentData.totalPossibleScore, 1)),
        totalTimeTaken: Math.max(0, safeParseNumber(studentData.totalTimeTaken, 0)),
        subjects: Array.isArray(studentData.subjects) ? studentData.subjects : [],
        examResults: Array.isArray(studentData.examResults) ? studentData.examResults : []
    };
}

/**
 * Error boundary wrapper for analytics calculations
 * @param {Function} calculation - Calculation function to wrap
 * @param {any} fallback - Fallback value on error
 * @returns {Function} - Wrapped calculation function
 */
export function wrapWithErrorHandling(calculation, fallback = null) {
    return (...args) => {
        try {
            const result = calculation(...args);
            return result !== undefined && result !== null ? result : fallback;
        } catch (error) {
            console.error('Error in calculation:', error);
            return fallback;
        }
    };
}

export default {
    validateAnalyticsData,
    validateSubjectChartData,
    validatePerformanceChartData,
    validateExamResult,
    validateSubjectStats,
    formatDate,
    validateArrayForReduce,
    validateChartData,
    validateStudentPerformanceData,
    wrapWithErrorHandling
};