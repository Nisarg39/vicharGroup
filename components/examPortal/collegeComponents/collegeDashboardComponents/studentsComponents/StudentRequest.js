"use client"
import { useState, useEffect } from 'react'
import { getStudentRequests, assignStudent } from "../../../../../server_actions/actions/examController/collegeActions"
import { toast } from 'react-hot-toast'
import { 
    UserPlusIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'

export default function StudentRequest({ collegeData }) {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedRequest, setExpandedRequest] = useState(null)
    const [selectedSubjects, setSelectedSubjects] = useState({})
    const [selectedClass, setSelectedClass] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [requestsPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')

    const examTypes = ['NEET', 'JEE', 'MHT-CET']
    const classOptions = ['11th', '12th']

    const handleClassChange = (requestId, classYear) => {
        setSelectedClass(prev => ({
            ...prev,
            [requestId]: classYear
        }))
    }

    useEffect(() => {
        const fetchRequests = async () => {
            const response = await getStudentRequests(collegeData._id, currentPage, requestsPerPage)
            if (response.success) {
                setRequests(response.studentRequest)
                setPagination(response.pagination)
            }
            setLoading(false)
        }
        fetchRequests()
    }, [currentPage, requestsPerPage])

    const handleExpand = (requestId) => {
        setExpandedRequest(expandedRequest === requestId ? null : requestId)
    }

    const handleSubjectToggle = (requestId, subject) => {
        setSelectedSubjects(prev => {
            const currentSubjects = prev[requestId] || []
            const updatedSubjects = currentSubjects.includes(subject)
                ? currentSubjects.filter(s => s !== subject)
                : [...currentSubjects, subject]
            return {
                ...prev,
                [requestId]: updatedSubjects
            }
        })
    }

    const getStatusBadge = (status) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        switch (status) {
            case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 'approved': return `${baseClasses} bg-green-100 text-green-800`
            case 'rejected': return `${baseClasses} bg-red-100 text-red-800`
            default: return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const handleAcceptRequest = async (request) => {
        if (!selectedClass[request._id] || !selectedSubjects[request._id]?.length) {
            toast.error("Please select both class and subjects")
            return;
        }

        const details = {
            studentId: request.student._id,
            collegeId: collegeData._id,
            allocatedSubjects: selectedSubjects[request._id],
            class: selectedClass[request._id],
            studentRequest: request._id,
        };

        const response = await assignStudent(details);
        
        if (response.success) {
            toast.success("Student assigned successfully")
            const updatedResponse = await getStudentRequests(collegeData._id);
            if (updatedResponse.success) {
                setRequests(updatedResponse.studentRequest);
                setExpandedRequest(null); // Reset expanded state
                setSelectedSubjects({}); // Clear selections
                setSelectedClass({});
            }
        } else {
            toast.error(response.message || "Failed to assign student")
        }
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
        // Show max 5 page numbers, with ellipsis for larger ranges
        const getPageNumbers = () => {
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

        return (
            <div className="flex items-center justify-center space-x-2 py-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
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
                        onClick={() => typeof page === 'number' && onPageChange(page)}
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
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                >
                    Next
                </button>
            </div>
        )
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1) // Reset to first page when searching
    }

    const filteredRequests = requests.filter(request => {
        if (!searchQuery) return true
        
        const searchLower = searchQuery.toLowerCase()
        const studentData = request.student
        
        return (
            studentData.name.toLowerCase().includes(searchLower) ||
            studentData.email.toLowerCase().includes(searchLower) ||
            (studentData.phone && studentData.phone.includes(searchQuery))
        )
    })

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-blue-50/20 to-indigo-50/10 w-full rounded-3xl relative overflow-hidden backdrop-blur-lg">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-bounce"></div>
            </div>

            <div className="relative z-10 space-y-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {requests.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <UserGroupIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {requests.filter(r => r.status === 'approved').length}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {requests.filter(r => r.status === 'rejected').length}
                                </p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <XCircleIcon className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search by name, email or phone..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/50">
                    <div className="divide-y divide-gray-200">
                        {filteredRequests.map((request) => (
                            <div key={request._id} className="p-4">
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => handleExpand(request._id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-white font-medium">
                                                {request.student.name[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{request.student.name}</h3>
                                            <p className="text-sm text-gray-500">{request.student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={getStatusBadge(request.status)}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                        <svg 
                                            className={`w-5 h-5 text-gray-500 transition-transform ${expandedRequest === request._id ? 'transform rotate-180' : ''}`}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {expandedRequest === request._id && request.status === 'pending' && (
                                    <div className="mt-6 pl-14">
                                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Student Assignment Details
                                            </h4>
                                            
                                            <div className="space-y-6">
                                                {/* Class Selection */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Select Class Level
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {classOptions.map(classYear => (
                                                            <button
                                                                key={classYear}
                                                                className={`
                                                                    px-4 py-3 rounded-lg border text-sm font-medium
                                                                    ${selectedClass[request._id] === classYear 
                                                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                                    }
                                                                `}
                                                                onClick={() => handleClassChange(request._id, classYear)}
                                                                type="button"
                                                            >
                                                                {classYear}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Subject Selection */}
                                                <div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Assign Subjects
                                                        </label>
                                                        <span className="text-xs text-gray-500">
                                                            Selected: {(selectedSubjects[request._id] || []).length}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {collegeData.allocatedSubjects.map(subject => (
                                                            <label 
                                                                key={subject} 
                                                                className={`
                                                                    relative flex items-center p-4 rounded-lg border-2 cursor-pointer
                                                                    transition-all duration-200 ease-in-out
                                                                    ${(selectedSubjects[request._id] || []).includes(subject)
                                                                        ? 'border-blue-500 bg-blue-50'
                                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                    }
                                                                `}
                                                            >
                                                                <input 
                                                                    type="checkbox"
                                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    checked={(selectedSubjects[request._id] || []).includes(subject)}
                                                                    onChange={() => handleSubjectToggle(request._id, subject)}
                                                                />
                                                                <span className="ml-3 text-sm font-medium text-gray-900">
                                                                    {subject}
                                                                </span>
                                                                {(selectedSubjects[request._id] || []).includes(subject) && (
                                                                    <span className="absolute top-2 right-2">
                                                                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </span>
                                                                )}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                                    <button 
                                                        className={`
                                                            flex-1 px-6 py-3 rounded-lg text-sm font-medium
                                                            transition-all duration-200 ease-in-out
                                                            flex items-center justify-center gap-2
                                                            ${(selectedSubjects[request._id] || []).length > 0
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }
                                                        `}
                                                        disabled={(selectedSubjects[request._id] || []).length === 0}
                                                        onClick={() => handleAcceptRequest(request)}
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Accept Request
                                                    </button>
                                                    <button 
                                                        className="flex-1 px-6 py-3 bg-white border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200 flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Reject Request
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100/50">
                        <div className="px-4 py-3 sm:px-6">
                            <div className="text-sm text-gray-700 text-center mb-4">
                                Showing {((currentPage - 1) * requestsPerPage) + 1} to{' '}
                                {Math.min(currentPage * requestsPerPage, filteredRequests.length)} of{' '}
                                {filteredRequests.length} results
                            </div>
                            <PaginationControls 
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredRequests.length / requestsPerPage)}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
