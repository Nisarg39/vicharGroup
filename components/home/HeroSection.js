import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const slides = [
    { src: "/vivekSirBanner.png", alt: "Director & Founder Of Vichar Group: ER. Vivek Gupta" },
    { src: "https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png", alt: "Stock Market" },
    { src: "/testSeriesLanding.png", alt: "Test Series" },
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
    <section className="w-full min-h-screen flex items-center bg-transparent pt-12 md:pt-20 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[2px]">
        <motion.div
          className="absolute top-20 left-10 hidden md:block"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-12 h-12 bg-yellow-300 rounded-full opacity-50 shadow-lg backdrop-blur-sm border-2 border-yellow-200 hover:shadow-xl hover:opacity-60 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-10 hidden md:block"
          animate={{
            y: [0, -20, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-16 h-16 bg-blue-400 rounded-lg opacity-40 shadow-xl backdrop-blur-sm border-2 border-blue-300 transform rotate-3 hover:rotate-6 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-1/4"
          animate={{
            scale: [1, 0.8, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-10 h-10 bg-orange-400 rounded-full opacity-45 shadow-xl backdrop-blur-sm border-2 border-orange-300 hover:shadow-2xl hover:opacity-55 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 left-1/4"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-14 h-14 bg-gray-400 rounded-lg opacity-40 rotate-45 shadow-xl backdrop-blur-sm border-2 border-gray-300 hover:rotate-[50deg] transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-10"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-8 h-8 bg-green-400 rounded-full opacity-50 shadow-xl backdrop-blur-sm border-2 border-green-300 hover:scale-110 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-1/3"
          animate={{
            y: [0, 40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-12 bg-purple-400 rounded-lg opacity-40 shadow-xl backdrop-blur-sm border-2 border-purple-300 transform -rotate-6 hover:-rotate-12 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute top-40 right-20"
          animate={{
            scale: [1, 0.7, 1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-10 h-10 bg-pink-400 rounded-full opacity-45 shadow-xl backdrop-blur-sm border-2 border-pink-300 hover:shadow-2xl hover:opacity-55 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute top-1/4 left-1/2"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 270, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-10 h-10 bg-teal-400 rounded-full opacity-40 shadow-xl backdrop-blur-sm border-2 border-teal-300 hover:scale-110 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-20"
          animate={{
            y: [0, 30, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-12 bg-indigo-400 rounded-lg opacity-35 shadow-xl backdrop-blur-sm border-2 border-indigo-300 transform rotate-12 hover:rotate-[15deg] transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute top-32 left-1/3"
          animate={{
            rotate: [0, -180, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-8 h-8 bg-amber-400 rounded-full opacity-45 shadow-xl backdrop-blur-sm border-2 border-amber-300 hover:shadow-2xl hover:opacity-55 transition-all duration-300" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/2 right-20"
          animate={{
            x: [0, -25, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-14 h-14 bg-lime-400 rounded-lg opacity-40 rotate-45 shadow-xl backdrop-blur-sm border-2 border-lime-300 hover:rotate-[50deg] transition-all duration-300" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:gap-8 items-center">
          <div className="order-2 lg:order-1 lg:w-1/3 mt-8 lg:mt-0">
            <h1 className="text-7xl md:text-7xl lg:text-8xl font-extrabold mb-4 lg:mb-8 animate-fade-in drop-shadow-[3px_3px_rgba(0,0,0,0.15)]">
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#e96030] to-[#ff8a65]" : "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]"} text-transparent bg-clip-text hover:scale-110 transition-transform duration-300`}>V</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 hover:from-gray-800 hover:to-black transition-colors duration-300 hover:scale-105">ICHAR</span>
              <br />
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]" : "bg-gradient-to-r from-[#e96030] to-[#ff8a65]"} text-transparent bg-clip-text hover:scale-110 transition-transform duration-300`}>G</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 hover:from-gray-800 hover:to-black transition-colors duration-300 hover:scale-105">ROUP</span>
            </h1>
            <p className="text-gray-600 text-lg lg:text-xl mb-4 lg:mb-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-clip-text text-transparent animate-slide-up drop-shadow-md font-medium">
              Welcome to VICHAR GROUP, where innovation meets excellence.
            </p>
            <div className="flex items-center space-x-4 mb-4 lg:mb-8 animate-bounce-slow">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-4 transition-all duration-300 rounded-full border-4 border-black hover:scale-115 ${
                    currentSlide === index ? 'w-16 bg-yellow-300 translate-y-1 translate-x-1 scale-110 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'w-8 bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  } hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 lg:w-2/3 w-full">
            <div 
              className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-3xl border-4 border-black bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 overflow-hidden transform hover:scale-[1.02]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transform transition-all duration-500 ${
                    index === currentSlide 
                      ? 'translate-x-0 opacity-100 scale-100' 
                      : index < currentSlide 
                        ? '-translate-x-full opacity-0 scale-95' 
                        : 'translate-x-full opacity-0 scale-95'
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 66vw"
                    priority={true}
                    quality={95}
                    style={{ objectFit: "contain" }}
                    className="hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;