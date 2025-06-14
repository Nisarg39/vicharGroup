"use client"
import { paymentDetails, searchStudentPayments} from "../../../server_actions/actions/adminActions"
import { useState, useEffect } from "react"
import LoadingSpinner from "../../common/LoadingSpinner"
import PaymentDetails from "./PaymentDetails"


export default function PaymentsHome(){
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [paymentsPerPage] = useState(10)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [totalPages, setTotalPages] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    // Add these new state variables
    const [isSearching, setIsSearching] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)

    // Add debounce functionality
    const [searchTimeout, setSearchTimeout] = useState(null)

    const handleSearchChange = async(e) => {
        const query = e.target.value
        setSearchQuery(query)
        
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
        
        // Set new timeout for debouncing
        const newTimeout = setTimeout(async () => {
            if (query.trim()) {
                setIsSearching(true)
                setCurrentPage(1) // Reset to first page when searching
                await fetchPayments(true, query)
            } else {
                setIsSearching(false)
                setCurrentPage(1)
                await fetchPayments(false)
            }
        }, 500) // 500ms debounce
        
        setSearchTimeout(newTimeout)
    }

    // Replace the existing fetchPayments function with this unified one
    async function fetchPayments(isSearch = false, query = ""){
        try {
            if (isSearch) {
                setSearchLoading(true)
            } else {
                setLoading(true)
            }
            
            let data;
            if (isSearch && query.trim()) {
                // Use search function when searching
                data = await searchStudentPayments(query, currentPage, paymentsPerPage)
            } else {
                // Use regular fetch when not searching
                data = await paymentDetails(currentPage, paymentsPerPage)
            }
            
            if (!data || !data.success) {
                setPayments([])
                setTotalPages(0)
                setTotalCount(0)
            } else {
                setPayments(data.payments)
                setTotalPages(data.totalPages)
                setTotalCount(data.totalCount)
            }
        } catch (error) {
            console.error("Error fetching payments:", error)
            alert("Error fetching payments")
            setPayments([])
            setTotalPages(0)
            setTotalCount(0)
        } finally {
            setLoading(false)
            setSearchLoading(false)
        }
    }
    
    useEffect(() => {
        if (isSearching && searchQuery.trim()) {
            fetchPayments(true, searchQuery)
        } else {
            fetchPayments(false)
        }
    }, [currentPage]) // This will handle pagination for both search and regular results

    // Add cleanup useEffect
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTimeout])

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = []
        const maxVisiblePages = 5
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
            
            if (startPage > 1) {
                pageNumbers.push(1)
                if (startPage > 2) pageNumbers.push('...')
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i)
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pageNumbers.push('...')
                pageNumbers.push(totalPages)
            }
        }
        
        return pageNumbers
    }

    const clearSearch = () => {
        setSearchQuery("")
        setIsSearching(false)
        setCurrentPage(1)
        fetchPayments(false)
    }

    if(loading){
        return (
            <div className="mt-28 flex justify-center items-center">
                <LoadingSpinner />
            </div>
        )
    }

    if(payments.length === 0 && !loading) {
        return (
            <div className="p-8 bg-white rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by student name or phone..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 w-64"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 text-lg">
                        {isSearching 
                            ? `No payments found for "${searchQuery}"` 
                            : "No payments have been recorded yet"
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
        )
    }

    return (
        <div className="p-8 bg-white rounded-2xl shadow-xl max-w-7xl mx-auto border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by student name or phone..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 w-64"
                        />
                        {searchLoading && (
                            <div className="absolute right-10 top-2.5">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        {!searchQuery && (
                            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="text-gray-600 bg-gray-50 px-4 py-2 rounded-lg font-medium">
                        {isSearching ? `Search Results: ${totalCount}` : `Total Payments: ${totalCount}`}
                    </div>
                    {isSearching && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Searching for: "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
            
            {/* Pagination Info */}
            <div className="mb-4 text-sm text-gray-600">
                {isSearching ? (
                    <>Showing {((currentPage - 1) * paymentsPerPage) + 1} to {Math.min(currentPage * paymentsPerPage, totalCount)} of {totalCount} search results</>
                ) : (
                    <>Showing {((currentPage - 1) * paymentsPerPage) + 1} to {Math.min(currentPage * paymentsPerPage, totalCount)} of {totalCount} payments</>
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Sr.No</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Product Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount Paid</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment, index) => (
                            <tr key={payment._id || index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                    {((currentPage - 1) * paymentsPerPage) + index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                    {payment.student?.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {payment.product?.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {payment.product?.type || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    ₹ {payment.amountPaid}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <button
                                        onClick={() => setSelectedPayment(payment)}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-100 hover:border-blue-200"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                    >
                        Previous
                    </button>
                    
                    {getPageNumbers().map((pageNumber, index) => (
                        <button
                            key={index}
                            onClick={() => typeof pageNumber === 'number' ? paginate(pageNumber) : null}
                            disabled={pageNumber === '...'}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                pageNumber === currentPage 
                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                                : pageNumber === '...'
                                ? 'bg-white text-gray-400 cursor-default'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                    
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            {selectedPayment && (
                <PaymentDetails 
                    payment={selectedPayment} 
                    onClose={() => setSelectedPayment(null)} 
                />
            )}
        </div>
    )
}
