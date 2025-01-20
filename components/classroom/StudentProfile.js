"use client"
import { useSelector } from "react-redux"
export default function StudentProfile(){
    const student = useSelector(state => state.login.studentDetails)
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white">
                                <img 
                                    src="https://cdn-icons-gif.flaticon.com/12146/12146129.gif" 
                                    alt="Student avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-4xl font-bold text-white text-center">{student.name || 'John Doe'}</h1>
                            <p className="text-blue-100 text-center mt-2">{student.email || 'john.doe@example.com'}</p>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Student Number</span>
                                        <span className="font-medium">{student.phone || '+1 234-567-8900'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Department</span>
                                        <span className="font-medium">Computer Science</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Year Level</span>
                                        <span className="font-medium">3rd Year</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">GPA</span>
                                        <span className="font-medium">3.8</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Status</span>
                                        <span className="font-medium">Full-time</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Semester</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Credits Enrolled</span>
                                        <span className="font-medium">15</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Courses</span>
                                        <span className="font-medium">5</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Academic Standing</span>
                                        <span className="font-medium">Good</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}