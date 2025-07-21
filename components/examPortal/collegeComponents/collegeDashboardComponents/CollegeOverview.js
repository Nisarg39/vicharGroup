import {
    UsersIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    CalendarIcon,
    ClockIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import CollegeTeachersList from './teacherComponents.js/CollegeTeachersList';
import React, { useState } from 'react';

export default function CollegeOverview({collegeData, examDetails, teachers = []}) {
    // Calculate statistics from examDetails
    const stats = {
        totalStudents: examDetails?.reduce((total, exam) => total + (exam.students?.length || 0), 0) || 0,
        activeExams: examDetails?.filter(exam => exam.status === 'active' || exam.status === 'ongoing').length || 0,
        completedExams: examDetails?.filter(exam => exam.status === 'completed').length || 0,
        totalExams: examDetails?.length || 0
    };

    // Calculate average score (if available in exam data)
    const calculateAverageScore = () => {
        const completedExams = examDetails?.filter(exam => exam.status === 'completed' && exam.results?.length > 0);
        if (!completedExams || completedExams.length === 0) return 0;
        let totalScore = 0;
        let totalStudents = 0;
        completedExams.forEach(exam => {
            if (exam.results) {
                exam.results.forEach(result => {
                    totalScore += result.score || 0;
                    totalStudents++;
                });
            }
        });
        return totalStudents > 0 ? Math.round((totalScore / totalStudents)) : 0;
    };

    // Get recent exams for activity section
    const recentExams = examDetails?.slice(0, 5).map(exam => ({
        id: exam._id,
        name: exam.examName,
        date: exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'Not scheduled',
        status: exam.status,
        studentsCount: exam.students?.length || 0,
        duration: exam.duration || 'N/A'
    })) || [];

    // Shrink/expand state
    const [recentExamsExpanded, setRecentExamsExpanded] = useState(false);
    const [teachersExpanded, setTeachersExpanded] = useState(false);
    // Teacher count state for summary
    const [teacherCount, setTeacherCount] = useState(null);

    // Handler to get teacher count from CollegeTeachersList
    const handleTeacherCount = (count) => setTeacherCount(count);

    return (
        <main className="p-8">
            {/* College Info Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{collegeData?.collegeName || 'College Dashboard'}</h1>
                        <p className="text-gray-600 mt-1">{collegeData?.collegeEmail}</p>
                        {collegeData?.address && (
                            <p className="text-sm text-gray-500 mt-1">{collegeData.address}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">College Code</p>
                        <p className="text-lg font-semibold text-gray-800">{collegeData?.collegeCode || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-2xl font-semibold text-gray-800">{stats.totalStudents}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Exams</p>
                            <p className="text-2xl font-semibold text-gray-800">{stats.activeExams}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Completed Exams</p>
                            <p className="text-2xl font-semibold text-gray-800">{stats.completedExams}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Exams</p>
                            <p className="text-2xl font-semibold text-gray-800">{stats.totalExams}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Exams - shrink/expand */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Exams</h2>
                    <button
                        onClick={() => setRecentExamsExpanded((prev) => !prev)}
                        className="flex items-center px-3 py-1 rounded-lg bg-white/80 hover:bg-gray-100 shadow border border-gray-200 transition-all"
                        aria-label={recentExamsExpanded ? 'Shrink' : 'Expand'}
                    >
                        {recentExamsExpanded ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                        ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                        )}
                        <span className="ml-2 text-sm text-gray-600">{recentExamsExpanded ? 'Shrink' : 'Expand'}</span>
                    </button>
                </div>
                <div className="p-6">
                    {recentExams.length === 0 ? (
                        <div className="text-center py-8">
                            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No exams created yet</p>
                            <p className="text-sm text-gray-400 mt-1">Create your first exam to get started</p>
                        </div>
                    ) : !recentExamsExpanded ? (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                            <div>
                                <h3 className="font-medium text-gray-800">{recentExams[0].name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{recentExams[0].date}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <UsersIcon className="w-4 h-4" />
                                        <span>{recentExams[0].studentsCount} students</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{recentExams[0].duration} min</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">+{recentExams.length - 1} more</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentExams.map((exam) => (
                                <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">{exam.name}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    <span>{exam.date}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <UsersIcon className="w-4 h-4" />
                                                    <span>{exam.studentsCount} students</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span>{exam.duration} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            exam.status === 'active' || exam.status === 'ongoing' 
                                                ? 'bg-green-100 text-green-800' 
                                                : exam.status === 'completed'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {exam.status?.charAt(0).toUpperCase() + exam.status?.slice(1) || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* College Teachers List - shrink/expand */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Teachers</h2>
                    <button
                        onClick={() => setTeachersExpanded((prev) => !prev)}
                        className="flex items-center px-3 py-1 rounded-lg bg-white/80 hover:bg-gray-100 shadow border border-gray-200 transition-all"
                        aria-label={teachersExpanded ? 'Shrink' : 'Expand'}
                    >
                        {teachersExpanded ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                        ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                        )}
                        <span className="ml-2 text-sm text-gray-600">{teachersExpanded ? 'Shrink' : 'Expand'}</span>
                    </button>
                </div>
                <div className="p-6">
                    {!teachersExpanded ? (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <UsersIcon className="w-6 h-6 text-blue-600" />
                                <span className="font-medium text-gray-800">{teacherCount !== null ? `${teacherCount} teachers` : 'Teachers'}</span>
                            </div>
                            <span className="text-xs text-gray-400">Expand to view all teachers</span>
                        </div>
                    ) : (
                        <CollegeTeachersList collegeData={collegeData} refreshKey={0} noOuterMargin={true} onCount={handleTeacherCount} />
                    )}
                </div>
            </div>
        </main>
    );
}