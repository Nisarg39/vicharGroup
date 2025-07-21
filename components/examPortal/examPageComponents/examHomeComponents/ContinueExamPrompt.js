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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
            <Card className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-gray-900">Continue Exam?</CardTitle>
                    <CardDescription className="text-gray-700">
                        We found saved progress for this exam. Would you like to continue where you left off or start a new attempt?
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={onContinueExam}>
                        Continue Exam
                    </Button>
                    <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 font-semibold" onClick={onStartNewExam}>
                        Start New Exam
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
} 