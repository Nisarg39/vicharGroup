export default function PaymentDetails({ payment, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex-shrink-0 ml-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Student Name</p>
                            <p className="text-base font-semibold text-gray-900">{payment.student?.name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Student Email</p>
                            <p className="text-base font-semibold text-gray-900">{payment.student?.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Product Name</p>
                            <p className="text-base font-semibold text-gray-900">{payment.product?.name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Product Type</p>
                            <p className="text-base font-semibold text-gray-900">{payment.product?.type}</p>
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
                            <p className="text-base font-semibold text-gray-900">{payment.razorpay_info?.razorpay_order_id}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Razorpay Payment ID</p>
                            <p className="text-base font-semibold text-gray-900">{payment.razorpay_info?.razorpay_payment_id}</p>
                        </div>
                        <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500">Razorpay Signature</p>
                            <p className="text-base font-semibold text-gray-900 break-all">{payment.razorpay_info?.razorpay_signature}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}