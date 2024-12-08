"use client"
import React, { useState } from 'react'
export default function StockTestimonials() {
    const [expandedId, setExpandedId] = useState(null)
    const testimonials = [
        {
            id: 1,
            name: "Prasanna Joshi",
            content: "Rupesh Paliwal Sir has always tried to cover the doubts of the students who need more attention to understand concepts because of which I would highly prefer to join the classes"
        },
        {
            id: 2,
            name: "Abhinav Shinde",
            content: "Sir taught me to apply all the techniques that layed my foundation for my stock market career, especially how to manage risk because of which I'm profitable Today"
        },
        {
            id: 3,
            name: "Dipak Wakrani",
            content: "He is one of the fantastic group and teacher as far as capital market is concerned, share market is concerned. Class profit profit loss disciplined investment He's the fantastic person where you can join his classes for technical analysis or maybe options trading as well because he is going to transfer you the insights on capital market like anything, my dear. I have been with him since last 7 to 8 years."
        }
    ]

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id)
    }

    return (
        <section className="bg-gradient-to-b from-gray-100 to-white py-12">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl font-extrabold text-center mb-20 text-gray-800 relative">
                    What Our Students Say
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#1d77bc] mt-4"></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-gradient-to-br from-[#1d77bc]/10 to-white rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#1d77bc]/20 flex flex-col justify-between">
                            <div>
                                <p className={`text-gray-700 text-lg leading-relaxed mb-6 text-left italic ${expandedId !== testimonial.id && 'line-clamp-4'}`}>
                                    "{testimonial.content}"
                                </p>
                                {testimonial.content.length > 100 && (
                                    <button 
                                        onClick={() => toggleExpand(testimonial.id)}
                                        className="text-[#1d77bc] hover:text-[#1d77bc]/80 font-medium text-sm"
                                    >
                                        {expandedId === testimonial.id ? 'Read Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-start mt-auto">
                                <h3 className="font-bold text-xl text-gray-800">{testimonial.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}