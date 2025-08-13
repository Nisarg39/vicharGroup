"use client"

import { VicharCard, VicharCardHeader, VicharCardTitle, VicharCardContent } from "../../../ui/vichar-card"
import { VicharButton } from "../../../ui/vichar-button"
import { AlertTriangle } from "lucide-react"

export default function ConfirmSubmitModal({ 
    showConfirmSubmit, 
    totalQuestions, 
    answeredQuestions, 
    onCancel, 
    onSubmit,
    exam 
}) {
    if (!showConfirmSubmit) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <VicharCard className="bg-white shadow-2xl border border-gray-200 max-w-sm sm:max-w-md w-full rounded-2xl overflow-hidden">
                <VicharCardHeader className="p-4 sm:p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <VicharCardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
                        Submit Exam?
                    </VicharCardTitle>
                </VicharCardHeader>
                <VicharCardContent className="p-4 sm:p-6 space-y-5">
                    <div className="text-center space-y-3">
                        <p className="text-gray-800 text-base sm:text-lg font-medium">
                            Are you ready to submit your exam?
                        </p>
                        <p className="text-gray-600 text-sm">
                            Once submitted, you cannot make any changes.
                        </p>
                        {/* Show message for scheduled exams */}
                        {exam?.examAvailability === 'scheduled' && exam?.endTime && (() => {
                            const examEndTime = new Date(exam.endTime);
                            const currentTime = new Date();
                            const isBeforeEndTime = currentTime < examEndTime;
                            
                            if (isBeforeEndTime) {
                                const endTimeFormatted = examEndTime.toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                });
                                
                                return (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                        <p className="text-yellow-800 text-sm font-medium">
                                            ⏰ Results will be available after the exam ends at {endTimeFormatted}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                    
                    {/* Progress Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-green-600">{answeredQuestions}</p>
                                <p className="text-xs text-green-700 font-medium">Answered</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{totalQuestions - answeredQuestions}</p>
                                <p className="text-xs text-orange-700 font-medium">Unanswered</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Mobile Optimized */}
                    <div className="space-y-3">
                        <VicharButton
                            onClick={onSubmit}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 touch-action-manipulation"
                        >
                            🚀 Submit Final Exam
                        </VicharButton>
                        <VicharButton
                            variant="outline"
                            onClick={onCancel}
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 touch-action-manipulation"
                        >
                            Continue Exam
                        </VicharButton>
                    </div>
                </VicharCardContent>
            </VicharCard>
        </div>
    )
} 