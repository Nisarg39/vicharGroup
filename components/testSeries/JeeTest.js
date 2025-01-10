import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const JeeTest = (props) => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: '/course-photo/testSeries.jpeg', link: '#' },
    { id: 2, title: '12th Standard', level: '12th', image: '/course-photo/testSeries.jpeg', link: '/test-series/buy-test-series/jee/12' },
  ]

  return (
    <div className="bg-gradient-to-b flex items-center" id='courses-section'>
      <div className="container mx-auto px-4 py-8 sm:py-16 md:py-8">
        <div className="flex flex-wrap justify-center gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8] w-[280px]">
              <div className="relative w-full aspect-square overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-2.5 py-0.5 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-3 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-5 text-sm">Comprehensive JEE preparation course for {course.level} students.</p>
                {course.id === 2 ? (
                  <Link href={course.link}>
                    <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base">
                      <span className="group-hover:hidden">Enroll Now</span>
                      <span className="hidden group-hover:inline-block">Enroll Now →</span>
                    </button>
                  </Link>
                ) : (
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base">
                    <span className="group-hover:hidden">Enroll Now</span>
                    <span className="hidden group-hover:inline-block">Enroll Now →</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default JeeTest