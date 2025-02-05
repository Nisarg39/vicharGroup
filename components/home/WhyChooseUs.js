import React, { useState } from 'react'

function WhyChooseUs() {
    const whyChooseUsData = [
        {
            icon: <img src="https://cdn-icons-gif.flaticon.com/16675/16675766.gif" alt="Expert Faculty" className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Expert Faculty",
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
        <section className="py-4 bg-black">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-12 lg:mb-16 text-center text-white">Why Choose Us</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {whyChooseUsData.map((item, index) => (
                        <div 
                            key={index} 
                            className={`bg-gray-900 p-2 sm:p-4 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 ${hoveredIndex === index ? 'pb-2 sm:pb-4' : 'pb-0 sm:pb-4'}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="flex flex-row items-center mb-4 w-full">
                                    <div className="text-blue-500 mr-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-semibold text-white">{item.title}</h3>
                                </div>
                                <p className={`text-gray-300 text-sm md:text-base ${hoveredIndex === index ? 'block' : 'hidden sm:block'}`}>
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