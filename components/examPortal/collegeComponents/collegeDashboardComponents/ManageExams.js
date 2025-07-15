import { useState } from 'react';
import { 
    PlusIcon, 
    EyeIcon, 
    PencilIcon, 
    TrashIcon,
    DocumentTextIcon,
    ChartBarIcon,
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import CreateExam from './manageExamComponents/CreateExam';

export default function ManageExams({collegeData, examDetails}) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [activeTab, setActiveTab] = useState('overview');

    // Calculate exam statistics from examDetails
    const examStats = {
        totalExams: examDetails?.length || 0,
        activeExams: examDetails?.filter(exam => exam.status === 'active').length || 0,
        completedExams: examDetails?.filter(exam => exam.status === 'completed').length || 0,
        totalStudents: examDetails?.reduce((total, exam) => total + (exam.students?.length || 0), 0) || 0
    };

    // Get recent exams from examDetails with safe date handling
    const recentExams = examDetails?.slice(0, 3).map(exam => ({
        id: exam._id,
        title: exam.examName,
        date: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : 'Not scheduled',
        status: exam.status,
        students: exam.students?.length || 0
    })) || [];

    const quickActions = [
        {
            title: 'Create New Exam',
            description: 'Set up a new exam with questions and settings',
            icon: PlusIcon,
            color: 'bg-blue-500',
            action: () => handleCreateExam()
        },
        {
            title: 'View Results',
            description: 'Check exam results and analytics',
            icon: ChartBarIcon,
            color: 'bg-purple-500',
            action: () => console.log('View results')
        },
        {
            title: 'Schedule Exam',
            description: 'Set exam dates and time slots',
            icon: CalendarIcon,
            color: 'bg-orange-500',
            action: () => console.log('Schedule exam')
        }
    ];

    const handleCreateExam = () => {
        setCurrentView('createExam');
    };

    // Add this function to handle back navigation
    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
    };

    if (currentView === 'createExam') {
        return <CreateExam onBack={handleBackToDashboard} collegeData={collegeData} />;
    }

    return (
        <main className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Management</h1>
                    <p className="text-gray-600">Create, manage, and monitor your college examinations</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                                <p className="text-3xl font-bold text-gray-900">{examStats.totalExams}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Exams</p>
                                <p className="text-3xl font-bold text-green-600">{examStats.activeExams}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <ClockIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-purple-600">{examStats.completedExams}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <ChartBarIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-3xl font-bold text-orange-600">{examStats.totalStudents}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <UsersIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.title === 'Create New Exam' ? handleCreateExam : action.action}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 text-left group"
                            >
                                <div className="flex items-center mb-3">
                                    <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                                        <action.icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}