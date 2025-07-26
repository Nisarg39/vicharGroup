import { useState, useEffect } from 'react'
import { getEnrolledStudents, updateEnrolledStudent } from '../../../../../server_actions/actions/examController/collegeActions'
import { 
    UserGroupIcon,
    AcademicCapIcon,
    BookOpenIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline'
import EditStudentModal from './EditStudentModal'
import { toast } from 'react-hot-toast'

export default function EnrolledStudents({ collegeData }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [studentsPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingStudent, setEditingStudent] = useState(null)

    useEffect(() => {
        const fetchStudents = async () => {
            const response = await getEnrolledStudents(collegeData._id, currentPage, studentsPerPage)
            // console.log(response)
            if (response.success) {
                setStudents(JSON.parse(response.enrolledStudents))
                setPagination(response.pagination)
            }
            setLoading(false)
        }
        fetchStudents()
    }, [currentPage, studentsPerPage])

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const getPageNumbers = () => {
        const totalPages = pagination?.totalPages || 0
        let pages = []
        if (totalPages <= 7) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, '...', totalPages]
            } else if (currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
            } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
            }
        }
        return pages
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    const filteredStudents = students.filter(student => {
        if (!searchQuery) return true
        
        const searchLower = searchQuery.toLowerCase()
        const studentData = student.student
        
        return (
            studentData.name.toLowerCase().includes(searchLower) ||
            studentData.email.toLowerCase().includes(searchLower) ||
            student.class.toLowerCase().includes(searchLower)
        )
    })

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy) {
            case 'name':
                aValue = a.student?.name || ''
                bValue = b.student?.name || ''
                break
            case 'class':
                aValue = a.class || ''
                bValue = b.class || ''
                break
            case 'date':
                aValue = new Date(a.createdAt)
                bValue = new Date(b.createdAt)
                break
            default:
                return 0
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
        } else {
            return aValue < bValue ? 1 : -1
        }
    })

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <span className="text-gray-400">↕</span>
        return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>
    }

    const handleEdit = (student) => {
        setEditingStudent(student)
    }

    const handleSave = async (formData) => {
        try {
            const response = await updateEnrolledStudent(editingStudent._id, formData)
            
            if (response.success) {
                // Fetch fresh data after update
                const refreshResponse = await getEnrolledStudents(collegeData._id, currentPage, studentsPerPage)
                if (refreshResponse.success) {
                    setStudents(JSON.parse(refreshResponse.enrolledStudents))
                    setPagination(refreshResponse.pagination)
                }
                setEditingStudent(null)
                toast.success("Student details updated successfully")
            } else {
                toast.error(response.message || "Failed to update student details")
            }
        } catch (error) {
            console.error("Error in handleSave:", error)
            toast.error("An error occurred while updating student details")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-blue-50/20 to-indigo-50/10 w-full rounded-3xl relative overflow-hidden backdrop-blur-lg">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-bounce"></div>
            </div>

            <div className="relative z-10 space-y-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                                <p className="text-3xl font-bold text-green-600">2</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <AcademicCapIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                                <p className="text-3xl font-bold text-purple-600">{collegeData.allocatedSubjects.length}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <BookOpenIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Average Duration</p>
                                <p className="text-3xl font-bold text-orange-600">6m</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <ClockIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Table Section */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/50">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Enrolled Students</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {filteredStudents.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Student Name</span>
                                                <SortIcon field="name" />
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                            onClick={() => handleSort('class')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Class</span>
                                                <SortIcon field="class" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Streams
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Allocated Subjects
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                            onClick={() => handleSort('date')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Enrollment Date</span>
                                                <SortIcon field="date" />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.map((student, index) => (
                                        <tr 
                                            key={student._id} 
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-white">
                                                                {(student.student?.name || 'N').charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.student?.name || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {student.class}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {student.allocatedStreams && student.allocatedStreams.length > 0 ? (
                                                    student.allocatedStreams.map((stream, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex px-2 py-1 mr-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                                                        >
                                                            {stream}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
                                                        No streams
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {student.allocatedSubjects && student.allocatedSubjects.length > 0 ? (
                                                        student.allocatedSubjects.map((subject, idx) => (
                                                            <span 
                                                                key={idx}
                                                                className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800"
                                                            >
                                                                {subject}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
                                                            No subjects allocated
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'approved' ? 'bg-green-100 text-green-800' : student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : student.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(student.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchQuery ? 'Try adjusting your search terms.' : 'No enrolled students available.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination Section */}
                {pagination && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="px-4 py-3 sm:px-6">
                            <div className="text-sm text-gray-700 text-center mb-4">
                                Showing {((currentPage - 1) * studentsPerPage) + 1} to{' '}
                                {Math.min(currentPage * studentsPerPage, pagination.totalStudents)} of{' '}
                                {pagination.totalStudents} students
                            </div>
                            <div className="flex items-center justify-center space-x-2 py-4">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md ${
                                        currentPage === 1 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                    }`}
                                >
                                    Previous
                                </button>
                                
                                {getPageNumbers().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                        className={`px-3 py-1 rounded-md ${
                                            page === currentPage
                                                ? 'bg-blue-600 text-white'
                                                : page === '...'
                                                ? 'cursor-default'
                                                : 'bg-white hover:bg-gray-50 border'
                                        }`}
                                        disabled={page === '...'}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className={`px-3 py-1 rounded-md ${
                                        currentPage === pagination.totalPages 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {editingStudent && (
                <EditStudentModal
                    student={editingStudent}
                    onClose={() => setEditingStudent(null)}
                    onSave={handleSave}
                    collegeData={collegeData}
                />
            )}
        </div>
    )
}
