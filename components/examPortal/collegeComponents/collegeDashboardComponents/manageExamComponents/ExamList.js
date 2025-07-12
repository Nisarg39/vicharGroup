"use client";
import { getTopics } from '../../../../../utils/examUtils/subject_Details';
import React,{ useState, useEffect } from 'react';
import { showExamList } from '../../../../../server_actions/actions/examController/collegeActions';
import QuestionAssignmentModal from './QuestionAssignmentModal';

export default function ExamList({ collegeData, onBack }) {
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
        sortBy: ''
    });
    const [expandedExamId, setExpandedExamId] = useState(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

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
                console.log('Exam data:', response.data.exams[0]); // Log first exam for data structure
                setExams(response.data.exams);
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
        fetchExams(1);
    }, [collegeData?._id, formData]);

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

    const toggleExamDetails = (examId) => {
        setExpandedExamId(expandedExamId === examId ? null : examId);
    };

    const handleAssignQuestions = (exam) => {
        setSelectedExam(exam);
        setShowQuestionModal(true);
    };

    const handleQuestionsAssigned = () => {
        // Refresh the exam list to show updated question count
        fetchExams(pagination.currentPage);
    };

    return (
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
                                <option value="NEET">NEET</option>
                                <option value="JEE">JEE</option>
                                <option value="MHT-CET">MHT-CET</option>
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
                                {collegeData?.allocatedSubjects?.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
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
                                    <option value="1">Section A</option>
                                    <option value="2">Section B</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Sort By</label>
                            <select 
                                value={formData.sortBy}
                                onChange={(e) => setFormData({...formData, sortBy: e.target.value})}
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
                        <div className="mt-8 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Exam Name</th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stream</th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {exams.map((exam, index) => (
                                            <React.Fragment key={exam._id}>
                                                <tr 
                                                    onClick={() => toggleExamDetails(exam._id)}
                                                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer ${
                                                        expandedExamId === exam._id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-sm' : ''
                                                    }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-12 w-12">
                                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
                                                                    <span className="text-white font-bold text-lg">
                                                                        {exam.examName.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h3 className="text-base font-bold text-gray-900 truncate">
                                                                        {exam.examName}
                                                                    </h3>
                                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                                        {exam.examAvailability === 'scheduled' && exam.startTime && (
                                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                                </svg>
                                                                                {new Date(exam.startTime).toLocaleString('en-US', {
                                                                                    day: 'numeric',
                                                                                    month: 'short',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                        )}
                                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                                                                            exam.examAvailability === 'scheduled' 
                                                                            ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                                        }`}>
                                                                            {exam.examAvailability === 'scheduled' ? '📅 Scheduled' : '🎯 Practice'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-3 text-xs">
                                                                    <span className="text-gray-600">
                                                                        Created {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Recently'}
                                                                    </span>
                                                                    {exam.examQuestions && exam.examQuestions.length > 0 && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded-md border border-green-100">
                                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                            </svg>
                                                                            {exam.examQuestions.length} Questions
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-wrap gap-2">
                                                            {exam.examSubject?.map((subject, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                                                                    {subject}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                            {exam.stream}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                                                            exam.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                                            exam.status === 'published' ? 'bg-green-100 text-green-800 border border-green-300' :
                                                            exam.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                                            exam.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                                                            'bg-red-100 text-red-800 border border-red-300'
                                                        }`}>
                                                            <div className={`w-3 h-3 rounded-full mr-2 ${
                                                                exam.status === 'draft' ? 'bg-yellow-500' :
                                                                exam.status === 'published' ? 'bg-green-500' :
                                                                exam.status === 'scheduled' ? 'bg-blue-500' :
                                                                exam.status === 'completed' ? 'bg-gray-500' :
                                                                'bg-red-500'
                                                            }`}></div>
                                                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex space-x-3">
                                                            <button 
                                                                onClick={() => handleAssignQuestions(exam)}
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                                            >
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                </svg>
                                                                Assign Questions
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedExamId === exam._id && (
                                                    <tr className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                                                        <td colSpan="5" className="px-8 py-8">
                                                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {/* Basic Details Card */}
                                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-200">
                                                                        <div className="flex items-center mb-4">
                                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                                                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                            </div>
                                                                            <h5 className="font-bold text-gray-900 text-lg">Basic Details</h5>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                                                                                <span className="text-sm font-semibold text-gray-700">Standard</span>
                                                                                <span className="text-sm font-bold text-gray-900">{exam.standard || 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                                                                                <span className="text-sm font-semibold text-gray-700">Section</span>
                                                                                <span className="text-sm font-bold text-gray-900">{exam.section || 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                                                                                <span className="text-sm font-semibold text-gray-700">Type</span>
                                                                                <span className="text-sm font-bold text-gray-900 capitalize">{exam.examAvailability || 'N/A'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Exam Settings Card */}
                                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-200">
                                                                        <div className="flex items-center mb-4">
                                                                            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                                                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <h5 className="font-bold text-gray-900 text-lg">Exam Settings</h5>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                                                                                <span className="text-sm font-semibold text-gray-700">Duration</span>
                                                                                <span className="text-sm font-bold text-gray-900">{exam.examDurationMinutes || 0} min</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                                                                                <span className="text-sm font-semibold text-gray-700">Total Marks</span>
                                                                                <span className="text-sm font-bold text-gray-900">{exam.totalMarks || 0}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                                                                                <span className="text-sm font-semibold text-gray-700">Passing Marks</span>
                                                                                <span className="text-sm font-bold text-gray-900">{exam.passingMarks || 0}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                                                                                <span className="text-sm font-semibold text-gray-700">Questions Assigned</span>
                                                                                <span className={`text-sm font-bold ${
                                                                                    exam.examQuestions && exam.examQuestions.length > 0 
                                                                                        ? 'text-green-600' 
                                                                                        : 'text-red-600'
                                                                                }`}>
                                                                                    {exam.examQuestions ? exam.examQuestions.length : 0} questions
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Schedule Card */}
                                                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow duration-200">
                                                                        <div className="flex items-center mb-3">
                                                                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <h5 className="font-medium text-gray-900">Schedule</h5>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <div>
                                                                                <span className="text-sm text-gray-600 block mb-1">Start Time</span>
                                                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                                                    {exam.startTime ? new Date(exam.startTime).toLocaleString() : 'Not scheduled'}
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-sm text-gray-600 block mb-1">End Time</span>
                                                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                                                    {exam.endTime ? new Date(exam.endTime).toLocaleString() : 'Not scheduled'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Additional Settings Card */}
                                                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow duration-200">
                                                                        <div className="flex items-center mb-3">
                                                                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                </svg>
                                                                            </div>
                                                                            <h5 className="font-medium text-gray-900">Additional Settings</h5>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Negative Marks</span>
                                                                                <span className="text-sm font-medium text-gray-900">{exam.negativeMarks || 0}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Shuffle Questions</span>
                                                                                <span className={`text-xs px-2 py-1 rounded-full ${exam.questionShuffle ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                                    {exam.questionShuffle ? 'Yes' : 'No'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Reattempts</span>
                                                                                <span className="text-sm font-medium text-gray-900">{exam.reattempt || 0}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Instructions Card */}
                                                                    {exam.examInstructions && (
                                                                        <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                                                            <div className="flex items-center mb-3">
                                                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h5 className="font-medium text-gray-900">Exam Instructions</h5>
                                                                            </div>
                                                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                                                    {exam.examInstructions}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                            <div className="flex items-center">
                                <p className="text-sm font-semibold text-gray-700">
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
                                    className="relative inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    ← Previous
                                </button>
                                <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded-xl border border-gray-300">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="relative inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Question Assignment Modal */}
            <QuestionAssignmentModal
                exam={selectedExam}
                isOpen={showQuestionModal}
                onClose={() => setShowQuestionModal(false)}
                onQuestionsAssigned={handleQuestionsAssigned}
                collegeData={collegeData}
                className="fixed inset-0"
            />
        </div>
    );
}