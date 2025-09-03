"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { getSubjectUnlockSchedule } from '../../utils/examDurationHelpers'

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
 * @param {Object} timerData - Timer data containing startTime and isExamStarted for subject unlocking
 * @returns {Object} Navigation management state and functions
 */
export const useQuestionNavigation = (exam, questions, examState, timerData = null) => {
    const { currentQuestionIndex, setCurrentQuestionIndex, markQuestionVisited } = examState
    
    // Navigation state - defer initialization to useEffect to properly handle subject locking
    const [selectedSubject, setSelectedSubject] = useState("")
    const [showMobileNavigator, setShowMobileNavigator] = useState(false)
    
    // Real-time unlocking state - updates every minute for MHT-CET subject unlocking
    const [currentMinute, setCurrentMinute] = useState(Math.floor(Date.now() / 60000))
    
    // Navigation refs for managing state transitions
    const previousSubjectRef = useRef(selectedSubject)
    const subjectSwitchInProgressRef = useRef(false)
    const manualSubjectSelectionRef = useRef(false)
    const manualSelectionTimeoutRef = useRef(null)
    
    // Exam type detection - check both examType and stream for comprehensive detection
    const isJeeExam = exam?.examType?.toLowerCase() === 'jee' || 
                      exam?.stream?.toLowerCase()?.includes('jee')
    const isNeetExam = exam?.examType?.toLowerCase() === 'neet' || 
                       exam?.stream?.toLowerCase()?.includes('neet')
    const isCetExam = exam?.examType?.toLowerCase() === 'cet' || 
                      exam?.stream?.toLowerCase()?.includes('cet')
    const isCompetitiveExam = isJeeExam || isNeetExam || isCetExam
    
    /**
     * Get subject order based on exam type
     * Returns proper subject ordering for competitive exams
     */
    const getSubjectOrder = useCallback(() => {
        // Define proper subject order for each exam type
        if (isCetExam) {
            // CET: Physics → Chemistry → Mathematics → Biology
            return ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Maths', 'Math']
        }
        if (isJeeExam) {
            // JEE: Physics → Chemistry → Mathematics  
            return ['Physics', 'Chemistry', 'Mathematics', 'Maths', 'Math']
        }
        if (isNeetExam) {
            // NEET: Physics → Chemistry → Biology
            return ['Physics', 'Chemistry', 'Biology']
        }
        // Default: alphabetical order for other exam types
        return []
    }, [isCetExam, isJeeExam, isNeetExam])

    /**
     * Get all unique subjects from questions
     * Returns array of subject names in proper exam-specific order
     * Added safety checks to prevent TDZ errors
     */
    const getAllSubjects = useCallback(() => {
        try {
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                console.warn('⚠️ No questions available for subject extraction')
                return []
            }
            
            const subjects = [...new Set(questions
                .map(q => q?.subject)
                .filter(Boolean)
            )]
            
            // Apply exam-specific ordering for competitive exams
            if (isCompetitiveExam) {
                const subjectOrder = getSubjectOrder()
                const orderedSubjects = []
                
                // First, add subjects in the defined order
                subjectOrder.forEach(orderedSubject => {
                    if (subjects.includes(orderedSubject)) {
                        orderedSubjects.push(orderedSubject)
                    }
                })
                
                // Then add any remaining subjects not in the order (alphabetically)
                subjects.forEach(subject => {
                    if (!orderedSubjects.includes(subject)) {
                        orderedSubjects.push(subject)
                    }
                })
                
                console.log('📚 Applied exam-specific subject order:', {
                    examType: isCetExam ? 'CET' : isJeeExam ? 'JEE' : 'NEET',
                    originalOrder: subjects.sort(),
                    appliedOrder: orderedSubjects
                })
                
                return orderedSubjects
            }
            
            // For non-competitive exams, use alphabetical order
            return subjects.sort()
        } catch (error) {
            console.error('❌ Error getting subjects:', error)
            return []
        }
    }, [questions, isCompetitiveExam, getSubjectOrder])
    
    // Memoized subjects list
    const allSubjects = useMemo(() => getAllSubjects(), [getAllSubjects])
    
    /**
     * Get subject unlock schedule for competitive exams with real-time updates
     * Returns subject access information including locked status that updates every minute
     */
    const subjectUnlockSchedule = useMemo(() => {
        if (!timerData?.startTime || !timerData?.isExamStarted || !isCompetitiveExam) {
            return { allUnlocked: true, subjectAccess: {}, streamConfig: null }
        }
        
        try {
            // Force recalculation every minute for real-time unlocking
            const currentMinute = Math.floor(Date.now() / 60000)
            const schedule = getSubjectUnlockSchedule(exam, new Date(timerData.startTime))
            
            console.log('🔓 Subject unlock schedule calculated:', {
                examType: exam?.stream,
                currentMinute,
                allUnlocked: schedule.allUnlocked,
                lockedSubjects: Object.keys(schedule.subjectAccess || {}).filter(s => schedule.subjectAccess[s]?.isLocked)
            })
            
            return schedule
        } catch (error) {
            console.error('❌ Error getting subject unlock schedule:', error)
            return { allUnlocked: true, subjectAccess: {}, streamConfig: null }
        }
    }, [exam, timerData?.startTime, timerData?.isExamStarted, isCompetitiveExam, currentMinute])
    
    /**
     * Check if a specific subject is locked
     * @param {string} subject - Subject name to check
     * @returns {boolean} - True if subject is locked
     */
    const isSubjectLocked = useCallback((subject) => {
        if (!isCompetitiveExam || subjectUnlockSchedule.allUnlocked) {
            return false
        }
        
        // Check direct match first
        let subjectAccess = subjectUnlockSchedule.subjectAccess?.[subject]
        
        // For CET exams, check subject name variations
        if (isCetExam && !subjectAccess) {
            const subjectVariations = [subject]
            if (subject.toLowerCase().includes('math')) {
                subjectVariations.push('Mathematics', 'Maths', 'Math')
            } else if (subject === 'Maths') {
                subjectVariations.push('Mathematics', 'Math')
            } else if (subject === 'Mathematics') {
                subjectVariations.push('Maths', 'Math')
            } else if (subject === 'Biology') {
                subjectVariations.push('Bio')
            }
            
            for (const variation of subjectVariations) {
                const access = subjectUnlockSchedule.subjectAccess?.[variation]
                if (access) {
                    subjectAccess = access
                    break
                }
            }
        }
        
        return subjectAccess?.isLocked || false
    }, [isCompetitiveExam, isCetExam, subjectUnlockSchedule])
    
    /**
     * Get first available (unlocked) subject
     * Returns first subject that is not locked
     */
    const getFirstAvailableSubject = useCallback(() => {
        const orderedSubjects = getAllSubjects()
        
        for (const subject of orderedSubjects) {
            if (!isSubjectLocked(subject)) {
                return subject
            }
        }
        
        // Fallback: return first subject if none are available (shouldn't happen)
        return orderedSubjects[0] || ""
    }, [getAllSubjects, isSubjectLocked])
    
    /**
     * Find alternative navigation paths when current path is blocked
     * Returns list of available subjects that can be navigated to
     */
    const getAlternativeNavigationPaths = useCallback(() => {
        const alternatives = []
        
        allSubjects.forEach(subject => {
            if (subject !== selectedSubject && !isSubjectLocked(subject)) {
                alternatives.push(subject)
            }
        })
        
        return alternatives
    }, [allSubjects, selectedSubject, isSubjectLocked])
    
    /**
     * Provide navigation suggestions when blocked
     * Shows toast with alternative subjects that can be accessed
     */
    const showNavigationAlternatives = useCallback(() => {
        const alternatives = getAlternativeNavigationPaths()
        
        if (alternatives.length > 0) {
            const alternativeList = alternatives.slice(0, 3).join(', ') // Show max 3 alternatives
            const moreCount = alternatives.length > 3 ? ` (+${alternatives.length - 3} more)` : ''
            toast.success(`Alternative subjects available: ${alternativeList}${moreCount}. Click on subject tabs to navigate.`, {
                duration: 5000
            })
        } else {
            toast.error('No alternative subjects are currently available.')
        }
    }, [getAlternativeNavigationPaths])
    
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
     * Handles both within-subject and cross-subject navigation with subject lock validation
     */
    const handlePrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            // Move to previous question in current subject
            setCurrentQuestionIndex(prev => prev - 1)
        } else {
            // At first question of current subject, check if there's a previous subject
            const currentSubjectIndex = allSubjects.indexOf(selectedSubject)
            if (currentSubjectIndex > 0) {
                // Find the nearest unlocked previous subject
                let targetSubjectIndex = currentSubjectIndex - 1
                let foundUnlockedSubject = false
                
                // Search backwards for an unlocked subject
                while (targetSubjectIndex >= 0) {
                    const targetSubject = allSubjects[targetSubjectIndex]
                    
                    if (!isSubjectLocked(targetSubject)) {
                        const prevSubjectQuestions = (questions || []).filter(q => q.subject === targetSubject)
                        
                        // Switch to unlocked previous subject and go to its last question
                        setSelectedSubject(targetSubject)
                        setCurrentQuestionIndex(prevSubjectQuestions.length - 1)
                        
                        console.log('🔙 Navigated to previous unlocked subject:', targetSubject)
                        foundUnlockedSubject = true
                        break
                    }
                    
                    targetSubjectIndex--
                }
                
                // If no unlocked previous subject found, show feedback with alternatives
                if (!foundUnlockedSubject) {
                    const immediateNextSubject = allSubjects[currentSubjectIndex - 1]
                    if (isSubjectLocked(immediateNextSubject)) {
                        console.log('⚠️ Cannot navigate to previous subject - subject is locked:', immediateNextSubject)
                        toast.error(`Cannot navigate to ${immediateNextSubject} - subject is locked. Complete the current subject or wait for the unlock time.`)
                        
                        // Show alternative navigation options after a brief delay
                        setTimeout(() => {
                            showNavigationAlternatives()
                        }, 1500)
                    }
                }
            }
        }
    }, [currentQuestionIndex, selectedSubject, allSubjects, questions, setCurrentQuestionIndex, isSubjectLocked, showNavigationAlternatives])
    
    /**
     * Navigate to next question
     * Handles both within-subject and cross-subject navigation with subject lock validation
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
                // Find the nearest unlocked next subject
                let targetSubjectIndex = currentSubjectIndex + 1
                let foundUnlockedSubject = false
                
                // Search forwards for an unlocked subject
                while (targetSubjectIndex < allSubjects.length) {
                    const targetSubject = allSubjects[targetSubjectIndex]
                    
                    if (!isSubjectLocked(targetSubject)) {
                        // Move to first question of unlocked next subject
                        setSelectedSubject(targetSubject)
                        setCurrentQuestionIndex(0)
                        
                        console.log('⏭️ Navigated to next unlocked subject:', targetSubject)
                        foundUnlockedSubject = true
                        break
                    }
                    
                    targetSubjectIndex++
                }
                
                // If no unlocked next subject found, show feedback with alternatives
                if (!foundUnlockedSubject) {
                    const immediateNextSubject = allSubjects[currentSubjectIndex + 1]
                    if (isSubjectLocked(immediateNextSubject)) {
                        console.log('⚠️ Cannot navigate to next subject - subject is locked:', immediateNextSubject)
                        
                        // Get subject access info for better user feedback
                        const subjectAccess = subjectUnlockSchedule.subjectAccess?.[immediateNextSubject]
                        const unlockTime = subjectAccess?.unlockTime
                        
                        if (unlockTime) {
                            const unlockTimeFormatted = new Date(unlockTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            toast.error(`${immediateNextSubject} is locked and will unlock at ${unlockTimeFormatted}. Please wait or navigate to another available subject.`)
                        } else {
                            toast.error(`Cannot navigate to ${immediateNextSubject} - subject is locked. Complete the current subject or wait for the unlock time.`)
                        }
                        
                        // Show alternative navigation options after a brief delay
                        setTimeout(() => {
                            showNavigationAlternatives()
                        }, 1500)
                    }
                }
            }
        }
    }, [currentQuestionIndex, subjectQuestions, selectedSubject, allSubjects, setCurrentQuestionIndex, isSubjectLocked, subjectUnlockSchedule, showNavigationAlternatives])
    
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
     * Respects subject locking rules for competitive exams
     */
    const switchToSubject = useCallback((subject) => {
        if (!allSubjects.includes(subject)) {
            console.warn('⚠️ Invalid subject:', subject)
            return false
        }
        
        // Check if subject is locked for competitive exams
        if (isSubjectLocked(subject)) {
            console.warn('⚠️ Cannot switch to locked subject:', subject)
            // Show user-friendly message but don't prevent the switch completely
            // Let the parent component handle the error display
            return false
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
        return true
    }, [allSubjects, isSubjectLocked, setCurrentQuestionIndex])
    
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
    
    // Initialize subject selection with proper ordering and locking rules when questions load
    useEffect(() => {
        if (questions && questions.length > 0 && (!selectedSubject || selectedSubject === "")) {
            const firstAvailableSubject = getFirstAvailableSubject()
            if (firstAvailableSubject) {
                console.log('🔄 Auto-selecting first available subject with proper ordering and locking:', {
                    firstAvailableSubject,
                    allOrderedSubjects: getAllSubjects(),
                    examType: isCetExam ? 'CET' : isJeeExam ? 'JEE' : isNeetExam ? 'NEET' : 'Other',
                    isCompetitiveExam,
                    subjectsLocked: isCompetitiveExam ? getAllSubjects().filter(s => isSubjectLocked(s)) : []
                })
                setSelectedSubject(firstAvailableSubject)
            }
        }
    }, [
        questions, 
        selectedSubject, 
        getFirstAvailableSubject, 
        getAllSubjects,
        isSubjectLocked,
        isCetExam, 
        isJeeExam, 
        isNeetExam, 
        isCompetitiveExam
    ])
    
    // Real-time minute updates for subject unlocking
    useEffect(() => {
        if (!isCompetitiveExam || !timerData?.isExamStarted) return

        const updateMinute = () => {
            setCurrentMinute(Math.floor(Date.now() / 60000))
        }

        // Update every minute
        const interval = setInterval(updateMinute, 60000)
        
        return () => clearInterval(interval)
    }, [isCompetitiveExam, timerData?.isExamStarted])

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
        
        // Subject locking information
        subjectUnlockSchedule,
        isSubjectLocked,
        getFirstAvailableSubject,
        getAlternativeNavigationPaths,
        showNavigationAlternatives,
        
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