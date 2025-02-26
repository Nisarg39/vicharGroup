"use client"
import { paymentDetails } from "../../../server_actions/actions/adminActions"
import { useState, useEffect } from "react"
import LoadingSpinner from "../../common/LoadingSpinner"

function PaymentDetails({ payment, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Student Name</p>
                            <p className="text-base font-semibold text-gray-900">{payment.student.name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Student Email</p>
                            <p className="text-base font-semibold text-gray-900">{payment.student.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Product Name</p>
                            <p className="text-base font-semibold text-gray-900">{payment.product.name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Product Type</p>
                            <p className="text-base font-semibold text-gray-900">{payment.product.type}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                            <p className="text-base font-semibold text-green-600">₹ {payment.amountPaid}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Payment Date</p>
                            <p className="text-base font-semibold text-gray-900">{new Date(payment.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Razorpay Order ID</p>
                            <p className="text-base font-semibold text-gray-900">{payment.razorpay_info.razorpay_order_id}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Razorpay Payment ID</p>
                            <p className="text-base font-semibold text-gray-900">{payment.razorpay_info.razorpay_payment_id}</p>
                        </div>
                        <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Razorpay Signature</p>
                            <p className="text-base font-semibold text-gray-900 break-all">{payment.razorpay_info.razorpay_signature}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentsHome(){
    const [payments, setPayments] = useState([])
    const [student, setStudent] = useState([])
    const [product, setProduct] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [paymentsPerPage] = useState(10)
    const [selectedPayment, setSelectedPayment] = useState(null)

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

    const indexOfLastPayment = currentPage * paymentsPerPage
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
    const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment)

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
            <div className="p-8 bg-white rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 text-lg">No payments have been recorded yet</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-white rounded-2xl shadow-xl max-w-7xl mx-auto border border-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <div className="text-gray-600 bg-gray-50 px-4 py-2 rounded-lg font-medium">Total Payments: {payments.length}</div>
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
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{indexOfFirstPayment + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{payment.student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {payment.product.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹ {payment.amountPaid}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(payment.createdAt).toLocaleDateString()}</td>
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
            <div className="flex justify-center mt-8">
                {payments.length > paymentsPerPage && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.ceil(payments.length / paymentsPerPage) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    currentPage === index + 1 
                                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === Math.ceil(payments.length / paymentsPerPage)}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            {selectedPayment && (
                <PaymentDetails 
                    payment={selectedPayment} 
                    onClose={() => setSelectedPayment(null)} 
                />
            )}
        </div>
    )
}
