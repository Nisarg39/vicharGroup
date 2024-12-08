export default function Instructor() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 pb-20 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-8 sm:mb-12 hover:text-gray-700 transition-colors pt-8">Meet Your Instructor</h1>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="relative">
            <img
              src="/instructor-avatar.jpg"
              alt="Rupesh Subhashchandra Paliwal"
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-4 sm:mb-6 border-4 border-[#1d77bc] transition-all duration-300"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-dark text-center">Rupesh Subhashchandra Paliwal</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl hover:border-2 hover:border-[#1d77bc] transform hover:-translate-y-1 transition-all duration-300">
            <div className="text-[#1d77bc] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Experience</h3>
            <p className="text-gray-600 text-sm sm:text-base">Working in stock market since 2007</p>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl hover:border-2 hover:border-[#1d77bc] transform hover:-translate-y-1 transition-all duration-300">
            <div className="text-[#1d77bc] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Teaching Journey</h3>
            <p className="text-gray-600 text-sm sm:text-base">Started teaching from 2021</p>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl hover:border-2 hover:border-[#1d77bc] transform hover:-translate-y-1 transition-all duration-300">
            <div className="text-[#1d77bc] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Student Success</h3>
            <p className="text-gray-600 text-sm sm:text-base">Till date trained 50 students (one to one)</p>
          </div>
        </div>
        <div className="mt-8 sm:mt-12">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Why Join Stock Market Classes?</h3>
          <ul className="space-y-4 sm:space-y-6">
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#1d77bc] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">The stock market is a non-ending source of wealth creation and income generation, but due to lack of knowledge, people fail in the stock market.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#1d77bc] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">The common problem people experience is when they buy stocks, they come down, and when they sell, they go up, leading to capital loss.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#1d77bc] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">Our objective is to make this game of buyers and sellers easier to understand.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#1d77bc] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">Education helps us focus on the right things.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#1d77bc] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">Take this as a game - sometimes you win, sometimes you lose, but ultimately the trophy remains with us.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}