import Image from "next/image";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const slides = [
    { src: "/vivekSirBanner.png", alt: "Education Group Logo" },
    { src: "https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png", alt: "Slide 2" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section className="w-full min-h-screen flex items-center bg-gradient-to-b from-white via-gray-100 to-gray-200 pt-12 md:pt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:gap- items-center">
          <div className="order-2 lg:order-1 lg:w-1/3 mt-8 lg:mt-0">
            <h1 className="text-7xl md:text-7xl lg:text-8xl font-extrabold mb-4 lg:mb-8">
              <span className={currentSlide === 0 ? "text-[#e96030]" : "text-[#1d77bc]"}>V</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">ICHAR</span>
              <br />
              <span className={currentSlide === 0 ? "text-[#1d77bc]" : "text-[#e96030]"}>G</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">ROUP</span>
            </h1>
            <p className="text-gray-600 text-lg lg:text-xl mb-4 lg:mb-8">
              Welcome to VICHAR GROUP, where innovation meets excellence.
            </p>
            <div className="flex items-center space-x-4 mb-4 lg:mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    currentSlide === index ? 'w-12 bg-gray-800' : 'w-6 bg-gray-300'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 lg:w-2/3 w-full">
            <div 
              className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-3xl shadow-xl overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {slides.map((slide, index) => (
                index === currentSlide && (
                  <div
                    key={index}
                    className="absolute inset-0 transform transition-transform duration-500"
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      style={{ objectFit: "cover" }}
                      priority={index === 0}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;