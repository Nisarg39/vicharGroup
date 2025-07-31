"use client";
import { getTopics, data } from '../../../../../utils/examUtils/subject_Details';
import React,{ useState, useEffect } from 'react';
import { showExamList } from '../../../../../server_actions/actions/examController/collegeActions';
import QuestionAssignmentModal from './QuestionAssignmentModal';
import EditExamModal from './EditExamModal';

export default function ExamList({ collegeData, onBack, refreshKey }) {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        total: 0,
        limit: 10
    });
    
    const [formData, setFormData] = useState({
        stream: '',
        subject: '',
        standard: '',
        section: '',
        examAvailability: '',
        sortBy: 'recent'
    });
    const [expandedExamId, setExpandedExamId] = useState(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [updateStatus, setUpdateStatus] = useState({ show: false, type: '', message: '' });
    const [activeDropdown, setActiveDropdown] = useState(null);
    // Note: Negative marking rule tracking removed - using admin defaults only

    const topics = getTopics(formData.stream, formData.subject, formData.standard);

    const fetchExams = async (page = 1) => {
        setLoading(true);
        try {
            const response = await showExamList(
                collegeData._id, 
                page, 
                pagination.limit,
                formData
            );
            
            if (response.success) {
                setExams((response.data.exams || []).filter(exam => exam && exam._id));
                setPagination({
                    currentPage: response.data.pagination.page,
                    totalPages: response.data.pagination.totalPages,
                    total: response.data.pagination.total,
                    limit: response.data.pagination.limit
                });
            }
        } catch (error) {
            console.error("Failed to fetch exams:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Always reset to first page when refreshKey changes (e.g., after new exam creation)
        fetchExams(1);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, [collegeData?._id, formData, refreshKey]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdown(null);
        };

        if (activeDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeDropdown]);

    const handlePageChange = (newPage) => {
        fetchExams(newPage);
    };

    const handleStreamChange = (e) => {
        setFormData({
            ...formData,
            stream: e.target.value,
            subject: '',
            standard: '',
            section: ''
        });
    };

    const handleSubjectChange = (e) => {
        setFormData({
            ...formData,
            subject: e.target.value,
            standard: '',
            section: ''
        });
    };

    const handleStandardChange = (e) => {
        setFormData({
            ...formData,
            standard: e.target.value,
            section: ''
        });
    };

    const toggleExamDetails = async (examId) => {
        const newExpandedId = expandedExamId === examId ? null : examId;
        setExpandedExamId(newExpandedId);
        // Note: Negative marking rule fetching removed - using admin defaults only
    };

    const handleAssignQuestions = (exam) => {
        setSelectedExam(exam);
        setShowQuestionModal(true);
    };

    const handleQuestionsAssigned = () => {
        // Refresh the exam list to show updated question count
        fetchExams(pagination.currentPage);
    };

    const handleEditExam = (exam) => {
        setEditingExam(exam);
        setShowEditModal(true);
    };

    const handleExamUpdated = (updatedExam) => {
        // Update the exam in the list
        setExams(prevExams => 
            prevExams.map(exam => 
                exam._id === updatedExam._id ? updatedExam : exam
            )
        );
        // Show success message
        setUpdateStatus({ 
            show: true, 
            type: 'success', 
            message: 'Exam updated successfully!' 
        });
        // Hide message after 3 seconds
        setTimeout(() => {
            setUpdateStatus({ show: false, type: '', message: '' });
        }, 3000);
    };

    return (
        <>
            <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="w-full">
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Exams List</h1>
                                <p className="text-gray-600 mt-1 font-medium">Manage and view all your examinations</p>
                            </div>
                        </div>
                    </div>

                    {/* Update Status Message */}
                    {updateStatus.show && (
                        <div className={`mx-8 mt-4 p-4 rounded-lg border ${
                            updateStatus.type === 'success' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                        } flex items-center justify-between`}>
                            <div className="flex items-center">
                                {updateStatus.type === 'success' ? (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {updateStatus.message}
                            </div>
                            <button
                                onClick={() => setUpdateStatus({ show: false, type: '', message: '' })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Enhanced Filters Section */}
                    <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Filter Exams</h3>
                            <p className="text-gray-600">Use filters to find specific examinations</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                            {/* Stream filter */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Stream</label>
                                <select 
                                    value={formData.stream}
                                    onChange={handleStreamChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                                >
                                    <option value="">All Streams</option>
                                    {collegeData?.allocatedStreams && collegeData.allocatedStreams.length > 0 && (
                                        collegeData.allocatedStreams.map((stream) => (
                                            <option key={stream} value={stream}>{stream}</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Exam Type filter */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Exam Type</label>
                                <select 
                                    value={formData.examAvailability}
                                    onChange={(e) => setFormData({...formData, examAvailability: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                                >
                                    <option value="">All Types</option>
                                    <option value="scheduled">📅 Scheduled</option>
                                    <option value="practice">🎯 Practice</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Subject</label>
                                <select 
                                    value={formData.subject}
                                    onChange={handleSubjectChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    disabled={!formData.stream}
                                >
                                    <option value="">All Subjects</option>
                                    {formData.stream && data[formData.stream] && (
                                        Object.keys(data[formData.stream]).map((subject) => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Standard</label>
                                <select 
                                    value={formData.standard}
                                    onChange={handleStandardChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    disabled={!formData.subject}
                                >
                                    <option value="">All Standards</option>
                                    <option value="11">11th</option>
                                    <option value="12">12th</option>
                                </select>
                            </div>

                            {formData.stream && !['MHT-CET', 'NEET', 'JEE'].includes(formData.stream) && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Section</label>
                                    <select
                                        value={formData.section}
                                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                                    >
                                        <option value="">All Sections</option>
                                        <option value="Section A">Section A</option>
                                        <option value="Section B">Section B</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Sort By</label>
                                <select 
                                    value={formData.sortBy}
                                    onChange={(e) => {
                                        let mappedValue = e.target.value;
                                        if (mappedValue === 'Recently Created') mappedValue = 'recent';
                                        if (mappedValue === 'Recently Updated') mappedValue = 'updated';
                                        setFormData({...formData, sortBy: mappedValue});
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                                >
                                    <option value="">Default</option>
                                    <option value="recent">Recently Created</option>
                                    <option value="upcoming">Upcoming Exams</option>
                                    <option value="updated">Recently Updated</option>
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={() => setFormData({stream: '', subject: '', standard: '', section: '', examAvailability: ''})}
                                    className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center justify-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Clear All
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-60">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">Loading exams...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100">
                                        <div className="grid grid-cols-10 gap-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                            <div className="col-span-4">Exam Details</div>
                                            <div className="col-span-2">Stream</div>
                                            <div className="col-span-3">Status</div>
                                            <div className="col-span-1">Actions</div>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {exams.filter(exam => exam && exam._id).map((exam) => (
                                            <React.Fragment key={exam._id}>
                                                <div 
                                                    onClick={() => toggleExamDetails(exam._id)}
                                                    className={`group cursor-pointer transition-all duration-300 hover:bg-blue-50/30 ${
                                                        expandedExamId === exam._id ? 'bg-blue-50/50' : ''
                                                    } ${
                                                        exam.examStatus === 'active' 
                                                            ? 'bg-gradient-to-r from-green-50/50 to-emerald-50/30 border-l-4 border-green-400 shadow-sm' 
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="grid grid-cols-10 gap-4 items-center p-6">
                                                        <div className="col-span-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`relative h-12 w-12 rounded-xl flex items-center justify-center shadow-md ${
                                                                    exam.examStatus === 'active' 
                                                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                                                        : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                                                                }`}>
                                                                    <span className="text-white font-bold text-lg">
                                                                        {exam.examName.charAt(0).toUpperCase()}
                                                                    </span>
                                                                    {exam.examStatus === 'active' && (
                                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                                                                            {exam.examName}
                                                                        </h3>
                                                                        {exam.examStatus === 'active' && (
                                                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full shadow-sm">
                                                                                <div className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></div>
                                                                                LIVE
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                        {exam.standard && (
                                                                            <span className="font-medium">Class {exam.standard}</span>
                                                                        )}
                                                                        {exam.examAvailability === 'scheduled' && exam.startTime && (
                                                                            <>
                                                                                <span className="text-gray-400">•</span>
                                                                                <span className="flex items-center gap-1">
                                                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    </svg>
                                                                                    {new Date(exam.startTime).toLocaleDateString('en-US', {
                                                                                        month: 'short',
                                                                                        day: 'numeric',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit'
                                                                                    })}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                        <span className="text-gray-400">•</span>
                                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                                                                            exam.examAvailability === 'scheduled' 
                                                                            ? 'bg-purple-100 text-purple-700' 
                                                                            : 'bg-emerald-100 text-emerald-700'
                                                                        }`}>
                                                                            {exam.examAvailability === 'scheduled' ? '📅 Scheduled' : '🎯 Practice'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700">
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                </svg>
                                                                {exam.stream}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <div className="flex flex-col gap-2">
                                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold w-fit ${
                                                                    exam.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                                    exam.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                                    exam.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                                    exam.status === 'completed' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                                                                    'bg-red-50 text-red-700 border border-red-200'
                                                                }`}>
                                                                    <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                                                                        exam.status === 'draft' ? 'bg-yellow-500' :
                                                                        exam.status === 'published' ? 'bg-green-500' :
                                                                        exam.status === 'scheduled' ? 'bg-blue-500' :
                                                                        exam.status === 'completed' ? 'bg-gray-500' :
                                                                        'bg-red-500'
                                                                    }`}></div>
                                                                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                                                </span>
                                                                {exam.examStatus === 'active' && (
                                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white shadow-md border border-green-500 w-fit">
                                                                        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        LIVE NOW
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-1">
                                                            <div className="relative">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveDropdown(activeDropdown === exam._id ? null : exam._id);
                                                                    }}
                                                                    className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                                                >
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                    </svg>
                                                                </button>
                                                                {activeDropdown === exam._id && (
                                                                    <div className="absolute right-0 top-10 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditExam(exam);
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            Edit Exam
                                                                        </button>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAssignQuestions(exam);
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                            </svg>
                                                                            Assign Questions
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {expandedExamId === exam._id && (
                                                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100">
                                                        <div className="p-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                                    {/* Basic Details */}
                                                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                                                        <div className="flex items-center mb-3">
                                                                            <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center mr-2">
                                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                            </div>
                                                                            <h5 className="text-sm font-semibold text-blue-900">Basic Info</h5>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-blue-700">Standard</span>
                                                                                <span className="text-xs font-semibold text-blue-900">{exam.standard ? `Class ${exam.standard}` : 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-blue-700">Section</span>
                                                                                <span className="text-xs font-semibold text-blue-900">{exam.section || 'All'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-blue-700">Type</span>
                                                                                <span className="text-xs font-semibold text-blue-900 capitalize">{exam.examAvailability || 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-blue-700">Created</span>
                                                                                <span className="text-xs font-semibold text-blue-900">{exam.createdAt ? new Date(exam.createdAt).toLocaleString() : 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-blue-700">Last Updated</span>
                                                                                <span className="text-xs font-semibold text-blue-900">{exam.updatedAt ? new Date(exam.updatedAt).toLocaleString() : 'N/A'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                        {/* Exam Configuration */}
                                                                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                                                            <div className="flex items-center mb-3">
                                                                                <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center mr-2">
                                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h5 className="text-sm font-semibold text-green-900">Configuration</h5>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-green-700">Duration</span>
                                                                                    <span className="text-xs font-semibold text-green-900">{exam.examDurationMinutes || 0} min</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-green-700">Total Marks</span>
                                                                                    <span className="text-xs font-semibold text-green-900">{exam.totalMarks || 0}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-green-700">Passing Marks</span>
                                                                                    <span className="text-xs font-semibold text-green-900">{exam.passingMarks || 0}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Questions & Timing */}
                                                                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                                                            <div className="flex items-center mb-3">
                                                                                <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center mr-2">
                                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h5 className="text-sm font-semibold text-purple-900">Questions</h5>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-purple-700">Assigned</span>
                                                                                    <span className={`text-xs font-semibold ${
                                                                                        exam.examQuestions && exam.examQuestions.length > 0 
                                                                                            ? 'text-green-600' 
                                                                                            : 'text-red-600'
                                                                                    }`}>
                                                                                        {exam.examQuestions ? exam.examQuestions.length : 0}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-purple-700">Shuffle</span>
                                                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${exam.questionShuffle ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                                        {exam.questionShuffle ? 'Yes' : 'No'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-purple-700">Reattempts</span>
                                                                                    <span className="text-xs font-semibold text-purple-900">{exam.reattempt || 0}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Scoring */}
                                                                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                                                            <div className="flex items-center mb-3">
                                                                                <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center mr-2">
                                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h5 className="text-sm font-semibold text-orange-900">Scoring</h5>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-orange-700">Negative Marks</span>
                                                                                    <span className="text-xs font-semibold text-orange-900">
                                                                                        -{exam.negativeMarks || 0} marks
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-xs text-orange-700">Rule Source</span>
                                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                                                        ⚙️ Admin Default
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-orange-700">Success Rate</span>
                                                                                    <span className="text-xs font-semibold text-orange-900">
                                                                                        {exam.totalMarks ? Math.round((exam.passingMarks / exam.totalMarks) * 100) : 0}%
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Schedule Section */}
                                                                    {(exam.startTime || exam.endTime) && (
                                                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                                                                            <div className="flex items-center mb-3">
                                                                                <div className="w-6 h-6 bg-gray-500 rounded-md flex items-center justify-center mr-2">
                                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h5 className="text-sm font-semibold text-gray-900">Schedule</h5>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <span className="text-xs text-gray-600 block mb-1">Start Time</span>
                                                                                    <div className="bg-white px-3 py-2 rounded-md border border-gray-200">
                                                                                        <span className="text-xs font-medium text-gray-800">
                                                                                            {exam.startTime ? new Date(exam.startTime).toLocaleString() : 'Not scheduled'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-xs text-gray-600 block mb-1">End Time</span>
                                                                                    <div className="bg-white px-3 py-2 rounded-md border border-gray-200">
                                                                                        <span className="text-xs font-medium text-gray-800">
                                                                                            {exam.endTime ? new Date(exam.endTime).toLocaleString() : 'Not scheduled'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Instructions Section */}
                                                                    {exam.examInstructions && (
                                                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                                            <div className="flex items-center mb-3">
                                                                                <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center mr-2">
                                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h5 className="text-sm font-semibold text-blue-900">Exam Instructions</h5>
                                                                            </div>
                                                                            <div className="bg-white rounded-md p-3 border border-blue-200">
                                                                                <p className="text-xs text-gray-700 leading-relaxed">
                                                                                    {exam.examInstructions}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                        </div>
                                                    </div>
                                                )}
                                                </React.Fragment>
                                            ))}
                                    </div>
                                </div>
                            </div>
                                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-100">
                                    <div className="flex items-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            Showing{' '}
                                            <span className="font-bold text-blue-600">{((pagination.currentPage - 1) * pagination.limit) + 1}</span>
                                            {' '}-{' '}
                                            <span className="font-bold text-blue-600">
                                                {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
                                            </span>
                                            {' '}of{' '}
                                            <span className="font-bold text-blue-600">{pagination.total}</span>
                                            {' '}exams
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            Next
                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Question Assignment Modal - moved outside main container for fullscreen */}
                <QuestionAssignmentModal
                    exam={selectedExam}
                    isOpen={showQuestionModal}
                    onClose={() => setShowQuestionModal(false)}
                    onQuestionsAssigned={handleQuestionsAssigned}
                    collegeData={collegeData}
                />

                {/* Edit Exam Modal */}
                <EditExamModal
                    exam={editingExam}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onExamUpdated={handleExamUpdated}
                    collegeData={collegeData}
                />
            </>
        );
    }