import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MhtCetHero = (props) => {
  const courses = [
    { id: 1, title: 'PCM Course', level: 'PCM', image: '/cet-students/cetStudents.jpeg', link: '' },
    { id: 2, title: 'PCB Course', level: 'PCB', image: '/cet-students/cetStudents1.jpeg', link: '' },
    { id: 3, title: 'Integrated Course', level: 'PCM & PCB', image: '/cet-students/cetStudents2.jpeg', link: '' },
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
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-6">Comprehensive MHT-CET preparation course for {course.level} students.</p>
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