"use client"

import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import {
    Search,
    Users,
    BookOpen,
    TrendingUp,
    TrendingDown,
    Target,
    Loader2,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    User,
    Medal,
    XCircle
} from 'lucide-react'
import { getCollegeStudentResults } from '../../../../../server_actions/actions/examController/collegeActions'
import StudentWiseDetailedInfo from './studentWiseAnalyticsSubComponents/StudentWiseDetailedInfo'

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

export default function StudentWiseAnalytics({ onBack }) {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filters, setFilters] = useState({
        class: '',
        stream: '',
        performance: '',
        sortBy: 'name',
        sortOrder: 'asc'
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalStudents, setTotalStudents] = useState(0)
    const [actualTotalStudents, setActualTotalStudents] = useState(0)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [viewMode, setViewMode] = useState('list') // 'list' or 'detail'
    const [summary, setSummary] = useState({})
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const pageSize = 10

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch, filters])

    // Fetch students data
    const fetchStudents = useCallback(async () => {
        try {
            // Use different loading states for initial load vs subsequent operations
            if (isInitialLoad) {
                setLoading(true)
            } else {
                setSearchLoading(true)
            }
            
            const token = localStorage.getItem('isCollege')
            
            if (!token) {
                console.error('No college token found')
                return
            }

            // Separate backend filters from frontend-only filters
            const backendFilters = {
                search: debouncedSearch,
                class: filters.class,
                stream: filters.stream
                // Note: only performance filter will be applied client-side
            }

            // Fetch more data when using client-side filters to account for filtering
            const fetchLimit = filters.performance ? 100 : pageSize
            const fetchPage = filters.performance ? 1 : currentPage

            const result = await getCollegeStudentResults(
                { token }, 
                fetchPage, 
                fetchLimit, 
                backendFilters
            )

            if (result.success) {
                let filteredStudents = result.data.students || []
                
                // Apply client-side performance filter
                if (filters.performance) {
                    filteredStudents = filteredStudents.filter(student => 
                        student.performance === filters.performance
                    )
                }
                
                // Apply client-side sorting
                if (filters.sortBy) {
                    filteredStudents.sort((a, b) => {
                        let compareValue = 0
                        
                        switch (filters.sortBy) {
                            case 'name':
                                compareValue = (a.name || '').localeCompare(b.name || '')
                                break
                            case 'score':
                                compareValue = (b.averageScore || 0) - (a.averageScore || 0)
                                break
                            case 'performance':
                                const perfOrder = { excellent: 5, good: 4, average: 3, below_average: 2, poor: 1 }
                                compareValue = (perfOrder[b.performance] || 0) - (perfOrder[a.performance] || 0)
                                break
                            default:
                                compareValue = 0
                        }
                        
                        return filters.sortOrder === 'desc' ? -compareValue : compareValue
                    })
                }
                
                // Apply client-side pagination only for performance filtering
                let paginatedStudents
                let totalFilteredStudents
                let totalFilteredPages
                
                if (filters.performance) {
                    // Performance filtering is done client-side, so we need client-side pagination
                    const startIndex = (currentPage - 1) * pageSize
                    const endIndex = startIndex + pageSize
                    paginatedStudents = filteredStudents.slice(startIndex, endIndex)
                    totalFilteredStudents = filteredStudents.length
                    totalFilteredPages = Math.ceil(totalFilteredStudents / pageSize)
                } else {
                    // Backend handles filtering and pagination, use results directly
                    paginatedStudents = filteredStudents
                    totalFilteredStudents = result.data.pagination.total || 0
                    totalFilteredPages = result.data.pagination.totalPages || 1
                }
                
                const backendActualTotal = result.data.pagination.actualTotal || result.data.pagination.total || 0
                
                setStudents(paginatedStudents)
                setTotalPages(totalFilteredPages)
                setTotalStudents(totalFilteredStudents)
                setActualTotalStudents(backendActualTotal) // Unfiltered total from backend
                setSummary(result.data.summary || {})
            } else {
                console.error('Failed to fetch students:', result.message)
                setStudents([])
            }
        } catch (error) {
            console.error('Error fetching students:', error)
            setStudents([])
        } finally {
            if (isInitialLoad) {
                setLoading(false)
                setIsInitialLoad(false)
            } else {
                setSearchLoading(false)
            }
        }
    }, [currentPage, debouncedSearch, filters, pageSize, isInitialLoad])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    // Handle student row click
    const handleStudentClick = useCallback((student) => {
        setSelectedStudent(student)
        setViewMode('detail')
    }, [])

    // Handle back to list
    const handleBackToList = useCallback(() => {
        setViewMode('list')
        setSelectedStudent(null)
    }, [])

    // Handle filter changes
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    // Handle pagination
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page)
    }, [])

    // Memoized filter options - using predefined values
    const filterOptions = useMemo(() => {
        // Predefined options to avoid circular dependency with filtered data
        const classes = ['11', '12', '10', '9'] // Add more as needed
        const streams = ['JEE', 'NEET', 'MHT-CET'] // Exam streams only
        return { classes, streams }
    }, [])

    // Show detail view if a student is selected
    if (viewMode === 'detail' && selectedStudent) {
        return <StudentWiseDetailedInfo student={selectedStudent} onBack={handleBackToList} />
    }


    // Show list view
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Results</span>
                        </button>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Users className="w-8 h-8 text-indigo-600" />
                                Student Analytics
                            </h1>
                            <p className="text-gray-600 mt-1">Comprehensive student performance analysis and insights</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            {actualTotalStudents > 0 ? actualTotalStudents : totalStudents} Students
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                {!loading && summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                                    <p className="text-3xl font-bold text-blue-600">{summary.totalStudents || actualTotalStudents || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-2xl">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                                    <p className="text-3xl font-bold text-green-600">{summary.averageScore || 0}%</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-2xl">
                                    <Target className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                                    <p className="text-3xl font-bold text-purple-600">{summary.totalAttempts || 0}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-2xl">
                                    <BarChart3 className="w-8 h-8 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Exams Created</p>
                                    <p className="text-3xl font-bold text-orange-600">{summary.totalExamsCreated || 0}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-2xl">
                                    <BookOpen className="w-8 h-8 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            {searchLoading ? (
                                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            )}
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={filters.class}
                                onChange={(e) => handleFilterChange('class', e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            >
                                <option value="">All Classes</option>
                                {filterOptions.classes.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>

                            <select
                                value={filters.stream}
                                onChange={(e) => handleFilterChange('stream', e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            >
                                <option value="">All Streams</option>
                                {filterOptions.streams.map(stream => (
                                    <option key={stream} value={stream}>{stream}</option>
                                ))}
                            </select>

                            <select
                                value={filters.performance}
                                onChange={(e) => handleFilterChange('performance', e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            >
                                <option value="">All Performance</option>
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="average">Average</option>
                                <option value="below_average">Below Average</option>
                                <option value="poor">Poor</option>
                            </select>

                            <select
                                value={`${filters.sortBy}-${filters.sortOrder}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] = e.target.value.split('-')
                                    handleFilterChange('sortBy', sortBy)
                                    handleFilterChange('sortOrder', sortOrder)
                                }}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            >
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                                <option value="averageScore-desc">Score High-Low</option>
                                <option value="averageScore-asc">Score Low-High</option>
                                <option value="attemptedExams-desc">Attempts High-Low</option>
                                <option value="passRate-desc">Pass Rate High-Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Students List</h2>
                        <p className="text-gray-600 text-sm mt-1">Click on any student to view detailed analytics</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                <span className="text-lg text-gray-600">Loading students...</span>
                            </div>
                        </div>
                    ) : (
                        <div className={`relative ${searchLoading ? 'opacity-60 pointer-events-none' : ''} transition-opacity duration-200`}>
                            {students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <Users className="w-16 h-16 text-gray-300 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Found</h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm || filters.class || filters.stream ? 
                                            'Try adjusting your search criteria or filters' : 
                                            'No students are enrolled in your college yet'}
                                    </p>
                                </div>
                            ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/90">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Stream</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exams</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <tr 
                                                key={student.id} 
                                                className="hover:bg-indigo-50/50 cursor-pointer transition-all duration-200 group"
                                                onClick={() => handleStudentClick(student)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-indigo-100 rounded-xl mr-4 group-hover:bg-indigo-200 transition-all duration-200">
                                                            <User className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                            <div className="text-sm text-gray-500">{student.email}</div>
                                                            <div className="text-xs text-gray-400">{student.class} • {student.allocatedStreams ? student.allocatedStreams.join(', ') : student.stream}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{student.class}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {student.allocatedStreams ? (
                                                            student.allocatedStreams.map((stream, idx) => (
                                                                <span 
                                                                    key={idx}
                                                                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
                                                                >
                                                                    {stream}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            student.stream
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{student.attemptedExams}</div>
                                                    <div className="text-xs text-gray-500">attempts</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium text-gray-900">{student.averageScore}%</span>
                                                        {student.averageScore >= 75 ? (
                                                            <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
                                                        ) : student.averageScore >= 60 ? (
                                                            <Target className="w-4 h-4 text-yellow-500 ml-1" />
                                                        ) : (
                                                            <TrendingDown className="w-4 h-4 text-red-500 ml-1" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">{student.passRate}%</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <PerformanceBadge performance={student.performance} />
                                                        {student.cumulativeSubjectAnalysis && student.cumulativeSubjectAnalysis.length > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                {student.cumulativeSubjectAnalysis.length} subjects analyzed
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 group-hover:bg-indigo-100 px-2 py-1 rounded-lg transition-all duration-200">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {(totalPages > 1 || actualTotalStudents > pageSize) && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/90">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            {filters.performance ?
                                                `Showing ${totalStudents} filtered results of ${actualTotalStudents} students` :
                                                `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, actualTotalStudents)} of ${actualTotalStudents} students`
                                            }
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="flex gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                                currentPage === pageNum
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'border border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}