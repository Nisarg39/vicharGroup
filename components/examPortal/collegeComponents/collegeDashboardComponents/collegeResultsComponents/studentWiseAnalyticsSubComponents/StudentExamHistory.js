"use client"

import { memo, useState, useEffect } from 'react'
import { getStudentExamHistory } from '../../../../../../server_actions/actions/examController/collegeActions'
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    AlertCircle,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

const StudentExamHistory = memo(({ student }) => {
    const [examHistory, setExamHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        limit: 5,
        hasNext: false,
        hasPrev: false
    })

    useEffect(() => {
        if (student?.studentId || student?.id || student?._id) {
            fetchExamHistory()
        }
    }, [student?.studentId, student?.id, student?._id])

    // Debounce search query and reset to page 1
    useEffect(() => {
        const timer = setTimeout(() => {
            if (student?.studentId || student?.id || student?._id) {
                setPagination(prev => ({ ...prev, currentPage: 1 }))
                fetchExamHistory(searchQuery, 1)
            }
        }, 300)
        
        return () => clearTimeout(timer)
    }, [searchQuery, student?.studentId, student?.id, student?._id])
    
    // Handle pagination changes
    useEffect(() => {
        if (student?.studentId || student?.id || student?._id) {
            fetchExamHistory(searchQuery, pagination.currentPage)
        }
    }, [pagination.currentPage])

    const fetchExamHistory = async (searchTerm = '', page = 1) => {
        try {
            // Use different loading states based on whether it's search or initial load
            if (searchTerm.trim() !== '') {
                setSearchLoading(true)
            } else {
                setLoading(true)
            }
            setError(null)
            
            // Debug: Log student object structure
            console.log('Student object:', student)
            
            const token = localStorage.getItem('isCollege')
            if (!token) {
                setError('Authentication token not found')
                return
            }

            // Try different possible ID fields
            const studentId = student.studentId || student.id || student._id
            console.log('Using studentId:', studentId)
            console.log('Available student fields:', Object.keys(student))
            console.log('Search term:', searchTerm)
            
            if (!studentId) {
                setError('Student ID not found')
                return
            }
            
            const result = await getStudentExamHistory({ token }, studentId, searchTerm, page, pagination.limit)
            
            if (result.success) {
                setExamHistory(result.data)
                if (result.pagination) {
                    setPagination(result.pagination)
                }
            } else {
                setError(result.message || 'Failed to fetch exam history')
            }
        } catch (err) {
            console.error('Error fetching exam history:', err)
            setError('An error occurred while fetching exam history')
        } finally {
            setLoading(false)
            setSearchLoading(false)
        }
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }))
        }
    }
    if (!student) {
        return (
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 text-sm text-center">
                    No student data available.
                </p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <p className="text-gray-700 text-sm">Loading exam history...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search exams by name..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {searchLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                )}
            </div>

            {/* Results or Empty State */}
            {examHistory.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 text-sm text-center">
                        {searchQuery.trim() 
                            ? `No exams found matching "${searchQuery.trim()}"` 
                            : "No exam history available for this student."
                        }
                    </p>
                </div>
            ) : (
                <div className="text-sm text-gray-600 mb-2">
                    {searchQuery.trim() 
                        ? `Found ${pagination.totalResults} exam${pagination.totalResults === 1 ? '' : 's'} matching "${searchQuery.trim()}" (showing ${examHistory.length} of ${pagination.totalResults})` 
                        : `Showing ${examHistory.length} of ${pagination.totalResults} exam${pagination.totalResults === 1 ? '' : 's'}`
                    }
                </div>
            )}

            {/* Exam History List */}
            {examHistory.length > 0 && examHistory.map((exam, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{exam.examName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{exam.date} at {exam.time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{exam.duration}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                exam.status === 'passed' ? 'bg-green-100 text-green-700' :
                                exam.status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {exam.status === 'passed' ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
                                 exam.status === 'failed' ? <XCircle className="w-3 h-3 inline mr-1" /> : null}
                                {exam.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center bg-blue-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-blue-900">{exam.score}%</div>
                            <div className="text-xs text-blue-600">Score</div>
                        </div>

                        <div className="text-center bg-purple-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-purple-900">{exam.marksScored}/{exam.totalMarks}</div>
                            <div className="text-xs text-purple-600">Marks Obtained</div>
                        </div>

                        <div className="text-center bg-green-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-green-900">{exam.correct}</div>
                            <div className="text-xs text-green-600">Correct</div>
                        </div>

                        <div className="text-center bg-red-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-red-900">{exam.incorrect}</div>
                            <div className="text-xs text-red-600">Incorrect</div>
                        </div>
                    </div>

                    {exam.subjects && exam.subjects.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-600 mb-2">Subject Performance:</div>
                            <div className="flex flex-wrap gap-2">
                                {exam.subjects.map((subject, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                        {subject.name}: {subject.marks}/{subject.totalMarks}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Pagination */}
            {examHistory.length > 0 && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                        <span className="ml-2 text-gray-400">
                            ({pagination.totalResults} total result{pagination.totalResults === 1 ? '' : 's'})
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev || loading || searchLoading}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum
                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (pagination.currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i
                                } else {
                                    pageNum = pagination.currentPage - 2 + i
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={loading || searchLoading}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            pagination.currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>
                        
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext || loading || searchLoading}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
})

StudentExamHistory.displayName = 'StudentExamHistory'

export default StudentExamHistory