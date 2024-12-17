import React from 'react'
import { FaClock, FaBolt } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

export default function VicharEducationCourses() {
    const courses = [
        {
            id: 1,
            title: "JEE",
            description: "Comprehensive preparation for IIT-JEE Main and Advanced with expert faculty guidance.",
            duration: "4 weeks",
            price: "$99",
            image: "/course-photo/jeeStudents.JPG",
            difficulty: "11th - 12th",
            link: "/vichar-education/jee"
        },
        {
            id: 2,
            title: "NEET",
            description: "Complete medical entrance exam preparation covering Physics, Chemistry, and Biology.",
            duration: "6 weeks",
            price: "$149",
            image: "/course-photo/neetStudents.JPG",
            difficulty: "11th - 12th",
            link: "/vichar-education/neet"
        },
        {
            id: 3,
            title: "MHT-CET",
            description: "Specialized coaching for Maharashtra Common Entrance Test with focus on state syllabus.",
            duration: "8 weeks",
            price: "$199",
            image: "/course-photo/cetStudents.JPG",
            difficulty: "11th - 12th",
            link: "/vichar-education/mht-cet"
        },
        {
            id: 4,
            title: "Foundation",
            description: "Strong academic foundation for competitive exams with early preparation advantage.",
            duration: "10 weeks",
            price: "$299",
            image: "/course-photo/foundationStudents.jpeg",
            difficulty: "8TH - 10TH",
            link: "/vichar-education/foundation"
        }
    ]

    return (
        <div className="max-w-full mx-auto px-8 pb-10 pt-10 bg-gray-100">
            <h1 className="text-5xl font-bold text-center mb-8 mt-0 text-gray-800">Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border-b-4 border-[#106FB7] flex flex-col">
                        <div className="relative w-full h-48">
                            <Image 
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-6 pb-2 flex-grow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">{course.title}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    course.id == 1 ? "bg-green-100 text-green-800" :
                                    course.id == 2 ? "bg-yellow-100 text-yellow-800" :
                                    course.id == 3 ? "bg-red-100 text-red-800" :
                                    "bg-purple-100 text-purple-800"
                                }`}>
                                    {course.difficulty}
                                </span>
                            </div>
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
                                    Explore Courses
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}