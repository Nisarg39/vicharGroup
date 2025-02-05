import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Courses = () => {
  const courses = [
    { id: 1, title: 'Vichar Education', level: '8th - 12th', description: 'Expert academic coaching for Grades 8-12 and Boards (8th-12th).Specialized preparation for JEE, NEET, and MHT-CET.', image: '/course-photo/foundationStudentsCourse.jpg', link: '/vichar-education' },
    { id: 2, title: 'Vichar Stock Market', level: 'Finance', description: 'Master stock market trends and strategies with our course, tailored for beginners to advanced traders.', image: '/stock-market/stockStudents.jpg', link: '/vichar-stock-market' },
  ]

  return (
    <div className="bg-black" id='courses-section'>
      <div className="container mx-auto px-4 py-6 sm:py-10 md:py-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-12 md:mb-16 text-center text-white tracking-tight">Dynamic Segments</h2>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-18">
          {courses.map((course) => (
            <div key={course.id} className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition duration-500 hover:scale-105 border border-gray-700 hover:border-[#106fb8] w-full sm:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-110" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-2 sm:px-3 py-1 rounded-bl-lg text-xs sm:text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-white hover:text-[#106fb8] transition-colors duration-300 text-center">{course.title}</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-2 sm:mb-2 leading-relaxed line-clamp-3">{course.description}</p>
                <div className="flex items-center justify-between mb-2 sm:mb-2">
                </div>
                <Link href={course.link} passHref>
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm sm:text-base">
                    <span className="group-hover:hidden">Learn More</span>
                    <span className="hidden group-hover:inline-block">Explore Now →</span>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Courses