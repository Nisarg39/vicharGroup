import { useState } from 'react';
import { 
    PlusIcon, 
    EyeIcon, 
    PencilIcon, 
    TrashIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import CreateExam from './manageExamComponents/CreateExam';

export default function ManageExams({collegeData, examDetails}) {
    const [currentView, setCurrentView] = useState('dashboard');

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
            title: 'Manage All Exams',
            description: 'Set up a new exam with questions and settings',
            icon: PlusIcon,
            color: 'bg-blue-500',
            action: () => handleCreateExam()
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

                {/* Recent Exams Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Recent Exams</h2>
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/50 p-6">
                        {recentExams.length === 0 && (
                            <p className="text-gray-500">No recent exams found.</p>
                        )}
                        {recentExams.length > 0 && (
                            <ul className="divide-y divide-gray-100">
                                {recentExams.map((exam) => (
                                    <li key={exam.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">{exam.title}</p>
                                            <p className="text-xs text-gray-500">{exam.date} &middot; {exam.status}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{exam.students} students</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.title === 'Manage All Exams' ? handleCreateExam : action.action}
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