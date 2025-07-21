"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Separator } from "../../../ui/separator"
import { Clock, AlertCircle, Play, BarChart3, BookOpen, Award } from "lucide-react"

export default function ExamDetailsCard({ 
    exam, 
    hasUncompletedExam, 
    hasAttempted, 
    allAttempts, 
    isOnline,
    onStartExam, 
    onContinueExam, 
    onViewPreviousResult 
}) {
    if (!exam) return null

    const canRetake = exam && allAttempts.length < (exam.reattempt || 1)

    return (
        <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                            {exam.examName}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            {exam.stream} • {exam.standard}th Standard
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 w-fit">
                        {exam.examStatus}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Duration</p>
                            <p className="text-sm text-blue-700">{exam.examDurationMinutes} minutes</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-900">Total Marks</p>
                            <p className="text-sm text-green-700">{exam.totalMarks || 'TBD'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-purple-900">Status</p>
                            <p className="text-sm text-purple-700">{exam.status}</p>
                        </div>
                    </div>
                </div>

                {exam.examInstructions && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Instructions
                        </h3>
                        <p className="text-gray-700 text-sm">{exam.examInstructions}</p>
                    </div>
                )}

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                    {hasUncompletedExam ? (
                        <Button
                            onClick={onContinueExam}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Continue Exam
                        </Button>
                    ) : hasAttempted ? (
                        <>
                            {canRetake ? (
                                <Button 
                                    onClick={onStartExam}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                >
                                    <Play className="w-5 h-5" />
                                    Retake Exam
                                </Button>
                            ) : (
                                <div className="px-6 py-3 rounded-xl font-semibold text-red-600 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    You have reached the maximum number of attempts for this exam.
                                </div>
                            )}
                            <Button 
                                onClick={onViewPreviousResult}
                                variant="outline"
                                className="border-green-200 text-green-700 hover:bg-green-50 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                            >
                                <BarChart3 className="w-5 h-5" />
                                View Previous Result
                            </Button>
                        </>
                    ) : (
                        <Button 
                            onClick={onStartExam}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Start Exam
                        </Button>
                    )}
                    
                    {!isOnline && (
                        <Button 
                            variant="outline"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-xl font-semibold"
                        >
                            Offline Mode Available
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 