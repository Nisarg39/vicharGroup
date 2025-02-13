"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FoundationCourses = (props) => {
  const courses = [
    { id: 1, title: '8th SSC', level: '8th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 2, title: '8th CBSE', level: '8th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 3, title: '8th ICSE', level: '8th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 4, title: '9th SSC', level: '9th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 5, title: '9th CBSE', level: '9th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 6, title: '9th ICSE', level: '9th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 7, title: '10th SSC', level: '10th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 8, title: '10th CBSE', level: '10th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
    { id: 9, title: '10th ICSE', level: '10th', image: '/course-photo/foundationIcon.jpeg', link: '#' },
  ]

  const coursesGroup1 = courses.slice(0, 3)
  const coursesGroup2 = courses.slice(3, 6)
  const coursesGroup3 = courses.slice(6, 9)

  return (
    <div className="bg-gradient-to-b from-gray-200 to-white flex items-center" id='courses-section'>
      <div className="container mx-auto px-4 sm:pt-8 md:pt-8">
        <h2 className="text-5xl md:text-5xl font-bold text-gray-900 text-center mb-8">Courses</h2>
        {[coursesGroup1, coursesGroup2, coursesGroup3].map((group, groupIndex) => (
          <div key={groupIndex} className="mb-8 overflow-x-auto">
            <div className="flex justify-center gap-6 min-w-max pb-8 px-8">
              {group.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8] flex-shrink-0 w-80 sm:w-72 md:w-96">
                  <div className="flex flex-row">
                    <div className="relative w-1/2 aspect-square">
                      <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-105" />
                      <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
                    </div>
                    <div className="w-1/2 p-5">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                      <p className="text-gray-600 mb-4 text-sm">Comprehensive preparation course for {course.level} students.</p>
                      <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-4 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm shadow-[0_0_15px_rgba(239,90,42,0.5)] hover:shadow-[0_0_25px_rgba(239,90,42,0.8)]">
                        <span className="group-hover:hidden">Enroll Now</span>
                        <span className="hidden group-hover:inline-block">Enroll Now →</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FoundationCourses