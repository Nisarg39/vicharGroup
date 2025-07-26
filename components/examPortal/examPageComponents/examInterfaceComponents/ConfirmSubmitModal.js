"use client"

import { VicharCard, VicharCardHeader, VicharCardTitle, VicharCardContent } from "../../../ui/vichar-card"
import { VicharButton } from "../../../ui/vichar-button"
import { AlertTriangle } from "lucide-react"

export default function ConfirmSubmitModal({ 
    showConfirmSubmit, 
    totalQuestions, 
    answeredQuestions, 
    onCancel, 
    onSubmit 
}) {
    if (!showConfirmSubmit) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <VicharCard className="bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100/60 max-w-md w-full">
                <VicharCardHeader className="p-4 sm:p-6">
                    <VicharCardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        Confirm Submission
                    </VicharCardTitle>
                </VicharCardHeader>
                <VicharCardContent className="p-4 sm:p-6 space-y-4">
                    <p className="text-gray-700 text-sm sm:text-base">
                        Are you sure you want to submit your exam? This action cannot be undone.
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <p className="text-xs sm:text-sm text-yellow-800">
                            <strong>Unanswered questions:</strong> {totalQuestions - answeredQuestions}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <VicharButton
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1"
                        >
                            Cancel
                        </VicharButton>
                        <VicharButton
                            onClick={onSubmit}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Submit Exam
                        </VicharButton>
                    </div>
                </VicharCardContent>
            </VicharCard>
        </div>
    )
} 