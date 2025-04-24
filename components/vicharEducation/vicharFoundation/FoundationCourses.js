"use client"
import React, { useState } from 'react'
import { FaCalendarAlt, FaBolt, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { motion } from 'framer-motion'
import Link from 'next/link'

const FoundationCourses = (props) => {
  const [showAllDetails, setShowAllDetails] = useState(false)

  const courses = [
    { id: 1, title: '8th SSC', level: '8th', description: 'Comprehensive preparation course for 8th students.', link: '/vichar-education/buy-course/ssccourse/8' },
    { id: 2, title: '8th CBSE', level: '8th', description: 'Comprehensive preparation course for 8th students.', link: '/vichar-education/buy-course/cbsecourse/8' },
    { id: 3, title: '8th ICSE', level: '8th', description: 'Comprehensive preparation course for 8th students.', link: '/vichar-education/buy-course/icsecourse/8' },
    { id: 4, title: '9th SSC', level: '9th', description: 'Comprehensive preparation course for 9th students.', link: '/vichar-education/buy-course/ssccourse/9' },
    { id: 5, title: '9th CBSE', level: '9th', description: 'Comprehensive preparation course for 9th students.', link: '/vichar-education/buy-course/cbsecourse/9' },
    { id: 6, title: '9th ICSE', level: '9th', description: 'Comprehensive preparation course for 9th students.', link: '/vichar-education/buy-course/icsecourse/9' },
    { id: 7, title: '10th SSC', level: '10th', description: 'Comprehensive preparation course for 10th students.', link: '/vichar-education/buy-course/ssccourse/10' },
    { id: 8, title: '10th CBSE', level: '10th', description: 'Comprehensive preparation course for 10th students.', link: '/vichar-education/buy-course/cbsecourse/10' },
    { id: 9, title: '10th ICSE', level: '10th', description: 'Comprehensive preparation course for 10th students.', link: '/vichar-education/buy-course/icsecourse/10' },
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
    <div className="mt-12 bg-gradient-to-b from-gray-200 to-white min-h-screen pt-16" id='courses-section'>
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-12 relative"
        >
          <span className="relative inline-block">
            Foundation Courses
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
              </div>
              <div className="px-8 pb-8">
                  <Link href={course.link} className="block w-full">
                    <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f47f33] focus:ring-opacity-50 group text-sm sm:text-base relative overflow-hidden">
                      <span className="flex items-center justify-center gap-2">Enroll Now →</span>
                    </button>
                  </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FoundationCourses