"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"

export default function ContinueExamPrompt({ 
    showContinuePrompt, 
    hasSavedProgress, 
    pendingExamStart,
    onContinueExam, 
    onStartNewExam 
}) {
    if (!showContinuePrompt || !hasSavedProgress || !pendingExamStart) return null

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 sm:p-4">
            <Card className="max-w-sm sm:max-w-md w-full bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">
                <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
                    <CardTitle className="text-2xl sm:text-3xl font-bold">📚 Resume Exam</CardTitle>
                    <CardDescription className="text-blue-100 text-base sm:text-lg mt-2">
                        Your progress has been saved!
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                    <div className="text-center space-y-3">
                        <p className="text-gray-800 text-base font-medium">
                            We found your previous exam session.
                        </p>
                        <p className="text-gray-600 text-sm">
                            Choose how you'd like to proceed:
                        </p>
                    </div>
                    
                    {/* Information Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">💾</span>
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">Saved Progress Found</p>
                                <p className="text-sm text-blue-700">Your answers and progress are preserved</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button 
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 touch-action-manipulation" 
                            onClick={onContinueExam}
                        >
                            ✅ Continue Where I Left Off
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 touch-action-manipulation" 
                            onClick={onStartNewExam}
                        >
                            🔄 Start Fresh (Clear Progress)
                        </Button>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Starting fresh will permanently delete your saved progress
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 