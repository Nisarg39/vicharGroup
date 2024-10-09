import React from 'react'
import Image from 'next/image'

const Courses = () => {
  const courses = [
    { id: 1, title: 'Vichar Education', duration: '4 weeks', level: 'Beginner', description: 'Learn the fundamentals of critical thinking and reasoning.', image: 'https://cdn-icons-png.flaticon.com/256/13558/13558061.png' },
    { id: 2, title: 'Stock Market', duration: '6 weeks', level: 'Intermediate', description: 'Dive into the world of finance and learn how to invest in stocks.', image: 'https://cdn-icons-png.flaticon.com/256/9394/9394536.png' },
  ]

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200" id='courses-section'>
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-5xl font-extrabold mb-16 text-center text-gray-800 tracking-tight">Courses</h2>
        <div className="flex flex-wrap justify-center gap-12">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition duration-500 hover:scale-105 border border-gray-200 hover:border-[#106fb8] max-w-sm w-full">
              <div className="relative h-48 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-110" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">{course.description}</p>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                    <svg className="w-5 h-5 text-[#106fb8] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-gray-700 text-sm font-medium">{course.duration}</p>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group">
                  <span className="group-hover:hidden">Enroll Now</span>
                  <span className="hidden group-hover:inline-block">Start Learning →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Courses