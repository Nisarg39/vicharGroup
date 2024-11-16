import React from 'react'
import { FaChartLine, FaChartBar, FaMoneyBillWave, FaClock, FaBolt } from 'react-icons/fa'

export default function StockCourses() {
    const courses = [
        {
            id: 1,
            title: "Beginner Level",
            description: "For those new to the stock market, covering all fundamentals.",
            duration: "4 weeks",
            price: "$99",

            icon: <FaChartLine />,
            difficulty: "Beginner"
        },
        {
            id: 2,
            title: "Intermediate Level",
            description: "For those familiar with the basics, looking to enhance their skills.",
            duration: "6 weeks",
            price: "$149",

            icon: <FaChartBar />,
            difficulty: "Intermediate"
        },
        {
            id: 3,
            title: "Advanced Level",
            description: "For experienced investors wanting to dive deeper into complex strategies",
            duration: "8 weeks",
            price: "$199",

            icon: <FaMoneyBillWave />,
            difficulty: "Advanced"
        }
    ]

    return (
        <div className="max-w-full mx-auto px-8 py-20 bg-gray-100">
            <h1 className="text-5xl font-bold text-center mb-16 text-gray-800">Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border-t-4 border-[#106FB7] flex flex-col">
                        <div className="p-8 pb-2 flex-grow">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-6xl bg-gray-100 p-4 rounded-full">{course.icon}</div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                    course.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                                    course.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {course.difficulty}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
                            <p className="text-gray-600 text-base mb-6">{course.description}</p>
                            <div className="flex justify-between items-center text-base mb-6">
                                <span className="flex items-center bg-gray-100 px-4 py-2 rounded-full text-gray-500">

                                    <FaClock className="w-5 h-5 mr-2" />
                                    <span>{course.duration}</span>
                                </span>
                                <span className="font-bold text-[#106FB7] text-xl bg-blue-50 px-4 py-2 rounded-full">{course.price}</span>
                            </div>
                        </div>
                        <div className="px-8 pb-8 mt-2">
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