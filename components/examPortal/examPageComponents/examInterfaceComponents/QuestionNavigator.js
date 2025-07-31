"use client"

import { VicharCard, VicharCardContent, VicharCardHeader, VicharCardTitle, VicharCardDescription } from "../../../ui/vichar-card"

export default function QuestionNavigator({ 
    questions, 
    answers, 
    markedQuestions, 
    currentQuestionIndex, 
    onGoToQuestion,
    visitedQuestions = new Set() 
}) {
    // Calculate optimal grid columns based on question count and screen size
    const getGridCols = () => {
        const questionCount = questions.length
        
        if (questionCount <= 20) {
            return "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5"
        } else if (questionCount <= 50) {
            return "grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6"
        } else if (questionCount <= 100) {
            return "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-8"
        } else {
            return "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10"
        }
    }

    // Calculate button size based on question count
    const getButtonSize = () => {
        const questionCount = questions.length
        
        if (questionCount <= 20) {
            return "w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
        } else if (questionCount <= 50) {
            return "w-7 h-7 sm:w-9 sm:h-9 text-xs"
        } else if (questionCount <= 100) {
            return "w-6 h-6 sm:w-8 sm:h-8 text-xs"
        } else {
            return "w-5 h-5 sm:w-7 sm:h-7 text-xs"
        }
    }

    // Calculate max height for scrollable container
    const getMaxHeight = () => {
        const questionCount = questions.length
        
        if (questionCount <= 20) {
            return "max-h-48 sm:max-h-64 lg:max-h-72"
        } else if (questionCount <= 50) {
            return "max-h-56 sm:max-h-80 lg:max-h-96"
        } else if (questionCount <= 100) {
            return "max-h-64 sm:max-h-96 lg:max-h-[28rem]"
        } else {
            return "max-h-72 sm:max-h-[28rem] lg:max-h-[32rem]"
        }
    }

    return (
        <div className="w-full h-full">
            <VicharCard className="h-full flex flex-col">
                <VicharCardHeader className="p-4 flex-shrink-0 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <VicharCardTitle className="text-lg font-semibold text-gray-900">Question Navigator</VicharCardTitle>
                            <VicharCardDescription className="text-sm text-gray-600 mt-1">Tap to jump to any question</VicharCardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                                {currentQuestionIndex + 1}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">of {questions.length}</div>
                        </div>
                    </div>
                </VicharCardHeader>
                <VicharCardContent className="p-4 flex-1 flex flex-col min-h-0">
                    {/* Scrollable Question Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className={`grid ${getGridCols()} gap-3`}>
                            {questions.map((_, index) => {
                                const isAnswered = answers[questions[index]?._id]
                                const isMarked = markedQuestions.has(index)
                                const isCurrent = index === currentQuestionIndex
                                const isVisited = visitedQuestions.has(index)

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
                                    'answered-marked': 'bg-purple-600 text-white border-2 border-green-500 hover:bg-purple-700 relative'
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
                                        key={index}
                                        onClick={() => onGoToQuestion(index)}
                                        className={`${getButtonSize()} rounded-lg font-semibold transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 relative ${
                                            stateStyles[state]
                                        }`}
                                        title={`Question ${index + 1} - ${stateLabels[state]}`}
                                    >
                                        {index + 1}
                                        {/* Tick mark for answered-marked state */}
                                        {state === 'answered-marked' && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Legend - Mobile Optimized */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
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
                                <div className="w-3 h-3 bg-blue-600 rounded-md flex-shrink-0"></div>
                                <span className="font-medium text-gray-700">Current</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-green-50 rounded-lg py-2 px-3 text-center">
                                <div className="text-lg font-bold text-green-600">{Object.keys(answers).length}</div>
                                <div className="text-xs text-green-700 font-medium">Answered</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg py-2 px-3 text-center">
                                <div className="text-lg font-bold text-purple-600">{markedQuestions.size}</div>
                                <div className="text-xs text-purple-700 font-medium">Marked</div>
                            </div>
                            <div className="bg-red-50 rounded-lg py-2 px-3 text-center">
                                <div className="text-lg font-bold text-red-600">{visitedQuestions.size - Object.keys(answers).length}</div>
                                <div className="text-xs text-red-700 font-medium">Unanswered</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg py-2 px-3 text-center">
                                <div className="text-lg font-bold text-gray-600">{questions.length - visitedQuestions.size}</div>
                                <div className="text-xs text-gray-700 font-medium">Not Visited</div>
                            </div>
                        </div>
                    </div>
                </VicharCardContent>
            </VicharCard>
        </div>
    )
} 