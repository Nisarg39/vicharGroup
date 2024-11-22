import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const NeetTest = (props) => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: 'https://cdn-icons-png.flaticon.com/256/13558/13558061.png', link: '/vichar-education' },
    { id: 2, title: '12th Standard', level: '12th', image: 'https://cdn-icons-png.flaticon.com/256/9394/9394536.png', link: '/vichar-stock-market' },
    { id: 3, title: '11th + 12th Integrated', level: '11th & 12th', image: 'https://cdn-icons-png.flaticon.com/256/1005/1005141.png', link: '/vichar-coding' },
  ]

  return (
    <div className="bg-gradient-to-b pt-8 sm:pt-12 flex items-center" id='courses-section'>
      <div className="container mx-auto px-4 py-8 sm:py-16 md:py-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">{props.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-gray-200 hover:border-[#106fb8]">
              <div className="relative h-48 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-6">Comprehensive JEE preparation course for {course.level} students.</p>
                <Link href={course.link} passHref>
                  <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-base">
                    <span className="group-hover:hidden">Enter Test</span>
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

export default NeetTest