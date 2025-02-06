  "use client"
  import { motion } from 'framer-motion'
  import { useState } from 'react'

  export default function AllTestimonials() {
      const testimonials = [
          {
              text: "Joining the JEE course at Vichar Education was a game-changer for me! The classes covered everything we needed in a clear and easy-to-understand way, and the practice tests were super close to the actual JEE exam. Taking these tests weekly really helped me get used to the timing and question formats, so I felt less stressed and more prepared.Thanks to the amazing faculty for helping me to achieve my goal.",
              name: "Varad Kongari, IIT Guwahati",
              gender: "male"
          },
          {
              text: "I loved how well-structured the JEE course was at Vichar Education. The instructors broke down complex topics into simple steps, making even the toughest subjects easier to understand. The regular practice tests were a great boost to my confidence! After each test, I got a detailed report that showed where I was doing well and what I needed to improve. This feedback was so helpful because I could see exactly where to focus my energy.",
              name: "Vidhisha Bhakat IIT Kharagpur",
              gender: "female"
          },
          {
              text: "Vichar Education's JEE course went beyond just teaching content. The practice tests and time management tips made a huge difference in my preparation. I now know where to focus my time and feel well-prepared for the exam! Thanks to the amazing faculty and well-designed tests, I feel ready to ace JEE!",
              name: "Shrushti Bhakare NIT Nagpur",
              gender: "female"
          },
          {
              text: "Amazing experience with the Vichar Education JEE course! The Vichar App provides video lectures, DPPs, CPS, and a test series that truly set it apart from other classes. The mock tests, in-depth explanations, and constant feedback really improved my scores over time. If you're serious about JEE, this course is the best for boosting your skills and scores.",
              name: "Heeth Bhandari NIT Durgapur",
              gender: "male"
          }
      ]

      const [expandedTestimonials, setExpandedTestimonials] = useState({})

      const toggleExpand = (index) => {
          setExpandedTestimonials(prev => ({
              ...prev,
              [index]: !prev[index]
          }))
      }

      return (
          <section className="bg-black py-12 sm:py-18">
              <div className="container mx-auto px-4">
                  <h2 className="text-4xl sm:text-5xl font-bold text-center mb-8 sm:mb-12 text-white relative">
                      What Our Students Say
                  </h2>

                  <div className="overflow-x-auto">
                      <div className="flex space-x-4 sm:space-x-8 pb-4 testimonial-container">
                          {testimonials.map((testimonial, index) => (
                              <motion.div 
                                  key={index} 
                                  className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg flex-shrink-0 w-80 sm:w-96"
                                  initial={{ opacity: 0, y: 50 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5, delay: index * 0.1 }}
                              >
                                  <div className="mb-4 sm:mb-6">
                                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#1d77bc] mb-3 sm:mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                      </svg>
                                  </div>
                                  <div className="min-h-[200px]">
                                      <p className="text-gray-300 mb-4 sm:mb-6 italic text-sm sm:text-base leading-relaxed">
                                          {expandedTestimonials[index] 
                                              ? testimonial.text 
                                              : `${testimonial.text.split(' ').slice(0, 30).join(' ')}...`}
                                      </p>
                                      {testimonial.text.split(' ').length > 30 && (
                                          <button 
                                              onClick={() => toggleExpand(index)}
                                              className="text-[#1d77bc] font-semibold"
                                          >
                                              {expandedTestimonials[index] ? 'Read less' : 'Read more'}
                                          </button>
                                      )}
                                  </div>
                                  <div className="mt-6 pt-4 border-t border-gray-700">
                                      <div className="flex items-center justify-center">
                                          <div>
                                              <h4 className="font-semibold text-gray-300 text-xs sm:text-sm mr-3 sm:mr-4">{testimonial.name}</h4>
                                          </div>
                                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1d77bc] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md border-2 border-[#1d77bc]">
                                              <img 
                                                  src={testimonial.gender === 'male' ? 'https://cdn-icons-gif.flaticon.com/17905/17905222.gif' : 'https://cdn-icons-gif.flaticon.com/17905/17905242.gif'} 
                                                  alt={`${testimonial.gender} avatar`}
                                                  className="w-full h-full rounded-full"
                                              />
                                          </div>
                                      </div>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  </div>
              </div>
          </section>
      )
  }