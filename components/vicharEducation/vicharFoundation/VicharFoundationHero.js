import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const VicharFoundationHero = () => {
  const slides = [
    { src: '/course-photo/vicharFoundation-1.jpeg', alt: 'Vichar Foundation' },
    { src: '/course-photo/vicharFoundation-2.jpeg', alt: 'Vichar Foundation' },
  ]

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e) => {
    touchStart = e.touches[0].clientX;
  }

  const handleTouchMove = (e) => {
    touchMove = e.touches[0].clientX;
  }

  const handleTouchEnd = () => {
    if (touchStart - touchMove > 75) {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    if (touchMove - touchStart > 75) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }
  }

  return (
    <section className="w-full min-h-screen flex items-center bg-gradient-to-b from-white to-gray-200 pt-12 md:pt-20 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:gap-8 items-center">
          <div className="order-2 lg:order-1 lg:w-1/3 mt-8 lg:mt-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 lg:mb-8 animate-fade-in drop-shadow-[3px_3px_rgba(0,0,0,0.15)]">
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#e96030] to-[#ff8a65]" : "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]"} text-transparent bg-clip-text hover:scale-110 transition-transform duration-300`}>VICHAR</span>
              <br />
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]" : "bg-gradient-to-r from-[#e96030] to-[#ff8a65]"} text-transparent bg-clip-text hover:scale-110 transition-transform duration-300`}>FOUNDATION</span>
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
                    alt={slide.alt}
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

export default VicharFoundationHero;