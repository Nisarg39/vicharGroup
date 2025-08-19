"use client"

import { memo, useState } from 'react'
import StudentExamHistory from './StudentExamHistory'
import {
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    BarChart3,
    User,
    BookOpen,
    Target,
    Award,
    CheckCircle,
    Medal,
    TrendingUp,
    TrendingDown,
    XCircle,
    Clock
} from 'lucide-react'

// Performance badge component
const PerformanceBadge = memo(({ performance, className = "" }) => {
    const badgeConfig = {
        excellent: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Medal },
        good: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: TrendingUp },
        average: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Target },
        below_average: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: TrendingDown },
        poor: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    }

    const config = badgeConfig[performance] || badgeConfig.poor
    const IconComponent = config.icon

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color} ${className}`}>
            <IconComponent className="w-3 h-3" />
            {performance.replace('_', ' ').toUpperCase()}
        </span>
    )
})

PerformanceBadge.displayName = 'PerformanceBadge'

// Student Detail View Component
const StudentWiseDetailedInfo = memo(({ student, onBack }) => {
    const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(true)
    const [isSubjectAnalysisExpanded, setIsSubjectAnalysisExpanded] = useState(false)
    const [isExamHistoryExpanded, setIsExamHistoryExpanded] = useState(false)
    
    if (!student) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header with Back Button */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Students List</span>
                    </button>
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{student.name}</h2>
                                    <p className="text-indigo-100">{student.email}</p>
                                    <p className="text-indigo-200 text-sm">
                                        {student.class} • {student.allocatedStreams ? student.allocatedStreams.join(', ') : student.stream}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Performance Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-200 rounded-xl">
                                    <BookOpen className="w-5 h-5 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Exams Attempted</p>
                                    <p className="text-2xl font-bold text-blue-900">{student.attemptedExams}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-200 rounded-xl">
                                    <Target className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Average Score</p>
                                    <p className="text-2xl font-bold text-green-900">{student.averageScore}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-200 rounded-xl">
                                    <Award className="w-5 h-5 text-purple-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Best Score</p>
                                    <p className="text-2xl font-bold text-purple-900">{student.highestScore}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-200 rounded-xl">
                                    <CheckCircle className="w-5 h-5 text-orange-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Pass Rate</p>
                                    <p className="text-2xl font-bold text-orange-900">{student.passRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Analysis */}
                    <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 mb-6 transition-all duration-200 ${
                        isPerformanceExpanded ? 'p-6' : 'p-4'
                    }`}>
                        <div 
                            className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200 ${
                                isPerformanceExpanded ? 'mb-4' : 'mb-0'
                            }`}
                            onClick={() => setIsPerformanceExpanded(!isPerformanceExpanded)}
                            title={isPerformanceExpanded ? "Click to collapse" : "Click to expand"}
                        >
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-indigo-600" />
                                Performance Analysis
                            </h3>
                            <div className="flex items-center gap-3">
                                <PerformanceBadge performance={student.performance} />
                                <div className="flex items-center gap-1 text-gray-600">
                                    {isPerformanceExpanded ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            <span className="text-sm">Collapse</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            <span className="text-sm">Expand</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isPerformanceExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-600 mb-3">Key Metrics</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">Exams Attempted</span>
                                            <span className="font-semibold">{student.attemptedExams}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">Total Marks Obtained</span>
                                            <span className="font-semibold">{student.obtainedMarks} / {student.totalMarks}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">Lowest Score</span>
                                            <span className="font-semibold">{student.lowestScore}</span>
                                        </div>
                                        {student.lastExamDate && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700">Last Exam</span>
                                                <span className="font-semibold text-sm">
                                                    {new Date(student.lastExamDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-600 mb-3">Performance Summary</h4>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            This student has {student.performance === 'excellent' ? 'excellent' : 
                                            student.performance === 'good' ? 'good' : 
                                            student.performance === 'average' ? 'average' : 
                                            student.performance === 'below_average' ? 'below average' : 'poor'} performance 
                                            with an average score of {student.averageScore}%. 
                                            {student.attemptedExams > 0 ? 
                                                ` They have attempted ${student.attemptedExams} exams with a pass rate of ${student.passRate}%.` :
                                                ' No exams have been attempted yet.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Cumulative Subject Analysis */}
                    {student.cumulativeSubjectAnalysis && student.cumulativeSubjectAnalysis.length > 0 && (
                        <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 mb-6 transition-all duration-200 ${
                            isSubjectAnalysisExpanded ? 'p-6' : 'p-4'
                        }`}>
                            <div 
                                className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200 ${
                                    isSubjectAnalysisExpanded ? 'mb-6' : 'mb-0'
                                }`}
                                onClick={() => setIsSubjectAnalysisExpanded(!isSubjectAnalysisExpanded)}
                                title={isSubjectAnalysisExpanded ? "Click to collapse" : "Click to expand"}
                            >
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-purple-600" />
                                    Cumulative Subject Analysis
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({student.cumulativeSubjectAnalysis.length} subjects)
                                    </span>
                                </h3>
                                <div className="flex items-center gap-1 text-gray-600">
                                    {isSubjectAnalysisExpanded ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            <span className="text-sm">Collapse</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            <span className="text-sm">Expand</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                isSubjectAnalysisExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                {/* Subject Insights Summary */}
                                {student.subjectInsights && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        {/* Strongest Subjects */}
                                        {student.subjectInsights.strongestSubjects && student.subjectInsights.strongestSubjects.length > 0 && (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                                                    <Award className="w-4 h-4" />
                                                    Strongest Subjects
                                                </h4>
                                                <div className="space-y-1">
                                                    {student.subjectInsights.strongestSubjects.slice(0, 2).map((subject, idx) => (
                                                        <div key={idx} className="text-sm text-green-700">
                                                            <span className="font-medium">{subject.subject}</span>
                                                            <span className="text-green-600"> ({subject.averageScore}%)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Improvement Areas */}
                                        {student.subjectInsights.weakestSubjects && student.subjectInsights.weakestSubjects.length > 0 && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                                <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-1">
                                                    <TrendingDown className="w-4 h-4" />
                                                    Needs Improvement
                                                </h4>
                                                <div className="space-y-1">
                                                    {student.subjectInsights.weakestSubjects.slice(0, 2).map((subject, idx) => (
                                                        <div key={idx} className="text-sm text-orange-700">
                                                            <span className="font-medium">{subject.subject}</span>
                                                            <span className="text-orange-600"> ({subject.averageScore}%)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Improving Subjects */}
                                        {student.subjectInsights.improvingSubjects && student.subjectInsights.improvingSubjects.length > 0 && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Improving Subjects
                                                </h4>
                                                <div className="space-y-1">
                                                    {student.subjectInsights.improvingSubjects.slice(0, 2).map((subject, idx) => (
                                                        <div key={idx} className="text-sm text-blue-700">
                                                            <span className="font-medium">{subject.subject}</span>
                                                            <span className="text-blue-600"> ({subject.averageScore}%)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Detailed Subject Performance Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {student.cumulativeSubjectAnalysis.map((subject, index) => (
                                        <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-bold text-gray-900">{subject.subject}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        subject.performanceCategory === 'excellent' ? 'bg-green-100 text-green-700' :
                                                        subject.performanceCategory === 'good' ? 'bg-blue-100 text-blue-700' :
                                                        subject.performanceCategory === 'average' ? 'bg-yellow-100 text-yellow-700' :
                                                        subject.performanceCategory === 'below_average' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {subject.performanceCategory.toUpperCase()}
                                                    </span>
                                                    {subject.improvementTrend === 'improving' && (
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                    )}
                                                    {subject.improvementTrend === 'declining' && (
                                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Score and Accuracy */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center bg-white rounded-lg p-3">
                                                        <div className="text-2xl font-bold text-indigo-600">{subject.averageScore}%</div>
                                                        <div className="text-xs text-gray-600">Average Score</div>
                                                    </div>
                                                    <div className="text-center bg-white rounded-lg p-3">
                                                        <div className="text-2xl font-bold text-purple-600">{subject.overallAccuracy}%</div>
                                                        <div className="text-xs text-gray-600">Accuracy</div>
                                                    </div>
                                                </div>

                                                {/* Statistics */}
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Exams:</span>
                                                        <span className="font-semibold ml-1">{subject.totalExamsAttempted}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Questions:</span>
                                                        <span className="font-semibold ml-1">{subject.totalQuestionsAttempted}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Consistency:</span>
                                                        <span className="font-semibold ml-1">{subject.consistencyRating}%</span>
                                                    </div>
                                                </div>

                                                {/* Difficulty Analysis */}
                                                {subject.difficultyAnalysis && (
                                                    <div>
                                                        <div className="text-xs font-semibold text-gray-600 mb-2">Difficulty Performance</div>
                                                        <div className="flex gap-2">
                                                            {Object.entries(subject.difficultyAnalysis).map(([level, data]) => (
                                                                <div key={level} className="flex-1 text-center bg-white rounded p-2">
                                                                    <div className="text-sm font-bold text-gray-800">{data.accuracy}%</div>
                                                                    <div className="text-xs text-gray-600 capitalize">{level}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Time Efficiency */}
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Time Efficiency:</span>
                                                    <span className={`font-semibold capitalize ${
                                                        subject.timeEfficiency === 'efficient' ? 'text-green-600' :
                                                        subject.timeEfficiency === 'slow' ? 'text-red-600' : 'text-yellow-600'
                                                    }`}>
                                                        {subject.timeEfficiency}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Exam History */}
                    <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 mb-6 transition-all duration-200 ${
                        isExamHistoryExpanded ? 'p-6' : 'p-4'
                    }`}>
                        <div 
                            className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200 ${
                                isExamHistoryExpanded ? 'mb-4' : 'mb-0'
                            }`}
                            onClick={() => setIsExamHistoryExpanded(!isExamHistoryExpanded)}
                            title={isExamHistoryExpanded ? "Click to collapse" : "Click to expand"}
                        >
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-indigo-600" />
                                Exam History
                            </h3>
                            <div className="flex items-center gap-1 text-gray-600">
                                {isExamHistoryExpanded ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        <span className="text-sm">Collapse</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        <span className="text-sm">Expand</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isExamHistoryExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <StudentExamHistory student={student} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

StudentWiseDetailedInfo.displayName = 'StudentWiseDetailedInfo'

export default StudentWiseDetailedInfo