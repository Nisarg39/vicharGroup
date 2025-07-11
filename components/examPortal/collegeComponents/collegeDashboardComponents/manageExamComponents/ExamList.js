"use client";
import { getTopics } from '../../../../../utils/examUtils/subject_Details';
import React,{ useState, useEffect } from 'react';
import { showExamList } from '../../../../../server_actions/actions/examController/collegeActions';

export default function ExamList({ collegeData, onBack }) {
    const [showList, setShowList] = useState(false);
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
        examAvailability: ''
    });
    const [expandedExamId, setExpandedExamId] = useState(null);

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
        if (showList && collegeData?._id) {
            fetchExams(1);
        }
    }, [showList, collegeData?._id, formData]);

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

    if (!showList) {
        return (
            <div className="w-full">
                <button 
                    onClick={() => setShowList(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Show Exams List
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-full">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Exams List</h1>
                            <p className="text-sm text-gray-500">Manage and view all your exams</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowList(false)}
                        className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Create Exam
                    </button>
                </div>

                {/* Enhanced Filters Section */}
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Filter Exams</h3>
                        <p className="text-sm text-gray-600">Use filters to find specific exams</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Stream filter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Stream</label>
                            <select 
                                value={formData.stream}
                                onChange={handleStreamChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            >
                                <option value="">All Streams</option>
                                <option value="NEET">NEET</option>
                                <option value="JEE">JEE</option>
                                <option value="MHT-CET">MHT-CET</option>
                            </select>
                        </div>

                        {/* Exam Type filter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Exam Type</label>
                            <select 
                                value={formData.examAvailability}
                                onChange={(e) => setFormData({...formData, examAvailability: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            >
                                <option value="">All Types</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="practice">Practice</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <select 
                                value={formData.subject}
                                onChange={handleSubjectChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!formData.stream}
                            >
                                <option value="">All Subjects</option>
                                {collegeData?.allocatedSubjects?.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Standard</label>
                            <select 
                                value={formData.standard}
                                onChange={handleStandardChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!formData.subject}
                            >
                                <option value="">All Standards</option>
                                <option value="11">11th</option>
                                <option value="12">12th</option>
                            </select>
                        </div>

                        {formData.stream && !['MHT-CET', 'NEET', 'JEE'].includes(formData.stream) && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Section</label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                >
                                    <option value="">All Sections</option>
                                    <option value="1">Section A</option>
                                    <option value="2">Section B</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Clear Filters Button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setFormData({stream: '', subject: '', standard: '', section: ''})}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Clear Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="mt-8 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {exams.map((exam, index) => (
                                            <React.Fragment key={exam._id}>
                                                <tr className={`hover:bg-blue-50 transition-colors duration-150 ${
                                                    expandedExamId === exam._id ? 'bg-blue-25 border-l-4 border-blue-500' : ''
                                                }`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                                    <span className="text-white font-semibold text-sm">
                                                                        {exam.examName.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-gray-900">{exam.examName}</span>
                                                                    {exam.examAvailability === 'scheduled' && exam.startTime && (
                                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                            {new Date(exam.startTime).toLocaleString('en-US', {
                                                                                day: 'numeric',
                                                                                month: 'short',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                        exam.examAvailability === 'scheduled' 
                                                                        ? 'bg-purple-100 text-purple-800' 
                                                                        : 'bg-teal-100 text-teal-800'
                                                                    }`}>
                                                                        {exam.examAvailability}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Created {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Recently'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {exam.examSubject?.map((subject, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                    {subject}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                            {exam.stream}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            exam.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                            exam.status === 'published' ? 'bg-green-100 text-green-800' :
                                                            exam.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                            exam.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                                exam.status === 'draft' ? 'bg-yellow-400' :
                                                                exam.status === 'published' ? 'bg-green-400' :
                                                                exam.status === 'scheduled' ? 'bg-blue-400' :
                                                                exam.status === 'completed' ? 'bg-gray-400' :
                                                                'bg-red-400'
                                                            }`}></div>
                                                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => toggleExamDetails(exam._id)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                        >
                                                            {expandedExamId === exam._id ? (
                                                                <>
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                    </svg>
                                                                    Hide Details
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                    View Details
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedExamId === exam._id && (
                                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                                        <td colSpan="5" className="px-6 py-6">
                                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {/* Basic Details Card */}
                                                                    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                                                        <div className="flex items-center mb-3">
                                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                            </div>
                                                                            <h5 className="font-medium text-gray-900">Basic Details</h5>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Standard</span>
                                                                                <span className="text-sm font-medium text-gray-900">{exam.standard || 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Section</span>
                                                                                <span className="text-sm font-medium text-gray-900">{exam.section || 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Type</span>
                                                                                <span className="text-sm font-medium text-gray-900 capitalize">{exam.examAvailability || 'N/A'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Exam Settings Card */}
                                                                    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                                                        <div className="flex items-center mb-3">
                                                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <h5 className="font-medium text-gray-900">Exam Settings</h5>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Duration</span>
                                                                                <span className="text-sm font-medium text-gray-900">{exam.examDurationMinutes || 0} min</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Total Marks</span>
                                                                                <span className="text-sm font-medium text-gray-900">{exam.totalMarks || 0}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-600">Passing Marks</span>
                                                                                <span className="text-sm font-medium text-gray-900">{exam.passingMarks || 0}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Schedule Card */}
                                                                    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                                                        <div className="flex items-center mb-3">
                                                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                                    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                                                        <div className="flex items-center mb-3">
                                                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                                                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                            <div className="flex items-center">
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span>
                                    {' '}-{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-medium">{pagination.total}</span>
                                    {' '}results
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}