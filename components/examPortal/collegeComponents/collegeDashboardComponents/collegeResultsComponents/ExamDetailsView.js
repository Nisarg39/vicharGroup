"use client"

import { useState } from 'react'
import { 
    ArrowLeft, 
    Calendar,
    Clock,
    Users,
    Trophy,
    Target,
    TrendingUp,
    TrendingDown,
    Download,
    Eye,
    BookOpen,
    Award,
    BarChart3,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'

export default function ExamDetailsView({ examId, onNavigate, onBack }) {
    const [activeTab, setActiveTab] = useState('overview')

    // Dummy exam details data
    const examDetails = {
        id: examId || 1,
        name: "Physics - Thermodynamics",
        subject: "Physics",
        class: "12th Science",
        date: "2024-01-15",
        duration: 180,
        totalQuestions: 40,
        totalMarks: 160,
        passingMarks: 64,
        status: "completed",
        createdBy: "Dr. Rajesh Kumar",
        description: "Comprehensive test covering all topics of thermodynamics including laws, processes, and applications."
    }

    const examStats = {
        totalStudents: 156,
        attemptedStudents: 152,
        averageScore: 82.3,
        highestScore: 98,
        lowestScore: 45,
        passRate: 91.7,
        medianScore: 84,
        standardDeviation: 12.5
    }

    const questionAnalysis = [
        { questionNo: 1, topic: "First Law", difficulty: "Easy", correctRate: 94.7, avgTime: 45 },
        { questionNo: 2, topic: "Second Law", difficulty: "Medium", correctRate: 78.3, avgTime: 78 },
        { questionNo: 3, topic: "Entropy", difficulty: "Hard", correctRate: 56.2, avgTime: 120 },
        { questionNo: 4, topic: "Carnot Engine", difficulty: "Medium", correctRate: 82.1, avgTime: 95 },
        { questionNo: 5, topic: "Heat Transfer", difficulty: "Easy", correctRate: 89.5, avgTime: 52 }
    ]

    const studentResults = [
        { 
            id: 1, 
            name: "Rahul Sharma", 
            rollNumber: "12SC001", 
            score: 98, 
            percentage: 61.25, 
            rank: 1, 
            timeTaken: 165, 
            status: "pass",
            correct: 39,
            incorrect: 1,
            unattempted: 0
        },
        { 
            id: 2, 
            name: "Priya Patel", 
            rollNumber: "12SC002", 
            score: 95, 
            percentage: 59.38, 
            rank: 2, 
            timeTaken: 170, 
            status: "pass",
            correct: 38,
            incorrect: 2,
            unattempted: 0
        },
        { 
            id: 3, 
            name: "Amit Kumar", 
            rollNumber: "12SC003", 
            score: 92, 
            percentage: 57.5, 
            rank: 3, 
            timeTaken: 155, 
            status: "pass",
            correct: 37,
            incorrect: 3,
            unattempted: 0
        },
        { 
            id: 4, 
            name: "Sneha Gupta", 
            rollNumber: "12SC004", 
            score: 88, 
            percentage: 55, 
            rank: 4, 
            timeTaken: 178, 
            status: "pass",
            correct: 35,
            incorrect: 4,
            unattempted: 1
        },
        { 
            id: 5, 
            name: "Vikash Singh", 
            rollNumber: "12SC005", 
            score: 45, 
            percentage: 28.13, 
            rank: 152, 
            timeTaken: 180, 
            status: "fail",
            correct: 18,
            incorrect: 15,
            unattempted: 7
        }
    ]

    const performanceDistribution = [
        { range: "90-100%", count: 28, percentage: 18.4 },
        { range: "80-89%", count: 45, percentage: 29.6 },
        { range: "70-79%", count: 38, percentage: 25.0 },
        { range: "60-69%", count: 24, percentage: 15.8 },
        { range: "50-59%", count: 12, percentage: 7.9 },
        { range: "Below 50%", count: 5, percentage: 3.3 }
    ]

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 bg-green-100'
            case 'Medium': return 'text-yellow-600 bg-yellow-100'
            case 'Hard': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusColor = (status) => {
        return status === 'pass' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{examDetails.name}</h1>
                            <p className="text-gray-600">Detailed examination analysis and results</p>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>

                    {/* Exam Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Date</p>
                                <p className="text-sm text-blue-700">{new Date(examDetails.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                            <Clock className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900">Duration</p>
                                <p className="text-sm text-green-700">{examDetails.duration} minutes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-purple-900">Questions</p>
                                <p className="text-sm text-purple-700">{examDetails.totalQuestions}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                            <Trophy className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-orange-900">Total Marks</p>
                                <p className="text-sm text-orange-700">{examDetails.totalMarks}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'questions', label: 'Question Analysis' },
                            { id: 'students', label: 'Student Results' },
                            { id: 'distribution', label: 'Score Distribution' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                                    ${activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Performance Stats */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Statistics</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-blue-900">Students Attempted</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-600">
                                        {examStats.attemptedStudents}/{examStats.totalStudents}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-900">Average Score</span>
                                    </div>
                                    <span className="text-xl font-bold text-green-600">{examStats.averageScore}%</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Target className="w-5 h-5 text-purple-600" />
                                        <span className="font-medium text-purple-900">Pass Rate</span>
                                    </div>
                                    <span className="text-xl font-bold text-purple-600">{examStats.passRate}%</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="w-5 h-5 text-orange-600" />
                                        <span className="font-medium text-orange-900">Score Range</span>
                                    </div>
                                    <span className="text-xl font-bold text-orange-600">
                                        {examStats.lowestScore}% - {examStats.highestScore}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Exam Details */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Exam Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Subject</label>
                                    <p className="text-gray-900 font-semibold">{examDetails.subject}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Class</label>
                                    <p className="text-gray-900 font-semibold">{examDetails.class}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Created By</label>
                                    <p className="text-gray-900 font-semibold">{examDetails.createdBy}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Passing Marks</label>
                                    <p className="text-gray-900 font-semibold">{examDetails.passingMarks} out of {examDetails.totalMarks}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Description</label>
                                    <p className="text-gray-700">{examDetails.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Question-wise Analysis</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Question</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Topic</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Difficulty</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Correct Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Avg Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {questionAnalysis.map((question) => (
                                        <tr key={question.questionNo} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                Question {question.questionNo}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{question.topic}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                                                    {question.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{question.correctRate}%</span>
                                                    {question.correctRate >= 80 ? (
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                    ) : question.correctRate >= 60 ? (
                                                        <TrendingUp className="w-4 h-4 text-yellow-600" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{question.avgTime}s</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Student Results</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Responses</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {studentResults.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full">
                                                    <span className="text-white font-bold text-xs">#{student.rank}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-sm text-gray-600">{student.rollNumber}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-bold text-lg text-gray-900">{student.score}</div>
                                                    <div className="text-sm text-gray-600">{student.percentage}%</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1">
                                                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        <CheckCircle className="w-3 h-3" />
                                                        {student.correct}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                        <XCircle className="w-3 h-3" />
                                                        {student.incorrect}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {student.unattempted}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{student.timeTaken} min</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                                                    {student.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => onNavigate('studentDetails', { studentId: student.id, examId: examDetails.id })}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'distribution' && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Score Distribution</h2>
                        <div className="space-y-4">
                            {performanceDistribution.map((range, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-20 text-sm font-medium text-gray-700">{range.range}</div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-center"
                                            style={{ width: `${range.percentage}%` }}
                                        >
                                            {range.percentage > 10 && (
                                                <span className="text-white text-xs font-medium">{range.percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-16 text-sm font-medium text-gray-700">{range.count} students</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}