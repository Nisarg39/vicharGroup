"use client"

import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Clock, Wifi, WifiOff } from "lucide-react"

export default function ExamHeader({ 
    exam, 
    student, 
    isOnline, 
    timeLeft, 
    answeredQuestions, 
    totalQuestions, 
    progressPercentage
}) {
    // Format time display
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-gray-100/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">{exam?.examName}</h1>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">Student: {student?.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {/* Connection Status */}
                        <Badge variant={isOnline ? "default" : "secondary"} 
                               className={`${isOnline ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"} text-xs hidden sm:flex`}>
                            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                            {isOnline ? 'Online' : 'Offline'}
                        </Badge>

                        {/* Timer */}
                        <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-xl font-mono text-sm sm:text-lg font-bold ${
                            timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">{formatTime(timeLeft)}</span>
                            <span className="sm:hidden">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                        </div>

                        {/* Progress - Hidden on mobile */}
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{answeredQuestions}/{totalQuestions}</p>
                            <p className="text-xs text-gray-600">Answered</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 sm:mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    {/* Mobile Progress Text */}
                    <div className="flex justify-between text-xs text-gray-600 mt-1 sm:hidden">
                        <span>Progress: {answeredQuestions}/{totalQuestions}</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                </div>
            </div>
        </div>
    )
} 