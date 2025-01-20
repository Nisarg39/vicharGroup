"use client"
import { useState, useEffect } from "react";
import { fetchAllStudents } from "../../server_actions/actions/adminActions";
import LoadingSpinner from "../common/LoadingSpinner";
export default function EnrolledStudentsList() {

    const [students, setStudents] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);


    async function fetchAllStudentsDetails(page) {
        setLoading(true);
        const students = await fetchAllStudents(page);
        setStudents(students.students);
        setTotalPages(students.totalPages);
        setCurrentPage(students.currentPage);
        setLoading(false);
    }

    useEffect(() => {
        fetchAllStudentsDetails(1);
    }, []);

    const handlePageChange = (page) => {
        fetchAllStudentsDetails(page);
    };

    return(
        <div className="w-full min-h-screen py-2 xs:py-6 md:py-8 ">
            <h1 className="text-xl font-bold mb-4 text-gray-800 px-4">Enrolled Students List</h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto shadow-lg rounded-lg mx-4">
                        <table className="min-w-full bg-white border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Sr No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Student Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Phone Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.values(students).map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">{(currentPage - 1) * 10 + index + 1}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">+91 {student.phone}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">{student.email}</td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${student.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {student.isVerified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center items-center mt-6 mb-8">
                        <nav className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                                    currentPage === 1 
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1">Previous</span>
                            </button>
                            <div className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-xs font-medium text-gray-700">
                                Page {currentPage} of {totalPages}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                                    currentPage === totalPages 
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <span className="mr-1">Next</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </>
            )}
        </div>
    )
}