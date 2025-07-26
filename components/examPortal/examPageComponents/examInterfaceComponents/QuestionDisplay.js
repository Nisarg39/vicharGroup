"use client"

import { Badge } from "../../../ui/badge"
import { RadioGroup, RadioGroupItem } from "../../../ui/radio-group"
import { Checkbox } from "../../../ui/checkbox"
import { Textarea } from "../../../ui/textarea"
import { Label } from "../../../ui/label"
import { Flag, AlertTriangle } from "lucide-react"

export default function QuestionDisplay({ 
    currentQuestion, 
    currentQuestionIndex, 
    totalQuestions, 
    markedQuestions, 
    userAnswer, 
    onAnswerChange, 
    onMultipleAnswerChange 
}) {
    if (!currentQuestion) {
        return (
            <div className="p-4 sm:p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading question...</p>
            </div>
        )
    }

    const questionId = currentQuestion._id

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs sm:text-sm font-semibold">
                        Q{currentQuestionIndex + 1} of {totalQuestions}
                    </Badge>
                    {markedQuestions.has(currentQuestionIndex) && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs sm:text-sm">
                            <Flag className="w-3 h-3 mr-1" />
                            Marked
                        </Badge>
                    )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    {currentQuestion.marks || 4} marks
                </div>
            </div>

            {/* Question */}
            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                        Q{currentQuestionIndex + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div 
                            className="text-base sm:text-lg text-gray-900 leading-relaxed break-words"
                            dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                        />
                    </div>
                </div>

                {/* Question Type Badge */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs">
                        {currentQuestion.isMultipleAnswer ? 'Multiple Choice' : 'Single Choice'}
                    </Badge>
                    {currentQuestion.difficultyLevel && (
                        <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                            {currentQuestion.difficultyLevel}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Options */}
            {!currentQuestion.userInputAnswer && currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="space-y-3">
                    {currentQuestion.isMultipleAnswer ? (
                        // Multiple choice
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const optionKey = String.fromCharCode(65 + index);
                                return (
                                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                        <Checkbox
                                            id={`option-${index}`}
                                            checked={Array.isArray(userAnswer) && userAnswer.includes(optionKey)}
                                            onCheckedChange={(checked) => 
                                                onMultipleAnswerChange(questionId, optionKey, checked)
                                            }
                                            className="mt-1 flex-shrink-0"
                                        />
                                        <Label 
                                            htmlFor={`option-${index}`}
                                            className="flex-1 text-gray-800 cursor-pointer leading-relaxed break-words"
                                        >
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mr-2 inline-block">
                                                {optionKey}
                                            </span>
                                            <span dangerouslySetInnerHTML={{ __html: option }} />
                                        </Label>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        // Single choice
                        <RadioGroup
                            value={userAnswer || ""}
                            onValueChange={(value) => onAnswerChange(questionId, value)}
                            className="space-y-3"
                        >
                            {currentQuestion.options.map((option, index) => {
                                const optionKey = String.fromCharCode(65 + index);
                                return (
                                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                        <RadioGroupItem
                                            value={optionKey}
                                            id={`option-${index}`}
                                            className="mt-1 flex-shrink-0"
                                        />
                                        <Label 
                                            htmlFor={`option-${index}`}
                                            className="flex-1 text-gray-800 cursor-pointer leading-relaxed break-words"
                                        >
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mr-2 inline-block">
                                                {optionKey}
                                            </span>
                                            <span dangerouslySetInnerHTML={{ __html: option }} />
                                        </Label>
                                    </div>
                                )
                            })}
                        </RadioGroup>
                    )}
                </div>
            )}

            {/* Fallback for questions without options */}
            {!currentQuestion.userInputAnswer && (!currentQuestion.options || currentQuestion.options.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-yellow-800 font-medium">Question Configuration Issue</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                        This question doesn't have options configured. Please contact your administrator.
                    </p>
                </div>
            )}

            {/* User Input Answer */}
            {currentQuestion.userInputAnswer && (
                <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <Label htmlFor="user-answer" className="text-sm font-medium text-gray-800">
                        Your Answer
                    </Label>
                    <Textarea
                        id="user-answer"
                        value={userAnswer || ""}
                        onChange={(e) => onAnswerChange(questionId, e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[100px] resize-none bg-white border-gray-200"
                    />
                </div>
            )}
        </div>
    )
} 