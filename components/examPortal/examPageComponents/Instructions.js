"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Checkbox } from "../../ui/checkbox"
import { AlertTriangle, Clock, FileText, CheckCircle, ArrowLeft, Play } from "lucide-react"

export default function Instructions({ exam, onStart, onBack }) {
    const [hasReadInstructions, setHasReadInstructions] = useState(false)
    const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)

    const canStart = hasReadInstructions && hasAgreedToTerms

    const examInstructions = [
        "Read each question carefully before answering",
        "You cannot go back to previous questions once answered",
        "Ensure stable internet connection for best experience",
        "Your progress is automatically saved",
        "Do not refresh the page during the exam",
        "Submit only when you're sure about all answers",
        "The timer will automatically submit when time expires"
    ]

    const generalInstructions = [
        "This is a timed examination",
        "All questions are mandatory",
        "Negative marking may apply",
        "Use the navigation panel to move between questions",
        "You can mark questions for review",
        "Ensure your device is fully charged",
        "Close all other applications"
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 relative overflow-hidden p-4 md:p-8">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-blue-400/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 group hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="ghost" 
                                onClick={onBack}
                                className="p-3 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-700" />
                            </Button>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Exam Instructions
                                </h1>
                                <p className="text-gray-600 text-lg font-medium">{exam?.examName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-base font-bold">
                                <Clock className="w-5 h-5 mr-2" />
                                {exam?.examDurationMinutes} minutes
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Exam Details */}
                <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-blue-900 transition-colors duration-300">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            Exam Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-blue-900 uppercase tracking-wide">Exam Name</p>
                                <p className="text-xl font-bold text-blue-800">{exam?.examName}</p>
                            </div>
                            <div className="space-y-3 p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-green-900 uppercase tracking-wide">Duration</p>
                                <p className="text-xl font-bold text-green-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    {exam?.examDurationMinutes} minutes
                                </p>
                            </div>
                            <div className="space-y-3 p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-purple-900 uppercase tracking-wide">Total Marks</p>
                                <p className="text-xl font-bold text-purple-800">{exam?.totalMarks || 'TBD'}</p>
                            </div>
                            <div className="space-y-3 p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Subjects</p>
                                <p className="text-xl font-bold text-indigo-800">
                                    {Array.isArray(exam?.examSubject) ? exam.examSubject.join(', ') : exam?.examSubject}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Instructions */}
                    <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                        {/* Background Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-red-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <CardHeader className="relative z-10 pb-4">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-orange-900 transition-colors duration-300">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                General Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ul className="space-y-4">
                                {generalInstructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50/50 to-red-50/30 rounded-xl hover:shadow-md transition-all duration-300 group/item">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300"></div>
                                        </div>
                                        <span className="text-gray-800 text-base leading-relaxed font-medium">{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Exam Specific Instructions */}
                    <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                        {/* Background Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <CardHeader className="relative z-10 pb-4">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-green-900 transition-colors duration-300">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                Exam Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ul className="space-y-4">
                                {examInstructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/30 rounded-xl hover:shadow-md transition-all duration-300 group/item">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300"></div>
                                        </div>
                                        <span className="text-gray-800 text-base leading-relaxed font-medium">{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Custom Instructions */}
                {exam?.examInstructions && (
                    <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                        {/* Background Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <CardHeader className="relative z-10 pb-4">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-indigo-900 transition-colors duration-300">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                Additional Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-gray-800 text-base leading-relaxed font-medium">{exam.examInstructions}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Agreement Section */}
                <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">Agreement</CardTitle>
                        <CardDescription className="text-gray-600 text-base font-medium">Please confirm the following before starting the exam</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl hover:shadow-md transition-all duration-300 group/item">
                            <Checkbox 
                                id="read-instructions"
                                checked={hasReadInstructions}
                                onCheckedChange={setHasReadInstructions}
                                className="mt-1 scale-125"
                            />
                            <label htmlFor="read-instructions" className="text-base text-gray-800 leading-relaxed font-medium cursor-pointer">
                                I have read and understood all the instructions provided above
                            </label>
                        </div>
                        
                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl hover:shadow-md transition-all duration-300 group/item">
                            <Checkbox 
                                id="agree-terms"
                                checked={hasAgreedToTerms}
                                onCheckedChange={setHasAgreedToTerms}
                                className="mt-1 scale-125"
                            />
                            <label htmlFor="agree-terms" className="text-base text-gray-800 leading-relaxed font-medium cursor-pointer">
                                I agree to follow all exam rules and regulations. I understand that any violation may result in disqualification.
                            </label>
                        </div>

                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50/50 to-blue-50/30 rounded-2xl border-2 border-green-200/50 transition-all duration-300">
                            <Checkbox 
                                id="ready-exam"
                                checked={canStart}
                                disabled
                                className="mt-1 scale-125"
                            />
                            <label htmlFor="ready-exam" className="text-base text-gray-800 leading-relaxed font-bold cursor-default">
                                I am ready to begin the examination
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Button 
                        variant="outline" 
                        onClick={onBack}
                        className="border-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group/button"
                    >
                        <div className="p-1 bg-gray-200 rounded-lg group-hover/button:bg-gray-300 transition-colors duration-300">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Go Back
                    </Button>
                    
                    <Button 
                        onClick={onStart}
                        disabled={!canStart}
                        className={`px-10 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105 text-lg ${
                            canStart 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-300 cursor-not-allowed hover:scale-100'
                        }`}
                    >
                        <div className={`p-1 rounded-lg transition-colors duration-300 ${
                            canStart ? 'bg-white/20 group-hover/button:bg-white/30' : 'bg-gray-300'
                        }`}>
                            <Play className="w-6 h-6" />
                        </div>
                        Start Exam
                    </Button>
                </div>

                {/* Warning */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    {/* Warning Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-amber-100/20 opacity-50"></div>
                    
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-md">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-900 font-bold text-lg">Important Notice</span>
                            </div>
                            <p className="text-yellow-800 text-base leading-relaxed font-medium">
                                Once you start the exam, the timer will begin and cannot be paused. Make sure you have a stable environment and are ready to complete the entire exam.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}