"use client"

import { VicharCard, VicharCardContent, VicharCardHeader, VicharCardTitle, VicharCardDescription } from "../../../ui/vichar-card"

export default function QuestionNavigator({ 
    questions, 
    answers, 
    markedQuestions, 
    currentQuestionIndex, 
    onGoToQuestion 
}) {
    // Calculate optimal grid columns based on question count and screen size
    const getGridCols = () => {
        const questionCount = questions.length
        
        if (questionCount <= 20) {
            return "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
        } else if (questionCount <= 50) {
            return "grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10"
        } else if (questionCount <= 100) {
            return "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
        } else {
            return "grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15"
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
            return "max-h-64 sm:max-h-72"
        } else if (questionCount <= 50) {
            return "max-h-80 sm:max-h-96"
        } else if (questionCount <= 100) {
            return "max-h-96 sm:max-h-[28rem]"
        } else {
            return "max-h-[28rem] sm:max-h-[32rem]"
        }
    }

    return (
        <div className="w-full">
            <VicharCard className="bg-white shadow-xl border border-gray-200 rounded-2xl lg:sticky lg:top-24">
                <VicharCardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <VicharCardTitle className="text-lg font-bold text-gray-900">Question Navigator</VicharCardTitle>
                            <VicharCardDescription className="text-sm text-gray-600">Click to jump to any question</VicharCardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-blue-600">
                                {currentQuestionIndex + 1} / {questions.length}
                            </div>
                            <div className="text-xs text-gray-500">Current</div>
                        </div>
                    </div>
                </VicharCardHeader>
                <VicharCardContent className="p-4">
                    {/* Scrollable Question Grid */}
                    <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, index) => {
                                const isAnswered = answers[questions[index]?._id]
                                const isMarked = markedQuestions.has(index)
                                const isCurrent = index === currentQuestionIndex

                                return (
                                    <button
                                        key={index}
                                        onClick={() => onGoToQuestion(index)}
                                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center text-sm shadow-md hover:shadow-lg transform hover:scale-105 ${
                                            isCurrent
                                                ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                : isAnswered
                                                ? isMarked
                                                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200'
                                                    : 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                                                : isMarked
                                                ? 'bg-orange-50 text-orange-600 border-2 border-orange-200 hover:bg-orange-100'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                        }`}
                                        title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}${isMarked ? ' (Marked)' : ''}`}
                                    >
                                        {index + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded-lg flex-shrink-0"></div>
                            <span className="font-medium text-gray-700">Answered</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded-lg flex-shrink-0"></div>
                            <span className="font-medium text-gray-700">Marked for Review</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-lg flex-shrink-0"></div>
                            <span className="font-medium text-gray-700">Not Answered</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-blue-600 rounded-lg flex-shrink-0"></div>
                            <span className="font-medium text-gray-700">Current Question</span>
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-green-50 rounded-xl py-3 px-2">
                                <div className="text-lg font-bold text-green-600">{Object.keys(answers).length}</div>
                                <div className="text-xs text-green-700 font-medium">Answered</div>
                            </div>
                            <div className="bg-orange-50 rounded-xl py-3 px-2">
                                <div className="text-lg font-bold text-orange-600">{markedQuestions.size}</div>
                                <div className="text-xs text-orange-700 font-medium">Marked</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl py-3 px-2">
                                <div className="text-lg font-bold text-gray-600">{questions.length - Object.keys(answers).length}</div>
                                <div className="text-xs text-gray-700 font-medium">Remaining</div>
                            </div>
                        </div>
                    </div>
                </VicharCardContent>
            </VicharCard>
        </div>
    )
} 