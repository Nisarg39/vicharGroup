import Image from "next/image";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { src: "/vivekSirBanner.png", alt: "Education Group Logo" },
    { src: "https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png", alt: "Slide 2" },
    // { src: "/slide3.jpg", alt: "Slide 3" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 pb-10 bg-black">
      <div 
        className="absolute inset-0 z-0 bg-black"
      />
      <div className="w-full relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full px-4 lg:px-0 lg:w-3/4 mx-auto">
            <div className="relative w-full aspect-video">
              <div className="carousel absolute top-0 left-0 w-full h-full">
                {slides.map((slide, index) => (
                  index === currentSlide && (
                    <div
                      key={index}
                      className="carousel-item absolute w-full h-full flex items-center justify-center"
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        style={{ objectFit: "contain" }}
                        priority={index === 0}
                        className="transition-opacity duration-500"
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-20 md:bottom-4 lg:bottom-4 left-1/2 transform -translate-x-1/2 animate-pulse bg-gray-400 rounded-full p-2">
        <svg 
          className="w-6 h-6 text-black"
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M12 5v14m0 0l-6-6m6 6l6-6"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;