"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { calculateRemainingTime } from '../../utils/examTimingUtils'

/**
 * Timer Management Hook
 * 
 * Manages all timer-related state and functionality for exam interface.
 * Extracted from ExamInterface.js to improve code organization and prevent memory leaks.
 * 
 * @param {Object} exam - Exam object containing timing configuration
 * @returns {Object} Timer management state and functions
 */
export const useTimerManagement = (exam) => {
    // Timer state
    const [timeLeft, setTimeLeft] = useState(0)
    const [isExamStarted, setIsExamStarted] = useState(false)
    const [startTime, setStartTime] = useState(null)
    
    // Timer refs for proper cleanup
    const timerRef = useRef(null)
    const timerInitializedRef = useRef(false)
    const warningsShownRef = useRef(new Set())
    
    /**
     * Start the exam timer
     * Initializes startTime and sets exam as started
     */
    const startTimer = useCallback(() => {
        const now = Date.now()
        setStartTime(now)
        setIsExamStarted(true)
        
        // Calculate initial time left
        const calculatedTimeLeft = calculateRemainingTime(exam, now)
        setTimeLeft(calculatedTimeLeft)
        
        // Clear any previous warnings
        warningsShownRef.current.clear()
        timerInitializedRef.current = false
        
        console.log('🕐 Timer started:', {
            startTime: new Date(now).toISOString(),
            initialTimeLeft: calculatedTimeLeft
        })
    }, [exam])
    
    /**
     * Stop the exam timer
     * Resets all timer state and cleans up
     */
    const stopTimer = useCallback(() => {
        // Clear the timer interval
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        
        // Reset state
        setIsExamStarted(false)
        setStartTime(null)
        setTimeLeft(0)
        
        // Clear warnings and reset flags
        warningsShownRef.current.clear()
        timerInitializedRef.current = false
        
        console.log('⏹️ Timer stopped and reset')
    }, [])
    
    /**
     * Resume exam timer with saved progress
     * Used when continuing an exam from saved state
     */
    const resumeTimer = useCallback((savedStartTime, savedTimeLeft) => {
        if (!savedStartTime) {
            console.warn('⚠️ Cannot resume timer without saved start time')
            return
        }
        
        setStartTime(savedStartTime)
        setIsExamStarted(true)
        
        // Calculate current time left based on saved start time
        const calculatedTimeLeft = savedTimeLeft !== undefined 
            ? savedTimeLeft 
            : calculateRemainingTime(exam, savedStartTime)
        
        setTimeLeft(calculatedTimeLeft)
        timerInitializedRef.current = true
        
        console.log('▶️ Timer resumed:', {
            savedStartTime: new Date(savedStartTime).toISOString(),
            resumedTimeLeft: calculatedTimeLeft
        })
    }, [exam])
    
    /**
     * Update time left
     * Used by ExamTimer component to update the current time
     */
    const updateTimeLeft = useCallback((newTimeLeft) => {
        setTimeLeft(newTimeLeft)
    }, [])
    
    /**
     * Get timer data for saving progress
     * Returns current timer state for persistence
     */
    const getTimerData = useCallback(() => {
        return {
            startTime,
            timeLeft,
            isExamStarted,
            timerInitialized: timerInitializedRef.current
        }
    }, [startTime, timeLeft, isExamStarted])
    
    /**
     * Check if timer is ready for operations
     * Ensures timer has been properly initialized
     */
    const isTimerReady = useCallback(() => {
        return isExamStarted && startTime && timerInitializedRef.current
    }, [isExamStarted, startTime])
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [])
    
    // Debug logging for timer state changes
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Timer state changed:', {
                isExamStarted,
                startTime: startTime ? new Date(startTime).toISOString() : null,
                timeLeft,
                timerInitialized: timerInitializedRef.current
            })
        }
    }, [isExamStarted, startTime, timeLeft])
    
    // Ref management methods to avoid direct ref access from main component
    const setTimerInitialized = useCallback((initialized) => {
        timerInitializedRef.current = initialized
        console.log('🔧 Timer initialized flag set to:', initialized)
    }, [])
    
    const clearWarnings = useCallback(() => {
        warningsShownRef.current.clear()
        console.log('🗑️ Timer warnings cleared')
    }, [])
    
    const resetTimerFlags = useCallback(() => {
        timerInitializedRef.current = false
        warningsShownRef.current.clear()
        console.log('🔄 Timer flags reset')
    }, [])
    
    return {
        // State
        timeLeft,
        isExamStarted,
        startTime,
        
        // Refs (for ExamTimer component only)
        timerRef,
        timerInitializedRef,
        warningsShownRef,
        
        // Actions
        startTimer,
        stopTimer,
        resumeTimer,
        updateTimeLeft,
        
        // Ref management methods
        setTimerInitialized,
        clearWarnings,
        resetTimerFlags,
        
        // Utilities
        getTimerData,
        isTimerReady
    }
}