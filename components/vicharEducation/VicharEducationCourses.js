import React from 'react'
import { FaBolt } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

export default function VicharEducationCourses() {
    const courses = [
        {
            id: 1,
            title: "JEE",
            description: "Comprehensive preparation for IIT-JEE Main and Advanced with expert faculty guidance.",
            image: "/course-photo/jeeIcon.jpeg",
            difficulty: "11th - 12th",
            link: "/vichar-education/jee"
        },
        {
            id: 2,
            title: "NEET",
            description: "Complete medical entrance exam preparation covering Physics, Chemistry, and Biology.",
            image: "/course-photo/neetIcon.jpeg",
            difficulty: "11th - 12th",
            link: "/vichar-education/neet"
        },
        {
            id: 3,
            title: "MHT-CET",
            description: "Specialized coaching for Maharashtra Common Entrance Test with focus on state syllabus.",
            image: "/course-photo/cetIcon.jpeg",
            difficulty: "11th - 12th",
            link: "/vichar-education/mht-cet"
        },
        {
            id: 4,
            title: "Foundation",
            description: "Strong academic foundation for competitive exams with early preparation advantage.",
            image: "/course-photo/foundationIcon.jpeg",
            difficulty: "8TH - 10TH",
            link: "/vichar-education/foundation"
        }
    ]

    return (
        <div className="max-w-full mx-auto px-8 pb-10 pt-10 bg-gradient-to-b from-gray-200 to-white">
            <h1 className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-10 text-gray-800 leading-tight">Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.map((course) => (
                    <div key={course.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#106FB7]/20 border-b-4 border-[#106FB7] flex flex-col max-w-[300px] mx-auto">
                        <div className="relative w-full aspect-square">
                            <Image 
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="p-5 pb-2 flex-grow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">{course.title}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    course.id == 1 ? "bg-green-100 text-green-700" :
                                    course.id == 2 ? "bg-yellow-100 text-yellow-700" :
                                    course.id == 3 ? "bg-red-100 text-red-700" :
                                    "bg-purple-100 text-purple-700"
                                }`}>
                                    {course.difficulty}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                        </div>
                        <div className="px-5 pb-5 mt-2">
                            <Link href={course.link}>
                                <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-2.5 px-4 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#f47f33] focus:ring-opacity-50 flex items-center justify-center text-lg">
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