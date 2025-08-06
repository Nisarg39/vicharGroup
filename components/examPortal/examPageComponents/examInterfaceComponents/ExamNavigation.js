"use client"

import { useState } from "react"
import { VicharButton } from "../../../ui/vichar-button"
import { ArrowLeft, ArrowRight, Flag, X, Send, ChevronDown, ChevronUp } from "lucide-react"

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const isMarked = markedQuestions.has(currentQuestionIndex);
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
    // Only disable Next button if on last question of last subject
    const shouldDisableNext = isLastQuestion && isOnLastSubject;

    return (
        <div className="lg:static lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50 lg:z-auto">
            {/* Mobile: Compact single row layout */}
            <div className="lg:hidden">
                <div className="flex gap-2 mb-2">
                    {/* Previous Button */}
                    <VicharButton
                        variant={currentQuestionIndex === 0 ? "secondary" : "outline"}
                        onClick={onPrevious}
                        disabled={currentQuestionIndex === 0}
                        className={`flex-1 py-2 px-2 rounded-lg font-semibold transition-all duration-200 min-h-[36px] active:scale-95 touch-action-manipulation ${
                            currentQuestionIndex === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
                        }`}
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        <span className="text-xs">Prev</span>
                    </VicharButton>

                    {/* Next Button */}
                    <VicharButton
                        onClick={onNext}
                        disabled={shouldDisableNext}
                        className={`flex-1 py-2 px-2 rounded-lg font-semibold transition-all duration-200 min-h-[36px] active:scale-95 touch-action-manipulation ${
                            shouldDisableNext
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                        <span className="text-xs">
                            {isLastQuestion && !isOnLastSubject ? 'Next' : 'Next'}
                        </span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                    </VicharButton>

                    {/* Mark/Unmark Button */}
                    <VicharButton
                        variant="outline"
                        onClick={onToggleMarked}
                        className={`flex-1 py-2 px-2 rounded-lg font-semibold transition-all duration-200 min-h-[36px] active:scale-95 touch-action-manipulation ${
                            isMarked
                                ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 shadow-sm'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
                        }`}
                    >
                        <Flag className={`w-3 h-3 mr-1 ${isMarked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-semibold">{isMarked ? 'Unmark' : 'Mark'}</span>
                    </VicharButton>

                    {/* Dropdown Toggle Button */}
                    <VicharButton
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="py-2 px-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 min-h-[36px] touch-action-manipulation"
                    >
                        {isDropdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </VicharButton>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="flex gap-2">
                        {/* Clear Button */}
                        <VicharButton
                            onClick={onClear}
                            variant="outline"
                            className="flex-1 py-2 px-2 rounded-lg font-semibold border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 min-h-[36px] touch-action-manipulation"
                        >
                            <X className="w-3 h-3 mr-1" />
                            <span className="text-xs font-semibold">Clear</span>
                        </VicharButton>

                        {/* Submit Button */}
                        <VicharButton
                            onClick={onSubmit}
                            className="flex-1 py-2 px-2 rounded-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[36px] touch-action-manipulation"
                        >
                            <Send className="w-3 h-3 mr-1" />
                            <span className="text-xs">Submit</span>
                        </VicharButton>
                    </div>
                )}
            </div>

            {/* Desktop: Original layout */}
            <div className="hidden lg:block space-y-2.5">
                {/* First Row - Navigation Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Previous Button */}
                    <VicharButton
                        variant={currentQuestionIndex === 0 ? "secondary" : "outline"}
                        onClick={onPrevious}
                        disabled={currentQuestionIndex === 0}
                        className={`py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 min-h-[44px] active:scale-95 touch-action-manipulation ${
                            currentQuestionIndex === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="text-base">Prev</span>
                    </VicharButton>

                    {/* Next Button */}
                    <VicharButton
                        onClick={onNext}
                        disabled={shouldDisableNext}
                        className={`py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 min-h-[44px] active:scale-95 touch-action-manipulation ${
                            shouldDisableNext
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                        <span className="text-base">
                            {isLastQuestion && !isOnLastSubject ? 'Next Subject' : 'Next'}
                        </span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </VicharButton>

                    {/* Submit Button - Always Available */}
                    <VicharButton
                        onClick={onSubmit}
                        className="py-2.5 px-4 rounded-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px] touch-action-manipulation"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        <span className="text-base">Submit</span>
                    </VicharButton>
                </div>
                
                {/* Second Row - Mark and Clear Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Mark/Unmark Button */}
                    <VicharButton
                        variant="outline"
                        onClick={onToggleMarked}
                        className={`py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 min-h-[44px] active:scale-95 touch-action-manipulation ${
                            isMarked
                                ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 shadow-sm'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
                        }`}
                    >
                        <Flag className={`w-4 h-4 mr-2 ${isMarked ? 'fill-current' : ''}`} />
                        <span className="text-base font-semibold">{isMarked ? 'Unmark' : 'Mark'}</span>
                    </VicharButton>

                    {/* Clear Button */}
                    <VicharButton
                        onClick={onClear}
                        variant="outline"
                        className="py-2.5 px-4 rounded-lg font-semibold border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 min-h-[44px] touch-action-manipulation"
                    >
                        <X className="w-4 h-4 mr-2" />
                        <span className="text-base font-semibold">Clear</span>
                    </VicharButton>
                </div>
            </div>
        </div>
    )
} 