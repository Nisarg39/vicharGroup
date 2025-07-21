"use client"

import { Button } from "../../../ui/button"
import { ArrowLeft, ArrowRight, Flag, Save, Send } from "lucide-react"

export default function ExamNavigation({ 
    currentQuestionIndex, 
    totalQuestions, 
    markedQuestions, 
    onPrevious, 
    onNext, 
    onToggleMarked, 
    onSave, 
    onSubmit 
}) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 sm:mt-6">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
            </Button>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                    variant="outline"
                    onClick={onToggleMarked}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm ${
                        markedQuestions.has(currentQuestionIndex)
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : ''
                    }`}
                >
                    <Flag className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{markedQuestions.has(currentQuestionIndex) ? 'Unmark' : 'Mark'}</span>
                    <span className="sm:hidden">{markedQuestions.has(currentQuestionIndex) ? 'Unmark' : 'Mark'}</span>
                </Button>

                <Button
                    onClick={onSave}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                >
                    <Save className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Save</span>
                    <span className="sm:hidden">Save</span>
                </Button>
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                    onClick={onNext}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            ) : (
                <Button
                    onClick={onSubmit}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Exam
                </Button>
            )}
        </div>
    )
} 