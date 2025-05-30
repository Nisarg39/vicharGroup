import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const NeetHero = () => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: '/course-photo/neetIcon.jpeg', link: '/vichar-education/buy-course/neetcourse/11' },
    { id: 2, title: '12th Standard', level: '12th', image: '/course-photo/neetIcon.jpeg', link: '/vichar-education/buy-course/neetcourse/12' },
    { id: 3, title: '11th + 12th Integrated', level: '11th & 12th', image: '/course-photo/neetIcon.jpeg', link: '/vichar-education/buy-course/neetcourse/integrated' },
  ]

  return (
    <section className="w-full min-h-screen flex items-center bg-gradient-to-b from-white to-gray-200 pt-24 md:pt-20 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 md:mb-8 text-center text-gray-800 tracking-tight">NEET Preparation Course</h1>
        <div className="flex flex-wrap justify-center gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 border-b-4 border-b-[#106fb8] w-[85%] sm:w-[calc(15%-1.25rem)] lg:w-[calc(26.666%-1.5rem)] relative hover:shadow-2xl hover:rotate-1">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 hover:scale-110" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-2 sm:px-3 py-1 rounded-bl-lg text-xs sm:text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-4 sm:p-5 md:p-6 relative">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-800 hover:text-[#106fb8] transition-colors duration-300 text-center">{course.title}</h3>
                <p className="text-gray-600 mb-5">Comprehensive JEE preparation course for {course.level} students.</p>
                  <Link href={course.link} className="block w-full">
                    <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm sm:text-base relative overflow-hidden">
                      <span className="flex items-center justify-center gap-2">Enroll Now →</span>
                    </button>
                  </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NeetHero