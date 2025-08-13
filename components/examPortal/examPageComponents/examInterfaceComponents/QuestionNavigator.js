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
    isJeeExam = false,
    selectedSubject = null,
    isMobileOverlay = false
}) {
    // Find current question's subject
    const currentQuestion = questions[currentQuestionIndex]
    const currentSubject = currentQuestion?.subject
    
    // Filter questions for the selected subject only
    const selectedSubjectQuestions = (questions || []).filter(q => q.subject === selectedSubject);
    
    // Apply JEE sorting if needed
    let sortedSelectedSubjectQuestions;
    if (isJeeExam) {
        sortedSelectedSubjectQuestions = selectedSubjectQuestions.sort((a, b) => {
            // Sort by section: Section A (1) before Section B (2), then by questionNumber
            const sectionA = a.section || 1;
            const sectionB = b.section || 1;
            
            if (sectionA !== sectionB) {
                return sectionA - sectionB;
            }
            
            return (a.questionNumber || 0) - (b.questionNumber || 0);
        });
    } else {
        sortedSelectedSubjectQuestions = selectedSubjectQuestions;
    }
    
    // Create array with original indices for navigation
    const selectedSubjectQuestionsWithIndices = sortedSelectedSubjectQuestions.map(question => ({
        question,
        originalIndex: questions.findIndex(q => q._id === question._id)
    }));
    
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
    
    // Get statistics for the selected subject
    const getSelectedSubjectStats = () => {
        const answered = selectedSubjectQuestionsWithIndices.filter(({question}) => answers[question._id]).length
        const marked = selectedSubjectQuestionsWithIndices.filter(({originalIndex}) => markedQuestions.has(originalIndex)).length
        const visited = selectedSubjectQuestionsWithIndices.filter(({originalIndex}) => visitedQuestions.has(originalIndex)).length
        return { 
            total: selectedSubjectQuestionsWithIndices.length, 
            answered, 
            marked, 
            visited,
            subject: selectedSubject 
        }
    }
    
    const stats = getSelectedSubjectStats();
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
                                <VicharCardTitle className="text-lg font-semibold text-gray-900">
                                    {selectedSubject} Navigator
                                </VicharCardTitle>
                                <VicharCardDescription className="text-sm text-gray-600 mt-1">
                                    {stats.answered}/{stats.total} answered • {stats.marked} marked
                                </VicharCardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                    {selectedSubjectQuestionsWithIndices.findIndex(({originalIndex}) => originalIndex === currentQuestionIndex) + 1}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">of {stats.total}</div>
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

                        {/* Selected Subject Question Navigator */}
                        {showGrid && (
                            <div className={isMobileOverlay ? "space-y-2" : "flex-1 overflow-y-auto"}>
                                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className={`grid ${getGridCols()} gap-1.5`}>
                                        {selectedSubjectQuestionsWithIndices.map(({question, originalIndex}, subjectQuestionIndex) => {
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
                                    title={`Question ${subjectQuestionIndex + 1} - ${stateLabels[state]}`}
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
                            </div>
                        )}

                        {/* Selected Subject Statistics View */}
                        {!showGrid && (
                            <div className="space-y-4">
                                {/* Progress Bar for Selected Subject */}
                                <div className="bg-gray-100 rounded-full h-3">
                                    <div 
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${(stats.answered / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                                
                                {/* Selected Subject Stats */}
                                <div className="space-y-3">
                                    <div className="border border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
                                        <div className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm text-blue-900">{selectedSubject}</h3>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {stats.answered}/{stats.total} answered • {stats.marked} marked
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold text-blue-600">
                                                    {Math.round((stats.answered / stats.total) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                                            <div className="grid grid-cols-6 gap-2">
                                                {selectedSubjectQuestionsWithIndices.map(({question, originalIndex}, subjectQuestionIndex) => {
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
                                                            title={`Question ${subjectQuestionIndex + 1}`}
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
                                    </div>
                                </div>
                                
                                {/* Quick Actions for Selected Subject */}
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => {
                                            // Find next unanswered question in selected subject
                                            const currentSubjectIndex = selectedSubjectQuestionsWithIndices.findIndex(({originalIndex}) => originalIndex === currentQuestionIndex);
                                            let nextUnanswered = -1
                                            
                                            // First, look for unanswered questions after current position in subject
                                            for (let i = currentSubjectIndex + 1; i < selectedSubjectQuestionsWithIndices.length; i++) {
                                                if (!answers[selectedSubjectQuestionsWithIndices[i].question._id]) {
                                                    nextUnanswered = selectedSubjectQuestionsWithIndices[i].originalIndex
                                                    break
                                                }
                                            }
                                            
                                            // If not found after current position, wrap around to beginning of subject
                                            if (nextUnanswered === -1) {
                                                for (let i = 0; i < currentSubjectIndex; i++) {
                                                    if (!answers[selectedSubjectQuestionsWithIndices[i].question._id]) {
                                                        nextUnanswered = selectedSubjectQuestionsWithIndices[i].originalIndex
                                                        break
                                                    }
                                                }
                                            }
                                            
                                            if (nextUnanswered !== -1) handleSafeGoToQuestion(nextUnanswered)
                                        }}
                                        className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform"
                                    >
                                        Go to Next Unanswered in {selectedSubject}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            // Find marked questions in selected subject only
                                            const markedInSubject = selectedSubjectQuestionsWithIndices
                                                .filter(({originalIndex}) => markedQuestions.has(originalIndex))
                                                .map(({originalIndex}) => originalIndex)
                                                .sort((a, b) => a - b)
                                            
                                            if (markedInSubject.length === 0) return
                                            
                                            // Find next marked question after current position in subject
                                            let nextMarked = markedInSubject.find(i => i > currentQuestionIndex)
                                            
                                            // If not found after current position, wrap around to first marked question in subject
                                            if (nextMarked === undefined) {
                                                nextMarked = markedInSubject[0]
                                            }
                                            
                                            handleSafeGoToQuestion(nextMarked)
                                        }}
                                        className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform"
                                    >
                                        Go to Marked in {selectedSubject}
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