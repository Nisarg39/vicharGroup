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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-xl"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Exam Instructions</h1>
                                <p className="text-gray-600">{exam?.examName}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {exam?.examDurationMinutes} minutes
                        </Badge>
                    </div>
                </div>

                {/* Exam Details */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Exam Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Exam Name</p>
                                <p className="text-lg font-semibold text-gray-900">{exam?.examName}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Duration</p>
                                <p className="text-lg font-semibold text-gray-900">{exam?.examDurationMinutes} minutes</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Total Marks</p>
                                <p className="text-lg font-semibold text-gray-900">{exam?.totalMarks || 'TBD'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Subjects</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {Array.isArray(exam?.examSubject) ? exam.examSubject.join(', ') : exam?.examSubject}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Instructions */}
                    <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                General Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {generalInstructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-700 text-sm">{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Exam Specific Instructions */}
                    <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Exam Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {examInstructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-700 text-sm">{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Custom Instructions */}
                {exam?.examInstructions && (
                    <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Additional Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-gray-800 text-sm leading-relaxed">{exam.examInstructions}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Agreement Section */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">Agreement</CardTitle>
                        <CardDescription>Please confirm the following before starting the exam</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Checkbox 
                                id="read-instructions"
                                checked={hasReadInstructions}
                                onCheckedChange={setHasReadInstructions}
                                className="mt-1"
                            />
                            <label htmlFor="read-instructions" className="text-sm text-gray-700 leading-relaxed">
                                I have read and understood all the instructions provided above
                            </label>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <Checkbox 
                                id="agree-terms"
                                checked={hasAgreedToTerms}
                                onCheckedChange={setHasAgreedToTerms}
                                className="mt-1"
                            />
                            <label htmlFor="agree-terms" className="text-sm text-gray-700 leading-relaxed">
                                I agree to follow all exam rules and regulations. I understand that any violation may result in disqualification.
                            </label>
                        </div>

                        <div className="flex items-start gap-3">
                            <Checkbox 
                                id="ready-exam"
                                checked={canStart}
                                disabled
                                className="mt-1"
                            />
                            <label htmlFor="ready-exam" className="text-sm text-gray-700 leading-relaxed">
                                I am ready to begin the examination
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <Button 
                        variant="outline" 
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl font-semibold"
                    >
                        Go Back
                    </Button>
                    
                    <Button 
                        onClick={onStart}
                        disabled={!canStart}
                        className={`px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                            canStart 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <Play className="w-5 h-5" />
                        Start Exam
                    </Button>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-800 font-medium">Important</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                        Once you start the exam, the timer will begin and cannot be paused. Make sure you have a stable environment and are ready to complete the entire exam.
                    </p>
                </div>
            </div>
        </div>
    )
}