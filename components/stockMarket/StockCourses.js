import React, { useState } from 'react'
import { FaCalendarAlt, FaBolt, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa'

export default function StockCourses() {
    const [showAllDetails, setShowAllDetails] = useState(false)

    const courses = [
        {
            id: 1,
            title: "Price Action",
            description: "For those new to the stock market, covering all fundamentals.",
            duration: { days: "20-25", hoursPerDay: "2-3" },
            difficulty: "Beginner",
            moreInfo: [
                "Basic of Price Action",
                "Advance Study of price Action",
                "Stock Market Psychology & Sentements",
                "Advance Identification of trends",
                "Advance Approach to Price Action",
                "Sector Analysis",
                "Intraday Trading",
                "Price: ₹-40,000"
            ]
        },
        {
            id: 2,
            title: "RSI & Price Action",
            description: "For those familiar with the basics, looking to enhance their skills.",
            duration: { days: 14, hoursPerDay: "2-3" },
            difficulty: "Intermediate",
            moreInfo: [
                "Trend Analysis by RSI",
                "Range Indentification by RSI",
                "Find out entry on basis of RSI",
                "Identify correction on basis of a trend",
                "Identify a Multi Bagger Stock",
                "Pyramiding a winning Stock",
                "Trade against the Trend",
                "Calculate target to book profit",
                "Price: ₹-40,000"
            ]
        },
        {
            id: 3,
            title: "Option Trading",
            description: "For experienced investors wanting to dive deeper into complex strategies",
            duration: { days: 10, hoursPerDay: "2-3" },
            difficulty: "Advanced",
            moreInfo: [
                "Revision Class",
                "Online Videos of class",
                "Guidance in creating your own trading style/system ",
                "Development of trading physiology",
                "Q/A Sessions",
                "Traders Checklists",
                "Price: ₹-40,000"
            ]
        }
    ]

    const toggleMoreInfo = () => {
        setShowAllDetails(prev => !prev)
    }

    return (
        <div className="max-w-full mx-auto px-8 py-20 bg-gray-100">
            <h1 className="text-5xl font-bold text-center mb-16 text-gray-800">Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border-t-4 border-[#106FB7] flex flex-col">
                        <div className="p-8 pb-2 flex-grow">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">{course.title}</h2>
                                <span className={`px-4 py-2 rounded-t-full text-sm font-bold ${
                                    course.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                                    course.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {course.difficulty}
                                </span>
                            </div>
                            <p className="text-gray-600 text-base mb-6">{course.description}</p>
                            <div className="flex flex-col text-base mb-6">
                                <div className="flex items-center bg-gray-100 px-4 py-3 rounded-t-lg text-gray-700">
                                    <FaCalendarAlt className="w-5 h-5 mr-3" />
                                    <div>{course.duration.days} days, {course.duration.hoursPerDay} hours/day</div>
                                </div><button 
                                    onClick={toggleMoreInfo}
                                    className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 rounded-b-lg text-white font-semibold transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                                >
                                    <div className="flex items-center">
                                        <FaInfoCircle className="w-5 h-5 mr-3" />
                                        <div>Course Details</div>
                                    </div>
                                    {showAllDetails ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                            {showAllDetails && (
                                <div className="bg-blue-50 p-4 rounded-lg ">
                                    <ul className="list-disc pl-5">
                                        {course.moreInfo.map((info, index) => (
                                            <li key={index} className={`text-gray-600 ${info.startsWith("Price:") ? "list-none mt-2" : ""}`}>
                                                {info.startsWith("Price:") ? (
                                                    <span className="bg-gray-800 text-white px-2 py-1 rounded">{info}</span>
                                                ) : (
                                                    info
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="px-8 pb-8">
                            <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#f47f33] focus:ring-opacity-50 flex items-center justify-center text-xl">
                                <FaBolt className="w-5 h-5 mr-2" />
                                Enroll Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-center mt-16 text-gray-600 max-w-3xl mx-auto">
                Start your journey toward financial independence and informed investing today with Vichar stock market classes. Let us guide you to make sound financial decisions, master the market, and grow your wealth with confidence
            </p>
        </div>
    )
}