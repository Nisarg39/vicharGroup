import React, { useState } from 'react'

function WhyChooseUs() {
    const whyChooseUsData = [
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/16675/16675766.gif" alt="Expert Faculty" className="h-12 w-12 md:h-16 md:w-16" />,
            title: "Expert Faculty",
            description: "Passionate and dedicated physics educators nurture your understanding"
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/15557/15557664.gif" alt="Innovative Teaching Methods" className="h-12 w-12 md:h-16 md:w-16" />,
            title: "Innovative Teaching Methods",
            description: "Select a modern institute with interactive classes, audio-visual aids, and technology integration for better learning."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/15588/15588894.gif" alt="Comprehensive Curriculum" className="h-12 w-12 md:h-16 md:w-16" />,
            title: "Comprehensive Curriculum",
            description: "Our Physics curriculum is comprehensive and prepares you for exams and beyond."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/16903/16903721.gif" alt="Interactive Learning" className="h-12 w-12 md:h-16 md:w-16" />,
            title: "Interactive Learning",
            description: "Our classes are interactive and engaging with hands-on, discussions, and problemsolving sessions, no more boring lectures!"
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/16059/16059865.gif" alt="Proven Track Record" className="h-12 w-12 md:h-16 md:w-16" />,
            title: "Proven Track Record",
            description: "Check the institute's history for successful outcomes as an indicator of its effectiveness."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/11545/11545391.gif" alt="Personalized Attention" className="h-12 w-12 md:h-16 md:w-16" />,
            title: "Personalized Attention",
            description: "We prioritize personal growth with small classes for individualized attention to prevent students from falling behind"
        }
    ]

    const [hoveredIndex, setHoveredIndex] = useState(null)

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-dark">Why Choose Us</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {whyChooseUsData.map((item, index) => (
                        <div 
                            key={index} 
                            className="bg-white p-6 rounded-xl shadow-lg transform transition duration-500 hover:scale-105"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="flex flex-col items-start sm:items-center">
                                <div className="flex items-center mb-4 w-full">
                                    <div className="text-blue-500 mr-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold">{item.title}</h3>
                                </div>
                                <p className={`text-gray-600 text-sm md:text-base ${hoveredIndex === index ? 'block' : 'hidden sm:block'}`}>
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyChooseUs