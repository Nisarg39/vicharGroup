import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const NeetTest = (props) => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: '/course-photo/testSeries.jpeg', link: '/vichar-education' },
    { id: 2, title: '12th Standard', level: '12th', image: '/course-photo/testSeries.jpeg', link: '/vichar-stock-market' },
  ]

  return (
    <div className="bg-gradient-to-b pt-4 sm:pt-4 flex items-center pb-16" id='courses-section'>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 sm:mb-6 md:mb-10 text-gray-800 leading-tight mt-4 sm:mt-8 animate-fade-in-down relative">{props.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8]">
              <div className="relative w-full aspect-square">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-2 py-1 rounded-bl-lg text-xs font-semibold">{course.level}</div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-3 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">Comprehensive JEE preparation course for {course.level} students.</p>
                <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base">
                  <span className="group-hover:hidden">Enroll Now</span>
                  <span className="hidden group-hover:inline-block">Enroll Now →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NeetTest