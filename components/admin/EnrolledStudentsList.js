import { useEffect, useState, useRef } from 'react';
import { fetchAllStudents, showProducts, assignProduct, searchStudent } from '../../server_actions/actions/adminActions';
import LoadingSpinner from '../common/LoadingSpinner';

export default function EnrolledStudentsList() {
    const [students, setStudents] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);


    async function fetchAllStudentsDetails(page, isSearch = false, query = '') {
        try {
            if (isSearch) {
                setSearchLoading(true);
            } else {
                setLoading(true);
            }
            
            let data;
            if (isSearch && query.trim()) {
                data = await searchStudent({ searchTerm: query, page: page });
            } else {
                data = await fetchAllStudents(page);
            }
            
            if (!data || !data.success) {
                setStudents({});
                setTotalPages(0);
                setTotalCount(0);
            } else {
                setStudents(data.students);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                setTotalCount(data.totalCount || Object.keys(data.students).length);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents({});
            setTotalPages(0);
            setTotalCount(0);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    }

    async function fetchAllProducts() {
        const response = await showProducts();
        setProducts(response.products);
    }

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const newTimeout = setTimeout(async () => {
            if (query.trim()) {
                setIsSearching(true);
                setCurrentPage(1);
                await fetchAllStudentsDetails(1, true, query);
            } else {
                setIsSearching(false);
                setCurrentPage(1);
                await fetchAllStudentsDetails(1, false);
            }
        }, 500);
        
        setSearchTimeout(newTimeout);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        setCurrentPage(1);
        fetchAllStudentsDetails(1, false);
    };

    useEffect(() => {
        fetchAllStudentsDetails(1);
        fetchAllProducts();
    }, []);

    useEffect(() => {
        if (isSearching && searchTerm.trim()) {
            fetchAllStudentsDetails(currentPage, true, searchTerm);
        } else {
            fetchAllStudentsDetails(currentPage, false);
        }
    }, [currentPage]);

    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleProductAssign = async (studentId, product) => {
        // Handle product assignment logic here
        // console.log(`Assigning ${product} to student ${studentId}`);
        const data = {
            amountPaid: 0,
            initialDiscountAmount: 0,
            couponDiscount: 0,
            paymentStatus: "success",
            productId: product,
            studentId: studentId, 
            razorpay_order_id: "dummy_order_id_by_admin",
            razorpay_payment_id: "dummy_payment_id_by_admin",
            razorpay_signature: "dummy_signature_by_admin"
          }
          const response = await assignProduct(data);
          if(response.success){
            alert(response.message);
            if (isSearching) {
                fetchAllStudentsDetails(currentPage, true, searchTerm);
            } else {
                fetchAllStudentsDetails(currentPage);
            }
          }else{
            alert(response.message);
          }
    };

    return(
        <div className="w-full min-h-screen py-2 xs:py-6 md:py-8 ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-4 gap-4">
                <h1 className="text-xl font-bold text-gray-800">Enrolled Students List</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or phone number..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchLoading && (
                            <div className="absolute right-10 top-2.5">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        {!searchTerm && (
                            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="text-gray-600 bg-gray-50 px-4 py-2 rounded-lg font-medium">
                        {isSearching ? `Search Results: ${totalCount}` : `Total Students: ${totalCount}`}
                    </div>
                    {isSearching && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Searching for: "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
            
            {Object.keys(students).length === 0 && !loading && (
                <div className="px-4">
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-600 text-lg">
                            {isSearching 
                                ? `No students found for "${searchTerm}"` 
                                : "No students have been enrolled yet"
                            }
                        </p>
                        {isSearching && (
                            <button
                                onClick={clearSearch}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            ) : Object.keys(students).length > 0 && (
                <>
                    <div className="px-4 mb-4 text-sm text-gray-600">
                        {isSearching ? (
                            <>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} search results</>
                        ) : (
                            <>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} students</>
                        )}
                    </div>
                    <div className="overflow-x-auto shadow-lg rounded-lg mx-4">
                        <table className="min-w-full bg-white border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Sr No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Student Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Phone Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Assign Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.values(students).map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200" style={{ zIndex: Object.values(students).length - index }}>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">{(currentPage - 1) * 10 + index + 1}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">+91 {student.phone}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">{student.email}</td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${student.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {student.isVerified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap relative" style={{ zIndex: Object.values(students).length - index + 100 }}>
                                            <div className="relative">
                                                <SearchableDropdown
                                                    products={products}
                                                    onSelect={(productId) => handleProductAssign(student._id, productId)}
                                                    placeholder="Select Product"
                                                />
                                            </div>
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
                    {totalPages > 1 && (
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
                    )}
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
function StudentDetails({ student, onClose }) {
    // console.log(student);
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

function SearchableDropdown({ products, onSelect, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const dropdownRef = useRef(null);

    const filteredProducts = searchTerm.trim() 
        ? products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : products;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (product) => {
        setSelectedProduct(product);
        setIsOpen(false);
        setSearchTerm('');
        onSelect(product._id);
        
        // Reset after a short delay for better UX
        setTimeout(() => {
            setSelectedProduct(null);
        }, 2000);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors ${
                    selectedProduct ? 'text-green-700 bg-green-50 border-green-300' : 'text-gray-700'
                } ${isOpen ? 'z-[1]' : 'z-[20]'}`}
            >
                <div className="flex items-center justify-between">
                    <span className="truncate">
                        {selectedProduct ? `✓ ${selectedProduct.name}` : placeholder}
                    </span>
                    <svg
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-[9999] right-0 min-w-[350px] mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-80 overflow-hidden backdrop-blur-sm">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto bg-white">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div
                                    key={product._id}
                                    onClick={() => handleSelect(product)}
                                    className="block w-full px-4 py-3 text-left text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer bg-white"
                                >
                                    <div className="space-y-1">
                                        <div className="font-medium text-gray-900 leading-tight break-words">
                                            {product.name}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">
                                            {product.type}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm bg-white">
                                No products found for "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}