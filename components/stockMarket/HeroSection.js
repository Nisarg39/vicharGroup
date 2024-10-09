export default function HeroSection(){
    return(
        <div className="bg-white h-screen flex items-center">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    <div className="rounded-lg overflow-hidden shadow-xl" style={{aspectRatio: '21/9'}}>
                        <img className="w-full h-full object-cover" src="https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png" alt="Stock Market Classes" />
                    </div>
                </div>
                <div className="mt-10 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">Stock Market Classes</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Master the art of trading with our comprehensive stock market courses
                    </p>
                    <div className="mt-8">
                        <a href="#" className="inline-block bg-[#106FB7] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#106FB7] hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                            Enroll Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}