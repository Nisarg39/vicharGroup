import { useState } from 'react'
import StudentRequest from "./studentsComponents/StudentRequest"
import EnrolledStudents from "./studentsComponents/EnrolledStudents"

export default function Students({collegeData}) {
    const [activeTab, setActiveTab] = useState('requests')

    const tabs = [
        { id: 'requests', label: 'Student Requests', component: StudentRequest },
        { id: 'enrolled', label: 'Enrolled Students', component: EnrolledStudents }
    ]

    return (
        <main className="p-8">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Students Management</h2>
                
                {/* Badges/Tabs */}
                <div className="flex flex-wrap gap-3 mt-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${activeTab === tab.id 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 min-h-[500px]">
                {tabs.map(tab => (
                    activeTab === tab.id && (
                        <div key={tab.id} className="w-full h-full">
                            <tab.component collegeData={collegeData} />
                        </div>
                    )
                ))}
            </div>
        </main>
    );
}