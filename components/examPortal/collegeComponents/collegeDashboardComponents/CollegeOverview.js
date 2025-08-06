import {
    UsersIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    TrophyIcon,
    AcademicCapIcon,
    ChartPieIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';
import { getCollegeAnalytics, getCollegeDashboardSummary } from '../../../../server_actions/actions/examController/collegeActions';

export default function CollegeOverview({collegeData, examDetails}) {
    const [analytics, setAnalytics] = useState(null)
    const [dashboardSummary, setDashboardSummary] = useState(null)
    const [loading, setLoading] = useState(true)

    // Calculate basic statistics from examDetails (fallback)
    const basicStats = {
        totalStudents: 0,
        activeExams: examDetails?.filter(exam => exam.examStatus === 'active').length || 0,
        completedExams: examDetails?.filter(exam => exam.status === 'completed').length || 0,
        totalExams: examDetails?.length || 0,
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('isCollege')
                console.log('🔍 Frontend Debug:', { 
                    hasToken: !!token, 
                    hasCollegeData: !!collegeData,
                    collegeId: collegeData?._id 
                })
                
                if (token && collegeData) {
                    // Fetch both dashboard summary (for reliable basic stats) and analytics (for detailed data)
                    const [summaryResponse, analyticsResponse] = await Promise.all([
                        getCollegeDashboardSummary({ token }),
                        getCollegeAnalytics({ token })
                    ])
                    
                    console.log('📊 Summary Response:', summaryResponse)
                    console.log('📈 Analytics Response:', analyticsResponse)
                    
                    if (summaryResponse.success) {
                        setDashboardSummary(summaryResponse.summary)
                        console.log('✅ Dashboard Summary Set:', summaryResponse.summary)
                    } else {
                        console.error('❌ Summary failed:', summaryResponse.message)
                    }
                    
                    if (analyticsResponse.success) {
                        setAnalytics(analyticsResponse.analytics)
                        console.log('✅ Analytics Set:', analyticsResponse.analytics)
                    } else {
                        console.error('❌ Analytics failed:', analyticsResponse.message)
                    }
                } else {
                    console.log('❌ Missing token or college data')
                }
            } catch (error) {
                console.error('Data fetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (collegeData?._id) {
            fetchData()
        }
    }, [collegeData?._id])

    // Use dashboard summary for basic stats (more reliable), analytics for detailed data
    const stats = dashboardSummary ? {
        totalStudents: dashboardSummary.totalStudents,
        activeExams: examDetails?.filter(exam => exam.examStatus === 'active').length || 0,
        completedExams: examDetails?.filter(exam => exam.status === 'completed').length || 0,
        totalExams: dashboardSummary.totalExams,
        totalSubmissions: dashboardSummary.totalExamAttempts,
        averageScore: analytics?.overview?.averageScore || 0,
        highestScore: analytics?.overview?.highestScore || 0,
        lowestScore: analytics?.overview?.lowestScore || 0,
        passRate: analytics?.overview?.passRate || 0
    } : (analytics?.overview || basicStats)

    console.log('📋 Final Stats:', {
        stats,
        dashboardSummary,
        analyticsOverview: analytics?.overview,
        basicStats,
        examDetailsLength: examDetails?.length
    })

    return (
        <main className="p-8">
            {/* College Info Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{collegeData?.collegeName || 'College Dashboard'}</h1>
                        <p className="text-gray-600 mt-1">{collegeData?.collegeEmail}</p>
                        {collegeData?.address && (
                            <p className="text-sm text-gray-500 mt-1">{collegeData.address}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">College Code</p>
                        <p className="text-lg font-semibold text-gray-800">{collegeData?.collegeCode || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Students</p>
                                <p className="text-2xl font-semibold text-gray-800">{stats.totalStudents}</p>
                                {analytics?.recentActivity && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {analytics.recentActivity.activeStudents} active
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UsersIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active Exams</p>
                                <p className="text-2xl font-semibold text-gray-800">{stats.activeExams}</p>
                                {analytics?.recentActivity && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        +{analytics.recentActivity.recentExams} this week
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <DocumentTextIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Submissions</p>
                                <p className="text-2xl font-semibold text-gray-800">{stats.totalSubmissions || 0}</p>
                                {analytics?.recentActivity && (
                                    <p className="text-xs text-purple-600 mt-1">
                                        +{analytics.recentActivity.recentSubmissions} this week
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Average Score</p>
                                <p className="text-2xl font-semibold text-gray-800">{stats.averageScore || 0}%</p>
                                {stats.passRate && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {stats.passRate}% pass rate
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Analytics */}
            {!loading && analytics && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Subject Performance */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center mb-4">
                                <AcademicCapIcon className="w-5 h-5 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800">Subject Performance</h3>
                            </div>
                            {analytics.subjectAnalytics.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.subjectAnalytics.slice(0, 5).map((subject, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">{subject.subject}</p>
                                                <p className="text-sm text-gray-500">{subject.totalAttempts} attempts</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-800">{subject.averageScore}%</p>
                                                <p className="text-sm text-gray-500">{subject.accuracy}% accuracy</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ChartPieIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No subject data available</p>
                                </div>
                            )}
                        </div>

                        {/* Stream Performance */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center mb-4">
                                <ChartPieIcon className="w-5 h-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800">Stream Performance</h3>
                            </div>
                            {analytics.streamAnalytics.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.streamAnalytics.map((stream, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">{stream.stream}</p>
                                                <p className="text-sm text-gray-500">{stream.studentCount} students</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-800">
                                                    {stream.averageScore && !isNaN(stream.averageScore) ? `${stream.averageScore}%` : '0%'}
                                                </p>
                                                <p className="text-sm text-gray-500">{stream.examCount} exams</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ChartPieIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No stream data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Students */}
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        {/* Top Performing Students */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center mb-4">
                                <TrophyIcon className="w-5 h-5 text-yellow-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
                            </div>
                            {analytics.topStudents.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.topStudents.map((student, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-gray-800">{student.student.studentName}</p>
                                                    <p className="text-sm text-gray-500">{student.totalExams} exams</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-800">
                                                    {student.averageScore && !isNaN(student.averageScore) ? `${student.averageScore}%` : '0%'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Best: {student.bestScore && !isNaN(student.bestScore) ? `${student.bestScore}%` : '0%'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No student data available</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Performance Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 mb-8">
                        <div className="flex items-center mb-4">
                            <SparklesIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">Performance Insights</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.highestScore && !isNaN(stats.highestScore) ? `${stats.highestScore}%` : '0%'}
                                </p>
                                <p className="text-sm text-gray-600">Highest Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.passRate && !isNaN(stats.passRate) ? `${stats.passRate}%` : '0%'}
                                </p>
                                <p className="text-sm text-gray-600">Pass Rate</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    {analytics.recentActivity?.recentSubmissions || 0}
                                </p>
                                <p className="text-sm text-gray-600">Recent Submissions</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}