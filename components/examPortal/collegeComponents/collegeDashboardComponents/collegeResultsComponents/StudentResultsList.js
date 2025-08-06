"use client"

import { useState, useEffect } from 'react'
import { 
    ArrowLeft, 
    Search, 
    Eye, 
    Download, 
    Trophy,
    TrendingUp,
    TrendingDown,
    User,
    BookOpen,
    Clock,
    Target,
    Award,
    BarChart3,
    Loader2
} from 'lucide-react'
import { getCollegeStudentResults } from '../../../../../server_actions/actions/examController/collegeActions'

export default function StudentResultsList({ onNavigate, onBack }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('averageScore')
    const [sortOrder, setSortOrder] = useState('desc')
    const [filterClass, setFilterClass] = useState('all')
    const [filterStream, setFilterStream] = useState('all')
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState({})
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })
    const [availableClasses, setAvailableClasses] = useState([])
    const [availableStreams, setAvailableStreams] = useState([])

    useEffect(() => {
        fetchStudentResults()
    }, [pagination.page, sortBy, sortOrder])

    useEffect(() => {
        // Reset to page 1 when filters change
        if (pagination.page !== 1) {
            setPagination(prev => ({ ...prev, page: 1 }))
        } else {
            fetchStudentResults()
        }
    }, [searchQuery, filterClass, filterStream])

    const fetchStudentResults = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('isCollege')
            
            if (token) {
                const filters = {
                    search: searchQuery,
                    class: filterClass !== 'all' ? filterClass : undefined,
                    stream: filterStream !== 'all' ? filterStream : undefined,
                    sortBy: sortBy,
                    sortOrder: sortOrder
                }
                
                const result = await getCollegeStudentResults(
                    { token }, 
                    pagination.page, 
                    pagination.limit, 
                    filters
                )
                
                if (result.success) {
                    setStudents(result.data.students)
                    setPagination(result.data.pagination)
                    setSummary(result.data.summary)
                    
                    // Extract unique classes and streams for filters
                    const classes = [...new Set(result.data.students.map(s => s.class).filter(Boolean))]
                    const streams = [...new Set(result.data.students.map(s => s.stream).filter(Boolean))]
                    setAvailableClasses(classes)
                    setAvailableStreams(streams)
                } else {
                    console.error('Failed to fetch student results:', result.message)
                    setStudents([])
                    setSummary({})
                }
            }
        } catch (error) {
            console.error('Error fetching student results:', error)
            setStudents([])
            setSummary({})
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <span className="text-gray-400">↕</span>
        return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>
    }

    const getPerformanceBadge = (performance) => {
        switch (performance) {
            case 'excellent':
                return 'bg-green-100 text-green-800'
            case 'good':
                return 'bg-blue-100 text-blue-800'
            case 'average':
                return 'bg-yellow-100 text-yellow-800'
            case 'below_average':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
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
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
                            <p className="text-gray-600">Browse and analyze results by student performance</p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select 
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                        <select 
                            value={filterStream}
                            onChange={(e) => setFilterStream(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Streams</option>
                            {streams.map(stream => (
                                <option key={stream} value={stream}>{stream}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span className="text-sm text-blue-600">Loading...</span>
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-blue-600">{summary.totalStudents || 0}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <Trophy className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                        <span className="text-sm text-green-600">Loading...</span>
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-green-600">
                                        {summary.averageScore ? `${summary.averageScore.toFixed(1)}%` : '0%'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                        <span className="text-sm text-purple-600">Loading...</span>
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-purple-600">
                                        {summary.totalExamsCreated || 0}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <Target className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Pass Rate</p>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                                        <span className="text-sm text-orange-600">Loading...</span>
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-orange-600">
                                        {summary.averagePassRate ? `${summary.averagePassRate.toFixed(1)}%` : '0%'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
                                <tr>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors duration-150"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Student
                                            <SortIcon field="name" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Class & Stream
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors duration-150"
                                        onClick={() => handleSort('totalExams')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Exams
                                            <SortIcon field="totalExams" />
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors duration-150"
                                        onClick={() => handleSort('averageScore')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Avg Score
                                            <SortIcon field="averageScore" />
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors duration-150"
                                        onClick={() => handleSort('passRate')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Pass Rate
                                            <SortIcon field="passRate" />
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors duration-150"
                                        onClick={() => handleSort('lastExam')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Last Exam
                                            <SortIcon field="lastExam" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                                <span className="ml-2 text-gray-600">Loading students...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                                                <p className="text-gray-600">
                                                    {searchQuery ? `No students match your search "${searchQuery}"` : "No students enrolled yet"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : students.map((student) => (
                                    <tr 
                                        key={student.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full">
                                                    <span className="text-white font-semibold text-sm">
                                                        {student.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{student.name}</div>
                                                    <div className="text-sm text-gray-600">{student.rollNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">
                                                    {student.class}
                                                </span>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit">
                                                    {student.stream}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <span className="font-semibold">{student.attemptedExams}</span>
                                                <span className="text-gray-600">/{student.totalExams}</span>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {((student.attemptedExams / student.totalExams) * 100).toFixed(0)}% attendance
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-bold text-gray-900">{student.averageScore}%</div>
                                                {student.averageScore >= 90 ? (
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                ) : student.averageScore >= 75 ? (
                                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-orange-600" />
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {student.lowestScore}% - {student.highestScore}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-bold text-green-600">{student.passRate}%</div>
                                                {student.passRate === 100 && (
                                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPerformanceBadge(student.performance)}`}>
                                                {student.performance}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {new Date(student.lastExamDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Score: {student.lastExamScore}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => onNavigate('studentDetails', { studentId: student.id })}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => onNavigate('studentAnalytics', { studentId: student.id })}
                                                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                                                    title="View Analytics"
                                                >
                                                    <BarChart3 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                                    title="Export Results"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Results Count */}
                {!loading && (
                    <div className="text-center text-gray-600">
                        Showing {students.length} of {pagination.total} students
                    </div>
                )}
            </div>
        </div>
    )
}