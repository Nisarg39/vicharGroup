import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const JeeHero = (props) => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: '/jee-students/jeeStudents1.jpeg', link: '' },
    { id: 2, title: '12th Standard', level: '12th', image: '/jee-students/jeeStudents2.jpeg', link: '' },
    { id: 3, title: '11th + 12th Integrated', level: '11th & 12th', image: '/jee-students/jeeStudents3.jpeg', link: '' },
  ]

  return (
    <div className="bg-gradient-to-b pt-16 sm:pt-24 min-h-screen flex items-center" id='courses-section'>
      <div className="container mx-auto px-4 py-8 sm:py-16 md:py-12">
        <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 sm:mb-6 md:mb-10 text-gray-800 leading-tight mt-4 sm:mt-8 animate-fade-in-down relative">{props.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8]">
              <div className="relative w-full pt-[75%] overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-6">Comprehensive JEE preparation course for {course.level} students.</p>
                <Link href={course.link} passHref>
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base">
                    <span className="group-hover:hidden flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Enroll Now
                    </span>
                    <span className="hidden group-hover:inline-block group-hover:flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Enroll Now →
                    </span>
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

export default JeeHero