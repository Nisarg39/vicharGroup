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
    <section className="pt-8 bg-white" id='about-us-section'>
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:border-2 hover:border-[#106fb8] hover:-translate-y-2">
          <div className="bg-white rounded-lg p-2 sm:p-5 w-full sm:w-auto">
            <ul className="space-y-4 text-gray-700">
              {content.map((item, index) => (
                <li key={index}>
                  <h4 className="text-xl font-semibold mb-2 flex items-center text-gray-900">
                    <item.icon className="mr-2 text-blue-500 text-2xl" /> {item.title}
                  </h4>
                  <p className="bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50">
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
      </div>
    </section>
  )
}

export default AboutUs