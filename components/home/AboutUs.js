import React, { useState } from 'react'
import { FaRocket, FaEye, FaHeart } from 'react-icons/fa'

const AboutUs = () => {
  const [expandedItem, setExpandedItem] = useState(null)

  const toggleExpand = (index) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  const content = [
    {
      icon: FaRocket,
      title: "Mission",
      text: "At Vichar Group, we are dedicated to providing high-quality, comprehensive coaching for competitive exams like NEET, JEE, MHT-CET, and Stock Market studies. We prioritize building a strong academic foundation starting from classes 8, 9, and 10, using innovative teaching methods and personalized support to help each student achieve their highest potential."
    },
    {
      icon: FaEye,
      title: "Vision",
      text: "At Vichar Group, we're committed to unlocking each student's potential in competitive exams like NEET, JEE, MHT-CET, and the Stock Market. Through expert guidance and a strong foundation starting from classes 8, 9, and 10, we aim to build confident, skilled, and adaptable learners. Our goal is not only academic success but also to nurture well-rounded individuals with a passion for learning, ready to thrive in their careers and make a positive impact on society."
    },
    {
      icon: FaHeart,
      title: "Values",
      text: "At VICHAR GROUP, we uphold excellence, integrity, and innovation in all our endeavors. We foster inclusivity and empower learners to take charge of their educational journeys, creating a supportive environment for every individual to thrive."
    }
  ]

  return (
    <section className="bg-gradient-to-b from-gray-100 to-white py-20 pt-28" id='about-us-section'>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 leading-tight">About Us</h2>
        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:border-2 hover:border-[#106fb8] hover:-translate-y-2">
          <div className="bg-white rounded-lg p-2 sm:p-5 w-full sm:w-auto">
            <ul className="space-y-4 text-gray-600">
              {content.map((item, index) => (
                <li key={index}>
                  <h4 className="text-xl font-semibold mb-2 flex items-center">
                    <item.icon className="mr-2 text-blue-500 text-2xl" /> {item.title}
                  </h4>
                  <p className="bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                    {item.text.length > 150 ? (
                      <>
                        <span className="lg:hidden">
                          {expandedItem === index ? item.text : `${item.text.slice(0, 150)}...`}
                          <button
                            onClick={() => toggleExpand(index)}
                            className="text-blue-500 hover:underline ml-1"
                          >
                            {expandedItem === index ? 'Read less' : 'Read more'}
                          </button>
                        </span>
                        <span className="hidden lg:inline">{item.text}</span>
                      </>
                    ) : (
                      item.text
                    )}
                  </p>
                </li>
              ))}
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