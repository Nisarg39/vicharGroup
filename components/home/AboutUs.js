import React from 'react'

const AboutUs = () => {
  return (
    <section className="bg-gradient-to-b from-gray-100 to-white py-20" id='about-us-section'>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 leading-tight">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:border-2 hover:border-[#106fb8] hover:-translate-y-2">
            <div className="bg-white rounded-lg p-7">
              <div className="flex items-center mb-6">
                <svg className="w-8 h-8 mr-3 text-[#106fb8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700">Our Morals</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Integrity in all our actions</span>
                </li>
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Respect for individuals and diversity</span>
                </li>
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Commitment to excellence</span>
                </li>
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Environmental responsibility</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:border-2 hover:border-[#106fb8] hover:-translate-y-2">
            <div className="bg-white rounded-lg p-7">
              <div className="flex items-center mb-6">
                <svg className="w-8 h-8 mr-3 text-[#106fb8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700">Our Values</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-[#106fb8] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Customer-centric approach</span>
                </li>
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-[#106fb8] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Innovation and continuous improvement</span>
                </li>
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-[#106fb8] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Teamwork and collaboration</span>
                </li>
                <li className="flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                  <svg className="w-5 h-5 mr-3 text-[#106fb8] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Transparency and accountability</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-600 mt-12 max-w-2xl mx-auto leading-relaxed">
          Vichar Group is an educational platform that offers online courses, workshops, and other learning resources.
          Various courses are available for you to choose from at any time with affordable prices.
        </p>
      </div>
    </section>
  )
}

export default AboutUs