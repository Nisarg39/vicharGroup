"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'

/**
 * Question Navigation Management Hook
 * 
 * Manages question navigation, subject switching, mobile navigator state,
 * and related navigation logic. Extracted from ExamInterface.js to improve
 * code organization and maintainability.
 * 
 * @param {Object} exam - Exam object
 * @param {Array} questions - Array of exam questions
 * @param {Object} examState - Exam state from useExamState hook
 * @returns {Object} Navigation management state and functions
 */
export const useQuestionNavigation = (exam, questions, examState) => {
    const { currentQuestionIndex, setCurrentQuestionIndex, markQuestionVisited } = examState
    
    // Navigation state
    const [selectedSubject, setSelectedSubject] = useState(() => {
        // Initialize with first available subject
        const firstAvailableSubject = getAllSubjects()[0] || ""
        return firstAvailableSubject
    })
    
    const [showMobileNavigator, setShowMobileNavigator] = useState(false)
    
    // Navigation refs for managing state transitions
    const previousSubjectRef = useRef(selectedSubject)
    const subjectSwitchInProgressRef = useRef(false)
    const manualSubjectSelectionRef = useRef(false)
    const manualSelectionTimeoutRef = useRef(null)
    
    // Exam type detection
    const isJeeExam = exam?.examType?.toLowerCase() === 'jee'
    const isNeetExam = exam?.examType?.toLowerCase() === 'neet' 
    const isCetExam = exam?.examType?.toLowerCase() === 'cet'
    const isCompetitiveExam = isJeeExam || isNeetExam || isCetExam
    
    /**
     * Get all unique subjects from questions
     * Returns array of subject names
     */
    const getAllSubjects = useCallback(() => {
        if (!questions || questions.length === 0) return []
        
        const subjects = [...new Set(questions.map(q => q.subject))].filter(Boolean)
        return subjects.sort() // Consistent ordering
    }, [questions])
    
    // Memoized subjects list
    const allSubjects = useMemo(() => getAllSubjects(), [getAllSubjects])
    
    /**
     * Get questions for current selected subject
     * Returns filtered and sorted questions for the subject
     */
    const getSubjectQuestions = useCallback(() => {
        const filtered = (questions || []).filter(q => q.subject === selectedSubject)
        
        if (isJeeExam) {
            // Sort JEE questions by section first, then by question order
            return filtered.sort((a, b) => {
                const sectionA = a.section || 1
                const sectionB = b.section || 1
                
                if (sectionA !== sectionB) {
                    return sectionA - sectionB
                }
                
                // Within same section, maintain original order or sort by ID
                return (a.order || 0) - (b.order || 0)
            })
        }
        
        return filtered
    }, [questions, selectedSubject, isJeeExam])
    
    // Memoized subject questions
    const subjectQuestions = useMemo(() => getSubjectQuestions(), [getSubjectQuestions])
    
    /**
     * Get current question from subject questions
     * Returns current question object or null
     */
    const getCurrentQuestion = useCallback(() => {
        return subjectQuestions && subjectQuestions.length > 0 
            ? subjectQuestions[currentQuestionIndex] 
            : null
    }, [subjectQuestions, currentQuestionIndex])
    
    /**
     * Get global question index from subject-relative index
     * Converts local question index to global questions array index
     */
    const getGlobalQuestionIndex = useCallback((subjectRelativeIndex, subject) => {
        const filtered = (questions || []).filter(q => q.subject === subject)
        
        let sortedSubjectQuestions
        if (isJeeExam) {
            sortedSubjectQuestions = filtered.sort((a, b) => {
                const sectionA = a.section || 1
                const sectionB = b.section || 1
                
                if (sectionA !== sectionB) {
                    return sectionA - sectionB
                }
                
                return (a.order || 0) - (b.order || 0)
            })
        } else {
            sortedSubjectQuestions = filtered
        }
        
        if (!sortedSubjectQuestions[subjectRelativeIndex]) {
            return -1
        }
        
        const targetQuestion = sortedSubjectQuestions[subjectRelativeIndex]
        return questions.findIndex(q => q._id === targetQuestion._id)
    }, [questions, isJeeExam])
    
    /**
     * Navigate to previous question
     * Handles both within-subject and cross-subject navigation
     */
    const handlePrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            // Move to previous question in current subject
            setCurrentQuestionIndex(prev => prev - 1)
        } else {
            // At first question of current subject, check if there's a previous subject
            const currentSubjectIndex = allSubjects.indexOf(selectedSubject)
            if (currentSubjectIndex > 0) {
                const prevSubject = allSubjects[currentSubjectIndex - 1]
                const prevSubjectQuestions = (questions || []).filter(q => q.subject === prevSubject)
                
                // Switch to previous subject and go to its last question
                setSelectedSubject(prevSubject)
                setCurrentQuestionIndex(prevSubjectQuestions.length - 1)
                
                console.log('🔙 Navigated to previous subject:', prevSubject)
            }
        }
    }, [currentQuestionIndex, selectedSubject, allSubjects, questions, setCurrentQuestionIndex])
    
    /**
     * Navigate to next question
     * Handles both within-subject and cross-subject navigation
     */
    const handleNext = useCallback(() => {
        const totalSubjectQuestions = subjectQuestions ? subjectQuestions.length : 0
        
        if (currentQuestionIndex < totalSubjectQuestions - 1) {
            // Move to next question in current subject
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            // At last question of current subject, check if there's a next subject
            const currentSubjectIndex = allSubjects.indexOf(selectedSubject)
            if (currentSubjectIndex < allSubjects.length - 1) {
                // Move to first question of next subject
                const nextSubject = allSubjects[currentSubjectIndex + 1]
                setSelectedSubject(nextSubject)
                setCurrentQuestionIndex(0)
                
                console.log('⏭️ Navigated to next subject:', nextSubject)
            }
        }
    }, [currentQuestionIndex, subjectQuestions, selectedSubject, allSubjects, setCurrentQuestionIndex])
    
    /**
     * Navigate to specific question by global index
     * Switches subject if needed and navigates to the question
     */
    const handleNavigatorGoToQuestion = useCallback((globalIndex) => {
        const targetQuestion = questions[globalIndex]
        if (!targetQuestion) {
            console.warn('⚠️ Target question not found for global index:', globalIndex)
            return
        }
        
        // Switch to the subject of the target question if different
        if (targetQuestion.subject !== selectedSubject) {
            setSelectedSubject(targetQuestion.subject)
            
            // Mark as manual selection to prevent auto-switching
            manualSubjectSelectionRef.current = true
            if (manualSelectionTimeoutRef.current) {
                clearTimeout(manualSelectionTimeoutRef.current)
            }
            manualSelectionTimeoutRef.current = setTimeout(() => {
                manualSubjectSelectionRef.current = false
            }, 5000) // 5 second delay before allowing auto-switching again
        }
        
        // Get the sorted subject questions for the target subject
        const filtered = (questions || []).filter(q => q.subject === targetQuestion.subject)
        let sortedSubjectQuestions
        
        if (isJeeExam) {
            sortedSubjectQuestions = filtered.sort((a, b) => {
                const sectionA = a.section || 1
                const sectionB = b.section || 1
                
                if (sectionA !== sectionB) {
                    return sectionA - sectionB
                }
                
                return (a.order || 0) - (b.order || 0)
            })
        } else {
            sortedSubjectQuestions = filtered
        }
        
        // Find the local index within the subject
        const localIndex = sortedSubjectQuestions.findIndex(q => q._id === targetQuestion._id)
        if (localIndex !== -1) {
            setCurrentQuestionIndex(localIndex)
            markQuestionVisited(globalIndex)
            
            console.log('🎯 Navigated to question:', {
                globalIndex,
                subject: targetQuestion.subject,
                localIndex
            })
        }
    }, [questions, selectedSubject, isJeeExam, setCurrentQuestionIndex, markQuestionVisited])
    
    /**
     * Switch to specific subject
     * Updates selected subject and resets question index
     */
    const switchToSubject = useCallback((subject) => {
        if (!allSubjects.includes(subject)) {
            console.warn('⚠️ Invalid subject:', subject)
            return
        }
        
        setSelectedSubject(subject)
        setCurrentQuestionIndex(0)
        
        // Mark as manual selection
        manualSubjectSelectionRef.current = true
        if (manualSelectionTimeoutRef.current) {
            clearTimeout(manualSelectionTimeoutRef.current)
        }
        manualSelectionTimeoutRef.current = setTimeout(() => {
            manualSubjectSelectionRef.current = false
        }, 5000)
        
        console.log('🔄 Switched to subject:', subject)
    }, [allSubjects, setCurrentQuestionIndex])
    
    /**
     * Get navigation statistics
     * Returns current navigation state information
     */
    const getNavigationStats = useCallback(() => {
        const totalQuestions = subjectQuestions ? subjectQuestions.length : 0
        const currentSubjectIndex = allSubjects.indexOf(selectedSubject)
        const isFirstSubject = currentSubjectIndex === 0
        const isLastSubject = currentSubjectIndex === allSubjects.length - 1
        const isFirstQuestion = currentQuestionIndex === 0
        const isLastQuestion = currentQuestionIndex === totalQuestions - 1
        
        return {
            totalQuestions,
            currentSubjectIndex,
            totalSubjects: allSubjects.length,
            isFirstSubject,
            isLastSubject,
            isFirstQuestion,
            isLastQuestion,
            canGoBack: !isFirstSubject || !isFirstQuestion,
            canGoNext: !isLastSubject || !isLastQuestion
        }
    }, [subjectQuestions, allSubjects, selectedSubject, currentQuestionIndex])
    
    // Reset current question index when subject changes
    useEffect(() => {
        if (previousSubjectRef.current !== selectedSubject) {
            previousSubjectRef.current = selectedSubject
            setCurrentQuestionIndex(0)
        }
    }, [selectedSubject, setCurrentQuestionIndex])
    
    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (manualSelectionTimeoutRef.current) {
                clearTimeout(manualSelectionTimeoutRef.current)
            }
        }
    }, [])
    
    // Debug logging for navigation state changes
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🧭 Navigation state updated:', {
                selectedSubject,
                currentQuestionIndex,
                totalSubjectQuestions: subjectQuestions?.length || 0,
                totalSubjects: allSubjects.length
            })
        }
    }, [selectedSubject, currentQuestionIndex, subjectQuestions?.length, allSubjects.length])
    
    return {
        // State
        selectedSubject,
        showMobileNavigator,
        allSubjects,
        subjectQuestions,
        
        // Computed values
        currentQuestion: getCurrentQuestion(),
        navigationStats: getNavigationStats(),
        
        // Refs
        subjectSwitchInProgressRef,
        manualSubjectSelectionRef,
        manualSelectionTimeoutRef,
        
        // Actions
        handlePrevious,
        handleNext,
        handleNavigatorGoToQuestion,
        switchToSubject,
        getGlobalQuestionIndex,
        
        // State setters
        setSelectedSubject,
        setShowMobileNavigator,
        
        // Exam type flags
        isJeeExam,
        isNeetExam,
        isCetExam,
        isCompetitiveExam
    }
}