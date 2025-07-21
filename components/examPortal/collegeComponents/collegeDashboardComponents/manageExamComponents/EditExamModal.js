"use client";
import React, { useState, useEffect } from 'react';
import { updateExam } from '../../../../../server_actions/actions/examController/collegeActions';
import { toast } from 'react-hot-toast';

export default function EditExamModal({ exam, isOpen, onClose, onExamUpdated, collegeData }) {
    const [formData, setFormData] = useState({
        examName: '',
        examSubject: [],
        stream: '',
        standard: '',
        examDate: '',
        examTime: '',
        examInstructions: '',
        examAvailability: '',
        status: '',
        passingMarks: '',
        startTime: '',
        endTime: '',
        examDurationMinutes: '',
        negativeMarks: '',
        questionShuffle: false,
        section: '',
        reattempt: '',
        examStatus: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    // Initialize form data when exam changes
    useEffect(() => {
        if (exam && isOpen) {
            setFormData({
                examName: exam.examName || '',
                examSubject: Array.isArray(exam.examSubject) ? exam.examSubject : [],
                stream: exam.stream || '',
                standard: exam.standard || '',
                examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
                examTime: exam.examTime || '',
                examInstructions: exam.examInstructions || '',
                examAvailability: exam.examAvailability || '',
                status: exam.status || '',
                passingMarks: exam.passingMarks || '',
                startTime: exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
                endTime: exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
                examDurationMinutes: exam.examDurationMinutes || '',
                negativeMarks: exam.negativeMarks || '',
                questionShuffle: exam.questionShuffle || false,
                section: exam.section || '',
                reattempt: exam.reattempt || '',
                examStatus: exam.examStatus || 'active'
            });
        }
    }, [exam, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubjectChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            examSubject: selectedOptions
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await updateExam(exam._id, formData, collegeData._id);
            
            if (response.success) {
                toast.success(response.message);
                if (onExamUpdated) {
                    onExamUpdated(response.exam);
                }
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to update exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Edit Exam</h2>
                            <p className="text-gray-600">Modify exam details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name *</label>
                                <input
                                    type="text"
                                    name="examName"
                                    value={formData.examName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stream *</label>
                                <select
                                    name="stream"
                                    value={formData.stream}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Stream</option>
                                    <option value="NEET">NEET</option>
                                    <option value="JEE">JEE</option>
                                    <option value="MHT-CET">MHT-CET</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subjects * 
                                    <span className="text-xs text-gray-500 font-normal ml-2">
                                        (Select multiple subjects for this exam)
                                    </span>
                                </label>
                                <div className="space-y-2">
                                    {/* Checkbox-style Subject Selection */}
                                    <div className="grid grid-cols-2 gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                                        {collegeData?.allocatedSubjects?.map((subject) => (
                                            <label 
                                                key={subject}
                                                className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.examSubject.includes(subject)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                examSubject: [...prev.examSubject, subject]
                                                            }));
                                                        } else {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                examSubject: prev.examSubject.filter(s => s !== subject)
                                                            }));
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{subject}</span>
                                            </label>
                                        ))}
                                    </div>
                                    
                                    {/* Selected Subjects Display */}
                                    {formData.examSubject.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Selected Subjects:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.examSubject.map((subject) => (
                                                    <span 
                                                        key={subject}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                                                    >
                                                        {subject}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    examSubject: prev.examSubject.filter(s => s !== subject)
                                                                }));
                                                            }}
                                                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-600 hover:text-blue-800"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Standard *</label>
                                <select
                                    name="standard"
                                    value={formData.standard}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Standard</option>
                                    <option value="11">11th</option>
                                    <option value="12">12th</option>
                                </select>
                            </div>

                            {formData.stream === 'JEE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                                    <select
                                    name="section"
                                    value={formData.section}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                    <option value="">Select Section</option>
                                    <option value="Section A">Section A</option>
                                    <option value="Section B">Section B</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Exam Configuration */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Exam Configuration</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Availability *</label>
                                <select
                                    name="examAvailability"
                                    value={formData.examAvailability}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Type</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="practice">Practice</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Status</label>
                                <select
                                    name="examStatus"
                                    value={formData.examStatus}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    name="examDurationMinutes"
                                    value={formData.examDurationMinutes}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Passing Marks</label>
                                <input
                                    type="number"
                                    name="passingMarks"
                                    value={formData.passingMarks}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Negative Marks</label>
                                <input
                                    type="number"
                                    name="negativeMarks"
                                    value={formData.negativeMarks}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reattempts Allowed</label>
                                <input
                                    type="number"
                                    name="reattempt"
                                    value={formData.reattempt}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timing and Other Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            {formData.examAvailability === 'practice' ? 'Additional Settings' : 'Timing & Additional Settings'}
                        </h3>
                        
                        {/* Only show timing controls for scheduled exams */}
                        {formData.examAvailability === 'scheduled' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="questionShuffle"
                                checked={formData.questionShuffle}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Shuffle Questions
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Instructions</label>
                            <textarea
                                name="examInstructions"
                                value={formData.examInstructions}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter exam instructions..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                </div>
                            ) : (
                                'Update Exam'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
