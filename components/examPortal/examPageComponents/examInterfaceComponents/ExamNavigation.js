"use client"

import { VicharButton } from "../../../ui/vichar-button"
import { ArrowLeft, ArrowRight, Flag, X, Send } from "lucide-react"

export default function ExamNavigation({ 
    currentQuestionIndex, 
    totalQuestions, 
    markedQuestions, 
    onPrevious, 
    onNext, 
    onToggleMarked, 
    onClear, 
    onSubmit,
    isOnLastSubject
}) {
    const isMarked = markedQuestions.has(currentQuestionIndex);
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
    // Only disable Next button if on last question of last subject
    const shouldDisableNext = isLastQuestion && isOnLastSubject;

    return (
        <div className="space-y-3 lg:static lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50 lg:z-auto">
            {/* First Row - Navigation Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                {/* Previous Button */}
                <VicharButton
                    variant={currentQuestionIndex === 0 ? "secondary" : "outline"}
                    onClick={onPrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`py-2 px-2 sm:py-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 min-h-[40px] sm:min-h-[48px] active:scale-95 touch-action-manipulation ${
                        currentQuestionIndex === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
                    }`}
                >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm lg:text-base">Prev</span>
                </VicharButton>

                {/* Next Button */}
                <VicharButton
                    onClick={onNext}
                    disabled={shouldDisableNext}
                    className={`py-2 px-2 sm:py-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 min-h-[40px] sm:min-h-[48px] active:scale-95 touch-action-manipulation ${
                        shouldDisableNext
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
                >
                    <span className="text-xs sm:text-sm lg:text-base">
                        {isLastQuestion && !isOnLastSubject ? 'Next Subject' : 'Next'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </VicharButton>

                {/* Submit Button - Always Available */}
                <VicharButton
                    onClick={onSubmit}
                    className="col-span-2 lg:col-span-1 py-2 px-2 sm:py-3 sm:px-4 rounded-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[40px] sm:min-h-[48px] touch-action-manipulation"
                >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm lg:text-base">Submit</span>
                </VicharButton>
            </div>
            
            {/* Second Row - Mark and Clear Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Mark/Unmark Button */}
                <VicharButton
                    variant="outline"
                    onClick={onToggleMarked}
                    className={`py-2 px-2 sm:py-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 min-h-[40px] sm:min-h-[48px] active:scale-95 touch-action-manipulation ${
                        isMarked
                            ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 shadow-sm'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
                    }`}
                >
                    <Flag className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isMarked ? 'fill-current' : ''}`} />
                    <span className="text-xs sm:text-sm lg:text-base font-semibold">{isMarked ? 'Unmark' : 'Mark'}</span>
                </VicharButton>

                {/* Clear Button */}
                <VicharButton
                    onClick={onClear}
                    variant="outline"
                    className="py-2 px-2 sm:py-3 sm:px-4 rounded-lg font-semibold border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 min-h-[40px] sm:min-h-[48px] touch-action-manipulation"
                >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm lg:text-base font-semibold">Clear</span>
                </VicharButton>
            </div>
        </div>
    )
} 