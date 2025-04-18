"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { FaCalendarAlt, FaBolt, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { motion } from 'framer-motion'

const FoundationCourses = (props) => {
  const [showAllDetails, setShowAllDetails] = useState(false)

  const courses = [
    { id: 1, title: '8th SSC', level: '8th', description: 'Comprehensive preparation course for 8th students.', moreInfo: ['Complete SSC syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 2, title: '8th CBSE', level: '8th', description: 'Comprehensive preparation course for 8th students.', moreInfo: ['Complete CBSE syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 3, title: '8th ICSE', level: '8th', description: 'Comprehensive preparation course for 8th students.', moreInfo: ['Complete ICSE syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 4, title: '9th SSC', level: '9th', description: 'Comprehensive preparation course for 9th students.', moreInfo: ['Complete SSC syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 5, title: '9th CBSE', level: '9th', description: 'Comprehensive preparation course for 9th students.', moreInfo: ['Complete CBSE syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 6, title: '9th ICSE', level: '9th', description: 'Comprehensive preparation course for 9th students.', moreInfo: ['Complete ICSE syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 7, title: '10th SSC', level: '10th', description: 'Comprehensive preparation course for 10th students.', moreInfo: ['Complete SSC syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 8, title: '10th CBSE', level: '10th', description: 'Comprehensive preparation course for 10th students.', moreInfo: ['Complete CBSE syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
    { id: 9, title: '10th ICSE', level: '10th', description: 'Comprehensive preparation course for 10th students.', moreInfo: ['Complete ICSE syllabus coverage', 'Interactive learning sessions', 'Regular assessments', 'Doubt clearing sessions', 'Practice materials', 'Mock tests'] },
  ]

  const getBadgeColor = (level) => {
    switch(level) {
      case '8th':
        return 'bg-yellow-500'
      case '9th':
        return 'bg-green-500'
      case '10th':
        return 'bg-red-500'
      default:
        return 'bg-[#106fb8]'
    }
  }

  const toggleMoreInfo = () => {
    setShowAllDetails(prev => !prev)
  }

  return (
    <div className="bg-gradient-to-b from-gray-200 to-white min-h-screen pt-16" id='courses-section'>
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-12 relative"
        >
          <span className="relative inline-block">
            Courses
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#106fb8]"></div>
          </span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-[95%] md:w-[85%] mx-auto">
          {courses.map((course, index) => (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              key={course.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border-t-4 border-[#106fb8] flex flex-col hover:scale-105"
              whileHover={{ y: -10 }}
            >
              <div className="p-8 pb-2 flex-grow relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-black">{course.title}</h3>
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`px-4 py-2 rounded-t-full text-sm font-bold ${getBadgeColor(course.level)} text-white shadow-md`}
                  >
                    {course.level}
                  </motion.span>
                </div>
                <p className="text-gray-600 text-base mb-6">{course.description}</p>
                <div className="flex flex-col text-base mb-4">
                  <motion.button
                    onClick={toggleMoreInfo}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between bg-[#106fb8] px-4 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:bg-[#0d5a94]"
                  >
                    <div className="flex items-center">
                      <FaInfoCircle className="w-5 h-5 mr-3" />
                      <div>Course Details</div>
                    </div>
                    <motion.div
                      animate={{ rotate: showAllDetails ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </div>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: showAllDetails ? "auto" : 0, opacity: showAllDetails ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showAllDetails && (
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-lg mb-4">
                      <ul className="list-disc pl-5">
                        {course.moreInfo.map((info, index) => (
                          <motion.li
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className="text-gray-600"
                          >
                            {info}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </div>
              <div className="px-8 pb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled
                  className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 px-5 rounded-xl transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50 flex items-center justify-center text-lg cursor-not-allowed"
                >
                  <FaBolt className="w-4 h-4 mr-2" />
                  Coming Soon
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FoundationCourses