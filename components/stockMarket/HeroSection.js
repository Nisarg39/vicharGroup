export default function HeroSection(){
    return(
        <div className="bg-white min-h-screen flex items-center pt-16 lg:pt-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    <div className="rounded-lg overflow-hidden shadow-xl" style={{aspectRatio: '21/9'}}>
                        <img className="w-full h-full object-cover" src="https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png" alt="Stock Market Classes" width="640" height="274" />
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
                        <span className="block">Vichar Stock Market</span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Unlock the mysteries of the stock market with Vichar stock market classes, tailored for both beginners and those looking to deepen their understanding of investments and trading. Our courses are designed to equip you with the essential knowledge and practical skills required to confidently navigate the stock market.
                    </p>
                </div>
            </div>
        </div>
    )
}