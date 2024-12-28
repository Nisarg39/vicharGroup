"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MhtCetTest = (props) => {
  const [selectedClass, setSelectedClass] = useState('11th')
  
  const courses = [
    { id: 1, title: 'PCM', level: 'PCM', image: '/course-photo/testSeries.jpeg', link: '/vichar-education' },
    { id: 2, title: 'PCB', level: 'PCB', image: '/course-photo/testSeries.jpeg', link: '/vichar-stock-market' },
  ]

  return (
    <div className="bg-gradient-to-b flex items-center pb-2" id='courses-section'>
      <div className="container mx-auto px-4 pb-8 sm:pb-8 pt-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-[#106fb8] p-1">
            <button
              onClick={() => setSelectedClass('11th')}
              className={`px-4 py-2 rounded-md ${selectedClass === '11th' ? 'bg-[#106fb8] text-white' : 'text-[#106fb8]'}`}
            >
              11th Class
            </button>
            <button
              onClick={() => setSelectedClass('12th')}
              className={`px-4 py-2 rounded-md ${selectedClass === '12th' ? 'bg-[#106fb8] text-white' : 'text-[#106fb8]'}`}
            >
              12th Class
            </button>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8] w-72">
              <div className="relative w-72 h-72 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{`${selectedClass} ${course.title}`}</h3>
                <p className="text-gray-600 mb-6">Comprehensive MHT-CET preparation course for {selectedClass} {course.level} students.</p>
                <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base">
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

export default MhtCetTest