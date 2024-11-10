import React from 'react'
import Image from 'next/image'

const Courses = () => {
  const courses = [
    { id: 1, title: 'Vichar Education', level: '8th - 12th', description: 'Offering comprehensive academic classes for grades 8th-10th, including expert coaching for JEE, NEET, MHT-CET, and 11th-12th boards. It emphasizes building a solid foundation and strategic preparation for competitive exams.', image: 'https://cdn-icons-png.flaticon.com/256/13558/13558061.png' },
    { id: 2, title: 'Vichar Stock Market', level: 'Finance', description: 'Dedicated to simplifying stock market trends and strategies for learners at various stages, from beginners to advanced traders.The VICHAR App complements these efforts with interactive lessons and practice tests available anytime, anywhere.', image: 'https://cdn-icons-png.flaticon.com/256/9394/9394536.png' },
  ]

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200" id='courses-section'>
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-12 md:mb-16 text-center text-gray-800 tracking-tight">Dynamic Segments</h2>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-18">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition duration-500 hover:scale-105 border border-gray-200 hover:border-[#106fb8] w-full sm:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <Image src={course.image} alt={course.title} fill style={{objectFit: 'contain'}} className="transition-transform duration-300 hover:scale-110" />
                <div className="absolute top-0 right-0 bg-[#106fb8] text-white px-2 sm:px-3 py-1 rounded-bl-lg text-xs sm:text-sm font-semibold">{course.level}</div>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800 hover:text-[#106fb8] transition-colors duration-300">{course.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed line-clamp-3">{course.description}</p>
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                </div>
                <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm sm:text-base">
                  <span className="group-hover:hidden">Learn More</span>
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