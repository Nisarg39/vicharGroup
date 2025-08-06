import { useState } from 'react';
import { 
    FunnelIcon, 
    XMarkIcon,
    ChevronDownIcon 
} from '@heroicons/react/24/outline';

export default function ExamFilters({ onFilterChange, examDetails = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all', // active, inactive, all
        examType: 'all', // scheduled, practice, all
        examStatus: 'all', // completed, incomplete, in_progress, draft, all
        class: 'all', // specific class or all
        stream: 'all' // specific stream or all
    });

    // Get unique classes and streams from examDetails
    const uniqueClasses = [...new Set(examDetails.map(exam => exam.standard).filter(Boolean))];
    const uniqueStreams = [...new Set(examDetails.map(exam => exam.stream).filter(Boolean))];

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearAllFilters = () => {
        const clearedFilters = {
            status: 'all',
            examType: 'all', 
            examStatus: 'all',
            class: 'all',
            stream: 'all'
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value => value !== 'all').length;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FunnelIcon className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900">Filter Exams</h3>
                    {getActiveFiltersCount() > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {getActiveFiltersCount()} active
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {getActiveFiltersCount() > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            <span>Clear all</span>
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <span>{isOpen ? 'Hide' : 'Show'} Filters</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Active/Inactive Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Scheduled/Practice */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exam Type
                        </label>
                        <select
                            value={filters.examType}
                            onChange={(e) => handleFilterChange('examType', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Types</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="practice">Practice</option>
                        </select>
                    </div>

                    {/* Exam Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exam Status
                        </label>
                        <select
                            value={filters.examStatus}
                            onChange={(e) => handleFilterChange('examStatus', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="incomplete">Incomplete</option>
                            <option value="in_progress">In Progress</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    {/* Class Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Class
                        </label>
                        <select
                            value={filters.class}
                            onChange={(e) => handleFilterChange('class', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Classes</option>
                            {uniqueClasses.sort().map(className => (
                                <option key={className} value={className}>{className}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stream Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stream
                        </label>
                        <select
                            value={filters.stream}
                            onChange={(e) => handleFilterChange('stream', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Streams</option>
                            {uniqueStreams.sort().map(streamName => (
                                <option key={streamName} value={streamName}>{streamName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}