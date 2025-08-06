import { useState, useMemo } from 'react';
import { 
    EyeIcon, 
    PencilIcon, 
    TrashIcon,
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ExamFilters from './ExamFilters';

export default function ExamListView({ examDetails = [], onBack, onEditExam, onDeleteExam }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        examType: 'all', 
        examStatus: 'all',
        class: 'all',
        stream: 'all'
    });

    // Filter and search logic
    const filteredExams = useMemo(() => {
        let filtered = examDetails || [];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(exam => 
                exam.examName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exam.examSubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exam.stream?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exam.standard?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter (active/inactive)
        if (filters.status !== 'all') {
            filtered = filtered.filter(exam => exam.status === filters.status);
        }

        // Apply exam type filter (scheduled/practice) 
        if (filters.examType !== 'all') {
            filtered = filtered.filter(exam => exam.examAvailability === filters.examType);
        }

        // Apply exam status filter (completed/incomplete/in_progress/draft)
        if (filters.examStatus !== 'all') {
            filtered = filtered.filter(exam => exam.examStatus === filters.examStatus);
        }

        // Apply class filter
        if (filters.class !== 'all') {
            filtered = filtered.filter(exam => exam.standard === filters.class);
        }

        // Apply stream filter
        if (filters.stream !== 'all') {
            filtered = filtered.filter(exam => exam.stream === filters.stream);
        }

        return filtered;
    }, [examDetails, searchTerm, filters]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'inactive':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusBadge = (examStatus) => {
        const statusConfig = {
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
            incomplete: { bg: 'bg-red-100', text: 'text-red-800', label: 'Incomplete' },
            in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' }
        };

        const config = statusConfig[examStatus] || statusConfig.draft;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not scheduled';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={onBack}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 flex items-center"
                        >
                            ← Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">All Exams</h1>
                        <p className="text-gray-600">Manage and filter your college examinations</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Exams</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredExams.length}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search exams by name, subject, stream, or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Filters */}
                <ExamFilters 
                    onFilterChange={setFilters} 
                    examDetails={examDetails}
                />

                {/* Exams List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {filteredExams.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No exams found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Exam Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Class & Stream
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Schedule
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
                                    {filteredExams.map((exam) => (
                                        <tr key={exam._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {exam.examName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {exam.examSubject}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {exam.examAvailability === 'practice' ? 'Practice Exam' : 'Scheduled Exam'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    Class {exam.standard}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {exam.stream}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                    {formatDate(exam.examDate)}
                                                </div>
                                                {exam.examTime && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <ClockIcon className="h-4 w-4 mr-1" />
                                                        {exam.examTime}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(exam.status)}
                                                    <span className="text-sm text-gray-900 capitalize">
                                                        {exam.status}
                                                    </span>
                                                </div>
                                                <div className="mt-1">
                                                    {getStatusBadge(exam.examStatus)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <UsersIcon className="h-4 w-4 mr-1" />
                                                    {exam.students?.length || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onEditExam && onEditExam(exam)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteExam && onDeleteExam(exam._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}