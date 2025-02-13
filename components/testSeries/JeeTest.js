import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const JeeTest = (props) => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: '/course-photo/testSeries.jpeg', link: '#' },
    { id: 2, title: '12th Standard', level: '12th', image: '/course-photo/testSeries.jpeg', link: '/test-series/buy-test-series/jee/12' },
  ]

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 flex items-center pt-24" id='courses-section'>
      <div className="container mx-auto px-14 py-8 sm:py-16 md:py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12 pb-4">JEE Test Series</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 p-6 bg-gray-200 rounded-3xl hover:from-gray-50 hover:to-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="relative w-48 h-48 flex-shrink-0">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="rounded-3xl" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-6">Comprehensive JEE preparation course for {course.level} students.</p>
                {course.id === 2 ? (
                  <Link href={course.link}>
                    <button className="inline-flex items-center bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50">
                      <span>Enroll Now</span>
                      <svg className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </Link>
                ) : (
                  <button disabled className="inline-flex items-center bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 px-8 rounded-full cursor-not-allowed opacity-70">
                    <span>Coming Soon</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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