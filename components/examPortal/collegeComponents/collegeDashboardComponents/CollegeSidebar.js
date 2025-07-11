import { useState } from 'react'
import {
    ChartBarIcon,
    DocumentTextIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    ChartPieIcon,
    AcademicCapIcon,
    UserCircleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'

export default function CollegeSidebar({ onMenuSelect }) {
    const [activeItem, setActiveItem] = useState('overview')

    const menuItems = [
        {
            id: 'overview',
            label: 'Overview',
            icon: ChartBarIcon,
            path: '/college/overview'
        },
        {
            id: 'exams',
            label: 'Manage Exams',
            icon: DocumentTextIcon,
            path: '/college/exams'
        },
        {
            id: 'students',
            label: 'Students',
            icon: UsersIcon,
            path: '/college/students'
        },
        {
            id: 'teachers',
            label: 'Teachers',
            icon: UserGroupIcon,
            path: '/college/teachers'
        },
        {
            id: 'results',
            label: 'Results',
            icon: ClipboardDocumentListIcon,
            path: '/college/results'
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: ChartPieIcon,
            path: '/college/reports'
        }
    ]

    const handleItemClick = (itemId) => {
        setActiveItem(itemId)
        onMenuSelect(itemId) // Call the parent callback with selected menu item
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">College Portal</h2>
                        <p className="text-sm text-gray-500">Admin Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const IconComponent = item.icon
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleItemClick(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        activeItem === item.id
                                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <button 
                    onClick={() => handleItemClick('profile')}
                    className="w-full"
                >
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-800">College Admin</p>
                            <p className="text-xs text-gray-500">admin@college.edu</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}