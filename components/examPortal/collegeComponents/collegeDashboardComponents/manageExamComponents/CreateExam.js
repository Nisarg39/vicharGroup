"use client"
import { useState } from 'react';
import { createExam } from '../../../../../server_actions/actions/examController/collegeActions';
import ExamList from './ExamList';
import { toast } from 'react-hot-toast';

export default function CreateExam({ onBack, collegeData }) {
        const [formData, setFormData] = useState({
        examName: '',
        examAvailability: '',
        examType: '',
        examInstructions: '',
        examDate: '',
        examTime: '',
        stream: '',
        examSubject: [], // Multi-select array for subjects
        standard: '',
        section: '',
        startTime: '',
        endTime: '',
        examDurationMinutes: '',
        status: {
            type: String,
            required: true,
            enum: ["draft", "in progress", "completed", "cancelled", "scheduled"],
            default: "draft"
        },
        totalMarks: 0,
        passingMarks: 0,
        negativeMarks: 0,
        questionShuffle: false,
        reattempt: 0,
        examGroup: null,
        collegeId: collegeData._id
    });

    const handleExamDetailsChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        
        if (e.target.name === 'examAvailability' && value === 'practice') {
            setFormData({
                ...formData,
                [e.target.name]: value,
                startTime: '',
                endTime: ''
            });
        } else if (e.target.name === 'stream') {
            setFormData({
                ...formData,
                stream: value,
                examSubject: [], // Clear subjects when stream changes
                standard: '',
                section: ''
            });
        } else if (e.target.name === 'standard') {
            setFormData({
                ...formData,
                standard: value,
                section: ''
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: value
            });
        }
    };

    const handleSubjectChange = (subject) => {
        setFormData(prev => ({
            ...prev,
            examSubject: prev.examSubject.includes(subject)
                ? prev.examSubject.filter(s => s !== subject)
                : [...prev.examSubject, subject]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate that at least one subject is selected
        if (formData.examSubject.length === 0) {

            toast.error("Please select at least one subject for the exam.");
            return;
        }
        
        // Create a clean data object with only the required fields
        const cleanExamData = {
            examName: formData.examName,
            examAvailability: formData.examAvailability,
            examType: formData.examType,
            examInstructions: formData.examInstructions,
            stream: formData.stream,
            examSubject: formData.examSubject, // Use the multi-select subjects array
            standard: formData.standard,
            section: formData.section,
            startTime: formData.examAvailability === 'scheduled' ? new Date(formData.startTime).toISOString() : null,
            endTime: formData.examAvailability === 'scheduled' ? new Date(formData.endTime).toISOString() : null,
            examDurationMinutes: formData.examDurationMinutes,
            status: "draft",
            totalMarks: formData.totalMarks || 0,
            passingMarks: formData.passingMarks || 0,
            negativeMarks: formData.negativeMarks || 0,
            questionShuffle: formData.questionShuffle || false,
            reattempt: formData.reattempt || 0
        };

        try {
            const response = await createExam(cleanExamData, collegeData._id);
            
            if (response.success) {


                toast.success("Exam created successfully!");
            } else {

                toast.error(response.message);
            }
        } catch (error) {

            toast.error("Error creating exam. Please try again.");
            console.error("Create exam error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Create New Exam
                            </h1>
                            <p className="text-gray-600 mt-1">Design and configure your examination</p>
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Exam Details Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Basic Exam Details</h2>
                                    <p className="text-blue-100 mt-1">Configure the fundamental exam settings</p>
                                </div>
                                <button 
                                    type="submit"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Exam
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Exam Name */}
                            <div className="space-y-2">
                                <label htmlFor="examName" className="block text-sm font-semibold text-gray-700">
                                    Exam Name
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="examName"
                                        type="text"
                                        name="examName"
                                        value={formData.examName}
                                        onChange={handleExamDetailsChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                        placeholder="Enter exam name"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Exam Availability */}
                            <div className="space-y-2">
                                <label htmlFor="examAvailability" className="block text-sm font-semibold text-gray-700">
                                    Exam Type
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="examAvailability"
                                        name="examAvailability"
                                        value={formData.examAvailability}
                                        onChange={handleExamDetailsChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                                        required
                                    >
                                        <option value="">Select Exam Type</option>
                                        <option value="scheduled">📅 Scheduled</option>
                                        <option value="practice">🎯 Practice</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Conditional DateTime Fields */}
                            {formData.examAvailability !== 'practice' && (
                                <>
                                    <div className="space-y-2">
                                        <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700">
                                            Start Date & Time
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            id="startTime"
                                            type="datetime-local"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleExamDetailsChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                            required={formData.examAvailability === 'scheduled'}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700">
                                            End Date & Time
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            id="endTime"
                                            type="datetime-local"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleExamDetailsChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                            required={formData.examAvailability === 'scheduled'}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col">
                                <label htmlFor="examDurationMinutes" className="text-sm font-medium text-gray-700 mb-1">
                                    Duration (in minutes)
                                </label>
                                <input
                                    id="examDurationMinutes"
                                    type="number"
                                    name="examDurationMinutes"
                                    value={formData.examDurationMinutes}
                                    onChange={handleExamDetailsChange}
                                    className="w-full border border-gray-200 rounded-lg p-2"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="stream" className="text-sm font-medium text-gray-700 mb-1">
                                    Stream
                                </label>
                                <select 
                                    id="stream"
                                    name="stream"
                                    value={formData.stream}
                                    onChange={handleExamDetailsChange}
                                    className="w-full border border-gray-200 rounded-lg p-2"
                                >
                                    <option value="">Select Stream</option>
                                    <option value="NEET">NEET</option>
                                    <option value="JEE">JEE</option>
                                    <option value="MHT-CET">MHT-CET</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">
                                    Subjects
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    {!formData.stream ? (
                                        <p className="text-sm text-gray-500 italic">Please select a stream first</p>
                                    ) : collegeData?.allocatedSubjects?.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {collegeData.allocatedSubjects.map((subject) => (
                                                <label key={subject} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.examSubject.includes(subject)}
                                                        onChange={() => handleSubjectChange(subject)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">{subject}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No subjects allocated to this college</p>
                                    )}
                                    {formData.examSubject.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-600">
                                                Selected: <span className="font-medium">{formData.examSubject.join(', ')}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="standard" className="text-sm font-medium text-gray-700 mb-1">
                                    Standard
                                </label>
                                <select 
                                    id="standard"
                                    name="standard"
                                    value={formData.standard}
                                    onChange={handleExamDetailsChange}
                                    className="w-full border border-gray-200 rounded-lg p-2"
                                    disabled={formData.examSubject.length === 0}
                                >
                                    <option value="">Select Standard</option>
                                    <option value="11">11th</option>
                                    <option value="12">12th</option>
                                </select>
                            </div>

                            {formData.stream === 'JEE' && (
                                <div className="flex flex-col">
                                    <label htmlFor="section" className="text-sm font-medium text-gray-700 mb-1">
                                        Section
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        id="section"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleExamDetailsChange}
                                        className="w-full border border-gray-200 rounded-lg p-2"
                                        required={formData.stream === 'JEE'}
                                    >
                                        <option value="">Select Section</option>
                                        <option value="Section A">Section A</option>
                                        <option value="Section B">Section B</option>
                                    </select>
                                </div>
                            )}
                        </div> {/* Closes grid grid-cols-1 lg:grid-cols-2 gap-8 */}
                    </div> {/* Closes p-8 */}
                </div> {/* Closes bg-white rounded-2xl */}
            </form>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6 w-full">
                <ExamList collegeData={collegeData} />
            </div>
        </div>
    </div>
    );
}