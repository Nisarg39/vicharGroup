import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IoMdThunderstorm } from 'react-icons/io'

const Courses = () => {
  const courses = [
    { id: 1, title: 'Vichar Education', level: '8th - 12th', description: 'Expert academic coaching for Grades 8-12 and Boards (8th-12th).Specialized preparation for JEE, NEET, and MHT-CET.', image: '/course-photo/foundationStudentsCourse.jpg', link: '/vichar-education' },
    { id: 2, title: 'Vichar Stock Market', level: 'Finance', description: 'Master stock market trends and strategies with our course, tailored for beginners to advanced traders.', image: 'https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png', link: '/vichar-stock-market' },
  ]

  return (
    <div className="relative bg-transparent to-white" id='courses-section'>
      <div className="container mx-auto px-4 pb-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 md:mb-8 text-center text-gray-800 tracking-tight">Dynamic Segments</h2>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-18">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 border-b-4 border-b-[#106fb8] w-[85%] sm:w-[calc(45%-1.25rem)] lg:w-[calc(26.666%-1.5rem)] relative hover:shadow-2xl hover:rotate-1">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-110" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-2 sm:px-3 py-1 rounded-bl-lg text-xs sm:text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-4 sm:p-5 md:p-6 relative">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-800 hover:text-[#106fb8] transition-colors duration-300 text-center">{course.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-2 leading-relaxed line-clamp-3">{course.description}</p>
                <Link href={course.link} passHref>
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm sm:text-base relative overflow-hidden">
                    <span className="group-hover:hidden flex items-center justify-center gap-2">
                      <IoMdThunderstorm className="text-sm animate-pulse" /> Learn More
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-300 rounded-full animate-ping"></span>
                    </span>
                    <span className="hidden group-hover:inline-block animate-pulse">Explore Now →</span>
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