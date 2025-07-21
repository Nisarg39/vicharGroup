"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/card"

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
        <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60 lg:sticky lg:top-24">
                <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Question Navigator</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Click to jump to any question</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {currentQuestionIndex + 1} / {questions.length}
                            </div>
                            <div className="text-xs text-gray-500">Current</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                    {/* Scrollable Question Grid */}
                    <div className={`overflow-y-auto ${getMaxHeight()} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
                        <div 
                            className={`grid ${getGridCols()}`}
                            style={{ gap: '8px' }}
                        >
                            {questions.map((_, index) => {
                                const isAnswered = answers[questions[index]?._id]
                                const isMarked = markedQuestions.has(index)
                                const isCurrent = index === currentQuestionIndex

                                return (
                                    <button
                                        key={index}
                                        onClick={() => onGoToQuestion(index)}
                                        className={`${getButtonSize()} p-1 m-1 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                                            isCurrent
                                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                : isAnswered
                                                ? isMarked
                                                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200'
                                                    : 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                                                : isMarked
                                                ? 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
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
                    <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded flex-shrink-0"></div>
                            <span className="truncate">Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-100 border-2 border-orange-300 rounded flex-shrink-0"></div>
                            <span className="truncate">Marked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded flex-shrink-0"></div>
                            <span className="truncate">Unanswered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded flex-shrink-0"></div>
                            <span className="truncate">Current</span>
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                                <div className="font-semibold text-green-600">{Object.keys(answers).length}</div>
                                <div className="text-gray-500">Answered</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-orange-600">{markedQuestions.size}</div>
                                <div className="text-gray-500">Marked</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-gray-600">{questions.length - Object.keys(answers).length}</div>
                                <div className="text-gray-500">Left</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 