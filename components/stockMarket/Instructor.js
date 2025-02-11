export default function Instructor() {
  return (
    <div className="bg-black to-gray-900 pb-20 px-4 sm:px-6 lg:px-8 ">
      <h1 className="text-5xl sm:text-4xl lg:text-5xl font-bold text-center text-white pt-6 pb-2 sm:mb-12 hover:text-gray-300 transition-colors">Meet Your Instructor</h1>
      <div className="max-w-4xl mx-auto bg-black rounded-xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="relative overflow-hidden group">
            <img
              src="/stock-market/paliwalSir.jpg"
              alt="Rupesh Subhashchandra Paliwal"
              className="relative w-64 h-36 sm:w-full sm:h-64 rounded-lg mb-4 sm:mb-6 shadow-lg object-cover transition-all duration-500 transform group-hover:scale-110 filter group-hover:brightness-105 group-hover:contrast-105 group-hover:saturate-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center">Mr. Rupesh Paliwal</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-gradient-to-br from-gray-950 to-black p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-[#ff6b6b] shadow-[0_0_10px_#ff6b6b]">
            <div className="text-[#ff6b6b] mb-4">
              <img src="https://cdn-icons-gif.flaticon.com/16664/16664314.gif" alt="Experience" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Experience</h3>
            <p className="text-gray-300 text-sm sm:text-base">17+ years of Experience in Teaching</p>
          </div>
          <div className="bg-gradient-to-br from-gray-950 to-black p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-[#4ecdc4] shadow-[0_0_10px_#4ecdc4]">
            <div className="text-[#4ecdc4] mb-4">
              <img src="https://cdn-icons-gif.flaticon.com/17490/17490034.gif" alt="Teaching" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Teaching Journey</h3>
            <p className="text-gray-300 text-sm sm:text-base">Started teaching from 2021</p>
          </div>
          <div className="bg-gradient-to-br from-gray-950 to-black p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-[#45b7d1] shadow-[0_0_10px_#45b7d1]">
            <div className="text-[#45b7d1] mb-4">
              <img src="https://cdn-icons-gif.flaticon.com/16059/16059865.gif" alt="Success" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Student Success</h3>
            <p className="text-gray-300 text-sm sm:text-base">Till date trained 50 students (one to one)</p>
          </div>
        </div>
        <div className="mt-8 sm:mt-12">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-white">Why Join Stock Market Classes?</h3>
          <ul className="space-y-4 sm:space-y-6">
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">The stock market is a non-ending source of wealth creation and income generation, but due to lack of knowledge, people fail in the stock market.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">The common problem people experience is when they buy stocks, the price comes down, and when they sell, the price goes up, leading to capital loss.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Our objective is to make this game of buyers and sellers easier to understand.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Education in right direction helps us focus on the right things.</p>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
              <span className="text-[#ff9f43] flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Take this as a game - sometimes you win, sometimes you lose, but ultimately the trophy remains with us.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}