"use client"

import { useState, useEffect } from 'react'
import { 
    ArrowLeft, 
    Award,
    Target,
    TrendingUp,
    Clock,
    BookOpen,
    AlertCircle,
    Loader2,
    Users
} from 'lucide-react'
import { getDetailedStudentPerformanceAnalysis, getExamQuestions } from '../../../../../server_actions/actions/examController/collegeActions'

export default function DetailedPerformanceAnalysis({ 
    examId, 
    examData, 
    student, 
    onBack 
}) {
    const [analysisData, setAnalysisData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [examQuestions, setExamQuestions] = useState(null)
    const [activeTab, setActiveTab] = useState('class-comparison')

    useEffect(() => {
        if (examId && student?.id) {
            fetchDetailedAnalysis()
        }
    }, [examId, student])

    useEffect(() => {
        if (examId) {
            fetchExamQuestions()
        }
    }, [examId])

    const fetchExamQuestions = async () => {
        try {
            const result = await getExamQuestions(examId)
            if (result.success && result.assignedQuestions) {
                setExamQuestions(result.assignedQuestions)
            }
        } catch (error) {
            console.error('Error fetching exam questions:', error)
        }
    }

    const fetchDetailedAnalysis = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('isCollege')
            
            if (token && examId && student?.id) {
                const result = await getDetailedStudentPerformanceAnalysis({ token }, examId, student.id)
                if (result.success) {
                    setAnalysisData(result.data)
                } else {
                    console.error('Failed to fetch detailed analysis:', result.message)
                    setAnalysisData(null)
                }
            }
        } catch (error) {
            console.error('Error fetching detailed analysis:', error)
            setAnalysisData(null)
        } finally {
            setLoading(false)
        }
    }

    const getPerformanceColor = (accuracy) => {
        if (accuracy >= 80) return 'text-green-600 bg-green-50'
        if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    // Calculate subject-wise performance from question analysis (fallback when backend data is empty)
    const calculateSubjectPerformanceFromQuestions = (questionAnalysis, examQuestions) => {
        if (!questionAnalysis || !examQuestions || questionAnalysis.length === 0) return []
        
        // Get unique subjects
        const subjects = new Set()
        questionAnalysis.forEach(analysis => {
            const question = examQuestions.find(q => q._id === analysis.questionId)
            if (question?.subject) {
                subjects.add(question.subject)
            }
        })
        
        const uniqueSubjects = Array.from(subjects).sort()
        if (uniqueSubjects.length === 0) return []
        
        return uniqueSubjects.map(subject => {
            const subjectQuestions = questionAnalysis.filter(analysis => {
                const question = examQuestions.find(q => q._id === analysis.questionId)
                return question?.subject === subject
            })
            
            const totalQuestions = subjectQuestions.length
            const correct = subjectQuestions.filter(q => q.status === 'correct' || q.status === 'partially_correct').length
            const incorrect = subjectQuestions.filter(q => q.status === 'incorrect').length
            const unanswered = subjectQuestions.filter(q => q.status === 'unattempted').length
            const attempted = correct + incorrect
            
            const subjectMarks = subjectQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)
            
            // Calculate max possible marks for this subject
            let maxPossibleMarks = 0
            subjectQuestions.forEach(analysis => {
                const question = examQuestions.find(q => q._id === analysis.questionId)
                maxPossibleMarks += question?.marks || 4
            })
            
            const accuracy = attempted > 0 ? ((correct / attempted) * 100) : 0
            const percentage = maxPossibleMarks > 0 ? ((subjectMarks / maxPossibleMarks) * 100) : 0
            
            return {
                subject,
                totalQuestions,
                attempted,
                correct,
                incorrect,
                unanswered,
                marks: subjectMarks,
                totalMarks: maxPossibleMarks,
                accuracy: Math.round(accuracy * 100) / 100,
                percentage: Math.round(percentage * 100) / 100,
                timeSpent: 0 // We don't have time data per question in this context
            }
        })
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-lg border p-6">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={onBack}
                                className="p-3 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Student Performance Analysis</h1>
                                <p className="text-gray-600 mt-1">
                                    {student?.name} • {examData?.examName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <span className="ml-3 text-gray-600">Loading analysis...</span>
                            </div>
                        </div>
                    ) : analysisData ? (
                        <>
                            {/* Key Performance Indicators */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Award className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Score</p>
                                            <p className="text-2xl font-bold text-gray-900">{analysisData.performance.score}</p>
                                            <p className="text-xs text-gray-500">out of {analysisData.performance.totalMarks}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <Target className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Accuracy</p>
                                            <p className="text-2xl font-bold text-gray-900">{parseFloat(analysisData.statistics.accuracy || 0).toFixed(1)}%</p>
                                            <p className="text-xs text-gray-500">{analysisData.statistics.correctAnswers}/{analysisData.statistics.totalAttempted} correct</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Rank</p>
                                            <p className="text-2xl font-bold text-gray-900">#{analysisData.performance.rank}</p>
                                            <p className="text-xs text-gray-500">{analysisData.performance.percentile}th percentile</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-100 rounded-lg">
                                            <Clock className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Time Used</p>
                                            <p className="text-2xl font-bold text-gray-900">{analysisData.timeAnalysis.totalTimeSpent}m</p>
                                            <p className="text-xs text-gray-500">{(analysisData.timeAnalysis.averageTimePerQuestion / 60).toFixed(1)}m/question</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Badge Navigation */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <button
                                        onClick={() => setActiveTab('class-comparison')}
                                        className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                                            activeTab === 'class-comparison'
                                                ? 'bg-green-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Users className="w-4 h-4" />
                                        Class Comparison
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('subject-performance')}
                                        className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                                            activeTab === 'subject-performance'
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Subject-wise Performance
                                    </button>
                                </div>

                                {/* Class Comparison Content */}
                                {activeTab === 'class-comparison' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-6 h-6 text-green-600" />
                                            <h3 className="text-xl font-bold text-gray-900">Class Comparison</h3>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">{analysisData.performance.percentile}th</div>
                                            <div className="text-sm text-gray-600">Percentile Rank</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Better than {analysisData.comparativeStats.betterThanPercentage}% of students
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <div className="text-lg font-bold text-green-900">{analysisData.comparativeStats.highestScore}</div>
                                                <div className="text-xs text-green-700">Highest</div>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-bold text-blue-900">{analysisData.comparativeStats.averageScore}</div>
                                                <div className="text-xs text-blue-700">Average</div>
                                            </div>
                                            <div className="p-3 bg-red-50 rounded-lg">
                                                <div className="text-lg font-bold text-red-900">{analysisData.comparativeStats.lowestScore}</div>
                                                <div className="text-xs text-red-700">Lowest</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Your Score</span>
                                                <span className="font-semibold">{analysisData.performance.score}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                                    style={{width: `${Math.min(analysisData.performance.percentage, 100)}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Subject-wise Performance Content */}
                                {activeTab === 'subject-performance' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="w-6 h-6 text-indigo-600" />
                                            <h3 className="text-xl font-bold text-gray-900">Subject-wise Performance Analysis</h3>
                                        </div>
                                        
                                        {(() => {
                                            // First try to use backend subjectWiseAnalysis data
                                            let subjectData = []
                                            if (Object.keys(analysisData.subjectWiseAnalysis || {}).length > 0) {
                                                subjectData = Object.entries(analysisData.subjectWiseAnalysis).map(([subject, data]) => ({
                                                    subject,
                                                    ...data
                                                }))
                                            } 
                                            // Fallback: calculate from question analysis using fetched exam questions
                                            else if (analysisData.detailedQuestionAnalysis && examQuestions) {
                                                subjectData = calculateSubjectPerformanceFromQuestions(
                                                    analysisData.detailedQuestionAnalysis, 
                                                    examQuestions
                                                )
                                            }
                                            
                                            // Sort subjects: Physics first, then Chemistry, then others
                                            const sortSubjects = (data) => {
                                                return data.sort((a, b) => {
                                                    const order = {
                                                        'Physics': 1,
                                                        'Chemistry': 2,
                                                        'Biology': 3,
                                                        'Zoology': 3,
                                                        'Botany': 3,
                                                        'Mathematics': 3,
                                                        'Maths': 3
                                                    }
                                                    
                                                    const aOrder = order[a.subject] || 4
                                                    const bOrder = order[b.subject] || 4
                                                    
                                                    if (aOrder !== bOrder) {
                                                        return aOrder - bOrder
                                                    }
                                                    // If same order, sort alphabetically
                                                    return a.subject.localeCompare(b.subject)
                                                })
                                            }
                                            
                                            // Apply sorting
                                            if (subjectData.length > 0) {
                                                subjectData = sortSubjects(subjectData)
                                            }
                                            
                                            return subjectData.length > 0 ? (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                                    {subjectData.map((data) => (
                                                        <div key={data.subject} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="text-lg font-bold text-gray-800">{data.subject}</h4>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(data.accuracy || 0)}`}>
                                                                    {parseFloat(data.accuracy || 0).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="space-y-4">
                                                                {/* Score Section */}
                                                                <div className="bg-gray-50 rounded-lg p-4">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm font-medium text-gray-600">Score Obtained:</span>
                                                                        <span className="text-lg font-bold text-gray-900">{data.marks || 0}/{data.totalMarks || 0}</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-300 rounded-full h-3">
                                                                        <div 
                                                                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                                                                            style={{width: `${Math.min(data.percentage || 0, 100)}%`}}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1 text-center">
                                                                        {parseFloat(data.percentage || 0).toFixed(1)}% Performance
                                                                    </div>
                                                                </div>

                                                                {/* Questions Analysis */}
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                                        <div className="text-sm font-medium text-blue-700">Total Questions</div>
                                                                        <div className="text-xl font-bold text-blue-900">{data.totalQuestions || 0}</div>
                                                                    </div>
                                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                                        <div className="text-sm font-medium text-green-700">Attempted</div>
                                                                        <div className="text-xl font-bold text-green-900">{data.attempted || 0}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Performance Breakdown */}
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div className="text-center p-2 bg-green-100 rounded">
                                                                        <div className="text-xs font-medium text-green-700">Correct</div>
                                                                        <div className="text-lg font-bold text-green-800">{data.correct || 0}</div>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-red-100 rounded">
                                                                        <div className="text-xs font-medium text-red-700">Incorrect</div>
                                                                        <div className="text-lg font-bold text-red-800">{data.incorrect || 0}</div>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-gray-100 rounded">
                                                                        <div className="text-xs font-medium text-gray-700">Unanswered</div>
                                                                        <div className="text-lg font-bold text-gray-800">{data.unanswered || 0}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Time Spent */}
                                                                {data.timeSpent > 0 && (
                                                                    <div className="bg-orange-50 rounded-lg p-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-sm font-medium text-orange-700">Time Spent:</span>
                                                                            <span className="font-bold text-orange-900">{Math.round(data.timeSpent / 60)} min</span>
                                                                        </div>
                                                                        <div className="text-xs text-orange-600 mt-1">
                                                                            Avg: {((data.timeSpent / (data.attempted || 1)) / 60).toFixed(1)} min/question
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500">No subject-wise performance data available</p>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )}
                            </div>

                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                                <span className="ml-3 text-gray-600">Failed to load analysis</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}