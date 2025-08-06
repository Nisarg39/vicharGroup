"use client"

import { useState } from 'react'
import { 
    ArrowLeft, 
    User,
    Trophy,
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock,
    Target,
    Award,
    BookOpen,
    Eye,
    Download,
    Mail,
    Phone,
    BarChart3,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'

export default function StudentPerformanceView({ studentId, onNavigate, onBack }) {
    const [activeTab, setActiveTab] = useState('overview')

    // Dummy student data
    const studentData = {
        id: studentId || 1,
        name: "Rahul Sharma",
        email: "rahul.sharma@email.com",
        phone: "+91 9876543210",
        rollNumber: "12SC001",
        class: "12th Science",
        stream: "PCM",
        admissionDate: "2023-04-15",
        parentName: "Mr. Suresh Sharma",
        address: "123 Main Street, New Delhi"
    }

    const performanceStats = {
        totalExams: 12,
        attemptedExams: 11,
        averageScore: 87.3,
        highestScore: 98,
        lowestScore: 72,
        totalMarks: 960,
        obtainedMarks: 838,
        passRate: 100,
        currentRank: 3,
        improvement: 15.2
    }

    const examHistory = [
        {
            id: 1,
            name: "Physics - Thermodynamics",
            subject: "Physics",
            date: "2024-01-15",
            score: 95,
            maxScore: 100,
            percentage: 95,
            rank: 2,
            timeTaken: 165,
            status: "completed",
            correct: 38,
            incorrect: 2,
            unattempted: 0
        },
        {
            id: 2,
            name: "Mathematics - Calculus",
            subject: "Mathematics", 
            date: "2024-01-12",
            score: 88,
            maxScore: 100,
            percentage: 88,
            rank: 5,
            timeTaken: 170,
            status: "completed",
            correct: 35,
            incorrect: 4,
            unattempted: 1
        },
        {
            id: 3,
            name: "Chemistry - Organic",
            subject: "Chemistry",
            date: "2024-01-10", 
            score: 92,
            maxScore: 100,
            percentage: 92,
            rank: 3,
            timeTaken: 155,
            status: "completed",
            correct: 37,
            incorrect: 3,
            unattempted: 0
        },
        {
            id: 4,
            name: "English - Literature",
            subject: "English",
            date: "2024-01-08",
            score: 85,
            maxScore: 100,
            percentage: 85,
            rank: 8,
            timeTaken: 178,
            status: "completed",
            correct: 34,
            incorrect: 5,
            unattempted: 1
        },
        {
            id: 5,
            name: "Physics - Mechanics",
            subject: "Physics",
            date: "2024-01-05",
            score: 78,
            maxScore: 100,
            percentage: 78,
            rank: 12,
            timeTaken: 180,
            status: "completed",
            correct: 31,
            incorrect: 7,
            unattempted: 2
        }
    ]

    const subjectPerformance = [
        { subject: "Physics", averageScore: 86.5, exams: 4, trend: "up", improvement: 8 },
        { subject: "Mathematics", averageScore: 82.3, exams: 3, trend: "down", improvement: -3 },
        { subject: "Chemistry", averageScore: 89.7, exams: 3, trend: "up", improvement: 12 },
        { subject: "English", averageScore: 85.2, exams: 2, trend: "up", improvement: 5 }
    ]

    const strengths = [
        { area: "Thermodynamics", score: 94.5, confidence: "high" },
        { area: "Organic Chemistry", score: 91.2, confidence: "high" },
        { area: "Literature Analysis", score: 88.7, confidence: "medium" },
        { area: "Calculus", score: 85.3, confidence: "medium" }
    ]

    const weaknesses = [
        { area: "Mechanics", score: 72.1, improvement: "needed" },
        { area: "Algebra", score: 75.8, improvement: "moderate" },
        { area: "Grammar", score: 78.2, improvement: "slight" }
    ]

    const getStatusColor = (status) => {
        return status === 'completed' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
    }

    const getTrendIcon = (trend) => {
        return trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
        )
    }

    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'high': return 'text-green-600 bg-green-100'
            case 'medium': return 'text-yellow-600 bg-yellow-100'
            case 'low': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{studentData.name}</h1>
                            <p className="text-gray-600">Comprehensive performance analysis and progress tracking</p>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>

                    {/* Student Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                            <User className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Roll Number</p>
                                <p className="text-sm text-blue-700">{studentData.rollNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                            <BookOpen className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900">Class & Stream</p>
                                <p className="text-sm text-green-700">{studentData.class} - {studentData.stream}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                            <Trophy className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-purple-900">Current Rank</p>
                                <p className="text-sm text-purple-700">#{performanceStats.currentRank}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                            <Target className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-orange-900">Average Score</p>
                                <p className="text-sm text-orange-700">{performanceStats.averageScore}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'exams', label: 'Exam History' },
                            { id: 'subjects', label: 'Subject Performance' },
                            { id: 'analysis', label: 'Strengths & Weaknesses' }
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
                        {/* Performance Summary */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-blue-900">Total Exams</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-600">
                                        {performanceStats.attemptedExams}/{performanceStats.totalExams}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-900">Average Score</span>
                                    </div>
                                    <span className="text-xl font-bold text-green-600">{performanceStats.averageScore}%</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-purple-600" />
                                        <span className="font-medium text-purple-900">Best Score</span>
                                    </div>
                                    <span className="text-xl font-bold text-purple-600">{performanceStats.highestScore}%</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                        <span className="font-medium text-orange-900">Improvement</span>
                                    </div>
                                    <span className="text-xl font-bold text-orange-600">+{performanceStats.improvement}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Student Details */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Student Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                                    <p className="text-gray-900 font-semibold">{studentData.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{studentData.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Phone</label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{studentData.phone}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Parent/Guardian</label>
                                    <p className="text-gray-900 font-semibold">{studentData.parentName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Admission Date</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{new Date(studentData.admissionDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Exam History</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Exam</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Responses</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {examHistory.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{exam.name}</div>
                                                    <div className="text-sm text-gray-600">{exam.subject}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(exam.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-bold text-lg text-gray-900">{exam.score}/{exam.maxScore}</div>
                                                    <div className="text-sm text-gray-600">{exam.percentage}%</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full">
                                                    <span className="text-white font-bold text-xs">#{exam.rank}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1">
                                                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        <CheckCircle className="w-3 h-3" />
                                                        {exam.correct}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                        <XCircle className="w-3 h-3" />
                                                        {exam.incorrect}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {exam.unattempted}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{exam.timeTaken} min</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => onNavigate('examDetails', { examId: exam.id, studentId: studentData.id })}
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

                {activeTab === 'subjects' && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Subject-wise Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subjectPerformance.map((subject, index) => (
                                <div key={index} className="p-6 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
                                        {getTrendIcon(subject.trend)}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Average Score</span>
                                            <span className="text-lg font-bold text-gray-900">{subject.averageScore}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Total Exams</span>
                                            <span className="text-lg font-bold text-gray-900">{subject.exams}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Improvement</span>
                                            <span className={`text-lg font-bold ${subject.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {subject.improvement >= 0 ? '+' : ''}{subject.improvement}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                                style={{ width: `${subject.averageScore}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Strengths</h2>
                            <div className="space-y-4">
                                {strengths.map((strength, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                        <div>
                                            <h3 className="font-semibold text-green-900">{strength.area}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(strength.confidence)}`}>
                                                {strength.confidence} confidence
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">{strength.score}%</div>
                                            <Trophy className="w-5 h-5 text-green-600 mx-auto" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Areas for Improvement */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Areas for Improvement</h2>
                            <div className="space-y-4">
                                {weaknesses.map((weakness, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                                        <div>
                                            <h3 className="font-semibold text-orange-900">{weakness.area}</h3>
                                            <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full font-medium">
                                                {weakness.improvement} improvement
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-orange-600">{weakness.score}%</div>
                                            <Target className="w-5 h-5 text-orange-600 mx-auto" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}