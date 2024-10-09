import React from 'react'
import { FaChartLine, FaExchangeAlt, FaChartBar } from 'react-icons/fa'

export default function Domains() {
    const domains = [
      { title: 'Full Time Trading', description: 'Active daily trading for maximum profit potential', icon: FaChartLine },
      { title: 'Swing Trading', description: 'Holding positions for days to weeks to capture larger moves', icon: FaExchangeAlt },
      { title: 'Investment', description: 'Long-term approach focusing on fundamental analysis', icon: FaChartBar },
    ]

    return (
      <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 bg-white-100">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 leading-tight">Domains</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {domains.map((domain, index) => (
            <div key={index} className="p-6 sm:p-8 flex flex-col items-center text-center">
              <domain.icon className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-[#106FB7]" />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-black-800">{domain.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{domain.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
}