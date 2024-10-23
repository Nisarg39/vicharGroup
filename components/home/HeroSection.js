import Image from "next/image";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { src: "/vicharlogo.png", alt: "Education Group Logo" },
    { src: "https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png", alt: "Slide 2" },
    // { src: "/slide3.jpg", alt: "Slide 3" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  return (
    <section className="bg-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between">
          <div className="w-full flex justify-center mb-8">
            <div className="relative w-full" style={{ paddingTop: "42.86%" }}>
              <div className="carousel absolute top-0 left-0 w-full h-full">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`carousel-item absolute w-full h-full transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      style={{ objectFit: "contain" }}
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full shadow-md hover:bg-opacity-100 transition duration-300"
                onClick={prevSlide}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full shadow-md hover:bg-opacity-100 transition duration-300"
                onClick={nextSlide}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full text-center mt-4">
            <div className="flex justify-center space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-blue-500 w-6" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
          </div>
          <div className="w-full text-center mt-8">
            <button
              className="bg-[#106FB7] text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
              style={{
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;