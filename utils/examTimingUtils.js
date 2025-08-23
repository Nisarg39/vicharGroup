/**
 * Exam Timing Utilities
 * Provides consistent exam duration and time calculation functions
 * across the application to handle different exam streams and types.
 */

/**
 * Get the effective exam duration considering stream-specific rules and exam type
 * @param {Object} exam - The exam object containing duration, stream info, and timing data
 * @returns {number} Duration in minutes
 */
export function getEffectiveExamDuration(exam) {
    if (!exam) return 180; // Default 3 hours
    
    // For scheduled exams, calculate duration from startTime and endTime
    if (exam.examAvailability === 'scheduled' && exam.startTime && exam.endTime) {
        return Math.floor((new Date(exam.endTime) - new Date(exam.startTime)) / 1000 / 60); // in minutes
    }
    
    // For practice exams or when duration is explicitly set, use examDurationMinutes
    if (exam.examDurationMinutes && exam.examDurationMinutes > 0) {
        return exam.examDurationMinutes;
    }
    
    // Stream-specific defaults based on competitive exam standards
    const stream = exam.stream?.toLowerCase() || '';
    
    if (stream.includes('neet')) {
        return 200; // NEET: 3 hours 20 minutes (200 minutes)
    }
    
    if (stream.includes('jee')) {
        if (stream.includes('main')) {
            return 180; // JEE Main: 3 hours
        }
        if (stream.includes('advanced')) {
            return 180; // JEE Advanced: 3 hours per paper
        }
        return 180; // Default JEE: 3 hours
    }
    
    if (stream.includes('cet')) {
        if (stream.includes('mht')) {
            return 180; // MHT-CET: 3 hours
        }
        return 150; // Other CETs: 2.5 hours
    }
    
    // Default duration for other streams
    return 180; // 3 hours default
}

/**
 * Calculate remaining time for scheduled exams vs practice exams
 * @param {Object} exam - The exam object
 * @param {number} studentStartTime - Student's exam start time in milliseconds (optional)
 * @returns {number} Remaining time in seconds
 */
export function calculateRemainingTime(exam, studentStartTime = null) {
    if (!exam) return 0;
    
    if (exam.examAvailability === 'scheduled' && exam.endTime) {
        // For scheduled exams: remaining time until endTime
        const now = Date.now();
        const examEndTime = new Date(exam.endTime).getTime();
        return Math.max(Math.floor((examEndTime - now) / 1000), 0); // in seconds
    } else {
        // For practice exams: use traditional duration-based calculation
        if (!studentStartTime) return (exam.examDurationMinutes || 0) * 60;
        
        const effectiveDuration = getEffectiveExamDuration(exam);
        const durationMs = effectiveDuration * 60 * 1000; // Convert to milliseconds
        const currentTimeMs = Date.now();
        const elapsedMs = currentTimeMs - studentStartTime;
        const remainingMs = Math.max(0, durationMs - elapsedMs);
        
        return Math.floor(remainingMs / 1000); // Return seconds
    }
}

/**
 * DEPRECATED: Legacy function for backward compatibility
 * Calculate remaining time based on start time and exam duration
 * @param {number} startTimeMs - Exam start time in milliseconds
 * @param {Object} exam - The exam object
 * @returns {number} Remaining time in seconds
 */
export function calculateRemainingTimeLegacy(startTimeMs, exam) {
    if (!startTimeMs || !exam) return 0;
    
    const effectiveDuration = getEffectiveExamDuration(exam);
    const durationMs = effectiveDuration * 60 * 1000; // Convert to milliseconds
    const currentTimeMs = Date.now();
    const elapsedMs = currentTimeMs - startTimeMs;
    const remainingMs = Math.max(0, durationMs - elapsedMs);
    
    return Math.floor(remainingMs / 1000); // Return seconds
}

// NOTE: getSubjectUnlockSchedule function moved to examDurationHelpers.js to avoid duplication
// Import it from there if needed: import { getSubjectUnlockSchedule } from './examDurationHelpers.js'

// NOTE: getSubjectUnlockTime function moved to examDurationHelpers.js to avoid duplication
// Import it from there if needed: import { getSubjectUnlockTime } from './examDurationHelpers.js'

/**
 * Format duration from seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2h 30m 45s")
 */
export function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0s";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}

// NOTE: getExamAccessRules function moved to examDurationHelpers.js to avoid duplication
// Import it from there if needed: import { getExamAccessRules } from './examDurationHelpers.js'

/**
 * Validate exam duration based on stream requirements
 * @param {string} stream - Exam stream
 * @param {number} duration - Duration in minutes
 * @returns {Object} Validation result with warnings if any
 */
export function validateExamDuration(stream, duration) {
    if (!stream || !duration) {
        return { isValid: true, warnings: [] };
    }
    
    const streamLower = stream.toLowerCase();
    const warnings = [];
    
    // NEET validation
    if (streamLower.includes('neet') && duration !== 200) {
        warnings.push('NEET exams typically have 200 minutes (3h 20m) duration');
    }
    
    // JEE validation
    if (streamLower.includes('jee') && duration !== 180) {
        warnings.push('JEE exams typically have 180 minutes (3h) duration');
    }
    
    // MHT-CET validation
    if (streamLower.includes('mht') && duration !== 180) {
        warnings.push('MHT-CET exams typically have 180 minutes (3h) duration');
    }
    
    // General validation
    if (duration < 30) {
        warnings.push('Duration seems too short for a competitive exam');
    }
    
    if (duration > 300) {
        warnings.push('Duration seems too long for a single exam session');
    }
    
    return {
        isValid: warnings.length === 0,
        warnings,
        recommendedDuration: getEffectiveExamDuration({ stream })
    };
}

/**
 * Check if subjects should be unlocked (for MHT-CET only)
 * @param {Object} exam - The exam object
 * @param {number} timeLeft - Time left in seconds
 * @param {number} startTime - Student start time in milliseconds (optional, for consistency)
 * @returns {boolean} Whether restricted subjects should be unlocked
 */
export function shouldUnlockSubjects(exam, timeLeft, startTime = null) {
    if (!exam) return true;
    
    const stream = exam.stream?.toLowerCase() || '';
    
    // Only apply locking logic to MHT-CET exams
    if (!((stream.includes('mht') && stream.includes('cet')) || 
          (stream.includes('cet') && !stream.includes('jee')))) {
        return true; // All other exams (NEET, JEE, etc.) have no subject restrictions
    }
    
    const ninetyMinutes = 90 * 60; // 90 minutes in seconds
    
    if (exam.examAvailability === 'scheduled' && exam.endTime) {
        // For scheduled exams: unlock when 90 minutes remain until endTime
        // EDGE CASE: If timeLeft is negative (exam ended), unlock immediately
        if (timeLeft < 0) return true;
        
        // EDGE CASE: Late start scenarios handled automatically - if <90min remain, unlock
        return timeLeft <= ninetyMinutes;
    } else {
        // For practice exams: unlock after 90 minutes from start
        const totalDuration = (exam.examDurationMinutes || 0) * 60;
        const timeElapsed = totalDuration - timeLeft;
        
        // EDGE CASE: Handle negative elapsed time (clock issues)
        if (timeElapsed < 0) return false;
        
        // EDGE CASE: Handle timeLeft > totalDuration (shouldn't happen, but defensive)
        if (timeLeft > totalDuration) return false;
        
        return timeElapsed >= ninetyMinutes;
    }
}

/**
 * Calculate time efficiency percentage
 * @param {number} timeTaken - Time taken in seconds
 * @param {Object} exam - The exam object
 * @returns {number} Efficiency percentage (0-100)
 */
export function calculateTimeEfficiency(timeTaken, exam) {
    if (!timeTaken || !exam) return 0;
    
    const effectiveDuration = getEffectiveExamDuration(exam);
    const totalTimeSeconds = effectiveDuration * 60;
    
    // Time efficiency = (Total time - Time taken) / Total time * 100
    // Higher percentage means more time left (more efficient)
    const efficiency = ((totalTimeSeconds - timeTaken) / totalTimeSeconds) * 100;
    
    return Math.max(0, Math.min(100, Math.round(efficiency * 100) / 100));
}