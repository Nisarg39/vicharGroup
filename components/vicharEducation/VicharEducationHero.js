"use client"
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [showFullText, setShowFullText] = React.useState(false);

  const toggleReadMore = () => {
    setShowFullText(!showFullText);
  };

  const handleTouchStart = () => {};
  const handleTouchMove = () => {};
  const handleTouchEnd = () => {};

  const slides = [
    { src: "/vicharlogo.png", alt: "Vichar Education" },
  ];

  return (
    <section className="w-full min-h-screen flex items-center bg-transparent pt-12 md:pt-20 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:gap-8 items-center">
          <div className="order-2 lg:order-1 lg:w-1/3 mt-8 lg:mt-0">
            <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold mb-4 lg:mb-8 animate-fade-in">
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#e96030] to-[#ff8a65]" : "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]"} text-transparent bg-clip-text hover:scale-105 transition-transform duration-300`}>V</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 hover:from-gray-800 hover:to-black transition-colors duration-300">ICHAR</span>
              <br />
              <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]" : "bg-gradient-to-r from-[#e96030] to-[#ff8a65]"} text-transparent bg-clip-text hover:scale-105 transition-transform duration-300`}>E</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 hover:from-gray-800 hover:to-black transition-colors duration-300">DUCATION</span>
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
              className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden transform transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transform transition-transform duration-500 ${
                    index === currentSlide
                      ? 'translate-x-0 opacity-100'
                      : index < currentSlide
                        ? '-translate-x-full opacity-0'
                        : 'translate-x-full opacity-0'
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    style={{ objectFit: "cover" }}
                    priority={index === 0}
                    className="hover:scale-105 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-2xl font-bold tracking-wider">{slide.alt}</h3>
                  </div>
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