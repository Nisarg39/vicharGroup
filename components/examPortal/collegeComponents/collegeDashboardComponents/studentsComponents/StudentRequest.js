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
import { data } from "../../../../../utils/examUtils/subject_Details"

export default function StudentRequest({ collegeData }) {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedRequest, setExpandedRequest] = useState(null)
    const [selectedSubjects, setSelectedSubjects] = useState({})
    const [selectedClass, setSelectedClass] = useState({})
    const [selectedStream, setSelectedStream] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [requestsPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatus, setSelectedStatus] = useState({})

    const examTypes = ['NEET', 'JEE', 'MHT-CET']
    const classOptions = collegeData.allocatedClasses || []
    const streamOptions = collegeData.allocatedStreams || []

    // Status badge helper
    const getStatusBadge = (status) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        switch (status) {
            case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
            case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const handleClassChange = (requestId, classYear) => {
        setSelectedClass(prev => ({
            ...prev,
            [requestId]: classYear
        }))
    }
    const handleStreamChange = (requestId, stream) => {
        setSelectedStream(prev => ({
            ...prev,
            [requestId]: stream
        }))
    }

    // Helper: Get valid subjects for a request based on selected streams and class (single)
    const getValidSubjectsForRequest = (requestId) => {
        const streams = selectedStream[requestId] || [];
        const classYear = selectedClass[requestId];
        let validSubjects = new Set();
        if (!classYear) return [];
        streams.forEach(stream => {
            const streamData = data[stream];
            if (streamData) {
                Object.keys(streamData).forEach(subject => {
                    if (streamData[subject][classYear]) {
                        validSubjects.add(subject);
                    }
                });
            }
        });
        return Array.from(validSubjects);
    };

    // Helper for multi-select checkboxes and single-select radio for class
    const handleMultiCheckboxChange = (requestId, value, type) => {
        let state, setState;
        if (type === 'class') {
            // Single-select: set value directly
            setSelectedClass(prev => ({ ...prev, [requestId]: value }));
            // After setting class, recalculate valid subjects
            setSelectedSubjects(prev => {
                const streams = selectedStream[requestId] || [];
                const classYear = value;
                let validSubjects = new Set();
                if (classYear) {
                    streams.forEach(stream => {
                        const streamData = data[stream];
                        if (streamData) {
                            Object.keys(streamData).forEach(subject => {
                                if (streamData[subject][classYear]) {
                                    validSubjects.add(subject);
                                }
                            });
                        }
                    });
                }
                return {
                    ...prev,
                    [requestId]: Array.from(validSubjects)
                };
            });
            return;
        } else if (type === 'stream') {
            state = selectedStream;
            setState = setSelectedStream;
        } else if (type === 'subject') {
            state = selectedSubjects;
            setState = setSelectedSubjects;
        }
        const current = state[requestId] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setState(prev => ({ ...prev, [requestId]: updated }));

        // If stream changes, recalculate selected subjects for all selected streams and the single class
        if (type === 'stream') {
            setSelectedSubjects(prev => {
                const streams = updated;
                const classYear = selectedClass[requestId];
                let validSubjects = new Set();
                if (classYear) {
                    streams.forEach(stream => {
                        const streamData = data[stream];
                        if (streamData) {
                            Object.keys(streamData).forEach(subject => {
                                if (streamData[subject][classYear]) {
                                    validSubjects.add(subject);
                                }
                            });
                        }
                    });
                }
                return {
                    ...prev,
                    [requestId]: Array.from(validSubjects)
                };
            });
        }
    };

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

    // Auto-select on expand (always set, not just if empty)
    useEffect(() => {
        if (!expandedRequest) return;
        const req = requests.find(r => r._id === expandedRequest);
        if (req) {
            // Class (single)
            setSelectedClass(prev => ({ ...prev, [expandedRequest]: req.allocatedClasses && req.allocatedClasses.length > 0 ? req.allocatedClasses[0] : '' }));
            // Streams
            setSelectedStream(prev => ({ ...prev, [expandedRequest]: req.allocatedStreams || [] }));
            // Subjects
            setSelectedSubjects(prev => {
                if (prev[expandedRequest] && prev[expandedRequest].length > 0) {
                    return prev;
                }
                if (req.allocatedSubjects && req.allocatedSubjects.length > 0) {
                    return { ...prev, [expandedRequest]: req.allocatedSubjects };
                }
                // Otherwise, mark all valid subjects for requested streams/class
                const streams = req.allocatedStreams || [];
                const classYear = req.allocatedClasses && req.allocatedClasses.length > 0 ? req.allocatedClasses[0] : '';
                let validSubjects = new Set();
                if (classYear) {
                    streams.forEach(stream => {
                        const streamData = data[stream];
                        if (streamData) {
                            Object.keys(streamData).forEach(subject => {
                                if (streamData[subject][classYear]) {
                                    validSubjects.add(subject);
                                }
                            });
                        }
                    });
                }
                return { ...prev, [expandedRequest]: Array.from(validSubjects) };
            });
            // Status
            setSelectedStatus(prev => ({ ...prev, [expandedRequest]: req.status || 'pending' }));
        }
    }, [expandedRequest, requests]);

    const handleAcceptRequest = async (request) => {
        const classYear = selectedClass[request._id] || '';
        const streams = selectedStream[request._id] || [];
        const subjects = selectedSubjects[request._id] || [];
        const status = selectedStatus[request._id] || 'pending';
        if (!classYear) {
            toast.error("Please select a class.");
            return;
        }
        if (!streams.length) {
            toast.error("Please select at least one stream.");
            return;
        }
        if (!subjects.length) {
            toast.error("Please select at least one subject.");
            return;
        }
        const details = {
            studentId: request.student._id,
            collegeId: collegeData._id,
            class: classYear,
            allocatedSubjects: subjects,
            allocatedStreams: streams,
            studentRequest: request._id,
            status,
        };
        const response = await assignStudent(details);
        if (response.success) {
            toast.success("Student assigned successfully")
            const updatedResponse = await getStudentRequests(collegeData._id);
            if (updatedResponse.success) {
                setRequests(updatedResponse.studentRequest);
                setExpandedRequest(null);
                setSelectedSubjects({});
                setSelectedClass({});
                setSelectedStream({});
                setSelectedStatus({});
            }
        } else {
            toast.error(response.message || "Failed to assign student")
        }
    }
    const handleRejectRequest = async (request) => {
        // Set status to rejected and call assignStudent
        setSelectedStatus(prev => ({ ...prev, [request._id]: 'rejected' }));
        const classYear = selectedClass[request._id] || '';
        const streams = selectedStream[request._id] || [];
        const subjects = selectedSubjects[request._id] || [];
        const status = 'rejected';
        const details = {
            studentId: request.student._id,
            collegeId: collegeData._id,
            class: classYear,
            allocatedSubjects: subjects,
            allocatedStreams: streams,
            studentRequest: request._id,
            status,
        };
        const response = await assignStudent(details);
        if (response.success) {
            toast.success("Student request rejected")
            const updatedResponse = await getStudentRequests(collegeData._id);
            if (updatedResponse.success) {
                setRequests(updatedResponse.studentRequest);
                setExpandedRequest(null);
                setSelectedSubjects({});
                setSelectedClass({});
                setSelectedStream({});
                setSelectedStatus({});
            }
        } else {
            toast.error(response.message || "Failed to reject student request")
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

    // Toggle expand/collapse for a request
    const handleExpand = (requestId) => {
        setExpandedRequest(expandedRequest === requestId ? null : requestId);
    };

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
                                            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                {request.student.name}
                                                {/* Class label(s) */}
                                                {request.allocatedClasses && request.allocatedClasses.length > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">
                                                        Class: {request.allocatedClasses.join(', ')}
                                                    </span>
                                                )}
                                                {/* Stream label(s) */}
                                                {request.allocatedStreams && request.allocatedStreams.length > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-200">
                                                        Stream: {request.allocatedStreams.join(', ')}
                                                    </span>
                                                )}
                                            </h3>
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

                                {expandedRequest === request._id && (request.status === 'pending' || request.status === 'rejected') && (
                                    <div className="mt-6 pl-14">
                                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Student Assignment Details
                                            </h4>
                                            <div className="space-y-6">
                                                {/* Show student's requested class and streams */}
                                                <div className="mb-4">
                                                    <div className="text-xs text-gray-500 mb-1">Student Requested:</div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {request.allocatedClasses && request.allocatedClasses.length > 0 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                                Class: {request.allocatedClasses.join(', ')}
                                                            </span>
                                                        )}
                                                        {request.allocatedStreams && request.allocatedStreams.length > 0 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                                                                Stream: {request.allocatedStreams.join(', ')}
                                                            </span>
                                                        )}
                                                        {request.allocatedSubjects && request.allocatedSubjects.length > 0 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                                                                Subjects: {request.allocatedSubjects.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Derive checked arrays for this request */}
                                                {(() => {
                                                    const checkedClasses = selectedClass[request._id] !== undefined
                                                        ? selectedClass[request._id]
                                                        : request.allocatedClasses || [];
                                                    const checkedStreams = selectedStream[request._id] !== undefined
                                                        ? selectedStream[request._id]
                                                        : request.allocatedStreams || [];
                                                    const checkedSubjects = selectedSubjects[request._id] !== undefined
                                                        ? selectedSubjects[request._id]
                                                        : request.allocatedSubjects || [];

                                                    return <>
                                                        {/* Class Selection (radio buttons) */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Assign Class
                                                            </label>
                                                            <div className="flex flex-wrap gap-3">
                                                                {classOptions.map(classYear => (
                                                                    <label key={classYear} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`class-${request._id}`}
                                                                            checked={checkedClasses.includes(classYear)}
                                                                            onChange={() => handleMultiCheckboxChange(request._id, classYear, 'class')}
                                                                        />
                                                                        <span className="text-sm text-gray-700">{classYear}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {/* Stream Selection (checkboxes) */}
                                                        {streamOptions.length > 0 && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Assign Streams
                                                                </label>
                                                                <div className="flex flex-wrap gap-3">
                                                                    {streamOptions.map(stream => (
                                                                        <label key={stream} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={checkedStreams.includes(stream)}
                                                                                onChange={() => handleMultiCheckboxChange(request._id, stream, 'stream')}
                                                                            />
                                                                            <span className="text-sm text-gray-700">{stream}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Subject Selection (checkboxes) */}
                                                        <div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Assign Subjects
                                                                </label>
                                                                <span className="text-xs text-gray-500">
                                                                    Selected: {checkedSubjects.length}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {/* Only show subjects valid for selected streams/classes */}
                                                                {getValidSubjectsForRequest(request._id).map(subject => (
                                                                    <label 
                                                                        key={subject} 
                                                                        className={
                                                                            `relative flex items-center p-4 rounded-lg border-2 cursor-pointer
                                                                            transition-all duration-200 ease-in-out
                                                                            ${checkedSubjects.includes(subject)
                                                                                ? 'border-blue-500 bg-blue-50'
                                                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                            }`
                                                                        }
                                                                    >
                                                                        <input 
                                                                            type="checkbox"
                                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                            checked={checkedSubjects.includes(subject)}
                                                                            onChange={() => handleMultiCheckboxChange(request._id, subject, 'subject')}
                                                                        />
                                                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                                                            {subject}
                                                                        </span>
                                                                        {checkedSubjects.includes(subject) && (
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
                                                    </>;
                                                })()}

                                                {/* Action Buttons and Status Dropdown */}
                                                <div className="flex gap-4 pt-4 border-t border-gray-200 items-center">
                                                    <div className="relative">
                                                        <select
                                                            className="appearance-none px-3 py-2 pr-8 rounded-lg border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 bg-white text-gray-800"
                                                            value={selectedStatus[request._id] || 'pending'}
                                                            onChange={e => setSelectedStatus(prev => ({ ...prev, [request._id]: e.target.value }))}
                                                        >
                                                            <option value="pending" className="text-yellow-700 bg-yellow-50">Pending</option>
                                                            <option value="approved" className="text-green-700 bg-green-50">Approved</option>
                                                            <option value="rejected" className="text-red-700 bg-red-50">Rejected</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                                                <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
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
                                                        Save
                                                    </button>
                                                    <button
                                                        className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                                                        onClick={() => {
                                                            setExpandedRequest(null);
                                                            setSelectedSubjects({});
                                                            setSelectedClass({});
                                                            setSelectedStream({});
                                                            setSelectedStatus({});
                                                        }}
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Cancel
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
