"use client"

import { useState, useEffect } from 'react'
import { 
    BarChart3, 
    Users, 
    BookOpen,
    Clock,
    Eye,
    Loader2,
    UserCheck
} from 'lucide-react'
import { getCollegeDashboardSummary } from '../../../../../server_actions/actions/examController/collegeActions'

export default function ResultsOverview({ onNavigate }) {
    const [overviewStats, setOverviewStats] = useState({
        totalStudents: 0,
        totalExams: 0,
        totalExamAttempts: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('isCollege')
            
            if (token) {
                const result = await getCollegeDashboardSummary({ token })
                if (result.success) {
                    setOverviewStats(result.summary)
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }




    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Results Overview</h1>
                            <p className="text-gray-600 mt-1">Complete examination results and analytics dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Eligible Students</p>
                                {loading ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                        <span className="text-xl font-bold text-blue-600">Loading...</span>
                                    </div>
                                ) : (
                                    <p className="text-3xl font-bold text-blue-600">{overviewStats.totalStudents.toLocaleString()}</p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    Students eligible for active exams
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-2xl">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                                {loading ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                                        <span className="text-xl font-bold text-green-600">Loading...</span>
                                    </div>
                                ) : (
                                    <p className="text-3xl font-bold text-green-600">{overviewStats.totalExams}</p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    Created by college
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-2xl">
                                <BookOpen className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                                {loading ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                        <span className="text-xl font-bold text-purple-600">Loading...</span>
                                    </div>
                                ) : (
                                    <p className="text-3xl font-bold text-purple-600">{overviewStats.totalExamAttempts.toLocaleString()}</p>
                                )}
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Clock className="w-4 h-4" />
                                    Exam submissions
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-2xl">
                                <BarChart3 className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                        onClick={() => onNavigate('exams')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">View by Exams</h3>
                                <p className="text-gray-600 mb-4">Analyze performance by individual examinations</p>
                                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                                    <Eye className="w-5 h-5" />
                                    Explore Exam Results
                                </div>
                            </div>
                            <div className="p-4 bg-blue-100 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                                <BarChart3 className="w-10 h-10 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div 
                        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                        onClick={() => onNavigate('studentAnalytics')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Student Analytics</h3>
                                <p className="text-gray-600 mb-4">View detailed analytics for individual student performance</p>
                                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                                    <UserCheck className="w-5 h-5" />
                                    View Student Analytics
                                </div>
                            </div>
                            <div className="p-4 bg-indigo-100 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                                <Users className="w-10 h-10 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}