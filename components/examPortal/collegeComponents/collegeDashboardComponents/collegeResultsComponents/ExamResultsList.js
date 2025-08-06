"use client"

import { useState, useEffect } from 'react'
import { 
    ArrowLeft, 
    Search, 
    Calendar,
    Users,
    Clock,
    BookOpen,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
    ChevronRight as ArrowRight
} from 'lucide-react'
import { getCollegeExamsForResults } from '../../../../../server_actions/actions/examController/collegeActions'

export default function ExamResultsList({ onNavigate, onBack }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStream, setSelectedStream] = useState('')
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedAvailability, setSelectedAvailability] = useState('')
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })
    const [availableStreams, setAvailableStreams] = useState([])
    const [availableClasses, setAvailableClasses] = useState([])

    useEffect(() => {
        fetchExams()
    }, [pagination.page])

    useEffect(() => {
        fetchFilterOptions()
    }, [])

    useEffect(() => {
        // Reset to page 1 when search query or filters change
        if (pagination.page !== 1) {
            setPagination(prev => ({ ...prev, page: 1 }))
        } else {
            fetchExams()
        }
    }, [searchQuery, selectedStream, selectedClass, selectedAvailability])

    const fetchExams = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('isCollege')
            
            if (token) {
                const result = await getCollegeExamsForResults(
                    { token }, 
                    pagination.page, 
                    pagination.limit, 
                    searchQuery,
                    selectedStream,
                    selectedClass,
                    selectedAvailability
                )
                if (result.success) {
                    setExams(result.data.exams)
                    setPagination(result.data.pagination)
                }
            }
        } catch (error) {
            console.error('Error fetching exams:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('isCollege')
            if (token) {
                // Fetch all exams to get unique filter options
                const result = await getCollegeExamsForResults({ token }, 1, 1000, '')
                if (result.success) {
                    const streams = [...new Set(result.data.exams.map(exam => exam.stream).filter(Boolean))]
                    const classes = [...new Set(result.data.exams.map(exam => exam.standard).filter(Boolean))]
                    setAvailableStreams(streams)
                    setAvailableClasses(classes)
                }
            }
        } catch (error) {
            console.error('Error fetching filter options:', error)
        }
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
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
                            <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
                            <p className="text-gray-600">Browse and analyze results by examination</p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <div className="flex-1 relative max-w-md">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search exams..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Filters */}
                        <div className="flex gap-3 items-center">
                            <Filter className="w-5 h-5 text-gray-400" />
                            
                            {/* Stream Filter */}
                            <select
                                value={selectedStream}
                                onChange={(e) => setSelectedStream(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                                <option value="">All Streams</option>
                                {availableStreams.map(stream => (
                                    <option key={stream} value={stream}>{stream}</option>
                                ))}
                            </select>
                            
                            {/* Class Filter */}
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                                <option value="">All Classes</option>
                                {availableClasses.map(className => (
                                    <option key={className} value={className}>{className}</option>
                                ))}
                            </select>
                            
                            {/* Availability Filter */}
                            <select
                                value={selectedAvailability}
                                onChange={(e) => setSelectedAvailability(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                                <option value="">All Types</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="practice">Practice</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                                <p className="text-xl font-bold text-blue-600">{pagination.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                                <p className="text-xl font-bold text-green-600">
                                    {exams.reduce((sum, exam) => sum + exam.totalAttempts, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exams Table */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading exams...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Exam Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Date Created
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Attempts
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {exams.map((exam) => (
                                        <tr 
                                            key={exam._id}
                                            onClick={() => onNavigate('examStudentStats', { examId: exam._id, examData: exam })}
                                            className="hover:bg-blue-50/40 transition-colors duration-150 cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold text-gray-900">{exam.examName}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm text-gray-600">{exam.examSubject.join(', ')}</span>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{exam.stream} - {exam.standard}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(exam.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {exam.startTime && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs text-gray-600">
                                                            Scheduled: {new Date(exam.startTime).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div>Duration: {exam.duration} min</div>
                                                    <div>Questions: {exam.totalQuestions}</div>
                                                    <div>Total Marks: {exam.totalMarks}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-lg font-bold text-blue-600">{exam.totalAttempts}</div>
                                                <div className="text-xs text-gray-600">
                                                    Exam attempts
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-blue-600 font-medium">View Stats</span>
                                                    <ArrowRight className="w-4 h-4 text-blue-600" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} exams
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* No results message */}
                {!loading && exams.length === 0 && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-8 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                        <p className="text-gray-600">
                            {searchQuery ? `No exams match your search "${searchQuery}"` : "No exams have been created yet"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}