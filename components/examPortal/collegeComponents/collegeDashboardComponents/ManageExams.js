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

export default function ManageExams({collegeData}) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data - replace with actual data from your backend
    const examStats = {
        totalExams: 12,
        activeExams: 5,
        completedExams: 7,
        totalStudents: 245
    };

    const recentExams = [
        { id: 1, title: 'Mathematics Final Exam', date: '2024-01-15', status: 'Active', students: 45 },
        { id: 2, title: 'Physics Mid-term', date: '2024-01-10', status: 'Completed', students: 38 },
        { id: 3, title: 'Chemistry Quiz', date: '2024-01-20', status: 'Scheduled', students: 52 },
    ];

    const quickActions = [
        {
            title: 'Create New Exam',
            description: 'Set up a new exam with questions and settings',
            icon: PlusIcon,
            color: 'bg-blue-500',
            action: () => console.log('Create exam')
        },
        {
            title: 'Question Bank',
            description: 'Manage and organize exam questions',
            icon: DocumentTextIcon,
            color: 'bg-green-500',
            action: () => console.log('Question bank')
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                {/* Recent Exams Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">Recent Exams</h2>
                            <button 
                                onClick={handleCreateExam}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Create Exam
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Exam Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentExams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{exam.date}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                exam.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                exam.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {exam.students}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-900 p-1 rounded">
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900 p-1 rounded">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Additional Actions Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Settings</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                                <div className="font-medium text-gray-900">Default Exam Duration</div>
                                <div className="text-sm text-gray-600">Set default time limits for exams</div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                                <div className="font-medium text-gray-900">Grading System</div>
                                <div className="text-sm text-gray-600">Configure marking and grading rules</div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                                <div className="font-medium text-gray-900">Anti-Cheating Settings</div>
                                <div className="text-sm text-gray-600">Enable proctoring and security features</div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports & Analytics</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                                <div className="font-medium text-gray-900">Performance Analytics</div>
                                <div className="text-sm text-gray-600">View detailed exam performance reports</div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                                <div className="font-medium text-gray-900">Export Results</div>
                                <div className="text-sm text-gray-600">Download exam results in various formats</div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                                <div className="font-medium text-gray-900">Student Progress</div>
                                <div className="text-sm text-gray-600">Track individual student performance</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}