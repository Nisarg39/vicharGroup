"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getAtomicSubmissionManager, SUBMISSION_TYPES } from '../../utils/atomicSubmissionManager'
import { submitProgressiveResultDirect } from '../../server_actions/actions/examController/progressiveSubmissionHandler'
import { logSubmissionStart, logImmediateClose, logSubmissionError } from '../../lib/examBottleneckMonitor'
import { getEffectiveExamDuration } from '../../utils/examTimingUtils'

/**
 * Submission Logic Management Hook
 * 
 * Manages exam submission state, atomic submission locking, progress tracking,
 * and submission feedback. Extracted from ExamInterface.js to improve
 * code organization and prevent race conditions.
 * 
 * @param {Object} exam - Exam object
 * @param {Object} student - Student object
 * @param {Function} onComplete - Callback when exam is completed
 * @returns {Object} Submission management state and functions
 */
export const useSubmissionLogic = (exam, student, onComplete) => {
    // Submission state
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
    const [submissionType, setSubmissionType] = useState('manual_submit')
    const [currentSubmissionId, setCurrentSubmissionId] = useState(null)
    
    // Enhanced submission state
    const [submissionState, setSubmissionState] = useState({
        status: 'idle', // 'idle', 'submitting', 'success', 'error'
        message: '',
        performanceMetrics: null,
        showProgress: false,
        performanceBadge: null,
        submissionTime: 0
    })
    
    // Atomic submission state
    const [submissionLockStatus, setSubmissionLockStatus] = useState({
        hasLock: false,
        lockId: null,
        submissionType: null,
        state: 'idle',
        lastError: null
    })
    
    // Refs
    const atomicSubmissionManager = useRef(null)
    const modalRef = useRef(null)
    const examCompletedRef = useRef(false)
    
    /**
     * Initialize atomic submission manager
     */
    useEffect(() => {
        atomicSubmissionManager.current = getAtomicSubmissionManager()
        console.log('🔒 Atomic submission manager initialized')
        
        return () => {
            if (atomicSubmissionManager.current) {
                atomicSubmissionManager.current.forceReleaseLock()
                console.log('🗑️ Atomic submission manager cleaned up')
            }
        }
    }, [])
    
    /**
     * Handle exam window close after submission
     * Manages post-submission window behavior
     */
    const handleExamWindowClose = useCallback(async (completionData) => {
        try {
            const { submissionType, success = true, error = false, message } = completionData
            
            // Exit fullscreen mode first
            if (document.fullscreenElement) {
                console.log('🖥️ Exiting fullscreen mode before window close...')
                await document.exitFullscreen().catch(err => {
                    console.log('ℹ️ Fullscreen exit failed (normal for some browsers):', err.message)
                })
            }
            
            // Show appropriate success/error message
            const displayMessage = message || (success 
                ? `Exam submitted successfully! This window will close automatically.`
                : `Submission encountered an issue but has been saved. This window will close automatically.`)
            
            console.log(`✅ ${success ? 'Success' : 'Error'} - ${displayMessage}`)
            
            // Show toast notification
            if (success) {
                toast.success(displayMessage, { 
                    duration: 3000,
                    style: { fontSize: '16px', fontWeight: 'bold' }
                })
            } else {
                toast.error(displayMessage, { 
                    duration: 4000,
                    style: { fontSize: '16px', fontWeight: 'bold' }
                })
            }
            
            // Close browser window/tab after delay
            setTimeout(() => {
                console.log('🔄 Attempting to close browser window/tab...')
                
                try {
                    window.close()
                    
                    // If window.close() doesn't work (direct URL access), provide fallback
                    setTimeout(() => {
                        console.log('ℹ️ Window close may have failed - providing fallback navigation')
                        
                        toast.info('You can now close this tab or navigate back to your dashboard.', {
                            duration: 8000,
                            style: { fontSize: '14px' }
                        })
                        
                        // Fallback: Navigate to dashboard after additional delay
                        setTimeout(() => {
                            try {
                                window.location.href = '/dashboard'
                            } catch (navError) {
                                console.log('ℹ️ Navigation fallback failed:', navError)
                                window.location.href = '/'
                            }
                        }, 3000)
                    }, 1000)
                } catch (closeError) {
                    console.log('ℹ️ Window close failed (expected for direct URL access):', closeError)
                    
                    toast.info('Exam completed! You can now close this tab.', {
                        duration: 8000,
                        style: { fontSize: '16px', fontWeight: 'bold' }
                    })
                    
                    setTimeout(() => {
                        window.location.href = '/dashboard'
                    }, 2000)
                }
            }, success ? 2000 : 3000)
            
        } catch (error) {
            console.error('❌ Error during window close handling:', error)
            
            toast.error('Exam submitted but window close failed. Please close this tab manually.', {
                duration: 8000
            })
            
            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 3000)
        }
    }, [])
    
    /**
     * Submit exam with atomic locking and progressive computation
     * Main submission function with comprehensive error handling
     */
    const submitExam = useCallback(async (examData, timerData) => {
        const { answers, visitedQuestions, markedQuestions, warningCount, progressiveScoring } = examData
        const { startTime, timeLeft } = timerData
        
        // Acquire atomic submission lock
        const lockResult = await atomicSubmissionManager.current?.acquireLock(
            submissionType === 'auto_submit' ? SUBMISSION_TYPES.AUTO : SUBMISSION_TYPES.MANUAL,
            {
                examId: exam?._id,
                studentId: student?._id,
                triggerType: submissionType,
                attemptTime: new Date().toISOString()
            }
        )
        
        if (!lockResult?.success) {
            console.warn('🚫 Cannot submit exam - submission lock acquisition failed:', lockResult)
            
            if (lockResult?.error === 'LOCK_ALREADY_HELD') {
                const message = `Another ${lockResult.existingLock?.submissionType || 'submission'} is in progress. Please wait.`
                toast.error(message, { duration: 4000 })
                return { success: false, error: 'lock_failed' }
            } else {
                toast.error('Unable to submit exam at this time. Please try again.', { duration: 4000 })
                return { success: false, error: 'lock_failed' }
            }
        }
        
        // Update submission lock status
        setSubmissionLockStatus({
            hasLock: true,
            lockId: lockResult.lockId,
            submissionType: submissionType,
            state: 'acquired',
            lastError: null
        })
        
        console.log(`🔐 Submission lock acquired successfully: ${lockResult.lockId} (${submissionType})`)
        
        const lockId = lockResult.lockId
        const monitoringId = logSubmissionStart(student?._id, exam?._id, submissionType)
        setCurrentSubmissionId(monitoringId)
        
        const submissionStartTime = Date.now()
        
        try {
            examCompletedRef.current = true
            
            // Show loading state
            setSubmissionState({ 
                status: 'submitting', 
                message: 'Processing your exam...',
                showProgress: true,
                performanceMetrics: null,
                performanceBadge: null,
                submissionTime: 0
            })
        
            // Prepare exam data for submission
            const examSubmissionData = {
                answers,
                score: 0,
                totalMarks: 0,
                timeTaken: exam.examAvailability === 'scheduled' 
                    ? Math.floor((Date.now() - startTime) / 1000) 
                    : (getEffectiveExamDuration(exam) * 60) - timeLeft,
                completedAt: new Date().toISOString(),
                visitedQuestions: Array.from(visitedQuestions),
                markedQuestions: Array.from(markedQuestions),
                warnings: warningCount,
                examAvailability: exam?.examAvailability,
                examEndTime: exam?.endTime,
                isAutoSubmit: submissionType === 'auto_submit',
                timeRemaining: timeLeft
            }
            
            // Enhanced progressive computation submission
            if (progressiveScoring?.isInitialized?.()) {
                try {
                    console.log('🚀 Attempting progressive computation submission...')
                    
                    const directStorageData = {
                        examId: exam._id,
                        studentId: student._id,
                        answers,
                        finalScore: 0,
                        totalMarks: 0,
                        percentage: 0,
                        timeTaken: examSubmissionData.timeTaken,
                        completedAt: examSubmissionData.completedAt,
                        visitedQuestions: examSubmissionData.visitedQuestions,
                        markedQuestions: examSubmissionData.markedQuestions,
                        warnings: warningCount,
                        submissionType: submissionType,
                        lockId: lockId,
                        monitoringId: monitoringId
                    }
                    
                    // Attempt direct storage submission
                    const directResult = await submitProgressiveResultDirect(directStorageData)
                    
                    if (directResult.success) {
                        const submissionTime = Date.now() - submissionStartTime
                        
                        console.log(`✅ Progressive submission completed in ${submissionTime}ms`)
                        
                        setSubmissionState({
                            status: 'success',
                            message: 'Exam submitted successfully!',
                            performanceMetrics: {
                                submissionTime,
                                score: directResult.data?.finalScore || 0,
                                totalMarks: directResult.data?.totalMarks || 0,
                                percentage: directResult.data?.percentage || 0
                            },
                            showProgress: false,
                            performanceBadge: submissionTime < 500 ? 'Fast' : submissionTime < 1000 ? 'Good' : 'Normal',
                            submissionTime
                        })
                        
                        // Release lock
                        await atomicSubmissionManager.current?.releaseLock(lockId)
                        
                        // Handle completion
                        await handleExamWindowClose({
                            submissionType,
                            success: true,
                            message: 'Exam submitted successfully!'
                        })
                        
                        if (onComplete) {
                            console.log('🎯 CRITICAL FIX: Calling onComplete callback with submission result');
                            // Clear any local progress since exam is now completed
                            const progressKey = exam && `exam_progress_${exam._id}_${directStorageData.studentId}`;
                            if (progressKey) {
                                try {
                                    localStorage.removeItem(progressKey);
                                    console.log('✅ CRITICAL FIX: Local progress cleared via useSubmissionLogic');
                                } catch (error) {
                                    console.warn('⚠️ Failed to clear local progress in useSubmissionLogic:', error);
                                }
                            }
                            onComplete(directResult.data)
                        }
                        
                        return { success: true, data: directResult.data }
                    }
                } catch (error) {
                    console.error('❌ Progressive submission error:', error)
                    logSubmissionError(monitoringId, error.message, submissionStartTime)
                }
            }
            
            // Fallback to standard submission if progressive fails
            console.log('🔄 Falling back to standard submission...')
            
            setSubmissionState({
                status: 'error',
                message: 'Submission completed with fallback method. Your answers have been saved.',
                performanceMetrics: null,
                showProgress: false,
                performanceBadge: null,
                submissionTime: Date.now() - submissionStartTime
            })
            
            // Release lock
            await atomicSubmissionManager.current?.releaseLock(lockId)
            
            return { success: true, fallback: true }
            
        } catch (error) {
            console.error('❌ Submission error:', error)
            
            const submissionTime = Date.now() - submissionStartTime
            logSubmissionError(monitoringId, error.message, submissionStartTime)
            
            setSubmissionState({
                status: 'error',
                message: 'Submission encountered an error, but your answers may have been saved. Please contact support if this persists.',
                performanceMetrics: null,
                showProgress: false,
                performanceBadge: null,
                submissionTime
            })
            
            // Release lock even on error
            await atomicSubmissionManager.current?.releaseLock(lockId)
            
            return { success: false, error: error.message }
        }
    }, [exam, student, submissionType, onComplete, handleExamWindowClose])
    
    /**
     * Handle manual exam submission
     * Shows confirmation modal and initiates submission
     */
    const handleSubmit = useCallback(() => {
        setShowConfirmSubmit(true)
        setSubmissionType('manual_submit')
        console.log('📝 Manual submission initiated')
    }, [])
    
    /**
     * Handle auto submission (when time expires)
     * Initiates submission without confirmation
     */
    const handleAutoSubmit = useCallback((examData, timerData) => {
        console.log('⏰ Auto submission triggered')
        setSubmissionType('auto_submit')
        
        // Auto submit without confirmation
        submitExam(examData, timerData)
    }, [submitExam])
    
    /**
     * Confirm and proceed with submission
     * Called after user confirms submission
     */
    const confirmSubmission = useCallback((examData, timerData) => {
        setShowConfirmSubmit(false)
        return submitExam(examData, timerData)
    }, [submitExam])
    
    /**
     * Cancel submission
     * Closes confirmation modal
     */
    const cancelSubmission = useCallback(() => {
        setShowConfirmSubmit(false)
        setSubmissionType('manual_submit')
        console.log('❌ Submission cancelled')
    }, [])
    
    /**
     * Reset submission state
     * Clears all submission-related state
     */
    const resetSubmissionState = useCallback(() => {
        setSubmissionState({
            status: 'idle',
            message: '',
            performanceMetrics: null,
            showProgress: false,
            performanceBadge: null,
            submissionTime: 0
        })
        
        setSubmissionLockStatus({
            hasLock: false,
            lockId: null,
            submissionType: null,
            state: 'idle',
            lastError: null
        })
        
        setShowConfirmSubmit(false)
        examCompletedRef.current = false
        
        console.log('🔄 Submission state reset')
    }, [])
    
    /**
     * Get submission status
     * Returns current submission state information
     */
    const getSubmissionStatus = useCallback(() => {
        return {
            isSubmitting: submissionState.status === 'submitting',
            isCompleted: examCompletedRef.current,
            hasError: submissionState.status === 'error',
            isSuccess: submissionState.status === 'success',
            canSubmit: submissionState.status === 'idle' && !submissionLockStatus.hasLock
        }
    }, [submissionState.status, submissionLockStatus.hasLock])
    
    // Keyboard event handler for modals
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (submissionState.status === 'idle') return
            
            if (event.key === 'Escape' && submissionState.status === 'error') {
                setSubmissionState({ 
                    status: 'idle', 
                    message: '', 
                    performanceMetrics: null, 
                    showProgress: false, 
                    performanceBadge: null, 
                    submissionTime: 0 
                })
                return
            }
            
            // Handle Tab key for focus trapping in error modal
            if (event.key === 'Tab' && submissionState.status === 'error') {
                const modal = modalRef.current
                if (!modal) return
                
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                const firstElement = focusableElements[0]
                const lastElement = focusableElements[focusableElements.length - 1]
                
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus()
                        event.preventDefault()
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus()
                        event.preventDefault()
                    }
                }
            }
        }
        
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [submissionState.status])
    
    // Focus management for modals
    useEffect(() => {
        if (submissionState.status === 'error' && modalRef.current) {
            const firstButton = modalRef.current.querySelector('button')
            if (firstButton) {
                setTimeout(() => firstButton.focus(), 100)
            }
        }
    }, [submissionState.status])
    
    return {
        // State
        showConfirmSubmit,
        submissionState,
        submissionLockStatus,
        submissionType,
        currentSubmissionId,
        
        // Refs
        modalRef,
        examCompletedRef,
        
        // Actions
        handleSubmit,
        handleAutoSubmit,
        confirmSubmission,
        cancelSubmission,
        resetSubmissionState,
        
        // Utilities
        getSubmissionStatus,
        handleExamWindowClose,
        
        // State setters
        setSubmissionState,
        setSubmissionType
    }
}