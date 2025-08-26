/**
 * EMERGENCY BOTTLENECK FIX: Feature flags for exam submission behavior
 * 
 * This file controls the new "close exam immediately" behavior that prevents
 * database bottlenecks during mass simultaneous submissions (500+ students).
 * 
 * Problem: During auto-submit, all students navigate to result page → getAllExamAttempts() 
 * calls → Database connection pool exhaustion (500 requests > 400 M10 connections)
 * 
 * Solution: Close exam immediately after submission confirmation, let students
 * view results later via dashboard, completely eliminating the bottleneck.
 */

export const EXAM_FEATURE_FLAGS = {
    // EMERGENCY FIX: Close exam immediately after submission
    CLOSE_EXAM_IMMEDIATELY: true,
    
    // Rollback option: Set to false to restore original behavior
    ENABLE_IMMEDIATE_RESULT_NAVIGATION: false,
    
    // Mass submission optimization
    OPTIMIZE_FOR_MASS_SUBMISSIONS: true,
    
    // Background polling for queued results (should remain true)
    ENABLE_BACKGROUND_RESULT_POLLING: true,
    
    // Success message customization
    CUSTOM_SUCCESS_MESSAGES: {
        auto_submit: "Time's up! Your exam has been submitted automatically. Check your dashboard for results.",
        manual_submit: "Exam submitted successfully! You can view your results later from your dashboard.",
        queued_submit: "Your exam has been queued for processing. Results will be available soon in your dashboard."
    },
    
    // Navigation delays (in milliseconds)
    SUCCESS_MESSAGE_DURATION: 4000,
    HOME_NAVIGATION_DELAY: 3000,
    
    // Emergency rollback settings
    EMERGENCY_ROLLBACK: {
        enabled: false, // Set to true for immediate rollback
        reason: "", // Document rollback reason
        rollbackTime: null // Auto-populated when rollback enabled
    }
};

/**
 * Helper function to check if immediate exam close is enabled
 */
export const shouldCloseExamImmediately = () => {
    // Check emergency rollback first
    if (EXAM_FEATURE_FLAGS.EMERGENCY_ROLLBACK.enabled) {
        console.warn('⚠️ EMERGENCY ROLLBACK ACTIVE: Reverting to original exam behavior');
        return false;
    }
    
    return EXAM_FEATURE_FLAGS.CLOSE_EXAM_IMMEDIATELY && 
           EXAM_FEATURE_FLAGS.OPTIMIZE_FOR_MASS_SUBMISSIONS;
};

/**
 * Get appropriate success message based on submission type
 */
export const getSubmissionSuccessMessage = (submissionType = 'manual_submit') => {
    return EXAM_FEATURE_FLAGS.CUSTOM_SUCCESS_MESSAGES[submissionType] || 
           EXAM_FEATURE_FLAGS.CUSTOM_SUCCESS_MESSAGES.manual_submit;
};

/**
 * Configuration for result polling optimization
 */
export const RESULT_POLLING_CONFIG = {
    // Polling interval in milliseconds (increased for mass submission scenarios)
    POLLING_INTERVAL: 3000, // 3 seconds instead of 1 second
    
    // Maximum polling attempts before stopping
    MAX_POLLING_ATTEMPTS: 20, // 1 minute total polling time
    
    // Exponential backoff for failed polls
    EXPONENTIAL_BACKOFF: true,
    
    // Base backoff delay
    BASE_BACKOFF_DELAY: 1000
};