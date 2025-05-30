"use client"
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [showFullText, setShowFullText] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const toggleReadMore = () => {
    setShowFullText(!showFullText);
  };

  const handleTouchStart = () => {};
  const handleTouchMove = () => {};
  const handleTouchEnd = () => {};

  const slides = [
    { src: "/course-photo/vicharFoundation-1.jpeg", alt: "Vichar Education" },
    { src: "/course-photo/vicharFoundation-2.jpeg", alt: "Vichar Education" },
  ];

  return (
    <section className="w-full min-h-screen flex items-center bg-transparent pt-12 md:pt-20 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:gap-8 items-center">
          <div className="order-2 lg:order-1 lg:w-1/3 mt-8 lg:mt-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 lg:mb-8 animate-fade-in drop-shadow-[3px_3px_rgba(0,0,0,0.15)]">
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#e96030] to-[#ff8a65]" : "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]"} text-transparent bg-clip-text hover:scale-110 transition-transform duration-300`}>VICHAR</span>
              <br />
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]" : "bg-gradient-to-r from-[#e96030] to-[#ff8a65]"} text-transparent bg-clip-text hover:scale-110 transition-transform duration-300`}>EDUCATION</span>
            </h1>
            <p className="text-gray-600 text-lg lg:text-xl mb-4 lg:mb-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-clip-text text-transparent animate-slide-up">
              Offering comprehensive academic classes for grades 8th-10th, including expert coaching for JEE, NEET, MHT-CET, and 11th-12th boards.
            </p>
            {showFullText && (
              <p className="text-gray-600 text-lg lg:text-xl mb-4 lg:mb-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-clip-text text-transparent animate-slide-up">
                This segment targets around Competitive and Academic Learning for the students from 8th - 12th. We train students for Competitive Exams like JEE, NEET, MHT-CET and Academic Exams for 8th, 9th, 10th Boards, 11th, 12th Boards with Repeater Batches
              </p>
            )}
            <button
              onClick={toggleReadMore}
              className="mt-4 text-blue-600 hover:text-blue-800 transition-colors duration-300"
            >
              {showFullText ? 'Read Less' : 'Read More'}
            </button>
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

export default HeroSection;