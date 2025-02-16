import React, { useState } from 'react'
import { FaCalendarAlt, FaBolt, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { motion } from 'framer-motion'

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
        <div className="max-w-full mx-auto px-8 bg-gray-200">
            <motion.h1 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-5xl font-bold text-center mb-16 text-black glow-text"
            >
                Courses
            </motion.h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-[95%] mx-auto">
                {courses.map((course, index) => (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        key={course.id} 
                        className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border-t-4 border-[#106FB7] flex flex-col hover:scale-105"
                        whileHover={{ y: -10 }}
                    >
                        <div className="p-8 pb-2 flex-grow relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-black">{course.title}</h2>
                                <motion.span 
                                    whileHover={{ scale: 1.1 }}
                                    className={`px-4 py-2 rounded-t-full text-sm font-bold ${
                                        course.difficulty === "Beginner" ? "bg-green-400 text-white" :
                                        course.difficulty === "Intermediate" ? "bg-yellow-400 text-white" :
                                        "bg-red-400 text-white"
                                    } shadow-md`}
                                >
                                    {course.difficulty}
                                </motion.span>
                            </div>
                            <p className="text-gray-600 text-base mb-6">{course.description}</p>
                            <div className="flex flex-col text-base mb-6">
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 rounded-t-lg text-gray-600"
                                >
                                    <FaCalendarAlt className="w-5 h-5 mr-3 text-[#106FB7]" />
                                    <div>{course.duration.days} days, {course.duration.hoursPerDay} hours/day</div>
                                </motion.div>
                                <motion.button 
                                    onClick={toggleMoreInfo}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-between bg-[#106FB7] px-4 py-3 rounded-b-lg text-white font-semibold transition-all duration-300 hover:bg-[#0d5a94]"
                                >
                                    <div className="flex items-center">
                                        <FaInfoCircle className="w-5 h-5 mr-3" />
                                        <div>Course Details</div>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: showAllDetails ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FaChevronDown className="w-5 h-5" />
                                    </motion.div>
                                </motion.button>
                            </div>
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: showAllDetails ? "auto" : 0, opacity: showAllDetails ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {showAllDetails && (
                                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-lg">
                                        <ul className="list-disc pl-5">
                                            {course.moreInfo.map((info, index) => (
                                                <motion.li 
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    key={index} 
                                                    className={`text-gray-600 ${info.startsWith("Price:") ? "list-none mt-2" : ""}`}
                                                >
                                                    {info.startsWith("Price:") ? (
                                                        <span className="bg-[#106FB7] text-white px-2 py-1 rounded">{info}</span>
                                                    ) : (
                                                        info
                                                    )}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        <div className="px-8 pb-8">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled
                                className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 px-5 rounded-xl transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50 flex items-center justify-center text-lg cursor-not-allowed"
                            >
                                <FaBolt className="w-4 h-4 mr-2" />
                                Coming Soon
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
            <motion.p 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mt-16 text-gray-600 max-w-3xl mx-auto"
            >
                Start your journey toward financial independence and informed investing today with Vichar stock market classes. Let us guide you to make sound financial decisions, master the market, and grow your wealth with confidence
            </motion.p>
        </div>
    )
}