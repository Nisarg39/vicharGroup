"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Separator } from "../../../ui/separator"
import { Clock, AlertCircle, Play, BarChart3, BookOpen, Award, WifiOff } from "lucide-react"

export default function ExamDetailsCard({ 
    exam, 
    hasUncompletedExam, 
    hasAttempted, 
    allAttempts, 
    isOnline,
    onStartExam, 
    onContinueExam, 
    onViewPreviousResult,
    isEligible // NEW: eligibility prop
}) {
    if (!exam) return null

    const canRetake = exam && allAttempts.length < (exam.reattempt || 1)

    return (
        <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="relative z-10 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-900 transition-colors duration-300">
                            {exam.examName}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base font-medium">
                            {exam.stream} • {exam.standard}th Standard
                        </CardDescription>
                        <div className="flex items-center gap-2 pt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-600 font-medium">Active</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 w-fit px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                            {exam.examStatus}
                        </Badge>
                        <div className="text-xs text-gray-500 font-medium">
                            ID: {exam._id || 'N/A'}
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-8 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="group/stat flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100/50 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover/stat:shadow-xl transition-all duration-300">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Duration</p>
                            <p className="text-lg font-bold text-blue-800">{exam.examDurationMinutes} min</p>
                        </div>
                    </div>
                    
                    <div className="group/stat flex items-center gap-4 p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-100/50 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover/stat:shadow-xl transition-all duration-300">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-900 mb-1">Total Marks</p>
                            <p className="text-lg font-bold text-green-800">{exam.totalMarks || 'TBD'}</p>
                        </div>
                    </div>
                    
                    <div className="group/stat flex items-center gap-4 p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-100/50 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover/stat:shadow-xl transition-all duration-300">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-purple-900 mb-1">Status</p>
                            <p className="text-lg font-bold text-purple-800">{exam.status}</p>
                        </div>
                    </div>
                </div>

                {/* Instructions Section */}
                {exam.examInstructions && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            Special Instructions
                        </h3>
                        <div className="bg-white/70 rounded-xl p-4 border border-gray-100/50">
                            <p className="text-gray-800 text-sm leading-relaxed">{exam.examInstructions}</p>
                        </div>
                    </div>
                )}

                {/* Elegant Separator */}
                <div className="flex items-center justify-center py-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
                    <div className="mx-4 w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {hasUncompletedExam ? (
                        <Button
                            onClick={onContinueExam}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105"
                        >
                            <div className="p-1 bg-white/20 rounded-lg group-hover/button:bg-white/30 transition-colors duration-300">
                                <Play className="w-5 h-5" />
                            </div>
                            Continue Exam
                        </Button>
                    ) : hasAttempted ? (
                        <>
                            {canRetake ? (
                                <Button 
                                    onClick={onStartExam}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    disabled={!isEligible}
                                    title={!isEligible ? 'You are not eligible to attempt this exam.' : ''}
                                >
                                    <div className="p-1 bg-white/20 rounded-lg group-hover/button:bg-white/30 transition-colors duration-300">
                                        <Play className="w-5 h-5" />
                                    </div>
                                    Retake Exam
                                </Button>
                            ) : (
                                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 px-8 py-4 rounded-2xl font-bold text-red-700 flex items-center gap-3">
                                    <div className="p-1 bg-red-200 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    Maximum attempts reached
                                </div>
                            )}
                            <Button 
                                onClick={onViewPreviousResult}
                                variant="outline"
                                className="border-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-400 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 group/button shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <div className="p-1 bg-green-200 rounded-lg group-hover/button:bg-green-300 transition-colors duration-300">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                View Previous Result
                            </Button>
                        </>
                    ) : (
                        <Button 
                            onClick={onStartExam}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                            disabled={!isEligible}
                            title={!isEligible ? 'You are not eligible to attempt this exam.' : ''}
                        >
                            <div className="p-1 bg-white/20 rounded-lg group-hover/button:bg-white/30 transition-colors duration-300">
                                <Play className="w-5 h-5" />
                            </div>
                            Start Exam
                        </Button>
                    )}
                    
                    {!isOnline && (
                        <Button 
                            variant="outline"
                            className="border-2 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-400 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group/button"
                        >
                            <div className="p-1 bg-orange-200 rounded-lg group-hover/button:bg-orange-300 transition-colors duration-300">
                                <WifiOff className="w-5 h-5" />
                            </div>
                            Offline Mode Available
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 