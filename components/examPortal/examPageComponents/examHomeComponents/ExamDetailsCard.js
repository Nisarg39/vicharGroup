"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Separator } from "../../../ui/separator"
import { Clock, AlertCircle, Play, BarChart3, BookOpen, Award, WifiOff, Timer, RefreshCw } from "lucide-react"
import { getEffectiveExamDuration } from "../../../../utils/examTimingUtils"

export default function ExamDetailsCard({ 
    exam, 
    hasUncompletedExam, 
    hasAttempted, 
    allAttempts, 
    isOnline,
    onStartExam, 
    onContinueExam, 
    isEligible, // NEW: eligibility prop
    onRefreshExamData, // NEW: refresh function prop
    isRefreshing // NEW: refresh loading state prop
}) {
    // State for countdown timers
    const [currentTime, setCurrentTime] = useState(new Date())

    // Update current time every second for real-time countdowns
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    if (!exam) return null

    const canRetake = exam && allAttempts.length < (exam.reattempt || 1)

    // Format countdown time
    const formatCountdown = (milliseconds) => {
        if (milliseconds <= 0) return "00:00:00"
        
        const totalSeconds = Math.floor(milliseconds / 1000)
        const days = Math.floor(totalSeconds / (24 * 3600))
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        if (days > 0) {
            return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        } else {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
    }

    // Timing validation for scheduled exams with countdown
    const getExamTimingStatus = () => {
        // Only apply timing restrictions for scheduled exams
        if (exam.examAvailability !== 'scheduled' || !exam.startTime || !exam.endTime) {
            return { canStart: true, canContinue: true, message: null, countdown: null, countdownType: null }
        }

        const now = currentTime
        const startTime = new Date(exam.startTime)
        const endTime = new Date(exam.endTime)
        const continueDeadline = new Date(endTime.getTime() + 30 * 60 * 1000) // 30 minutes after end time

        // Check if exam hasn't started yet
        if (now < startTime) {
            const timeUntilStart = startTime.getTime() - now.getTime()
            return {
                canStart: false,
                canContinue: false,
                message: `Exam will start on ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`,
                countdown: formatCountdown(timeUntilStart),
                countdownType: 'start',
                countdownLabel: 'Time until exam starts'
            }
        }

        // Check if exam has ended
        if (now > endTime) {
            // Allow continue exam only within 30 minutes of end time
            const canContinue = now <= continueDeadline
            if (canContinue) {
                const timeUntilContinueDeadline = continueDeadline.getTime() - now.getTime()
                return {
                    canStart: false,
                    canContinue: true,
                    message: `Exam has ended. You can continue until ${continueDeadline.toLocaleTimeString()}`,
                    countdown: formatCountdown(timeUntilContinueDeadline),
                    countdownType: 'continue',
                    countdownLabel: 'Time left to continue exam'
                }
            } else {
                return {
                    canStart: false,
                    canContinue: false,
                    message: `Exam ended on ${endTime.toLocaleDateString()} at ${endTime.toLocaleTimeString()}`,
                    countdown: null,
                    countdownType: null
                }
            }
        }

        // Exam is currently active
        const timeUntilEnd = endTime.getTime() - now.getTime()
        return {
            canStart: true,
            canContinue: true,
            message: `Exam ends on ${endTime.toLocaleDateString()} at ${endTime.toLocaleTimeString()}`,
            countdown: formatCountdown(timeUntilEnd),
            countdownType: 'end',
            countdownLabel: 'Time until exam ends'
        }
    }

    const timingStatus = getExamTimingStatus()
    
    // Determine when to show refresh button
    // Show ONLY when: it's a "Start Exam" scenario (no saved progress), exam is scheduled, and student appears to have cached/stale timing data
    const shouldShowRefreshButton = () => {
        return (
            !hasUncompletedExam && // Not a "Continue Exam" scenario
            exam?.examAvailability === 'scheduled' && // Exam is scheduled
            onRefreshExamData && // Function is available
            isOnline // Only show when online
        )
    }

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
                            <p className="text-lg font-bold text-blue-800">{getEffectiveExamDuration(exam)} min</p>
                            {exam.durationInfo?.configured !== exam.examDurationMinutes && (
                                <p className="text-xs text-gray-600">Stream-optimized duration</p>
                            )}
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

                {/* Exam Timing Information for Scheduled Exams */}
                {exam.examAvailability === 'scheduled' && exam.startTime && exam.endTime && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-6 border border-indigo-100/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-indigo-900 flex items-center gap-3 text-lg">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                Exam Schedule
                            </h3>
                            {shouldShowRefreshButton() && (
                                <Button
                                    onClick={onRefreshExamData}
                                    disabled={isRefreshing}
                                    variant="outline"
                                    size="sm"
                                    className="border-indigo-200 bg-white/70 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 px-3 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Refresh exam timing data"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/70 rounded-xl p-4 border border-indigo-100/50">
                                <p className="text-sm font-semibold text-indigo-900 mb-1">Start Time</p>
                                <p className="text-base font-bold text-indigo-800">
                                    {new Date(exam.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} at {new Date(exam.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-xl p-4 border border-indigo-100/50">
                                <p className="text-sm font-semibold text-indigo-900 mb-1">End Time</p>
                                <p className="text-base font-bold text-indigo-800">
                                    {new Date(exam.endTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} at {new Date(exam.endTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </p>
                            </div>
                        </div>
                        {timingStatus.message && (
                            <div className={`mt-4 p-3 rounded-xl border ${
                                timingStatus.canStart && timingStatus.canContinue 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : !timingStatus.canStart && !timingStatus.canContinue 
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-orange-50 border-orange-200 text-orange-800'
                            }`}>
                                <p className="text-sm font-medium">{timingStatus.message}</p>
                            </div>
                        )}

                        {/* Countdown Timer */}
                        {timingStatus.countdown && (
                            <div className={`mt-4 p-4 rounded-xl border ${
                                timingStatus.countdownType === 'start' 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : timingStatus.countdownType === 'end' 
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-orange-50 border-orange-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            timingStatus.countdownType === 'start' 
                                                ? 'bg-blue-500' 
                                                : timingStatus.countdownType === 'end' 
                                                ? 'bg-green-500'
                                                : 'bg-orange-500'
                                        }`}>
                                            <Timer className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold mb-1 ${
                                                timingStatus.countdownType === 'start' 
                                                    ? 'text-blue-900' 
                                                    : timingStatus.countdownType === 'end' 
                                                    ? 'text-green-900'
                                                    : 'text-orange-900'
                                            }`}>
                                                {timingStatus.countdownLabel}
                                            </p>
                                            <div className={`text-2xl font-bold font-mono ${
                                                timingStatus.countdownType === 'start' 
                                                    ? 'text-blue-800' 
                                                    : timingStatus.countdownType === 'end' 
                                                    ? 'text-green-800'
                                                    : 'text-orange-800'
                                            }`}>
                                                {timingStatus.countdown}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Status indicator */}
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                        timingStatus.countdownType === 'start' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : timingStatus.countdownType === 'end' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                                            timingStatus.countdownType === 'start' 
                                                ? 'bg-blue-500' 
                                                : timingStatus.countdownType === 'end' 
                                                ? 'bg-green-500'
                                                : 'bg-orange-500'
                                        }`}></div>
                                        {timingStatus.countdownType === 'start' && 'Starts Soon'}
                                        {timingStatus.countdownType === 'end' && 'Active Now'}
                                        {timingStatus.countdownType === 'continue' && 'Grace Period'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions Section */}
                {exam.examInstructions && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            Topics and Special Instruction
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
                            disabled={!isEligible || !timingStatus.canContinue}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                            title={!isEligible 
                                ? 'You are not eligible to attempt this exam.' 
                                : !timingStatus.canContinue 
                                ? 'Exam is not available at this time.'
                                : ''
                            }
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
                                    disabled={!isEligible || !timingStatus.canStart}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    title={!isEligible 
                                        ? 'You are not eligible to attempt this exam.' 
                                        : !timingStatus.canStart 
                                        ? 'Exam is not available at this time.'
                                        : ''
                                    }
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
                        </>
                    ) : (
                        <Button 
                            onClick={onStartExam}
                            disabled={!isEligible || !timingStatus.canStart}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                            title={!isEligible 
                                ? 'You are not eligible to attempt this exam.' 
                                : !timingStatus.canStart 
                                ? 'Exam is not available at this time.'
                                : ''
                            }
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