export default function Instructor() {
  return (
    <div className="bg-gradient-to-b from-gray-200 to-white pb-20 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-black leading-tight pt-20">Meet Your Instructor</h1>
      <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="relative overflow-hidden group rounded-2xl">
            <img
              src="/stock-market/paliwalSir.jpg"
              alt="Rupesh Subhashchandra Paliwal"
              className="relative w-64 h-36 sm:w-full sm:h-64 rounded-2xl mb-4 sm:mb-6 shadow-xl object-cover transition-all duration-500 transform group-hover:scale-110 filter group-hover:brightness-105 group-hover:contrast-105 group-hover:saturate-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mt-4">Mr. Rupesh Paliwal</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          <div className="bg-gradient-to-r from-blue-100 via-white-50 to-blue-100 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ">
            <div className="text-[#ff6b6b] mb-4">
              <img src="https://cdn-icons-gif.flaticon.com/16664/16664314.gif" alt="Experience" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto filter drop-shadow-lg" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 text-center">Experience</h3>
            <p className="text-gray-600 text-sm sm:text-base text-center">17+ years of Experience in Teaching</p>
          </div>
          <div className="bg-gradient-to-r from-blue-100 via-white-50 to-blue-100 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ">
            <div className="text-[#4ecdc4] mb-4">
              <img src="https://cdn-icons-gif.flaticon.com/17490/17490034.gif" alt="Teaching" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto filter drop-shadow-lg" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 text-center">Teaching Journey</h3>
            <p className="text-gray-600 text-sm sm:text-base text-center">Started teaching from 2021</p>
          </div>
          <div className="bg-gradient-to-r from-blue-100 via-white-50 to-blue-100 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ">
            <div className="text-[#45b7d1] mb-4">
              <img src="https://cdn-icons-gif.flaticon.com/16059/16059865.gif" alt="Success" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto filter drop-shadow-lg" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 text-center">Student Success</h3>
            <p className="text-gray-600 text-sm sm:text-base text-center">Till date trained 50 students (one to one)</p>
          </div>
        </div>
        <div className="mt-12 sm:mt-16">
          <h3 className="text-xl sm:text-2xl font-bold mb-8 sm:mb-10 text-gray-900 text-center">Why Join Stock Market Classes?</h3>
          <ul className="space-y-6 sm:space-y-8">
            <li className="flex items-start space-x-4 sm:space-x-6 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">The stock market is a non-ending source of wealth creation and income generation, but due to lack of knowledge, people fail in the stock market.</p>
            </li>
            <li className="flex items-start space-x-4 sm:space-x-6 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">The common problem people experience is when they buy stocks, the price comes down, and when they sell, the price goes up, leading to capital loss.</p>
            </li>
            <li className="flex items-start space-x-4 sm:space-x-6 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Our objective is to make this game of buyers and sellers easier to understand.</p>
            </li>
            <li className="flex items-start space-x-4 sm:space-x-6 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Education in right direction helps us focus on the right things.</p>
            </li>
            <li className="flex items-start space-x-4 sm:space-x-6 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Take this as a game - sometimes you win, sometimes you lose, but ultimately the trophy remains with us.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}