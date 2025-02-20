import { useRouter } from "next/navigation";
import LoadingSpinner from "../../common/LoadingSpinner"
import { useState } from "react";
import { addToCart } from "../../../server_actions/actions/studentActions";

export default function TestSeriesHero(props) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    async function buyNow(){
        const token = localStorage.getItem("token")
        const data = {
            productId: props.productId,
            token: token,
        }
        if(token){
            await addToCart(data)
            router.push(`/payment/${props.course}/${props.class}`)
        }else{
            localStorage.setItem("cart", `payment/${props.course}/${props.class}`);
            const cart = localStorage.getItem("cart")
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                router.push("/login")
            }, 5000);
        }
    }
    return(
        <section className="min-h-screen bg-gradient-to-b from-white via-gray-200 to-white pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8">
                    <MainCard props={props} />
                    <EnrollmentCard price={props.price} discountPrice={props.discountPrice} duration={props.duration} buyNow={buyNow}/>
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-12 bg-gradient-to-b from-[#1d77bc] to-[#2488d8] rounded-full"></div>
                                <p className="text-xl font-bold text-gray-800">Authentication Required</p>
                            </div>
                            <p className="text-gray-600">Please login first to proceed with the payment. You will be redirected to the login page shortly.</p>
                            <div className="flex justify-center">
                                <LoadingSpinner />
                            </div>
                        </div>
                    </div>
                </div>
            )}        
        </section>
    )
}
// MainCard.js
function MainCard({props}) {
    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#1d77bc]"></div>
                <div className="p-5 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-12 bg-gradient-to-b from-[#1d77bc] to-[#2488d8] rounded-full"></div>
                            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-tight">{props.title}</h2>
                        </div>
                        <div className="sm:absolute sm:right-0 bg-gradient-to-r from-[#22863a] to-[#2ea043] text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm">
                            Online Test Series
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center">
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider mr-2">Class:</span>
                                <span className="text-sm font-bold text-gray-800">{props.class}</span>
                            </div>
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center">
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider mr-2">Duration:</span>
                                <span className="text-sm font-bold text-gray-800">{props.duration}</span>
                            </div>
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center">
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider mr-2">Language: </span>
                                <span className="text-sm font-bold text-gray-800">{props.language}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <h3 className="text-md text-gray-600">Subjects (PCM):</h3>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="text-md font-bold text-gray-800">{props.subjects}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <h3 className="text-md text-gray-600">Test Start Date:</h3>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="text-sm text-white bg-[#e96030] px-4 py-1.5 rounded-full">{props.testStartDate}</span>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-8 bg-gray-100 -mx-8 -mb-8 p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <img 
                                    src="https://cdn-icons-gif.flaticon.com/15575/15575248.gif" 
                                    alt="JEE Logo" 
                                    className="w-8 sm:w-10 h-8 sm:h-10 object-contain"
                                />
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Program Offerings</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    [<a key="app-access" href="https://play.google.com/store/apps/details?id=com.vichareducation.jee_neet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 w-full bg-white p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 hover:bg-gray-100 transition-all duration-300"><div className="flex-shrink-0 p-3 rounded-lg" style={{backgroundColor: "#f5f5f5"}}><img src="https://cdn-icons-png.flaticon.com/128/299/299406.png" alt="Play Store" className="w-5 sm:w-6 h-5 sm:h-6" /></div><span className="text-gray-800 text-sm sm:text-base font-medium leading-tight">Access to Vichar Group App for personalised preparation</span></a>, null, null, null],
                                    ["Regular mock tests with detailed analysis", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", "#2488d8", "#f0f7ff"],
                                    ["One-on-one doubt clearing sessions", "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z", "#4CAF50", "#f0fff0"],
                                    ["Previous year question paper analysis", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", "#9C27B0", "#fdf0ff"],
                                    ["Performance tracking and personalized feedback", "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", "#FF9800", "#fff7e6"],
                                    ["Study material and chapter-wise practice tests", "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", "#F44336", "#fff0f0"]
                                ].map(([item, path, color, bgColor], index) => (
                                    index === 0 ? item : <div key={`offering-${index}`} className="flex items-center gap-4 bg-white p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                        <div className={`flex-shrink-0 p-3 rounded-lg`} style={{backgroundColor: bgColor}}>
                                            <svg className={`w-5 sm:w-6 h-5 sm:h-6`} fill="none" stroke={color} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
                                            </svg>
                                        </div>
                                        <span className="text-gray-800 text-sm sm:text-base font-medium leading-tight">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// EnrollmentCard.js
function EnrollmentCard(props) {
    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 sticky top-24 w-full sm:w-[288px] md:w-full lg:w-[252px] xl:w-[288px] mx-auto overflow-hidden md:flex md:flex-row lg:flex-col">
                <div className="relative w-full h-[180px] sm:h-[160px] md:h-[200px] md:w-1/2 lg:w-full">
                    <img 
                        src="/course-photo/testSeries.jpeg" 
                        alt="Course Preview" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-4 sm:p-5 space-y-3 md:w-1/2 lg:w-full md:flex md:flex-col md:justify-center">
                    <div className="bg-gray-50 rounded-2xl p-3 shadow-sm">
                        <div className="flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <span className="text-sm text-gray-600 font-medium">Price: <span className="text-base text-red-600 line-through font-medium font-poppins">₹{props.price}</span></span>
                                <span className="text-sm text-gray-600 font-medium mt-1">Offer: <span className="text-sm text-green-600 font-semibold">{Math.round(((props.price.replace(/,/g, '') - props.discountPrice.replace(/,/g, '')) / props.price.replace(/,/g, '')) * 100)}% OFF</span></span>
                                <span className="text-sm text-gray-600 font-medium mt-1">Final Price: <span className="text-2xl font-extrabold text-gray-900 font-poppins">₹{props.discountPrice}</span></span>
                                <span className="text-gray-600 text-sm font-semibold mt-2 bg-gray-100 px-4 py-1 rounded-full shadow-inner">{props.duration}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        className={`w-full px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center text-lg text-white ${props.isAddingToCart ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#e96030] hover:bg-[#d54e22]'}`}
                        onClick={props.buyNow}
                        disabled={props.isAddingToCart}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {props.isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                    </button>
                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-xs text-gray-600 font-medium">Secure payment via Razorpay</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Get instant access after payment</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}