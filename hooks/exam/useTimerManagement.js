"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { calculateRemainingTime } from '../../utils/examTimingUtils'

/**
 * Timer Management Hook
 * 
 * Manages all timer-related state and functionality for exam interface.
 * Extracted from ExamInterface.js to improve code organization and prevent memory leaks.
 * Includes integrated auto-submit functionality to eliminate race conditions.
 * 
 * @param {Object} exam - Exam object containing timing configuration
 * @param {Object} options - Optional configuration including auto-submit callback
 * @returns {Object} Timer management state and functions
 */
export const useTimerManagement = (exam, options = {}) => {
    const { onAutoSubmit } = options
    // Timer state
    const [timeLeft, setTimeLeft] = useState(0)
    const [isExamStarted, setIsExamStarted] = useState(false)
    const [startTime, setStartTime] = useState(null)
    
    // Timer refs for proper cleanup
    const timerRef = useRef(null)
    const timerInitializedRef = useRef(false)
    const warningsShownRef = useRef(new Set())
    const autoSubmitTriggeredRef = useRef(false)
    const lastTimeUpdateRef = useRef(0)
    
    // PHASE 1 FIX: Mount tracking to prevent memory leaks
    const isMountedRef = useRef(true)
    
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
    
    // Note: updateTimeLeft function removed - timer updates are now handled internally by the integrated timer loop
    
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
    
    // PHASE 1 FIX: Enhanced cleanup on unmount with mount tracking
    useEffect(() => {
        return () => {
            isMountedRef.current = false
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            // Clean up all refs to prevent memory leaks
            warningsShownRef.current.clear()
            autoSubmitTriggeredRef.current = false
            timerInitializedRef.current = false
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
    
    /**
     * Integrated timer loop with auto-submit functionality
     * Eliminates race conditions by managing timer and auto-submit in one place
     */
    useEffect(() => {
        if (!isExamStarted || !startTime) return

        // Start timer interval
        timerRef.current = setInterval(() => {
            try {
                // BUG #1 FIX: Atomic mount check - single verification point at start of callback
                if (!isMountedRef.current) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current)
                        timerRef.current = null
                    }
                    return
                }
                
                // Use consistent helper function for time calculation
                const calculatedTimeLeft = calculateRemainingTime(exam, startTime)
                
                // STABLE UPDATE: Only update state if time has actually changed by at least 1 second
                // This prevents unnecessary re-renders and cascading effects
                if (Math.abs(calculatedTimeLeft - lastTimeUpdateRef.current) >= 1) {
                    lastTimeUpdateRef.current = calculatedTimeLeft
                    // BUG #1 FIX: State update is now atomic - mount was verified at callback start
                    setTimeLeft(calculatedTimeLeft)
                }
                
                // Show time warnings - using stable warning thresholds
                const warnings = [
                    { time: 300, message: "⚠️ 5 minutes remaining! Please review your answers.", type: "warning" },
                    { time: 60, message: "🚨 1 minute remaining! Exam will auto-submit soon.", type: "error" },
                    { time: 30, message: "⏰ 30 seconds remaining! Auto-submit imminent.", type: "error" },
                    { time: 10, message: "🔥 10 seconds remaining! Submitting now...", type: "error" }
                ]
                
                // STABLE WARNING SYSTEM: Check warnings without triggering state changes
                warnings.forEach(warning => {
                    if (calculatedTimeLeft === warning.time && !warningsShownRef.current.has(warning.time)) {
                        warningsShownRef.current.add(warning.time)
                        
                        // Import toast dynamically to avoid circular dependencies
                        import('react-hot-toast').then(({ default: toast }) => {
                            if (warning.type === "error") {
                                toast.error(warning.message, { duration: 4000 })
                            } else {
                                toast(warning.message, {
                                    icon: '⚠️',
                                    style: {
                                        background: '#f59e0b',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    },
                                    duration: 4000
                                })
                            }
                        })
                    }
                })
                
                // STABLE AUTO-SUBMIT: Prevent multiple auto-submit calls
                // BUG #1 FIX: Auto-submit logic is now atomic - mount was verified at callback start
                if (calculatedTimeLeft <= 0 && !autoSubmitTriggeredRef.current) {
                    autoSubmitTriggeredRef.current = true
                    console.log('⏰ Timer expired - triggering integrated auto-submit')
                    
                    if (onAutoSubmit) {
                        // Import toast dynamically
                        import('react-hot-toast').then(({ default: toast }) => {
                            // BUG #1 FIX: Toast display is now atomic - mount was verified at callback start
                            toast.error("⏰ Time's up! Your exam has been automatically submitted.", { 
                                duration: 6000,
                                style: { fontSize: '16px', fontWeight: 'bold' }
                            })
                        })
                        
                        // Call auto-submit callback immediately (no delay to prevent race conditions)
                        onAutoSubmit()
                    }
                }
            } catch (error) {
                console.error('Timer calculation error:', error)
                // BUG #1 FIX: Error handling is now atomic - mount was verified at callback start
                if (timerRef.current) {
                    clearInterval(timerRef.current)
                    timerRef.current = null
                }
                // Continue timer but skip this update
            }
        }, 1000)
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [isExamStarted, startTime, exam._id, exam.examAvailability, exam.endTime, onAutoSubmit])

    // Reset auto-submit flag when exam restarts or startTime changes
    useEffect(() => {
        autoSubmitTriggeredRef.current = false
    }, [startTime, isExamStarted])
    
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
        
        // Ref management methods
        setTimerInitialized,
        clearWarnings,
        resetTimerFlags,
        
        // Utilities
        getTimerData,
        isTimerReady
    }
}