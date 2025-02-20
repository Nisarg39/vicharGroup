import { FaChartLine, FaBriefcase, FaChartBar, FaSearch, FaFolderOpen, FaGamepad } from 'react-icons/fa'
import { useState } from 'react'

export default function Whatyoulearn(){
    const [hoveredIndex, setHoveredIndex] = useState(null)

    const learningPoints = [
        { icon: FaChartLine, title: 'Basics of Stock Market', text: 'Understand the fundamentals, key terms, and mechanics of how the stock market operates.' },
        { icon: FaBriefcase, title: 'Investment Strategies', text: 'Learn about different investment approaches, risk management, and strategies tailored to meet your financial goals.' },
        { icon: FaChartBar, title: 'Technical Analysis', text: 'Dive into the art of reading prices, charts, patterns, and indicators to make informed trading decisions.' },
        { icon: FaSearch, title: 'Fundamental Analysis', text: 'Develop the ability to evaluate a company\'s financial health, assess stock value, and understand how economic factors impact the market.' },
        { icon: FaFolderOpen, title: 'Educational Resources', text: 'Access comprehensive learning materials, video tutorials, and expert-led sessions to enhance your stock market knowledge.' },
        { icon: FaGamepad, title: 'Real-World Simulations', text: 'Engage in live market simulations and hands-on trading exercises to apply what you learn in a practical setting.' }
    ]

    return(
        <section className="py-12 bg-gradient-to-b">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold mb-8 text-center text-gray-900">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                    onMouseEnter={() => setHoveredIndex(true)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {learningPoints.map((point, index) => (
                        <div 
                            key={index} 
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                        >
                            <div className="bg-[#106FB7] text-white p-4 flex items-center">
                                <point.icon className="text-3xl mr-3" />
                                <h3 className="text-xl font-semibold">{point.title}</h3>
                            </div>
                            {hoveredIndex && (
                                <div className="p-6">
                                    <p className="text-gray-600">{point.text}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}