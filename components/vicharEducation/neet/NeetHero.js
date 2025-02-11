import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const NeetHero = () => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: '/course-photo/neetIcon.jpeg', link: '' },
    { id: 2, title: '12th Standard', level: '12th', image: '/course-photo/neetIcon.jpeg', link: '' },
    { id: 3, title: '11th + 12th Integrated', level: '11th & 12th', image: '/course-photo/neetIcon.jpeg', link: '' },
  ]

  return (
    <div className="bg-black min-h-screen flex items-center pt-20" id='courses-section'>
      <div className="container mx-auto px-4 py-4 sm:py-8 md:py-6">
        <h1 className="text-5xl font-bold text-white text-center mb-12">NEET Preparation Course</h1>
        <div className="flex flex-wrap justify-center gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-800 hover:border-[#106fb8] max-w-xs border-b-4 border-b-[#106fb8]">
              <div className="relative w-full pt-[80%] overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-3 text-white hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-400 mb-5">Comprehensive JEE preparation course for {course.level} students.</p>
                <Link href={course.link} passHref>
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-2.5 px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base shadow-[0_0_10px_#ef5a2a] hover:shadow-[0_0_20px_#ef5a2a]">
                    <span className="group-hover:hidden inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Enroll Now
                    </span>
                    <span className="hidden group-hover:inline-block">Enroll Now →</span>
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

export default NeetHero