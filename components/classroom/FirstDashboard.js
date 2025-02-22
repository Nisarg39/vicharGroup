"use client"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Image from "next/image"

const CartCard = () => {
    const student = useSelector(state => state.login.studentDetails)
    const router = useRouter()

    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-200 h-full">
            <h2 className="text-lg sm:text-xl mb-3 text-dark border-b pb-2 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Your Shopping Cart
            </h2>
            <ul className="space-y-3">
                {student.cart.length > 0 ? (
                    <>
                        {student.cart.map((item, index) => (
                            <li key={index} className="p-3 sm:p-3.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 font-medium border border-blue-100">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                    <div className="flex gap-3 sm:gap-4 items-center w-full sm:w-auto">
                                        <Image 
                                            src={item.type === "test-series" ? "/course-photo/testSeries.jpeg" : "/video-course-icon.png"}
                                            alt={item.type}
                                            width={50}
                                            height={50}
                                            className="rounded-lg sm:w-[55px] sm:h-[55px]"
                                        />
                                        <div className="space-y-1">
                                            <p className="text-gray-800 font-semibold text-sm sm:text-base">{item.name}</p>
                                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                                <span className="line-through text-gray-400 text-sm">₹{item.price}</span>
                                                <span className="text-green-600 font-bold text-sm">₹{item.discountPrice}</span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                    {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        className="w-full sm:w-auto bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-2.5 sm:py-2.5 px-4 sm:px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm relative overflow-hidden flex items-center justify-center sm:justify-start gap-2"
                                        onClick={() => {
                                            router.push(`/payment/${item.pageParameters}`)
                                        }}
                                    >
                                        Purchase Now
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                        <div className="mt-4 p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm sm:text-base">Total Items:</span>
                                <span className="font-bold text-sm sm:text-base">{student.cart.length}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <li className="p-4 sm:p-5 bg-blue-50 rounded-xl text-center">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-600 font-medium text-sm sm:text-base">Your cart is empty</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Add items to get started</p>
                    </li>
                )}
            </ul>
        </div>
    )
}

const ProductsCard = () => {
    const student = useSelector(state => state.login.studentDetails)
    console.log(student.purchases[0].product.type)
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-200 h-full">
            <h2 className="text-lg sm:text-xl mb-3 sm:mb-4 text-gray-800 border-b pb-2 sm:pb-3 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Your Purchases
            </h2>
            <ul className="space-y-3">
                {student.purchases.length > 0 ? (
                    student.purchases.map((purchase, index) => (
                        <li key={index} className="p-3 sm:p-3.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 font-medium border border-blue-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                <div className="flex gap-3 sm:gap-4 items-center">
                                    <Image 
                                        src={purchase.product.type === "test-series" ? "/course-photo/testSeries.jpeg" : "/video-course-icon.png"}
                                        alt={purchase.product.type}
                                        width={50}
                                        height={50}
                                        className="rounded-lg sm:w-[55px] sm:h-[55px]"
                                    />
                                    <div className="space-y-1">
                                        <p className="text-gray-800 font-semibold text-sm sm:text-base">{purchase.product.name}</p>
                                        <span className="text-xs sm:text-sm text-gray-500">Purchase Date: {new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {purchase.product.type === "test-series" && (
                                    <button 
                                        className="w-full sm:w-auto bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] hover:from-[#1a6cad] hover:to-[#2884cc] text-white font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1d77bc] focus:ring-opacity-50 group flex items-center justify-center sm:justify-start gap-2"
                                        onClick={() => window.location.href = 'https://drcexam.in/'}
                                    >
                                        View {purchase.product.type}
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-4 sm:p-5 bg-blue-50 rounded-xl text-center">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-gray-600 font-medium text-sm sm:text-base">No purchases yet</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Your purchased courses will appear here</p>
                    </li>
                )}
            </ul>
        </div>
    )
}
export default function FirstDashboard(){
    return (
        <div className="bg-gray-100 w-full p-3 sm:p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CartCard />
                <ProductsCard />
            </div>
        </div>
    )
}