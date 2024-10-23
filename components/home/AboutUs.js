import React from 'react'
import { FaRocket, FaEye, FaHeart } from 'react-icons/fa'

const AboutUs = () => {
  return (
    <section className="bg-gradient-to-b from-gray-100 to-white py-20" id='about-us-section'>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 leading-tight">About Us</h2>
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:border-2 hover:border-[#106fb8] hover:-translate-y-2">
          <div className="bg-white rounded-lg p-7">
            <ul className="space-y-4 text-gray-600">
              <li>
                <h4 className="text-xl font-semibold mb-2 flex items-center"><FaRocket className="mr-2 text-blue-500 text-2xl" /> Mission</h4>
                <p className="bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  To transform education by providing comprehensive, innovative learning experiences across academic subjects, competitive exams, financial literacy, and technology, empowering students and individuals to reach their full potential.
                </p>
              </li>
              <li>
                <h4 className="text-xl font-semibold mb-2 flex items-center"><FaEye className="mr-2 text-blue-500 text-2xl" /> Vision</h4>
                <p className="bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  To be a leading educational ecosystem that cultivates lifelong learners and visionaries, equipping them with the knowledge, skills & Moral Values to thrive in an ever-evolving world.
                </p>
              </li>
              <li>
                <h4 className="text-xl font-semibold mb-2 flex items-center"><FaHeart className="mr-2 text-blue-500 text-2xl" /> Values</h4>
                <p className="bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  At VICHAR GROUP, we uphold excellence, integrity, and innovation in all our endeavors. We foster inclusivity and empower learners to take charge of their educational journeys, creating a supportive environment for every individual to thrive.
                </p>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-center text-gray-600 mt-12 max-w-2xl mx-auto leading-relaxed">
          Vichar Group is an educational platform that offers online courses, workshops, and other learning resources.
          Various courses are available for you to choose from at any time with affordable prices.
        </p>
      </div>
    </section>
  )
}

export default AboutUs