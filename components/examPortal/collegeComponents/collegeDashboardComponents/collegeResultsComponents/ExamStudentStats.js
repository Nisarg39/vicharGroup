"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
    ArrowLeft, 
    Users, 
    Clock,
    Target,
    TrendingUp,
    Calendar,
    BookOpen,
    Award,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
    BarChart3,
    PieChart,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    Crown,
    Medal,
    Trophy,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    User,
    Hash,
    Percent,
    Timer,
    X,
    RefreshCw,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { getExamStudentStats } from '../../../../../server_actions/actions/examController/collegeActions'
import DetailedPerformanceAnalysis from './DetailedPerformanceAnalysis'

const ExamStudentStats = ({ examId, onBack }) => {
    const [performanceData, setPerformanceData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [paginationLoading, setPaginationLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [refreshLoading, setRefreshLoading] = useState(false)
    const studentsPerPage = 10

    const fetchPerformanceData = useCallback(async (page = 1, isPagination = false, search = '', filter = 'all', isRefresh = false) => {
        try {
            if (isPagination) {
                setPaginationLoading(true)
            } else if (isRefresh) {
                setRefreshLoading(true)
            } else {
                setLoading(true)
            }
            setError(null)
            const token = localStorage.getItem('isCollege')
            if (!token) {
                setError('Authentication required')
                return
            }
            const response = await getExamStudentStats({ token }, examId, page, studentsPerPage, search, filter)
            if (response.success) {
                setPerformanceData(response.data)
            } else {
                setError(response.message || 'Failed to load performance data')
            }
        } catch (err) {
            setError('Failed to load performance data')
            console.error('Performance data error:', err)
        } finally {
            setLoading(false)
            setPaginationLoading(false)
            setRefreshLoading(false)
        }
    }, [examId, studentsPerPage])

    // Debounce search term with 800ms delay (instant for empty search)
    useEffect(() => {
        // If search is cleared, apply immediately
        if (searchTerm === '') {
            setDebouncedSearchTerm('')
            setSearchLoading(false)
            return
        }

        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 800)

        // Show search loading indicator when user is typing
        if (searchTerm !== debouncedSearchTerm && searchTerm.length > 0) {
            setSearchLoading(true)
        }

        return () => clearTimeout(timer)
    }, [searchTerm, debouncedSearchTerm])

    // Fetch data when debounced search term or status filter changes
    useEffect(() => {
        const search = debouncedSearchTerm
        const filter = statusFilter
        
        // Reset to page 1 when search/filter changes
        if (search || filter !== 'all') {
            setCurrentPage(1)
            fetchPerformanceData(1, false, search, filter)
        } else {
            fetchPerformanceData(currentPage, false, search, filter)
        }
        
        setSearchLoading(false)
    }, [fetchPerformanceData, debouncedSearchTerm, statusFilter])

    // Fetch data when page changes (but not when search/filter changes)
    useEffect(() => {
        if (currentPage > 1) {
            fetchPerformanceData(currentPage, false, debouncedSearchTerm, statusFilter)
        }
    }, [fetchPerformanceData, currentPage])

    const handleRefresh = () => {
        fetchPerformanceData(currentPage, false, debouncedSearchTerm, statusFilter, true)
    }

    const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
        const colorClasses = {
            blue: "bg-blue-50 text-blue-600 border-blue-200",
            green: "bg-green-50 text-green-600 border-green-200",
            yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
            red: "bg-red-50 text-red-600 border-red-200",
            purple: "bg-purple-50 text-purple-600 border-purple-200"
        }

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-600 truncate">{title}</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{subtitle}</p>
                        )}
                    </div>
                    <div className={`p-2 rounded-lg border ${colorClasses[color]} ml-2 flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
            </div>
        )
    }

    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex justify-between flex-1 sm:hidden">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{currentPage}</span> of{' '}
                            <span className="font-medium">{totalPages}</span>
                            {' '}({(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, performanceData?.pagination?.totalStudents || 0)} of {performanceData?.pagination?.totalStudents || 0} students)
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading exam statistics...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">Error Loading Data</h3>
                    <p className="mt-1 text-gray-600">{error}</p>
                    <button
                        onClick={fetchPerformanceData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    const stats = performanceData?.stats || {}
    const students = performanceData?.students || []
    const examInfo = performanceData?.examInfo || {}
    const pagination = performanceData?.pagination || {}

    if (showDetailedAnalysis && selectedStudent) {
        return (
            <DetailedPerformanceAnalysis
                examId={examId}
                examData={examInfo}
                student={selectedStudent}
                onBack={() => {
                    setShowDetailedAnalysis(false)
                    setSelectedStudent(null)
                }}
            />
        )
    }

    const handleStudentClick = (student) => {
        if (student.status === 'completed') {
            setSelectedStudent(student)
            setShowDetailedAnalysis(true)
        }
    }

    const downloadExcelReport = () => {
        if (!performanceData?.excelData) {
            alert('No data available for export')
            return
        }

        const { excelData } = performanceData
        const { examInfo, studentsData } = excelData
        const workbook = XLSX.utils.book_new()

        // Create stream header row with exam name and date
        const examDate = new Date(examInfo.examDate).toLocaleDateString()
        const streamHeader = [`${examInfo.stream} - ${examInfo.examName} - ${examDate}`]
        
        // Create main headers row
        const mainHeaders = ['S.N', 'Student Name', 'Std']
        
        // Add subject headers with their sub-columns
        examInfo.subjects.forEach(subject => {
            mainHeaders.push(subject, '', '') // Subject name spans 3 columns
        })
        mainHeaders.push('Total', 'Percentage', 'Rank')

        // Create sub-headers row for subject columns
        const subHeaders = ['', '', ''] // Empty cells for basic info columns
        
        // Add sub-headers for each subject
        examInfo.subjects.forEach(() => {
            subHeaders.push('Correct Que', 'Wrong Que', 'Total Marks')
        })
        subHeaders.push('', '', '') // Empty for Total, Percentage, Rank

        // Create student data rows
        const studentRows = studentsData.map(student => {
            const row = [
                student.sNo,
                student.studentName,
                student.std
            ]

            // Add subject-wise data
            examInfo.subjects.forEach(subject => {
                row.push(student[`${subject}_correct`] || 0)
                row.push(student[`${subject}_wrong`] || 0)
                row.push(student[`${subject}_totalMarks`] || 0)
            })

            // Add totals
            row.push(student.total)
            row.push(student.percentage)
            row.push(student.rank)

            return row
        })

        // Combine all data
        const worksheetData = [
            streamHeader,
            mainHeaders,
            subHeaders,
            ...studentRows
        ]

        // Create worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

        // Set column widths
        const colWidths = [
            { wch: 6 },   // S.N
            { wch: 25 },  // Student Name
            { wch: 6 }    // Std
        ]

        // Add widths for subject columns (3 columns per subject)
        examInfo.subjects.forEach(() => {
            colWidths.push({ wch: 12 }) // Correct Que
            colWidths.push({ wch: 12 }) // Wrong Que
            colWidths.push({ wch: 12 }) // Total Marks
        })

        // Add widths for total columns
        colWidths.push({ wch: 10 }) // Total
        colWidths.push({ wch: 12 })  // Percentage
        colWidths.push({ wch: 8 })  // Rank

        worksheet['!cols'] = colWidths

        // Merge cells for stream header
        if (examInfo.subjects.length > 0) {
            const lastCol = 2 + (examInfo.subjects.length * 3) + 3 // 3 basic + (subjects * 3) + 3 totals
            worksheet['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol - 1 } } // Merge stream header across all columns
            ]

            // Merge subject headers across their 3 sub-columns
            examInfo.subjects.forEach((_, index) => {
                const startCol = 3 + (index * 3)
                worksheet['!merges'].push({
                    s: { r: 1, c: startCol },
                    e: { r: 1, c: startCol + 2 }
                })
            })
        }

        // Style headers with basic formatting (no colors)
        const range = XLSX.utils.decode_range(worksheet['!ref'])
        
        // Style stream header
        const streamCell = worksheet['A1']
        if (streamCell) {
            streamCell.s = {
                font: { bold: true, size: 14 },
                alignment: { horizontal: "center", vertical: "center" }
            }
        }

        // Style all header cells
        for (let col = 0; col <= range.e.c; col++) {
            // Main headers (row 1)
            const mainHeaderCell = worksheet[XLSX.utils.encode_cell({ r: 1, c: col })]
            if (mainHeaderCell) {
                mainHeaderCell.s = {
                    font: { bold: true },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" }
                    }
                }
            }

            // Sub-headers (row 2)
            const subHeaderCell = worksheet[XLSX.utils.encode_cell({ r: 2, c: col })]
            if (subHeaderCell) {
                subHeaderCell.s = {
                    font: { bold: true },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" }
                    }
                }
            }
        }

        // Add borders to all data cells
        for (let row = 3; row <= range.e.r; row++) {
            for (let col = 0; col <= range.e.c; col++) {
                const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })]
                if (cell) {
                    cell.s = {
                        border: {
                            top: { style: "thin" },
                            bottom: { style: "thin" },
                            left: { style: "thin" },
                            right: { style: "thin" }
                        },
                        alignment: { horizontal: "center", vertical: "center" }
                    }
                }
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, examInfo.stream)

        // Generate filename
        const examName = examInfo.examName.replace(/[^a-zA-Z0-9]/g, '_')
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = `${examName}_${examInfo.stream}_Results_${timestamp}.xlsx`

        // Download the file
        XLSX.writeFile(workbook, filename)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Exam Performance Statistics</h1>
                                <p className="text-gray-600 mt-1">{examInfo.examName || 'Exam Analysis'}</p>
                            </div>
                        </div>
                        <button
                            onClick={downloadExcelReport}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Excel Report
                        </button>
                    </div>
                </div>

                {/* Statistics Cards - Compact Layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    <StatCard
                        icon={Users}
                        title="Total Registered"
                        value={stats.totalRegistered || 0}
                        subtitle="Enrolled students"
                        color="blue"
                    />
                    <StatCard
                        icon={CheckCircle}
                        title="Completed"
                        value={stats.totalCompleted || 0}
                        subtitle={`${Math.round(((stats.totalCompleted || 0) / (stats.totalRegistered || 1)) * 100)}% completion rate`}
                        color="green"
                    />
                    <StatCard
                        icon={Target}
                        title="Average Score"
                        value={`${Math.round(stats.averageScore || 0)}`}
                        subtitle={`Out of ${examInfo.totalMarks || 0} marks`}
                        color="purple"
                    />
                    <StatCard
                        icon={Clock}
                        title="Avg Time"
                        value={`${Math.round(stats.averageTimeSpent || 0)} min`}
                        subtitle={`Duration: ${examInfo.duration || 0} min`}
                        color="yellow"
                    />
                    <StatCard
                        icon={Award}
                        title="Highest Score"
                        value={`${stats.highestScore || 0}`}
                        subtitle="Best performance"
                        color="green"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Pass Rate"
                        value={`${Math.round(stats.passRate || 0)}%`}
                        subtitle="Students above passing grade"
                        color="blue"
                    />
                    <StatCard
                        icon={XCircle}
                        title="Not Attempted"
                        value={(stats.totalRegistered || 0) - (stats.totalAttempted || 0)}
                        subtitle="Yet to attempt"
                        color="red"
                    />
                </div>

                {/* Student Results Table */}
                <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Users className="h-6 w-6 mr-2 text-blue-600" />
                                    Student Results
                                </h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-sm text-gray-600">Click on completed students for detailed analysis</p>
                                    {(debouncedSearchTerm || statusFilter !== 'all') && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-blue-600">•</span>
                                            <span className="text-xs text-blue-600 font-medium">
                                                {debouncedSearchTerm && `Search: "${debouncedSearchTerm}"`}
                                                {debouncedSearchTerm && statusFilter !== 'all' && ' | '}
                                                {statusFilter !== 'all' && `Filter: ${statusFilter}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    {searchLoading && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`pl-10 ${searchLoading ? 'pr-10' : 'pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64`}
                                    />
                                </div>
                                
                                {/* Status Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    >
                                        <option value="all">All Students</option>
                                        <option value="completed">Completed</option>
                                        <option value="registered">Registered</option>
                                    </select>
                                </div>
                                
                                {/* Refresh Button */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshLoading}
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Refresh exam data"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-1 ${refreshLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>

                                {/* Clear Filters */}
                                {(searchTerm || statusFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('')
                                            setStatusFilter('all')
                                            setCurrentPage(1)
                                        }}
                                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Hash className="h-4 w-4" />
                                            <span>Rank</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4" />
                                            <span>Student</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Target className="h-4 w-4" />
                                            <span>Score</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Percent className="h-4 w-4" />
                                            <span>Percentage</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Status</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Timer className="h-4 w-4" />
                                            <span>Time Spent</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4" />
                                            <span>Submitted At</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Search className="h-12 w-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                                                <p className="text-gray-500 mb-4">
                                                    {debouncedSearchTerm || statusFilter !== 'all' 
                                                        ? 'Try adjusting your search or filter criteria.'
                                                        : 'No students have been enrolled for this exam yet.'
                                                    }
                                                </p>
                                                {(debouncedSearchTerm || statusFilter !== 'all') && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('')
                                                            setStatusFilter('all')
                                                            setCurrentPage(1)
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Clear filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student, index) => (
                                    <tr 
                                        key={student.id || index} 
                                        className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm ${
                                            student.status === 'completed' 
                                                ? 'cursor-pointer hover:scale-[1.01] transform' 
                                                : ''
                                        }`}
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                {student.rank ? (
                                                    <div className="flex items-center">
                                                        {student.rank === 1 && (
                                                            <div className="flex items-center justify-center w-10 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg shadow-sm">
                                                                <Crown className="h-4 w-4" />
                                                                <span className="ml-1 text-xs font-bold">1</span>
                                                            </div>
                                                        )}
                                                        {student.rank === 2 && (
                                                            <div className="flex items-center justify-center w-10 h-8 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg shadow-sm">
                                                                <Trophy className="h-4 w-4" />
                                                                <span className="ml-1 text-xs font-bold">2</span>
                                                            </div>
                                                        )}
                                                        {student.rank === 3 && (
                                                            <div className="flex items-center justify-center w-10 h-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg shadow-sm">
                                                                <Medal className="h-4 w-4" />
                                                                <span className="ml-1 text-xs font-bold">3</span>
                                                            </div>
                                                        )}
                                                        {student.rank > 3 && (
                                                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-lg border">
                                                                <span className="text-sm font-semibold">#{student.rank}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="relative">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                        <span className="text-lg font-bold text-white">
                                                            {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                                        </span>
                                                    </div>
                                                    {student.status === 'completed' && (
                                                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                            <CheckCircle className="h-2.5 w-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {student.name || 'Unknown Student'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {student.status === 'completed' ? (
                                                    <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                                                        student.score >= (examInfo.totalMarks * 0.8) 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' :
                                                        student.score >= (examInfo.totalMarks * 0.6) 
                                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                        {student.score || 0}/{examInfo.totalMarks || 0}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {student.status === 'completed' && student.percentage !== null ? (
                                                    <div className={`px-3 py-1.5 rounded-full font-bold text-sm ${
                                                        student.percentage >= 80 
                                                            ? 'bg-green-100 text-green-800' :
                                                        student.percentage >= 60 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {student.percentage.toFixed(1)}%
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                student.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {student.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                {student.status === 'registered' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                {student.status === 'completed' ? 'Completed' : 'Registered'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.timeSpent ? `${Math.round(student.timeSpent)} min` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.submittedAt 
                                                ? new Date(student.submittedAt).toLocaleString()
                                                : '-'
                                            }
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {pagination.totalPages > 1 && (
                        <div className={`${paginationLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={(newPage) => {
                                    setCurrentPage(newPage)
                                    fetchPerformanceData(newPage, true, debouncedSearchTerm, statusFilter)
                                }}
                            />
                        </div>
                    )}
                    
                    {/* Loading overlay for pagination */}
                    {paginationLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-b-xl">
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                <span className="text-sm text-gray-600">Loading students...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ExamStudentStats
