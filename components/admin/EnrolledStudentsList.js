import { useEffect, useState } from 'react';
import { fetchAllStudents } from '../../server_actions/actions/adminActions';
import LoadingSpinner from '../common/LoadingSpinner';

function StudentDetails({ student, onClose }) {
    console.log(student);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2">
                    <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Name</p>
                            <p className="text-gray-800 font-medium">{student.name}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Email</p>
                            <p className="text-gray-800 font-medium break-all">{student.email}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Phone</p>
                            <p className="text-gray-800 font-medium">+91 {student.phone}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
                            <span className={`px-4 py-2 text-sm font-medium rounded-full ${student.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {student.isVerified ? 'Verified' : 'Not Verified'}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Address</p>
                            <p className="text-gray-800 font-medium">{student.address || 'Not Available'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Area</p>
                            <p className="text-gray-800 font-medium">{student.area || 'Not Available'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">City</p>
                            <p className="text-gray-800 font-medium">{student.city || 'Not Available'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">State</p>
                            <p className="text-gray-800 font-medium">{student.state || 'Not Available'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Gender</p>
                            <p className="text-gray-800 font-medium">{student.gender || 'Not Available'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Date of Birth</p>
                            <p className="text-gray-800 font-medium">{new Date(student.dob).toLocaleDateString() || 'Not Available'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Cart Items</p>
                            <div className="max-h-32 overflow-y-auto">
                                {student.cart && student.cart.length > 0 ? 
                                    student.cart.map((item, index) => (
                                        <span key={index} className="block py-1 text-gray-800">{index+1}. {item.name}</span>
                                    ))
                                    : 
                                    <p className="text-gray-500 italic">No items in cart</p>
                                }
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Purchase History</p>
                            <div className="max-h-32 overflow-y-auto">
                                {student.purchases && student.purchases.length > 0 ? 
                                    student.purchases.map((item, index) => (
                                        <span key={index} className="block py-1 text-gray-800">
                                            {index+1}. {item.product.name} - {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    ))
                                    : 
                                    <p className="text-gray-500 italic">No purchase history</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function EnrolledStudentsList() {
    const [students, setStudents] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Actions</th>
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
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                                            >
                                                More Details
                                            </button>
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
            {selectedStudent && (
                <StudentDetails 
                    student={selectedStudent} 
                    onClose={() => setSelectedStudent(null)} 
                />
            )}
        </div>
    )
}