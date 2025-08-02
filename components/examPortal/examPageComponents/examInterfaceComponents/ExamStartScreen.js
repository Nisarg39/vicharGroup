"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Clock, BookOpen, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"

export default function ExamStartScreen({ exam, totalQuestions, onStartExam, onBack }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 sm:p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto">
                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100/60 rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
                            {exam?.examName}
                        </CardTitle>
                        <CardDescription className="text-center text-blue-100 text-base sm:text-lg mt-2">
                            Ready to begin your examination?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-6">
                        {/* Exam Stats - Mobile Optimized */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mx-auto mb-3" />
                                <p className="font-bold text-blue-900 text-lg sm:text-xl text-center">{exam?.examDurationMinutes} min</p>
                                <p className="text-sm text-blue-700 text-center font-medium">Duration</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
                                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mx-auto mb-3" />
                                <p className="font-bold text-green-900 text-lg sm:text-xl text-center">{totalQuestions}</p>
                                <p className="text-sm text-green-700 text-center font-medium">Questions</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
                                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mx-auto mb-3" />
                                <p className="font-bold text-purple-900 text-lg sm:text-xl text-center">{exam?.totalMarks || totalQuestions * 4}</p>
                                <p className="text-sm text-purple-700 text-center font-medium">Total Marks</p>
                            </div>
                        </div>

                        {totalQuestions === 0 ? (
                            <>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <span className="text-red-800 font-medium">No Questions Available</span>
                                    </div>
                                    <p className="text-red-700 text-sm mt-2">
                                        This exam doesn't have any questions configured. Please contact your administrator.
                                    </p>
                                </div>
                                {onBack && (
                                    <div className="flex justify-center">
                                        <Button 
                                            onClick={onBack}
                                            variant="outline"
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Dashboard
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                {/* Important Instructions */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Instructions:</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        <li>• Ensure stable internet connection</li>
                                        <li>• Do not refresh or close the browser</li>
                                        <li>• Your progress will be auto-saved</li>
                                        <li>• You can mark questions for review</li>
                                    </ul>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    <Button 
                                        onClick={onStartExam}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-200 text-lg touch-action-manipulation active:scale-95"
                                    >
                                        🚀 Start Exam Now
                                    </Button>
                                    
                                    {onBack && (
                                        <Button 
                                            onClick={onBack}
                                            variant="outline"
                                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-base touch-action-manipulation active:scale-95"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Dashboard
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 