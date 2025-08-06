"use client"

import 'katex/dist/katex.min.css';
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
    onMultipleAnswerChange,
    currentSectionInfo,
    isJeeExam
}) {
    if (!currentQuestion) {
        return (
            <div className="p-3 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading question...</p>
            </div>
        )
    }

    const questionId = currentQuestion._id

    return (
        <div className="space-y-1.5 sm:space-y-2 lg:space-y-3 bg-transparent">
            {/* Mobile-Optimized Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs font-medium px-2 py-0.5">
                        Q{currentQuestionIndex + 1}/{totalQuestions}
                    </Badge>
                    {isJeeExam && currentSectionInfo && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs font-medium px-2 py-0.5 bg-purple-50">
                            Section {currentSectionInfo.sectionName}
                        </Badge>
                    )}
                    {markedQuestions.has(currentQuestionIndex) && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5">
                            <Flag className="w-2.5 h-2.5 mr-0.5" />
                            Marked
                        </Badge>
                    )}
                </div>
                <div className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {currentQuestion.marks || 4} marks
                </div>
            </div>

            {/* Question Content */}
            <div className="space-y-2 lg:space-y-3">
                <div className="bg-gray-50 rounded-lg p-2.5 lg:p-4">
                    <div className="text-sm sm:text-base lg:text-lg text-gray-900 leading-tight lg:leading-relaxed"
                        style={{
                            maxWidth: '100%',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal'
                        }}
                        dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                    />
                </div>

                {/* Question Meta Info */}
                <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs px-1.5 py-0.5">
                        {currentQuestion.isMultipleAnswer ? 'Multiple Select' : 'Single Select'}
                    </Badge>
                    {currentQuestion.difficultyLevel && (
                        <Badge variant="outline" className="text-green-600 border-green-200 text-xs px-1.5 py-0.5">
                            {currentQuestion.difficultyLevel}
                        </Badge>
                    )}
                    {currentQuestion.subject && (
                        <Badge variant="outline" className="text-gray-600 border-gray-200 text-xs px-1.5 py-0.5">
                            {currentQuestion.subject}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Answer Options - Mobile Optimized */}
            {!currentQuestion.userInputAnswer && currentQuestion.options?.length > 0 && (
                <div className="space-y-1.5 lg:space-y-2">
                    {currentQuestion.isMultipleAnswer ? (
                        // Multiple choice with better mobile touch targets
                        <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                            {currentQuestion.options.map((option, index) => {
                                const optionKey = String.fromCharCode(65 + index);
                                const isSelected = Array.isArray(userAnswer) && userAnswer.includes(optionKey);
                                return (
                                    <div key={index} className={`flex items-start gap-2 p-1.5 sm:p-2.5 lg:p-3 rounded-lg border-2 transition-all duration-200 touch-action-manipulation ${
                                        isSelected 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }`}>
                                        <Checkbox
                                            id={`option-${index}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => 
                                                onMultipleAnswerChange(questionId, optionKey, checked)
                                            }
                                            className="mt-0.5 flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
                                        />
                                        <Label 
                                            htmlFor={`option-${index}`}
                                            className="flex-1 cursor-pointer tap-highlight-none"
                                        >
                                            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                                                <span className={`text-xs font-bold px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded ${
                                                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {optionKey}
                                                </span>
                                            </div>
                                            <div 
                                                className="text-xs sm:text-sm lg:text-base text-gray-800 leading-snug lg:leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: option }} 
                                            />
                                        </Label>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        // Single choice with better mobile touch targets
                        <RadioGroup
                            value={userAnswer || ""}
                            onValueChange={(value) => onAnswerChange(questionId, value)}
                            className="space-y-1 sm:space-y-1.5 lg:space-y-2"
                        >
                            {currentQuestion.options.map((option, index) => {
                                const optionKey = String.fromCharCode(65 + index);
                                const isSelected = userAnswer === optionKey;
                                return (
                                    <div key={index} className={`flex items-start gap-2 p-1.5 sm:p-2.5 lg:p-3 rounded-lg border-2 transition-all duration-200 touch-action-manipulation ${
                                        isSelected 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }`}>
                                        <RadioGroupItem
                                            value={optionKey}
                                            id={`option-${index}`}
                                            className="mt-0.5 flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
                                        />
                                        <Label 
                                            htmlFor={`option-${index}`}
                                            className="flex-1 cursor-pointer tap-highlight-none"
                                        >
                                            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                                                <span className={`text-xs font-bold px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded ${
                                                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {optionKey}
                                                </span>
                                            </div>
                                            <div 
                                                className="text-xs sm:text-sm lg:text-base text-gray-800 leading-snug lg:leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: option }} 
                                            />
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                    <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                        <span className="text-yellow-800 font-medium text-xs">Question Configuration Issue</span>
                    </div>
                    <p className="text-yellow-700 text-xs mt-0.5">
                        This question doesn't have options configured. Please contact your administrator.
                    </p>
                </div>
            )}

            {/* Text Input Answer - Mobile Optimized */}
            {currentQuestion.userInputAnswer && (
                <div className="space-y-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <Label htmlFor="user-answer" className="text-xs font-medium text-gray-800">
                        Type your answer below:
                    </Label>
                    <Textarea
                        id="user-answer"
                        value={userAnswer || ""}
                        onChange={(e) => onAnswerChange(questionId, e.target.value)}
                        placeholder="Enter your detailed answer here..."
                        className="min-h-[80px] resize-none bg-white border-gray-300 text-sm leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <div className="text-xs text-gray-500">
                        Character count: {(userAnswer || '').length}
                    </div>
                </div>
            )}
        </div>
    )
}
