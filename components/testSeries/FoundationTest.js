"use client"
import React, { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FoundationTest = (props) => {
  const courses = [
    { id: 7, title: '10th SSC', level: '10th', image: '/course-photo/testSeries.jpeg', link: '/live-classes' },
    { id: 8, title: '10th CBSE', level: '10th', image: '/course-photo/testSeries.jpeg', link: '/study-material' },
    { id: 9, title: '10th ICSE', level: '10th', image: '/course-photo/testSeries.jpeg', link: '/mentorship' },
  ]

  const coursesGroup = courses.slice(0, 3)

  return (
    <div className="bg-gray-100 flex items-center" id='courses-section'>
      <div className="container mx-auto px-4 py-4 sm:py-8 md:py-8">
        <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 sm:mb-6 md:mb-10 text-gray-800 leading-tight mt-4 sm:mt-8 animate-fade-in-down relative">{props.title}</h2>
        <div className="mb-8 overflow-hidden">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-800">10th Standard - SSC, CBSE, and ICSE</h3>
          <div className="flex justify-center gap-6 pb-8 px-8 overflow-x-auto scrollbar-hide">
            {coursesGroup.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8] flex-shrink-0 w-80 sm:w-64 md:w-72">
                <div className="relative w-full aspect-square">
                  <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-105" />
                  <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">Comprehensive preparation course for {course.level} students.</p>
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
    </div>
  )
}

export default FoundationTest