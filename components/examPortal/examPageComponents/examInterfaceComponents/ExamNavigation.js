"use client"

import { VicharButton } from "../../../ui/vichar-button"
import { ArrowLeft, ArrowRight, Flag, Save, Send } from "lucide-react"

export default function ExamNavigation({ 
    currentQuestionIndex, 
    totalQuestions, 
    markedQuestions, 
    onPrevious, 
    onNext, 
    onToggleMarked, 
    onSave, 
    onSubmit, 
    showSubmitButton
}) {
    const isMarked = markedQuestions.has(currentQuestionIndex);
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Previous Button */}
            <VicharButton
                variant={currentQuestionIndex === 0 ? "secondary" : "outline"}
                onClick={onPrevious}
                disabled={currentQuestionIndex === 0}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                    currentQuestionIndex === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
            </VicharButton>

            {/* Center Action Buttons */}
            <div className="flex gap-3 w-full sm:w-auto justify-center">
                <VicharButton
                    variant="outline"
                    onClick={onToggleMarked}
                    className={`flex-1 sm:flex-none px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                        isMarked
                            ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                >
                    <Flag className={`w-4 h-4 mr-2 ${isMarked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{isMarked ? 'Unmark' : 'Mark for Review'}</span>
                </VicharButton>

                <VicharButton
                    onClick={onSave}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <Save className="w-4 h-4 mr-2" />
                    <span className="text-sm">Save Progress</span>
                </VicharButton>
            </div>

            {/* Next/Submit Button */}
            {!isLastQuestion ? (
                <VicharButton
                    onClick={onNext}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                </VicharButton>
            ) : (
                showSubmitButton ? (
                    <VicharButton
                        onClick={onSubmit}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Submit Exam
                    </VicharButton>
                ) : (
                    <div className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                        Complete all subjects to submit
                    </div>
                )
            )}
        </div>
    )
} 