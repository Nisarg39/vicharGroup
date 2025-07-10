"use client"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"

const CartCard = () => {
    const student = useSelector(state => state.login.studentDetails)
    const router = useRouter()

    return (
        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col hover:shadow-2xl transition-all duration-500 hover:bg-white/95">
            <h2 className="text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 text-gray-800 font-bold flex items-center gap-2 sm:gap-4 sticky top-0 bg-white/90 backdrop-blur-xl rounded-t-2xl">
                <div className="p-3 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl">
                    <svg className="w-6 h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Shopping Cart
                </span>
                {student?.cart?.length > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white text-xs px-3 py-1.5 rounded-full font-bold animate-pulse">
                        {student.cart.length}
                    </span>
                )}
            </h2>

            <ul className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2 sm:pr-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {student?.cart?.length > 0 ? (
                    <>
                        {student.cart.map((item, index) => (
                            <li key={index} className="group p-3 sm:p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl sm:rounded-2xl hover:from-blue-100/60 hover:to-indigo-100/60 transition-all duration-300 border border-blue-100/30 hover:border-blue-200/50 hover:shadow-lg transform hover:-translate-y-0.5">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Image 
                                            src={item.image || "/course-photo/testSeries.jpeg"}
                                            alt={item.type}
                                            width={56}
                                            height={56}
                                            className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-white"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-bold text-gray-800 truncate mb-1">{item.name}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="line-through text-gray-400 text-sm">₹{item.price}</span>
                                            <span className="text-green-600 font-bold text-sm bg-green-50 px-2.5 py-1 rounded-lg">₹{item.discountPrice}</span>
                                            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => router.push(`/payment/${item.pageParameters}`)}
                                        className="flex items-center gap-2 bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:ring-2 focus:ring-[#1d77bc]/50 focus:ring-offset-2"
                                    >
                                        Purchase
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </>
                ) : (
                    <li className="p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl text-center border border-blue-100/30 flex flex-col items-center justify-center h-full">
                        <div className="relative inline-block">
                            <svg className="w-16 h-16 text-blue-300 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-800 mb-1">Your cart is empty</p>
                            <p className="text-gray-500">Add items to begin your learning journey</p>
                        </div>
                    </li>
                )}
            </ul>
        </div>
    )
}

const ProductsCard = () => {
    const student = useSelector(state => state.login.studentDetails)
    
    return (
        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col hover:shadow-2xl transition-all duration-500 hover:bg-white/95">
            <h2 className="text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 text-gray-800 font-bold flex items-center gap-2 sm:gap-4 sticky top-0 bg-white/90 backdrop-blur-xl rounded-t-2xl">
                <div className="p-3 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl">
                    <svg className="w-6 h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Your Purchases
                </span>
                {student?.purchases?.length > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full font-bold">
                        {student.purchases.length}
                    </span>
                )}
            </h2>

            <ul className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2 sm:pr-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {student?.purchases?.length > 0 ? (
                    student.purchases.map((purchase, index) => (
                        <li key={index} className="group p-3 sm:p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl sm:rounded-2xl hover:from-blue-100/60 hover:to-indigo-100/60 transition-all duration-300 border border-blue-100/30 hover:border-blue-200/50 hover:shadow-lg transform hover:-translate-y-0.5">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Image 
                                        src={purchase.product.image || "/course-photo/testSeries.jpeg"}
                                        alt={purchase.product.type}
                                        width={56}
                                        height={56}
                                        className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-white"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-gray-800 truncate mb-1">{purchase.product.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(purchase.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5 animate-pulse"></span>
                                            Active
                                        </span>
                                    </div>
                                </div>

                                {purchase.product.type === "test-series" ? (
                                    <button 
                                        onClick={() => window.location.href = 'https://drcexam.in/'}
                                        className="flex items-center gap-2 bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:ring-2 focus:ring-[#1d77bc]/50 focus:ring-offset-2"
                                    >
                                        View Tests
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => window.location.href = 'https://play.google.com/store/apps/details?id=com.vichareducation.jee_neet'}
                                        className="flex items-center gap-2 bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:ring-2 focus:ring-[#1d77bc]/50 focus:ring-offset-2"
                                    >
                                        View Course
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl text-center border border-blue-100/30">
                        <div className="relative inline-block">
                            <svg className="w-20 h-20 text-blue-300 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                        </div>
                        <p className="text-lg font-semibold text-gray-800 mb-2">No purchases yet</p>
                        <p className="text-gray-500">Your purchased courses will appear here</p>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default function FirstDashboard(){
    const [showAnalysis, setShowAnalysis] = useState(false)
    const student = useSelector(state => state.login.studentDetails)
    
    const calculations = {
        totalAmountPaid: student.purchases?.reduce((total, purchase) => 
            total + (purchase.amountPaid || 0), 0) || 0,
        totalProductPrice: student.purchases?.reduce((total, purchase) => 
            total + (purchase.product?.price || 0), 0) || 0,
        courseCount: student.purchases?.filter(purchase => 
            purchase.product?.type === "course").length || 0,
        testSeriesCount: student.purchases?.filter(purchase => 
            purchase.product?.type === "test-series").length || 0
    }

    const totalSavings = calculations.totalProductPrice - calculations.totalAmountPaid

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50/800 via-blue-50/20 to-indigo-50/10 w-full px-4 sm:px-6 md:px-8 py-6 rounded-3xl relative overflow-hidden backdrop-blur-lg">
            <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
                <div className="md:hidden"> {/* Toggle button only visible on mobile/tablet */}
                    <button 
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className="w-full bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                    >
                        <span className="font-semibold text-gray-800">Analysis Summary</span>
                        <svg 
                            className={`w-5 h-5 transition-transform duration-300 ${showAnalysis ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 ${!showAnalysis ? 'hidden md:grid' : 'grid'}`}>
                    {/* Investment Stats */}
                    <div className="bg-gradient-to-br from-white to-blue-50/50 p-5 rounded-2xl border border-blue-100/30 hover:border-blue-200/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100/80 px-3 py-1.5 rounded-full">INVESTMENT</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600 mb-2">₹{calculations.totalAmountPaid.toLocaleString()}</p>
                        <p className="text-sm text-blue-600/80 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Original: ₹{calculations.totalProductPrice.toLocaleString()}
                        </p>
                    </div>

                    {/* Savings Stats */}
                    <div className="bg-gradient-to-br from-white to-green-50/50 p-5 rounded-2xl border border-green-100/30 hover:border-green-200/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-100/80 px-3 py-1.5 rounded-full">SAVINGS</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600 mb-2">₹{totalSavings.toLocaleString()}</p>
                        <p className="text-sm text-green-600/80 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {calculations.totalProductPrice > 0 ? ((totalSavings/calculations.totalProductPrice) * 100).toFixed(1) : 0}% saved
                        </p>
                    </div>

                    {/* Courses Stats */}
                    <div className="bg-gradient-to-br from-white to-purple-50/50 p-5 rounded-2xl border border-purple-100/30 hover:border-purple-200/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-100/80 px-3 py-1.5 rounded-full">COURSES</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600 mb-2">{calculations.courseCount}</p>
                        <p className="text-sm text-purple-600/80 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                            Active Courses
                        </p>
                    </div>

                    {/* Tests Stats */}
                    <div className="bg-gradient-to-br from-white to-orange-50/50 p-5 rounded-2xl border border-orange-100/30 hover:border-orange-200/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold text-orange-600 bg-orange-100/80 px-3 py-1.5 rounded-full">TESTS</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600 mb-2">{calculations.testSeriesCount}</p>
                        <p className="text-sm text-orange-600/80 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                            Active Test Series
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1 h-[400px] sm:h-[300px]">
                        <CartCard />
                    </div>
                    <div className="transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1 h-[400px] sm:h-[300px]">
                        <ProductsCard />
                    </div>
                </div>
            </div>
        </div>
    )
}