"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Trophy, 
    Target, 
    BarChart3, 
    ArrowLeft,
    Award,
    TrendingUp,
    AlertCircle
} from "lucide-react"

export default function ExamResult({ result, exam, onBack, onRetake }) {
    let {
        score,
        totalMarks,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unattempted,
        timeTaken,
        completedAt,
        questionAnalysis = []
    } = result

    // Clamp score and percentage to valid ranges
    score = Math.min(score, totalMarks);
    let displayPercentage = Math.min(parseFloat(percentage), 100).toFixed(2);

    // Calculate safe values for accuracy, time efficiency, and completion rate
    const totalQuestions = (correctAnswers || 0) + (incorrectAnswers || 0) + (unattempted || 0);
    const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : "0.0";
    const timePerQuestion = totalQuestions > 0 ? Math.round(timeTaken / totalQuestions) : 0;
    const completionRate = totalQuestions > 0 ? (((correctAnswers + incorrectAnswers) / totalQuestions) * 100).toFixed(1) : "0.0";

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getPerformanceCategory = (percentage) => {
        if (percentage >= 90) return { category: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: Trophy }
        if (percentage >= 80) return { category: "Very Good", color: "text-blue-600", bg: "bg-blue-100", icon: Award }
        if (percentage >= 70) return { category: "Good", color: "text-purple-600", bg: "bg-purple-100", icon: TrendingUp }
        if (percentage >= 60) return { category: "Average", color: "text-yellow-600", bg: "bg-yellow-100", icon: Target }
        if (percentage >= 50) return { category: "Below Average", color: "text-orange-600", bg: "bg-orange-100", icon: AlertCircle }
        return { category: "Poor", color: "text-red-600", bg: "bg-red-100", icon: XCircle }
    }

    // Helper function to get option text from key
    const getOptionTextFromKey = (question, key) => {
        if (!question || !question.options || !key) return '';
        const index = key.charCodeAt(0) - 65;
        return question.options[index] || '';
    }

    // Helper function to get question by ID
    const getQuestionById = (questionId) => {
        if (!exam?.examQuestions) return null;
        return exam.examQuestions.find(q => q._id === questionId);
    }

    const performance = getPerformanceCategory(parseFloat(displayPercentage))
    const IconComponent = performance.icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
                            <p className="text-gray-600">{exam?.examName}</p>
                        </div>
                        <Button 
                            onClick={onBack}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Exam
                        </Button>
                    </div>
                </div>

                {/* Performance Summary */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className={`p-4 rounded-full ${performance.bg}`}>
                                <IconComponent className={`w-12 h-12 ${performance.color}`} />
                            </div>
                        </div>
                        <CardTitle className={`text-2xl font-bold ${performance.color}`}>
                            {performance.category}
                        </CardTitle>
                        <CardDescription>
                            You scored {score} out of {totalMarks} marks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center mb-6">
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                                {displayPercentage}%
                            </div>
                            <div className="text-sm text-gray-600">
                                Percentage Score
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-lg font-semibold text-green-900">{correctAnswers}</p>
                                    <p className="text-sm text-green-700">Correct Answers</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                                <XCircle className="w-8 h-8 text-red-600" />
                                <div>
                                    <p className="text-lg font-semibold text-red-900">{incorrectAnswers}</p>
                                    <p className="text-sm text-red-700">Incorrect Answers</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <AlertCircle className="w-8 h-8 text-gray-600" />
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{unattempted}</p>
                                    <p className="text-sm text-gray-700">Unattempted</p>
                                </div>
                            </div>
                        </div>

                        {/* Time and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                <Clock className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Time Taken</p>
                                    <p className="text-sm text-blue-700">{formatTime(timeTaken)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-purple-900">Completed On</p>
                                    <p className="text-sm text-purple-700">
                                        {new Date(completedAt).toLocaleDateString()} at {new Date(completedAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Analysis */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Performance Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Accuracy */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Accuracy</p>
                                    <p className="text-sm text-gray-600">Percentage of correct answers</p>
                                </div>
                                <Badge variant="outline" className="text-lg font-semibold">
                                    {accuracy}%
                                </Badge>
                            </div>

                            {/* Efficiency */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Time Efficiency</p>
                                    <p className="text-sm text-gray-600">Time per question</p>
                                </div>
                                <Badge variant="outline" className="text-lg font-semibold">
                                    {timePerQuestion}s per question
                                </Badge>
                            </div>

                            {/* Completion Rate */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Completion Rate</p>
                                    <p className="text-sm text-gray-600">Questions attempted</p>
                                </div>
                                <Badge variant="outline" className="text-lg font-semibold">
                                    {completionRate}%
                                </Badge>
                            </div>
                        </div>
                                    </CardContent>
            </Card>

            {/* Detailed Question Review */}
            {questionAnalysis.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Question Review
                        </CardTitle>
                        <CardDescription>
                            Review your answers and see the correct solutions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {questionAnalysis.map((analysis, index) => {
                                const question = getQuestionById(analysis.questionId);
                                if (!question) return null;

                                const isCorrect = analysis.status === 'correct';
                                const isUnattempted = analysis.status === 'unattempted';

                                return (
                                    <div key={analysis.questionId} className="border border-gray-200 rounded-xl p-4">
                                        {/* Question Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                                                    Q{index + 1}
                                                </span>
                                                <Badge 
                                                    variant={isCorrect ? "default" : isUnattempted ? "secondary" : "destructive"}
                                                    className={isCorrect ? "bg-green-100 text-green-800" : isUnattempted ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"}
                                                >
                                                    {isCorrect ? <CheckCircle className="w-3 h-3 mr-1" /> : isUnattempted ? <AlertCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                    {analysis.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {analysis.marks > 0 ? `+${analysis.marks}` : analysis.marks} marks
                                            </div>
                                        </div>

                                        {/* Question Text */}
                                        <div className="mb-4">
                                            <div 
                                                className="text-gray-900 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: question.question }}
                                            />
                                        </div>

                                        {/* Options */}
                                        {question.options && question.options.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {question.options.map((option, optIndex) => {
                                                    const optionKey = String.fromCharCode(65 + optIndex);
                                                    const isUserAnswer = Array.isArray(analysis.userAnswer) 
                                                        ? analysis.userAnswer.includes(optionKey)
                                                        : analysis.userAnswer === optionKey;
                                                    const isCorrectAnswer = Array.isArray(analysis.correctAnswer)
                                                        ? analysis.correctAnswer.includes(optionKey)
                                                        : analysis.correctAnswer === optionKey;

                                                    return (
                                                        <div 
                                                            key={optIndex} 
                                                            className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                                                                isCorrectAnswer 
                                                                    ? 'border-green-300 bg-green-50' 
                                                                    : isUserAnswer && !isCorrectAnswer
                                                                    ? 'border-red-300 bg-red-50'
                                                                    : 'border-gray-200 bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded">
                                                                    {optionKey}
                                                                </span>
                                                                {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                                {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                                                            </div>
                                                            <div 
                                                                className="flex-1 text-gray-700"
                                                                dangerouslySetInnerHTML={{ __html: option }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* User Input Answer */}
                                        {question.userInputAnswer && (
                                            <div className="mb-4">
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                                                    <p className="text-gray-900">{analysis.userAnswer || 'No answer provided'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Explanation or Additional Info */}
                                        {question.explanation && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <p className="text-sm font-medium text-blue-700 mb-2">Explanation:</p>
                                                <div 
                                                    className="text-blue-900 text-sm"
                                                    dangerouslySetInnerHTML={{ __html: question.explanation }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
                    <Button 
                        onClick={onBack}
                        variant="outline"
                        className="px-8 py-3 rounded-xl font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    
                    {onRetake && (
                        <Button 
                            onClick={onRetake}
                            className="px-8 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Retake Exam
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
} 