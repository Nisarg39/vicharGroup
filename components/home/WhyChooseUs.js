import React, { useState } from 'react'

function WhyChooseUs() {
    const whyChooseUsData = [
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/16675/16675766.gif" alt="Expert Faculty" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Expert Fac",
            description: "Learn from our top-notch faculty who simplify tough concepts, sharpen problem-solving skills, and boost exam confidence."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/15557/15557664.gif" alt="Innovative Teaching Methods" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Innovative Teaching",
            description: "Experience a fresh way of learning with our innovative teaching approach! "
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/15588/15588894.gif" alt="Comprehensive Curriculum" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Comprehensive Curriculum",
            description: "A well-structured, in-depth program covering all subjects from basics to advanced, building a strong foundation and confidence in students."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/16903/16903721.gif" alt="Interactive Learning" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Interactive Learning",
            description: "Active, engaging sessions that encourage participation, questions, and hands-on understanding."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/11545/11545391.gif" alt="Personalized Attention" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Personalized Attention",
            description: "This unique facility is extended to all students to clarify  doubts in one-to-one mode even outside the classrooms."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/15766/15766768.gif" alt="Flexible Learning Options" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Doubt Session",
            description: "24/7 working Doubt Support System"
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/12146/12146104.gif" alt="Proven Track Record" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Weekly Exam",
            description: "DPPs,PYQ & Weekly Exam & Exam result analysis."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/12743/12743771.gif" alt="Regular Assessments" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Study Material",
            description: "Highly systematic & complete Study Material will be provided to students."
        },
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/16664/16664316.gif" alt="Career Guidance" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Test Series",
            description: "Simulate the real exam experience with our Vichar Test App."
        }
    ]

    const [hoveredIndex, setHoveredIndex] = useState(null)

    return (
        <section className="py-20 bg-transparent">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-10 text-gray-800 leading-tight">Why Choose Us 🤔</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {whyChooseUsData.map((item, index) => (
                        <div
                            key={index}
                            className={`bg-white p-2 sm:p-4 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 hover:rotate-1 cursor-pointer ${hoveredIndex === index ? 'pb-2 sm:pb-4 ring-4 ring-blue-500 ring-opacity-50' : 'pb-0 sm:pb-4'}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div className="flex flex-col items-center sm:items-start relative">
                                <div className="flex flex-row items-center mb-4 w-full">
                                    <div className={`text-blue-500 mr-4 transform transition-all duration-300 ${hoveredIndex === index ? 'scale-110 rotate-12' : ''}`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 transform transition-all duration-300">{item.title}</h3>
                                </div>
                                <p className={`text-gray-600 text-sm md:text-base transition-all duration-300 ${hoveredIndex === index ? 'block scale-100 opacity-100' : 'hidden sm:block sm:opacity-90'}`}>
                                    {item.description}
                                </p>
                                {hoveredIndex === index && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                                        ✨
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyChooseUs
