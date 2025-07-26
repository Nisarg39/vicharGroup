import { useState } from 'react'
import { data } from "../../../../../utils/examUtils/subject_Details";

export default function EditStudentModal({ student, onClose, onSave, collegeData }) {
    const [formData, setFormData] = useState({
        class: student.class,
        allocatedStreams: student.allocatedStreams || [],
        allocatedSubjects: student.allocatedSubjects || [],
        status: student.status || 'approved',
        // requestStatus removed
    })

    // Helper: Get valid subjects for the selected class and streams
    const getValidSubjects = () => {
        const streams = formData.allocatedStreams || [];
        const classYear = formData.class;
        let validSubjects = new Set();
        if (!classYear) return [];
        streams.forEach(stream => {
            const streamData = data[stream];
            if (streamData) {
                Object.keys(streamData).forEach(subject => {
                    if (streamData[subject][classYear]) {
                        validSubjects.add(subject);
                    }
                });
            }
        });
        return Array.from(validSubjects);
    };

    const handleSubjectChange = (subject) => {
        setFormData(prev => ({
            ...prev,
            allocatedSubjects: prev.allocatedSubjects.includes(subject)
                ? prev.allocatedSubjects.filter(s => s !== subject)
                : [...prev.allocatedSubjects, subject]
        }))
    }

    // Helper for stream change (checkboxes)
    const handleStreamChange = (stream) => {
        setFormData(prev => {
            const current = prev.allocatedStreams || [];
            const updated = current.includes(stream)
                ? current.filter(s => s !== stream)
                : [...current, stream];
            // After stream change, recalculate valid subjects
            const validSubjects = (() => {
                const streams = updated;
                const classYear = prev.class;
                let validSubjects = new Set();
                if (!classYear) return [];
                streams.forEach(str => {
                    const streamData = data[str];
                    if (streamData) {
                        Object.keys(streamData).forEach(subject => {
                            if (streamData[subject][classYear]) {
                                validSubjects.add(subject);
                            }
                        });
                    }
                });
                return Array.from(validSubjects);
            })();
            return {
                ...prev,
                allocatedStreams: updated,
                allocatedSubjects: validSubjects
            };
        });
    };

    // Helper for class change (single select)
    const handleClassChange = (classYear) => {
        setFormData(prev => {
            // After class change, recalculate valid subjects
            const streams = prev.allocatedStreams || [];
            let validSubjects = new Set();
            if (classYear) {
                streams.forEach(stream => {
                    const streamData = data[stream];
                    if (streamData) {
                        Object.keys(streamData).forEach(subject => {
                            if (streamData[subject][classYear]) {
                                validSubjects.add(subject);
                            }
                        });
                    }
                });
            }
            return {
                ...prev,
                class: classYear,
                allocatedSubjects: Array.from(validSubjects)
            };
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Student Details</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <select
                                value={formData.class}
                                onChange={e => handleClassChange(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">Select class</option>
                                {collegeData.allocatedClasses.map(classYear => (
                                    <option key={classYear} value={classYear}>{classYear}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Streams</label>
                            <div className="flex flex-wrap gap-2">
                                {collegeData.allocatedStreams.map(stream => (
                                    <label key={stream} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.allocatedStreams.includes(stream)}
                                            onChange={() => handleStreamChange(stream)}
                                            className="rounded border-gray-300"
                                        />
                                        <span>{stream}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Subjects</label>
                            <div className="space-y-2">
                                {getValidSubjects().map((subject) => (
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
                                {getValidSubjects().length === 0 && (
                                    <span className="text-xs text-gray-400">No valid subjects for selected class and streams.</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="appearance-none px-3 py-2 pr-8 rounded-lg border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 bg-white text-gray-800"
                            >
                                <option value="pending" className="text-yellow-700 bg-yellow-50">Pending</option>
                                <option value="approved" className="text-green-700 bg-green-50">Approved</option>
                                <option value="rejected" className="text-red-700 bg-red-50">Rejected</option>
                                <option value="retired" className="text-gray-700 bg-gray-50">Retired</option>
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