import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const NeetHero = () => {
  const courses = [
    { id: 1, title: '11th Standard', level: '11th', image: '/course-photo/neetIcon.jpeg', link: '' },
    { id: 2, title: '12th Standard', level: '12th', image: '/course-photo/neetIcon.jpeg', link: '' },
    { id: 3, title: '11th + 12th Integrated', level: '11th & 12th', image: '/course-photo/neetIcon.jpeg', link: '' },
  ]

  return (
    <section className="w-full min-h-screen flex items-center bg-gradient-to-b from-white to-gray-200 pt-24 md:pt-20 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 hidden md:block"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-12 h-12 bg-yellow-300 rounded-full opacity-50 shadow-lg" />
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-10 hidden md:block"
          animate={{
            y: [0, -20, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-16 h-16 bg-blue-400 rounded-lg opacity-40 shadow-lg" />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-1/4"
          animate={{
            scale: [1, 0.8, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-10 h-10 bg-orange-400 rounded-full opacity-45 shadow-lg" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 left-1/4"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-14 h-14 bg-gray-400 rounded-lg opacity-40 rotate-45 shadow-lg" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-10"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-8 h-8 bg-green-400 rounded-full opacity-50 shadow-lg" />
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-1/3"
          animate={{
            y: [0, 40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-12 bg-purple-400 rounded-lg opacity-40 shadow-lg" />
        </motion.div>

        <motion.div
          className="absolute top-40 right-20"
          animate={{
            scale: [1, 0.7, 1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-10 h-10 bg-pink-400 rounded-full opacity-45 shadow-lg" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-5xl font-bold text-gray-800 text-center mb-12">NEET Preparation Course</h1>
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
                <button disabled className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-2.5 px-5 rounded-xl cursor-not-allowed opacity-75 text-base">
                  Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NeetHero