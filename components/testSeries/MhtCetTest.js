"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MhtCetTest = (props) => {
  const [selectedClass, setSelectedClass] = useState('11th')
  
  const courses = [
    { id: 1, title: 'PCM', level: 'PCM', image: '/course-photo/testSeries.jpeg', link: '/test-series/buy-test-series/cet-pcm/12' },
    { id: 2, title: 'PCB', level: 'PCB', image: '/course-photo/testSeries.jpeg', link: 'test-series/buy-test-series/cet-pcb/12' },
  ]

  return (
    <div className="bg-white flex items-center" id='courses-section'>
      <div className="container mx-auto px-14 py-8 sm:py-16 md:py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-black mb-12 pb-4">MHT-CET Test Series</h1>
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-[#106fb8] p-1 bg-white">
            <button
              onClick={() => setSelectedClass('11th')}
              className={`px-2 sm:px-4 py-2 text-sm sm:text-base rounded-md ${selectedClass === '11th' ? 'bg-[#106fb8] text-white' : 'text-[#106fb8]'}`}
            >
              11th Class
            </button>
            <button
              onClick={() => setSelectedClass('12th')}
              className={`px-2 sm:px-4 py-2 text-sm sm:text-base rounded-md ${selectedClass === '12th' ? 'bg-[#106fb8] text-white' : 'text-[#106fb8]'}`}
            >
              12th Class
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 p-6 bg-gray-200 rounded-3xl hover:from-gray-50 hover:to-gray-100 transition-all duration-300 shadow-md">
              <div className="relative w-48 h-48 flex-shrink-0">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 hover:text-[#106fb8] transition-colors duration-300">{`${selectedClass} ${course.title}`}</h3>
                <p className="text-gray-600 mb-6">Comprehensive MHT-CET preparation course for {selectedClass} {course.level} students.</p>
                {selectedClass === '12th' ? (
                  <Link href={course.link}>
                    <button className="inline-flex items-center bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50">
                      <span>Enroll Now</span>
                      <svg className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </Link>
                ) : (
                  <button className="inline-flex items-center bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50">
                    <span>Enroll Now</span>
                    <svg className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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

export default MhtCetTest