"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Clock, BookOpen, CheckCircle, AlertTriangle } from "lucide-react"

export default function ExamStartScreen({ exam, totalQuestions, onStartExam }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                            Ready to Start?
                        </CardTitle>
                        <CardDescription className="text-center">
                            Click the button below to begin your exam
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                                <p className="font-semibold text-blue-900 text-sm sm:text-base">{exam?.examDurationMinutes} minutes</p>
                                <p className="text-xs sm:text-sm text-blue-700">Duration</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl">
                                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                                <p className="font-semibold text-green-900 text-sm sm:text-base">{totalQuestions} questions</p>
                                <p className="text-xs sm:text-sm text-green-700">Total Questions</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl">
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
                                <p className="font-semibold text-purple-900 text-sm sm:text-base">{exam?.totalMarks || 'TBD'} marks</p>
                                <p className="text-xs sm:text-sm text-purple-700">Total Marks</p>
                            </div>
                        </div>

                        {totalQuestions === 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <span className="text-red-800 font-medium">No Questions Available</span>
                                </div>
                                <p className="text-red-700 text-sm mt-2">
                                    This exam doesn't have any questions configured. Please contact your administrator.
                                </p>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <Button 
                                    onClick={onStartExam}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg"
                                >
                                    Start Exam Now
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 