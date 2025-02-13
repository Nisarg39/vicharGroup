  "use client"
  import { motion } from 'framer-motion'
  import { useState } from 'react'

  export default function FoundationTestimonials() {
      const testimonials = [
          {
              text: "Vichar Education is an excellent institution, vichar education helped me a lot in my academics. The teachers are very good and understanding. I have improved a lot in my studies since, I have joined Vichar, I enjoyed the time I spent in Vichar Education.",
              name: "Ishan Dandekar Class 9 CBSE",
              gender: "male"
          },
          {
              text: "My name is Adiraj Sarawade. I have joined this institute for class 10. The Vichar Education has best faculties and I have improved a lot in my studies. Raman Sir teaches very properly & solves all my doubts. Anushree Mam is very friendly. I have improved my math problem solving skills. Vichar Education is celebrating festivals together in the class.",
              name: "Adiraj Sarawade Class 10th",
              gender: "male"
          },
          {
              text: "My name is Smit studying in 10 th CBSE, in city international school. Since, I joined Vichar Education. I have seen a lot of improvement in myself. It is a good class & have good faculties who always help us & support us. I have joined for four subject they are Maths, Science, SST and English & have good teaching skills.",
              name: "Smit Laddha 10th CBSE",
              gender: "male"
          },
          {
              text: "It has been more than a year in which are education and I have been improving more and more and more in my academics which are education has great environment it has one to one teaching with the help of smart board where it's often used to understand that concept more dip the teacher and methods of which are education are just so good fun loving Bible and the best at teaching",
              name: "Bhavika desarda 10th CBSE",
              gender: "female"
          },
          {
              text: "Vichar are is a place where there is a friendly environment. There is healthy competition between the students which helps them improve academically .The teachers help improve our answers by making us write the answer and cross checking it and telling us where we should improve .Anushree mam's teaching style is interactive and makes learning fun and enjoyable. Her way to explain things is really interesting as she explains with real life examples.  Raman sir appreciates and motivates us to better in academics and keeps the mood jolly while teaching.",
              name: "Ishita gogavale 10th CBSE board",
              gender: "female"
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
        <section className="bg-gradient-to-b from-gray-200 to-white py-6 sm:py-10">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900 relative">
                    What Our Students Say
                </h2>

                <div className="overflow-x-auto">
                    <div className="flex space-x-4 sm:space-x-8 pb-4 testimonial-container">
                        {testimonials.map((testimonial, index) => (
                            <motion.div 
                                key={index} 
                                className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-lg flex-shrink-0 w-80 sm:w-96"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="mb-3 sm:mb-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#1d77bc] mb-2 sm:mb-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                </div>
                                <div className="min-h-[150px]">
                                    <p className="text-gray-700 mb-3 sm:mb-4 italic text-sm sm:text-base leading-relaxed">
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
                                <div className="mt-4 pt-3 border-t border-gray-300">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <h4 className="font-semibold text-gray-700 text-xs sm:text-sm mr-3 sm:mr-4">{testimonial.name}</h4>
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