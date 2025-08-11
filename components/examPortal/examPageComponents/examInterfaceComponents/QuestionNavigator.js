"use client"

import React, { useState, useEffect } from "react"
import { VicharCard, VicharCardContent, VicharCardHeader, VicharCardTitle, VicharCardDescription } from "../../../ui/vichar-card"
import { ChevronDown, ChevronUp, Grid, BarChart3 } from "lucide-react"

export default function QuestionNavigator({ 
    questions, 
    answers, 
    markedQuestions, 
    currentQuestionIndex, 
    onGoToQuestion,
    visitedQuestions = new Set(),
    isCetExam = false,
    cetAccess = { allUnlocked: true },
    isMobileOverlay = false
}) {
    // Get all unique subjects from questions, filtering out locked subjects for CET exams
    const allSubjects = Array.from(new Set((questions || []).map(q => q.subject))).filter(subject => {
        if (!subject) return false
        // For CET exams, only show unlocked subjects
        if (isCetExam && cetAccess.subjectAccess && cetAccess.subjectAccess[subject]?.isLocked) {
            return false
        }
        return true
    })
    
    // Initialize with empty set - all subjects collapsed by default, or expand all for mobile overlay
    const [expandedSubjects, setExpandedSubjects] = useState(isMobileOverlay ? new Set(allSubjects) : new Set())
    
    // Find current question's subject
    const currentQuestion = questions[currentQuestionIndex]
    const currentSubject = currentQuestion?.subject
    
    // Group questions by subject
    const questionsBySubject = {}
    questions.forEach((question, index) => {
        const subject = question.subject || 'Other'
        if (!questionsBySubject[subject]) {
            questionsBySubject[subject] = []
        }
        questionsBySubject[subject].push({ question, originalIndex: index })
    })
    
    const toggleSubject = (subject) => {
        setExpandedSubjects(prev => {
            const newSet = new Set(prev)
            if (newSet.has(subject)) {
                newSet.delete(subject)
            } else {
                newSet.add(subject)
            }
            return newSet
        })
    }

    // Safe navigation that prevents going to locked subjects
    const handleSafeGoToQuestion = (globalIndex) => {
        const targetQuestion = questions[globalIndex]
        if (!targetQuestion) return
        
        // For CET exams, prevent navigation to locked subjects
        if (isCetExam && cetAccess.subjectAccess && cetAccess.subjectAccess[targetQuestion.subject]?.isLocked) {
            return // Block navigation to locked subjects
        }
        
        onGoToQuestion(globalIndex)
    }
    
    // Get subject-wise statistics
    const getSubjectStats = (subject) => {
        const subjectQuestions = questionsBySubject[subject] || []
        const answered = subjectQuestions.filter(({question}) => answers[question._id]).length
        const marked = subjectQuestions.filter(({originalIndex}) => markedQuestions.has(originalIndex)).length
        const visited = subjectQuestions.filter(({originalIndex}) => visitedQuestions.has(originalIndex)).length
        return { total: subjectQuestions.length, answered, marked, visited }
    }
    // Handle window resize for responsive behavior
    const [windowWidth, setWindowWidth] = useState(1024)
    
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    const [isCollapsed, setIsCollapsed] = useState(isMobileOverlay ? false : true)
    const [showGrid, setShowGrid] = useState(true)

    // Mobile-first grid configuration - optimized for subject-wise display
    const getGridCols = () => {
        // For subject-wise navigation, use smaller grids that work better in collapsed sections
        return "grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10"
    }

    // Mobile-optimized button sizes - consistent for subject-wise display
    const getButtonSize = () => {
        return "w-7 h-7 sm:w-9 sm:h-9 text-xs sm:text-sm"
    }


    return (
        <div className="w-full h-full flex flex-col">
            <VicharCard className="overflow-hidden flex-1 flex flex-col">
                {/* Collapsible Header */}
                <VicharCardHeader className={`${isMobileOverlay ? 'p-4 pt-12' : 'p-4'} flex-shrink-0 border-b border-gray-100`}>
                    <div 
                        className={`flex items-center justify-between ${isMobileOverlay ? 'cursor-default' : 'cursor-pointer lg:cursor-default'}`}
                        onClick={() => !isMobileOverlay && setIsCollapsed(!isCollapsed)}
                    >
                        <div className="flex items-center gap-2">
                            <Grid className="w-5 h-5 text-blue-600" />
                            <div>
                                <VicharCardTitle className="text-lg font-semibold text-gray-900">Question Navigator</VicharCardTitle>
                                <VicharCardDescription className="text-sm text-gray-600 mt-1">Tap to jump to any question</VicharCardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                    {currentQuestionIndex + 1}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">of {questions.length}</div>
                            </div>
                            {!isMobileOverlay && (
                                <button 
                                    className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsCollapsed(!isCollapsed)
                                    }}
                                >
                                    {isCollapsed ? 
                                        <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                </VicharCardHeader>
                {/* Collapsible Content */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-1 flex flex-col min-h-0 ${
                    isCollapsed && !isMobileOverlay ? 'max-h-0 lg:max-h-none lg:flex-1' : 'max-h-[1000px] lg:max-h-none lg:flex-1'
                }`}>
                    <VicharCardContent className={`${isMobileOverlay ? 'p-4 h-full overflow-y-auto' : 'p-4 flex-1 flex flex-col min-h-0'}`}>
                        {/* View Toggle - Always visible except when collapsed on mobile */}
                        {(!isCollapsed || windowWidth >= 1024 || isMobileOverlay) && (
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-gray-100 rounded-lg p-1 flex">
                                    <button
                                        onClick={() => setShowGrid(true)}
                                        className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                                            showGrid ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                                        }`}
                                    >
                                        <Grid className="w-4 h-4" />
                                        <span className="text-sm font-medium">Grid</span>
                                    </button>
                                    <button
                                        onClick={() => setShowGrid(false)}
                                        className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                                            !showGrid ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                                        }`}
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Stats</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Legend - Mobile Optimized - Above subjects for mobile */}
                        {(!isCollapsed || windowWidth >= 1024 || isMobileOverlay) && (showGrid || windowWidth >= 1024 || isMobileOverlay) && (
                            <div className="mb-4 pb-4 border-b border-gray-100">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-white border-2 border-gray-400 rounded-md flex-shrink-0"></div>
                                        <span className="font-medium text-gray-700">Not Visited</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-md flex-shrink-0"></div>
                                        <span className="font-medium text-gray-700">Not Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-md flex-shrink-0"></div>
                                        <span className="font-medium text-gray-700">Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-md flex-shrink-0"></div>
                                        <span className="font-medium text-gray-700">Marked</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-3 h-3 bg-purple-600 border border-green-500 rounded-md flex-shrink-0">
                                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-1 h-1 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="font-medium text-gray-700">Answered & Marked</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-600 rounded-md flex-shrink-0"></div>
                                        <span className="font-medium text-gray-700">Current</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Subject-wise Question Navigator */}
                        {showGrid && (
                            <div className={isMobileOverlay ? "space-y-2" : "flex-1 overflow-y-auto"}>
                                <div className={isMobileOverlay ? "space-y-2" : "space-y-2 p-1"}>
                                    {allSubjects.map(subject => {
                                        const stats = getSubjectStats(subject)
                                        const isExpanded = expandedSubjects.has(subject)
                                        const hasCurrentQuestion = currentSubject === subject
                                        
                                        return (
                                            <div key={subject} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {/* Subject Header */}
                                                <button
                                                    onClick={() => toggleSubject(subject)}
                                                    className={`w-full p-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                                        hasCurrentQuestion ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            hasCurrentQuestion ? 'bg-blue-600' : 'bg-gray-300'
                                                        }`}></div>
                                                        <div>
                                                            <h3 className={`font-semibold text-sm ${
                                                                hasCurrentQuestion ? 'text-blue-900' : 'text-gray-900'
                                                            }`}>{subject}</h3>
                                                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                                                <span>{stats.answered}/{stats.total} answered</span>
                                                                {stats.marked > 0 && <span>{stats.marked} marked</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-xs text-gray-600">{stats.answered}</span>
                                                        </div>
                                                        {stats.marked > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                <span className="text-xs text-gray-600">{stats.marked}</span>
                                                            </div>
                                                        )}
                                                        {isExpanded ? 
                                                            <ChevronUp className="w-4 h-4 text-gray-600" /> : 
                                                            <ChevronDown className="w-4 h-4 text-gray-600" />
                                                        }
                                                    </div>
                                                </button>
                                                
                                                {/* Questions Grid - Expandable */}
                                                {isExpanded && (
                                                    <div className="p-2.5 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                                        <div className={`grid ${getGridCols()} gap-1.5`}>
                                                            {questionsBySubject[subject]?.map(({question, originalIndex}, subjectQuestionIndex) => {
                                                const isAnswered = answers[question._id]
                                                const isMarked = markedQuestions.has(originalIndex)
                                                const isCurrent = originalIndex === currentQuestionIndex
                                                const isVisited = visitedQuestions.has(originalIndex)

                                // NSE Navigation States Logic
                                const getQuestionState = () => {
                                    if (isCurrent) return 'current'
                                    if (isAnswered && isMarked) return 'answered-marked'
                                    if (isAnswered && !isMarked) return 'answered'
                                    if (!isAnswered && isMarked) return 'marked-unanswered'
                                    if (!isAnswered && isVisited) return 'not-answered'
                                    return 'not-visited'
                                }

                                const state = getQuestionState()
                                const stateStyles = {
                                    'current': 'bg-blue-600 text-white shadow-lg scale-110',
                                    'not-visited': 'bg-white text-gray-700 border-2 border-gray-400 hover:bg-gray-50',
                                    'not-answered': 'bg-red-500 text-white hover:bg-red-600',
                                    'answered': 'bg-green-500 text-white hover:bg-green-600',
                                    'marked-unanswered': 'bg-purple-500 text-white hover:bg-purple-600',
                                    'answered-marked': 'bg-gradient-to-br from-purple-600 to-purple-700 text-white border-4 border-green-400 hover:from-purple-700 hover:to-purple-800 relative ring-2 ring-green-500 ring-offset-1'
                                }

                                const stateLabels = {
                                    'current': 'Current Question',
                                    'not-visited': 'Not Visited',
                                    'not-answered': 'Not Answered',
                                    'answered': 'Answered',
                                    'marked-unanswered': 'Marked for Review (Unanswered)',
                                    'answered-marked': 'Marked for Review (Answered)'
                                }

                                                return (
                                                    <button
                                                        key={originalIndex}
                                                        onClick={() => handleSafeGoToQuestion(originalIndex)}
                                                        className={`${getButtonSize()} rounded-xl font-bold transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-lg active:scale-95 relative touch-action-manipulation ${
                                                            stateStyles[state]
                                                        }`}
                                                        title={`Question ${subjectQuestionIndex + 1} (Global: ${originalIndex + 1}) - ${stateLabels[state]}`}
                                                    >
                                                        {subjectQuestionIndex + 1}
                                                        {/* Enhanced tick mark for answered-marked state */}
                                                        {state === 'answered-marked' && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10">
                                                                <svg className="w-3 h-3 text-white font-bold" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    
                                </div>
                            </div>
                        )}

                        {/* Subject-wise Statistics View */}
                        {!showGrid && (
                            <div className="space-y-4">
                                {/* Overall Progress Bar */}
                                <div className="bg-gray-100 rounded-full h-3">
                                    <div 
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                                    ></div>
                                </div>
                                
                                {/* Subject-wise Stats */}
                                <div className="space-y-3">
                                    {allSubjects.map(subject => {
                                        const stats = getSubjectStats(subject)
                                        const hasCurrentQuestion = currentSubject === subject
                                        const isExpanded = expandedSubjects.has(subject)
                                        
                                        return (
                                            <div key={subject} className={`border rounded-lg overflow-hidden ${
                                                hasCurrentQuestion ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                                            }`}>
                                                <button 
                                                    onClick={() => toggleSubject(subject)}
                                                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${
                                                                hasCurrentQuestion ? 'bg-blue-600' : 'bg-gray-300'
                                                            }`}></div>
                                                            <div>
                                                                <h3 className={`font-semibold text-sm ${
                                                                    hasCurrentQuestion ? 'text-blue-900' : 'text-gray-900'
                                                                }`}>{subject}</h3>
                                                                <div className="text-xs text-gray-600 mt-1">
                                                                    {stats.answered}/{stats.total} answered • {stats.marked} marked
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-xs text-gray-600">
                                                                {Math.round((stats.answered / stats.total) * 100)}%
                                                            </div>
                                                            {isExpanded ? 
                                                                <ChevronUp className="w-4 h-4 text-gray-600" /> : 
                                                                <ChevronDown className="w-4 h-4 text-gray-600" />
                                                            }
                                                        </div>
                                                    </div>
                                                </button>
                                                
                                                {isExpanded && (
                                                    <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                                        <div className="grid grid-cols-6 gap-2">
                                                            {questionsBySubject[subject]?.map(({question, originalIndex}, subjectQuestionIndex) => {
                                                                const isAnswered = answers[question._id]
                                                                const isMarked = markedQuestions.has(originalIndex)
                                                                const isCurrent = originalIndex === currentQuestionIndex
                                                                const isVisited = visitedQuestions.has(originalIndex)
                                                                
                                                                const getQuestionState = () => {
                                                                    if (isCurrent) return 'current'
                                                                    if (isAnswered && isMarked) return 'answered-marked'
                                                                    if (isAnswered && !isMarked) return 'answered'
                                                                    if (!isAnswered && isMarked) return 'marked-unanswered'
                                                                    if (!isAnswered && isVisited) return 'not-answered'
                                                                    return 'not-visited'
                                                                }
                                                                
                                                                const state = getQuestionState()
                                                                const stateStyles = {
                                                                    'current': 'bg-blue-600 text-white shadow-lg scale-110',
                                                                    'not-visited': 'bg-white text-gray-700 border-2 border-gray-400 hover:bg-gray-50',
                                                                    'not-answered': 'bg-red-500 text-white hover:bg-red-600',
                                                                    'answered': 'bg-green-500 text-white hover:bg-green-600',
                                                                    'marked-unanswered': 'bg-purple-500 text-white hover:bg-purple-600',
                                                                    'answered-marked': 'bg-gradient-to-br from-purple-600 to-purple-700 text-white border-2 border-green-400 hover:from-purple-700 hover:to-purple-800 relative ring-1 ring-green-500'
                                                                }
                                                                
                                                                return (
                                                                    <button
                                                                        key={originalIndex}
                                                                        onClick={() => handleSafeGoToQuestion(originalIndex)}
                                                                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-lg active:scale-95 relative touch-action-manipulation ${
                                                                            stateStyles[state]
                                                                        }`}
                                                                        title={`Question ${subjectQuestionIndex + 1} (Global: ${originalIndex + 1})`}
                                                                    >
                                                                        {subjectQuestionIndex + 1}
                                                                        {/* Enhanced tick mark for answered-marked state */}
                                                                        {state === 'answered-marked' && (
                                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10">
                                                                                <svg className="w-2.5 h-2.5 text-white font-bold" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                
                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => {
                                            // Find next unanswered question starting from current position
                                            let nextUnanswered = -1
                                            
                                            // First, look for unanswered questions after current position
                                            for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
                                                if (!answers[questions[i]?._id]) {
                                                    nextUnanswered = i
                                                    break
                                                }
                                            }
                                            
                                            // If not found after current position, wrap around and search from beginning
                                            if (nextUnanswered === -1) {
                                                for (let i = 0; i < currentQuestionIndex; i++) {
                                                    if (!answers[questions[i]?._id]) {
                                                        nextUnanswered = i
                                                        break
                                                    }
                                                }
                                            }
                                            
                                            if (nextUnanswered !== -1) handleSafeGoToQuestion(nextUnanswered)
                                        }}
                                        className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform"
                                    >
                                        Go to Next Unanswered
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const markedArray = Array.from(markedQuestions).sort((a, b) => a - b)
                                            if (markedArray.length === 0) return
                                            
                                            // Find next marked question after current position
                                            let nextMarked = markedArray.find(i => i > currentQuestionIndex)
                                            
                                            // If not found after current position, wrap around to first marked question
                                            if (nextMarked === undefined) {
                                                nextMarked = markedArray[0]
                                            }
                                            
                                            handleSafeGoToQuestion(nextMarked)
                                        }}
                                        className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform"
                                    >
                                        Go to Marked Questions
                                    </button>
                                </div>
                            </div>
                        )}
                    </VicharCardContent>
                </div>
            </VicharCard>
        </div>
    )
} 