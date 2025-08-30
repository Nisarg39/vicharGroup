"use client"

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Core Exam State Management Hook
 * 
 * Manages core exam state including answers, visited questions, marked questions,
 * and current question tracking. Extracted from ExamInterface.js to improve
 * code organization and maintainability.
 * 
 * @param {Object} exam - Exam object
 * @param {Array} questions - Array of exam questions
 * @returns {Object} Exam state management functions and state
 */
export const useExamState = (exam, questions) => {
    // Core exam state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [markedQuestions, setMarkedQuestions] = useState(new Set())
    const [visitedQuestions, setVisitedQuestions] = useState(new Set())
    
    // Progress tracking state
    const [hasSavedProgress, setHasSavedProgress] = useState(false)
    const [showContinuePrompt, setShowContinuePrompt] = useState(false)
    
    // Refs for performance optimization
    const examCompletedRef = useRef(false)
    
    /**
     * Handle answer selection for a question
     * Updates the answers state with new answer
     */
    const handleAnswerChange = useCallback((questionId, answer) => {
        const newAnswers = {
            ...answers,
            [questionId]: answer
        }
        setAnswers(newAnswers)
        
        console.log('📝 Answer updated:', {
            questionId,
            answer: typeof answer === 'string' ? answer : JSON.stringify(answer)
        })
    }, [answers])
    
    /**
     * Handle multiple answers for a question (for multi-select questions)
     * Updates answers state with array of selected options
     */
    const handleMultipleAnswerChange = useCallback((questionId, selectedAnswers) => {
        const newAnswers = {
            ...answers,
            [questionId]: selectedAnswers
        }
        setAnswers(newAnswers)
        
        console.log('📝 Multiple answers updated:', {
            questionId,
            selectedCount: selectedAnswers?.length || 0
        })
    }, [answers])
    
    /**
     * Clear answer for current question
     * Removes the answer from answers state
     */
    const handleClear = useCallback((questionId) => {
        if (!questionId) {
            console.warn('⚠️ Cannot clear answer - question ID not provided')
            return
        }
        
        const newAnswers = { ...answers }
        delete newAnswers[questionId]
        setAnswers(newAnswers)
        
        console.log('🗑️ Answer cleared for question:', questionId)
    }, [answers])
    
    /**
     * Toggle marked status for a question
     * Adds or removes question from marked questions set
     */
    const toggleMarkedQuestion = useCallback((questionIndex) => {
        setMarkedQuestions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(questionIndex)) {
                newSet.delete(questionIndex)
                console.log('🏷️ Question unmarked:', questionIndex)
            } else {
                newSet.add(questionIndex)
                console.log('🏷️ Question marked for review:', questionIndex)
            }
            return newSet
        })
    }, [])
    
    /**
     * Mark question as visited
     * Adds question to visited questions set
     */
    const markQuestionVisited = useCallback((questionIndex) => {
        if (!visitedQuestions.has(questionIndex)) {
            setVisitedQuestions(prev => new Set([...prev, questionIndex]))
            console.log('👁️ Question visited:', questionIndex)
        }
    }, [visitedQuestions])
    
    /**
     * Navigate to specific question
     * Updates current question index
     */
    const navigateToQuestion = useCallback((questionIndex) => {
        if (questionIndex >= 0 && questionIndex < (questions?.length || 0)) {
            setCurrentQuestionIndex(questionIndex)
            markQuestionVisited(questionIndex)
            console.log('🧭 Navigated to question:', questionIndex)
        } else {
            console.warn('⚠️ Invalid question index:', questionIndex)
        }
    }, [questions?.length, markQuestionVisited])
    
    /**
     * Get current question data
     * Returns the current question object
     */
    const getCurrentQuestion = useCallback(() => {
        return questions && questions.length > 0 ? questions[currentQuestionIndex] : null
    }, [questions, currentQuestionIndex])
    
    /**
     * Get answer for a specific question
     * Returns the stored answer for the question ID
     */
    const getQuestionAnswer = useCallback((questionId) => {
        return answers[questionId] || null
    }, [answers])
    
    /**
     * Get exam progress statistics
     * Returns current progress data for display
     */
    const getProgressStats = useCallback(() => {
        const totalQuestions = questions?.length || 0
        const answeredCount = Object.keys(answers).length
        const markedCount = markedQuestions.size
        const visitedCount = visitedQuestions.size
        
        return {
            totalQuestions,
            answeredCount,
            markedCount,
            visitedCount,
            unansweredCount: totalQuestions - answeredCount,
            progressPercentage: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0
        }
    }, [questions?.length, answers, markedQuestions.size, visitedQuestions.size])
    
    /**
     * Load saved exam progress
     * Restores exam state from saved progress data
     */
    const loadSavedProgress = useCallback((progressData) => {
        if (!progressData) {
            console.log('ℹ️ No saved progress to load')
            return
        }
        
        try {
            // Restore answers
            if (progressData.answers) {
                setAnswers(progressData.answers)
            }
            
            // Restore question navigation
            if (typeof progressData.currentQuestionIndex === 'number') {
                setCurrentQuestionIndex(progressData.currentQuestionIndex)
            } else {
                setCurrentQuestionIndex(0)
            }
            
            // Restore marked questions
            if (progressData.markedQuestions) {
                setMarkedQuestions(new Set(progressData.markedQuestions))
            }
            
            // Restore visited questions
            if (progressData.visitedQuestions) {
                setVisitedQuestions(new Set(progressData.visitedQuestions))
            }
            
            setHasSavedProgress(true)
            console.log('📂 Exam progress loaded successfully:', {
                answersCount: Object.keys(progressData.answers || {}).length,
                currentIndex: progressData.currentQuestionIndex,
                markedCount: progressData.markedQuestions?.length || 0,
                visitedCount: progressData.visitedQuestions?.length || 0
            })
        } catch (error) {
            console.error('❌ Error loading saved progress:', error)
        }
    }, [])
    
    /**
     * Get current exam state for saving
     * Returns current state data for persistence
     */
    const getExamStateForSaving = useCallback(() => {
        return {
            answers,
            currentQuestionIndex,
            markedQuestions: Array.from(markedQuestions),
            visitedQuestions: Array.from(visitedQuestions),
            progressStats: getProgressStats()
        }
    }, [answers, currentQuestionIndex, markedQuestions, visitedQuestions, getProgressStats])
    
    /**
     * Reset exam state
     * Clears all exam progress and state
     */
    const resetExamState = useCallback(() => {
        setCurrentQuestionIndex(0)
        setAnswers({})
        setMarkedQuestions(new Set())
        setVisitedQuestions(new Set())
        setHasSavedProgress(false)
        setShowContinuePrompt(false)
        examCompletedRef.current = false
        
        console.log('🔄 Exam state reset')
    }, [])
    
    /**
     * Mark exam as completed
     * Sets completion flag to prevent further modifications
     */
    const markExamCompleted = useCallback(() => {
        examCompletedRef.current = true
        console.log('✅ Exam marked as completed')
    }, [])
    
    // Debug logging for state changes in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const stats = getProgressStats()
            console.log('📊 Exam state updated:', {
                currentQuestion: currentQuestionIndex,
                answeredQuestions: stats.answeredCount,
                totalQuestions: stats.totalQuestions,
                progressPercentage: stats.progressPercentage
            })
        }
    }, [currentQuestionIndex, answers, getProgressStats])
    
    return {
        // State
        currentQuestionIndex,
        answers,
        markedQuestions,
        visitedQuestions,
        hasSavedProgress,
        showContinuePrompt,
        
        // Refs
        examCompletedRef,
        
        // Actions
        handleAnswerChange,
        handleMultipleAnswerChange,
        handleClear,
        toggleMarkedQuestion,
        markQuestionVisited,
        navigateToQuestion,
        
        // Utilities
        getCurrentQuestion,
        getQuestionAnswer,
        getProgressStats,
        loadSavedProgress,
        getExamStateForSaving,
        resetExamState,
        markExamCompleted,
        
        // State setters (for external control if needed)
        setCurrentQuestionIndex,
        setShowContinuePrompt,
        setHasSavedProgress
    }
}