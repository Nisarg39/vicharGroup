"use client"
import { useState, useEffect } from "react";
import { fetchAllStudents } from "../../server_actions/actions/adminActions";
export default function EnrolledStudentsList() {

    const [students, setStudents] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    async function fetchAllStudentsDetails(page) {
        const students = await fetchAllStudents(page);
        setStudents(students.students);
        setTotalPages(students.totalPages);
        setCurrentPage(students.currentPage);
    }

    useEffect(() => {
        fetchAllStudentsDetails(1);
    }, []);
    return(
        <div className="w-full min-h-screen py-2 sm:py-6 md:py-8 ">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 px-4">Enrolled Students List</h1>
            <div className="overflow-x-auto shadow-lg rounded-lg mx-4">
                <table className="min-w-full bg-white border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b">Student Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b">Phone Number</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.values(students).map((student, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-5 whitespace-nowrap text-gray-700">{student.name}</td>
                                <td className="px-6 py-5 whitespace-nowrap text-gray-700">+91 {student.phone}</td>
                                <td className="px-6 py-5 whitespace-nowrap text-gray-700">{student.email}</td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${student.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {student.isVerified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}