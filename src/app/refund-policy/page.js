const RefundPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-12 sm:py-20 mt-6 sm:mt-12 max-w-5xl bg-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 sm:mb-14 text-center text-gray-900">Refund Policy</h1>
            <div className="space-y-8 sm:space-y-10">
                {[
                    { title: "Refund Eligibility", content: "Refunds are processed through Razorpay, our payment processing partner. We will honor refund requests that meet our eligibility criteria. Refunds can be requested within 7 days of the purchase date for selective products only. The refund amount will be credited back to the original payment method used for the transaction." },
                    { title: "Refund Process", content: "To initiate a refund, please contact our customer support team with your order details and reason for the refund. Once approved, refunds will be processed within 5-7 business days. The actual time for the refund to reflect in your account may vary depending on your bank or payment provider's processing time." },
                    { title: "Payment Methods", content: "Refunds will be processed to the original payment method used for the purchase. For credit/debit card payments, refunds typically take 5-7 business days. For UPI transactions, refunds are usually processed within 3-5 business days. For net banking transactions, the refund timeline depends on your bank's processing time." },
                    { title: "Non-Refundable Items", content: "Certain services or products may be marked as non-refundable. This will be clearly indicated at the time of purchase. Additionally, if the service has already been consumed or delivered, it may not be eligible for a refund. We reserve the right to reject refund requests that don't meet our eligibility criteria." },
                    { title: "Partial Refunds", content: "In some cases, we may issue partial refunds. This could happen if only part of an order is eligible for a refund or if there are usage charges that need to be deducted. The partial refund amount will be clearly communicated to you before processing." },
                    { title: "Cancellation Policy", content: "Orders can be cancelled before they are processed or the service is delivered. Once an order is cancelled, the refund will be initiated automatically. Cancellation requests after service delivery will be treated as refund requests and will be subject to our regular refund policy." },
                    { title: "Failed Transactions", content: "For failed transactions where money was deducted but the service was not provided, refunds will be processed automatically within 24-48 hours. If you don't receive the refund within this timeframe, please contact our customer support with your transaction details." },
                    { title: "Contact Information", content: "For any queries regarding refunds or to initiate a refund request, please contact our customer support team at support@yourdomain.com. Please include your order number and transaction details in your communication for faster processing." }
                ].map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 sm:pb-8 last:border-b-0 last:pb-0 hover:bg-gray-50 transition-colors duration-300 rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#1d77bc]">{index + 1}. {item.title}</h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RefundPolicy