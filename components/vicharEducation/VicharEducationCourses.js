import React from 'react'
import { FaGraduationCap, FaHeartbeat, FaUniversity, FaBook, FaClock, FaBolt } from 'react-icons/fa'
import Link from 'next/link'

export default function VicharEducationCourses() {
    const courses = [
        {
            id: 1,
            title: "JEE",
            description: "For those new to the stock market, covering all fundamentals.",
            duration: "4 weeks",
            price: "$99",
            icon: <FaGraduationCap />,
            difficulty: "Beginner",
            link: "/vichar-education/vichar-jee"
        },
        {
            id: 2,
            title: "NEET",
            description: "For those familiar with the basics, looking to enhance their skills.",
            duration: "6 weeks",
            price: "$149",
            icon: <FaHeartbeat />,
            difficulty: "Intermediate",
            link: "/vichar-education/vichar-neet"
        },
        {
            id: 3,
            title: "MHT-CET",
            description: "For experienced investors wanting to dive deeper into complex strategies",
            duration: "8 weeks",
            price: "$199",
            icon: <FaUniversity />,
            difficulty: "Advanced",
            link: "/courses/mht-cet"
        },
        {
            id: 4,
            title: "Foundation",
            description: "For professionals seeking to master advanced trading techniques",
            duration: "10 weeks",
            price: "$299",
            icon: <FaBook />,
            difficulty: "8TH - 10TH",
            link: "/vichar-education/vichar-foundation"
        }
    ]

    return (
        <div className="max-w-full mx-auto px-8 py-20 bg-gray-100">
            <h1 className="text-5xl font-bold text-center mb-16 text-gray-800">Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border-t-4 border-[#106FB7] flex flex-col">
                        <div className="p-6 pb-2 flex-grow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl bg-gray-100 p-3 rounded-full">{course.icon}</div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    course.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                                    course.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                                    course.difficulty === "Advanced" ? "bg-red-100 text-red-800" :
                                    "bg-purple-100 text-purple-800"
                                }`}>
                                    {course.difficulty}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold mb-3">{course.title}</h2>
                            <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                            <div className="flex justify-between items-center text-sm mb-4">
                                <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                                    <FaClock className="w-4 h-4 mr-1" />
                                    <span>{course.duration}</span>
                                </span>
                                <span className="font-bold text-[#106FB7] text-lg bg-blue-50 px-3 py-1 rounded-full">{course.price}</span>
                            </div>
                        </div>
                        <div className="px-6 pb-6 mt-2">
                            <Link href={course.link}>
                                <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-4 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#f47f33] focus:ring-opacity-50 flex items-center justify-center text-lg">
                                    <FaBolt className="w-4 h-4 mr-2" />
                                    Enroll Now
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}