"use client"
import { useState, useEffect, useMemo, memo } from 'react'
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
import {
    safeDivide,
    safePercentage,
    safeRound,
    safeParseNumber,
    standardPercentage,
    safeFormatTime,
    clamp
} from '../../../utils/safeNumericOperations'
import {
    validateAnalyticsData,
    validateSubjectChartData,
    validatePerformanceChartData,
    validateExamResult,
    formatDate as safeFormatDate,
    wrapWithErrorHandling
} from '../../../utils/dataValidation'

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
                
                if (result.success && result.analytics) {
                    // Validate analytics data before setting
                    const validation = validateAnalyticsData(result.analytics)
                    
                    if (!validation.isValid) {
                        console.warn('Analytics data validation warnings:', validation.errors)
                        // Continue with data but log warnings
                    }
                    
                    setAnalyticsData(result.analytics)
                    console.log('Analytics data loaded:', result.analytics)
                } else {
                    setError(result.message || 'Failed to load analytics')
                    toast.error(result.message || 'Failed to load analytics')
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
        
        // Cleanup function
        return () => {
            // Any cleanup needed when component unmounts or dependencies change
        }
    }, [student?._id]) // Only re-fetch when student changes, not on tab change


    // Format date for display - using safe version
    const formatDate = (dateString) => {
        return safeFormatDate(dateString)
    }

    // Format time in minutes and seconds - using safe version
    const formatTime = (seconds) => {
        return safeFormatTime(seconds)
    }

    // Get performance color based on percentage - with safe parsing
    const getPerformanceColor = (percentage) => {
        const safePerc = safeParseNumber(percentage, 0)
        if (safePerc >= 85) return 'text-green-600'
        if (safePerc >= 70) return 'text-blue-600'
        if (safePerc >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    // Get performance badge color - with safe parsing
    const getPerformanceBadgeColor = (percentage) => {
        const safePerc = safeParseNumber(percentage, 0)
        if (safePerc >= 85) return 'bg-green-100 text-green-800'
        if (safePerc >= 70) return 'bg-blue-100 text-blue-800'
        if (safePerc >= 50) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
    }

    // Get trend icon
    const getTrendIcon = (trend) => {
        if (trend === 'up') return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
        if (trend === 'down') return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
        return <div className="w-4 h-4 rounded-full bg-gray-300" />
    }

    // Prepare chart data for performance over time - with validation (memoized)
    const performanceChartData = useMemo(() => {
        return wrapWithErrorHandling(() => {
            if (!analyticsData?.performanceOverTime) return []
            
            return validatePerformanceChartData(analyticsData.performanceOverTime)
        }, [])()
    }, [analyticsData?.performanceOverTime])

    // Prepare subject-wise chart data - with validation (memoized)
    const subjectChartData = useMemo(() => {
        return wrapWithErrorHandling(() => {
            if (!analyticsData?.subjectWiseStats) return []
            
            return validateSubjectChartData(analyticsData.subjectWiseStats)
        }, [])()
    }, [analyticsData?.subjectWiseStats])

    // Loading state
    if (loading) {
        return (
            <div>
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
            <div className="text-center py-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Analytics</h3>
                <p className="text-gray-600 px-4">{error}</p>
            </div>
        )
    }

    // No data state - with safe checking
    if (!analyticsData || safeParseNumber(analyticsData.overallStats?.totalExamsAttempted, 0) === 0) {
        return (
            <div>
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
        <div>
            {/* Header Section */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl mb-3 sm:mb-4 shadow-md">
                    <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d77bc]" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-2 px-2">
                    Your Exam Analytics
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-3 sm:px-2">
                    Comprehensive insights into your academic performance
                </p>
                
                {/* Student info and enrolled colleges */}
                {analyticsData.enrollments.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 justify-center px-2">
                        {analyticsData.enrollments.map((enrollment) => (
                            <span 
                                key={enrollment._id}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200 flex items-center gap-1 sm:gap-1.5 max-w-[200px] sm:max-w-none"
                            >
                                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 flex items-center justify-center flex-shrink-0">
                                    <img 
                                        src={enrollment.collegeLogo || '/default-college-logo.png'} 
                                        alt={enrollment.collegeName}
                                        className="h-2 w-2 sm:h-3 sm:w-3 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <BuildingOfficeIcon className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-[#1d77bc] hidden" />
                                </div>
                                <span className="truncate text-xs">{enrollment.collegeName}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
                <div className="flex bg-gray-100 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 gap-0.5 sm:gap-1 w-full max-w-full sm:w-auto overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                        { id: 'subjects', label: 'Subjects', icon: BookOpenIcon },
                        { id: 'performance', label: 'Performance', icon: TrophyIcon },
                        { id: 'insights', label: 'Insights', icon: SparklesIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium sm:font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm min-w-0 flex-1 sm:flex-initial ${
                                activeTab === tab.id
                                    ? 'bg-white text-[#1d77bc] shadow-lg'
                                    : 'text-gray-600 hover:text-[#1d77bc] hover:bg-white/50'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="hidden xs:inline sm:inline truncate">{tab.label}</span>
                            <span className="xs:hidden sm:hidden truncate">{tab.label.slice(0, 4)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px] sm:min-h-[400px] px-2 sm:px-4">
                {activeTab === 'overview' && (
                    <OverviewTab analyticsData={analyticsData} formatTime={formatTime} getPerformanceColor={getPerformanceColor} />
                )}
                
                {activeTab === 'subjects' && (
                    <SubjectsTab subjectChartData={subjectChartData} getPerformanceBadgeColor={getPerformanceBadgeColor} />
                )}
                
                {activeTab === 'performance' && (
                    <PerformanceTab performanceChartData={performanceChartData} />
                )}
                
                {activeTab === 'insights' && (
                    <InsightsTab analyticsData={analyticsData} getTrendIcon={getTrendIcon} />
                )}
            </div>
        </div>
    )
}

// Overview Tab Component
const OverviewTab = memo(function OverviewTab({ analyticsData, formatTime, getPerformanceColor }) {
    const { overallStats, subjectWiseStats } = analyticsData
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600 mb-0.5 sm:mb-1">
                        {overallStats.totalExamsAttempted}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700">Exams Taken</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className={`text-lg sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1 ${getPerformanceColor(overallStats.averagePercentage)}`}>
                        {safeRound(safeParseNumber(overallStats.averagePercentage, 0), 1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-green-700">Average Score</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600 mb-0.5 sm:mb-1">
                        {safeParseNumber(overallStats.totalTimeSpent, 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-purple-700">Minutes Spent</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-orange-600 mb-0.5 sm:mb-1">
                        {safeRound(safeParseNumber(overallStats.bestPerformance, 0), 1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-orange-700">Best Score</div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc]" />
                    Performance Summary
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-0">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                            {safeRound(safeParseNumber(overallStats.completionRate, 0), 1)}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Completion Rate</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {safeParseNumber(overallStats.totalExamsAttempted, 0)} of {safeParseNumber(overallStats.totalExamsAvailable, 0)} available
                        </div>
                    </div>
                    
                    <div className="text-center p-3 sm:p-0">
                        <div className={`text-2xl sm:text-3xl font-bold mb-1 ${getPerformanceColor(overallStats.bestPerformance)}`}>
                            {safeRound(safeParseNumber(overallStats.bestPerformance, 0), 1)}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Best Performance</div>
                        <div className="text-xs text-gray-500 mt-1">Highest exam score</div>
                    </div>
                    
                    <div className="text-center p-3 sm:p-0 sm:col-span-2 lg:col-span-1">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                            {subjectWiseStats.length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Subjects Covered</div>
                        <div className="text-xs text-gray-500 mt-1">Different subjects attempted</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Preview */}
            {analyticsData.examResults.length > 0 && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc]" />
                        Recent Exams
                    </h3>
                    
                    <div className="space-y-2 sm:space-y-3">
                        {analyticsData.examResults.slice(0, 3).map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="font-medium text-gray-800 truncate text-sm sm:text-base">
                                        {result.exam?.examName || 'Unknown Exam'}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500">
                                        {new Date(result.completedAt).toLocaleDateString('en-IN')}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className={`font-bold text-sm sm:text-base ${getPerformanceColor(standardPercentage(result.score, result.totalMarks))}`}>
                                        {standardPercentage(result.score, result.totalMarks, 1)}%
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
})

// Subjects Tab Component  
const SubjectsTab = memo(function SubjectsTab({ subjectChartData, getPerformanceBadgeColor }) {
    const subjectData = subjectChartData
    
    if (subjectData.length === 0) {
        return (
            <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl px-4">
                <BookOpenIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Subject Data</h3>
                <p className="text-gray-600 text-sm sm:text-base">Take exams to see subject-wise performance breakdown</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Subject Performance Chart */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc]" />
                    Subject-wise Performance
                </h3>
                
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="subject" 
                                fontSize={12}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis fontSize={12} />
                            <Tooltip 
                                formatter={(value, name) => [
                                    `${value.toFixed(1)}%`,
                                    name === 'percentage' ? 'Average Score' : 'Accuracy'
                                ]}
                                contentStyle={{ fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="percentage" fill={CHART_COLORS.primary} name="Average Score (%)" />
                            <Bar dataKey="accuracy" fill={CHART_COLORS.success} name="Accuracy (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subject Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {subjectData.map((subject, index) => (
                    <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <h4 className="font-bold text-gray-800 text-sm sm:text-base flex-1 pr-2 leading-tight">{subject.subject}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPerformanceBadgeColor(subject.percentage)}`}>
                                {subject.percentage.toFixed(1)}%
                            </span>
                        </div>
                        
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
})

// Performance Tab Component
const PerformanceTab = memo(function PerformanceTab({ performanceChartData }) {
    const performanceData = performanceChartData
    
    if (performanceData.length === 0) {
        return (
            <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl px-4">
                <TrophyIcon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Performance Data</h3>
                <p className="text-gray-600 text-sm sm:text-base">Take more exams to see your performance trends</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Performance Over Time Chart */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc]" />
                    Performance Over Time
                </h3>
                
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                interval={0}
                            />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
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
                                contentStyle={{ fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
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
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Exam History Details</h3>
                
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="w-full text-xs sm:text-sm min-w-[500px]">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">#</th>
                                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">Exam Name</th>
                                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">Date</th>
                                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">Score</th>
                                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">Time</th>
                                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">Stream</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceData.map((exam, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 sm:py-3 px-1 sm:px-2">{exam.index}</td>
                                    <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium" title={exam.fullName}>
                                        <div className="max-w-[120px] sm:max-w-none truncate">{exam.name}</div>
                                    </td>
                                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-600 text-xs">{exam.date}</td>
                                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                                        <span className={`font-bold ${
                                            safeParseNumber(exam.percentage, 0) >= 85 ? 'text-green-600' :
                                            safeParseNumber(exam.percentage, 0) >= 70 ? 'text-blue-600' :
                                            safeParseNumber(exam.percentage, 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {safeRound(safeParseNumber(exam.percentage, 0), 1)}%
                                        </span>
                                    </td>
                                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-600">{exam.timeTaken} min</td>
                                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded text-xs whitespace-nowrap">
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
})

// Insights Tab Component
const InsightsTab = memo(function InsightsTab({ analyticsData, getTrendIcon }) {
    const { insights, subjectWiseStats } = analyticsData
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Insights Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Strengths */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 bg-green-200 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-green-800">Strengths</h3>
                    </div>
                    
                    {insights.strengths.length > 0 ? (
                        <ul className="space-y-1.5 sm:space-y-2">
                            {insights.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-green-700">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                    <span className="text-xs sm:text-sm leading-relaxed">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-green-600 text-xs sm:text-sm">Keep taking exams to identify your strengths!</p>
                    )}
                </div>

                {/* Areas for Improvement */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 bg-orange-200 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-orange-800">Areas for Improvement</h3>
                    </div>
                    
                    {insights.improvements.length > 0 ? (
                        <ul className="space-y-1.5 sm:space-y-2">
                            {insights.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start gap-2 text-orange-700">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                    <span className="text-xs sm:text-sm leading-relaxed">{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-orange-600 text-sm">Great job! No major areas for improvement identified.</p>
                    )}
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-1.5 sm:p-2 bg-blue-200 rounded-lg">
                        <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-blue-800">Personalized Recommendations</h3>
                </div>
                
                {insights.recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {insights.recommendations.map((recommendation, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-100">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 font-bold text-xs sm:text-sm">{index + 1}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">{recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-blue-600 text-xs sm:text-sm">Complete more exams to get personalized recommendations!</p>
                )}
            </div>

            {/* Subject-wise Quick Stats */}
            {subjectWiseStats.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Subject Performance Summary</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {subjectWiseStats.slice(0, 6).map((subject, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm truncate pr-2">{subject.subject}</h4>
                                    {getTrendIcon('stable')}
                                </div>
                                
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average:</span>
                                        <span className={`font-medium ${
                                            safeParseNumber(subject.averagePercentage, 0) >= 75 ? 'text-green-600' :
                                            safeParseNumber(subject.averagePercentage, 0) >= 50 ? 'text-blue-600' : 'text-red-600'
                                        }`}>
                                            {safeRound(safeParseNumber(subject.averagePercentage, 0), 1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Best:</span>
                                        <span className="font-medium text-green-600">{safeRound(safeParseNumber(subject.bestPerformance, 0), 1)}%</span>
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
})