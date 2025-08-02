"use client"

import { useState } from "react"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Clock, Wifi, WifiOff, Building2, ChevronDown, ChevronUp } from "lucide-react"

export default function ExamHeader({ 
    exam, 
    student, 
    isOnline, 
    timeLeft, 
    answeredQuestions, 
    totalQuestions, 
    progressPercentage,
    collegeDetails
}) {
    const [isExpanded, setIsExpanded] = useState(false) // Start collapsed for more space

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-gray-100/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
                {/* Main Header Row - Always Visible */}
                <div className="flex items-center justify-between">
                    {/* Left Section - Exam Name & Student */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate leading-tight">
                                {exam?.examName}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                                {student?.name}
                            </p>
                        </div>
                        
                        {/* Toggle Button - Now Available on All Screen Sizes */}
                        <div className="flex items-center gap-2">
                            {!isExpanded && (
                                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                    <span>More info</span>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 h-8 w-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
                                title={isExpanded ? "Collapse header for more space" : "Expand to show college details and progress"}
                            >
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Right Section - Timer (Always Visible) */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Timer */}
                        <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-mono text-sm sm:text-base md:text-lg font-bold ${
                            timeLeft < 300 ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">{formatTime(timeLeft)}</span>
                            <span className="sm:hidden">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* Expandable Section - Collapsible on All Screen Sizes */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'opacity-100 max-h-96 mt-3 pt-3 border-t border-gray-100/60' : 'opacity-0 max-h-0'
                }`}>                    
                    {/* Secondary Info Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
                        {/* College Details */}
                        {collegeDetails && (
                            <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-gray-100/60 min-w-0 flex-1">
                                {collegeDetails.collegeLogo ? (
                                    <img 
                                        src={collegeDetails.collegeLogo} 
                                        alt="College Logo" 
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover bg-gray-100 border border-gray-200 flex-shrink-0" 
                                    />
                                ) : (
                                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                            {collegeDetails.collegeName}
                                        </span>
                                        {collegeDetails.collegeCode && (
                                            <span className="text-xs sm:text-sm text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 flex-shrink-0">
                                                {collegeDetails.collegeCode}
                                            </span>
                                        )}
                                    </div>
                                    {collegeDetails.collegeLocation && (
                                        <span className="text-xs sm:text-sm text-gray-600 truncate block">
                                            {collegeDetails.collegeLocation}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status & Progress Section */}
                        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                            {/* Connection Status */}
                            <Badge 
                                variant={isOnline ? "default" : "secondary"} 
                                className={`${
                                    isOnline ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"
                                } text-xs sm:text-sm px-2 py-1 border`}
                            >
                                {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                                {isOnline ? 'Online' : 'Offline'}
                            </Badge>

                            {/* Progress Stats */}
                            <div className="text-right bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-gray-100/60">
                                <p className="text-sm sm:text-base font-semibold text-gray-900">
                                    {answeredQuestions}/{totalQuestions}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">Answered</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                            <div 
                                className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-1.5">
                            <span>Progress: {Math.round(progressPercentage)}%</span>
                            <span>{answeredQuestions} of {totalQuestions} completed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 