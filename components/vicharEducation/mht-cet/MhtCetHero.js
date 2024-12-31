import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MhtCetHero = (props) => {
  const courses = [
    { id: 1, title: 'PCM + PCB Course', level: '11th', image: '/course-photo/cetIcon.jpeg', link: '' },
    { id: 2, title: 'PCM + PCB Course', level: '12th', image: '/course-photo/cetIcon.jpeg', link: '' },
    { id: 3, title: 'PCM + PCB Course', level: '11th + 12th', image: '/course-photo/cetIcon.jpeg', link: '' },
  ]

  return (
    <div className="bg-gradient-to-b flex items-center" id='courses-section'>
      <div className="container mx-auto px-4 py-8 sm:py-16 md:py-12">
        <div className="flex flex-wrap justify-center gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8] max-w-xs">
              <div className="relative w-full pt-[90%] overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-3.5">
                <h3 className="text-xl font-bold mb-2.5 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-3.5 text-base">Comprehensive MHT-CET preparation course for {course.level} students.</p>
                <Link href={course.link} passHref>
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base">
                    <span className="group-hover:hidden">Enroll Now ⚡</span>
                    <span className="hidden group-hover:inline-block">Enroll Now ⚡ →</span>
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

export default MhtCetHero