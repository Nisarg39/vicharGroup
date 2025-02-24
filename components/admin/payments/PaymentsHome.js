"use client"
import { paymentDetails } from "../../../server_actions/actions/adminActions"
import { useState, useEffect } from "react"
import LoadingSpinner from "../../common/LoadingSpinner"
import Modal from "../../common/Modal"
export default function PaymentsHome(){
    const [payments, setPayments] = useState([])
    const [student, setStudent] = useState([])
    const [product, setProduct] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [paymentsPerPage] = useState(10)


    async function fetchPayments(){
        try {
            setLoading(true)
            const data = await paymentDetails( currentPage, paymentsPerPage )
            if (!data || !data.payments) {
                setPayments([])
            } else {
                setPayments(data.payments)
            }
        } catch (error) {
            alert("Error fetching payments:")
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        fetchPayments()
    }, [])

    // Get current payments
    const indexOfLastPayment = currentPage * paymentsPerPage
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
    const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment)

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    if(loading){
        return (
            <div className="mt-28 flex justify-center items-center">
                <LoadingSpinner />
            </div>
        )
    }

    if(payments.length === 0) {
        return (
            <div className="p-8 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">No payments have been recorded yet</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-white rounded-xl shadow-lg max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <div className="text-gray-600">Total Payments: {payments.length}</div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Sr.No</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Product Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount Paid</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{indexOfFirstPayment + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {payment.product.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹ {payment.amountPaid}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(payment.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-8">
                {payments.length > paymentsPerPage && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.ceil(payments.length / paymentsPerPage) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                    currentPage === index + 1 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === Math.ceil(payments.length / paymentsPerPage)}
                            className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
