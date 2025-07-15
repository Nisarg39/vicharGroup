import AddCollegeTeacher from './teacherComponents.js/AddCollegeTeacher'
import CollegeTeachersList from './teacherComponents.js/CollegeTeachersList'
import React, { useState } from 'react'

export default function Teachers({collegeData}) {
    const [refreshKey, setRefreshKey] = useState(0)
    const handleTeacherAdded = () => setRefreshKey(k => k + 1)
    return (
        <div className="p-8 space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Teachers</h2>
            {/* Add Teacher Section */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add College Teacher</h3>
                <AddCollegeTeacher collegeData={collegeData} onTeacherAdded={handleTeacherAdded} />
            </div>
            {/* Teachers List Section */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">College Teachers List</h3>
                <CollegeTeachersList collegeData={collegeData} refreshKey={refreshKey} />
            </div>
        </div>
    )
}