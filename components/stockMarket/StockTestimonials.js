"use client"
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function StockTestimonials() {
    const testimonials = [
        {
            text: "Rupesh Paliwal Sir has always tried to cover the doubts of the students who need more attention to understand concepts because of which I would highly prefer to join the classes",
            name: "Prasanna Joshi",
            gender: "male"
        },
        {
            text: "Sir taught me to apply all the techniques that layed my foundation for my stock market career, especially how to manage risk because of which I'm profitable Today",
            name: "Abhinav Shinde",
            gender: "male"
        },
        {
            text: "He is one of the fantastic group and teacher as far as capital market is concerned, share market is concerned. Class profit profit loss disciplined investment He's the fantastic person where you can join his classes for technical analysis or maybe options trading as well because he is going to transfer you the insights on capital market like anything, my dear. I have been with him since last 7 to 8 years.",
            name: "Dipak Wakrani",
            gender: "male"
        },
    ]

  

    const [expandedTestimonials, setExpandedTestimonials] = useState({})

    const toggleExpand = (index) => {
        setExpandedTestimonials(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    return (
        <section className="bg-white py-4 sm:py-10">
            <div className="container mx-auto px-4">
                <h2 className="text-5xl sm:text-5xl font-bold text-center mb-8 sm:mb-12 text-black relative">
                    What Our Students Say
                </h2>

                <div className="overflow-x-auto">
                    <div className="flex space-x-4 sm:space-x-8 pb-4 testimonial-container">
                        {testimonials.map((testimonial, index) => (
                            <motion.div 
                                key={index} 
                                className="bg-gray-200 p-6 sm:p-8 rounded-lg shadow-lg flex-shrink-0 w-80 sm:w-96"
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
                                    <p className="text-gray-700 mb-4 sm:mb-6 italic text-sm sm:text-base leading-relaxed">
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
                                <div className="pt-4 border-t border-gray-300">
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