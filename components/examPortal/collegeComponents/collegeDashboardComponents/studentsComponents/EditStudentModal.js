import { useState } from 'react'

export default function EditStudentModal({ student, onClose, onSave, collegeData }) {
    const [formData, setFormData] = useState({
        class: student.class,
        allocatedSubjects: student.allocatedSubjects || [],
        requestStatus: student.requestStatus || 'pending'
    })

    const handleSubjectChange = (subject) => {
        setFormData(prev => ({
            ...prev,
            allocatedSubjects: prev.allocatedSubjects.includes(subject)
                ? prev.allocatedSubjects.filter(s => s !== subject)
                : [...prev.allocatedSubjects, subject]
        }))
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Student Details</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <input
                                type="text"
                                value={formData.class}
                                onChange={(e) => setFormData(prev => ({...prev, class: e.target.value}))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Subjects</label>
                            <div className="space-y-2">
                                {collegeData.allocatedSubjects.map((subject) => (
                                    <label key={subject} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.allocatedSubjects.includes(subject)}
                                            onChange={() => handleSubjectChange(subject)}
                                            className="rounded border-gray-300"
                                        />
                                        <span>{subject}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Request Status</label>
                            <select
                                value={formData.requestStatus}
                                onChange={(e) => setFormData(prev => ({...prev, requestStatus: e.target.value}))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}