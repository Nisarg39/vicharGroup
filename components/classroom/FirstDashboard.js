"use client"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Image from "next/image"

const CartCard = () => {
    const student = useSelector(state => state.login.studentDetails)
    const router = useRouter()

    return (

        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 h-[300px] flex flex-col">
            <h2 className="text-base sm:text-lg lg:text-xl mb-4 text-dark border-b pb-3 font-semibold flex items-center gap-2 sticky top-0 bg-white/80 backdrop-blur-sm">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Your Shopping Cart
            </h2>
            <ul className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {student && student.cart && student.cart.length > 0 ? (
                    <>
                        {student.cart.map((item, index) => (
                            <li key={index} className="p-3 sm:p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                    <div className="w-full sm:w-auto flex items-center gap-3">
                                        <Image 
                                            src={item.image? item.image : "/course-photo/testSeries.jpeg"}
                                            alt={item.type}
                                            width={50}
                                            height={50}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">{item.name}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="line-through text-gray-400 text-sm">₹{item.price}</span>
                                                <span className="text-green-600 font-bold text-sm">₹{item.discountPrice}</span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                    {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        className="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2 text-sm sm:text-base"
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
    // console.log(student.purchases)
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 h-[300px] flex flex-col">
            <h2 className="text-base sm:text-lg lg:text-xl mb-4 text-gray-800 border-b pb-3 font-semibold flex items-center gap-2 sticky top-0 bg-white/80 backdrop-blur-sm">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Your Purchases
            </h2>
            <ul className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {student && student.purchases && student.purchases.length > 0 ? (
                    student.purchases.map((purchase, index) => (
                        <li key={index} className="p-3 sm:p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                <div className="w-full sm:w-auto flex items-center gap-3">
                                    <Image 
                                        src={purchase.product.image ? purchase.product.image : "/course-photo/testSeries.jpeg"}
                                        alt={purchase.product.type}
                                        width={50}
                                        height={50}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">{purchase.product.name}</p>
                                        <span className="text-xs sm:text-sm text-gray-500">Purchase Date: {new Date(purchase.createdAt).toLocaleDateString()}</span>
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
                                {purchase.product.type === "course" && (
                                    <button 
                                        className="w-full sm:w-auto bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] hover:from-[#1a6cad] hover:to-[#2884cc] text-white font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1d77bc] focus:ring-opacity-50 group flex items-center justify-center sm:justify-start gap-2"
                                        onClick={() => window.location.href = 'https://play.google.com/store/apps/details?id=com.vichareducation.jee_neet'}
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

const SummaryCard = () => {
  const student = useSelector(state => state.login.studentDetails)
  
  // Calculate total amount paid
  const totalAmountPaid = student.purchases?.reduce((total, purchase) => 
    total + (purchase.amountPaid || 0), 0) || 0

  // Calculate total product prices
  const totalProductPrice = student.purchases?.reduce((total, purchase) => 
    total + (purchase.product?.price || 0), 0) || 0

  // Calculate total savings
  const totalSavings = totalProductPrice - totalAmountPaid

  // Count courses and test series
  const courseCount = student.purchases?.filter(purchase => 
    purchase.product?.type === "course").length || 0
    
  const testSeriesCount = student.purchases?.filter(purchase => 
    purchase.product?.type === "test-series").length || 0

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 mb-6">
      <h2 className="text-base sm:text-lg lg:text-xl mb-4 text-gray-800 border-b pb-3 font-semibold flex items-center gap-2">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Learning Summary
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-xl font-bold text-[#1d77bc]">₹{totalAmountPaid}</p>
          <p className="text-xs text-green-600">Original Price: ₹{totalProductPrice}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Total Savings</p>
          <p className="text-xl font-bold text-[#1d77bc]">₹{totalSavings}</p>
          <p className="text-xs text-green-600">You saved {((totalSavings/totalProductPrice) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Courses</p>
          <p className="text-xl font-bold text-[#1d77bc]">{courseCount}</p>
          <p className="text-xs text-purple-600">Active Courses</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Test Series</p>
          <p className="text-xl font-bold text-[#1d77bc]">{testSeriesCount}</p>
          <p className="text-xs text-orange-600">Active Test Series</p>
        </div>
      </div>
    </div>
  )
}

export default function FirstDashboard(){
    return (
        <div className="bg-gray-100 w-full p-4 sm:p-6 rounded-xl">
            <SummaryCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <CartCard />
                <ProductsCard />
            </div>
        </div>
    )
}