import React from 'react'
import { FaUserTie, FaRoad, FaBook, FaUsers } from 'react-icons/fa'

export default function WhyChooseUs() {
    const domains = [
      { title: 'Expert Mentorship', description: 'Learn from seasoned investors and market analysts who bring real-world experience into the classroom.', icon: FaUserTie },
      { title: 'Customized Learning Paths', description: 'We offer flexible learning options suitable for students, working professionals, and individuals from non-finance backgrounds.', icon: FaRoad },
      { title: 'Comprehensive Resources', description: 'Access exclusive study materials, market analysis tools, and ongoing support to ensure continuous learning.', icon: FaBook },
      { title: 'Community of Investors', description: 'Join a network of like-minded learners, participate in discussions, and stay updated on the latest market trends.', icon: FaUsers },
    ]

    return (
      <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 bg-white-100">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 leading-tight">Why Choose Us ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {domains.map((domain, index) => (
            <div key={index} className="p-6 sm:p-8 flex flex-col items-center text-center">
              <domain.icon className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-[#106FB7]" />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-black-800">{domain.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{domain.description}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-100 py-8 sm:py-10 px-4 sm:px-6 mt-12">
          <h3 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-gray-800">Who Can Join?</h3>
          <p className="text-center text-gray-600 mb-6">Our stock market classes are open to students, professionals, retirees, and anyone eager to understand the intricacies of investing and trading.</p>
          <div className="text-center">
            <button className="bg-[#106FB7] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    )
}