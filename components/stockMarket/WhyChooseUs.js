import React from 'react'

export default function WhyChooseUs() {
    const domains = [
      { title: 'Expert Mentorship', description: 'Learn from seasoned investors and market analysts who bring real-world experience into the classroom.', image: 'https://cdn-icons-gif.flaticon.com/12146/12146114.gif' },
      { title: 'Customized Learning Paths', description: 'We offer flexible learning options suitable for students, working professionals, and individuals from non-finance backgrounds.', image: 'https://cdn-icons-gif.flaticon.com/14183/14183485.gif' },
      { title: 'Comprehensive Resources', description: 'Access exclusive study materials, market analysis tools, and ongoing support to ensure continuous learning.', image: 'https://cdn-icons-gif.flaticon.com/12035/12035079.gif' },
      { title: 'Community of Investors', description: 'Join a network of like-minded learners, participate in discussions, and stay updated on the latest market trends.', image: 'https://cdn-icons-gif.flaticon.com/18264/18264454.gif' },
    ]

    return (
      <div className="py-8 sm:pt-12 md:pt-16 px-4 sm:px-6 md:px-8 bg-black">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-white leading-tight">Why Choose Us ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {domains.map((domain, index) => (
            <div key={index} className="p-6 sm:p-8 flex flex-col items-center text-center">
              <img src={domain.image} alt={domain.title} className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-white">{domain.title}</h3>
              <p className="text-sm sm:text-base text-gray-300">{domain.description}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 py-8 sm:py-10 px-4 sm:px-6 mt-12">
          <h3 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-white">Who Can Join?</h3>
          <p className="text-center text-gray-300 mb-6">Our stock market classes are open to students, professionals, retirees, and anyone eager to understand the intricacies of investing and trading.</p>
        </div>
      </div>
    )
}