"use client"
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    ChartBarIcon,
    BookOpenIcon,
    TrophyIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    SparklesIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getStudentExamAnalytics } from '../../../server_actions/actions/examController/studentExamActions'
import toast from 'react-hot-toast'

// Chart colors for consistency
const CHART_COLORS = {
    primary: '#1d77bc',
    secondary: '#2d8bd4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899'
}

export default function ClassroomExamAnalytics() {
    const student = useSelector(state => state.login.studentDetails)
    
    // State management
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [analyticsData, setAnalyticsData] = useState(null)
    const [activeTab, setActiveTab] = useState('overview') // overview, subjects, performance, insights
    
    // Fetch analytics data on component mount
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!student?._id) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                
                const result = await getStudentExamAnalytics(student._id)
                
                if (result.success) {
                    setAnalyticsData(result.analytics)
                    console.log('Analytics data loaded:', result.analytics)
                } else {
                    setError(result.message)
                    toast.error(result.message)
                }
            } catch (err) {
                console.error('Error fetching analytics:', err)
                setError('Failed to fetch analytics data')
                toast.error('Failed to fetch analytics data')
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [student?._id])


    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        })
    }

    // Format time in minutes and seconds
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}m ${remainingSeconds}s`
    }

    // Get performance color based on percentage
    const getPerformanceColor = (percentage) => {
        if (percentage >= 85) return 'text-green-600'
        if (percentage >= 70) return 'text-blue-600'
        if (percentage >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    // Get performance badge color
    const getPerformanceBadgeColor = (percentage) => {
        if (percentage >= 85) return 'bg-green-100 text-green-800'
        if (percentage >= 70) return 'bg-blue-100 text-blue-800'
        if (percentage >= 50) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
    }

    // Get trend icon
    const getTrendIcon = (trend) => {
        if (trend === 'up') return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
        if (trend === 'down') return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
        return <div className="w-4 h-4 rounded-full bg-gray-300" />
    }

    // Prepare chart data for performance over time
    const getPerformanceChartData = () => {
        if (!analyticsData?.performanceOverTime) return []
        
        return analyticsData.performanceOverTime.map((exam, index) => ({
            name: exam.examName.length > 15 ? `${exam.examName.substring(0, 15)}...` : exam.examName,
            fullName: exam.examName,
            percentage: Math.round(exam.percentage * 100) / 100,
            timeTaken: Math.round(exam.timeTaken / 60), // Convert to minutes
            date: formatDate(exam.examDate),
            stream: exam.stream,
            standard: exam.standard,
            index: index + 1
        }))
    }

    // Prepare subject-wise chart data
    const getSubjectChartData = () => {
        if (!analyticsData?.subjectWiseStats) return []
        
        return analyticsData.subjectWiseStats.map(subject => ({
            subject: subject.subject,
            percentage: subject.averagePercentage,
            accuracy: subject.averageAccuracy,
            attempts: subject.totalAttempts,
            totalQuestions: subject.totalQuestions,
            correct: subject.totalCorrect,
            incorrect: subject.totalIncorrect
        }))
    }

    // Loading state
    if (loading) {
        return (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl mb-4 shadow-md">
                        <ChartBarIcon className="w-6 h-6 text-[#1d77bc]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-2">
                        Exam Analytics
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Loading your performance data...</p>
                </div>
                
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d77bc]"></div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <div className="text-center py-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Analytics</h3>
                    <p className="text-gray-600 px-4">{error}</p>
                </div>
            </div>
        )
    }

    // No data state
    if (!analyticsData || analyticsData.overallStats.totalExamsAttempted === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl mb-4 shadow-md">
                        <ChartBarIcon className="w-6 h-6 text-[#1d77bc]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-2">
                        Exam Analytics
                    </h2>
                </div>
                
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <DocumentTextIcon className="w-16 h-16 text-[#1d77bc] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Exam Data Available</h3>
                    <p className="text-gray-600 mb-4 px-4">Take some exams to see your performance analytics</p>
                    <p className="text-sm text-gray-500 px-4">
                        Your detailed performance insights, subject-wise analysis, and improvement recommendations will appear here after you complete some exams.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl mb-4 shadow-md">
                    <ChartBarIcon className="w-6 h-6 text-[#1d77bc]" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-2">
                    Your Exam Analytics
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-2">
                    Comprehensive insights into your academic performance
                </p>
                
                {/* Student info and enrolled colleges */}
                {analyticsData.enrollments.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {analyticsData.enrollments.map((enrollment) => (
                            <span 
                                key={enrollment._id}
                                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200 flex items-center gap-1.5"
                            >
                                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 flex items-center justify-center">
                                    <img 
                                        src={enrollment.collegeLogo || '/default-college-logo.png'} 
                                        alt={enrollment.collegeName}
                                        className="h-3 w-3 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <BuildingOfficeIcon className="h-2 w-2 text-[#1d77bc] hidden" />
                                </div>
                                <span className="truncate">{enrollment.collegeName}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="flex bg-gray-100 rounded-2xl p-1.5 gap-1 w-full sm:w-auto overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                        { id: 'subjects', label: 'Subjects', icon: BookOpenIcon },
                        { id: 'performance', label: 'Performance', icon: TrophyIcon },
                        { id: 'insights', label: 'Insights', icon: SparklesIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm ${
                                activeTab === tab.id
                                    ? 'bg-white text-[#1d77bc] shadow-lg'
                                    : 'text-gray-600 hover:text-[#1d77bc] hover:bg-white/50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <OverviewTab analyticsData={analyticsData} formatTime={formatTime} getPerformanceColor={getPerformanceColor} />
                )}
                
                {activeTab === 'subjects' && (
                    <SubjectsTab getSubjectChartData={getSubjectChartData} getPerformanceBadgeColor={getPerformanceBadgeColor} />
                )}
                
                {activeTab === 'performance' && (
                    <PerformanceTab getPerformanceChartData={getPerformanceChartData} />
                )}
                
                {activeTab === 'insights' && (
                    <InsightsTab analyticsData={analyticsData} getTrendIcon={getTrendIcon} />
                )}
            </div>
        </div>
    )
}

// Overview Tab Component
function OverviewTab({ analyticsData, formatTime, getPerformanceColor }) {
    const { overallStats, subjectWiseStats } = analyticsData
    
    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                        {overallStats.totalExamsAttempted}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700">Exams Taken</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                    <div className={`text-2xl sm:text-3xl font-bold mb-1 ${getPerformanceColor(overallStats.averagePercentage)}`}>
                        {overallStats.averagePercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-green-700">Average Score</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                        {overallStats.totalTimeSpent}
                    </div>
                    <div className="text-xs sm:text-sm text-purple-700">Minutes Spent</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                        {overallStats.bestPerformance.toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-orange-700">Best Score</div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-[#1d77bc]" />
                    Performance Summary
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {overallStats.completionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {overallStats.totalExamsAttempted} of {overallStats.totalExamsAvailable} available
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className={`text-3xl font-bold mb-1 ${getPerformanceColor(overallStats.bestPerformance)}`}>
                            {overallStats.bestPerformance.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Best Performance</div>
                        <div className="text-xs text-gray-500 mt-1">Highest exam score</div>
                    </div>
                    
                    <div className="text-center sm:col-span-2 lg:col-span-1">
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {subjectWiseStats.length}
                        </div>
                        <div className="text-sm text-gray-600">Subjects Covered</div>
                        <div className="text-xs text-gray-500 mt-1">Different subjects attempted</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Preview */}
            {analyticsData.examResults.length > 0 && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-[#1d77bc]" />
                        Recent Exams
                    </h3>
                    
                    <div className="space-y-3">
                        {analyticsData.examResults.slice(0, 3).map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800 truncate">
                                        {result.exam?.examName || 'Unknown Exam'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(result.completedAt).toLocaleDateString('en-IN')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${getPerformanceColor(result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0)}`}>
                                        {result.totalMarks > 0 ? ((result.score / result.totalMarks) * 100).toFixed(1) : 0}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatTime(result.timeTaken || 0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Subjects Tab Component  
function SubjectsTab({ getSubjectChartData, getPerformanceBadgeColor }) {
    const subjectData = getSubjectChartData()
    
    if (subjectData.length === 0) {
        return (
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <BookOpenIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Subject Data</h3>
                <p className="text-gray-600 px-4">Take exams to see subject-wise performance breakdown</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            {/* Subject Performance Chart */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5 text-[#1d77bc]" />
                    Subject-wise Performance
                </h3>
                
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name) => [
                                    name === 'percentage' ? `${value.toFixed(1)}%` : value,
                                    name === 'percentage' ? 'Average Score' : name === 'accuracy' ? 'Accuracy' : 'Attempts'
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="percentage" fill={CHART_COLORS.primary} name="Average Score (%)" />
                            <Bar dataKey="accuracy" fill={CHART_COLORS.success} name="Accuracy (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subject Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectData.map((subject, index) => (
                    <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-800">{subject.subject}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceBadgeColor(subject.percentage)}`}>
                                {subject.percentage.toFixed(1)}%
                            </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Attempts:</span>
                                <span className="font-medium">{subject.attempts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Questions:</span>
                                <span className="font-medium">{subject.totalQuestions}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Correct:</span>
                                <span className="font-medium text-green-600">{subject.correct}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Incorrect:</span>
                                <span className="font-medium text-red-600">{subject.incorrect}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Accuracy:</span>
                                <span className="font-medium">{subject.accuracy.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Performance Tab Component
function PerformanceTab({ getPerformanceChartData }) {
    const performanceData = getPerformanceChartData()
    
    if (performanceData.length === 0) {
        return (
            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                <TrophyIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Performance Data</h3>
                <p className="text-gray-600 px-4">Take more exams to see your performance trends</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            {/* Performance Over Time Chart */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-[#1d77bc]" />
                    Performance Over Time
                </h3>
                
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip 
                                formatter={(value, name) => [
                                    name === 'percentage' ? `${value}%` : `${value} min`,
                                    name === 'percentage' ? 'Score' : 'Time Taken'
                                ]}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload[0]) {
                                        return `${payload[0].payload.fullName} (${payload[0].payload.date})`
                                    }
                                    return label
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="percentage" 
                                stroke={CHART_COLORS.primary} 
                                strokeWidth={3}
                                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 6 }}
                                name="Score (%)"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="timeTaken" 
                                stroke={CHART_COLORS.secondary} 
                                strokeWidth={2}
                                dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
                                name="Time (min)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Performance Details Table */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Exam History Details</h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">#</th>
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Exam Name</th>
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Score</th>
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Time</th>
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Stream</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceData.map((exam, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-2">{exam.index}</td>
                                    <td className="py-3 px-2 font-medium" title={exam.fullName}>
                                        {exam.name}
                                    </td>
                                    <td className="py-3 px-2 text-gray-600">{exam.date}</td>
                                    <td className="py-3 px-2">
                                        <span className={`font-bold ${
                                            exam.percentage >= 85 ? 'text-green-600' :
                                            exam.percentage >= 70 ? 'text-blue-600' :
                                            exam.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {exam.percentage}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-gray-600">{exam.timeTaken} min</td>
                                    <td className="py-3 px-2">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            {exam.stream} - {exam.standard}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// Insights Tab Component
function InsightsTab({ analyticsData, getTrendIcon }) {
    const { insights, subjectWiseStats } = analyticsData
    
    return (
        <div className="space-y-6">
            {/* Insights Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-200 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-700" />
                        </div>
                        <h3 className="text-lg font-bold text-green-800">Strengths</h3>
                    </div>
                    
                    {insights.strengths.length > 0 ? (
                        <ul className="space-y-2">
                            {insights.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-green-600 text-sm">Keep taking exams to identify your strengths!</p>
                    )}
                </div>

                {/* Areas for Improvement */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-200 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6 text-orange-700" />
                        </div>
                        <h3 className="text-lg font-bold text-orange-800">Areas for Improvement</h3>
                    </div>
                    
                    {insights.improvements.length > 0 ? (
                        <ul className="space-y-2">
                            {insights.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start gap-2 text-orange-700">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-orange-600 text-sm">Great job! No major areas for improvement identified.</p>
                    )}
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-200 rounded-lg">
                        <SparklesIcon className="w-6 h-6 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-800">Personalized Recommendations</h3>
                </div>
                
                {insights.recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {insights.recommendations.map((recommendation, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <p className="text-sm text-blue-700 leading-relaxed">{recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-blue-600 text-sm">Complete more exams to get personalized recommendations!</p>
                )}
            </div>

            {/* Subject-wise Quick Stats */}
            {subjectWiseStats.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Subject Performance Summary</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectWiseStats.slice(0, 6).map((subject, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-800 text-sm">{subject.subject}</h4>
                                    {getTrendIcon('stable')}
                                </div>
                                
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average:</span>
                                        <span className={`font-medium ${
                                            subject.averagePercentage >= 75 ? 'text-green-600' :
                                            subject.averagePercentage >= 50 ? 'text-blue-600' : 'text-red-600'
                                        }`}>
                                            {subject.averagePercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Best:</span>
                                        <span className="font-medium text-green-600">{subject.bestPerformance.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Attempts:</span>
                                        <span className="font-medium">{subject.totalAttempts}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}