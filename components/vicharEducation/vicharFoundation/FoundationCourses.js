"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FoundationCourses = (props) => {
  const courses = [
    { id: 1, title: '8th SSC', level: '8th', image: 'https://cdn-icons-png.flaticon.com/256/2232/2232688.png', link: '/vichar-education' },
    { id: 2, title: '8th CBSE', level: '8th', image: 'https://cdn-icons-png.flaticon.com/256/2232/2232688.png', link: '/vichar-stock-market' },
    { id: 3, title: '8th ICSE', level: '8th', image: 'https://cdn-icons-png.flaticon.com/256/2232/2232688.png', link: '/vichar-coding' },
    { id: 4, title: '9th SSC', level: '9th', image: 'https://cdn-icons-png.flaticon.com/256/2991/2991548.png', link: '/crash-course' },
    { id: 5, title: '9th CBSE', level: '9th', image: 'https://cdn-icons-png.flaticon.com/256/2991/2991548.png', link: '/test-series' },
    { id: 6, title: '9th ICSE', level: '9th', image: 'https://cdn-icons-png.flaticon.com/256/2991/2991548.png', link: '/doubt-solving' },
    { id: 7, title: '10th SSC', level: '10th', image: 'https://cdn-icons-png.flaticon.com/256/1940/1940630.png', link: '/live-classes' },
    { id: 8, title: '10th CBSE', level: '10th', image: 'https://cdn-icons-png.flaticon.com/256/1940/1940630.png', link: '/study-material' },
    { id: 9, title: '10th ICSE', level: '10th', image: 'https://cdn-icons-png.flaticon.com/256/1940/1940630.png', link: '/mentorship' },
  ]

  const coursesGroup1 = courses.slice(0, 3)
  const coursesGroup2 = courses.slice(3, 6)
  const coursesGroup3 = courses.slice(6, 9)

  return (
    <div className="bg-gray-100 flex items-center" id='courses-section'>
      <div className="container mx-auto px-4 py-4 sm:py-8 md:py-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">{props.title}</h2>
        {[coursesGroup1, coursesGroup2, coursesGroup3].map((group, groupIndex) => (
          <div key={groupIndex} className="mb-8 overflow-x-auto">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-800">{group[0].level} Standard - SSC, CBSE, and ICSE</h3>
            <div className="flex gap-6 min-w-max pb-8 px-8">
              {group.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8] flex-shrink-0 w-80 sm:w-64 md:w-auto">
                  <div className="relative h-40 overflow-hidden">
                    <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-105" />
                    <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">Comprehensive preparation course for {course.level} students.</p>
                    <Link href={course.link} passHref>
                      <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-2 px-4 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm">
                        <span className="group-hover:hidden">Explore Course</span>
                        <span className="hidden group-hover:inline-block">Enroll Now →</span>
                      </button>
                    </Link>
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