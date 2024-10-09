import React, { useState } from 'react'

export default function Faq() {
    const [activeIndex, setActiveIndex] = useState(null)

    const faqData = [
        {
            question: "What is the stock market?",
            answer: "The stock market is a platform where publicly traded companies' shares are bought and sold by investors."
        },
        {
            question: "How do I start investing in stocks?",
            answer: "To start investing in stocks, you need to open a brokerage account, research companies, and decide which stocks to buy based on your investment goals and risk tolerance."
        },
        {
            question: "What is a stock index?",
            answer: "A stock index is a measurement of a section of the stock market, used to track the performance of a group of stocks. Examples include the S&P 500 and Dow Jones Industrial Average."
        }
    ]

    const toggleAnswer = (index) => {
        setActiveIndex(activeIndex === index ? null : index)
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
                Frequently Asked Questions
            </h1>

            {faqData.map((item, index) => (
                <div key={index} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                    <div 
                        className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => toggleAnswer(index)}
                    >
                        <h2 className="text-xl font-semibold text-gray-700">
                            {item.question}
                        </h2>
                        <span className={`text-2xl transition-transform duration-200 ease-in-out transform ${activeIndex === index ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </div>

                    {activeIndex === index && (
                        <div className="p-4 text-gray-600 border-t border-gray-200">
                            {item.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}