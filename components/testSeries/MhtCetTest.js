"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MhtCetTest = (props) => {
  const [selectedClass, setSelectedClass] = useState('12th')
  
  const courses = [
    { id: 1, title: 'PCM', level: 'PCM', image: '/course-photo/testSeries.jpeg', link: '/test-series/buy-test-series/cet-pcm/12', class: '12th' },
    { id: 2, title: 'PCB', level: 'PCB', image: '/course-photo/testSeries.jpeg', link: '/test-series/buy-test-series/cet-pcb/12', class: '12th' },
    { id: 3, title: 'PCM', level: 'PCM', image: '/course-photo/testSeries.jpeg', link: '/test-series/buy-test-series/cet-pcm/11', class: '11th' },
    { id: 4, title: 'PCB', level: 'PCB', image: '/course-photo/testSeries.jpeg', link: '/test-series/buy-test-series/cet-pcb/11', class: '11th' },
  ]

  // Filter courses based on selected class
  const filteredCourses = courses.filter(course => course.class === selectedClass)

  return (
    <div className="relative bg-transparent to-white mt-12" id='courses-section'>
      <div className="container mx-auto px-4 pb-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 md:mb-8 text-center text-gray-800 tracking-tight">MHT-CET Test Series</h2>
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
              className={`px-2 sm:px-4 py-2 text-sm sm:text-base rounded-md ${selectedClass === '12th' ? 'bg-[#106fb8] text-white' : 'text-[#106fb8]'} relative`}
            >
              12th Class
              {selectedClass === '11th' && (
                <span className="absolute -top-2 -right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-18">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 border-b-4 border-b-[#106fb8] w-[85%] sm:w-[calc(45%-1.25rem)] lg:w-[calc(26.666%-1.5rem)] relative hover:shadow-2xl hover:rotate-1">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-110" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-2 sm:px-3 py-1 rounded-bl-lg text-xs sm:text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-4 sm:p-5 md:p-6 relative">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-800 hover:text-[#106fb8] transition-colors duration-300 text-center">{`${selectedClass} ${course.title}`}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-2 leading-relaxed line-clamp-3">Comprehensive MHT-CET preparation course for {selectedClass} {course.level} students.</p>
                <Link href={course.link} passHref>
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm sm:text-base relative overflow-hidden">
                    <span className="flex items-center justify-center">Enroll Now →</span>
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

export default MhtCetTest